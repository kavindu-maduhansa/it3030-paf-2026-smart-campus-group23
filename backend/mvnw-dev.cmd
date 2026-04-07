@echo off
REM Uses run-backend.ps1: sets JAVA_HOME if needed, switches port & frontend env if 8080 is busy.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-backend.ps1" %*
