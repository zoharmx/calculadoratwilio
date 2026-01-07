// ===================================
// UTILITY FUNCTIONS
// ===================================

const Utils = {
    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    // Format date
    formatDate(date) {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show toast notification
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type]} toast-icon"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Cerrar notificación">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        });

        // Auto-remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    },

    // LocalStorage wrapper
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error writing to localStorage:', error);
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Error clearing localStorage:', error);
                return false;
            }
        }
    },

    // Theme management
    theme: {
        get() {
            return Utils.storage.get('theme', 'light');
        },

        set(theme) {
            document.body.className = `${theme}-theme`;
            Utils.storage.set('theme', theme);

            // Update theme toggle icon
            const themeIcon = document.querySelector('#theme-toggle i');
            if (themeIcon) {
                themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        },

        toggle() {
            const currentTheme = this.get();
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.set(newTheme);
            Utils.showToast(
                `Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`,
                'success',
                2000
            );
        },

        init() {
            const savedTheme = this.get();
            this.set(savedTheme);
        }
    },

    // Modal utilities
    modal: {
        open(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        },

        close(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            }
        },

        closeAll() {
            document.querySelectorAll('.modal.open').forEach(modal => {
                modal.classList.remove('open');
            });
            document.body.style.overflow = '';
        }
    },

    // Animation utilities
    animation: {
        fadeIn(element, duration = 300) {
            element.style.opacity = '0';
            element.style.display = 'block';

            let start = null;
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.min(progress / duration, 1);
                element.style.opacity = opacity;

                if (progress < duration) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        },

        fadeOut(element, duration = 300) {
            let start = null;
            const initialOpacity = parseFloat(window.getComputedStyle(element).opacity) || 1;

            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.max(initialOpacity - (progress / duration), 0);
                element.style.opacity = opacity;

                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                }
            };

            requestAnimationFrame(animate);
        }
    },

    // Export to PDF
    exportToPDF(data) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Title
            doc.setFontSize(20);
            doc.setTextColor(79, 70, 229);
            doc.text('Calculadora Twilio - Resumen de Costos', 20, 20);

            // Date
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generado: ${Utils.formatDate(new Date())}`, 20, 30);

            // Cost breakdown
            doc.setFontSize(12);
            doc.setTextColor(0);
            let yPos = 45;

            doc.text('Desglose de Costos:', 20, yPos);
            yPos += 10;

            const costs = [
                ['Mensajería:', data.msgCost],
                ['Voz Saliente:', data.voiceCost],
                ['SIP Trunking:', data.sipCost],
                ['Voz Entrante:', data.inboundCost],
                ['Números Telefónicos:', data.pnCost],
                ['Servicios Adicionales:', data.additionalCost]
            ];

            doc.setFontSize(11);
            costs.forEach(([label, value]) => {
                doc.text(label, 25, yPos);
                doc.text(value, 150, yPos);
                yPos += 8;
            });

            // Total
            yPos += 5;
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Total Estimado:', 25, yPos);
            doc.text(data.totalCost, 150, yPos);

            // Configuration details
            yPos += 15;
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text('Configuración:', 20, yPos);
            yPos += 10;

            doc.setFontSize(10);
            const config = [
                `SMS: ${data.msgVolume} mensajes a ${data.msgCountry}`,
                `Voz: ${data.voiceMinutes} minutos a ${data.voiceCountry}`,
                `SIP: ${data.sipMinutes} minutos a ${data.sipCountry}`,
                `Entrantes: ${data.inboundMinutes} minutos desde ${data.inboundCountry}`,
                `Números: ${data.pnQuantity} de tipo ${data.pnType} en ${data.pnCountry}`
            ];

            config.forEach(line => {
                doc.text(line, 25, yPos);
                yPos += 7;
            });

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text('Calculadora Twilio - World Vision Telecom', 20, 280);
            doc.text('Los precios son estimados y pueden variar', 20, 285);

            // Save
            doc.save(`twilio-calculator-${Date.now()}.pdf`);
            Utils.showToast('PDF exportado exitosamente', 'success');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            Utils.showToast('Error al exportar PDF', 'error');
        }
    },

    // Copy to clipboard
    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => Utils.showToast('Copiado al portapapeles', 'success', 2000))
                .catch(err => {
                    console.error('Error copying to clipboard:', err);
                    Utils.showToast('Error al copiar', 'error');
                });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                Utils.showToast('Copiado al portapapeles', 'success', 2000);
            } catch (err) {
                console.error('Error copying to clipboard:', err);
                Utils.showToast('Error al copiar', 'error');
            }
            document.body.removeChild(textarea);
        }
    },

    // Validate form data
    validateNumber(value, min = 0, max = Infinity) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    },

    // Format number with thousands separator
    formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }
};

// Add CSS animation for slideOutRight
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
