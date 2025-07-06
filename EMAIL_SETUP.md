# Email Notification Setup - Candice Kids Daycare

## Overview
Sistem notifikasi email otomatis untuk mengirim pemberitahuan darurat kepada orang tua ketika admin membuat notifikasi darurat untuk anak mereka.

## Features
- ✅ Automatic email sending when emergency notification is created
- ✅ Professional HTML email templates
- ✅ Support for multiple email providers (Gmail, Outlook, Yahoo, Custom SMTP)
- ✅ Error handling and fallback notifications
- ✅ Email connection testing
- ✅ Secure credential management

## Setup Instructions

### 1. Install Dependencies
```bash
npm install nodemailer
```

### 2. Configure Email Credentials

#### For Gmail (Recommended):
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App-Specific Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select app: "Mail" and device: "Other (Custom name)"
   - Use the generated 16-character password

#### For Other Providers:
- **Outlook/Hotmail**: Use regular email and password
- **Yahoo**: May require app-specific password
- **Custom SMTP**: Configure your own SMTP settings

### 3. Environment Variables
Add to your `.env` file:
```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_SERVICE=gmail
```

### 4. Quick Setup Script
Run the setup script to configure email automatically:

**Windows:**
```cmd
scripts\setup-email.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-email.sh
./scripts/setup-email.sh
```

## Testing

### 1. Test Email Connection
Visit: `http://localhost:3000/admin/test-email`

This will test if your email configuration is working correctly.

### 2. Test Emergency Notification
1. Go to Admin Panel → Notifikasi Darurat
2. Click "Tambah Notifikasi"
3. Select a child whose parent has an email address
4. Fill in the emergency description
5. Submit the form

The system will:
- Create the emergency notification
- Send an automated email to the parent
- Show success/error message

## Email Template Features

The emergency notification email includes:
- 🚨 Eye-catching emergency alert design
- 👶 Child information (name, age, birth date)
- 📋 Detailed emergency description
- 📞 Daycare contact information
- ⏰ Timestamp of the incident
- 📱 Call-to-action buttons
- 🏢 Professional branding

## File Structure
```
lib/
├── emailService.js          # Main email service class
controllers/
├── adminController.js       # Updated with email functionality
scripts/
├── setup-email.sh          # Linux/Mac setup script
├── setup-email.bat         # Windows setup script
```

## Security Best Practices

1. **Never commit credentials**: Add `.env` to `.gitignore`
2. **Use app passwords**: For Gmail, never use your main password
3. **Environment isolation**: Use different credentials for dev/prod
4. **Regular rotation**: Change email passwords periodically
5. **Access monitoring**: Monitor for unusual email activity

## Email Service Configuration

### Gmail Setup
```javascript
service: 'gmail',
auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // App-specific password
}
```

### Custom SMTP Setup
```javascript
host: 'smtp.your-provider.com',
port: 587,
secure: false, // true for 465, false for other ports
auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
}
```

## Error Handling

The system includes comprehensive error handling:
- If email fails, notification is still created
- Detailed error logging for debugging
- User-friendly error messages
- Graceful fallback behavior

## Troubleshooting

### Common Issues:

1. **Authentication Error**
   - Solution: Use app-specific password for Gmail
   - Check credentials in `.env` file

2. **Connection Timeout**
   - Solution: Check firewall/network settings
   - Verify SMTP settings

3. **Invalid Recipient**
   - Solution: Ensure parent has valid email address
   - Check email format validation

4. **Rate Limiting**
   - Solution: Check provider's sending limits
   - Implement delay between emails if needed

### Debug Logs:
```javascript
console.log('Emergency email sent successfully:', result.messageId);
console.error('Failed to send emergency notification:', error);
```

## Testing Scenarios

1. **Happy Path**: Parent with valid email receives notification
2. **Missing Email**: Parent without email, notification created without email
3. **Invalid Email**: System logs error, shows appropriate message
4. **Service Down**: Graceful failure, notification still created

## Production Considerations

1. **Email Quotas**: Monitor daily sending limits
2. **Delivery Rates**: Track email delivery success
3. **Spam Prevention**: Use proper SPF/DKIM records
4. **Backup Service**: Configure secondary email provider
5. **Monitoring**: Set up alerts for email failures

## Future Enhancements

- 📱 SMS notifications as backup
- 🔔 Push notifications for mobile app
- 📊 Email delivery tracking and analytics
- 🎨 Customizable email templates
- 🌐 Multi-language email support
- ⏰ Scheduled notification reminders

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error logs in console
3. Test email connection at `/admin/test-email`
4. Verify environment variables are correct
