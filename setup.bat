@echo off
echo ========================================
echo Alumni Platform Development Setup
echo ========================================
echo.

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

echo.
echo Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo Created .env file from .env.example
    echo Please update the .env file with your configuration
) else (
    echo .env file already exists
)

echo.
echo Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Error generating Prisma client
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

echo.
echo Creating frontend environment file...
if not exist .env (
    echo REACT_APP_API_URL=http://localhost:5000/api > .env
    echo REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key >> .env
    echo Created frontend .env file
    echo Please update with your actual API keys
) else (
    echo Frontend .env file already exists
)

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update backend/.env with your database and API keys
echo 2. Update frontend/.env with your API keys
echo 3. Set up your PostgreSQL database
echo 4. Run: npx prisma db push (in backend directory)
echo 5. Start development servers with: npm run dev
echo.
echo For detailed instructions, see README.md
echo.
pause
