// Simple Mobile Navigation Fix
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Starting navigation debug...');
    
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');
    
    console.log('Navigation elements:', {
        navToggle: navToggle,
        navList: navList,
        navToggleExists: !!navToggle,
        navListExists: !!navList
    });
    
    if (!navToggle || !navList) {
        console.error('❌ Navigation elements not found!');
        return;
    }
    
    let isMenuOpen = false;
    
    // Simple hamburger animation
    function updateHamburger(isOpen) {
        const spans = navToggle.querySelectorAll('span');
        console.log('🎨 Updating hamburger:', isOpen, 'spans:', spans.length);
        
        spans.forEach((span, index) => {
            span.style.transition = 'all 0.3s ease';
            if (isOpen) {
                if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                if (index === 1) span.style.opacity = '0';
                if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                span.style.transform = 'none';
                span.style.opacity = '1';
            }
        });
    }
    
    // Toggle menu function
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        console.log('🔄 Toggling menu:', isMenuOpen);
        
        if (isMenuOpen) {
            navList.classList.add('active');
            navToggle.classList.add('active');
        } else {
            navList.classList.remove('active');
            navToggle.classList.remove('active');
        }
        
        navToggle.setAttribute('aria-expanded', isMenuOpen.toString());
        updateHamburger(isMenuOpen);
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }
    
    // Click event
    navToggle.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🖱️ Nav toggle clicked!');
        toggleMenu();
    });
    
    // Touch events for mobile
    navToggle.addEventListener('touchend', function(e) {
        e.preventDefault();
        console.log('👆 Nav toggle touched!');
        toggleMenu();
    });
    
    // Close menu when clicking nav links
    const navLinks = navList.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) {
                toggleMenu();
            }
        });
    });
    
    // Initial setup
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-controls', 'nav-list');
    navList.setAttribute('id', 'nav-list');
    
    console.log('✅ Navigation setup complete!');
});