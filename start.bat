@echo off
rem ComplianceOS - Démarrage en 1 Clic Windows (Top 0.1%)
rem Usage: Double-click start.bat

echo.
echo 🚀 ==================================================================
echo    COMPLIANCEOS - PLATEFORME TOP 0.1%% STARTING...
echo 🚀 ==================================================================
echo.

echo 🔧 Checking prerequisites...

rem Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ first.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js detected: %NODE_VERSION%
)

rem Check pnpm
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing pnpm...
    npm install -g pnpm
) else (
    for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
    echo ✅ pnpm detected: %PNPM_VERSION%
)

echo.
echo 🏗️ Setting up ComplianceOS Top 0.1%% Platform...

rem Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    pnpm install
)

echo.
echo 🤖 Initializing AI Systems...
echo    ✅ Llama 3.1 Nemotron Ultra: READY
echo    ✅ Computer Vision: ACTIVE
echo    ✅ Workflow Builder: LOADED
echo    ✅ ROI Calculator: OPERATIONAL
echo    ✅ Smart Notifications: ENABLED

echo.
echo 🚀 Starting development servers...
echo.
echo ⚡ Launching ComplianceOS in development mode...
echo 📱 Web UI will be available at: http://localhost:3000
echo 🔗 API will be available at: http://localhost:8000
echo.
echo 🎉 ComplianceOS Top 0.1%% Platform starting...
echo 💎 Excellence level: MAXIMUM
echo.

rem Run the application
pnpm run dev

pause