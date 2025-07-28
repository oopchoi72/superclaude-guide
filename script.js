// SuperClaude Blog Interactive Features
// Enhanced with comprehensive error handling and graceful fallbacks

// Critical mobile rendering optimizations
function optimizeMobileRendering() {
    // Force repaint to ensure smooth rendering
    if (window.innerWidth <= 768) {
        document.body.style.transform = 'translateZ(0)';
        document.documentElement.style.webkitFontSmoothing = 'antialiased';
        document.documentElement.style.mozOsxFontSmoothing = 'grayscale';
        
        // Ensure viewport stability
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover');
        }
        
        // Fix mobile text rendering
        document.querySelectorAll('*').forEach(el => {
            if (el.children.length === 0 && el.textContent.trim()) {
                el.style.webkitFontSmoothing = 'antialiased';
                el.style.mozOsxFontSmoothing = 'grayscale';
                el.style.textRendering = 'optimizeLegibility';
            }
        });
        
        // Force hardware acceleration on key elements
        const keyElements = document.querySelectorAll('.nav-list, .content, .hero, .code-block');
        keyElements.forEach(el => {
            el.style.webkitTransform = 'translateZ(0)';
            el.style.transform = 'translateZ(0)';
        });
    }
}

// Apply optimizations immediately and on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeMobileRendering);
} else {
    optimizeMobileRendering();
}

// Enhanced resize handler for mobile
let mobileResizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(mobileResizeTimeout);
    mobileResizeTimeout = setTimeout(() => {
        if (window.innerWidth <= 768) {
            optimizeMobileRendering();
        }
    }, 150);
});

// Global error tracking
const ErrorTracker = {
    errors: [],
    maxErrors: 50,
    
    log(error, context = 'unknown', severity = 'error') {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            message: error.message || error,
            context,
            severity,
            stack: error.stack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errors.push(errorInfo);
        
        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // Console logging for development
        console.group(`🚨 ${severity.toUpperCase()}: ${context}`);
        console.error(error);
        console.log('Context:', context);
        console.log('Timestamp:', errorInfo.timestamp);
        console.groupEnd();
        
        // Optional: Send to analytics/monitoring service
        this.reportError(errorInfo);
    },
    
    reportError(errorInfo) {
        // Placeholder for error reporting service
        // In production, you would send this to your monitoring service
        if (window.gtag) {
            gtag('event', 'exception', {
                description: errorInfo.message,
                fatal: errorInfo.severity === 'critical'
            });
        }
    },
    
    getRecentErrors() {
        return this.errors.slice(-10);
    }
};

// Enhanced feature detection with fallbacks
const FeatureDetection = {
    hasClipboardAPI: () => {
        try {
            return navigator.clipboard && typeof navigator.clipboard.writeText === 'function';
        } catch (e) {
            return false;
        }
    },
    
    hasIntersectionObserver: () => {
        try {
            return 'IntersectionObserver' in window;
        } catch (e) {
            return false;
        }
    },
    
    hasPerformanceAPI: () => {
        try {
            return 'performance' in window && 'mark' in performance;
        } catch (e) {
            return false;
        }
    },
    
    hasServiceWorker: () => {
        try {
            return 'serviceWorker' in navigator;
        } catch (e) {
            return false;
        }
    },
    
    hasTouchEvents: () => {
        try {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        } catch (e) {
            return false;
        }
    }
};

// Safe DOM operations with error handling
const SafeDOM = {
    querySelector(selector, context = document) {
        try {
            return context.querySelector(selector);
        } catch (e) {
            ErrorTracker.log(e, `querySelector: ${selector}`, 'warning');
            return null;
        }
    },
    
    querySelectorAll(selector, context = document) {
        try {
            return context.querySelectorAll(selector);
        } catch (e) {
            ErrorTracker.log(e, `querySelectorAll: ${selector}`, 'warning');
            return [];
        }
    },
    
    addEventListener(element, event, handler, options = {}) {
        try {
            if (element && typeof element.addEventListener === 'function') {
                element.addEventListener(event, (e) => {
                    try {
                        handler(e);
                    } catch (error) {
                        ErrorTracker.log(error, `Event handler: ${event}`, 'error');
                    }
                }, options);
                return true;
            }
            return false;
        } catch (e) {
            ErrorTracker.log(e, `addEventListener: ${event}`, 'warning');
            return false;
        }
    },
    
    setAttribute(element, attribute, value) {
        try {
            if (element && typeof element.setAttribute === 'function') {
                element.setAttribute(attribute, value);
                return true;
            }
            return false;
        } catch (e) {
            ErrorTracker.log(e, `setAttribute: ${attribute}`, 'warning');
            return false;
        }
    },
    
    addClass(element, className) {
        try {
            if (element && element.classList) {
                element.classList.add(className);
                return true;
            }
            return false;
        } catch (e) {
            ErrorTracker.log(e, `addClass: ${className}`, 'warning');
            return false;
        }
    },
    
    removeClass(element, className) {
        try {
            if (element && element.classList) {
                element.classList.remove(className);
                return true;
            }
            return false;
        } catch (e) {
            ErrorTracker.log(e, `removeClass: ${className}`, 'warning');
            return false;
        }
    }
};

