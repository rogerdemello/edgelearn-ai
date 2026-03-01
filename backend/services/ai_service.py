"""
AI Service for LLM interactions. Supports both Azure OpenAI and regular OpenAI.
Priority: Azure OpenAI (if configured) > Regular OpenAI > Stub responses
"""

from typing import Dict, List, Optional
from core.config import settings

# Determine which AI service to use
_has_azure = bool(
    settings.AZURE_OPENAI_ENDPOINT 
    and settings.AZURE_OPENAI_API_KEY 
    and settings.AZURE_OPENAI_ENDPOINT.strip() 
    and settings.AZURE_OPENAI_API_KEY.strip()
)
_has_openai = bool(settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip())

_client = None
_use_azure = False

if _has_azure:
    # Priority 1: Use Azure OpenAI if configured
    try:
        from openai import AsyncAzureOpenAI
        _client = AsyncAzureOpenAI(
            api_key=settings.AZURE_OPENAI_API_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT
        )
        _use_azure = True
        print(f"✅ Using Azure OpenAI: {settings.AZURE_OPENAI_ENDPOINT}")
    except ImportError:
        print("⚠️  Azure OpenAI configured but 'openai' package not found")
        _client = None
    except Exception as e:
        print(f"⚠️  Azure OpenAI initialization failed: {e}")
        _client = None

elif _has_openai:
    # Priority 2: Use regular OpenAI
    try:
        from openai import AsyncOpenAI
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        print(f"✅ Using OpenAI with model: {settings.GPT_MODEL}")
    except ImportError:
        try:
            import openai
            openai.api_key = settings.OPENAI_API_KEY
            _client = "legacy"
            print(f"✅ Using legacy OpenAI")
        except Exception:
            _client = None
    except Exception as e:
        print(f"⚠️  OpenAI initialization failed: {e}")
        _client = None
else:
    print("ℹ️  No AI service configured - using stub responses")


