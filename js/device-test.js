// ==============================================
// SCRIPT DE TEST MULTI-DEVICE ET NAVIGATEURS
// ==============================================

(function() {
    'use strict';
    
    // Configuration des tests
    const TEST_CONFIG = {
        // Breakpoints à tester
        breakpoints: [
            { name: 'iPhone SE', width: 375, height: 667 },
            { name: 'iPhone 12', width: 390, height: 844 },
            { name: 'iPad', width: 768, height: 1024 },
            { name: 'iPad Pro', width: 1024, height: 1366 },
            { name: 'Desktop', width: 1200, height: 800 },
            { name: 'Large Desktop', width: 1440, height: 900 }
        ],
        
        // Navigateurs détectés
        browsers: {
            chrome: /Chrome/.test(navigator.userAgent),
            firefox: /Firefox/.test(navigator.userAgent),
            safari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
            edge: /Edge/.test(navigator.userAgent)
        },
        
        // Features à tester
        features: [
            'CSS Grid Support',
            'Flexbox Support', 
            'CSS Custom Properties',
            'IntersectionObserver',
            'Lazy Loading',
            'Preload Support'
        ]
    };
    
    // Détection de l'appareil
    function detectDevice() {
        const width = window.innerWidth;
        const userAgent = navigator.userAgent;
        
        let device = {
            type: 'desktop',
            name: 'Unknown',
            isMobile: false,
            isTablet: false,
            isDesktop: true,
            orientation: width > window.innerHeight ? 'landscape' : 'portrait'
        };
        
        // Détection mobile
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            device.isMobile = true;
            device.isDesktop = false;
            device.type = 'mobile';
            
            if (/iPad/i.test(userAgent) || (width >= 768 && device.isMobile)) {
                device.isTablet = true;
                device.isMobile = false;
                device.type = 'tablet';
            }
        }
        
        // Détection du nom de l'appareil
        if (/iPhone/i.test(userAgent)) {
            device.name = width <= 375 ? 'iPhone SE/8' : 'iPhone 12+';
        } else if (/iPad/i.test(userAgent)) {
            device.name = width <= 768 ? 'iPad' : 'iPad Pro';
        } else if (/Android/i.test(userAgent)) {
            device.name = device.isTablet ? 'Android Tablet' : 'Android Phone';
        } else {
            device.name = 'Desktop';
        }
        
        return device;
    }
    
    // Test des fonctionnalités
    function testFeatures() {
        const results = {};
        
        // CSS Grid
        results.cssGrid = CSS.supports('display', 'grid');
        
        // Flexbox
        results.flexbox = CSS.supports('display', 'flex');
        
        // CSS Custom Properties
        results.cssCustomProperties = CSS.supports('color', 'var(--test)');
        
        // IntersectionObserver
        results.intersectionObserver = 'IntersectionObserver' in window;
        
        // Lazy Loading
        results.lazyLoading = 'loading' in HTMLImageElement.prototype;
        
        // Preload
        results.preload = document.createElement('link').relList.supports('preload');
        
        return results;
    }
    
    // Test de performance
    function testPerformance() {
        const performance = window.performance;
        const timing = performance.timing;
        
        return {
            loadTime: timing.loadEventEnd - timing.navigationStart,
            domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
            firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
        };
    }
    
    // Test d'accessibilité basique
    function testAccessibility() {
        const results = {
            altTexts: true,
            headingStructure: true,
            skipLinks: false,
            ariaLabels: true
        };
        
        // Vérification des images sans alt
        const images = document.querySelectorAll('img');
        for (let img of images) {
            if (!img.alt || img.alt.trim() === '') {
                results.altTexts = false;
                break;
            }
        }
        
        // Vérification de la structure des headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        for (let heading of headings) {
            const level = parseInt(heading.tagName.charAt(1));
            if (level > lastLevel + 1) {
                results.headingStructure = false;
                break;
            }
            lastLevel = level;
        }
        
        // Vérification des skip links
        results.skipLinks = !!document.querySelector('a[href^="#"][class*="skip"]');
        
        // Vérification des aria-labels sur les boutons sans texte
        const buttons = document.querySelectorAll('button');
        for (let button of buttons) {
            if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
                results.ariaLabels = false;
                break;
            }
        }
        
        return results;
    }
    
    // Génération du rapport de test
    function generateTestReport() {
        const device = detectDevice();
        const features = testFeatures();
        const perf = testPerformance();
        const a11y = testAccessibility();
        
        const report = {
            timestamp: new Date().toISOString(),
            device: device,
            browser: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio
            },
            features: features,
            performance: perf,
            accessibility: a11y,
            score: calculateScore(features, perf, a11y)
        };
        
        return report;
    }
    
    // Calcul du score global
    function calculateScore(features, perf, a11y) {
        let score = 0;
        
        // Score des fonctionnalités (40%)
        const featureCount = Object.values(features).filter(v => v).length;
        score += (featureCount / Object.keys(features).length) * 40;
        
        // Score de performance (40%)
        let perfScore = 100;
        if (perf.loadTime > 3000) perfScore -= 30;
        if (perf.loadTime > 5000) perfScore -= 30;
        if (perf.firstContentfulPaint > 2000) perfScore -= 20;
        if (perf.firstContentfulPaint > 4000) perfScore -= 20;
        score += Math.max(0, perfScore) * 0.4;
        
        // Score d'accessibilité (20%)
        const a11yCount = Object.values(a11y).filter(v => v).length;
        score += (a11yCount / Object.keys(a11y).length) * 20;
        
        return Math.round(score);
    }
    
    // Affichage du rapport (mode debug)
    function displayReport(report) {
        if (window.location.search.includes('debug=true')) {
            console.group('🧪 Rapport de Test Multi-Device');
            console.log('📱 Appareil:', report.device);
            console.log('🌐 Navigateur:', report.browser.userAgent);
            console.log('📐 Viewport:', report.viewport);
            console.log('⚡ Performance:', report.performance);
            console.log('♿ Accessibilité:', report.accessibility);
            console.log('✨ Fonctionnalités:', report.features);
            console.log('🎯 Score Global:', report.score + '/100');
            console.groupEnd();
            
            // Affichage visuel si demandé
            if (window.location.search.includes('visual=true')) {
                showVisualReport(report);
            }
        }
    }
    
    // Affichage visuel du rapport
    function showVisualReport(report) {
        const reportDiv = document.createElement('div');
        reportDiv.id = 'test-report';
        reportDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        `;
        
        reportDiv.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #4CAF50;">Test Report</h4>
            <div><strong>Device:</strong> ${report.device.name}</div>
            <div><strong>Type:</strong> ${report.device.type}</div>
            <div><strong>Viewport:</strong> ${report.viewport.width}×${report.viewport.height}</div>
            <div><strong>Score:</strong> <span style="color: ${report.score >= 80 ? '#4CAF50' : report.score >= 60 ? '#FF9800' : '#F44336'}">${report.score}/100</span></div>
            <div style="margin-top: 10px;">
                <strong>Performance:</strong><br>
                Load: ${report.performance.loadTime}ms<br>
                FCP: ${report.performance.firstContentfulPaint}ms
            </div>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; background: #F44336; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Close</button>
        `;
        
        document.body.appendChild(reportDiv);
        
        // Auto-remove après 10 secondes
        setTimeout(() => {
            if (document.getElementById('test-report')) {
                document.getElementById('test-report').remove();
            }
        }, 10000);
    }
    
    // Initialisation des tests
    function initTests() {
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runTests);
        } else {
            runTests();
        }
    }
    
    // Exécution des tests
    function runTests() {
        // Attendre que les ressources soient chargées
        window.addEventListener('load', () => {
            setTimeout(() => {
                const report = generateTestReport();
                displayReport(report);
                
                // Stocker le rapport pour analytics
                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'device_test', {
                        custom_parameter: {
                            device_type: report.device.type,
                            score: report.score,
                            load_time: report.performance.loadTime
                        }
                    });
                }
            }, 1000);
        });
    }
    
    // Export pour usage externe
    window.CoachAPAR_DeviceTest = {
        generateReport: generateTestReport,
        testFeatures: testFeatures,
        detectDevice: detectDevice
    };
    
    // Démarrage automatique
    initTests();
    
})();