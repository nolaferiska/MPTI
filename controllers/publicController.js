class PublicController {
    // Display homepage
    static showHome(req, res) {
        // Check for logout success message
        if (req.query.logout === 'success') {
            req.flash('success_msg', 'Logout berhasil');
        }
        
        res.render('public/index', {
            title: 'Candice Kids - Cerdas Mandiri Ceria',
            layout: 'layouts/public'
        });
    }

    // Display test Tailwind CSS page
    static showTestTailwind(req, res) {
        res.render('public/test-tailwind', {
            title: 'Test Tailwind CSS - Candice Kids',
            layout: 'layouts/public'
        });
    }

    // Display about page
    static showAbout(req, res) {
        res.render('public/about', {
            title: 'Tentang Kami - Candice Kids',
            layout: 'layouts/public'
        });
    }

    // Display contact page
    static showContact(req, res) {
        res.render('public/contact', {
            title: 'Kontak - Candice Kids',
            layout: 'layouts/public'
        });
    }
}

module.exports = PublicController;