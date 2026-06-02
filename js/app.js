/**
 * app.js — Coach APA'R Montpellier
 * Site statique GitHub Pages — Vanilla JS ES6+
 * Formulaires: Formspree https://formspree.io/f/xwplpobd
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// 1. NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialise le comportement de la navbar:
 * - Glassmorphism au scroll (classe "scrolled")
 * - Ombre sticky
 * - Toggle menu mobile
 * - Smooth scroll sur les ancres
 * - Active link via IntersectionObserver
 * - Fermer menu mobile au clic sur un lien
 * - Fermer menu mobile au resize > 768px
 */
function initNavigation() {
  const navbar = document.querySelector('.navbar') || document.querySelector('nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navMobileMenu = document.querySelector('.nav-mobile-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // --- Scroll: glassmorphism + shadow ---
  function onScroll() {
    if (!navbar) return;
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    if (window.scrollY > 0) {
      navbar.classList.add('shadow');
    } else {
      navbar.classList.remove('shadow');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // état initial

  // --- Menu mobile toggle ---
  if (navToggle && navMobileMenu) {
    navToggle.addEventListener('click', () => {
      navMobileMenu.classList.toggle('active');
      navToggle.setAttribute(
        'aria-expanded',
        navMobileMenu.classList.contains('active').toString()
      );
    });
  }

  // --- Smooth scroll sur tous les liens href="#..." ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Fermer le menu mobile si ouvert
        if (navMobileMenu) {
          navMobileMenu.classList.remove('active');
          if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // --- Active link via IntersectionObserver ---
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 0 && navLinks.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${id}`
              );
            });
          }
        });
      },
      { threshold: 0.35, rootMargin: '-80px 0px -40% 0px' }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  // --- Resize: fermer menu mobile si > 768px ---
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMobileMenu) {
      navMobileMenu.classList.remove('active');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. COMPTEURS ANIMÉS (Stats section)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Anime un compteur de 0 à target en 2000ms avec easing ease-out.
 * @param {HTMLElement} el - L'élément span.stat-number
 * @param {number} target - La valeur finale
 * @param {string} suffix - Suffixe à afficher ("%", "+", "")
 */
function animateCounter(el, target, suffix) {
  const duration = 2000;
  const start = performance.now();

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(easeOut(progress) * target);
    el.textContent = value + suffix;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target + suffix;
    }
  }

  requestAnimationFrame(step);
}

/**
 * Détermine le suffixe d'affichage en fonction de la valeur et de l'attribut data-suffix.
 * Règle: si data-suffix présent, l'utiliser ; sinon déduction automatique.
 * @param {HTMLElement} el
 * @param {number} value
 * @returns {string}
 */
function getCounterSuffix(el, value) {
  const explicit = el.getAttribute('data-suffix');
  if (explicit !== null) return explicit;
  // déduction automatique (fallback)
  if (value === 98) return '%';
  return '';
}

/**
 * Initialise les compteurs animés au scroll via IntersectionObserver.
 */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'), 10);
          const suffix = getCounterSuffix(el, target);
          animateCounter(el, target, suffix);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SCROLL REVEAL ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialise les animations d'apparition au scroll pour les éléments .reveal.
 * Supporte l'attribut data-delay pour les grilles.
 */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  // Style initial appliqué via JS (au cas où le CSS ne le ferait pas)
  revealEls.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. FAQ ACCORDION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialise le comportement accordion des FAQ.
 * - Ouvre/ferme via max-height
 * - Ferme les autres items
 * - Rotation de l'icône
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (!question || !answer) return;

    // Initialiser max-height à 0
    answer.style.maxHeight = '0';
    answer.style.overflow = 'hidden';
    answer.style.transition = 'max-height 0.35s ease';

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Fermer tous les items
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          const otherAnswer = other.querySelector('.faq-answer');
          const otherIcon = other.querySelector('.faq-icon');
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      // Toggle l'item courant
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = '0';
        if (icon) icon.style.transform = 'rotate(0deg)';
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        if (icon) icon.style.transform = 'rotate(45deg)';
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. BOOKING CALENDAR WIDGET
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Widget de réservation calendrier.
 * Monte une interface complète (calendrier → créneaux → formulaire → confirmation)
 * dans l'élément identifié par elementId.
 */
class BookingCalendar {
  /**
   * @param {string} elementId - L'id de l'élément conteneur dans le DOM
   */
  constructor(elementId) {
    this.container = document.getElementById(elementId);
    if (!this.container) return;

    this.TIMESLOTS = ['17:30', '18:30', '19:30', '20:30'];
    this.FORMSPREE_URL = 'https://formspree.io/f/xwplpobd';
    this.DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    this.MONTHS_FR = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
    ];

    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth(); // 0-indexed
    this.selectedDate = null;
    this.selectedTime = null;

    this.render();
  }

  /**
   * Rendu principal du widget.
   */
  render() {
    this.container.innerHTML = '';
    this.container.classList.add('booking-widget');

    // Wrapper calendrier
    const calendarWrapper = document.createElement('div');
    calendarWrapper.className = 'booking-calendar';
    this.container.appendChild(calendarWrapper);
    this.calendarWrapper = calendarWrapper;

    this.renderCalendar();
  }

  /**
   * Détermine si une date est un week-end.
   * @param {Date} date
   * @returns {boolean}
   */
  isWeekend(date) {
    const day = date.getDay(); // 0 = dimanche, 6 = samedi
    return day === 0 || day === 6;
  }

  /**
   * Détermine si une date est dans le passé (ou aujourd'hui avec contrainte horaire).
   * @param {Date} date
   * @returns {boolean}
   */
  isPast(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (d < today) return true;

    // Même jour: bloquer si heure actuelle > 17:00 (plus de créneaux dispo)
    if (d.getTime() === today.getTime()) {
      const lastSlotHour = 17;
      if (now.getHours() >= lastSlotHour) return true;
    }

    return false;
  }

  /**
   * Rendu du calendrier mensuel.
   */
  renderCalendar() {
    this.calendarWrapper.innerHTML = '';

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const viewStart = new Date(this.currentYear, this.currentMonth, 1);
    const isPrevDisabled = viewStart <= currentMonthStart;

    // En-tête navigation
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `
      <button class="cal-prev" aria-label="Mois précédent" ${isPrevDisabled ? 'disabled' : ''}>&#8249;</button>
      <span class="cal-title">${this.MONTHS_FR[this.currentMonth]} ${this.currentYear}</span>
      <button class="cal-next" aria-label="Mois suivant">&#8250;</button>
    `;
    this.calendarWrapper.appendChild(header);

    header.querySelector('.cal-prev').addEventListener('click', () => this.prevMonth());
    header.querySelector('.cal-next').addEventListener('click', () => this.nextMonth());

    // Noms des jours
    const daysRow = document.createElement('div');
    daysRow.className = 'calendar-days-header';
    this.DAYS_FR.forEach((d) => {
      const cell = document.createElement('span');
      cell.className = 'cal-day-name';
      cell.textContent = d;
      daysRow.appendChild(cell);
    });
    this.calendarWrapper.appendChild(daysRow);

    // Grille des jours
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    // getDay() retourne 0=dim, 1=lun... on veut 0=lun
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6; // dimanche → offset 6

    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const today = new Date();

    // Cellules vides avant le 1er
    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-cell empty';
      grid.appendChild(empty);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const cell = document.createElement('div');
      cell.className = 'cal-cell';

      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      const disabled = this.isPast(date) || this.isWeekend(date);

      if (isToday) cell.classList.add('today');
      if (disabled) {
        cell.classList.add('disabled');
      } else {
        cell.classList.add('available');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('role', 'button');
        cell.setAttribute('aria-label', `Sélectionner le ${day} ${this.MONTHS_FR[this.currentMonth]}`);
      }

      // Marquer jour sélectionné
      if (this.selectedDate) {
        const sel = this.selectedDate;
        if (
          date.getDate() === sel.getDate() &&
          date.getMonth() === sel.getMonth() &&
          date.getFullYear() === sel.getFullYear()
        ) {
          cell.classList.add('selected');
        }
      }

      cell.textContent = day;

      if (!disabled) {
        cell.addEventListener('click', () => this.selectDate(date, cell));
        cell.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.selectDate(date, cell);
          }
        });
      }

      grid.appendChild(cell);
    }

    this.calendarWrapper.appendChild(grid);

    // Zone créneaux + formulaire (persistante sous le calendrier)
    const slotsContainer = document.createElement('div');
    slotsContainer.id = 'bookingSlots';
    this.container.querySelector('#bookingSlots')?.remove();
    this.container.appendChild(slotsContainer);
    this.slotsContainer = slotsContainer;

    // Ré-afficher créneaux si date déjà sélectionnée
    if (this.selectedDate) {
      this.renderTimeSlots(this.selectedDate);
    }
  }

  /**
   * Gestion du clic sur un jour disponible.
   * @param {Date} date
   * @param {HTMLElement} cell
   */
  selectDate(date, cell) {
    this.selectedDate = date;
    this.selectedTime = null;

    // Mettre à jour la classe selected dans la grille
    this.calendarWrapper.querySelectorAll('.cal-cell.selected').forEach((c) => {
      c.classList.remove('selected');
    });
    cell.classList.add('selected');

    this.renderTimeSlots(date);
  }

  /**
   * Affiche les créneaux horaires disponibles pour une date donnée.
   * @param {Date} date
   */
  renderTimeSlots(date) {
    this.slotsContainer.innerHTML = '';

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const wrapper = document.createElement('div');
    wrapper.className = 'timeslots';
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'translateY(10px)';
    wrapper.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    const title = document.createElement('p');
    title.className = 'timeslots-title';
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    title.textContent = `Créneaux disponibles — ${dayNames[date.getDay()]} ${date.getDate()} ${this.MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
    wrapper.appendChild(title);

    const buttonsRow = document.createElement('div');
    buttonsRow.className = 'timeslots-buttons';

    let hasSlot = false;

    this.TIMESLOTS.forEach((time) => {
      // Si aujourd'hui, filtrer les créneaux passés
      if (isToday) {
        const [h, m] = time.split(':').map(Number);
        const slotTime = new Date(now);
        slotTime.setHours(h, m, 0, 0);
        if (slotTime <= now) return;
      }

      hasSlot = true;
      const btn = document.createElement('button');
      btn.className = 'timeslot';
      btn.setAttribute('data-time', time);
      btn.setAttribute('type', 'button');
      btn.textContent = time.replace(':', 'h');

      if (this.selectedTime === time) {
        btn.classList.add('selected');
      }

      btn.addEventListener('click', () => {
        this.selectedTime = time;
        wrapper.querySelectorAll('.timeslot').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.renderForm(date, time);
      });

      buttonsRow.appendChild(btn);
    });

    if (!hasSlot) {
      const msg = document.createElement('p');
      msg.className = 'no-slots';
      msg.textContent = 'Aucun créneau disponible pour ce jour.';
      wrapper.appendChild(msg);
    } else {
      wrapper.appendChild(buttonsRow);
    }

    this.slotsContainer.appendChild(wrapper);

    // Slide-down animation
    requestAnimationFrame(() => {
      wrapper.style.opacity = '1';
      wrapper.style.transform = 'translateY(0)';
    });

    // Ré-afficher formulaire si créneau déjà sélectionné
    if (this.selectedTime) {
      this.renderForm(date, this.selectedTime);
    }
  }

  /**
   * Affiche le formulaire de réservation après sélection d'un créneau.
   * @param {Date} date
   * @param {string} time - Format "HH:MM"
   */
  renderForm(date, time) {
    // Supprimer formulaire précédent s'il existe
    this.slotsContainer.querySelector('.booking-form-wrapper')?.remove();

    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayName = dayNames[date.getDay()];
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const displayDate = `${dayName} ${date.getDate()} ${this.MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
    const displayTime = time.replace(':', 'h');

    const wrapper = document.createElement('div');
    wrapper.className = 'booking-form-wrapper';
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'translateY(10px)';
    wrapper.style.transition = 'opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s';

    wrapper.innerHTML = `
      <div class="booking-summary">
        <span class="summary-icon">📅</span>
        <span class="summary-text">Votre rendez-vous : <strong>${displayDate}</strong> à <strong>${displayTime}</strong></span>
      </div>
      <form class="booking-form" action="https://formspree.io/f/xwplpobd" method="POST" novalidate>
        <input type="hidden" name="date" value="${dateStr}">
        <input type="hidden" name="heure" value="${time}">
        <input type="hidden" name="_subject" value="Demande de rendez-vous — ${displayDate} à ${displayTime}">

        <div class="form-group">
          <label for="book-nom">Nom complet <span aria-hidden="true">*</span></label>
          <input type="text" id="book-nom" name="nom" required placeholder="Votre nom et prénom" autocomplete="name">
        </div>

        <div class="form-group">
          <label for="book-tel">Téléphone <span aria-hidden="true">*</span></label>
          <input type="tel" id="book-tel" name="telephone" required placeholder="06 XX XX XX XX" autocomplete="tel">
        </div>

        <div class="form-group">
          <label for="book-email">Email <span aria-hidden="true">*</span></label>
          <input type="email" id="book-email" name="email" required placeholder="votre@email.fr" autocomplete="email">
        </div>

        <div class="form-group">
          <label>Contact préféré <span aria-hidden="true">*</span></label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" name="contact_prefere" value="Appel téléphonique" required>
              Appel téléphonique
            </label>
            <label class="radio-label">
              <input type="radio" name="contact_prefere" value="Email">
              Email
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="book-service">Service souhaité</label>
          <select id="book-service" name="service">
            <option value="">-- Choisir un service --</option>
            <option value="APA">APA (Activité Physique Adaptée)</option>
            <option value="Coaching Sportif">Coaching Sportif</option>
            <option value="Nutrition">Nutrition</option>
            <option value="Pilates">Pilates</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div class="form-group">
          <label for="book-message">Message (optionnel)</label>
          <textarea id="book-message" name="message" rows="3" placeholder="Informations complémentaires, objectifs..."></textarea>
        </div>

        <button type="submit" class="btn-submit-booking">
          Confirmer ma demande de contact
        </button>
      </form>
    `;

    this.slotsContainer.appendChild(wrapper);

    // Animation slide-down
    requestAnimationFrame(() => {
      wrapper.style.opacity = '1';
      wrapper.style.transform = 'translateY(0)';
    });

    // Gestionnaire submit
    const form = wrapper.querySelector('.booking-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  /**
   * Gère la soumission du formulaire de réservation via fetch.
   * @param {Event} e
   */
  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('.btn-submit-booking');

    // Validation HTML5 native
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    try {
      const data = new FormData(form);
      const response = await fetch(this.FORMSPREE_URL, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        this.showConfirmation();
      } else {
        const json = await response.json().catch(() => ({}));
        const msg = (json.errors && json.errors.map((err) => err.message).join(', ')) ||
          'Une erreur est survenue. Veuillez réessayer.';
        showFormMessage(form, msg, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmer ma demande de contact';
      }
    } catch (err) {
      console.error('BookingCalendar submit error:', err);
      showFormMessage(form, 'Erreur réseau. Vérifiez votre connexion et réessayez.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirmer ma demande de contact';
    }
  }

  /**
   * Affiche le message de confirmation après envoi réussi.
   */
  showConfirmation() {
    this.slotsContainer.innerHTML = '';
    this.calendarWrapper.querySelectorAll('.cal-cell.selected').forEach((c) => {
      c.classList.remove('selected');
    });
    this.selectedDate = null;
    this.selectedTime = null;

    const confirmation = document.createElement('div');
    confirmation.className = 'booking-confirmation';
    confirmation.innerHTML = `
      <div class="confirmation-icon">✅</div>
      <h3>Demande envoyée !</h3>
      <p>Votre demande a été envoyée ! Je vous contacterai au plus vite pour confirmer le rendez-vous.</p>
      <button type="button" class="btn-new-booking">Faire une nouvelle demande</button>
    `;
    this.slotsContainer.appendChild(confirmation);

    confirmation.querySelector('.btn-new-booking').addEventListener('click', () => {
      this.slotsContainer.innerHTML = '';
      this.renderCalendar();
    });
  }

  /**
   * Passe au mois précédent (si pas dans le passé).
   */
  prevMonth() {
    const now = new Date();
    if (
      this.currentYear > now.getFullYear() ||
      (this.currentYear === now.getFullYear() && this.currentMonth > now.getMonth())
    ) {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.selectedDate = null;
      this.selectedTime = null;
      this.renderCalendar();
    }
  }

  /**
   * Passe au mois suivant.
   */
  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.selectedDate = null;
    this.selectedTime = null;
    this.renderCalendar();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. FORMULAIRE CONTACT (bas de page)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Affiche un message de succès ou d'erreur sous un formulaire.
 * @param {HTMLFormElement} form
 * @param {string} message
 * @param {'success'|'error'} type
 */
function showFormMessage(form, message, type) {
  // Supprimer message précédent
  form.parentNode.querySelectorAll('.form-message').forEach((m) => m.remove());

  const msg = document.createElement('p');
  msg.className = `form-message form-message--${type}`;
  msg.setAttribute('role', 'alert');
  msg.textContent = message;
  form.parentNode.insertBefore(msg, form.nextSibling);
}

/**
 * Initialise le formulaire de contact via Formspree (fetch).
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';

    // Validation HTML5 native
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours…';
    }

    try {
      const data = new FormData(form);
      const response = await fetch('https://formspree.io/f/xwplpobd', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        showFormMessage(
          form,
          'Message envoyé ! Je vous répondrai dans les plus brefs délais.',
          'success'
        );
        form.reset();
      } else {
        const json = await response.json().catch(() => ({}));
        const msg =
          (json.errors && json.errors.map((err) => err.message).join(', ')) ||
          'Une erreur est survenue. Veuillez réessayer ou me contacter directement.';
        showFormMessage(form, msg, 'error');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      showFormMessage(
        form,
        'Erreur réseau. Vérifiez votre connexion et réessayez.',
        'error'
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT — Point d'entrée
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  try {
    initNavigation();
  } catch (e) {
    console.error('initNavigation:', e);
  }

  try {
    initCounters();
  } catch (e) {
    console.error('initCounters:', e);
  }

  try {
    initScrollReveal();
  } catch (e) {
    console.error('initScrollReveal:', e);
  }

  try {
    initFaqAccordion();
  } catch (e) {
    console.error('initFaqAccordion:', e);
  }

  try {
    // Monter le widget calendrier si l'élément existe
    const bookingEl = document.getElementById('bookingWidget');
    if (bookingEl) {
      new BookingCalendar('bookingWidget');
    }
  } catch (e) {
    console.error('BookingCalendar:', e);
  }

  try {
    initContactForm();
  } catch (e) {
    console.error('initContactForm:', e);
  }
});
