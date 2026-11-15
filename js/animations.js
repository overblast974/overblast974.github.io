/**
 * COACH APA'R - ANIMATIONS
 * Animations GSAP avancées
 */

// Attendre que GSAP soit chargé
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // ============================================
    // HERO ANIMATIONS
    // ============================================

    function initHeroAnimations() {
        // Animate hero content elements
        const heroTimeline = gsap.timeline({
            defaults: { ease: 'power3.out', duration: 1 }
        });

        heroTimeline
            .from('.hero-badge', {
                y: 30,
                opacity: 0,
                duration: 0.8
            })
            .from('.hero-title', {
                y: 50,
                opacity: 0,
                duration: 1
            }, '-=0.5')
            .from('.hero-description', {
                y: 30,
                opacity: 0,
                duration: 0.8
            }, '-=0.7')
            .from('.hero-cta .btn', {
                y: 30,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8
            }, '-=0.6')
            .from('.hero-trust .trust-item', {
                y: 20,
                opacity: 0,
                stagger: 0.1,
                duration: 0.6
            }, '-=0.4');

        // Animate shapes
        gsap.to('.shape', {
            rotation: 360,
            duration: 20,
            repeat: -1,
            ease: 'none'
        });
    }

    // ============================================
    // SCROLL TRIGGERED ANIMATIONS
    // ============================================

    function initScrollAnimations() {
        // Trust bar animation
        gsap.from('.certification-badge', {
            scrollTrigger: {
                trigger: '.trust-bar',
                start: 'top 80%'
            },
            y: 30,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6
        });

        // Section headers
        gsap.utils.toArray('.section-header').forEach(header => {
            gsap.from(header.children, {
                scrollTrigger: {
                    trigger: header,
                    start: 'top 80%'
                },
                y: 50,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8
            });
        });

        // Comparison table rows
        gsap.from('.comparison-row', {
            scrollTrigger: {
                trigger: '.comparison-table',
                start: 'top 70%'
            },
            x: -50,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6
        });

        // Stats cards
        gsap.from('.stat-card', {
            scrollTrigger: {
                trigger: '.section-stats',
                start: 'top 70%'
            },
            scale: 0.8,
            opacity: 0,
            stagger: 0.15,
            duration: 0.6
        });

        // Service cards with 3D effect
        gsap.from('.service-card', {
            scrollTrigger: {
                trigger: '.section-services',
                start: 'top 70%'
            },
            y: 60,
            opacity: 0,
            rotationX: 15,
            stagger: 0.2,
            duration: 0.8
        });

        // Pathology cards
        gsap.from('.pathology-card', {
            scrollTrigger: {
                trigger: '.section-pathologies',
                start: 'top 70%'
            },
            y: 50,
            opacity: 0,
            stagger: 0.15,
            duration: 0.7
        });

        // Timeline items
        gsap.from('.timeline-item', {
            scrollTrigger: {
                trigger: '.timeline',
                start: 'top 70%'
            },
            x: -100,
            opacity: 0,
            stagger: 0.3,
            duration: 0.8
        });

        // Testimonials
        gsap.from('.testimonial-card', {
            scrollTrigger: {
                trigger: '.section-testimonials',
                start: 'top 70%'
            },
            y: 60,
            opacity: 0,
            stagger: 0.2,
            duration: 0.8
        });

        // Pricing cards
        gsap.from('.pricing-card', {
            scrollTrigger: {
                trigger: '.section-pricing',
                start: 'top 70%'
            },
            y: 80,
            opacity: 0,
            scale: 0.9,
            stagger: 0.2,
            duration: 0.8
        });

        // Highlight the best choice pricing card
        const highlightCard = document.querySelector('.pricing-card-highlight');
        if (highlightCard) {
            gsap.to(highlightCard, {
                scrollTrigger: {
                    trigger: '.section-pricing',
                    start: 'top 60%'
                },
                scale: 1.05,
                duration: 0.6,
                ease: 'back.out(1.7)'
            });
        }

        // FAQ accordion items
        gsap.from('.accordion-item', {
            scrollTrigger: {
                trigger: '.section-faq',
                start: 'top 70%'
            },
            x: -50,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6
        });

        // Contact methods
        gsap.from('.contact-method', {
            scrollTrigger: {
                trigger: '.section-contact',
                start: 'top 70%'
            },
            y: 50,
            opacity: 0,
            stagger: 0.15,
            duration: 0.7
        });

        // Footer sections
        gsap.from('.footer-section', {
            scrollTrigger: {
                trigger: '.footer',
                start: 'top 80%'
            },
            y: 40,
            opacity: 0,
            stagger: 0.15,
            duration: 0.6
        });
    }

    // ============================================
    // HOVER EFFECTS
    // ============================================

    function initHoverEffects() {
        // Service cards 3D tilt effect
        const serviceCards = document.querySelectorAll('.service-card');

        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                gsap.to(this, {
                    scale: 1.03,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', function() {
                gsap.to(this, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });

        // Buttons magnetic effect
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-accent');

        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                gsap.to(this, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: 'back.out(1.7)'
                });
            });

            button.addEventListener('mouseleave', function() {
                gsap.to(this, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });

        // Badge hover effects
        const badges = document.querySelectorAll('.badge');

        badges.forEach(badge => {
            badge.addEventListener('mouseenter', function() {
                gsap.to(this, {
                    scale: 1.1,
                    duration: 0.2,
                    ease: 'back.out(2)'
                });
            });

            badge.addEventListener('mouseleave', function() {
                gsap.to(this, {
                    scale: 1,
                    duration: 0.2
                });
            });
        });
    }

    // ============================================
    // PARALLAX EFFECTS
    // ============================================

    function initParallaxEffects() {
        // Hero shapes parallax
        gsap.to('.shape-1', {
            y: 100,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            }
        });

        gsap.to('.shape-2', {
            y: -80,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            }
        });

        gsap.to('.shape-3', {
            y: 50,
            rotation: 90,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            }
        });

        // Section titles parallax
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.to(title, {
                y: 30,
                scrollTrigger: {
                    trigger: title,
                    start: 'top 80%',
                    end: 'top 20%',
                    scrub: 1
                }
            });
        });
    }

    // ============================================
    // FLOATING CTA BUTTON
    // ============================================

    function initFloatingCta() {
        const floatingBtn = document.querySelector('.btn-floating');

        if (floatingBtn) {
            // Show/hide based on scroll
            ScrollTrigger.create({
                start: 'top -100',
                end: 'max',
                onUpdate: (self) => {
                    if (self.direction === -1) {
                        // Scrolling up
                        gsap.to(floatingBtn, { opacity: 1, scale: 1, duration: 0.3 });
                    } else {
                        // Scrolling down
                        gsap.to(floatingBtn, { opacity: 0, scale: 0.8, duration: 0.3 });
                    }
                }
            });

            // Pulse animation
            gsap.to(floatingBtn, {
                scale: 1.1,
                duration: 0.8,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut'
            });
        }
    }

    // ============================================
    // INIT ALL ANIMATIONS
    // ============================================

    document.addEventListener('DOMContentLoaded', function() {
        initHeroAnimations();
        initScrollAnimations();
        initHoverEffects();
        initParallaxEffects();
        initFloatingCta();

        console.log('✨ GSAP animations initialized');
    });

} else {
    console.warn('⚠️ GSAP not loaded. Animations disabled.');
}