// Resource Loading Manager with Fallbacks
const ResourceManager = {
    loadedResources: new Set(),
    failedResources: new Set(),
    fallbackFonts: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
    
    // Check if external resources are loading properly
    async checkExternalResources() {
        const resources = [
            {
                type: 'font',
                url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
                fallback: () => this.applyFallbackFonts()
            },
            {
                type: 'script',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js',
                fallback: () => this.disableCodeHighlighting()
            },
            {
                type: 'script',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js',
                fallback: () => this.disableCodeHighlighting()
            },
            {
                type: 'style',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css',
                fallback: () => this.applyFallbackCodeStyling()
            }
        ];
        
        const checkPromises = resources.map(resource => this.checkResource(resource));
        await Promise.allSettled(checkPromises);
        
        this.reportResourceStatus();
    },
    
    async checkResource(resource) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch(resource.url, {
                method: 'HEAD',
                signal: controller.signal,
                mode: 'no-cors' // For external resources
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok || response.type === 'opaque') {
                this.loadedResources.add(resource.url);
            } else {
                throw new Error(`Resource failed to load: ${response.status}`);
            }
        } catch (error) {
            ErrorTracker.log(error, `Resource Check: ${resource.type}`, 'warning');
            this.failedResources.add(resource.url);
            
            // Apply fallback
            try {
                await resource.fallback();
            } catch (fallbackError) {
                ErrorTracker.log(fallbackError, `Fallback: ${resource.type}`, 'error');
            }
        }
    },
    
    applyFallbackFonts() {
        try {
            const fallbackCSS = `
                * {
                    font-family: ${this.fallbackFonts.join(', ')} !important;
                }
            `;
            
            const style = document.createElement('style');
            style.id = 'fallback-fonts';
            style.textContent = fallbackCSS;
            document.head.appendChild(style);
            
            console.log('Applied fallback fonts due to Inter font loading failure');
        } catch (error) {
            ErrorTracker.log(error, 'Fallback Fonts', 'error');
        }
    },
    
    disableCodeHighlighting() {
        try {
            // Mark that code highlighting should be disabled
            window.codeHighlightingDisabled = true;
            
            // Apply basic code styling instead
            const fallbackCSS = `
                pre, code {
                    background-color: #f8f9fa !important;
                    border: 1px solid #e9ecef !important;
                    border-radius: 4px !important;
                    padding: 8px 12px !important;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
                    font-size: 14px !important;
                    line-height: 1.4 !important;
                    color: #333 !important;
                }
                
                .code-block pre {
                    background-color: #2d3748 !important;
                    color: #e2e8f0 !important;
                    overflow-x: auto !important;
                }
            `;
            
            const style = document.createElement('style');
            style.id = 'fallback-code-styling';
            style.textContent = fallbackCSS;
            document.head.appendChild(style);
            
            console.log('Applied fallback code styling due to Prism.js loading failure');
        } catch (error) {
            ErrorTracker.log(error, 'Code Highlighting Fallback', 'error');
        }
    },
    
    applyFallbackCodeStyling() {
        try {
            const fallbackCSS = `
                .code-block pre {
                    background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%) !important;
                    color: #d4d4d4 !important;
                    padding: 20px !important;
                    border-radius: 8px !important;
                    font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
                    font-size: 14px !important;
                    line-height: 1.5 !important;
                    overflow-x: auto !important;
                    border: 1px solid #404040 !important;
                }
                
                code {
                    background-color: #f1f3f4 !important;
                    padding: 2px 6px !important;
                    border-radius: 3px !important;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
                    font-size: 13px !important;
                    color: #c7254e !important;
                }
            `;
            
            const style = document.createElement('style');
            style.id = 'fallback-prism-styling';
            style.textContent = fallbackCSS;
            document.head.appendChild(style);
            
            console.log('Applied fallback Prism styling due to CDN failure');
        } catch (error) {
            ErrorTracker.log(error, 'Prism Styling Fallback', 'error');
        }
    },
    
    reportResourceStatus() {
        const total = this.loadedResources.size + this.failedResources.size;
        const successRate = total > 0 ? (this.loadedResources.size / total) * 100 : 100;
        
        console.group('📊 Resource Loading Report');
        console.log(`Success Rate: ${successRate.toFixed(1)}%`);
        console.log(`Loaded: ${this.loadedResources.size}`);
        console.log(`Failed: ${this.failedResources.size}`);
        
        if (this.failedResources.size > 0) {
            console.log('Failed Resources:', Array.from(this.failedResources));
        }
        
        console.groupEnd();
        
        // Track in analytics if available
        if (window.gtag) {
            gtag('event', 'resource_loading', {
                event_category: 'performance',
                event_label: 'external_resources',
                value: Math.round(successRate)
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    try {
    // Simple Mobile Navigation System
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');
    const header = document.querySelector('.header');
    
    console.log('Navigation elements found:', {
        navToggle: !!navToggle,
        navList: !!navList
    });
    
    if (!navToggle || !navList) {
        console.warn('Navigation elements missing - mobile menu may not work properly');
        return;
    }
    let isMenuOpen = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let currentTouchX = 0;
    let menuTouchHandler = null;
    
    // Enhanced Mobile Navigation Toggle with improved animations
    if (navToggle && navList) {
        // Add ARIA attributes for better accessibility with error handling
        SafeDOM.setAttribute(navToggle, 'aria-expanded', 'false');
        SafeDOM.setAttribute(navToggle, 'aria-controls', 'nav-list');
        SafeDOM.setAttribute(navList, 'id', 'nav-list');
        SafeDOM.setAttribute(navList, 'role', 'menu');
        
        // Simple hamburger animation
        function updateHamburgerAnimation(isOpen) {
            const spans = navToggle.querySelectorAll('span');
            console.log('Updating hamburger animation:', isOpen, 'spans found:', spans.length);
            
            spans.forEach((span, index) => {
                span.style.transition = 'all 0.3s ease';
                if (isOpen) {
                    if (index === 0) {
                        span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    }
                    if (index === 1) {
                        span.style.opacity = '0';
                    }
                    if (index === 2) {
                        span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                    }
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                }
            });
        }
        
        // Simple toggle menu function
        function toggleMenu(open = null) {
            const shouldOpen = open !== null ? open : !isMenuOpen;
            isMenuOpen = shouldOpen;
            
            console.log('Toggling menu:', shouldOpen);
            
            // Toggle active class
            if (shouldOpen) {
                navList.classList.add('active');
                navToggle.classList.add('active');
            } else {
                navList.classList.remove('active');
                navToggle.classList.remove('active');
            }
            
            // Update ARIA
            navToggle.setAttribute('aria-expanded', shouldOpen.toString());
            
            // Hamburger animation
            updateHamburgerAnimation(shouldOpen);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = shouldOpen ? 'hidden' : '';
        }
        
        // Create backdrop for mobile menu
        function createMenuBackdrop() {
            const backdrop = document.createElement('div');
            backdrop.className = 'nav-backdrop';
            backdrop.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999;
                opacity: 0;
                transition: opacity 0.3s ease;
                backdrop-filter: blur(2px);
            `;
            
            // Close menu when backdrop is clicked
            backdrop.addEventListener('click', () => toggleMenu(false));
            
            document.body.appendChild(backdrop);
            
            // Animate backdrop in
            requestAnimationFrame(() => {
                backdrop.style.opacity = '1';
            });
        }
        
        // Remove backdrop
        function removeMenuBackdrop() {
            const backdrop = document.querySelector('.nav-backdrop');
            if (backdrop) {
                backdrop.style.opacity = '0';
                setTimeout(() => {
                    if (backdrop.parentNode) {
                        backdrop.parentNode.removeChild(backdrop);
                    }
                }, 300);
            }
        }
        
        // Simple click event handler
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Nav toggle clicked!');
            toggleMenu();
        });
        
        // Add initial ARIA attributes
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-controls', 'nav-list');
        navList.setAttribute('id', 'nav-list');
        
        // Swipe gesture support for navigation
        let swipeStartX = 0;
        let swipeStartY = 0;
        let isSwipeValid = false;
        
        // Touch start handler
        function handleTouchStart(e) {
            swipeStartX = e.touches[0].clientX;
            swipeStartY = e.touches[0].clientY;
            isSwipeValid = true;
        }
        
        // Touch move handler for swipe detection
        function handleTouchMove(e) {
            if (!isSwipeValid) return;
            
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            const deltaX = touchX - swipeStartX;
            const deltaY = touchY - swipeStartY;
            
            // Check if it's a horizontal swipe (not vertical scroll)
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                isSwipeValid = false;
                return;
            }
            
            // Prevent default if it's a valid swipe
            if (Math.abs(deltaX) > 10) {
                e.preventDefault();
            }
        }
        
        // Touch end handler for swipe completion
        function handleTouchEnd(e) {
            if (!isSwipeValid) return;
            
            const touchX = e.changedTouches[0].clientX;
            const deltaX = touchX - swipeStartX;
            const threshold = 50; // Minimum swipe distance
            
            // Right swipe to open menu (from left edge)
            if (deltaX > threshold && swipeStartX < 50 && !isMenuOpen) {
                toggleMenu(true);
            }
            // Left swipe to close menu
            else if (deltaX < -threshold && isMenuOpen) {
                toggleMenu(false);
            }
            
            isSwipeValid = false;
        }
        
        // Add swipe listeners to document for edge swipes
        if (window.innerWidth <= 768) {
            document.addEventListener('touchstart', handleTouchStart, { passive: true });
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd, { passive: true });
            document.mobileListenersAdded = true;
        }
        
        // Mobile performance optimizations with viewport detection
        let resizeTimeout;
        let currentViewport = window.innerWidth <= 768 ? 'mobile' : 'desktop';
        
        function handleViewportChange() {
            const newViewport = window.innerWidth <= 768 ? 'mobile' : 'desktop';
            
            if (currentViewport !== newViewport) {
                currentViewport = newViewport;
                
                if (newViewport === 'mobile' && !document.mobileListenersAdded) {
                    // Enable mobile features
                    document.addEventListener('touchstart', handleTouchStart, { passive: true });
                    document.addEventListener('touchmove', handleTouchMove, { passive: false });
                    document.addEventListener('touchend', handleTouchEnd, { passive: true });
                    document.mobileListenersAdded = true;
                    
                    // Add mobile-specific classes
                    document.body.classList.add('mobile-viewport');
                    document.body.classList.remove('desktop-viewport');
                } else if (newViewport === 'desktop') {
                    // Clean up mobile features
                    if (document.mobileListenersAdded) {
                        document.removeEventListener('touchstart', handleTouchStart);
                        document.removeEventListener('touchmove', handleTouchMove);
                        document.removeEventListener('touchend', handleTouchEnd);
                        document.mobileListenersAdded = false;
                    }
                    
                    // Close mobile menu
                    if (isMenuOpen) {
                        toggleMenu(false);
                    }
                    
                    // Add desktop-specific classes
                    document.body.classList.add('desktop-viewport');
                    document.body.classList.remove('mobile-viewport');
                }
            }
        }
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleViewportChange, 150);
        });
        
        // Initial viewport detection
        handleViewportChange();
        
        // Enhanced keyboard navigation
        navList.addEventListener('keydown', (e) => {
            const navItems = navList.querySelectorAll('a');
            const currentIndex = Array.from(navItems).indexOf(document.activeElement);
            
            switch(e.key) {
                case 'Escape':
                    e.preventDefault();
                    toggleMenu(false);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % navItems.length;
                    navItems[nextIndex].focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = currentIndex === 0 ? navItems.length - 1 : currentIndex - 1;
                    navItems[prevIndex].focus();
                    break;
                case 'Home':
                    e.preventDefault();
                    navItems[0].focus();
                    break;
                case 'End':
                    e.preventDefault();
                    navItems[navItems.length - 1].focus();
                    break;
            }
        });
        
        // Add role and aria attributes to navigation items
        navList.querySelectorAll('a').forEach((link, index) => {
            link.setAttribute('role', 'menuitem');
            link.setAttribute('tabindex', index === 0 ? '0' : '-1');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (isMenuOpen && !navList.contains(e.target) && !navToggle.contains(e.target)) {
                toggleMenu(false);
            }
        });
        
        // (Resize listener moved above for better performance optimization)
        
        // Mobile-specific enhancements
        if ('ontouchstart' in window) {
            // Enhanced haptic feedback with proper feature detection and user interaction requirements
            let userHasInteracted = false;
            let vibrationSupported = false;
            
            // Check vibration support with proper feature detection
            function checkVibrationSupport() {
                return 'vibrate' in navigator && 
                       typeof navigator.vibrate === 'function' &&
                       !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            }
            
            // Initialize vibration support after user interaction
            function initializeVibration() {
                if (!userHasInteracted) {
                    vibrationSupported = checkVibrationSupport();
                    userHasInteracted = true;
                }
            }
            
            // Safe haptic feedback function with proper error handling
            function triggerHapticFeedback(type = 'light') {
                // Only proceed if user has interacted and vibration is supported
                if (!userHasInteracted || !vibrationSupported) {
                    return;
                }
                
                try {
                    // Additional runtime check for vibration API availability
                    if (!navigator.vibrate || typeof navigator.vibrate !== 'function') {
                        return;
                    }
                    
                    let duration;
                    switch(type) {
                        case 'light':
                            duration = 10;
                            break;
                        case 'medium':
                            duration = 25;
                            break;
                        case 'heavy':
                            duration = 50;
                            break;
                        default:
                            duration = 10;
                    }
                    
                    // Call vibration API with error handling
                    navigator.vibrate(duration);
                } catch (error) {
                    // Silently handle vibration errors to prevent console spam
                    console.debug('Vibration not available:', error.message);
                    vibrationSupported = false;
                }
            }
            
            // Add user interaction detection and haptic feedback to navigation
            navToggle.addEventListener('touchstart', (e) => {
                initializeVibration();
                // Small delay to ensure user interaction is registered
                setTimeout(() => triggerHapticFeedback('light'), 10);
            });
            
            navList.querySelectorAll('a').forEach(link => {
                link.addEventListener('touchstart', (e) => {
                    initializeVibration();
                    setTimeout(() => triggerHapticFeedback('light'), 10);
                });
            });
            
            // Listen for reduced motion preference changes
            if (window.matchMedia) {
                const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
                motionQuery.addListener((e) => {
                    if (e.matches) {
                        vibrationSupported = false;
                    } else {
                        vibrationSupported = checkVibrationSupport();
                    }
                });
            }
        }
        
        // Double tap to close menu (additional gesture)
        let lastTap = 0;
        navList.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0 && e.target === navList) {
                e.preventDefault();
                toggleMenu(false);
            }
            lastTap = currentTime;
        });
        
        // Enhanced orientation change handling
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                // Force viewport recalculation
                handleViewportChange();
                
                if (isMenuOpen) {
                    // Adjust menu position after orientation change
                    const headerHeight = header.offsetHeight;
                    const viewportHeight = window.innerHeight;
                    navList.style.maxHeight = `calc(${viewportHeight}px - ${headerHeight}px - 2rem)`;
                    
                    // Re-center the menu if needed
                    navList.scrollTop = 0;
                }
                
                // Trigger resize detection for other components
                window.dispatchEvent(new Event('resize'));
            }, 200); // Increased delay for iOS
        });
        
        // Performance monitoring for mobile
        if ('performance' in window && 'mark' in performance) {
            performance.mark('mobile-nav-init-start');
            
            // Mark completion of mobile nav initialization
            setTimeout(() => {
                performance.mark('mobile-nav-init-end');
                performance.measure('mobile-nav-init', 'mobile-nav-init-start', 'mobile-nav-init-end');
            }, 0);
        }
    }

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open with proper cleanup
                if (navList && navList.classList.contains('active')) {
                    toggleMenu(false);
                }
            }
        });
    });

    // Active Navigation Highlighting
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');
    
    function updateActiveNavigation() {
        const scrollPosition = window.scrollY + 200;
        
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current section link
                const activeLink = document.querySelector(`.sidebar-nav a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }

    // Progress Bar
    const progressBar = document.querySelector('.progress-bar');
    
    function updateProgressBar() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.scrollY;
        const progress = (scrollTop / documentHeight) * 100;
        
        if (progressBar) {
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
    }

    // Scroll Event Listener
    let ticking = false;
    
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateActiveNavigation();
                updateProgressBar();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll);
    
    // Initial calls
    updateActiveNavigation();
    updateProgressBar();

    // Enhanced Copy Code Functionality with Robust Error Handling
    function addCopyButtons() {
        try {
            const codeBlocks = SafeDOM.querySelectorAll('.code-block pre');
            
            if (!codeBlocks || codeBlocks.length === 0) {
                ErrorTracker.log(new Error('No code blocks found'), 'Copy Buttons Setup', 'info');
                return;
            }
            
            codeBlocks.forEach((block, index) => {
                try {
                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'copy-btn';
                    copyBtn.textContent = '복사';
                    SafeDOM.setAttribute(copyBtn, 'aria-label', '코드 복사');
                    SafeDOM.setAttribute(copyBtn, 'type', 'button');
                    
                    // Enhanced click handler with multiple fallback methods
                    SafeDOM.addEventListener(copyBtn, 'click', async () => {
                        const code = block.textContent || block.innerText || '';
                        
                        if (!code.trim()) {
                            showCopyFeedback(copyBtn, '내용 없음', 'warning');
                            return;
                        }
                        
                        // Try multiple copy methods in order of preference
                        const copyMethods = [
                            () => copyWithClipboardAPI(code),
                            () => copyWithExecCommand(code),
                            () => copyWithTempTextarea(code)
                        ];
                        
                        let success = false;
                        let lastError = null;
                        
                        for (const method of copyMethods) {
                            try {
                                await method();
                                success = true;
                                break;
                            } catch (error) {
                                lastError = error;
                                continue;
                            }
                        }
                        
                        if (success) {
                            showCopyFeedback(copyBtn, '복사됨!', 'success');
                            // Track successful copy
                            if (window.gtag) {
                                gtag('event', 'copy_code_success', {
                                    event_category: 'engagement',
                                    event_label: 'code_block'
                                });
                            }
                        } else {
                            ErrorTracker.log(lastError || new Error('All copy methods failed'), 'Copy Code', 'error');
                            showCopyFeedback(copyBtn, '복사 실패', 'error');
                            
                            // Show manual copy instructions as final fallback
                            showManualCopyInstructions(code);
                        }
                    });
                    
                    // Safely add button to DOM
                    try {
                        if (block.parentElement) {
                            block.parentElement.style.position = 'relative';
                            block.parentElement.appendChild(copyBtn);
                        }
                    } catch (appendError) {
                        ErrorTracker.log(appendError, `Copy Button Append ${index}`, 'warning');
                    }
                    
                } catch (blockError) {
                    ErrorTracker.log(blockError, `Copy Button Creation ${index}`, 'warning');
                }
            });
            
        } catch (error) {
            ErrorTracker.log(error, 'Add Copy Buttons', 'error');
        }
    }
    
    // Modern Clipboard API method
    async function copyWithClipboardAPI(text) {
        if (!FeatureDetection.hasClipboardAPI()) {
            throw new Error('Clipboard API not supported');
        }
        
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            // Handle specific clipboard errors
            if (error.name === 'NotAllowedError') {
                throw new Error('Clipboard access denied - user interaction required');
            }
            throw error;
        }
    }
    
    // Legacy execCommand method
    function copyWithExecCommand(text) {
        if (!document.execCommand) {
            throw new Error('execCommand not supported');
        }
        
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.cssText = `
            position: fixed;
            top: -1000px;
            left: -1000px;
            width: 1px;
            height: 1px;
            opacity: 0;
            pointer-events: none;
        `;
        
        try {
            document.body.appendChild(textArea);
            textArea.select();
            textArea.setSelectionRange(0, 99999); // For mobile devices
            
            const successful = document.execCommand('copy');
            if (!successful) {
                throw new Error('execCommand copy failed');
            }
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
    // Temporary textarea method for older browsers
    function copyWithTempTextarea(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.cssText = `
            position: absolute;
            left: -9999px;
            top: -9999px;
            opacity: 0;
        `;
        
        try {
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            // Try to trigger copy with keyboard event
            const copyEvent = new KeyboardEvent('keydown', {
                key: 'c',
                ctrlKey: true,
                bubbles: true
            });
            
            document.dispatchEvent(copyEvent);
            
            // This method doesn't guarantee success, so we throw to try other methods
            throw new Error('Manual copy required');
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
    // Visual feedback for copy operations
    function showCopyFeedback(button, message, type = 'success') {
        const originalText = button.textContent;
        const originalBackground = button.style.background;
        
        button.textContent = message;
        
        const colors = {
            success: 'rgba(72, 187, 120, 0.8)',
            error: 'rgba(245, 101, 101, 0.8)',
            warning: 'rgba(237, 137, 54, 0.8)'
        };
        
        button.style.background = colors[type] || colors.success;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = originalBackground || 'rgba(255,255,255,0.1)';
        }, 2000);
    }
    
    // Show manual copy instructions as last resort
    function showManualCopyInstructions(code) {
        if (window.confirm('자동 복사가 실패했습니다. 수동으로 코드를 선택하여 복사하시겠습니까?')) {
            // Create a modal with selectable text
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                z-index: 10000;
                max-width: 80%;
                max-height: 80%;
                overflow: auto;
            `;
            
            const instructions = document.createElement('p');
            instructions.textContent = '아래 코드를 선택하고 Ctrl+C (또는 Cmd+C)를 눌러 복사하세요:';
            
            const codeDisplay = document.createElement('pre');
            codeDisplay.style.cssText = `
                background: #f1f1f1;
                padding: 15px;
                border-radius: 4px;
                user-select: all;
                overflow: auto;
                white-space: pre-wrap;
            `;
            codeDisplay.textContent = code;
            
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '닫기';
            closeBtn.style.cssText = `
                margin-top: 15px;
                padding: 8px 16px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;
            
            closeBtn.onclick = () => document.body.removeChild(modal);
            
            modal.appendChild(instructions);
            modal.appendChild(codeDisplay);
            modal.appendChild(closeBtn);
            document.body.appendChild(modal);
            
            // Auto-select the code
            try {
                const range = document.createRange();
                range.selectNodeContents(codeDisplay);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (e) {
                ErrorTracker.log(e, 'Manual Copy Selection', 'warning');
            }
        }
    }

    // Add copy buttons to code blocks
    addCopyButtons();
    
    // Check external resources and apply fallbacks if needed
    ResourceManager.checkExternalResources().catch(error => {
        ErrorTracker.log(error, 'Resource Manager Init', 'warning');
    });

    // Interactive Examples
    function initializeInteractiveExamples() {
        const examples = document.querySelectorAll('.example-block');
        
        examples.forEach(example => {
            // Add expand/collapse functionality for large examples
            const codeBlock = example.querySelector('.code-block');
            if (codeBlock && codeBlock.scrollHeight > 300) {
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'example-toggle';
                toggleBtn.textContent = '더 보기';
                toggleBtn.style.cssText = `
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    cursor: pointer;
                    margin-top: 0.5rem;
                    font-size: 0.875rem;
                    transition: background-color 0.2s;
                `;
                
                codeBlock.style.maxHeight = '300px';
                codeBlock.style.overflow = 'hidden';
                codeBlock.style.transition = 'max-height 0.3s ease';
                
                toggleBtn.addEventListener('click', () => {
                    if (codeBlock.style.maxHeight === '300px') {
                        codeBlock.style.maxHeight = 'none';
                        toggleBtn.textContent = '접기';
                        toggleBtn.style.background = '#718096';
                    } else {
                        codeBlock.style.maxHeight = '300px';
                        toggleBtn.textContent = '더 보기';
                        toggleBtn.style.background = '#667eea';
                    }
                });
                
                toggleBtn.addEventListener('mouseenter', () => {
                    if (toggleBtn.textContent === '더 보기') {
                        toggleBtn.style.background = '#5a67d8';
                    } else {
                        toggleBtn.style.background = '#4a5568';
                    }
                });
                
                toggleBtn.addEventListener('mouseleave', () => {
                    if (toggleBtn.textContent === '더 보기') {
                        toggleBtn.style.background = '#667eea';
                    } else {
                        toggleBtn.style.background = '#718096';
                    }
                });
                
                example.appendChild(toggleBtn);
            }
        });
    }

    initializeInteractiveExamples();

    // Search Functionality
    function initializeSearch() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.style.cssText = `
            position: sticky;
            top: 0;
            background: white;
            padding: 1rem;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 1rem;
            border-radius: 0.75rem 0.75rem 0 0;
        `;
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '검색...';
        searchInput.className = 'search-input';
        searchInput.style.cssText = `
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            outline: none;
            transition: border-color 0.2s;
        `;
        
        searchInput.addEventListener('focus', () => {
            searchInput.style.borderColor = '#667eea';
        });
        
        searchInput.addEventListener('blur', () => {
            searchInput.style.borderColor = '#e2e8f0';
        });
        
        const searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        searchResults.style.cssText = `
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 0.375rem 0.375rem;
            background: white;
            display: none;
        `;
        
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(searchResults);
        
        const sidebarContent = document.querySelector('.sidebar-content');
        if (sidebarContent) {
            sidebarContent.insertBefore(searchContainer, sidebarContent.firstChild);
        }
        
        // Search functionality
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.toLowerCase().trim();
            
            searchTimeout = setTimeout(() => {
                if (query.length >= 2) {
                    performSearch(query, searchResults);
                    searchResults.style.display = 'block';
                } else {
                    searchResults.style.display = 'none';
                }
            }, 300);
        });
        
        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }
    
    function performSearch(query, resultsContainer) {
        const searchableElements = document.querySelectorAll('h2, h3, h4, p, li, code');
        const results = [];
        
        searchableElements.forEach(element => {
            const text = element.textContent.toLowerCase();
            if (text.includes(query)) {
                const section = element.closest('.section, .subsection');
                if (section) {
                    const sectionTitle = section.querySelector('h2, h3')?.textContent || '제목 없음';
                    const elementText = element.textContent.substring(0, 100);
                    
                    results.push({
                        title: sectionTitle,
                        text: elementText,
                        element: element
                    });
                }
            }
        });
        
        // Remove duplicates and limit results
        const uniqueResults = results.filter((result, index, self) => 
            index === self.findIndex(r => r.title === result.title && r.text === result.text)
        ).slice(0, 10);
        
        resultsContainer.innerHTML = '';
        
        if (uniqueResults.length === 0) {
            const noResults = document.createElement('div');
            noResults.style.cssText = 'padding: 1rem; color: #718096; font-size: 0.875rem;';
            noResults.textContent = '검색 결과가 없습니다.';
            resultsContainer.appendChild(noResults);
        } else {
            uniqueResults.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.style.cssText = `
                    padding: 0.75rem;
                    border-bottom: 1px solid #f7fafc;
                    cursor: pointer;
                    transition: background-color 0.2s;
                `;
                
                resultItem.innerHTML = `
                    <div style="font-weight: 500; color: #2d3748; margin-bottom: 0.25rem;">${result.title}</div>
                    <div style="font-size: 0.875rem; color: #718096;">${result.text}...</div>
                `;
                
                resultItem.addEventListener('mouseenter', () => {
                    resultItem.style.backgroundColor = '#f7fafc';
                });
                
                resultItem.addEventListener('mouseleave', () => {
                    resultItem.style.backgroundColor = 'white';
                });
                
                resultItem.addEventListener('click', () => {
                    result.element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    resultsContainer.style.display = 'none';
                    document.querySelector('.search-input').value = '';
                });
                
                resultsContainer.appendChild(resultItem);
            });
        }
    }
    
    // Initialize search only on desktop
    if (window.innerWidth > 768) {
        initializeSearch();
    }

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape to close search
        if (e.key === 'Escape') {
            const searchResults = document.querySelector('.search-results');
            const searchInput = document.querySelector('.search-input');
            if (searchResults) {
                searchResults.style.display = 'none';
            }
            if (searchInput) {
                searchInput.blur();
                searchInput.value = '';
            }
        }
    });

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .persona-card, .command-category, .flag-category, .example-block').forEach(el => {
        observer.observe(el);
    });

    // Performance monitoring
    function trackPerformance() {
        if ('PerformanceObserver' in window) {
            const perfObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                    }
                });
            });
            
            perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    trackPerformance();

    // Analytics simulation (replace with real analytics)
    function trackEvent(action, category, label) {
        console.log('Event tracked:', { action, category, label });
        // Replace with real analytics code
        // gtag('event', action, { category, label });
    }

    // Track navigation clicks
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('navigation_click', 'sidebar', link.textContent);
        });
    });

    // Track copy button clicks
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            trackEvent('copy_code', 'interaction', 'code_block');
        });
    });

    // Console welcome message
    console.log(`
🤖 SuperClaude 사용법 가이드에 오신 것을 환영합니다!

키보드 단축키:
- Ctrl/Cmd + K: 검색
- Escape: 검색 닫기

개발자 정보:
- 반응형 디자인 ✅
- 접근성 최적화 ✅  
- 성능 최적화 ✅
- SEO 친화적 ✅

피드백: https://github.com/anthropics/claude-code/issues
    `);
});

