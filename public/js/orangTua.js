// Orange Tua (Parent) portal JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeParentPortal();
});

function initializeParentPortal() {
    // Add active state to current menu item
    highlightActiveMenuItem();
    
    // Initialize mobile menu toggle (already in HTML but ensure it works)
    initializeMobileMenu();
    
    // Initialize emergency button
    initializeEmergencyButton();
    
    // Initialize chat notifications
    initializeChatNotifications();
    
    // Auto-hide flash messages
    autoHideFlashMessages();
}

function highlightActiveMenuItem() {
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('nav a[href]');
    
    menuItems.forEach(item => {
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('bg-primary', 'text-white');
            item.classList.remove('text-textPrimary');
        }
    });
}

function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (mobileMenuToggle && sidebar && sidebarOverlay) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
            sidebarOverlay.classList.toggle('hidden');
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
        });
    }
}

function initializeEmergencyButton() {
    const emergencyButton = document.querySelector('[class*="bg-secondary"]');
    if (emergencyButton && emergencyButton.textContent.includes('Darurat')) {
        emergencyButton.addEventListener('click', handleEmergencyClick);
    }
}

function handleEmergencyClick(event) {
    event.preventDefault();
    
    const confirmed = confirm(
        'Apakah Anda yakin ingin mengirim notifikasi darurat?\n\n' +
        'Notifikasi ini akan langsung dikirim ke admin dan pengasuh.'
    );
    
    if (confirmed) {
        // Here would be the actual emergency notification logic
        showParentToast('Notifikasi darurat telah dikirim!', 'success');
        
        // Disable button for 30 seconds to prevent spam
        event.target.disabled = true;
        event.target.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Terkirim';
        
        setTimeout(() => {
            event.target.disabled = false;
            event.target.innerHTML = '<i class="fas fa-bell mr-2"></i><span class="hidden sm:inline">Darurat</span>';
        }, 30000);
    }
}

function initializeChatNotifications() {
    // Check for new messages every 30 seconds
    setInterval(checkNewMessages, 30000);
}

function checkNewMessages() {
    // This would typically make an AJAX call to check for new messages
    // For now, we'll simulate occasional new messages
    if (Math.random() > 0.8) {
        const chatLink = document.querySelector('a[href="/chat"]');
        if (chatLink && !chatLink.querySelector('.notification-badge')) {
            addNotificationBadge(chatLink);
        }
    }
}

function addNotificationBadge(element) {
    const badge = document.createElement('span');
    badge.className = 'notification-badge absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full h-5 w-5 flex items-center justify-center';
    badge.textContent = '1';
    
    const icon = element.querySelector('i');
    if (icon) {
        icon.parentElement.style.position = 'relative';
        icon.parentElement.appendChild(badge);
    }
    
    // Remove badge after 10 seconds
    setTimeout(() => {
        badge.remove();
    }, 10000);
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

// Utility functions for parent portal
function showParentToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-20 right-4 z-50 p-4 rounded-lg text-white shadow-lg transform transition-all duration-300 translate-x-full`;
    
    switch(type) {
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

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

function formatTime(time) {
    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(`2000-01-01T${time}`));
}

// Export functions for global use
window.ParentPortal = {
    showParentToast,
    formatCurrency,
    formatDate,
    formatTime,
    addNotificationBadge
};
