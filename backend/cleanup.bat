@echo off
cd C:\Users\USER\Desktop\Smart-Campus\backend

echo Starting cleanup...
echo.

if exist Dockerfile del Dockerfile && echo Removed: Dockerfile
if exist docker-compose.yml del docker-compose.yml && echo Removed: docker-compose.yml
if exist compose-up.ps1 del compose-up.ps1 && echo Removed: compose-up.ps1
if exist github-workflow.yml del github-workflow.yml && echo Removed: github-workflow.yml
if exist mvnw del mvnw && echo Removed: mvnw
if exist mvnw.cmd del mvnw.cmd && echo Removed: mvnw.cmd
if exist .env.example del .env.example && echo Removed: .env.example
if exist .gitattributes del .gitattributes && echo Removed: .gitattributes
if exist .mvn rmdir /s /q .mvn && echo Removed folder: .mvn
if exist target rmdir /s /q target && echo Removed folder: target

echo.
echo Cleanup complete!
echo.
echo Remaining files:
dir /b | findstr /v /i "cleanup"

del cleanup.py 2>nul
del cleanup.js 2>nul
del %~f0
