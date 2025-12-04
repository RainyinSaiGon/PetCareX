@echo off
echo ====================================
echo Starting PetCareX Application
echo ====================================

echo.
echo [1/3] Starting Docker containers...
docker-compose up -d
if errorlevel 1 (
    echo Error: Failed to start Docker containers
    pause
    exit /b 1
)
echo Docker containers started successfully!

echo.
echo [2/3] Starting Backend (NestJS)...
start "PetCareX Backend" cmd /k "cd backend && npm run start:dev"

echo.
echo [3/3] Starting Frontend (Angular)...
start "PetCareX Frontend" cmd /k "cd frontend && npm start"

echo.
echo ====================================
echo All services are starting!
echo ====================================
echo.
echo - Database: http://localhost:1435
echo - Backend: Will start in new window
echo - Frontend: Will start in new window (usually http://localhost:4200)
echo.
echo Press any key to exit this window...
pause >nul
