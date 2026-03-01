"""
Concept Graph Intelligence — knowledge graph traversal, gap propagation,
weak-root analysis, and concept dependency scoring.
"""

from typing import Dict, List, Any, Set
from sqlalchemy.orm import Session
from models.concept import Concept
from models.mastery import MasteryLog
from models.knowledge_graph import ConceptEdge


class ConceptGraphEngine:
    """Knowledge-graph-aware intelligence."""

    # ── Build adjacency lists ───────────────────────────────
    @staticmethod
    def _build_graph(db: Session) -> Dict[int, List[Dict]]:
        """Returns {concept_id: [{target, weight, type}, ...]}"""
        edges = db.query(ConceptEdge).all()
        graph: Dict[int, List[Dict]] = {}
        for e in edges:
            graph.setdefault(e.source_concept_id, []).append({
                "target": e.target_concept_id,
                "weight": e.weight,
                "type": e.relationship_type,
            })
        return graph

    @staticmethod
    def _build_reverse_graph(db: Session) -> Dict[int, List[int]]:
        """Returns {concept_id: [prerequisite_ids]}"""
        edges = db.query(ConceptEdge).filter(
            ConceptEdge.relationship_type == "prerequisite"
        ).all()
        reverse: Dict[int, List[int]] = {}
        for e in edges:
            reverse.setdefault(e.target_concept_id, []).append(e.source_concept_id)
        return reverse

    # ── Concept dependency score ────────────────────────────
    @classmethod
    def dependency_scores(cls, db: Session) -> Dict[int, float]:
        """
        How many other concepts depend on each concept.
        High score ⇒ foundational concept.
        """
        edges = db.query(ConceptEdge).filter(
            ConceptEdge.relationship_type == "prerequisite"
        ).all()
        dep_count: Dict[int, int] = {}
        for e in edges:
            dep_count[e.source_concept_id] = dep_count.get(e.source_concept_id, 0) + 1
        if not dep_count:
            return {}
        max_deps = max(dep_count.values())
        return {cid: round(cnt / max_deps, 4) for cid, cnt in dep_count.items()}

    # ── Gap propagation detection ───────────────────────────
    @classmethod
    def detect_gap_propagation(
        cls, db: Session, user_id: int
    ) -> List[Dict[str, Any]]:
        """
        If student is weak on concept A which is prerequisite for B,
        flag B as at-risk even if B hasn't been attempted yet.
        """
        reverse = cls._build_reverse_graph(db)
        mastery_map = {
            m.concept_id: m.mastery_score
            for m in db.query(MasteryLog).filter(MasteryLog.user_id == user_id).all()
        }
        concepts = {c.id: c for c in db.query(Concept).all()}
        gaps = []

        for target_id, prereq_ids in reverse.items():
            weak_prereqs = []
            for pid in prereq_ids:
                mastery = mastery_map.get(pid, 0.0)
                if mastery < 0.5:
                    weak_prereqs.append({
                        "concept_id": pid,
                        "concept_title": concepts[pid].title if pid in concepts else str(pid),
                        "mastery": mastery,
                    })
            if weak_prereqs:
                gaps.append({
                    "at_risk_concept_id": target_id,
                    "at_risk_concept_title": concepts[target_id].title if target_id in concepts else str(target_id),
                    "current_mastery": mastery_map.get(target_id, 0.0),
                    "weak_prerequisites": weak_prereqs,
                    "risk_level": "high" if len(weak_prereqs) >= 2 else "medium",
                })
        return gaps

    # ── Weak-root analysis ──────────────────────────────────
    @classmethod
    def weak_root_analysis(
        cls, db: Session, user_id: int, concept_id: int
    ) -> Dict[str, Any]:
        """
        Given a concept the student struggles with, trace back through
        the prerequisite chain to find the weakest root cause.
        """
        reverse = cls._build_reverse_graph(db)
        mastery_map = {
            m.concept_id: m.mastery_score
            for m in db.query(MasteryLog).filter(MasteryLog.user_id == user_id).all()
        }
        concepts = {c.id: c for c in db.query(Concept).all()}

        visited: Set[int] = set()
        chain: List[Dict] = []

        def _trace(cid: int, depth: int = 0):
            if cid in visited or depth > 10:
                return
            visited.add(cid)
            mastery = mastery_map.get(cid, 0.0)
            chain.append({
                "concept_id": cid,
                "concept_title": concepts[cid].title if cid in concepts else str(cid),
                "mastery": mastery,
                "depth": depth,
            })
            for prereq_id in reverse.get(cid, []):
                _trace(prereq_id, depth + 1)

        _trace(concept_id)
        chain.sort(key=lambda c: c["mastery"])

        weakest_root = chain[0] if chain else None
        return {
            "target_concept": concepts.get(concept_id, {concept_id: concept_id}),
            "prerequisite_chain": chain,
            "weakest_root": weakest_root,
            "recommendation": (
                f"Focus on '{weakest_root['concept_title']}' first — it's the weakest foundation."
                if weakest_root and weakest_root["mastery"] < 0.5
                else "Prerequisites look solid."
            ),
        }

    # ── Full knowledge graph export ─────────────────────────
    @classmethod
    def get_full_graph(cls, db: Session, user_id: int | None = None) -> Dict[str, Any]:
        """Export the entire knowledge graph with optional user mastery overlay."""
        concepts = db.query(Concept).all()
        edges = db.query(ConceptEdge).all()
        mastery_map = {}
        if user_id:
            mastery_map = {
                m.concept_id: {"mastery": m.mastery_score, "confidence": m.confidence_score}
                for m in db.query(MasteryLog).filter(MasteryLog.user_id == user_id).all()
            }

        nodes = []
        for c in concepts:
            node = {
                "id": c.id,
                "title": c.title,
                "subject": c.subject,
                "difficulty": c.difficulty_level,
            }
            if user_id and c.id in mastery_map:
                node["mastery"] = mastery_map[c.id]["mastery"]
                node["confidence"] = mastery_map[c.id]["confidence"]
            nodes.append(node)

        edge_list = [{
            "source": e.source_concept_id,
            "target": e.target_concept_id,
            "type": e.relationship_type,
            "weight": e.weight,
        } for e in edges]

        return {"nodes": nodes, "edges": edge_list}

    # ── Seed default graph ──────────────────────────────────
    @classmethod
    def seed_default_graph(cls, db: Session):
        """Create default concept relationships if none exist."""
        if db.query(ConceptEdge).count() > 0:
            return
        concepts = {c.title: c.id for c in db.query(Concept).all()}
        prerequisite_pairs = [
            ("Variables and Types", "Functions"),
            ("Variables and Types", "Control Flow"),
            ("Functions", "Control Flow"),
            ("Algebra Basics", "Variables and Types"),
        ]
        for src, tgt in prerequisite_pairs:
            if src in concepts and tgt in concepts:
                db.add(ConceptEdge(
                    source_concept_id=concepts[src],
                    target_concept_id=concepts[tgt],
                    relationship_type="prerequisite",
                    weight=1.0,
                ))
        db.commit()
