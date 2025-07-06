// Admin panel JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
});

function initializeAdminPanel() {
    // Add active state to current menu item
    highlightActiveMenuItem();

    // Initialize tooltips
    initializeTooltips();

    // Initialize notifications
    initializeNotifications();

    // Initialize quick actions
    initializeQuickActions();

    // Auto-hide flash messages
    autoHideFlashMessages();
}

function highlightActiveMenuItem() {
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('nav a[href]');

    menuItems.forEach(item => {
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('bg-gray-700', 'text-white');
        }
    });
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
    tooltip.className = 'absolute bg-gray-800 text-white px-2 py-1 rounded text-sm z-50 pointer-events-none';
    tooltip.textContent = event.target.getAttribute('data-tooltip');

    const rect = event.target.getBoundingClientRect();
    tooltip.style.top = (rect.top - 40) + 'px';
    tooltip.style.left = rect.left + 'px';

    document.body.appendChild(tooltip);
    event.target.tooltipElement = tooltip;
}

function hideTooltip(event) {
    if (event.target.tooltipElement) {
        event.target.tooltipElement.remove();
        delete event.target.tooltipElement;
    }
}

function initializeNotifications() {
    // Check for new notifications every 30 seconds
    setInterval(checkNotifications, 30000);
}

function checkNotifications() {
    // This would typically make an AJAX call to check for new notifications
    // For now, we'll just update the notification bell if there are any
    const notificationBell = document.querySelector('.fa-bell');
    if (notificationBell && Math.random() > 0.7) {
        notificationBell.classList.add('text-danger');
        setTimeout(() => {
            notificationBell.classList.remove('text-danger');
        }, 5000);
    }
}

function initializeQuickActions() {
    // Add click handlers for quick action buttons
    const quickActionButtons = document.querySelectorAll('[data-quick-action]');
    quickActionButtons.forEach(button => {
        button.addEventListener('click', handleQuickAction);
    });
}

function handleQuickAction(event) {
    const action = event.target.getAttribute('data-quick-action');

    switch (action) {
        case 'add-child':
            window.location.href = '/admin/anak';
            break;
        case 'view-attendance':
            window.location.href = '/admin/absensi';
            break;
        case 'check-messages':
            window.location.href = '/admin/komunikasi';
            break;
        default:
            console.log('Unknown quick action:', action);
    }
}

function autoHideFlashMessages() {
    // Target hanya flash messages yang berada di header area, bukan komponen styling lainnya
    const flashMessages = document.querySelectorAll('header + .bg-success, header + .bg-danger, header + .bg-warning, .flash-message');
    flashMessages.forEach(message => {
        // Tambahan check untuk memastikan ini benar-benar flash message
        if (message.textContent.trim() && (
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
}

// Utility functions for admin panel
function showLoadingSpinner(element) {
    const originalContent = element.innerHTML;
    element.innerHTML = '<div class="spinner mx-auto"></div>';
    element.disabled = true;
    return originalContent;
}

function hideLoadingSpinner(element, originalContent) {
    element.innerHTML = originalContent;
    element.disabled = false;
}

function confirmAdminAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

function showAdminToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-20 right-4 z-50 p-4 rounded-lg text-white shadow-lg transform transition-all duration-300 translate-x-full`;

    switch (type) {
        case 'success':
            toast.classList.add('bg-success');
            break;
        case 'error':
            toast.classList.add('bg-danger');
            break;
        case 'warning':
            toast.classList.add('bg-accent', 'text-textPrimary');
            break;
        default:
            toast.classList.add('bg-secondary');
    }

    toast.innerHTML = `
        <div class="flex items-center space-x-2">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 hover:opacity-75">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);

    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// Export functions for global use
window.AdminPanel = {
    showLoadingSpinner,
    hideLoadingSpinner,
    confirmAdminAction,
    showAdminToast
};