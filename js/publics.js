/**
 * COACH APA'R - MAIN JAVASCRIPT
 * Interactions et fonctionnalités principales
 */

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initNavbar();
    initAccordion();
    initScrollReveal();
    initSmoothScroll();
    initThemeToggle();
    console.log('🚀 Coach APA\'R website initialized');
});

// ============================================
// NAVBAR
// ============================================

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    const navbarLinks = document.querySelectorAll('.navbar-link');

    if (!navbar) return;

    // Scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Menu mobile : ouverture, fermeture, états accessibles
    function setMenu(open, returnFocus) {
        if (!navbarToggle || !navbarMenu) return;
        navbarMenu.classList.toggle('open', open);
        navbarToggle.setAttribute('aria-expanded', String(open));
        navbarToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
        const icon = navbarToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !open);
            icon.classList.toggle('fa-times', open);
        }
        if (!open && returnFocus) navbarToggle.focus();
    }

    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', function() {
            setMenu(!navbarMenu.classList.contains('open'));
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navbarMenu.classList.contains('open')) setMenu(false, true);
        });
    }

    // Fermer le menu mobile au clic sur un lien
    if (navbarMenu) {
        navbarMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                setMenu(false);
            });
        });
    }

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navbarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
}

// ============================================
// ACCORDION (FAQ)
// ============================================

function initAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');

        if (header) {
            header.addEventListener('click', function() {
                const isActive = item.classList.contains('active');

                // Close all items
                accordionItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const content = otherItem.querySelector('.accordion-content');
                    if (content) {
                        content.style.maxHeight = null;
                    }
                });

                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                    const content = item.querySelector('.accordion-content');
                    if (content) {
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                }
            });
        }
    });
}

// ============================================
// SCROLL REVEAL
// ============================================

function initScrollReveal() {
    const revealElements = document.querySelectorAll('[data-scroll-reveal]');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // Auto-add scroll reveal to cards
    const cards = document.querySelectorAll('.card, .service-card, .pathology-card, .testimonial-card, .pricing-card');
    cards.forEach((card, index) => {
        if (!card.hasAttribute('data-scroll-reveal')) {
            card.setAttribute('data-scroll-reveal', '');
            card.style.transitionDelay = `${index * 0.1}s`;
        }
        revealObserver.observe(card);
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if href is just "#"
            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 80; // 80px for navbar height

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Hero scroll button
    const heroScroll = document.querySelector('.hero-scroll');
    if (heroScroll) {
        heroScroll.addEventListener('click', function() {
            const nextSection = document.querySelector('.trust-bar') || document.querySelector('.section-differentiation');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// ============================================
// THEME TOGGLE (Dark Mode)
// ============================================

function initThemeToggle() {
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Create theme toggle button if it doesn't exist
    let themeToggle = document.querySelector('.theme-toggle');

    if (!themeToggle) {
        themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', 'Toggle theme');
        themeToggle.innerHTML = currentTheme === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
        document.body.appendChild(themeToggle);
    }

    themeToggle.addEventListener('click', function() {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update icon
        const icon = themeToggle.querySelector('i');
        if (newTheme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
