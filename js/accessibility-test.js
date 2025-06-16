// ==============================================
// SCRIPT DE TEST D'ACCESSIBILITÉ AUTOMATISÉ
// ==============================================

(function() {
    'use strict';
    
    // Configuration des tests d'accessibilité
    const A11Y_CONFIG = {
        // Critères WCAG 2.1 AA
        wcagLevel: 'AA',
        
        // Tests à effectuer
        tests: [
            'headingStructure',
            'altTexts', 
            'colorContrast',
            'keyboardNavigation',
            'ariaLabels',
            'formLabels',
            'skipLinks',
            'focusManagement',
            'semanticHTML',
            'textReadability'
        ],
        
        // Seuils de conformité
        thresholds: {
            contrastNormal: 4.5,    // WCAG AA normal text
            contrastLarge: 3,       // WCAG AA large text (18pt+)
            minTouchTarget: 44,     // Taille minimale des cibles tactiles
            maxLineLength: 80       // Longueur maximale des lignes de texte
        }
    };
    
    // Utilitaires pour les tests de contraste
    const ContrastUtils = {
        // Conversion hex vers RGB
        hexToRgb: function(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
        
        // Calcul de la luminance relative
        getRelativeLuminance: function(rgb) {
            const rsRGB = rgb.r / 255;
            const gsRGB = rgb.g / 255;
            const bsRGB = rgb.b / 255;
            
            const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
            const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
            const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
            
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        },
        
        // Calcul du ratio de contraste
        getContrastRatio: function(color1, color2) {
            const lum1 = this.getRelativeLuminance(color1);
            const lum2 = this.getRelativeLuminance(color2);
            
            const brightest = Math.max(lum1, lum2);
            const darkest = Math.min(lum1, lum2);
            
            return (brightest + 0.05) / (darkest + 0.05);
        },
        
        // Obtenir la couleur calculée d'un élément
        getComputedColor: function(element, property) {
            const color = window.getComputedStyle(element).getPropertyValue(property);
            const rgb = color.match(/\d+/g);
            return rgb ? {
                r: parseInt(rgb[0]),
                g: parseInt(rgb[1]),
                b: parseInt(rgb[2])
            } : null;
        }
    };
    
    // Tests d'accessibilité
    const AccessibilityTests = {
        // Test de la structure des headings
        headingStructure: function() {
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const issues = [];
            let lastLevel = 0;
            
            // Vérifier qu'il y a au moins un H1
            const h1s = document.querySelectorAll('h1');
            if (h1s.length === 0) {
                issues.push('Aucun élément H1 trouvé');
            } else if (h1s.length > 1) {
                issues.push(`${h1s.length} éléments H1 trouvés (recommandé: 1 seul)`);
            }
            
            // Vérifier la hiérarchie
            headings.forEach((heading, index) => {
                const level = parseInt(heading.tagName.charAt(1));
                
                // Vérifier les sauts de niveau
                if (index > 0 && level > lastLevel + 1) {
                    issues.push(`Saut de niveau détecté: H${lastLevel} vers H${level}`);
                }
                
                // Vérifier le contenu vide
                if (!heading.textContent.trim()) {
                    issues.push(`Heading ${heading.tagName} vide détecté`);
                }
                
                lastLevel = level;
            });
            
            return {
                passed: issues.length === 0,
                issues: issues,
                details: `${headings.length} headings analysés`
            };
        },
        
        // Test des textes alternatifs des images
        altTexts: function() {
            const images = document.querySelectorAll('img');
            const issues = [];
            
            images.forEach((img, index) => {
                const alt = img.getAttribute('alt');
                const src = img.src;
                
                // Vérifier la présence de l'attribut alt
                if (alt === null) {
                    issues.push(`Image ${index + 1} sans attribut alt (src: ${src})`);
                }
                // Vérifier les textes alt vides pour les images de contenu
                else if (alt.trim() === '' && !img.hasAttribute('role')) {
                    // Accepter les alt vides pour les images décoratives
                    if (!img.closest('[role="presentation"]') && !img.hasAttribute('aria-hidden')) {
                        issues.push(`Image ${index + 1} avec alt vide mais sans rôle décoratif`);
                    }
                }
                // Vérifier les textes alt trop longs
                else if (alt.length > 125) {
                    issues.push(`Image ${index + 1} avec texte alt trop long (${alt.length} caractères)`);
                }
                // Vérifier les textes alt redondants
                else if (alt.toLowerCase().includes('image de') || alt.toLowerCase().includes('photo de')) {
                    issues.push(`Image ${index + 1} avec texte alt redondant: "${alt}"`);
                }
            });
            
            return {
                passed: issues.length === 0,
                issues: issues,
                details: `${images.length} images analysées`
            };
        },
        
        // Test des contrastes de couleur
        colorContrast: function() {
            const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span, li');
            const issues = [];
            
            textElements.forEach((element, index) => {
                const textColor = ContrastUtils.getComputedColor(element, 'color');
                const bgColor = ContrastUtils.getComputedColor(element, 'background-color');
                
                if (textColor && bgColor) {
                    const contrast = ContrastUtils.getContrastRatio(textColor, bgColor);
                    const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
                    const fontWeight = window.getComputedStyle(element).fontWeight;
                    
                    // Déterminer le seuil requis
                    const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || fontWeight >= 700));
                    const requiredContrast = isLargeText ? A11Y_CONFIG.thresholds.contrastLarge : A11Y_CONFIG.thresholds.contrastNormal;
                    
                    if (contrast < requiredContrast) {
                        issues.push(`Contraste insuffisant: ${contrast.toFixed(2)}:1 (requis: ${requiredContrast}:1) sur "${element.tagName}"`);
                    }
                }
            });
            
            return {
                passed: issues.length === 0,
                issues: issues.slice(0, 10), // Limiter à 10 pour éviter le spam
                details: `${textElements.length} éléments de texte analysés`
            };
        },
        
        // Test de navigation au clavier
        keyboardNavigation: function() {
            const focusableElements = document.querySelectorAll(
                'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
            );
            const issues = [];
            
            focusableElements.forEach((element, index) => {
                // Vérifier que l'élément est visible
                const style = window.getComputedStyle(element);
                if (style.display === 'none' || style.visibility === 'hidden') {
                    return; // Ignorer les éléments cachés
                }
                
                // Vérifier la taille minimale pour les éléments tactiles
                const rect = element.getBoundingClientRect();
                if (rect.width < A11Y_CONFIG.thresholds.minTouchTarget || rect.height < A11Y_CONFIG.thresholds.minTouchTarget) {
                    issues.push(`Élément ${element.tagName} trop petit pour le toucher (${Math.round(rect.width)}x${Math.round(rect.height)}px)`);
                }
                
                // Vérifier les éléments sans contenu visible
                if (!element.textContent.trim() && !element.getAttribute('aria-label') && !element.getAttribute('title')) {
                    issues.push(`Élément ${element.tagName} sans libellé accessible`);
                }
            });
            
            return {
                passed: issues.length === 0,
                issues: issues,
                details: `${focusableElements.length} éléments focusables analysés`
            };
        },
        
        // Test des labels ARIA
        ariaLabels: function() {
            const issues = [];
            
            // Boutons sans texte ni aria-label
            const buttons = document.querySelectorAll('button');
            buttons.forEach((button, index) => {
                if (!button.textContent.trim() && !button.getAttribute('aria-label') && !button.getAttribute('aria-labelledby')) {
                    issues.push(`Bouton ${index + 1} sans libellé accessible`);
                }
            });
            
            // Liens sans contenu descriptif
            const links = document.querySelectorAll('a[href]');
            links.forEach((link, index) => {
                const text = link.textContent.trim();
                if (!text || text.toLowerCase() === 'cliquez ici' || text.toLowerCase() === 'ici' || text.toLowerCase() === 'lire la suite') {
                    if (!link.getAttribute('aria-label') && !link.getAttribute('aria-labelledby')) {
                        issues.push(`Lien ${index + 1} avec texte non descriptif: "${text}"`);
                    }
                }
            });
            
            // Images avec aria-label mais sans alt
            const images = document.querySelectorAll('img[aria-label]');
            images.forEach((img, index) => {
                if (!img.getAttribute('alt')) {
                    issues.push(`Image ${index + 1} avec aria-label mais sans attribut alt`);
                }
            });
            
            return {
                passed: issues.length === 0,
                issues: issues,
                details: `${buttons.length + links.length + images.length} éléments ARIA analysés`
            };
        },
        
        // Test des labels de formulaire
        formLabels: function() {
            const formControls = document.querySelectorAll('input, textarea, select');
            const issues = [];
            
            formControls.forEach((control, index) => {
                const id = control.id;
                const type = control.type;
                
                // Ignorer les inputs cachés et les boutons
                if (type === 'hidden' || type === 'submit' || type === 'button') {
                    return;
                }
                
                // Vérifier la présence d'un label
                let hasLabel = false;
                
                if (id) {
                    const label = document.querySelector(`label[for="${id}"]`);
                    if (label) hasLabel = true;
                }
                
                // Vérifier aria-label ou aria-labelledby
                if (!hasLabel && (control.getAttribute('aria-label') || control.getAttribute('aria-labelledby'))) {
                    hasLabel = true;
                }
                
                // Vérifier si le contrôle est dans un fieldset avec legend
                if (!hasLabel && control.closest('fieldset')) {
                    const fieldset = control.closest('fieldset');
                    if (fieldset.querySelector('legend')) {
                        hasLabel = true;
                    }
                }
                
                if (!hasLabel) {
                    issues.push(`Contrôle de formulaire ${control.tagName} ${type || ''} sans label accessible`);
                }
            });
            
            return {
                passed: issues.length === 0,
                issues: issues,
                details: `${formControls.length} contrôles de formulaire analysés`
            };
        },
        
        // Test des liens de saut
        skipLinks: function() {
            const skipLinks = document.querySelectorAll('a[href^="#"][class*="skip"], .skip-link');
            const issues = [];
            
            if (skipLinks.length === 0) {
                issues.push('Aucun lien de saut trouvé');
            } else {
                skipLinks.forEach((link, index) => {
                    const href = link.getAttribute('href');
                    const target = document.querySelector(href);
                    
                    if (!target) {
                        issues.push(`Lien de saut ${index + 1} pointe vers un élément inexistant: ${href}`);
                    }
                });
            }
            
            return {
                passed: issues.length === 0,
                issues: issues,
                details: `${skipLinks.length} liens de saut analysés`
            };
        },
        
        // Test de lisibilité du texte
        textReadability: function() {
            const textElements = document.querySelectorAll('p, li');
            const issues = [];
            
            textElements.forEach((element, index) => {
                const text = element.textContent.trim();
                
                // Vérifier la longueur des lignes
                const style = window.getComputedStyle(element);
                const fontSize = parseFloat(style.fontSize);
                const width = element.getBoundingClientRect().width;
                const charactersPerLine = width / (fontSize * 0.5); // Estimation
                
                if (charactersPerLine > A11Y_CONFIG.thresholds.maxLineLength) {
                    issues.push(`Ligne trop longue détectée (${Math.round(charactersPerLine)} caractères estimés)`);
                }
                
                // Vérifier les phrases trop longues
                const sentences = text.split(/[.!?]+/);
                sentences.forEach(sentence => {
                    if (sentence.trim().split(' ').length > 25) {
                        issues.push('Phrase très longue détectée (>25 mots)');
                    }
                });
            });
            
            return {
                passed: issues.length === 0,
                issues: issues.slice(0, 5), // Limiter les issues
                details: `${textElements.length} éléments de texte analysés`
            };
        }
    };
    
    // Génération du rapport d'accessibilité
    function generateAccessibilityReport() {
        const startTime = performance.now();
        const results = {};
        let totalIssues = 0;
        let passedTests = 0;
        
        // Exécuter tous les tests
        A11Y_CONFIG.tests.forEach(testName => {
            if (AccessibilityTests[testName]) {
                results[testName] = AccessibilityTests[testName]();
                totalIssues += results[testName].issues.length;
                if (results[testName].passed) passedTests++;
            }
        });
        
        const endTime = performance.now();
        const score = Math.round((passedTests / A11Y_CONFIG.tests.length) * 100);
        
        return {
            timestamp: new Date().toISOString(),
            wcagLevel: A11Y_CONFIG.wcagLevel,
            score: score,
            totalTests: A11Y_CONFIG.tests.length,
            passedTests: passedTests,
            totalIssues: totalIssues,
            testDuration: Math.round(endTime - startTime),
            results: results,
            summary: {
                level: score >= 90 ? 'Excellent' : score >= 75 ? 'Bon' : score >= 50 ? 'Acceptable' : 'Problématique',
                recommendations: generateRecommendations(results, score)
            }
        };
    }
    
    // Génération de recommandations
    function generateRecommendations(results, score) {
        const recommendations = [];
        
        if (results.headingStructure && !results.headingStructure.passed) {
            recommendations.push('Corriger la structure des headings (H1-H6)');
        }
        
        if (results.altTexts && !results.altTexts.passed) {
            recommendations.push('Ajouter des textes alternatifs aux images');
        }
        
        if (results.colorContrast && !results.colorContrast.passed) {
            recommendations.push('Améliorer les contrastes de couleur');
        }
        
        if (results.keyboardNavigation && !results.keyboardNavigation.passed) {
            recommendations.push('Optimiser la navigation au clavier');
        }
        
        if (results.ariaLabels && !results.ariaLabels.passed) {
            recommendations.push('Améliorer les labels ARIA');
        }
        
        if (score < 75) {
            recommendations.push('Audit approfondi d\'accessibilité recommandé');
        }
        
        return recommendations;
    }
    
    // Affichage du rapport d'accessibilité
    function displayAccessibilityReport(report) {
        if (window.location.search.includes('a11y=true')) {
            console.group('♿ Rapport d\'Accessibilité WCAG 2.1 AA');
            console.log('🎯 Score Global:', report.score + '/100');
            console.log('✅ Tests Réussis:', `${report.passedTests}/${report.totalTests}`);
            console.log('⚠️ Problèmes Détectés:', report.totalIssues);
            console.log('⏱️ Durée du Test:', report.testDuration + 'ms');
            console.log('📋 Niveau WCAG:', report.wcagLevel);
            
            // Détail des résultats
            Object.entries(report.results).forEach(([testName, result]) => {
                const status = result.passed ? '✅' : '❌';
                console.log(`${status} ${testName}:`, result.details);
                if (!result.passed && result.issues.length > 0) {
                    result.issues.forEach(issue => console.warn('  ⚠️', issue));
                }
            });
            
            console.log('🎯 Recommandations:', report.summary.recommendations);
            console.groupEnd();
            
            // Affichage visuel si demandé
            if (window.location.search.includes('visual=true')) {
                showA11yReport(report);
            }
        }
        
        // Stocker le rapport pour analytics
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'accessibility_audit', {
                score: report.score,
                total_issues: report.totalIssues,
                wcag_level: report.wcagLevel
            });
        }
    }
    
    // Affichage visuel du rapport
    function showA11yReport(report) {
        const reportDiv = document.createElement('div');
        reportDiv.id = 'a11y-report';
        reportDiv.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.95);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            max-width: 350px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        `;
        
        const getScoreColor = (score) => {
            if (score >= 90) return '#4CAF50';
            if (score >= 75) return '#8BC34A';
            if (score >= 50) return '#FF9800';
            return '#F44336';
        };
        
        reportDiv.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #61dafb;">♿ Accessibilité WCAG ${report.wcagLevel}</h4>
            <div><strong>Score:</strong> <span style="color: ${getScoreColor(report.score)}">${report.score}/100</span> (${report.summary.level})</div>
            <div><strong>Tests:</strong> ${report.passedTests}/${report.totalTests} réussis</div>
            <div><strong>Problèmes:</strong> ${report.totalIssues}</div>
            <div><strong>Durée:</strong> ${report.testDuration}ms</div>
            
            <details style="margin-top: 10px;">
                <summary style="cursor: pointer; color: #61dafb;">Détails des tests</summary>
                <div style="margin-top: 8px; font-size: 11px;">
                    ${Object.entries(report.results).map(([test, result]) => `
                        <div style="margin: 4px 0; padding: 4px; background: rgba(255,255,255,0.1); border-radius: 3px;">
                            ${result.passed ? '✅' : '❌'} <strong>${test}</strong><br>
                            <span style="opacity: 0.8">${result.details}</span>
                            ${!result.passed && result.issues.length > 0 ? `<br><span style="color: #ffab91; font-size: 10px;">Issues: ${result.issues.length}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </details>
            
            ${report.summary.recommendations.length > 0 ? `
                <details style="margin-top: 10px;">
                    <summary style="cursor: pointer; color: #ffab91;">Recommandations</summary>
                    <ul style="margin: 8px 0; padding-left: 16px; font-size: 11px;">
                        ${report.summary.recommendations.map(rec => `<li style="margin: 2px 0;">${rec}</li>`).join('')}
                    </ul>
                </details>
            ` : ''}
            
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; background: #F44336; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Fermer</button>
        `;
        
        document.body.appendChild(reportDiv);
        
        // Auto-remove après 30 secondes
        setTimeout(() => {
            if (document.getElementById('a11y-report')) {
                document.getElementById('a11y-report').remove();
            }
        }, 30000);
    }
    
    // Export pour usage externe
    window.CoachAPAR_A11yTest = {
        generateReport: generateAccessibilityReport,
        runTest: function(testName) {
            return AccessibilityTests[testName] ? AccessibilityTests[testName]() : null;
        },
        showReport: showA11yReport
    };
    
    // Initialisation automatique
    function initA11yTests() {
        // Attendre le chargement complet
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runA11yTests);
        } else {
            runA11yTests();
        }
    }
    
    function runA11yTests() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const report = generateAccessibilityReport();
                displayAccessibilityReport(report);
            }, 2000); // Attendre que toutes les animations soient initialisées
        });
    }
    
    // Démarrage automatique
    initA11yTests();
    
})();