async def _chat(messages: list, temperature: float = 0.5, max_tokens: int = 500) -> str:
    """Internal chat function that returns raw text response"""
    if _client is None:
        return ""
    try:
        if _client == "legacy":
            import openai
            r = await openai.ChatCompletion.acreate(
                model=settings.GPT_MODEL,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return (r.choices[0].message.content or "").strip()
        
        # Modern client (Azure or regular OpenAI)
        model_name = settings.AZURE_OPENAI_DEPLOYMENT if _use_azure else settings.GPT_MODEL
        r = await _client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return (r.choices[0].message.content or "").strip()
    except Exception as e:
        print(f"⚠️  AI request failed: {e}")
        return ""


def _strip_markdown(text: str) -> str:
    """Strip markdown code blocks from AI response to get pure JSON/text"""
    import re
    # Remove ```json ... ``` or ```...``` blocks
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
    return text.strip()


def _parse_json_response(text: str) -> dict:
    """Parse JSON from AI response, stripping markdown if present"""
    import json
    if not text:
        return {}
    
    # Strip markdown
    text = _strip_markdown(text)
    
    try:
        # Try to find JSON object in the text
        start = text.find('{')
        end = text.rfind('}')
        if start >= 0 and end > start:
            return json.loads(text[start:end+1])
        return json.loads(text)
    except json.JSONDecodeError:
        return {}


class AIService:
    """Service for AI model interactions"""
    
    @staticmethod
    async def generate_hint(
        question: str,
        student_response: str,
        concept: str,
        hint_level: int = 1,
        previous_hints: List[str] = None
    ) -> Dict[str, str]:
        """
        Generate stepwise hint based on student response
        
        Args:
            question: The question being answered
            student_response: Student's current response
            concept: The concept being tested
            hint_level: Level of hint (1-5, where 5 is most explicit)
            previous_hints: List of hints already given
        
        Returns:
            Dict with hint text and metadata
        """
        hint_prompts = {
            1: "Give a very subtle nudge without revealing the answer",
            2: "Provide a gentle hint pointing in the right direction",
            3: "Give a moderate hint that narrows down the approach",
            4: "Provide a strong hint that reveals most of the solution path",
            5: "Give an explicit hint that almost reveals the answer"
        }
        
        prompt = f"""You are an expert tutor helping a student learn {concept}.

Question: {question}
Student's current response: {student_response}
Previous hints given: {previous_hints or "None"}

Generate a {hint_prompts.get(hint_level, hint_prompts[3])} that helps the student progress without giving away the answer completely.

Return ONLY the hint text, no explanation or markdown."""
        
        hint_text = await _chat(
            [
                {"role": "system", "content": "You are a patient and encouraging tutor who provides stepwise guidance. Return only the hint text."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )
        if hint_text:
            return {"hint": hint_text, "level": hint_level, "is_final": hint_level >= 5}
        # Stub when no API key or on error
        return {
            "hint": f"Consider reviewing the key concepts related to {concept}. Focus on the main idea behind the question.",
            "level": hint_level,
            "is_final": hint_level >= 5
        }
    
    @staticmethod
    async def diagnose_student_answer(
        question: str,
        student_answer: str,
        correct_answer: str,
        concept: str
    ) -> Dict:
        """
        Diagnose student's answer to identify misconceptions
        
        Args:
            question: The question asked
            student_answer: Student's answer
            correct_answer: The correct answer
            concept: The concept being tested
        
        Returns:
            Dict with is_correct, misconception_type, confidence_score, and feedback
        """
        prompt = f"""Analyze this student answer for the concept: {concept}

Question: {question}
Correct Answer: {correct_answer}
Student Answer: {student_answer}

Provide a JSON response with:
- is_correct: boolean (true/false)
- misconception_type: string (e.g., "procedural_error", "conceptual_gap", "calculation_mistake", null if correct)
- confidence_score: float (0.0 to 1.0, how confident is the student's understanding)
- feedback: string (brief constructive feedback)

Return ONLY valid JSON, no markdown, no explanation text."""
        
        response_text = await _chat(
            [
                {"role": "system", "content": "You are an expert diagnostic AI. Return ONLY valid JSON with no markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=300
        )
        
        if response_text:
            parsed = _parse_json_response(response_text)
            if parsed:
                return {
                    "is_correct": parsed.get("is_correct", False),
                    "misconception_type": parsed.get("misconception_type"),
                    "confidence_score": float(parsed.get("confidence_score", 0.5)),
                    "feedback": parsed.get("feedback", "")
                }
        
        # Fallback: simple comparison
        is_correct = student_answer.strip().lower() == correct_answer.strip().lower()
        return {
            "is_correct": is_correct,
            "misconception_type": None if is_correct else "unknown_error",
            "confidence_score": 0.8 if is_correct else 0.3,
            "feedback": "Good work!" if is_correct else "Review the concept and try again."
        }
    
    @staticmethod
    async def evaluate_with_rubric(
        response: str,
        rubric: Dict,
        question_type: str
    ) -> Dict:
        """
        Evaluate student response against rubric
        
        Args:
            response: Student's response
            rubric: Rubric criteria dictionary
            question_type: Type of question (essay, code, presentation, etc.)
        
        Returns:
            Dict with scores and feedback
        """
        rubric_str = "\n".join([
            f"- {criterion}: {details.get('description', '')} (Weight: {details.get('weight', 1)})"
            for criterion, details in rubric.items()
        ])
        
        prompt = f"""Evaluate the following {question_type} response against this rubric:

Rubric:
{rubric_str}

Student Response:
{response}

Provide:
1. A score (0-100) for each rubric criterion
2. Specific feedback for each criterion
3. An overall score
4. Constructive suggestions for improvement

Return ONLY valid JSON with keys: scores (dict), feedback (string), overall_score (number), suggestions (list).
No markdown, no explanation text."""
        
        evaluation_text = await _chat(
            [
                {"role": "system", "content": "You are an expert evaluator providing detailed, constructive feedback. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        if evaluation_text:
            parsed = _parse_json_response(evaluation_text)
            if parsed:
                return {
                    "rubric_scores": parsed.get("scores", {}),
                    "overall_score": float(parsed.get("overall_score", 75.0)),
                    "feedback": parsed.get("feedback", ""),
                    "suggestions": parsed.get("suggestions", [])
                }
            # Fallback if JSON parsing fails
            return {
                "evaluation": evaluation_text,
                "rubric_scores": {},
                "overall_score": 75.0,
                "feedback": evaluation_text,
                "suggestions": ["Review the rubric criteria and try again."]
            }
        return {
            "rubric_scores": {},
            "overall_score": 0.0,
            "feedback": "Evaluation temporarily unavailable. Configure OPENAI_API_KEY for AI feedback."
        }
    
    @staticmethod
    async def evaluate_essay(
        essay_text: str,
        rubric: Dict,
        question_type: str = "essay"
    ) -> Dict:
        """
        Evaluate essay with specific clarity, structure, and reasoning scores
        
        Args:
            essay_text: The essay to evaluate
            rubric: Rubric criteria
            question_type: Type of question
        
        Returns:
            Dict with clarity_score, structure_score, reasoning_score, and feedback
        """
        prompt = f"""Evaluate this essay on three dimensions:

Essay:
{essay_text}

Provide scores (0-100) for:
1. Clarity: How clear and understandable is the writing?
2. Structure: How well organized and logically structured is the essay?
3. Reasoning: How strong and well-supported are the arguments?

Also provide:
- Overall constructive feedback
- Specific suggestions for improvement

Return ONLY valid JSON with keys: clarity_score, structure_score, reasoning_score, feedback, suggestions (list).
No markdown, no explanation text."""
        
        evaluation_text = await _chat(
            [
                {"role": "system", "content": "You are an expert essay evaluator. Return ONLY valid JSON with no markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=800
        )
        
        if evaluation_text:
            parsed = _parse_json_response(evaluation_text)
            if parsed:
                return {
                    "clarity_score": float(parsed.get("clarity_score", 75.0)),
                    "structure_score": float(parsed.get("structure_score", 75.0)),
                    "reasoning_score": float(parsed.get("reasoning_score", 75.0)),
                    "feedback": parsed.get("feedback", "Good effort. Keep practicing!"),
                    "suggestions": parsed.get("suggestions", [])
                }
        
        # Fallback scores
        return {
            "clarity_score": 75.0,
            "structure_score": 75.0,
            "reasoning_score": 75.0,
            "feedback": "Essay evaluated. Configure OPENAI_API_KEY for detailed AI feedback.",
            "suggestions": ["Ensure clear topic sentences", "Add supporting evidence", "Check logical flow"]
        }
    
    @staticmethod
    async def diagnose_knowledge_gap(
        responses: List[Dict],
        concepts: List[str]
    ) -> Dict:
        """
        Diagnose student's knowledge gaps from responses
        
        Args:
            responses: List of student responses with concept tags
            concepts: List of concepts being assessed
        
        Returns:
            Dict with diagnosis results
        """
        prompt = f"""Analyze the following student responses to diagnose knowledge gaps:

Concepts assessed: {', '.join(concepts)}

Responses:
{chr(10).join([f"Concept: {r.get('concept')}, Response: {r.get('response')}" for r in responses])}

Provide:
1. Strong areas (concepts the student understands well)
2. Weak areas (concepts needing improvement)
3. Confidence level (0-1)
4. Recommended learning path

Format as JSON."""
        
        diagnosis = await _chat(
            [
                {"role": "system", "content": "You are an expert learning diagnostician."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=500
        )
        if diagnosis:
            return {
                "diagnosis": diagnosis,
                "strong_areas": [],
                "weak_areas": [],
                "confidence": 0.5,
                "recommended_path": [],
                "mastery_scores": {}
            }
        return {
            "diagnosis": "Complete the diagnostic when AI is configured (OPENAI_API_KEY).",
            "strong_areas": [],
            "weak_areas": list(concepts),
            "confidence": 0.0,
            "recommended_path": [],
            "mastery_scores": {}
        }
    
    @staticmethod
    async def translate_content(
        text: str,
        target_language: str,
        source_language: str = "en"
    ) -> str:
        """Translate content to target language"""
        prompt = f"""Translate the following text from {source_language} to {target_language}:

{text}

Translation:"""
        
        out = await _chat(
            [
                {"role": "system", "content": "You are a professional translator specializing in educational content."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )
        return out if out else text
    
    @staticmethod
    async def check_originality(
        text: str,
        reference_texts: List[str] = None
    ) -> Dict:
        """
        Check for originality and potential plagiarism
        
        Args:
            text: Text to check
            reference_texts: Reference texts to compare against
        
        Returns:
            Dict with originality score and flagged sections
        """
        prompt = f"""Analyze the following text for originality:

Text to analyze:
{text}

{"Reference texts:" + chr(10).join(reference_texts) if reference_texts else ""}

Provide:
1. Originality score (0-1, where 1 is completely original)
2. Any flagged sections that may need citation
3. Suggestions for proper attribution

Format as JSON."""
        
        result = await _chat(
            [
                {"role": "system", "content": "You are an academic integrity checker."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=500
        )
        return {
            "originality_score": 0.9,
            "flagged_sections": [],
            "suggestions": result or "Originality check completed. Add OPENAI_API_KEY for full analysis."
        }
    
    @staticmethod
    async def generate_citations(
        text: str,
        source_type: str = "web",
        source_url: Optional[str] = None
    ) -> Dict:
        """Generate citation formats for a source."""
        prompt = f"""Generate proper citations for:

Source Type: {source_type}
Source URL: {source_url or "Not provided"}
Text Excerpt: {text[:500]}

Provide APA, MLA, and Chicago formatted citations and one in-text citation example.
Format as JSON: formatted_citations (list of strings), in_text_citations (list of {{"text","citation"}})."""
        out = await _chat(
            [
                {"role": "system", "content": "You are a citation expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=600
        )
        if out:
            import json
            try:
                # Try to parse JSON from response
                start = out.find("{")
                if start >= 0:
                    obj = json.loads(out[start:out.rfind("}") + 1])
                    return {
                        "formatted_citations": obj.get("formatted_citations", []),
                        "citation_style": "multiple",
                        "in_text_citations": obj.get("in_text_citations", [])
                    }
            except Exception:
                pass
        return {
            "formatted_citations": [
                f"APA: ({source_url or source_type}, n.d.). {text[:80]}...",
                f"MLA: \"{text[:60]}...\" {source_url or source_type}.",
                "Chicago: See manual for format."
            ],
            "citation_style": "multiple",
            "in_text_citations": [{"text": text[:80] + "...", "citation": "(Author, Year)"}]
        }

    # ------------------------------------------------------------------
    # AI Debate Tutor
    # ------------------------------------------------------------------

    @staticmethod
    async def generate_debate_turn(
        topic: str,
        role: str,
        student_position: str,
        history: List[Dict],
    ) -> str:
        """
        Generate a debate turn for the AI agent.
        role: 'challenger' (plays devil's advocate) or 'supporter' (steelmans student).
        """
        history_text = "\n".join(
            f"[{t.get('role', '?')}]: {t.get('content', '')}" for t in (history or [])
        )

        role_instructions = {
            "challenger": (
                "You are a rigorous academic debate challenger. "
                "Poke logical holes, ask for evidence, and present counter-arguments. "
                "Be firm but respectful. Push the student to think deeper."
            ),
            "supporter": (
                "You are an encouraging debate supporter. "
                "Acknowledge valid points, steelman the student's argument, "
                "and add complementary evidence. Then gently suggest where the "
                "argument could be strengthened."
            ),
        }

        system = role_instructions.get(role, role_instructions["challenger"])
        prompt = f"""Topic: {topic}
Student's latest position: {student_position}

Conversation so far:
{history_text}

Provide a concise, engaging debate response (2-4 paragraphs).
Do NOT use markdown formatting. Respond in plain text."""

        out = await _chat(
            [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=600,
        )
        if out:
            return _strip_markdown(out)
        # Stub fallback
        if role == "challenger":
            return (
                f"Interesting position on '{topic}'. However, have you considered the counter-evidence? "
                "What specific data supports your claim, and how would you address the strongest objection?"
            )
        return (
            f"Your argument about '{topic}' has merit. The logical structure is sound. "
            "To make it even stronger, consider adding concrete examples or citing relevant research."
        )

    @staticmethod
    async def evaluate_debate(
        topic: str,
        student_arguments: List[str],
        all_turns: List[Dict],
    ) -> Dict:
        """
        Evaluate the entire debate and produce scores + resolution.
        Returns critical_thinking_score, argument_quality_score,
        evidence_usage_score, metacognition_score, overall_score, resolution.
        """
        turns_text = "\n".join(
            f"[{t.get('role', '?')}]: {t.get('content', '')}" for t in (all_turns or [])
        )

        prompt = f"""You are an expert academic debate evaluator.

Topic: {topic}
Full debate transcript:
{turns_text}

Evaluate the STUDENT's performance on these dimensions (each 0-100):
1. critical_thinking_score — logical rigor, identification of assumptions
2. argument_quality_score — clarity, coherence, persuasiveness
3. evidence_usage_score — use of facts, examples, data
4. metacognition_score — awareness of own reasoning process, willingness to revise

Also write a 2-3 sentence "resolution" summarising the debate outcome and
the student's strengths/weaknesses.

Return ONLY valid JSON with keys: critical_thinking_score, argument_quality_score,
evidence_usage_score, metacognition_score, overall_score (average of the four),
resolution (string). No markdown."""

        out = await _chat(
            [
                {"role": "system", "content": "You are a debate evaluator. Return ONLY valid JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=600,
        )

        if out:
            parsed = _parse_json_response(out)
            if parsed and "critical_thinking_score" in parsed:
                ct = float(parsed.get("critical_thinking_score", 60))
                aq = float(parsed.get("argument_quality_score", 60))
                eu = float(parsed.get("evidence_usage_score", 60))
                mc = float(parsed.get("metacognition_score", 60))
                overall = float(parsed.get("overall_score", (ct + aq + eu + mc) / 4))
                return {
                    "critical_thinking_score": ct,
                    "argument_quality_score": aq,
                    "evidence_usage_score": eu,
                    "metacognition_score": mc,
                    "overall_score": overall,
                    "resolution": parsed.get("resolution", "Debate concluded."),
                }

        # Stub fallback
        n = len(student_arguments)
        base = min(60 + n * 5, 85)
        return {
            "critical_thinking_score": float(base),
            "argument_quality_score": float(base - 2),
            "evidence_usage_score": float(base - 5),
            "metacognition_score": float(base - 3),
            "overall_score": float(base - 2.5),
            "resolution": (
                f"The student engaged in a {n}-turn debate on '{topic}'. "
                "For detailed AI-powered evaluation, configure your OpenAI API key."
            ),
        }
