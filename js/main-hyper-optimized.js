/* =================================================================
   JAVASCRIPT FINAL ULTRA-OPTIMISÉ - PHASE 3.1
   Version de production avec toutes optimisations
   Taille cible : <15KB compressé
   ================================================================= */

'use strict';

// =================================================================
// CONFIGURATION OPTIMISÉE FINALE
// =================================================================

const CONFIG = {
  // Performance ultra-optimisée
  DEBOUNCE: 16,     // 60fps
  THROTTLE: 100,    // Smooth scrolling
  ANIMATION: 300,   // Standard duration
  
  // Feature detection
  FEATURES: {
    animations: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    webp: (() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })(),
    intersectionObserver: 'IntersectionObserver' in window,
    passiveEvents: (() => {
      let passive = false;
      try {
        const opts = Object.defineProperty({}, 'passive', {
          get() { passive = true; }
        });
        window.addEventListener('test', null, opts);
      } catch (e) {}
      return passive;
    })()
  },
  
  // Breakpoints optimisés
  BP: { mobile: 768, tablet: 1024, desktop: 1200 }
};

// Device detection ultra-rapide
const DEVICE = {
  mobile: window.innerWidth <= CONFIG.BP.mobile,
  touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  ios: /iPad|iPhone|iPod/.test(navigator.userAgent),
  android: /Android/.test(navigator.userAgent)
};

// =================================================================
// UTILITAIRES HAUTE PERFORMANCE
// =================================================================

// Cache pour éviter les recalculs
const CACHE = new Map();

// Debounce ultra-optimisé
const debounce = (fn, delay = CONFIG.DEBOUNCE, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) fn(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, delay);
    if (callNow) fn(...args);
  };
};

// Throttle avec RAF
const throttle = (fn, limit = CONFIG.THROTTLE) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// RAF helper optimisé
const raf = fn => window.requestAnimationFrame(fn);
const caf = id => window.cancelAnimationFrame(id);

// =================================================================
// GESTIONNAIRE D'ANIMATIONS ULTRA-OPTIMISÉ
// =================================================================

class HyperAnimationManager {
  constructor() {
    this.elements = new Set();
    this.observer = null;
    this.rafId = null;
    this.init();
  }

  init() {
    if (!CONFIG.FEATURES.animations) {
      this.disableAllAnimations();
      return;
    }

    if (CONFIG.FEATURES.intersectionObserver) {
      this.setupIntersectionObserver();
    } else {
      this.setupScrollFallback();
    }
  }

  setupIntersectionObserver() {
    const options = {
      threshold: DEVICE.mobile ? 0.05 : 0.1,
      rootMargin: DEVICE.mobile ? '0px 0px -30px 0px' : '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activateElement(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    this.observeElements();
  }

  observeElements() {
    const selectors = '.fade-in,.slide-in-left,.slide-in-right,.zoom-in,.interactive-card';
    document.querySelectorAll(selectors).forEach(el => {
      this.elements.add(el);
      this.observer?.observe(el);
    });
  }

  activateElement(el) {
    // GPU optimization
    el.style.willChange = 'transform, opacity';
    el.classList.add('in-view');
    
    // Cleanup après animation
    setTimeout(() => {
      el.style.willChange = 'auto';
    }, CONFIG.ANIMATION + 50);
  }

  setupScrollFallback() {
    const handleScroll = throttle(() => {
      this.elements.forEach(el => {
        if (this.isInViewport(el)) {
          this.activateElement(el);
          this.elements.delete(el);
        }
      });
    }, 100);

    window.addEventListener('scroll', handleScroll, {
      passive: CONFIG.FEATURES.passiveEvents
    });
  }

  isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight - 50 && rect.bottom > 0;
  }

  disableAllAnimations() {
    document.documentElement.style.setProperty('--transition-fast', '0s');
    document.documentElement.style.setProperty('--transition-medium', '0s');
    document.documentElement.style.setProperty('--transition-slow', '0s');
  }
}

// =================================================================
// NAVIGATION ULTRA-OPTIMISÉE
// =================================================================

class HyperNavManager {
  constructor() {
    this.header = document.getElementById('header');
    this.toggle = document.getElementById('navToggle');
    this.menu = document.getElementById('navMenu');
    this.lastScroll = 0;
    this.ticking = false;
    this.isMenuOpen = false;
    this.init();
  }

  init() {
    if (this.toggle && this.menu) this.setupMobileMenu();
    if (this.header) this.setupScrollBehavior();
    this.setupSmoothScroll();
  }

