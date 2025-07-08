module.exports = {
    content: [
        "./views/**/*.ejs",
        "./public/**/*.{js,html}",
        "./src/**/*.{js,html}"
    ],
    theme: {
        extend: {
            colors: {
                // Custom Candice Kids colors
                primary: '#91edf9',
                secondary: '#fcf8d2',
                tertiary: '#f4e55e',
                quaternary: '#b1e2e8',



                accent: '#FFE66D',
                success: '#95E1D3',
                danger: '#FF8A80',
                warning: '#FFE66D',
                info: '#4ECDC4',
                background: '#F8F9FF',
                textPrimary: '#2C3E50',
                textSecondary: '#7F8C8D',

                // Extended gray scale
                gray: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                }
            },
            fontFamily: {
                'poppins': ['Poppins', 'sans-serif']
            },
            borderRadius: {
                'custom': '1rem'
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out',
                'pulse-custom': 'pulse 1.5s infinite'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                }
            }
        }
    },
    plugins: []
}