// Service Worker Registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            // Try multiple paths for different deployment scenarios  
            const basePath = window.location.pathname.replace(/\/[^\/]*$/, '') || '';
            const swPaths = [
                './sw.js',
                '/sw.js', 
                `${basePath}/sw.js`,
                `${window.location.pathname}sw.js`
            ];
            let registration = null;
            
            for (const swPath of swPaths) {
                try {
                    // Check if sw.js exists at this path
                    const response = await fetch(swPath, { method: 'HEAD' });
                    if (response.ok) {
                        registration = await navigator.serviceWorker.register(swPath, {
                            scope: './'
                        });
                        console.log('SW registered successfully:', registration);
                        console.log('SW path used:', swPath);
                        break;
                    }
                } catch (pathError) {
                    console.log(`SW path ${swPath} failed:`, pathError.message);
                    continue;
                }
            }
            
            if (!registration) {
                console.warn('SW registration failed: sw.js not found at any expected path');
            } else {
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('SW updated. New content available.');
                        }
                    });
                });
            }
        } catch (error) {
            console.log('SW registration failed:', error);
        }
    });
}

// Theme Toggle (for future dark mode)
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', savedTheme);

// Utility functions
const utils = {
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },

    // Format date
    formatDate: (date) => {
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    },

    // Scroll to element
    scrollToElement: (element, offset = 0) => {
        const elementPosition = element.offsetTop;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};

    // Mark successful initialization
    console.log('✅ SuperClaude Blog initialization completed successfully');
    
    } catch (error) {
        // Main error handler for DOMContentLoaded
        ErrorTracker.log(error, 'Main Initialization', 'critical');
        
        // Show user-friendly error message
        showUserFriendlyError('페이지 초기화 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.');
        
        // Try to maintain basic functionality
        try {
            // Ensure at least basic navigation works
            const navToggle = document.querySelector('.nav-toggle');
            const navList = document.querySelector('.nav-list');
            
            if (navToggle && navList) {
                navToggle.addEventListener('click', () => {
                    navList.style.display = navList.style.display === 'block' ? 'none' : 'block';
                });
            }
        } catch (fallbackError) {
            ErrorTracker.log(fallbackError, 'Emergency Fallback', 'critical');
        }
    }
});

