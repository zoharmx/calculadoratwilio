// ===================================
// MAIN APPLICATION
// ===================================

class TwilioCalculatorApp {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Show loading screen
            this.showLoadingScreen();

            // Initialize theme
            Utils.theme.init();

            // Initialize calculator
            Calculator.init();

            // Initialize chart
            ChartManager.init();

            // Setup global event listeners
            this.setupGlobalListeners();

            // Setup scenario management
            this.setupScenarioManagement();

            // Hide loading screen
            await this.hideLoadingScreen();

            this.initialized = true;

            // Welcome message
            Utils.showToast('Calculadora Twilio cargada exitosamente', 'success', 3000);
        } catch (error) {
            console.error('Error initializing app:', error);
            Utils.showToast('Error al inicializar la aplicación', 'error', 5000);
        }
    },

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    },

    async hideLoadingScreen() {
        return new Promise(resolve => {
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
                resolve();
            }, 800);
        });
    },

    setupGlobalListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                Utils.theme.toggle();
                ChartManager.updateTheme();
            });
        }

        // Save scenario button
        const saveScenarioBtn = document.getElementById('save-scenario-btn');
        if (saveScenarioBtn) {
            saveScenarioBtn.addEventListener('click', () => {
                Utils.modal.open('save-scenario-modal');
            });
        }

        // Compare scenarios button
        const compareScenariosBtn = document.getElementById('compare-scenarios-btn');
        if (compareScenariosBtn) {
            compareScenariosBtn.addEventListener('click', () => {
                this.showCompareScenarios();
            });
        }

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Handle window resize for responsive chart
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (ChartManager.chart) {
                    ChartManager.chart.resize();
                }
            }, 250);
        });

        // Handle visibility change (pause animations when tab is not visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause any running animations
                console.log('Tab hidden - pausing animations');
            } else {
                // Resume animations
                console.log('Tab visible - resuming animations');
            }
        });
    },

    setupScenarioManagement() {
        // Save scenario modal
        const saveModal = document.getElementById('save-scenario-modal');
        const closeSaveModal = document.getElementById('close-save-modal');
        const cancelSaveScenario = document.getElementById('cancel-save-scenario');
        const confirmSaveScenario = document.getElementById('confirm-save-scenario');
        const scenarioNameInput = document.getElementById('scenario-name');
        const scenarioDescriptionInput = document.getElementById('scenario-description');

        if (closeSaveModal) {
            closeSaveModal.addEventListener('click', () => {
                Utils.modal.close('save-scenario-modal');
            });
        }

        if (cancelSaveScenario) {
            cancelSaveScenario.addEventListener('click', () => {
                Utils.modal.close('save-scenario-modal');
            });
        }

        if (confirmSaveScenario) {
            confirmSaveScenario.addEventListener('click', () => {
                const name = scenarioNameInput.value.trim();
                const description = scenarioDescriptionInput.value.trim();

                if (!name) {
                    Utils.showToast('Por favor, ingresa un nombre para el escenario', 'warning');
                    scenarioNameInput.focus();
                    return;
                }

                Calculator.saveScenario(name, description);
                Utils.modal.close('save-scenario-modal');

                // Clear inputs
                scenarioNameInput.value = '';
                scenarioDescriptionInput.value = '';
            });
        }

        // Handle Enter key in scenario name input
        if (scenarioNameInput) {
            scenarioNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    confirmSaveScenario.click();
                }
            });
        }

        // Compare modal
        const closeCompareModal = document.getElementById('close-compare-modal');
        if (closeCompareModal) {
            closeCompareModal.addEventListener('click', () => {
                Utils.modal.close('compare-modal');
            });
        }

        // Close modals when clicking overlay
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const overlay = modal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => {
                    Utils.modal.close(modal.id);
                });
            }
        });
    },

    showCompareScenarios() {
        if (Calculator.scenarios.length < 2) {
            Utils.showToast('Necesitas al menos 2 escenarios guardados para comparar', 'warning', 4000);
            return;
        }

        Utils.modal.open('compare-modal');

        // Show all scenarios in comparison
        ChartManager.createComparisonChart(Calculator.scenarios);
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S: Save scenario
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                document.getElementById('save-scenario-btn')?.click();
            }

            // Ctrl/Cmd + R: Reset calculator
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                Calculator.reset();
            }

            // Ctrl/Cmd + K: Compare scenarios
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.showCompareScenarios();
            }

            // Ctrl/Cmd + D: Toggle dark mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                Utils.theme.toggle();
                ChartManager.updateTheme();
            }

            // Escape: Close modals
            if (e.key === 'Escape') {
                Utils.modal.closeAll();
            }

            // Ctrl/Cmd + P: Export PDF
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                Calculator.exportPDF();
            }
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new TwilioCalculatorApp();
    app.init();
});

// Handle service worker registration (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Handle online/offline status
window.addEventListener('online', () => {
    Utils.showToast('Conexión restaurada', 'success', 2000);
});

window.addEventListener('offline', () => {
    Utils.showToast('Sin conexión a internet', 'warning', 3000);
});

// Handle app installation (PWA)
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show install button or toast
    Utils.showToast('Esta app puede instalarse en tu dispositivo', 'info', 5000);
});

window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    Utils.showToast('App instalada exitosamente', 'success', 3000);
    deferredPrompt = null;
});

// Export for debugging
window.TwilioApp = {
    Calculator,
    ChartManager,
    Utils,
    PricingData
};
