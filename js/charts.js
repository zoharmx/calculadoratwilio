// ===================================
// CHART MANAGEMENT
// ===================================

const ChartManager = {
    chart: null,
    chartColors: {
        messaging: '#3b82f6',
        voice: '#8b5cf6',
        sip: '#10b981',
        inbound: '#f59e0b',
        phoneNumbers: '#ef4444',
        additional: '#ec4899'
    },

    init() {
        this.createChart();
    },

    createChart() {
        const ctx = document.getElementById('cost-chart');
        if (!ctx) return;

        const isDark = document.body.classList.contains('dark-theme');
        const textColor = isDark ? '#cbd5e1' : '#6b7280';
        const gridColor = isDark ? '#334155' : '#e5e7eb';

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [
                    'Mensajería',
                    'Voz Saliente',
                    'SIP Trunking',
                    'Voz Entrante',
                    'Números Telefónicos',
                    'Servicios Adicionales'
                ],
                datasets: [{
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: [
                        this.chartColors.messaging,
                        this.chartColors.voice,
                        this.chartColors.sip,
                        this.chartColors.inbound,
                        this.chartColors.phoneNumbers,
                        this.chartColors.additional
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${Utils.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%',
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    },

    updateChart(costs) {
        if (!this.chart) return;

        const data = [
            costs.messaging || 0,
            costs.voice || 0,
            costs.sip || 0,
            costs.inbound || 0,
            costs.phoneNumbers || 0,
            costs.additional || 0
        ];

        this.chart.data.datasets[0].data = data;
        this.chart.update('active');
    },

    updateTheme() {
        if (!this.chart) return;

        const isDark = document.body.classList.contains('dark-theme');
        const textColor = isDark ? '#cbd5e1' : '#6b7280';
        const gridColor = isDark ? '#334155' : '#e5e7eb';

        this.chart.options.plugins.tooltip.backgroundColor = isDark ? '#1e293b' : '#ffffff';
        this.chart.options.plugins.tooltip.titleColor = textColor;
        this.chart.options.plugins.tooltip.bodyColor = textColor;
        this.chart.options.plugins.tooltip.borderColor = gridColor;

        this.chart.update('none');
    },

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    },

    // Create comparison chart for scenarios
    createComparisonChart(scenarios) {
        const modal = document.getElementById('comparison-content');
        if (!modal) return;

        // Clear existing content
        modal.innerHTML = '';

        if (!scenarios || scenarios.length < 2) {
            modal.innerHTML = '<p class="empty-state">Selecciona al menos 2 escenarios para comparar</p>';
            return;
        }

        // Create canvas for comparison chart
        const chartContainer = document.createElement('div');
        chartContainer.style.height = '400px';
        chartContainer.style.marginBottom = '2rem';
        chartContainer.innerHTML = '<canvas id="comparison-chart"></canvas>';
        modal.appendChild(chartContainer);

        const ctx = document.getElementById('comparison-chart');
        const isDark = document.body.classList.contains('dark-theme');
        const textColor = isDark ? '#cbd5e1' : '#6b7280';
        const gridColor = isDark ? '#334155' : '#e5e7eb';

        const labels = scenarios.map(s => s.name);
        const datasets = [
            {
                label: 'Mensajería',
                data: scenarios.map(s => s.costs.messaging || 0),
                backgroundColor: this.chartColors.messaging + '80',
                borderColor: this.chartColors.messaging,
                borderWidth: 2
            },
            {
                label: 'Voz Saliente',
                data: scenarios.map(s => s.costs.voice || 0),
                backgroundColor: this.chartColors.voice + '80',
                borderColor: this.chartColors.voice,
                borderWidth: 2
            },
            {
                label: 'SIP Trunking',
                data: scenarios.map(s => s.costs.sip || 0),
                backgroundColor: this.chartColors.sip + '80',
                borderColor: this.chartColors.sip,
                borderWidth: 2
            },
            {
                label: 'Voz Entrante',
                data: scenarios.map(s => s.costs.inbound || 0),
                backgroundColor: this.chartColors.inbound + '80',
                borderColor: this.chartColors.inbound,
                borderWidth: 2
            },
            {
                label: 'Números',
                data: scenarios.map(s => s.costs.phoneNumbers || 0),
                backgroundColor: this.chartColors.phoneNumbers + '80',
                borderColor: this.chartColors.phoneNumbers,
                borderWidth: 2
            },
            {
                label: 'Adicionales',
                data: scenarios.map(s => s.costs.additional || 0),
                backgroundColor: this.chartColors.additional + '80',
                borderColor: this.chartColors.additional,
                borderWidth: 2
            }
        ];

        new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: textColor,
                            padding: 15,
                            font: {
                                size: 12,
                                weight: 500
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${Utils.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            color: gridColor,
                            display: false
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        stacked: true,
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                return Utils.formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });

        // Add detailed comparison table
        const table = document.createElement('div');
        table.className = 'comparison-grid';

        scenarios.forEach(scenario => {
            const card = document.createElement('div');
            card.className = 'comparison-card';
            card.innerHTML = `
                <div class="comparison-card-header">${scenario.name}</div>
                <div class="comparison-item">
                    <span class="comparison-label">Total:</span>
                    <span class="comparison-value">${Utils.formatCurrency(scenario.total)}</span>
                </div>
                <div class="comparison-item">
                    <span class="comparison-label">Mensajería:</span>
                    <span class="comparison-value">${Utils.formatCurrency(scenario.costs.messaging || 0)}</span>
                </div>
                <div class="comparison-item">
                    <span class="comparison-label">Voz Saliente:</span>
                    <span class="comparison-value">${Utils.formatCurrency(scenario.costs.voice || 0)}</span>
                </div>
                <div class="comparison-item">
                    <span class="comparison-label">SIP Trunking:</span>
                    <span class="comparison-value">${Utils.formatCurrency(scenario.costs.sip || 0)}</span>
                </div>
                <div class="comparison-item">
                    <span class="comparison-label">Voz Entrante:</span>
                    <span class="comparison-value">${Utils.formatCurrency(scenario.costs.inbound || 0)}</span>
                </div>
                <div class="comparison-item">
                    <span class="comparison-label">Números:</span>
                    <span class="comparison-value">${Utils.formatCurrency(scenario.costs.phoneNumbers || 0)}</span>
                </div>
                <div class="comparison-item">
                    <span class="comparison-label">Adicionales:</span>
                    <span class="comparison-value">${Utils.formatCurrency(scenario.costs.additional || 0)}</span>
                </div>
                ${scenario.description ? `<div class="scenario-description" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">${scenario.description}</div>` : ''}
            `;
            table.appendChild(card);
        });

        modal.appendChild(table);
    }
};
