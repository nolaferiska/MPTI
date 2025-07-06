const emailService = require('../lib/emailService');

// Test email functionality
async function testEmail() {
    console.log('🧪 Testing Email Service...\n');

    try {
        // Test 1: Connection test
        console.log('1. Testing email connection...');
        const connectionTest = await emailService.testConnection();
        
        if (connectionTest.success) {
            console.log('✅ Email connection successful');
        } else {
            console.log('❌ Email connection failed:', connectionTest.message);
            return;
        }

        // Test 2: Send test email
        console.log('\n2. Sending test email...');
        
        // Mock data for testing
        const mockNotifikasi = {
            id: 1,
            deskripsi: 'Anak mengalami demam ringan dan sedang beristirahat di ruang kesehatan. Suhu tubuh 37.5°C. Tim medis sedang memantau kondisi anak.',
            createdAt: new Date()
        };

        const mockAnak = {
            id: 1,
            nama: 'Ahmad Fauzi',
            tanggalLahir: new Date('2020-05-15'),
            getAge: () => 4
        };

        const mockOrangTua = {
            id: 1,
            nama: 'Ibu Siti Aminah',
            email: 'gagahnaufal31@gmail.com' // Change this to your test email
        };

        console.log('📧 Test email will be sent to:', mockOrangTua.email);
        console.log('⚠️  Make sure to change the email address above to your actual test email!');
        
        // Uncomment the line below to actually send the test email
        // const result = await emailService.sendEmergencyNotification(mockNotifikasi, mockAnak, mockOrangTua);
        
        console.log('\n📝 To send actual test email:');
        console.log('1. Update mockOrangTua.email with your test email address');
        console.log('2. Uncomment the sendEmergencyNotification line in this script');
        console.log('3. Run the script again');
        
        console.log('\n✅ Email service test completed successfully!');
        
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
        console.error('\n🔧 Troubleshooting tips:');
        console.error('1. Check your .env file has correct EMAIL_USER and EMAIL_PASS');
        console.error('2. For Gmail, make sure you use app-specific password');
        console.error('3. Verify 2FA is enabled for Gmail accounts');
        console.error('4. Check if your email provider allows less secure apps');
    }
}

// Test general email
async function testGeneralEmail() {
    console.log('\n📨 Testing general email...');
    
    try {
        const result = await emailService.sendGeneralNotification(
            'gagahnaufal31@gmail.com', // Change to your email
            'Test Email dari Candice Kids',
            'Ini adalah email test untuk memastikan sistem email berfungsi dengan baik.'
        );
        
        console.log('✅ General email sent successfully:', result.messageId);
    } catch (error) {
        console.error('❌ General email failed:', error.message);
    }
}

// Run tests
if (require.main === module) {
    console.log('🚀 Candice Kids Email Service Test\n');
    console.log('Make sure you have configured your .env file first!\n');
    
    testEmail()
        .then(() => {
            console.log('\n🎉 All tests completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Test suite failed:', error);
            process.exit(1);
        });
}

module.exports = { testEmail, testGeneralEmail };
