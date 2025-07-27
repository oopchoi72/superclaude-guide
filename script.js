// SuperClaude Blog Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    // Enhanced Mobile Navigation System
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');
    const header = document.querySelector('.header');
    let isMenuOpen = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let currentTouchX = 0;
    let menuTouchHandler = null;
    
    // Enhanced Mobile Navigation Toggle with improved animations
    if (navToggle && navList) {
        // Add ARIA attributes for better accessibility
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-controls', 'nav-list');
        navList.setAttribute('id', 'nav-list');
        navList.setAttribute('role', 'menu');
        
        // Enhanced hamburger animation with CSS transforms
        function updateHamburgerAnimation(isOpen) {
            const spans = navToggle.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (isOpen) {
                    if (index === 0) {
                        span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                        span.style.transformOrigin = 'center';
                    }
                    if (index === 1) {
                        span.style.opacity = '0';
                        span.style.transform = 'scale(0)';
                    }
                    if (index === 2) {
                        span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                        span.style.transformOrigin = 'center';
                    }
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                    span.style.transformOrigin = 'center';
                }
            });
        }
        
        // Toggle menu function
        function toggleMenu(open = null) {
            const shouldOpen = open !== null ? open : !isMenuOpen;
            isMenuOpen = shouldOpen;
            
            navList.classList.toggle('active', shouldOpen);
            navToggle.classList.toggle('active', shouldOpen);
            navToggle.setAttribute('aria-expanded', shouldOpen.toString());
            
            // Enhanced hamburger animation
            updateHamburgerAnimation(shouldOpen);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = shouldOpen ? 'hidden' : '';
            
            // Add backdrop for mobile menu
            if (shouldOpen) {
                createMenuBackdrop();
            } else {
                removeMenuBackdrop();
            }
            
            // Focus management for accessibility
            if (shouldOpen) {
                navList.focus();
            } else {
                navToggle.focus();
            }
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
        
        // Enhanced touch event handling
        navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
        
        // Improved touch responsiveness
        navToggle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            navToggle.style.transform = 'scale(0.95)';
        }, { passive: false });
        
        navToggle.addEventListener('touchend', (e) => {
            e.preventDefault();
            navToggle.style.transform = 'scale(1)';
            toggleMenu();
        }, { passive: false });
        
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
        
        // Mobile performance optimizations
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Re-enable swipe listeners if switching to mobile
                if (window.innerWidth <= 768 && !document.mobileListenersAdded) {
                    document.addEventListener('touchstart', handleTouchStart, { passive: true });
                    document.addEventListener('touchmove', handleTouchMove, { passive: false });
                    document.addEventListener('touchend', handleTouchEnd, { passive: true });
                    document.mobileListenersAdded = true;
                }
                // Remove listeners if switching to desktop
                else if (window.innerWidth > 768 && document.mobileListenersAdded) {
                    document.removeEventListener('touchstart', handleTouchStart);
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleTouchEnd);
                    document.mobileListenersAdded = false;
                }
                
                // Close menu if resizing to desktop
                if (window.innerWidth > 768 && isMenuOpen) {
                    toggleMenu(false);
                }
            }, 150);
        });
        
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
            // Add haptic feedback support for supported devices
            function triggerHapticFeedback(type = 'light') {
                if (navigator.vibrate) {
                    switch(type) {
                        case 'light':
                            navigator.vibrate(10);
                            break;
                        case 'medium':
                            navigator.vibrate(25);
                            break;
                        case 'heavy':
                            navigator.vibrate(50);
                            break;
                    }
                }
            }
            
            // Add haptic feedback to navigation interactions
            navToggle.addEventListener('touchstart', () => triggerHapticFeedback('light'));
            navList.querySelectorAll('a').forEach(link => {
                link.addEventListener('touchstart', () => triggerHapticFeedback('light'));
            });
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
        
        // Orientation change handling
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (isMenuOpen) {
                    // Adjust menu position after orientation change
                    navList.style.maxHeight = `calc(100vh - ${header.offsetHeight}px)`;
                }
            }, 100);
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

    // Copy Code Functionality
    function addCopyButtons() {
        const codeBlocks = document.querySelectorAll('.code-block pre');
        
        codeBlocks.forEach(block => {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = '복사';
            copyBtn.setAttribute('aria-label', '코드 복사');
            
            copyBtn.addEventListener('click', async () => {
                const code = block.textContent;
                
                try {
                    await navigator.clipboard.writeText(code);
                    copyBtn.textContent = '복사됨!';
                    copyBtn.style.background = 'rgba(72, 187, 120, 0.8)';
                    
                    setTimeout(() => {
                        copyBtn.textContent = '복사';
                        copyBtn.style.background = 'rgba(255,255,255,0.1)';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy code: ', err);
                    copyBtn.textContent = '실패';
                    setTimeout(() => {
                        copyBtn.textContent = '복사';
                    }, 2000);
                }
            });
            
            block.parentElement.style.position = 'relative';
            block.parentElement.appendChild(copyBtn);
        });
    }

    // Add copy buttons to code blocks
    addCopyButtons();

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
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
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

// Export utilities for use in other scripts
window.SuperClaudeUtils = utils;