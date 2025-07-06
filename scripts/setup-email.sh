#!/bin/bash

# Email Setup Script for Candice Kids Daycare
echo "=================================================="
echo "Setup Email Configuration for Candice Kids"
echo "=================================================="
echo

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "⚠️  .env file already exists"
fi

echo
echo "Email Service Configuration:"
echo "=========================================="
echo "1. Gmail (Recommended)"
echo "2. Outlook/Hotmail"
echo "3. Yahoo"
echo "4. Custom SMTP"
echo

read -p "Select email service (1-4): " choice

case $choice in
    1)
        SERVICE="gmail"
        echo
        echo "📧 Gmail Configuration Selected"
        echo "To use Gmail, you need to:"
        echo "1. Enable 2-Factor Authentication on your Gmail account"
        echo "2. Generate an App-Specific Password"
        echo "3. Use the app password (not your regular password)"
        echo
        echo "Guide: https://support.google.com/accounts/answer/185833"
        ;;
    2)
        SERVICE="outlook"
        echo "📧 Outlook/Hotmail Configuration Selected"
        ;;
    3)
        SERVICE="yahoo"
        echo "📧 Yahoo Configuration Selected"
        ;;
    4)
        SERVICE="custom"
        echo "📧 Custom SMTP Configuration Selected"
        ;;
    *)
        echo "❌ Invalid choice. Defaulting to Gmail."
        SERVICE="gmail"
        ;;
esac

echo
read -p "Enter your email address: " EMAIL_USER
read -s -p "Enter your email password (app password for Gmail): " EMAIL_PASS
echo

# Update .env file
echo
echo "Updating .env file..."

# Remove existing email config lines
sed -i '/^EMAIL_/d' .env

# Add new email configuration
{
    echo ""
    echo "# Email Configuration"
    echo "EMAIL_USER=$EMAIL_USER"
    echo "EMAIL_PASS=$EMAIL_PASS"
    echo "EMAIL_SERVICE=$SERVICE"
} >> .env

echo "✅ Email configuration saved to .env file"
echo
echo "=================================================="
echo "Email Setup Complete!"
echo "=================================================="
echo
echo "Next steps:"
echo "1. Restart your application"
echo "2. Test email functionality at: /admin/test-email"
echo "3. Create a notifikasi darurat to test automatic emails"
echo
echo "Security notes:"
echo "- Never commit your .env file to version control"
echo "- Use app-specific passwords for Gmail"
echo "- Keep your credentials secure"
echo
