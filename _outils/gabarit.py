#!/usr/bin/env python3
"""Gabarit commun de coachapar.fr (option B : copie contrôlée).

En-tête et pied de page sont copiés à l'identique dans les 12 pages et la page 404,
entre des marqueurs :
    <!-- gabarit:en-tete -->  ...  <!-- /gabarit:en-tete -->
    <!-- gabarit:pied -->     ...  <!-- /gabarit:pied -->
Seules différences admises : aria-current="page" sur le lien de la page,
et, sur la page Contact, les deux boutons principaux qui pointent vers
#contactForm au lieu de /#reservation.

Usage :
    python3 gabarit.py verifier  [racine]   -> échoue (code 1) au moindre écart
    python3 gabarit.py appliquer [racine]   -> réécrit les blocs depuis ce modèle
"""
import re
import sys
from pathlib import Path

RACINE = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parent.parent

# page -> clé de la page courante
PAGES = {
    'index.html': 'accueil',
    'publics-accompagnes.html': 'publics',
    'pages/activite-physique-adaptee.html': 'apa',
    'pages/coaching-sportif.html': 'coaching',
    'pages/conseils-nutritionnels.html': 'nutrition',
    'pages/contact.html': 'contact',
    'pages/a-propos.html': 'apropos',
    'pages/blog.html': 'blog',
    'pages/cgv.html': 'cgv',
    'pages/mentions-legales.html': 'mentions',
    'pages/politique-confidentialite.html': 'confidentialite',
    'pages/blog/activite-physique-sante-cardiovasculaire.html': 'article',
    '404.html': 'erreur',
}

CTA = 'Prendre mon premier rendez-vous'

def i(nom):
    return f'<svg class="icon" aria-hidden="true"><use href="/images/icons.svg#i-{nom}"/></svg>'

def cur(page, cle):
    return ' aria-current="page"' if page == cle else ''

def en_tete(page):
    cible = '#contactForm' if page == 'contact' else '/#reservation'
    nav = [
        ('apa', '/pages/activite-physique-adaptee.html', 'Activité physique adaptée'),
        (None, '/#services', 'Services'),
        (None, '/#tarifs', 'Tarifs'),
        (None, '/#faq', 'Questions'),
        ('contact', '/pages/contact.html', 'Contact'),
    ]
    lignes_nav = '\n'.join(
        f'          <li><a href="{h}"{cur(page, k)}>{t}</a></li>' for k, h, t in nav)
    lignes_mob = '\n'.join(
        f'          <li><a href="{h}"{cur(page, k)}>{t} {i("arrow-right")}</a></li>' for k, h, t in nav)
    return f'''<!-- gabarit:en-tete -->
  <header class="site-header">
    <div class="container site-header__bar">
      <a class="brand" href="/">
        <img src="/images/logo-mark.webp" width="44" height="44" alt="">
        <span><span class="brand__name">Coach APA'R</span><span class="brand__sub">Coach sportif et APA, Montpellier</span></span>
      </a>
      <nav class="nav" aria-label="Navigation principale">
        <ul class="list-reset">
{lignes_nav}
        </ul>
      </nav>
      <a class="btn btn--primary header-cta" href="{cible}">{CTA}</a>
      <a class="icon-btn call-btn" href="tel:+33765775104">{i("phone")}<span class="visually-hidden">Appeler le 07 65 77 51 04</span></a>
      <button class="icon-btn menu-toggle" type="button" aria-expanded="false" aria-controls="menu-mobile">{i("menu")}<span class="menu-toggle__label">Menu</span></button>
    </div>
    <div class="mobile-menu" id="menu-mobile" hidden>
      <nav class="container" aria-label="Menu">
        <ul class="list-reset">
{lignes_mob}
        </ul>
        <div class="mobile-menu__actions">
          <a class="btn btn--primary btn--block" href="{cible}">{CTA}</a>
          <p class="cta-note">Offert, sans engagement</p>
          <a class="btn btn--secondary btn--block" href="tel:+33765775104">{i("phone")}07 65 77 51 04</a>
        </div>
      </nav>
    </div>
  </header>
  <!-- /gabarit:en-tete -->'''

