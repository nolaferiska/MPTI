// Authentication middleware
const requireAuth = (role = null) => {
    return (req, res, next) => {
        if (!req.session.user) {
            req.flash('error_msg', 'Silakan login terlebih dahulu');
            
            if (role === 'admin') {
                return res.redirect('/admin/login');
            } else {
                return res.redirect('/login');
            }
        }

        if (role && req.session.user.role !== role) {
            req.flash('error_msg', 'Anda tidak memiliki akses ke halaman ini');
            return res.redirect('/');
        }

        next();
    };
};

// Redirect if already authenticated
const redirectIfAuth = (role = null) => {
    return (req, res, next) => {
        if (req.session.user) {
            if (req.session.user.role === 'admin') {
                return res.redirect('/admin/dashboard');
            } else {
                return res.redirect('/dashboard');
            }
        }
        next();
    };
};

// Check if user is admin
const requireAdmin = requireAuth('admin');

// Check if user is orang tua
const requireOrangTua = requireAuth('orang_tua');

module.exports = {
    requireAuth,
    requireAdmin,
    requireOrangTua,
    redirectIfAuth
};