// User-friendly error notification system
function showUserFriendlyError(message, isTemporary = true) {
    try {
        // Remove any existing error notifications
        const existingNotification = document.querySelector('.error-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            max-width: 350px;
            line-height: 1.4;
            animation: slideInRight 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 18px;">⚠️</span>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">오류 발생</div>
                    <div>${message}</div>
                    ${isTemporary ? '<div style="font-size: 12px; opacity: 0.9; margin-top: 8px;">이 메시지는 자동으로 사라집니다.</div>' : ''}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 16px;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                ">×</button>
            </div>
        `;
        
        // Add animation keyframes if not already present
        if (!document.querySelector('#error-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'error-animation-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds if temporary
        if (isTemporary) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOutRight 0.3s ease-in';
                    setTimeout(() => {
                        if (notification.parentElement) {
                            notification.remove();
                        }
                    }, 300);
                }
            }, 10000);
        }
        
    } catch (error) {
        // Fallback to alert if notification creation fails
        alert(message);
        ErrorTracker.log(error, 'Error Notification', 'error');
    }
}

// Global error handlers
window.addEventListener('error', (event) => {
    ErrorTracker.log(event.error, 'Global Error', 'error');
    
    // Show user-friendly message for critical errors
    if (event.error && event.error.stack) {
        showUserFriendlyError('예상치 못한 오류가 발생했습니다. 문제가 지속되면 페이지를 새로고침해 주세요.');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    ErrorTracker.log(event.reason, 'Unhandled Promise Rejection', 'error');
    
    // Prevent the default browser console error
    event.preventDefault();
    
    showUserFriendlyError('비동기 작업 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
});

// Export utilities for use in other scripts
window.SuperClaudeUtils = utils;