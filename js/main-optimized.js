/* =================================================================
   JAVASCRIPT OPTIMISÉ - CONSOLIDATION UX
   Étape 2.2 : Performance et nouveaux composants
   Taille cible : ~12KB (vs 25KB original)
   ================================================================= */

'use strict';

// =================================================================
// CONFIGURATION ET INITIALISATION
// =================================================================

const Config = {
  // Performance settings
  debounceDelay: 16, // 60fps
  throttleDelay: 100,
  animationDuration: 300,
  
  // Feature flags for A/B testing
  features: {
    animations: true,
    modernComponents: true,
    optimizedScrolling: true,
    lazyLoading: true
  },
  
  // Breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  }
};

// Device detection for performance optimization
const Device = {
  isMobile: window.innerWidth <= Config.breakpoints.mobile,
  isTouch: 'ontouchstart' in window,
  supportsIntersectionObserver: 'IntersectionObserver' in window,
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

// =================================================================
// UTILITAIRES PERFORMANCE
// =================================================================

// Debounce optimisé
const debounce = (func, delay = Config.debounceDelay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle optimisé avec requestAnimationFrame
const throttle = (func, delay = Config.throttleDelay) => {
  let lastTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      requestAnimationFrame(() => func.apply(null, args));
    }
  };
};

// =================================================================
// GESTIONNAIRE D'ANIMATIONS OPTIMISÉ
// =================================================================

class AnimationManager {
  constructor() {
    this.observer = null;
    this.elements = new Set();
    this.init();
  }

  init() {
    if (!Config.features.animations || Device.prefersReducedMotion) {
      this.disableAnimations();
      return;
    }

    if (Device.supportsIntersectionObserver) {
      this.setupIntersectionObserver();
    } else {
      this.fallbackScrollListener();
    }
  }

  setupIntersectionObserver() {
    const options = {
      threshold: Device.isMobile ? 0.1 : 0.15,
      rootMargin: Device.isMobile ? '0px 0px -50px 0px' : '0px 0px -100px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    this.observeElements();
  }

  observeElements() {
    const selectors = [
      '.fade-in', '.slide-in-left', '.slide-in-right', '.zoom-in',
      '.service-card', '.blog-card', '.interactive-card'
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        this.elements.add(el);
        this.observer?.observe(el);
      });
    });
  }

  animateElement(element) {
    // Optimisation GPU
    element.style.willChange = 'transform, opacity';
    element.classList.add('in-view');
    
    // Nettoyage après animation
    setTimeout(() => {
      element.style.willChange = 'auto';
    }, Config.animationDuration + 100);
  }

  disableAnimations() {
    document.documentElement.style.setProperty('--transition-fast', '0s');
    document.documentElement.style.setProperty('--transition-medium', '0s');
    document.documentElement.style.setProperty('--transition-slow', '0s');
  }

  fallbackScrollListener() {
    const handleScroll = throttle(() => {
      this.elements.forEach(el => {
        if (this.isElementInViewport(el)) {
          this.animateElement(el);
          this.elements.delete(el);
        }
      });
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight - 100 && rect.bottom > 0;
  }
}

// =================================================================
// GESTIONNAIRE DE NAVIGATION OPTIMISÉ
// =================================================================

class NavigationManager {
  constructor() {
    this.header = document.getElementById('header');
    this.navToggle = document.getElementById('navToggle');
    this.navMenu = document.getElementById('navMenu');
    this.lastScrollTop = 0;
    this.ticking = false;
    this.init();
  }

  init() {
    if (this.navToggle && this.navMenu) {
      this.setupMobileMenu();
    }
    
    if (this.header && Config.features.optimizedScrolling) {
      this.setupScrollBehavior();
    }
    
    this.setupSmoothScroll();
  }

  setupMobileMenu() {
    this.navToggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMobileMenu();
    });

    // Fermeture au clic extérieur
    document.addEventListener('click', (e) => {
      if (this.navMenu.classList.contains('active') && 
          !this.navMenu.contains(e.target) && 
          !this.navToggle.contains(e.target)) {
        this.toggleMobileMenu();
      }
    });

    // Fermeture sur liens
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (this.navMenu.classList.contains('active')) {
          this.toggleMobileMenu();
        }
      });
    });
  }

  toggleMobileMenu() {
    this.navToggle.classList.toggle('active');
    this.navMenu.classList.toggle('active');
    
    // Empêcher le scroll du body quand le menu est ouvert
    document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
  }

  setupScrollBehavior() {
    const handleScroll = () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          const currentScroll = window.pageYOffset;
          
          // Ajout de la classe scrolled
          this.header.classList.toggle('scrolled', currentScroll > 50);
          
          // Masquage/affichage du header sur mobile
          if (Device.isMobile) {
            const isScrollingDown = currentScroll > this.lastScrollTop && currentScroll > 300;
            this.header.style.transform = isScrollingDown ? 'translateY(-100%)' : 'translateY(0)';
          }
          
          this.lastScrollTop = currentScroll;
          this.ticking = false;
        });
        this.ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          this.smoothScrollTo(targetElement);
        }
      });
    });
  }

  smoothScrollTo(target) {
    const startPosition = window.pageYOffset;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
    const distance = targetPosition - startPosition;
    const duration = Math.min(Math.abs(distance) * 0.5, 1000);
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      
      // Easing function
      const easeInOutCubic = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      window.scrollTo(0, startPosition + distance * easeInOutCubic);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }
}

