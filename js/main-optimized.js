/* ==========================================================================
   PHASE 3.3 - ACCESSIBILITY & SEO JAVASCRIPT OPTIMIZATIONS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Variables globales pour les animations
    const isMobile = window.innerWidth <= 768;
    let lastScrollTop = 0;
    let ticking = false;

    // Initialisation de toutes les fonctionnalités
    initPreloader();
    initAccessibleMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initHeroEffects();
    initServiceCards();
    initTestimonialSlider();
    initCounters();
    initContactForm();
    initHeaderAnimation();
    initSocialIcons();
    initTypingEffect();
    initBackToTop();
    initParticles();
    initMorphingBackground();
    init3DLogos();
    initFaqAccordion();
    initCoursesSlider();
    initAccessibilityFeatures();
    initReducedMotionSupport();

    // ==========================================================================
    // ACCESSIBILITY FEATURES
    // ==========================================================================
    
    function initAccessibilityFeatures() {
        // Skip to content functionality
        const skipLink = document.querySelector('.skip-to-content');
        if (skipLink) {
            skipLink.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector('#main-content');
                if (target) {
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                    target.removeAttribute('tabindex');
                }
            });
        }

        // Announce page changes for screen readers
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.id = 'announcer';
        document.body.appendChild(announcer);

        // Focus management for modal/popup content
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });

        // Keyboard navigation enhancements
        enhanceKeyboardNavigation();
    }

    function enhanceKeyboardNavigation() {
        // Improve keyboard navigation for custom dropdowns
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            const items = dropdown.querySelectorAll('.dropdown-item');
            
            if (toggle && menu) {
                toggle.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleDropdown(dropdown, toggle, menu);
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        openDropdown(dropdown, toggle, menu);
                        if (items[0]) items[0].focus();
                    }
                });

                items.forEach((item, index) => {
                    item.addEventListener('keydown', function(e) {
                        if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            const nextItem = items[index + 1] || items[0];
                            nextItem.focus();
                        } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            const prevItem = items[index - 1] || items[items.length - 1];
                            prevItem.focus();
                        } else if (e.key === 'Escape') {
                            e.preventDefault();
                            closeDropdown(dropdown, toggle, menu);
                            toggle.focus();
                        }
                    });
                });
            }
        });
    }

    function initReducedMotionSupport() {
        // Check for user's motion preferences
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // Disable animations for users who prefer reduced motion
            document.body.classList.add('reduce-motion');
            
            // Disable particle effects
            const particlesContainer = document.getElementById('particles');
            if (particlesContainer) {
                particlesContainer.style.display = 'none';
            }
            
            // Disable morphing background animations
            const morphingShapes = document.querySelectorAll('.morphing-shape');
            morphingShapes.forEach(shape => {
                shape.style.animation = 'none';
            });
        }
    }

    // ==========================================================================
    // ACCESSIBLE MOBILE MENU
    // ==========================================================================
    
    function initAccessibleMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (!navToggle || !navMenu) return;

        // Set initial ARIA states
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('aria-hidden', 'true');

        navToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Toggle ARIA states
            this.setAttribute('aria-expanded', !isExpanded);
            navMenu.setAttribute('aria-hidden', isExpanded);
            
            // Toggle classes
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Manage focus
            if (!isExpanded) {
                // Menu is opening
                const firstLink = navMenu.querySelector('.nav-link');
                if (firstLink) {
                    setTimeout(() => firstLink.focus(), 100);
                }
                
                // Trap focus within menu
                trapFocus(navMenu);
                
                // Announce to screen readers
                announceToScreenReader('Menu ouvert');
            } else {
                // Menu is closing
                this.focus();
                removeFocusTrap();
                announceToScreenReader('Menu fermé');
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navToggle.click();
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(event.target) && 
                !navToggle.contains(event.target)) {
                navToggle.click();
            }
        });
    }

    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    function removeFocusTrap() {
        // Remove focus trap event listeners
        // This is a simplified version - in production, you'd store the listener reference
        const navMenu = document.getElementById('navMenu');
        if (navMenu) {
            navMenu.replaceWith(navMenu.cloneNode(true));
        }
    }

    function announceToScreenReader(message) {
        const announcer = document.getElementById('announcer');
        if (announcer) {
            announcer.textContent = message;
        }
    }

    // ==========================================================================
    // PRELOADER WITH ACCESSIBILITY
    // ==========================================================================
    
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;
        
        // Announce loading to screen readers
        announceToScreenReader('Chargement de la page en cours');
        
        window.addEventListener('load', function() {
            preloader.style.display = 'none';
            preloader.setAttribute('aria-hidden', 'true');
            
            // Announce completion
            announceToScreenReader('Page chargée');
            
            // Focus on main content
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
                setTimeout(() => mainContent.removeAttribute('tabindex'), 100);
            }
        });
    }

    // ==========================================================================
    // SMOOTH SCROLL WITH ACCESSIBILITY
    // ==========================================================================
    
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Check for reduced motion preference
                    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                    
                    if (prefersReducedMotion) {
                        // Instant scroll for users who prefer reduced motion
                        targetElement.scrollIntoView();
                    } else {
                        // Smooth scroll for others
                        targetElement.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                    
                    // Set focus for keyboard users
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                    targetElement.removeAttribute('tabindex');
                    
                    // Announce navigation
                    const heading = targetElement.querySelector('h1, h2, h3');
                    if (heading) {
                        announceToScreenReader(`Navigation vers ${heading.textContent}`);
                    }
                }
            });
        });
    }

    // ==========================================================================
    // ACCESSIBLE SCROLL ANIMATIONS
    // ==========================================================================
    
    function initScrollAnimations() {
        const elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .zoom-in');
        
        if (!elements.length) return;
        
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // Show all elements immediately for users who prefer reduced motion
            elements.forEach(element => {
                element.classList.add('in-view');
                element.style.opacity = '1';
                element.style.transform = 'none';
            });
            return;
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -100px 0px'
        });
        
        elements.forEach(element => {
            observer.observe(element);
        });
    }

    // ==========================================================================
    // ACCESSIBLE CAROUSEL/SLIDER
    // ==========================================================================
    
    function initCoursesSlider() {
        const slides = document.querySelectorAll('.course-slide');
        const dots = document.querySelectorAll('.slide-dot');
        let currentSlide = 0;
        let slideInterval;
        let isPlaying = true;

        if (!slides.length || !dots.length) return;

        // Add pause/play button for accessibility
        const sliderContainer = document.getElementById('coursesSlider');
        const pauseButton = document.createElement('button');
        pauseButton.innerHTML = '<i class="fas fa-pause" aria-hidden="true"></i>';
        pauseButton.setAttribute('aria-label', 'Mettre en pause le carrousel');
        pauseButton.className = 'slider-pause-btn';
        pauseButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            z-index: 10;
        `;
        sliderContainer.appendChild(pauseButton);

        function showSlide(index) {
            // Hide all slides
            slides.forEach((slide, i) => {
                slide.style.display = i === index ? 'block' : 'none';
                slide.setAttribute('aria-hidden', i !== index);
            });
            
            // Update dots
            dots.forEach((dot, i) => {
                dot.setAttribute('aria-selected', i === index);
                dot.classList.toggle('active', i === index);
            });
            
            currentSlide = index;
            
            // Announce slide change
            const slideTitle = slides[index].querySelector('h3');
            if (slideTitle) {
                announceToScreenReader(`Diapositive ${index + 1} sur ${slides.length}: ${slideTitle.textContent}`);
            }
        }

        function nextSlide() {
            let nextIndex = currentSlide + 1;
            if (nextIndex >= slides.length) {
                nextIndex = 0;
            }
            showSlide(nextIndex);
        }

        function startAutoSlide() {
            if (!isPlaying) return;
            slideInterval = setInterval(nextSlide, 7000);
        }

        function stopAutoSlide() {
            clearInterval(slideInterval);
        }

        // Pause/play functionality
        pauseButton.addEventListener('click', function() {
            if (isPlaying) {
                stopAutoSlide();
                isPlaying = false;
                this.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i>';
                this.setAttribute('aria-label', 'Reprendre le carrousel');
                announceToScreenReader('Carrousel mis en pause');
            } else {
                startAutoSlide();
                isPlaying = true;
                this.innerHTML = '<i class="fas fa-pause" aria-hidden="true"></i>';
                this.setAttribute('aria-label', 'Mettre en pause le carrousel');
                announceToScreenReader('Carrousel repris');
            }
        });

        // Dot navigation with keyboard support
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                stopAutoSlide();
                showSlide(index);
                if (isPlaying) startAutoSlide();
            });

            dot.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Keyboard navigation for slides
        sliderContainer.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                stopAutoSlide();
                const prevIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
                showSlide(prevIndex);
                if (isPlaying) startAutoSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                stopAutoSlide();
                nextSlide();
                if (isPlaying) startAutoSlide();
            }
        });

        // Pause on hover/focus
        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', () => {
            if (isPlaying) startAutoSlide();
        });

        sliderContainer.addEventListener('focusin', stopAutoSlide);
        sliderContainer.addEventListener('focusout', () => {
            if (isPlaying) startAutoSlide();
        });

        // Initialize
        showSlide(0);
        startAutoSlide();
    }

    // ==========================================================================
    // ORIGINAL FUNCTIONS (Preserved for compatibility)
    // ==========================================================================
    
    function initHeroEffects() {
        const hero = document.querySelector('.hero');
        const heroImage = document.querySelector('.hero-image');
        const heroContent = document.querySelector('.hero-content');
        
        if (!hero || !heroImage || !heroContent) return;
        
        window.addEventListener('scroll', function() {
            const scrollPosition = window.pageYOffset;
            if (scrollPosition < window.innerHeight) {
                const opacity = 1 - scrollPosition / (window.innerHeight * 0.7);
                heroContent.style.opacity = opacity;
            }
        });
    }

    function initServiceCards() {
        const serviceCards = document.querySelectorAll('.service-card');
        
        if (!serviceCards.length) return;
        
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) translateX(0)';
        });
    }

    function initTestimonialSlider() {
        // Testimonial slider implementation would go here
        // Simplified for this example
    }

    function initCounters() {
        // Counter animation implementation
    }

    function initContactForm() {
        // Contact form enhancement implementation
    }

    function initHeaderAnimation() {
        const header = document.getElementById('header');
        
        if (!header) return;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    const currentScroll = window.pageYOffset;
                    
                    if (currentScroll > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    
                    if (currentScroll > lastScrollTop && currentScroll > 300) {
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        header.style.transform = 'translateY(0)';
                    }
                    
                    lastScrollTop = currentScroll;
                    ticking = false;
                });
                
                ticking = true;
            }
        });
    }

    function initSocialIcons() {
        // Social icons animation implementation
    }

    function initTypingEffect() {
        const typedElement = document.querySelector('.hero .typed-text');
        if (!typedElement) return;
        
        typedElement.textContent = "l'activité physique adaptée";
        typedElement.style.display = 'block';
        typedElement.style.visibility = 'visible';
        typedElement.style.opacity = '1';
    }

    function initBackToTop() {
        const backToTop = document.getElementById('backToTop');
        
        if (!backToTop) return;
        
        // Add proper ARIA label
        backToTop.setAttribute('aria-label', 'Retour en haut de page');
        
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 600) {
                backToTop.classList.add('visible');
                backToTop.setAttribute('aria-hidden', 'false');
            } else {
                backToTop.classList.remove('visible');
                backToTop.setAttribute('aria-hidden', 'true');
            }
        });
        
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check for reduced motion preference
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            if (prefersReducedMotion) {
                window.scrollTo(0, 0);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            
            // Announce action
            announceToScreenReader('Retour en haut de page');
            
            // Focus on main content
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
                mainContent.removeAttribute('tabindex');
            }
        });
    }

    function initParticles() {
        const particlesContainer = document.getElementById('particles');
        
        if (!particlesContainer) return;
        
        // Check for reduced motion and disable if preferred
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            particlesContainer.style.display = 'none';
            return;
        }
        
        // Particles implementation for non-reduced motion users
        const numberOfParticles = isMobile ? 25 : 50; // Fewer particles on mobile
        
        for (let i = 0; i < numberOfParticles; i++) {
            createParticle();
        }

        function createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.setAttribute('aria-hidden', 'true'); // Hide from screen readers
            
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = Math.random() * 5 + 2;
            
            particle.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                pointer-events: none;
                animation: floatParticle ${Math.random() * 5 + 3}s linear infinite;
            `;
            
            particlesContainer.appendChild(particle);
            
            particle.addEventListener('animationend', () => {
                particle.remove();
                createParticle();
            });
        }
    }

    function initMorphingBackground() {
        const shapes = document.querySelectorAll('.morphing-shape');
        
        if (!shapes.length) return;
        
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            shapes.forEach(shape => {
                shape.style.animation = 'none';
            });
            return;
        }
        
        shapes.forEach(shape => {
            shape.setAttribute('aria-hidden', 'true'); // Hide from screen readers
            const delay = Math.random() * 5;
            const duration = Math.random() * 10 + 20;
            
            shape.style.animationDelay = `${delay}s`;
            shape.style.animationDuration = `${duration}s`;
        });
    }

    function init3DLogos() {
        // 3D logo effects implementation
    }

    function initFaqAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        if (!faqItems.length) return;
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (question && answer) {
                // Add proper ARIA attributes
                const questionId = 'faq-question-' + Math.random().toString(36).substr(2, 9);
                const answerId = 'faq-answer-' + Math.random().toString(36).substr(2, 9);
                
                question.setAttribute('id', questionId);
                question.setAttribute('aria-expanded', 'false');
                question.setAttribute('aria-controls', answerId);
                
                answer.setAttribute('id', answerId);
                answer.setAttribute('aria-labelledby', questionId);
                answer.setAttribute('aria-hidden', 'true');
                
                question.addEventListener('click', () => {
                    const isExpanded = question.getAttribute('aria-expanded') === 'true';
                    
                    // Close all other items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            const otherQuestion = otherItem.querySelector('.faq-question');
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            if (otherQuestion && otherAnswer) {
                                otherQuestion.setAttribute('aria-expanded', 'false');
                                otherAnswer.setAttribute('aria-hidden', 'true');
                                otherItem.classList.remove('active');
                            }
                        }
                    });
                    
                    // Toggle current item
                    question.setAttribute('aria-expanded', !isExpanded);
                    answer.setAttribute('aria-hidden', isExpanded);
                    item.classList.toggle('active');
                    
                    // Announce to screen readers
                    const questionText = question.querySelector('h3').textContent;
                    announceToScreenReader(`${questionText} ${!isExpanded ? 'développé' : 'réduit'}`);
                });
                
                // Keyboard support
                question.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        question.click();
                    }
                });
            }
        });
    }

    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================
    
    function closeAllModals() {
        // Close any open modals, dropdowns, etc.
        const activeDropdowns = document.querySelectorAll('.dropdown.active');
        activeDropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        if (navMenu && navMenu.classList.contains('active')) {
            navToggle.click();
        }
    }

    function toggleDropdown(dropdown, toggle, menu) {
        const isOpen = menu.classList.contains('active');
        if (isOpen) {
            closeDropdown(dropdown, toggle, menu);
        } else {
            openDropdown(dropdown, toggle, menu);
        }
    }

    function openDropdown(dropdown, toggle, menu) {
        menu.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
    }

    function closeDropdown(dropdown, toggle, menu) {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
    }
});