  setupMobileMenu() {
    this.toggle.addEventListener('click', e => {
      e.preventDefault();
      this.toggleMenu();
    }, { passive: false });

    // Fermeture optimisée
    document.addEventListener('click', e => {
      if (this.isMenuOpen && !this.menu.contains(e.target) && !this.toggle.contains(e.target)) {
        this.toggleMenu();
      }
    });

    // Auto-fermeture sur liens
    this.menu.addEventListener('click', e => {
      if (e.target.classList.contains('nav-link')) {
        this.toggleMenu();
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.toggle.classList.toggle('active', this.isMenuOpen);
    this.menu.classList.toggle('active', this.isMenuOpen);
    
    // Prévenir scroll body
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    
    // Optimisation focus
    if (this.isMenuOpen) {
      this.menu.querySelector('.nav-link')?.focus();
    }
  }

  setupScrollBehavior() {
    const handleScroll = () => {
      if (!this.ticking) {
        raf(() => {
          const currentScroll = window.pageYOffset;
          
          // Classe scrolled
          this.header.classList.toggle('scrolled', currentScroll > 50);
          
          // Auto-hide sur mobile seulement
          if (DEVICE.mobile && !this.isMenuOpen) {
            const isScrollingDown = currentScroll > this.lastScroll && currentScroll > 200;
            this.header.style.transform = isScrollingDown ? 'translateY(-100%)' : 'translateY(0)';
          }
          
          this.lastScroll = currentScroll;
          this.ticking = false;
        });
        this.ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, {
      passive: CONFIG.FEATURES.passiveEvents
    });
  }

  setupSmoothScroll() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (!target) return;
      
      e.preventDefault();
      this.smoothScrollTo(target);
    });
  }

  smoothScrollTo(target) {
    const start = window.pageYOffset;
    const targetPos = target.getBoundingClientRect().top + start - 80;
    const distance = targetPos - start;
    const duration = Math.min(Math.abs(distance) * 0.4, 800);
    let startTime = null;

    const animate = currentTime => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing optimisé
      const ease = progress < 0.5 
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      window.scrollTo(0, start + distance * ease);
      
      if (progress < 1) {
        raf(animate);
      }
    };

    raf(animate);
  }
}

// =================================================================
// LAZY LOADING ULTRA-OPTIMISÉ
// =================================================================

class HyperLazyLoader {
  constructor() {
    this.observer = null;
    this.images = new Set();
    this.init();
  }

  init() {
    if (CONFIG.FEATURES.intersectionObserver) {
      this.setupIntersectionObserver();
    } else {
      this.loadAllImages();
    }
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.01,
      rootMargin: '50px 0px'
    });

    this.observeImages();
  }

  observeImages() {
    const images = document.querySelectorAll('img[loading="lazy"], img[data-src]');
    images.forEach(img => {
      this.images.add(img);
      this.observer.observe(img);
    });
  }

  loadImage(img) {
    const src = img.dataset.src || img.src;
    
    if (img.dataset.src) {
      // WebP support
      if (CONFIG.FEATURES.webp && img.dataset.srcWebp) {
        img.src = img.dataset.srcWebp;
      } else {
        img.src = src;
      }
      
      img.onload = () => {
        img.classList.add('loaded');
        img.removeAttribute('data-src');
      };
    }
  }

  loadAllImages() {
    // Fallback pour navigateurs anciens
    this.images.forEach(img => this.loadImage(img));
  }
}

// =================================================================
// FORMULAIRES OPTIMISÉS
// =================================================================