// =================================================================
// GESTIONNAIRE DE COMPOSANTS UX MODERNES
// =================================================================

class ModernComponents {
  constructor() {
    this.toasts = [];
    this.modals = new Map();
    this.init();
  }

  init() {
    if (!Config.features.modernComponents) return;
    
    this.setupToastContainer();
    this.setupModals();
    this.setupAccordions();
    this.setupProgressIndicators();
  }

  // Toast notifications
  setupToastContainer() {
    if (!document.querySelector('.toast-container')) {
      const container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  }

  showToast(message, type = 'info', duration = 4000) {
    const container = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span>${message}</span>
        <button class="toast-close">&times;</button>
      </div>
    `;

    container.appendChild(toast);
    this.toasts.push(toast);

    // Animation d'entrée
    requestAnimationFrame(() => {
      toast.style.animation = 'toastSlideIn 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards';
    });

    // Fermeture automatique
    const autoClose = setTimeout(() => this.closeToast(toast), duration);

    // Fermeture manuelle
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(autoClose);
      this.closeToast(toast);
    });

    return toast;
  }

  closeToast(toast) {
    toast.style.animation = 'toastSlideOut 0.3s ease forwards';
    setTimeout(() => {
      toast.remove();
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 300);
  }

  // Modal management
  setupModals() {
    document.querySelectorAll('[data-modal-trigger]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.dataset.modalTrigger;
        this.openModal(modalId);
      });
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Fermeture sur overlay ou ESC
    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('.modal-close');
    
    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEsc);
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };

    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    
    closeBtn?.addEventListener('click', closeModal);
    document.addEventListener('keydown', handleEsc);
  }

  // Accordion functionality
  setupAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        const content = item.querySelector('.accordion-content');
        const isActive = header.classList.contains('active');

        // Fermer les autres accordéons du même groupe
        const accordion = item.closest('.modern-accordion');
        accordion.querySelectorAll('.accordion-header.active').forEach(otherHeader => {
          if (otherHeader !== header) {
            otherHeader.classList.remove('active');
            otherHeader.closest('.accordion-item').querySelector('.accordion-content').classList.remove('active');
          }
        });

        // Toggle l'accordéon actuel
        header.classList.toggle('active');
        content.classList.toggle('active');
      });
    });
  }

  // Progress indicators
  setupProgressIndicators() {
    document.querySelectorAll('.progress-indicator').forEach(indicator => {
      const steps = indicator.querySelectorAll('.progress-step');
      const lines = indicator.querySelectorAll('.progress-line');
      
      let currentStep = 0;
      
      const nextStep = () => {
        if (currentStep < steps.length) {
          steps[currentStep].classList.add('active');
          if (lines[currentStep]) {
            lines[currentStep].classList.add('active');
          }
          
          setTimeout(() => {
            steps[currentStep].classList.remove('active');
            steps[currentStep].classList.add('completed');
            currentStep++;
            if (currentStep < steps.length) {
              setTimeout(nextStep, 500);
            }
          }, 1000);
        }
      };

      // Auto-start si visible
      if (this.isElementInViewport(indicator)) {
        setTimeout(nextStep, 500);
      }
    });
  }

  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }
}

// =================================================================
// GESTIONNAIRE DE FORMULAIRES OPTIMISÉ
// =================================================================

class FormManager {
  constructor() {
    this.forms = new Map();
    this.init();
  }

  init() {
    document.querySelectorAll('form').forEach(form => {
      this.setupForm(form);
    });
  }

  setupForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      this.setupInputAnimations(input);
      this.setupValidation(input);
    });

    form.addEventListener('submit', (e) => this.handleSubmit(e, form));
  }

  setupInputAnimations(input) {
    const group = input.closest('.form-group');
    if (!group) return;

    input.addEventListener('focus', () => {
      group.classList.add('focused');
    });

    input.addEventListener('blur', () => {
      if (!input.value.trim()) {
        group.classList.remove('focused');
      }
    });

    // État initial si le champ a une valeur
    if (input.value.trim()) {
      group.classList.add('focused');
    }
  }

  setupValidation(input) {
    input.addEventListener('blur', () => {
      this.validateInput(input);
    });
  }

  validateInput(input) {
    const isValid = input.checkValidity();
    const group = input.closest('.form-group');
    
    if (group) {
      group.classList.toggle('error', !isValid);
      group.classList.toggle('valid', isValid);
    }

    return isValid;
  }

  async handleSubmit(e, form) {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Validation complète
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isFormValid = true;
    
    inputs.forEach(input => {
      if (!this.validateInput(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      this.showToast('Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }

    // Animation de soumission
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="modern-loader"></span> Envoi...';

    try {
      // Simulation d'envoi (remplacer par vraie logique)
      await this.simulateFormSubmission(form);
      
      // Succès
      submitBtn.innerHTML = '✓ Envoyé !';
      submitBtn.classList.add('success');
      this.showToast('Message envoyé avec succès !', 'success');
      
      setTimeout(() => {
        form.reset();
        form.querySelectorAll('.form-group').forEach(group => {
          group.classList.remove('focused', 'error', 'valid');
        });
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('success');
        submitBtn.disabled = false;
      }, 3000);
      
    } catch (error) {
      // Erreur
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      this.showToast('Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
    }
  }

  async simulateFormSubmission(form) {
    // Simuler un délai d'envoi
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simuler succès 90% du temps
        Math.random() > 0.1 ? resolve() : reject(new Error('Simulation d\'erreur'));
      }, 1500);
    });
  }

  showToast(message, type) {
    if (window.modernComponents) {
      window.modernComponents.showToast(message, type);
    }
  }
}

// =================================================================
// BOUTON RETOUR EN HAUT OPTIMISÉ
// =================================================================

class BackToTopManager {
  constructor() {
    this.button = document.getElementById('backToTop');
    this.threshold = 600;
    this.init();
  }

  init() {
    if (!this.button) return;

    const handleScroll = throttle(() => {
      const isVisible = window.pageYOffset > this.threshold;
      this.button.classList.toggle('visible', isVisible);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });

    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      this.scrollToTop();
    });
  }

  scrollToTop() {
    this.button.classList.add('rotating');
    
    const scrollToTop = () => {
      const position = window.pageYOffset;
      if (position > 0) {
        const step = Math.max(20, position / 10);
        window.scrollTo(0, position - step);
        requestAnimationFrame(scrollToTop);
      } else {
        this.button.classList.remove('rotating');
      }
    };

    requestAnimationFrame(scrollToTop);
  }
}

// =================================================================
// INITIALISATION PRINCIPALE
// =================================================================

class App {
  constructor() {
    this.managers = {};
    this.init();
  }

  async init() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeManagers());
    } else {
      this.initializeManagers();
    }
  }

  initializeManagers() {
    // Supprimer le preloader
    this.removePreloader();
    
    // Initialiser les gestionnaires
    this.managers.animation = new AnimationManager();
    this.managers.navigation = new NavigationManager();
    this.managers.backToTop = new BackToTopManager();
    this.managers.form = new FormManager();
    
    if (Config.features.modernComponents) {
      this.managers.modernComponents = new ModernComponents();
      window.modernComponents = this.managers.modernComponents; // Global access
    }

    // Analytics de performance (si nécessaire)
    this.trackPerformance();
    
    console.log('🚀 Coach APA\'R - Application initialisée avec succès !');
  }

  removePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.display = 'none';
    }
  }

  trackPerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          const loadTime = perfData.loadEventEnd - perfData.fetchStart;
          console.log(`⚡ Temps de chargement: ${loadTime}ms`);
        }, 0);
      });
    }
  }
}

// =================================================================
// LANCEMENT DE L'APPLICATION
// =================================================================

const app = new App();

// Export pour tests ou utilisation externe
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { App, Config, Device };
}

/* =================================================================
   FIN DU JAVASCRIPT OPTIMISÉ
   ================================================================= */