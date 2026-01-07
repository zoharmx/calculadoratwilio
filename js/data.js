// ===================================
// TWILIO PRICING DATA
// ===================================

const TwilioPricingData = {
    // SMS Messaging Data
    messagingCSV: `country_code,country_name,iso2,outbound_sms_price_usd
1,United States,US,0.0079
52,Mexico,MX,0.0160
57,Colombia,CO,0.0150
1,Canada,CA,0.0079
44,United Kingdom,GB,0.0480
34,Spain,ES,0.0800
33,France,FR,0.0950
49,Germany,DE,0.0750
39,Italy,IT,0.0820
351,Portugal,PT,0.0600
54,Argentina,AR,0.0420
55,Brazil,BR,0.0250
56,Chile,CL,0.0380
51,Peru,PE,0.0450`,

    // Voice Outbound Data
    voiceCSV: `prefix,prefix_name,outbound_call_price_usd
1,United States,0.013
52,Mexico,0.019
57,Colombia,0.085
1,Canada,0.013
44,United Kingdom,0.025
34,Spain,0.035
33,France,0.028
49,Germany,0.022
39,Italy,0.031
351,Portugal,0.026
54,Argentina,0.042
55,Brazil,0.038
56,Chile,0.045
51,Peru,0.052`,

    // SIP Trunking Data
    sipCSV: `prefix,prefix_name,outbound_call_price_usd
1,United States,0.0045
52,Mexico,0.0100
57,Colombia,0.0220
1,Canada,0.0045
44,United Kingdom,0.0080
34,Spain,0.0120
33,France,0.0095
49,Germany,0.0070
39,Italy,0.0110
351,Portugal,0.0085`,

    // Inbound Calls Data
    inboundCSV: `country_code,country_name,inbound_call_price_usd
1,United States,0.0085
1,Canada,0.0115
52,Mexico,0.0115
57,Colombia,0.0115
44,United Kingdom,0.0125
34,Spain,0.0145
33,France,0.0135
49,Germany,0.0105
39,Italy,0.0155`,

    // Phone Numbers Data
    phoneNumbersCSV: `iso_country,number_type,monthly_fee_usd
US,Local,1.15
US,Toll-Free,2.15
CA,Local,1.15
CA,Toll-Free,2.15
MX,Local,6.15
MX,Toll-Free,8.15
CO,Local,4.15
GB,Local,1.50
GB,Toll-Free,3.00
ES,Local,2.50
FR,Local,2.00
DE,Local,1.75
IT,Local,2.25
AR,Local,5.00
BR,Local,3.50
CL,Local,4.50`,

    // Additional Services Data
    additionalServices: [
        {
            id: 'voice-intelligence',
            name: 'Voice Intelligence (minutos)',
            description: 'Transcripción automática y análisis de llamadas',
            price: 0.0025,
            unit: 'min',
            category: 'AI'
        },
        {
            id: 'amd',
            name: 'Detección de Contestador (llamadas)',
            description: 'Detecta cuando una máquina contesta la llamada',
            price: 0.0055,
            unit: 'call',
            category: 'Voice'
        },
        {
            id: 'sip-recording',
            name: 'Grabación SIP (minutos)',
            description: 'Grabación de llamadas SIP',
            price: 0.0025,
            unit: 'min',
            category: 'Recording'
        },
        {
            id: 'verify',
            name: 'Verify API (verificaciones)',
            description: 'Autenticación de dos factores vía SMS/Voz',
            price: 0.05,
            unit: 'verification',
            category: 'Security'
        },
        {
            id: 'lookup',
            name: 'Lookup API (consultas)',
            description: 'Validación y enriquecimiento de números',
            price: 0.005,
            unit: 'lookup',
            category: 'Data'
        },
        {
            id: 'transcription',
            name: 'Transcripción de Voz (minutos)',
            description: 'Transcripción de audio a texto',
            price: 0.05,
            unit: 'min',
            category: 'AI'
        }
    ]
};

// Utility function to parse CSV
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index] ? values[index].trim() : '';
            return obj;
        }, {});
    });
}

// Export parsed data
const PricingData = {
    messaging: parseCSV(TwilioPricingData.messagingCSV).map(item => ({
        ...item,
        name_with_code: `${item.country_name} (+${item.country_code})`
    })),

    voice: parseCSV(TwilioPricingData.voiceCSV).map(item => ({
        ...item,
        name_with_prefix: `${item.prefix_name} (+${item.prefix})`
    })),

    sip: parseCSV(TwilioPricingData.sipCSV).map(item => ({
        ...item,
        name_with_prefix: `${item.prefix_name} (+${item.prefix})`
    })),

    inbound: parseCSV(TwilioPricingData.inboundCSV).map(item => ({
        ...item,
        name_with_code: `${item.country_name} (+${item.country_code})`
    })),

    phoneNumbers: parseCSV(TwilioPricingData.phoneNumbersCSV),

    additionalServices: TwilioPricingData.additionalServices
};
