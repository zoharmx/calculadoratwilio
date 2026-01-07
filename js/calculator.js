// ===================================
// CALCULATOR LOGIC
// ===================================

const Calculator = {
    // DOM Elements
    elements: {},

    // Current costs
    costs: {
        messaging: 0,
        voice: 0,
        sip: 0,
        inbound: 0,
        phoneNumbers: 0,
        additional: 0,
        total: 0
    },

    // Scenarios management
    scenarios: [],

    // Auto-save timer
    autoSaveTimer: null,

    init() {
        this.cacheElements();
        this.populateSelects();
        this.createAdditionalServices();
        this.setupEventListeners();
        this.loadSavedState();
        this.updatePhoneTypes();
        this.calculate();
        this.loadScenarios();
    },

    cacheElements() {
        // Input elements
        this.elements = {
            msgCountry: document.getElementById('msg-country'),
            msgVolume: document.getElementById('msg-volume'),
            msgVolumeSlider: document.getElementById('msg-volume-slider'),
            msgCost: document.getElementById('msg-cost'),

            voiceCountry: document.getElementById('voice-country'),
            voiceMinutes: document.getElementById('voice-minutes'),
            voiceMinutesSlider: document.getElementById('voice-minutes-slider'),
            voiceCost: document.getElementById('voice-cost'),

            sipCountry: document.getElementById('sip-country'),
            sipMinutes: document.getElementById('sip-minutes'),
            sipMinutesSlider: document.getElementById('sip-minutes-slider'),
            sipCost: document.getElementById('sip-cost'),

            inboundCountry: document.getElementById('inbound-country'),
            inboundMinutes: document.getElementById('inbound-minutes'),
            inboundMinutesSlider: document.getElementById('inbound-minutes-slider'),
            inboundCost: document.getElementById('inbound-cost'),

            pnCountry: document.getElementById('pn-country'),
            pnType: document.getElementById('pn-type'),
            pnQuantity: document.getElementById('pn-quantity'),
            pnCost: document.getElementById('pn-cost'),

            additionalCost: document.getElementById('additional-cost'),
            totalCost: document.getElementById('total-cost'),
            autoSaveText: document.getElementById('auto-save-text'),

            resetButton: document.getElementById('reset-button'),
            aiAnalysisButton: document.getElementById('ai-analysis-button'),
            exportPdfBtn: document.getElementById('export-pdf-btn'),

            aiModal: document.getElementById('ai-modal'),
            closeModalButton: document.getElementById('close-modal-button'),
            aiLoader: document.getElementById('ai-loader'),
            aiResponseText: document.getElementById('ai-response-text')
        };
    },

    populateSelects() {
        this.populateSelect(this.elements.msgCountry, PricingData.messaging, 'outbound_sms_price_usd', 'name_with_code');
        this.populateSelect(this.elements.voiceCountry, PricingData.voice, 'outbound_call_price_usd', 'name_with_prefix');
        this.populateSelect(this.elements.sipCountry, PricingData.sip, 'outbound_call_price_usd', 'name_with_prefix');
        this.populateSelect(this.elements.inboundCountry, PricingData.inbound, 'inbound_call_price_usd', 'name_with_code');

        // Phone numbers country select (unique countries)
        const uniqueCountries = [...new Map(PricingData.phoneNumbers.map(item => [item.iso_country, item])).values()];
        this.populateSelect(this.elements.pnCountry, uniqueCountries, 'iso_country', 'iso_country');
    },

    populateSelect(selectElement, data, valueField, textField) {
        selectElement.innerHTML = '';
        data.forEach(item => {
            const option = new Option(item[textField], item[valueField]);
            selectElement.add(option);
        });
    },

    createAdditionalServices() {
        const container = document.getElementById('additional-services-container');
        if (!container) return;

        container.innerHTML = '';

        PricingData.additionalServices.forEach(service => {
            const serviceDiv = document.createElement('div');
            serviceDiv.className = 'form-group';
            serviceDiv.innerHTML = `
                <label for="service-input-${service.id}" class="form-label" title="${service.description}">
                    <i class="fas fa-cube"></i>
                    ${service.name}
                </label>
                <input
                    type="number"
                    id="service-input-${service.id}"
                    value="0"
                    min="0"
                    step="10"
                    class="form-input"
                    data-service-id="${service.id}"
                    aria-label="${service.name}"
                >
                <small style="color: var(--text-tertiary); font-size: 0.875rem; margin-top: 0.25rem; display: block;">
                    ${service.description}
                </small>
            `;
            container.appendChild(serviceDiv);
        });
    },

    setupEventListeners() {
        // Input changes
        const inputs = document.querySelectorAll('input[type="number"], select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.calculate();
                this.scheduleAutoSave();
            });
        });

        // Slider synchronization
        this.syncSlider(this.elements.msgVolume, this.elements.msgVolumeSlider);
        this.syncSlider(this.elements.voiceMinutes, this.elements.voiceMinutesSlider);
        this.syncSlider(this.elements.sipMinutes, this.elements.sipMinutesSlider);
        this.syncSlider(this.elements.inboundMinutes, this.elements.inboundMinutesSlider);

        // Phone number country change
        this.elements.pnCountry.addEventListener('change', () => this.updatePhoneTypes());

        // Reset button
        this.elements.resetButton.addEventListener('click', () => this.reset());

        // AI Analysis button
        this.elements.aiAnalysisButton.addEventListener('click', () => this.handleAiAnalysis());

        // Export PDF button
        this.elements.exportPdfBtn.addEventListener('click', () => this.exportPDF());

        // Modal close
        this.elements.closeModalButton.addEventListener('click', () => Utils.modal.close('ai-modal'));
        this.elements.aiModal.addEventListener('click', (e) => {
            if (e.target === this.elements.aiModal) {
                Utils.modal.close('ai-modal');
            }
        });

        // Tab switching
        this.setupTabs();
    },

    syncSlider(input, slider) {
        if (!input || !slider) return;

        input.addEventListener('input', () => {
            slider.value = input.value;
            this.updateSliderBackground(slider);
        });

        slider.addEventListener('input', () => {
            input.value = slider.value;
            this.updateSliderBackground(slider);
        });

        this.updateSliderBackground(slider);
    },

    updateSliderBackground(slider) {
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 100;
        const value = parseFloat(slider.value) || 0;
        const percentage = ((value - min) / (max - min)) * 100;
        slider.style.setProperty('--slider-value', `${percentage}%`);
    },

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');

                // Remove active class from all tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked tab
                button.classList.add('active');
                const activeContent = document.querySelector(`[data-content="${tabName}"]`);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            });
        });
    },

    calculate() {
        // Calculate messaging cost
        const msgPrice = parseFloat(this.elements.msgCountry.value) || 0;
        const msgVolume = parseInt(this.elements.msgVolume.value) || 0;
        this.costs.messaging = msgPrice * msgVolume;
        this.elements.msgCost.textContent = Utils.formatCurrency(this.costs.messaging);

        // Calculate voice cost
        const voicePrice = parseFloat(this.elements.voiceCountry.value) || 0;
        const voiceMinutes = parseInt(this.elements.voiceMinutes.value) || 0;
        this.costs.voice = voicePrice * voiceMinutes;
        this.elements.voiceCost.textContent = Utils.formatCurrency(this.costs.voice);

        // Calculate SIP cost
        const sipPrice = parseFloat(this.elements.sipCountry.value) || 0;
        const sipMinutes = parseInt(this.elements.sipMinutes.value) || 0;
        this.costs.sip = sipPrice * sipMinutes;
        this.elements.sipCost.textContent = Utils.formatCurrency(this.costs.sip);

        // Calculate inbound cost
        const inboundPrice = parseFloat(this.elements.inboundCountry.value) || 0;
        const inboundMinutes = parseInt(this.elements.inboundMinutes.value) || 0;
        this.costs.inbound = inboundPrice * inboundMinutes;
        this.elements.inboundCost.textContent = Utils.formatCurrency(this.costs.inbound);

        // Calculate phone numbers cost
        const pnPrice = parseFloat(this.elements.pnType.value) || 0;
        const pnQuantity = parseInt(this.elements.pnQuantity.value) || 0;
        this.costs.phoneNumbers = pnPrice * pnQuantity;
        this.elements.pnCost.textContent = Utils.formatCurrency(this.costs.phoneNumbers);

        // Calculate additional services cost
        this.costs.additional = 0;
        PricingData.additionalServices.forEach(service => {
            const input = document.getElementById(`service-input-${service.id}`);
            if (input) {
                const quantity = parseInt(input.value) || 0;
                this.costs.additional += service.price * quantity;
            }
        });
        this.elements.additionalCost.textContent = Utils.formatCurrency(this.costs.additional);

        // Calculate total
        this.costs.total =
            this.costs.messaging +
            this.costs.voice +
            this.costs.sip +
            this.costs.inbound +
            this.costs.phoneNumbers +
            this.costs.additional;

        this.elements.totalCost.textContent = Utils.formatCurrency(this.costs.total);

        // Update chart
        ChartManager.updateChart(this.costs);
    },

    updatePhoneTypes() {
        const country = this.elements.pnCountry.value;
        const types = PricingData.phoneNumbers.filter(pn => pn.iso_country === country);

        this.elements.pnType.innerHTML = '';

        if (types.length > 0) {
            types.forEach(type => {
                const option = new Option(type.number_type, type.monthly_fee_usd);
                this.elements.pnType.add(option);
            });
            this.elements.pnType.disabled = false;
        } else {
            this.elements.pnType.add(new Option('No disponible', '0'));
            this.elements.pnType.disabled = true;
        }

        this.calculate();
    },

    reset() {
        // Reset all number inputs
        document.querySelectorAll('input[type="number"]').forEach(input => {
            const defaultValue = input.getAttribute('value') || '0';
            input.value = defaultValue;
        });

        // Reset all selects to first option
        document.querySelectorAll('select').forEach(select => {
            if (select.options.length > 0) {
                select.selectedIndex = 0;
            }
        });

        // Reset sliders
        [this.elements.msgVolumeSlider, this.elements.voiceMinutesSlider, this.elements.sipMinutesSlider, this.elements.inboundMinutesSlider].forEach(slider => {
            if (slider) {
                const input = document.getElementById(slider.id.replace('-slider', ''));
                if (input) {
                    slider.value = input.value;
                    this.updateSliderBackground(slider);
                }
            }
        });

        this.updatePhoneTypes();
        this.calculate();
        this.saveState();
        Utils.showToast('Calculadora reiniciada', 'info');
    },

    // Auto-save functionality
    scheduleAutoSave() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        this.elements.autoSaveText.textContent = 'Guardando...';
        this.elements.autoSaveText.style.color = 'var(--warning)';

        this.autoSaveTimer = setTimeout(() => {
            this.saveState();
            this.elements.autoSaveText.textContent = 'Auto-guardado';
            this.elements.autoSaveText.style.color = 'var(--success)';
        }, 1000);
    },

    saveState() {
        const state = {
            msgCountry: this.elements.msgCountry.selectedIndex,
            msgVolume: this.elements.msgVolume.value,
            voiceCountry: this.elements.voiceCountry.selectedIndex,
            voiceMinutes: this.elements.voiceMinutes.value,
            sipCountry: this.elements.sipCountry.selectedIndex,
            sipMinutes: this.elements.sipMinutes.value,
            inboundCountry: this.elements.inboundCountry.selectedIndex,
            inboundMinutes: this.elements.inboundMinutes.value,
            pnCountry: this.elements.pnCountry.selectedIndex,
            pnQuantity: this.elements.pnQuantity.value,
            additionalServices: {}
        };

        // Save additional services
        PricingData.additionalServices.forEach(service => {
            const input = document.getElementById(`service-input-${service.id}`);
            if (input) {
                state.additionalServices[service.id] = input.value;
            }
        });

        Utils.storage.set('calculatorState', state);
    },

    loadSavedState() {
        const state = Utils.storage.get('calculatorState');
        if (!state) return;

        try {
            if (state.msgCountry !== undefined) this.elements.msgCountry.selectedIndex = state.msgCountry;
            if (state.msgVolume) this.elements.msgVolume.value = state.msgVolume;
            if (state.voiceCountry !== undefined) this.elements.voiceCountry.selectedIndex = state.voiceCountry;
            if (state.voiceMinutes) this.elements.voiceMinutes.value = state.voiceMinutes;
            if (state.sipCountry !== undefined) this.elements.sipCountry.selectedIndex = state.sipCountry;
            if (state.sipMinutes) this.elements.sipMinutes.value = state.sipMinutes;
            if (state.inboundCountry !== undefined) this.elements.inboundCountry.selectedIndex = state.inboundCountry;
            if (state.inboundMinutes) this.elements.inboundMinutes.value = state.inboundMinutes;
            if (state.pnCountry !== undefined) this.elements.pnCountry.selectedIndex = state.pnCountry;
            if (state.pnQuantity) this.elements.pnQuantity.value = state.pnQuantity;

            // Load additional services
            if (state.additionalServices) {
                Object.keys(state.additionalServices).forEach(serviceId => {
                    const input = document.getElementById(`service-input-${serviceId}`);
                    if (input) {
                        input.value = state.additionalServices[serviceId];
                    }
                });
            }

            // Sync sliders
            if (this.elements.msgVolumeSlider) {
                this.elements.msgVolumeSlider.value = this.elements.msgVolume.value;
                this.updateSliderBackground(this.elements.msgVolumeSlider);
            }
            if (this.elements.voiceMinutesSlider) {
                this.elements.voiceMinutesSlider.value = this.elements.voiceMinutes.value;
                this.updateSliderBackground(this.elements.voiceMinutesSlider);
            }
            if (this.elements.sipMinutesSlider) {
                this.elements.sipMinutesSlider.value = this.elements.sipMinutes.value;
                this.updateSliderBackground(this.elements.sipMinutesSlider);
            }
            if (this.elements.inboundMinutesSlider) {
                this.elements.inboundMinutesSlider.value = this.elements.inboundMinutes.value;
                this.updateSliderBackground(this.elements.inboundMinutesSlider);
            }
        } catch (error) {
            console.error('Error loading saved state:', error);
        }
    },

    // AI Analysis
    async handleAiAnalysis() {
        Utils.modal.open('ai-modal');

        // Reset modal content
        this.elements.aiResponseText.innerHTML = '';
        this.elements.aiResponseText.classList.add('hidden');
        this.elements.aiLoader.classList.remove('hidden');

        const getSelectedText = (select) => select.options[select.selectedIndex].text;

        // Gather additional services summary
        let additionalServicesSummary = PricingData.additionalServices
            .map(s => {
                const input = document.getElementById(`service-input-${s.id}`);
                const value = input ? input.value : 0;
                return value > 0 ? `${value} ${s.unit} de ${s.name}` : null;
            })
            .filter(Boolean)
            .join(', ') || 'Ninguno';

        const usageData = {
            'Costo Total Estimado': this.elements.totalCost.textContent,
            'Números de Teléfono': `${this.elements.pnQuantity.value} de tipo ${getSelectedText(this.elements.pnType)} en ${this.elements.pnCountry.value}`,
            'Servicios Adicionales': additionalServicesSummary,
            'Total Mensajes SMS': `${this.elements.msgVolume.value} a ${getSelectedText(this.elements.msgCountry)}`,
            'Total Minutos de Voz Saliente': `${this.elements.voiceMinutes.value} a ${getSelectedText(this.elements.voiceCountry)}`,
            'Total Minutos SIP Trunking': `${this.elements.sipMinutes.value} a ${getSelectedText(this.elements.sipCountry)}`,
            'Total Minutos de Voz Entrante': `${this.elements.inboundMinutes.value} desde ${getSelectedText(this.elements.inboundCountry)}`
        };

        const userPrompt = `Actúa como "Alex", un avanzado y proactivo agente de IA de la consultora "World Vision Telecom". Tu personalidad es servicial, entusiasta, y experta. Tu tono debe ser cercano, profesional pero amigable, y siempre te dirigirás al usuario como "Don Richard". Tu misión principal es analizar los datos de la calculadora y, basándote en ellos, convencer a Don Richard de que el ecosistema de Twilio, y en particular Twilio Flex, es la solución superior para sus clientes (que necesitan call centers de 34 y 140 agentes) en comparación con las soluciones empaquetadas que usa actualmente. Enfócate en la flexibilidad, escalabilidad y capacidad de innovación de Twilio. Sé proactivo al sugerir soluciones concretas y da tu respuesta en español. Datos de uso del cliente: ${JSON.stringify(usageData)}`;

        const apiKey = 'AIzaSyACLZ817W8Gz3O0M3awf4VldqxYDr6J8dM';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userPrompt }] }]
                })
            });

            if (!response.ok) {
                throw new Error(`Error de la API: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo obtener una respuesta de la IA.';

            // Format response
            let htmlResponse = text
                .replace(/## (.*)/g, '<h4 class="text-lg font-bold mt-4 mb-2">$1</h4>')
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/\* (.*)/g, '<li class="ml-4 list-disc">$1</li>')
                .replace(/\n/g, '<br>');

            this.elements.aiResponseText.innerHTML = htmlResponse;
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            this.elements.aiResponseText.innerHTML = `
                <p style="color: var(--error);">¡Ups! Ocurrió un error al conectar con la IA.</p>
                <p style="color: var(--text-tertiary); font-size: 0.875rem; margin-top: 0.5rem;">${error.message}</p>
                <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.5rem;">Por favor, verifica tu clave de API, las restricciones en GCP y la conexión a internet.</p>
            `;
        } finally {
            this.elements.aiLoader.classList.add('hidden');
            this.elements.aiResponseText.classList.remove('hidden');
        }
    },

    // Export to PDF
    exportPDF() {
        const data = {
            msgCost: this.elements.msgCost.textContent,
            voiceCost: this.elements.voiceCost.textContent,
            sipCost: this.elements.sipCost.textContent,
            inboundCost: this.elements.inboundCost.textContent,
            pnCost: this.elements.pnCost.textContent,
            additionalCost: this.elements.additionalCost.textContent,
            totalCost: this.elements.totalCost.textContent,
            msgVolume: this.elements.msgVolume.value,
            msgCountry: this.elements.msgCountry.options[this.elements.msgCountry.selectedIndex].text,
            voiceMinutes: this.elements.voiceMinutes.value,
            voiceCountry: this.elements.voiceCountry.options[this.elements.voiceCountry.selectedIndex].text,
            sipMinutes: this.elements.sipMinutes.value,
            sipCountry: this.elements.sipCountry.options[this.elements.sipCountry.selectedIndex].text,
            inboundMinutes: this.elements.inboundMinutes.value,
            inboundCountry: this.elements.inboundCountry.options[this.elements.inboundCountry.selectedIndex].text,
            pnQuantity: this.elements.pnQuantity.value,
            pnType: this.elements.pnType.options[this.elements.pnType.selectedIndex].text,
            pnCountry: this.elements.pnCountry.value
        };

        Utils.exportToPDF(data);
    },

    // Scenarios Management
    saveScenario(name, description = '') {
        const scenario = {
            id: Utils.generateId(),
            name: name,
            description: description,
            date: new Date().toISOString(),
            costs: { ...this.costs },
            total: this.costs.total,
            config: {
                msgCountry: this.elements.msgCountry.selectedIndex,
                msgVolume: this.elements.msgVolume.value,
                voiceCountry: this.elements.voiceCountry.selectedIndex,
                voiceMinutes: this.elements.voiceMinutes.value,
                sipCountry: this.elements.sipCountry.selectedIndex,
                sipMinutes: this.elements.sipMinutes.value,
                inboundCountry: this.elements.inboundCountry.selectedIndex,
                inboundMinutes: this.elements.inboundMinutes.value,
                pnCountry: this.elements.pnCountry.selectedIndex,
                pnQuantity: this.elements.pnQuantity.value
            }
        };

        this.scenarios.push(scenario);
        this.saveScenarios();
        this.renderScenarios();
        Utils.showToast(`Escenario "${name}" guardado exitosamente`, 'success');
    },

    loadScenario(scenarioId) {
        const scenario = this.scenarios.find(s => s.id === scenarioId);
        if (!scenario) return;

        const config = scenario.config;

        this.elements.msgCountry.selectedIndex = config.msgCountry;
        this.elements.msgVolume.value = config.msgVolume;
        this.elements.voiceCountry.selectedIndex = config.voiceCountry;
        this.elements.voiceMinutes.value = config.voiceMinutes;
        this.elements.sipCountry.selectedIndex = config.sipCountry;
        this.elements.sipMinutes.value = config.sipMinutes;
        this.elements.inboundCountry.selectedIndex = config.inboundCountry;
        this.elements.inboundMinutes.value = config.inboundMinutes;
        this.elements.pnCountry.selectedIndex = config.pnCountry;
        this.elements.pnQuantity.value = config.pnQuantity;

        // Sync sliders
        this.elements.msgVolumeSlider.value = config.msgVolume;
        this.updateSliderBackground(this.elements.msgVolumeSlider);
        this.elements.voiceMinutesSlider.value = config.voiceMinutes;
        this.updateSliderBackground(this.elements.voiceMinutesSlider);
        this.elements.sipMinutesSlider.value = config.sipMinutes;
        this.updateSliderBackground(this.elements.sipMinutesSlider);
        this.elements.inboundMinutesSlider.value = config.inboundMinutes;
        this.updateSliderBackground(this.elements.inboundMinutesSlider);

        this.updatePhoneTypes();
        this.calculate();
        Utils.showToast(`Escenario "${scenario.name}" cargado`, 'info');
    },

    deleteScenario(scenarioId) {
        const scenario = this.scenarios.find(s => s.id === scenarioId);
        if (!scenario) return;

        if (confirm(`¿Estás seguro de eliminar el escenario "${scenario.name}"?`)) {
            this.scenarios = this.scenarios.filter(s => s.id !== scenarioId);
            this.saveScenarios();
            this.renderScenarios();
            Utils.showToast('Escenario eliminado', 'info');
        }
    },

    saveScenarios() {
        Utils.storage.set('scenarios', this.scenarios);
    },

    loadScenarios() {
        this.scenarios = Utils.storage.get('scenarios', []);
        this.renderScenarios();
    },

    renderScenarios() {
        const list = document.getElementById('scenarios-list');
        if (!list) return;

        if (this.scenarios.length === 0) {
            list.innerHTML = '<p class="empty-state">No hay escenarios guardados</p>';
            return;
        }

        list.innerHTML = '';

        this.scenarios.forEach(scenario => {
            const item = document.createElement('div');
            item.className = 'scenario-item';
            item.innerHTML = `
                <div class="scenario-header">
                    <span class="scenario-name">${scenario.name}</span>
                    <div class="scenario-actions">
                        <button class="scenario-btn" data-action="load" data-id="${scenario.id}" title="Cargar escenario">
                            <i class="fas fa-upload"></i>
                        </button>
                        <button class="scenario-btn" data-action="delete" data-id="${scenario.id}" title="Eliminar escenario">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="scenario-cost">${Utils.formatCurrency(scenario.total)}</div>
                <div class="scenario-date">${Utils.formatDate(new Date(scenario.date))}</div>
                ${scenario.description ? `<div class="scenario-description">${scenario.description}</div>` : ''}
            `;

            // Event listeners
            item.querySelector('[data-action="load"]').addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadScenario(scenario.id);
            });

            item.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteScenario(scenario.id);
            });

            item.addEventListener('click', () => this.loadScenario(scenario.id));

            list.appendChild(item);
        });
    }
};
