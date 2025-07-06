// Main JavaScript file for Candice Kids

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card, .bg-white');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });

    // Auto-hide flash messages
    setTimeout(() => {
        // Target hanya flash messages yang berada setelah nav, bukan komponen styling lainnya
        const flashMessages = document.querySelectorAll('nav + .bg-success, nav + .bg-danger, nav + .bg-warning, .flash-message');
        flashMessages.forEach(message => {
            // Tambahan check untuk memastikan ini benar-benar flash message
            if (message.textContent.trim() && !message.querySelector('button') && (
                message.querySelector('.fas.fa-check-circle') || 
                message.querySelector('.fas.fa-exclamation-circle') ||
                message.classList.contains('flash-message')
            )) {
                setTimeout(() => {
                    message.style.opacity = '0';
                    setTimeout(() => {
                        message.remove();
                    }, 300);
                }, 5000);
            }
        });
    }, 100);

    // Add hover effects to buttons and cards
    const interactiveElements = document.querySelectorAll('button, .card, a[class*="bg-"]');
    interactiveElements.forEach(element => {
        element.classList.add('hover-lift');
    });

    // Initialize tooltips if needed
    initializeTooltips();
    
    // Initialize form validation
    initializeFormValidation();
}

function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(event) {
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute bg-gray-800 text-white px-2 py-1 rounded text-sm z-50';
    tooltip.textContent = event.target.getAttribute('data-tooltip');
    tooltip.style.top = event.target.offsetTop - 40 + 'px';
    tooltip.style.left = event.target.offsetLeft + 'px';
    document.body.appendChild(tooltip);
    event.target.tooltipElement = tooltip;
}

function hideTooltip(event) {
    if (event.target.tooltipElement) {
        event.target.tooltipElement.remove();
        delete event.target.tooltipElement;
    }
}

function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!validateForm(form)) {
                event.preventDefault();
                return false;
            }
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'Field ini wajib diisi');
            isValid = false;
        } else {
            clearFieldError(field);
        }
        
        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                showFieldError(field, 'Format email tidak valid');
                isValid = false;
            }
        }
        
        // Phone validation
        if (field.type === 'tel' && field.value) {
            const phoneRegex = /^[0-9+\-\s()]+$/;
            if (!phoneRegex.test(field.value)) {
                showFieldError(field, 'Format nomor telepon tidak valid');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('border-red-500');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1 field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('border-red-500');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Utility functions
function showLoading(element) {
    const originalContent = element.innerHTML;
    element.innerHTML = '<div class="spinner mx-auto"></div>';
    element.disabled = true;
    return originalContent;
}

function hideLoading(element, originalContent) {
    element.innerHTML = originalContent;
    element.disabled = false;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-20 right-4 z-50 p-4 rounded-lg text-white shadow-lg transform transition-all duration-300 translate-x-full`;
    
    // Set color based on type
    switch(type) {
        case 'success':
            toast.classList.add('bg-green-500');
            break;
        case 'error':
            toast.classList.add('bg-red-500');
            break;
        case 'warning':
            toast.classList.add('bg-yellow-500');
            break;
        default:
            toast.classList.add('bg-blue-500');
    }
    
    toast.innerHTML = `
        <div class="flex items-center space-x-2">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// Format currency (Indonesian Rupiah)
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Format date to Indonesian format
function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Confirm dialog
function confirmDialog(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Export functions for use in other scripts
window.CandiceKids = {
    showLoading,
    hideLoading,
    showToast,
    formatCurrency,
    formatDate,
    confirmDialog,
    validateForm
};
