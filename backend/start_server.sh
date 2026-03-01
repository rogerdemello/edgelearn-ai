#!/bin/bash
# Activate virtual environment and start FastAPI server
source .venv/Scripts/activate
uvicorn main:app --reload
