@echo off
title WorkSync Launcher
echo ===================================================
echo Starting WorkSync Full-Stack Platform...
echo ===================================================

echo [1/2] Starting Spring Boot Backend (Port 8080)...
start "WorkSync Backend" cmd /k "cd /d %~dp0backend && java -Dspring.profiles.active=dev -jar target/worksync-backend-1.0.0.jar"

echo [2/2] Starting React Frontend (Port 3000)...
start "WorkSync Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo WorkSync processes launched!
echo Waiting a few seconds for services to initialize...
timeout /t 6 >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo ===================================================
echo Done! Keep the two opened terminal windows running.
echo To stop WorkSync, simply close both terminal windows.
echo ===================================================
