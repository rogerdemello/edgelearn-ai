@echo off
REM Activate virtual environment and start FastAPI server
call .venv\Scripts\activate.bat
uvicorn main:app --reload
