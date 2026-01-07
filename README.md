# Calculadora Estratégica Twilio

Una aplicación web moderna y profesional para calcular costos de servicios de Twilio con análisis de IA, visualización de datos y gestión de escenarios.

## Características Principales

### 🎨 Diseño Moderno y Responsivo
- Interfaz de usuario elegante con animaciones suaves
- Diseño totalmente responsivo para todos los dispositivos
- Sistema de pestañas para organizar diferentes servicios
- Modo oscuro/claro con cambio instantáneo

### 📊 Visualización de Datos
- Gráficos interactivos con Chart.js
- Desglose visual de costos por categoría
- Comparación de escenarios múltiples
- Exportación de reportes a PDF

### 🤖 Análisis de IA
- Integración con Gemini AI (Google)
- Análisis personalizado de costos
- Recomendaciones estratégicas
- Análisis comparativo con soluciones alternativas

### 💾 Gestión de Escenarios
- Guardar configuraciones como escenarios
- Cargar y comparar múltiples escenarios
- Persistencia local con LocalStorage
- Auto-guardado automático

### 🚀 Progressive Web App (PWA)
- Instalable en dispositivos móviles y desktop
- Funciona offline con Service Worker
- Cache inteligente de recursos
- Actualizaciones automáticas

### ⌨️ Atajos de Teclado
- `Ctrl/Cmd + S`: Guardar escenario
- `Ctrl/Cmd + R`: Reiniciar calculadora
- `Ctrl/Cmd + K`: Comparar escenarios
- `Ctrl/Cmd + D`: Cambiar tema
- `Ctrl/Cmd + P`: Exportar a PDF
- `Esc`: Cerrar modales

## Servicios Calculados

### 📱 Mensajería SMS
- SMS salientes a múltiples países
- Precios por mensaje
- Control deslizante para ajuste rápido

### 📞 Llamadas de Voz
- Llamadas salientes
- Llamadas entrantes
- SIP Trunking
- Precios por minuto

### #️⃣ Números Telefónicos
- Números locales
- Números toll-free
- Tarifas mensuales por país

### ⚙️ Servicios Adicionales
- Voice Intelligence
- Detección de contestador automático
- Grabación de llamadas SIP
- Verify API
- Lookup API
- Transcripción de voz

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesible
- **CSS3**: Variables CSS, Grid, Flexbox, animaciones
- **JavaScript (ES6+)**: Módulos, async/await, clases
- **Chart.js**: Visualización de datos
- **jsPDF**: Exportación a PDF
- **Google Gemini AI**: Análisis inteligente
- **Service Worker**: Funcionalidad offline
- **LocalStorage**: Persistencia de datos

## Estructura del Proyecto

```
calculadora-twilio/
├── index.html              # Página principal
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── css/
│   └── styles.css         # Estilos principales
├── js/
│   ├── app.js             # Aplicación principal
│   ├── calculator.js      # Lógica de la calculadora
│   ├── charts.js          # Gestión de gráficos
│   ├── data.js            # Datos de precios
│   └── utils.js           # Utilidades
└── .vercel/
    └── project.json       # Configuración Vercel
```

## Instalación y Uso

### Uso Local

1. Clona el repositorio:
```bash
git clone https://github.com/zoharmx/calculadoratwilio.git
cd calculadoratwilio
```

2. Abre `index.html` en tu navegador o usa un servidor local:
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (http-server)
npx http-server
```

3. Visita `http://localhost:8000` en tu navegador

### Despliegue en Vercel

El proyecto está configurado para despliegue automático en Vercel:

1. Conecta tu repositorio de GitHub a Vercel
2. Vercel detectará automáticamente la configuración
3. El sitio se desplegará automáticamente en cada push

## Configuración

### API de Gemini

Para usar el análisis de IA, necesitas una API key de Google Gemini:

1. Obtén tu API key en [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Reemplaza la API key en `js/calculator.js`:

```javascript
const apiKey = 'TU_API_KEY_AQUI';
```

### Personalización

#### Colores y Tema
Modifica las variables CSS en `css/styles.css`:

```css
:root {
    --primary: #4f46e5;
    --secondary: #8b5cf6;
    /* ... más variables */
}
```

#### Datos de Precios
Actualiza los precios en `js/data.js`:

```javascript
const TwilioPricingData = {
    messagingCSV: `...`,
    voiceCSV: `...`,
    /* ... más datos */
};
```

## Características Técnicas

### Rendimiento
- Carga inicial optimizada
- Lazy loading de recursos
- Debouncing en cálculos
- Cache inteligente con Service Worker

### Accesibilidad
- ARIA labels en todos los elementos interactivos
- Navegación por teclado completa
- Contraste de colores WCAG AA
- Soporte para lectores de pantalla

### Compatibilidad
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+
- Dispositivos móviles iOS/Android

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es propiedad de **World Vision Telecom**.

## Contacto

- **Proyecto**: Calculadora Estratégica Twilio
- **Repositorio**: [github.com/zoharmx/calculadoratwilio](https://github.com/zoharmx/calculadoratwilio)
- **Desarrollado por**: World Vision Telecom
- **Análisis de IA**: Alex (Gemini AI)

---

**Powered by World Vision Telecom** | Análisis de IA por **Alex**