def pied(page):
    services = [
        ('apa', '/pages/activite-physique-adaptee.html', 'Activité physique adaptée'),
        ('publics', '/publics-accompagnes.html', 'Publics accompagnés'),
        ('coaching', '/pages/coaching-sportif.html', 'Coaching sportif'),
        ('nutrition', '/pages/conseils-nutritionnels.html', 'Alimentation et activité physique'),
        (None, '/#services', 'Pilates'),
    ]
    infos = [
        ('apropos', '/pages/a-propos.html', 'À propos'),
        (None, '/#tarifs', 'Tarifs'),
        (None, '/#faq', 'Questions fréquentes'),
        ('blog', '/pages/blog.html', 'Blog'),
        ('contact', '/pages/contact.html', 'Contact'),
    ]
    legal = [
        ('mentions', '/pages/mentions-legales.html', 'Mentions légales'),
        ('confidentialite', '/pages/politique-confidentialite.html', 'Confidentialité'),
        ('cgv', '/pages/cgv.html', 'CGV'),
    ]
    li = lambda lst, ind: '\n'.join(f'{ind}<li><a href="{h}"{cur(page, k)}>{t}</a></li>' for k, h, t in lst)
    return f'''<!-- gabarit:pied -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a class="footer__logo" href="/"><img src="/images/logo-mark.webp" width="56" height="56" alt="" loading="lazy" decoding="async">Coach APA'R</a>
          <p>Coach sportif et enseignant en activité physique adaptée à Montpellier. L'activité physique adaptée, en complément de votre suivi médical.</p>
        </div>
        <nav aria-labelledby="pied-services">
          <p class="footer__title" id="pied-services">Services</p>
          <ul class="footer__list list-reset">
{li(services, '            ')}
          </ul>
        </nav>
        <nav aria-labelledby="pied-infos">
          <p class="footer__title" id="pied-infos">Informations</p>
          <ul class="footer__list list-reset">
{li(infos, '            ')}
          </ul>
        </nav>
        <div>
          <p class="footer__title">Contact</p>
          <ul class="footer__list list-reset">
            <li><a href="tel:+33765775104">{i("phone")}07 65 77 51 04</a></li>
            <li><a href="mailto:coachapar@gmail.com">{i("mail")}coachapar@gmail.com</a></li>
            <li><span>{i("map-pin")}Montpellier, Hérault (34)</span></li>
            <li><span>{i("clock")}Lun-ven 17 h 30 – 21 h 30, sam 8 h – 16 h</span></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <p>© 2026 Coach APA'R — Loïc. Tous droits réservés. Site réalisé par Loïc Boyer.</p>
        <nav aria-label="Informations légales">
          <ul class="list-reset">
{li(legal, '            ')}
          </ul>
        </nav>
      </div>
    </div>
  </footer>
  <!-- /gabarit:pied -->'''

BLOCS = {
    'en-tete': (re.compile(r'<!-- gabarit:en-tete -->.*?<!-- /gabarit:en-tete -->', re.S), en_tete),
    'pied': (re.compile(r'<!-- gabarit:pied -->.*?<!-- /gabarit:pied -->', re.S), pied),
}

def verifier():
    ecarts = 0
    for rel, cle in PAGES.items():
        txt = (RACINE / rel).read_text(encoding='utf-8')
        for nom, (rx, fabrique) in BLOCS.items():
            trouves = rx.findall(txt)
            if len(trouves) != 1:
                print(f'ÉCART {rel} : bloc {nom} trouvé {len(trouves)} fois (attendu 1)')
                ecarts += 1
                continue
            if trouves[0] != fabrique(cle):
                print(f'ÉCART {rel} : bloc {nom} différent du modèle')
                ecarts += 1
        # pas d'en-tête ou de pied hors gabarit
        hors = BLOCS['en-tete'][0].sub('', BLOCS['pied'][0].sub('', txt))
        if re.search(r'<header|<footer', hors):
            print(f'ÉCART {rel} : <header> ou <footer> hors gabarit')
            ecarts += 1
    print(f'{len(PAGES)} pages vérifiées, {ecarts} écart(s).')
    return ecarts

def appliquer():
    for rel, cle in PAGES.items():
        p = RACINE / rel
        txt = p.read_text(encoding='utf-8')
        for nom, (rx, fabrique) in BLOCS.items():
            txt, n = rx.subn(lambda m: fabrique(cle), txt)
            if n != 1:
                raise SystemExit(f'{rel} : bloc {nom} trouvé {n} fois')
        p.write_text(txt, encoding='utf-8')
    print('Blocs réécrits.')

if __name__ == '__main__':
    action = sys.argv[1] if len(sys.argv) > 1 else 'verifier'
    if action == 'appliquer':
        appliquer()
    sys.exit(1 if verifier() else 0)
