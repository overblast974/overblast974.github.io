document.addEventListener('DOMContentLoaded', function() {
  // Variables globales pour les animations
  const isMobile = window.innerWidth <= 768;
  let lastScrollTop = 0;
  let ticking = false;

  // Initialisation de toutes les fonctionnalités
  initPreloader();
  initMobileMenu();
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

  // Système de préchargement
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    
    // Suppression immédiate du préchargeur
    window.addEventListener('load', function() {
      preloader.style.display = 'none';
      
      // Déclencher les animations d'entrée pour la page d'accueil seulement
      const heroContent = document.querySelector('.hero-content');
      if (heroContent) {
        document.querySelectorAll('.hero-content > *').forEach((el, index) => {
          setTimeout(() => {
            el.classList.add('in-view');
          }, 100 * index);
        });
      }
    });
  }

  // Gestion du menu mobile avec animation
  function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      navMenu.classList.toggle('active');
      
      // Animation des éléments du menu
      if (navMenu.classList.contains('active')) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
          link.style.animationDelay = `${0.1 + index * 0.1}s`;
          link.classList.add('animated');
        });
      }
    });
    
    // Fermer le menu au clic sur un lien
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
    
    // Fermer le menu en cliquant à l'extérieur
    document.addEventListener('click', function(event) {
      if (navMenu.classList.contains('active') && 
          !navMenu.contains(event.target) && 
          !navToggle.contains(event.target)) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }

  // Défilement fluide pour les liens d'ancrage
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const startPosition = window.pageYOffset;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          const distance = targetPosition - startPosition;
          const duration = 1000;
          let start = null;
          
          function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            
            // Fonction d'easing cubique
            const easeInOutCubic = percentage < 0.5
              ? 4 * percentage * percentage * percentage
              : 1 - Math.pow(-2 * percentage + 2, 3) / 2;
            
            window.scrollTo(0, startPosition + distance * easeInOutCubic);
            
            if (progress < duration) {
              window.requestAnimationFrame(step);
            }
          }
          
          window.requestAnimationFrame(step);
        }
      });
    });
  }

  // Animation d'apparition au défilement
  function initScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .zoom-in, .services, .testimonials, .stagger-children, .contact, .contact-info, .contact-form');
    
    if (!elements.length) return;
    
    // Ajouter immédiatement la classe in-view à tous les éléments
    elements.forEach(element => {
      element.classList.add('in-view');
      
      // Animation stagger pour les enfants
      if (element.classList.contains('stagger-children')) {
        const children = element.querySelectorAll('.stagger-item');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('in-view');
          }, 100 * index);
        });
      }
      
      // S'assurer que les éléments de contact sont visibles
      if (element.classList.contains('contact-info') || element.classList.contains('contact-form')) {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
      }
    });
    
    // Conserver l'observer pour les animations futures au défilement
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          
          // S'assurer que les éléments de contact sont visibles
          if (entry.target.classList.contains('contact')) {
            const contactInfo = entry.target.querySelector('.contact-info');
            const contactForm = entry.target.querySelector('.contact-form');
            
            if (contactInfo) {
              contactInfo.style.opacity = '1';
              contactInfo.style.transform = 'translateX(0)';
            }
            
            if (contactForm) {
              contactForm.style.opacity = '1';
              contactForm.style.transform = 'translateX(0)';
            }
          }
          
          observer.unobserve(entry.target);
          
          // Animation stagger pour les enfants
          if (entry.target.classList.contains('stagger-children')) {
            const children = entry.target.querySelectorAll('.stagger-item');
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('in-view');
              }, 100 * index);
            });
          }
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

  // Effet parallaxe avancé pour la section hero
  function initHeroEffects() {
    const hero = document.querySelector('.hero');
    const heroImage = document.querySelector('.hero-image');
    const heroContent = document.querySelector('.hero-content');
    
    if (!hero || !heroImage || !heroContent) return;
    
    // Effet simple de parallaxe au défilement
    window.addEventListener('scroll', function() {
      const scrollPosition = window.pageYOffset;
      if (scrollPosition < window.innerHeight) {
        const opacity = 1 - scrollPosition / (window.innerHeight * 0.7);
        heroContent.style.opacity = opacity;
      }
    });
  }

  // Animation des cartes de services - simplifiée sans effets 3D
  function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    if (!serviceCards.length) return;
    
    // Rendre immédiatement visibles les éléments avec la classe fade-in
    document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) translateX(0)';
    });
  }

  // Carrousel de témoignages amélioré avec transitions 3D
  function initTestimonialSlider() {
    const slider = document.getElementById('testimonialsSlider');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    
    if (!slider || !prevBtn || !nextBtn) return;
    
    const slides = slider.querySelectorAll('.testimonial-card');
    if (!slides.length) return;
    
    let currentIndex = 0;
    let isAnimating = false;
    
    function goToSlide(index) {
      if (isAnimating) return;
      isAnimating = true;
      
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      
      // Déplacer les slides avec une transition 3D
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        // Réinitialiser les transformations
        slide.style.transform = '';
        slide.style.opacity = '';
        slide.style.zIndex = '';
        
        // Si c'est le slide courant
        if (i === index) {
          slide.style.transform = 'translate3d(0, 0, 0) rotateY(0deg)';
          slide.style.opacity = '1';
          slide.style.zIndex = '3';
        } 
        // Si c'est le slide précédent
        else if (i === index - 1 || (index === 0 && i === slides.length - 1)) {
          slide.style.transform = 'translate3d(-100%, 0, -100px) rotateY(10deg)';
          slide.style.opacity = '0.7';
          slide.style.zIndex = '2';
        } 
        // Si c'est le slide suivant
        else if (i === index + 1 || (index === slides.length - 1 && i === 0)) {
          slide.style.transform = 'translate3d(100%, 0, -100px) rotateY(-10deg)';
          slide.style.opacity = '0.7';
          slide.style.zIndex = '2';
        } 
        // Les autres slides
        else {
          slide.style.transform = 'translate3d(0, 0, -200px) scale(0.8)';
          slide.style.opacity = '0';
          slide.style.zIndex = '1';
        }
      }
      
      currentIndex = index;
      
      // Réinitialiser le flag d'animation après la transition
      setTimeout(() => {
        isAnimating = false;
      }, 600);
    }
    
    // Initialiser le premier slide
    goToSlide(currentIndex);
    
    // Boutons de navigation avec effet de rebond
    prevBtn.addEventListener('click', () => {
      prevBtn.classList.add('clicked');
      setTimeout(() => prevBtn.classList.remove('clicked'), 300);
      goToSlide(currentIndex - 1);
    });
    
    nextBtn.addEventListener('click', () => {
      nextBtn.classList.add('clicked');
      setTimeout(() => nextBtn.classList.remove('clicked'), 300);
      goToSlide(currentIndex + 1);
    });
    
    // Défilement automatique des témoignages
    let autoplay = setInterval(() => goToSlide(currentIndex + 1), 5000);
    
    // Pause sur le survol
    slider.addEventListener('mouseenter', () => clearInterval(autoplay));
    slider.addEventListener('mouseleave', () => {
      clearInterval(autoplay);
      autoplay = setInterval(() => goToSlide(currentIndex + 1), 5000);
    });
    
    // Gestion du swipe tactile
    let startX, moveX;
    
    slider.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
    }, false);
    
    slider.addEventListener('touchmove', function(e) {
      moveX = e.touches[0].clientX;
    }, false);
    
    slider.addEventListener('touchend', function(e) {
      if (startX + 50 < moveX) {
        goToSlide(currentIndex - 1);
      } else if (startX - 50 > moveX) {
        goToSlide(currentIndex + 1);
      }
    }, false);
  }

  // Animation améliorée des compteurs
  function initCounters() {
    const counterElements = document.querySelectorAll('.counter');
    
    if (!counterElements.length) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2
    });
    
    counterElements.forEach(counter => {
      observer.observe(counter);
    });
    
    function animateCounter(counter) {
      const target = parseInt(counter.getAttribute('data-count'));
      const duration = 2000; // ms
      const frameRate = 1000 / 60; // 60fps
      const totalFrames = Math.round(duration / frameRate);
      
      // Pour les grands nombres, utilisez une courbe logarithmique pour l'animation
      const isLargeNumber = target > 100;
      let currentCount = 0;
      let frame = 0;
      
      counter.classList.add('updating');
      
      const animate = () => {
        frame++;
        
        // Animation logarithmique pour les grands nombres
        if (isLargeNumber) {
          const progress = frame / totalFrames;
          currentCount = Math.floor(target * (Math.pow(progress, 3)));
        } else {
          currentCount = Math.floor(target * (frame / totalFrames));
        }
        
        // Assurer que nous atteignons exactement la valeur cible
        if (frame === totalFrames) {
          currentCount = target;
          counter.classList.remove('updating');
          counter.classList.add('completed');
          
          // Effet de pulse une fois complété
          setTimeout(() => {
            counter.classList.remove('completed');
          }, 1000);
        }
        
        // Formater les grands nombres avec des séparateurs
        counter.textContent = currentCount.toLocaleString('fr-FR');
        
        if (frame < totalFrames) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }

  // Animation du formulaire de contact
  function initContactForm() {
    const formGroups = document.querySelectorAll('.form-group');
    const contactForm = document.getElementById('contactForm');
    
    if (!formGroups.length) return;
    
    // Ajout de l'effet de focus
    formGroups.forEach(group => {
      const input = group.querySelector('input, textarea, select');
      const ripple = group.querySelector('.input-ripple');
      
      if (input && ripple) {
        input.addEventListener('focus', () => {
          group.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
          if (!input.value) {
            group.classList.remove('focused');
          }
        });
        
        // Si le champ a déjà une valeur
        if (input.value) {
          group.classList.add('focused');
        }
      }
    });
    
    // Animation de soumission du formulaire
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        
        // Effet de pulsation sur le bouton
        submitBtn.classList.add('pulse');
        
        // Simuler l'envoi (à remplacer par l'envoi réel)
        setTimeout(() => {
          // Animation de succès
          submitBtn.innerHTML = '<i class="fas fa-check"></i> Envoyé !';
          submitBtn.classList.add('success');
          submitBtn.classList.remove('pulse');
          
          // Réinitialisation du formulaire après un délai
          setTimeout(() => {
            contactForm.reset();
            formGroups.forEach(group => group.classList.remove('focused'));
            submitBtn.innerHTML = 'Envoyer';
            submitBtn.classList.remove('success');
          }, 3000);
        }, 1500);
      });
    }
  }

  // Animation du header lors du défilement
  function initHeaderAnimation() {
    const header = document.getElementById('header');
    
    if (!header) return;
    
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          const currentScroll = window.pageYOffset;
          
          // Classe scrolled pour le style
          if (currentScroll > 50) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
          
          // Animation de masquage/affichage au défilement
          if (currentScroll > lastScrollTop && currentScroll > 300) {
            // Défilement vers le bas, masquer le header
            header.style.transform = 'translateY(-100%)';
          } else {
            // Défilement vers le haut, montrer le header
            header.style.transform = 'translateY(0)';
          }
          
          lastScrollTop = currentScroll;
          ticking = false;
        });
        
        ticking = true;
      }
    });
  }

  // Animation des icônes sociales avec effet de rebond
  function initSocialIcons() {
    const socialIcons = document.querySelectorAll('.social-links a i');
    
    if (!socialIcons.length) return;
    
    socialIcons.forEach(icon => {
      icon.addEventListener('mouseenter', function() {
        this.classList.add('bounce');
      });
      
      icon.addEventListener('animationend', function() {
        this.classList.remove('bounce');
      });
    });
  }

  // Fonction pour l'effet de typing
  function initTypingEffect() {
    const typedElement = document.querySelector('.hero .typed-text');
    if (!typedElement) return;
    
    // Afficher directement le texte
    typedElement.textContent = "l'activité physique adaptée";
    typedElement.style.display = 'block';
    typedElement.style.visibility = 'visible';
    typedElement.style.opacity = '1';
  }

  // Bouton retour en haut avec animation
  function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    if (!backToTop) return;
    
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    
    backToTop.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Animation de rotation pendant le défilement
      this.classList.add('rotating');
      
      // Défilement fluide vers le haut
      const scrollToTop = () => {
        const position = window.pageYOffset;
        if (position > 0) {
          window.scrollTo(0, position - Math.max(20, position / 10));
          window.requestAnimationFrame(scrollToTop);
        } else {
          backToTop.classList.remove('rotating');
        }
      };
      
      window.requestAnimationFrame(scrollToTop);
    });
  }

  // Génération des particules pour la section hero
  function initParticles() {
    const particlesContainer = document.getElementById('particles');
    
    if (!particlesContainer) return;
    
    const numberOfParticles = 50;
    
    for (let i = 0; i < numberOfParticles; i++) {
      createParticle();
    }

    function createParticle() {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Position aléatoire
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      
      // Taille aléatoire
      const size = Math.random() * 5 + 2;
      
      // Style de la particule
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
      
      // Supprime et recrée la particule après l'animation
      particle.addEventListener('animationend', () => {
        particle.remove();
        createParticle();
      });
    }
  }

  // Animation des formes qui se transforment en arrière-plan
  function initMorphingBackground() {
    const shapes = document.querySelectorAll('.morphing-shape');
    
    if (!shapes.length) return;
    
    shapes.forEach(shape => {
      // Animation aléatoire pour chaque forme
      const delay = Math.random() * 5;
      const duration = Math.random() * 10 + 20; // 20-30s
      
      shape.style.animationDelay = `${delay}s`;
      shape.style.animationDuration = `${duration}s`;
      
      // Ajouter des interactions au survol/mouvement de la souris
      shape.addEventListener('mousemove', function(e) {
        if (isMobile) return;
        
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Déplacement subtil au survol
        this.style.transform = `translate(${(x - rect.width/2) / 20}px, ${(y - rect.height/2) / 20}px)`;
      });
      
      shape.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
    });
  }

  // Animation 3D du logo
  function init3DLogos() {
    const logo = document.querySelector('.nav-logo');
    
    if (!logo || isMobile) return;
    
    logo.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculer la position relative
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Limiter la rotation à 15 degrés
      const rotateY = ((x - centerX) / centerX) * 15;
      const rotateX = ((centerY - y) / centerY) * 5;
      
      // Appliquer la transformation
      this.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    });
    
    logo.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  }

  // Gestion des FAQ accordéons pour les pages de services
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (!faqItems.length) return;
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      
      if (question) {
        question.addEventListener('click', () => {
          // Fermer tous les autres items
          faqItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
              otherItem.classList.remove('active');
            }
          });
          
          // Basculer l'état actif de l'item cliqué
          item.classList.toggle('active');
        });
      }
    });
  }

  // Initialisation du slider de cours spécifiques
  function initCoursesSlider() {
    const slides = document.querySelectorAll('.course-slide');
    const dots = document.querySelectorAll('.slide-dot');
    let currentSlide = 0;
    let slideInterval;

    // Fonction pour afficher un slide spécifique
    function showSlide(index) {
      // Masquer tous les slides
      slides.forEach(slide => {
        slide.classList.remove('active');
        slide.style.opacity = '0';
        slide.style.visibility = 'hidden';
      });
      
      // Réinitialiser tous les points
      dots.forEach(dot => {
        dot.classList.remove('active');
      });
      
      // Afficher le slide actif
      slides[index].classList.add('active');
      slides[index].style.opacity = '1';
      slides[index].style.visibility = 'visible';
      
      // Mettre en évidence le point actif
      dots[index].classList.add('active');
      
      // Mettre à jour l'index du slide actuel
      currentSlide = index;
    }

    // Fonction pour passer au slide suivant
    function nextSlide() {
      let nextIndex = currentSlide + 1;
      if (nextIndex >= slides.length) {
        nextIndex = 0;
      }
      showSlide(nextIndex);
    }

    // Démarrer le défilement automatique
    function startAutoSlide() {
      slideInterval = setInterval(nextSlide, 7000); // Change de slide toutes les 7 secondes
    }

    // Arrêter le défilement automatique
    function stopAutoSlide() {
      clearInterval(slideInterval);
    }

    // Ajouter des événements de clic aux points
    dots.forEach((dot, index) => {
      dot.addEventListener('click', function() {
        stopAutoSlide();
        showSlide(index);
        startAutoSlide();
      });
    });

    // Initialiser le slider
    if (slides.length > 0) {
      showSlide(0);
      startAutoSlide();
    }
  }
}); 