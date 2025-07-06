@echo off
REM Email Setup Script for Candice Kids Daycare
echo ==================================================
echo Setup Email Configuration for Candice Kids
echo ==================================================
echo.

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env >nul
    echo ✅ .env file created
) else (
    echo ⚠️  .env file already exists
)

echo.
echo Email Service Configuration:
echo ==========================================
echo 1. Gmail ^(Recommended^)
echo 2. Outlook/Hotmail
echo 3. Yahoo
echo 4. Custom SMTP
echo.

set /p choice="Select email service (1-4): "

if "%choice%"=="1" (
    set SERVICE=gmail
    echo.
    echo 📧 Gmail Configuration Selected
    echo To use Gmail, you need to:
    echo 1. Enable 2-Factor Authentication on your Gmail account
    echo 2. Generate an App-Specific Password
    echo 3. Use the app password ^(not your regular password^)
    echo.
    echo Guide: https://support.google.com/accounts/answer/185833
) else if "%choice%"=="2" (
    set SERVICE=outlook
    echo 📧 Outlook/Hotmail Configuration Selected
) else if "%choice%"=="3" (
    set SERVICE=yahoo
    echo 📧 Yahoo Configuration Selected
) else if "%choice%"=="4" (
    set SERVICE=custom
    echo 📧 Custom SMTP Configuration Selected
) else (
    echo ❌ Invalid choice. Defaulting to Gmail.
    set SERVICE=gmail
)

echo.
set /p EMAIL_USER="Enter your email address: "
echo.
set /p EMAIL_PASS="Enter your email password (app password for Gmail): "

echo.
echo Updating .env file...

REM Create temporary file without email config
findstr /v "^EMAIL_" .env > .env.tmp

REM Add new email configuration
echo. >> .env.tmp
echo # Email Configuration >> .env.tmp
echo EMAIL_USER=%EMAIL_USER% >> .env.tmp
echo EMAIL_PASS=%EMAIL_PASS% >> .env.tmp
echo EMAIL_SERVICE=%SERVICE% >> .env.tmp

REM Replace original file
move .env.tmp .env >nul

echo ✅ Email configuration saved to .env file
echo.
echo ==================================================
echo Email Setup Complete!
echo ==================================================
echo.
echo Next steps:
echo 1. Restart your application
echo 2. Test email functionality at: /admin/test-email
echo 3. Create a notifikasi darurat to test automatic emails
echo.
echo Security notes:
echo - Never commit your .env file to version control
echo - Use app-specific passwords for Gmail
echo - Keep your credentials secure
echo.
pause
