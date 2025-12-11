@echo off
setlocal

rem Ensure we are running from the project root (folder that contains backend and frontend)
cd /d "%~dp0"

echo ====================================
echo    Starting PetCareX Application
echo ====================================
echo.

echo [0/4] Checking Node.js and npm...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not added to PATH.
    echo Please install the LTS version from https://nodejs.org/ and then run this script again.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available even though Node.js was found.
    echo Please reinstall Node.js from https://nodejs.org/ and then run this script again.
    pause
    exit /b 1
)

for /f "tokens=1" %%v in ('node -v') do set NODE_VERSION=%%v
for /f "tokens=1" %%v in ('npm -v') do set NPM_VERSION=%%v
echo Detected Node.js %NODE_VERSION% and npm %NPM_VERSION%.

rem Extract major version number (remove 'v' and get first number)
for /f "tokens=1 delims=." %%a in ("%NODE_VERSION:~1%") do set NODE_MAJOR=%%a

rem Check if Node.js major version is odd (not LTS)
set /a IS_ODD=NODE_MAJOR %% 2
if %IS_ODD% equ 1 (
    echo.
    echo WARNING: You are using Node.js v%NODE_MAJOR%.x which is NOT an LTS version!
    echo Odd-numbered Node.js versions are not recommended for production and may cause issues.
    echo.
    echo Please install Node.js LTS version from: https://nodejs.org/
    echo Recommended versions: v20.x, v22.x, or v24.x
    echo.
    echo Press any key to continue anyway, or close this window to cancel...
    pause > nul
)
echo.

echo [1/4] Checking Backend Dependencies...
cd backend
if not exist "node_modules\" (
    echo Installing backend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Backend installation failed!
        pause
        exit /b 1
    )
    echo Installing NestJS CLI globally if not present...
    call npm list -g @nestjs/cli >nul 2>&1
    if %errorlevel% neq 0 (
        call npm install -g @nestjs/cli
    )
) else (
    echo Backend dependencies already installed.
)
cd ..

echo.
echo [2/4] Checking Frontend Dependencies...
cd frontend
if not exist "node_modules\" (
    echo Installing frontend dependencies - this may take a few minutes...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ERROR: Frontend installation failed!
        echo This is often caused by using an odd-numbered Node.js version.
        echo Please install Node.js LTS v20.x or v22.x from https://nodejs.org/
        pause
        exit /b 1
    )
    echo Installing Angular CLI globally if not present...
    call npm list -g @angular/cli >nul 2>&1
    if %errorlevel% neq 0 (
        call npm install -g @angular/cli
    )
) else (
    echo Verifying frontend dependencies...
    if not exist "node_modules\@angular-devkit\build-angular\" (
        echo Missing Angular build tools. Reinstalling dependencies...
        echo This might take a few minutes...
        rd /s /q node_modules 2>nul
        del package-lock.json 2>nul
        call npm install --legacy-peer-deps
        if %errorlevel% neq 0 (
            echo ERROR: Frontend reinstallation failed!
            echo Please install Node.js LTS v20.x or v22.x from https://nodejs.org/
            pause
            exit /b 1
        )
    ) else (
        echo Frontend dependencies already installed.
    )
)
cd ..

echo.
echo [3/4] Starting Backend (NestJS)...
cd backend
start "PetCareX Backend" cmd /k "npm run start:dev"
cd ..

echo.
echo [4/4] Starting Frontend (Angular)...
cd frontend  
start "PetCareX Frontend" cmd /k "npm start"
cd ..

echo.
echo ====================================
echo   All services are starting!
echo ====================================
echo.
echo - Backend API: http://localhost:3000
echo - Frontend App: http://localhost:4200
echo.
echo Press any key to exit this window...
pause > nul