class HyperFormManager {
  constructor() {
    this.forms = new Map();
    this.validators = new Map();
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
      this.setupInput(input);
    });

    form.addEventListener('submit', e => this.handleSubmit(e, form));
  }

  setupInput(input) {
    const group = input.closest('.form-group');
    if (!group) return;

    // Optimisation événements
    let focusTimer;
    
    input.addEventListener('focus', () => {
      clearTimeout(focusTimer);
      group.classList.add('focused');
    });

    input.addEventListener('blur', () => {
      focusTimer = setTimeout(() => {
        if (!input.value.trim()) {
          group.classList.remove('focused');
        }
        this.validateInput(input);
      }, 100);
    });

    // État initial
    if (input.value.trim()) {
      group.classList.add('focused');
    }
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
    
    // Validation ultra-rapide
    const isValid = [...form.querySelectorAll('input[required], textarea[required]')]
      .every(input => this.validateInput(input));

    if (!isValid) return;

    // Animation submit
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="modern-loader"></span> Envoi...';

    try {
      // Simulation envoi optimisée
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      submitBtn.innerHTML = '✓ Envoyé !';
      submitBtn.classList.add('success');
      
      setTimeout(() => {
        form.reset();
        form.querySelectorAll('.form-group').forEach(group => {
          group.classList.remove('focused', 'error', 'valid');
        });
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('success');
        submitBtn.disabled = false;
      }, 2000);
      
    } catch (error) {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
}

// =================================================================
// COMPOSANTS UX ULTRA-OPTIMISÉS
// =================================================================

class HyperUXComponents {
  constructor() {
    this.toasts = [];
    this.init();
  }

  init() {
    this.setupToastContainer();
    this.setupAccordions();
    this.setupModals();
  }

  setupToastContainer() {
    if (!document.querySelector('.toast-container')) {
      const container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
  }

  showToast(message, type = 'info', duration = 3000) {
    const container = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span>${message}</span>
      <button class="toast-close" aria-label="Fermer">&times;</button>
    `;

    container.appendChild(toast);
    this.toasts.push(toast);

    // Animation entrée
    raf(() => toast.classList.add('show'));

    // Auto-fermeture
    const autoClose = setTimeout(() => this.closeToast(toast), duration);

    // Fermeture manuelle
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(autoClose);
      this.closeToast(toast);
    });

    return toast;
  }

  closeToast(toast) {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 300);
  }

  setupAccordions() {
    document.addEventListener('click', e => {
      const header = e.target.closest('.accordion-header');
      if (!header) return;

      const item = header.closest('.accordion-item');
      const content = item.querySelector('.accordion-content');
      const accordion = item.closest('.modern-accordion');
      
      // Fermer autres accordéons
      accordion.querySelectorAll('.accordion-header.active').forEach(other => {
        if (other !== header) {
          other.classList.remove('active');
          other.closest('.accordion-item').querySelector('.accordion-content').classList.remove('active');
        }
      });

      // Toggle actuel
      header.classList.toggle('active');
      content.classList.toggle('active');
    });
  }

  setupModals() {
    document.addEventListener('click', e => {
      const trigger = e.target.closest('[data-modal-trigger]');
      if (trigger) {
        e.preventDefault();
        this.openModal(trigger.dataset.modalTrigger);
      }

      const close = e.target.closest('.modal-close, .modal-overlay');
      if (close) {
        const modal = close.closest('.modal-overlay');
        if (modal && (close.classList.contains('modal-close') || e.target === close)) {
          this.closeModal(modal);
        }
      }
    });

    // ESC pour fermer modals
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) this.closeModal(activeModal);
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus management
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.focus();
  }

  closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// =================================================================
// BOUTON RETOUR OPTIMISÉ
// =================================================================

class HyperBackToTop {
  constructor() {
    this.btn = document.getElementById('backToTop');
    this.threshold = 400;
    this.init();
  }

  init() {
    if (!this.btn) return;

    const handleScroll = throttle(() => {
      this.btn.classList.toggle('visible', window.pageYOffset > this.threshold);
    }, 100);

    window.addEventListener('scroll', handleScroll, {
      passive: CONFIG.FEATURES.passiveEvents
    });

    this.btn.addEventListener('click', e => {
      e.preventDefault();
      this.scrollToTop();
    });
  }

  scrollToTop() {
    this.btn.classList.add('rotating');
    
    const scroll = () => {
      const pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos - Math.max(15, pos / 8));
        raf(scroll);
      } else {
        this.btn.classList.remove('rotating');
      }
    };

    raf(scroll);
  }
}

// =================================================================
// INITIALISATION ULTRA-OPTIMISÉE
// =================================================================

class HyperApp {
  constructor() {
    this.managers = new Map();
    this.perfStart = performance.now();
    this.init();
  }

  async init() {
    // Attendre DOM ready de façon optimisée
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.bootstrap());
    } else {
      this.bootstrap();
    }
  }

  bootstrap() {
    this.removePreloader();
    
    // Initialisation en micro-batches pour éviter les blocages
    this.initManagers();
    
    // Performance tracking
    raf(() => this.trackPerformance());
  }

  removePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.display = 'none';
    }
  }

  initManagers() {
    // Ordre optimisé pour performance
    this.managers.set('animations', new HyperAnimationManager());
    this.managers.set('navigation', new HyperNavManager());
    this.managers.set('lazyLoader', new HyperLazyLoader());
    this.managers.set('forms', new HyperFormManager());
    this.managers.set('ux', new HyperUXComponents());
    this.managers.set('backToTop', new HyperBackToTop());

    // Exposition globale pour components
    window.hyperUX = this.managers.get('ux');
  }

  trackPerformance() {
    const loadTime = performance.now() - this.perfStart;
    
    // Métriques de performance
    if ('performance' in window) {
      const perfData = performance.getEntriesByType('navigation')[0];
      const metrics = {
        loadTime: Math.round(loadTime),
        domInteractive: Math.round(perfData.domInteractive - perfData.fetchStart),
        firstContentfulPaint: Math.round(perfData.firstContentfulPaint || 0),
        device: DEVICE.mobile ? 'mobile' : 'desktop',
        features: Object.keys(CONFIG.FEATURES).filter(f => CONFIG.FEATURES[f])
      };
      
      console.log('🚀 HyperApp optimisé chargé:', metrics);
      
      // Stockage pour analytics
      try {
        localStorage.setItem('perf-metrics', JSON.stringify(metrics));
      } catch (e) {
        // Fallback si localStorage indisponible
      }
    }
  }
}

// =================================================================
// LANCEMENT OPTIMISÉ
// =================================================================

// Initialisation immédiate
const hyperApp = new HyperApp();

// Export pour modules ES6 si besoin
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HyperApp, CONFIG, DEVICE };
}

/* =================================================================
   FIN DU JAVASCRIPT ULTRA-OPTIMISÉ
   ================================================================= */