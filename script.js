// Lógica de autenticación
if (!localStorage.getItem('username')) {
    window.location.href = "index.html";
}

function logout() {
    localStorage.removeItem('username');
    alert("¡Has cerrado sesión correctamente!");
    window.location.href = "index.html";
}

// Lógica de pestañas
function showTab(tabIndex) {
    const allTabs = document.querySelectorAll('.tab-content');
    const allTabButtons = document.querySelectorAll('.tab');

    allTabs.forEach(tab => tab.classList.remove('active-content'));
    allTabButtons.forEach(button => button.classList.remove('active-tab'));

    // CORRECCIÓN: Se usaban comillas simples en lugar de template literals.
    document.getElementById(`tab-${tabIndex}`).classList.add('active-content');
    allTabButtons[tabIndex].classList.add('active-tab');
}

// Lógica de la aplicación web (simulando tu script de Python)
let isConnected = false;
let dataInterval = null;
let dataBuffer = [];
let chart;
let startTime = null;

const uiElements = {
    status: document.getElementById('status'),
    distance: document.getElementById('distance'),
    battery: document.getElementById('battery'),
    redLight: document.getElementById('red-light'),
    yellowLight: document.getElementById('yellow-light'),
    greenLight: document.getElementById('green-light'),
    gpsTime: document.getElementById('gps-time'),
    gpsLat: document.getElementById('gps-lat'),
    gpsLng: document.getElementById('gps-lng'),
    mapButton: document.getElementById('map-button'),
    simMode: document.getElementById('sim-mode'),
    historyBody: document.getElementById('history-body'),
    logOutput: document.getElementById('log-output'),
};

const settings = {
    redThresh: 50.0,
    yellowThresh: 100.0,
    battWarn: 20.0,
    esp32Ip: '192.168.100.17',
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587,
    emailUser: '',
    emailPass: '',
    emailTo: ''
};

function logEvent(message) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    // CORRECCIÓN: Se usaban comillas simples en lugar de template literals.
    uiElements.logOutput.value += `[${now}] ${message}\n`;
    uiElements.logOutput.scrollTop = uiElements.logOutput.scrollHeight;
}

function saveSettings() {
    settings.redThresh = parseFloat(document.getElementById('red-thresh').value);
    settings.yellowThresh = parseFloat(document.getElementById('yellow-thresh').value);
    settings.battWarn = parseFloat(document.getElementById('batt-warn').value);
    settings.esp32Ip = document.getElementById('esp32-ip').value;

    logEvent("Configuraciones de umbrales y IP guardadas.");
    alert("Configuraciones guardadas.");
}

function saveEmailSettings() {
    settings.smtpServer = document.getElementById('smtp-server').value;
    settings.smtpPort = parseInt(document.getElementById('smtp-port').value);
    settings.emailUser = document.getElementById('email-user').value;
    settings.emailPass = document.getElementById('email-pass').value;
    settings.emailTo = document.getElementById('email-to').value;

    logEvent("Credenciales de email guardadas.");
    alert("Credenciales de email guardadas.");
}

function toggleConnection() {
    if (dataInterval) {
        clearInterval(dataInterval);
        dataInterval = null;
        isConnected = false;
        logEvent("Conexión detenida.");
        uiElements.status.textContent = "Desconectado";
        uiElements.status.style.color = "red";
        updateTrafficLight(-1);
    } else {
        isConnected = true;
        // CORRECCIÓN: Se usaban comillas dobles en lugar de template literals.
        logEvent(`Conexión iniciada en modo ${uiElements.simMode.checked ? "simulación" : "real"}.`);
        uiElements.status.textContent = "Conectado";
        uiElements.status.style.color = "green";
        startTime = new Date().getTime() / 1000;
        dataInterval = setInterval(simulateData, 500);
    }
}

let simulatedBattery = 100.0;
let lat = 22.2575, lng = -97.8333;

function simulateData() {
    if (!isConnected) return;

    const distance = Math.random() * 250;
    simulatedBattery = Math.max(0, simulatedBattery - 0.05);

    lat += (Math.random() - 0.5) * 0.0002;
    lng += (Math.random() - 0.5) * 0.0002;

    const now = new Date();
    const data = {
        distance: distance.toFixed(1),
        battery: simulatedBattery.toFixed(1),
        time: now.toLocaleTimeString(),
        lat: lat.toFixed(6),
        lng: lng.toFixed(6)
    };

    updateDashboard(data);
    updateGraph(data);
    updateHistory(data);
    dataBuffer.push(data);
}

function updateDashboard(data) {
    // CORRECCIÓN: Se usaban comillas simples en lugar de template literals.
    uiElements.distance.textContent = `${data.distance} cm`;
    uiElements.battery.textContent = `${data.battery} %`;
    uiElements.gpsTime.textContent = data.time;
    uiElements.gpsLat.textContent = data.lat;
    uiElements.gpsLng.textContent = data.lng;

    updateTrafficLight(parseFloat(data.distance));

    if (parseFloat(data.battery) <= settings.battWarn) {
        uiElements.battery.style.color = 'red';
    } else {
        uiElements.battery.style.color = 'black';
    }

    if (data.lat !== "N/A" && data.lng !== "N/A") {
        uiElements.mapButton.disabled = false;
    } else {
        uiElements.mapButton.disabled = true;
    }
}

function updateTrafficLight(distance) {
    uiElements.redLight.classList.remove('red');
    uiElements.yellowLight.classList.remove('yellow');
    uiElements.greenLight.classList.remove('green');

    uiElements.distance.style.color = 'black';

    if (distance === -1 || isNaN(distance)) {
        return;
    }

    if (distance < settings.redThresh) {
        uiElements.redLight.classList.add('red');
        uiElements.distance.style.color = 'red';
    } else if (distance < settings.yellowThresh) {
        uiElements.yellowLight.classList.add('yellow');
        uiElements.distance.style.color = 'orange';
    } else {
        uiElements.greenLight.classList.add('green');
        uiElements.distance.style.color = 'green';
    }
}

function updateGraph(data) {
    const elapsed = (new Date().getTime() / 1000) - startTime;
    if (chart.data.labels.length > 50) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.data.labels.push(elapsed.toFixed(1));
    chart.data.datasets[0].data.push(data.distance);
    chart.update();
}

function updateHistory(data) {
    const row = uiElements.historyBody.insertRow(0);
    row.insertCell(0).textContent = data.time;
    row.insertCell(1).textContent = data.distance;
    row.insertCell(2).textContent = data.battery;
    row.insertCell(3).textContent = data.lat;
    row.insertCell(4).textContent = data.lng;
    if (uiElements.historyBody.rows.length > 500) {
        uiElements.historyBody.deleteRow(500);
    }
}

function emergencyAction() {
    logEvent("¡EMERGENCIA! Botón presionado.");
    if (confirm("¿Está seguro de que desea enviar una alerta de emergencia?")) {
        logEvent("Alerta de emergencia enviada (simulada).");
        alert("Alerta de emergencia enviada (simulada).");
    } else {
        logEvent("Envío de alerta cancelado.");
    }
}

function viewOnMap() {
    const lat = uiElements.gpsLat.textContent;
    const lng = uiElements.gpsLng.textContent;
    if (lat !== "N/A" && lng !== "N/A") {
        // CORRECCIÓN: Se usaban comillas simples en lugar de template literals.
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=$${lat},${lng}`;
        window.open(mapUrl, '_blank');
        // CORRECCIÓN: Se usaban comillas simples en lugar de template literals.
        logEvent(`Abriendo Google Maps para ${lat},${lng}`);
    }
}

function exportCsv() {
    if (dataBuffer.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Hora,Distancia_cm,Batería_porcentaje,Latitud,Longitud\n";

    dataBuffer.forEach(row => {
        // CORRECCIÓN: Se usaban comillas simples en lugar de template literals.
        csvContent += `${row.time},${row.distance},${row.battery},${row.lat},${row.lng}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historial.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logEvent("Datos exportados a historial.csv");
    alert("Datos exportados correctamente.");
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    showTab(0);

    // Inicializar la gráfica
    const ctx = document.getElementById('distanceChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Distancia (cm)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo (s)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Distancia (cm)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
    toggleConnection(); // Inicia la simulación por defecto
});