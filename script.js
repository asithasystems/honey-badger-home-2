const users = [
    {
        username: 'alexa',
        password: 'home123',
        name: 'Alexa',
        houses: [
            {
                id: 'sunset-villa',
                title: 'Sunset Villa',
                address: '23 Ocean View Lane',
                mainSupply: true,
                generatorOn: false,
                rooms: [
                    {
                        name: 'Living Room',
                        devices: [
                            { id: 'living-light', label: 'Main Light', icon: 'lightbulb', type: 'light', state: true, watts: 45 },
                            { id: 'living-tv', label: 'Smart TV', icon: 'tv', type: 'tv', state: false, watts: 28 },
                            { id: 'living-ac', label: 'AC Unit', icon: 'snowflake', type: 'ac', state: true, watts: 120 }
                        ]
                    },
                    {
                        name: 'Bedroom',
                        devices: [
                            { id: 'bedroom-light', label: 'Ambient Light', icon: 'lightbulb', type: 'light', state: false, watts: 18 },
                            { id: 'bedroom-fan', label: 'Ceiling Fan', icon: 'fan', type: 'fan', state: true, watts: 35 }
                        ]
                    },
                    {
                        name: 'Kitchen',
                        devices: [
                            { id: 'kitchen-light', label: 'Kitchen Light', icon: 'lightbulb', type: 'light', state: true, watts: 25 },
                            { id: 'kitchen-heater', label: 'Water Heater', icon: 'fire', type: 'heater', state: false, watts: 150 }
                        ]
                    }
                ]
            },
            {
                id: 'city-condo',
                title: 'City Condo',
                address: '104 Downtown Avenue',
                mainSupply: false,
                generatorOn: false,
                rooms: [
                    {
                        name: 'Home Office',
                        devices: [
                            { id: 'office-light', label: 'Desk Light', icon: 'lightbulb', type: 'light', state: false, watts: 15 },
                            { id: 'office-ac', label: 'Desk AC', icon: 'snowflake', type: 'ac', state: false, watts: 90 }
                        ]
                    },
                    {
                        name: 'Entryway',
                        devices: [
                            { id: 'entry-door', label: 'Door Lock', icon: 'lock', type: 'door', state: true, watts: 2 }
                        ]
                    }
                ]
            }
        ]
    },
    {
        username: 'mike',
        password: 'secure456',
        name: 'Mike',
        houses: [
            {
                id: 'garden-home',
                title: 'Garden Home',
                address: '45 Green Meadow',
                mainSupply: true,
                generatorOn: false,
                rooms: [
                    {
                        name: 'Dining Room',
                        devices: [
                            { id: 'dining-light', label: 'Dining Light', icon: 'lightbulb', type: 'light', state: true, watts: 40 },
                            { id: 'dining-tv', label: 'Dining Display', icon: 'tv', type: 'tv', state: false, watts: 20 }
                        ]
                    },
                    {
                        name: 'Garage',
                        devices: [
                            { id: 'garage-door', label: 'Garage Door', icon: 'door-closed', type: 'door', state: false, watts: 5 }
                        ]
                    }
                ]
            }
        ]
    }
];

let currentUser = null;
let currentHouse = null;
let energyChart = null;
let autoRefresh = true;

const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const userSelect = document.getElementById('userSelect');
const passwordInput = document.getElementById('passwordInput');
const houseSelect = document.getElementById('houseSelect');
const houseSelectWrapper = document.getElementById('houseSelectWrapper');
const loginError = document.getElementById('loginError');
const dashboardTitle = document.getElementById('dashboardTitle');
const dashboardSubtitle = document.getElementById('dashboardSubtitle');
const selectedHouseName = document.getElementById('selectedHouseName');
const activeDeviceCount = document.getElementById('activeDeviceCount');
const costEstimate = document.getElementById('costEstimate');
const ecoAlertCount = document.getElementById('ecoAlertCount');
const roomsContainer = document.getElementById('roomsContainer');
const warningBanner = document.getElementById('warningBanner');
const liveClock = document.getElementById('liveClock');
const ecoSuggestions = document.getElementById('ecoSuggestions');
const chartTotal = document.getElementById('chartTotal');
const logoutBtn = document.getElementById('logoutBtn');
const autoRefreshToggle = document.getElementById('autofillHouseToggle');

function init() {
    populateUserSelect();
    loadSession();
    updateClock();
    setInterval(() => {
        updateClock();
        if (autoRefresh && currentHouse) {
            refreshDashboard();
        }
    }, 1000);
}

function populateUserSelect() {
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.username;
        option.textContent = `${user.name} (${user.username})`;
        userSelect.appendChild(option);
    });
}

function loadSession() {
    const savedUser = localStorage.getItem('smartHomeUser');
    const savedHouse = localStorage.getItem('smartHomeHouse');

    if (savedUser && savedHouse) {
        const user = users.find(u => u.username === savedUser);
        if (user) {
            const house = user.houses.find(h => h.id === savedHouse);
            if (house) {
                currentUser = user;
                currentHouse = house;
                showDashboard();
                return;
            }
        }
    }
    showLogin();
}

function showLogin() {
    loginScreen.classList.remove('d-none');
    dashboard.classList.add('d-none');
    houseSelectWrapper.classList.add('d-none');
    loginError.textContent = '';
}

function showDashboard() {
    loginScreen.classList.add('d-none');
    dashboard.classList.remove('d-none');
    currentUser && currentHouse && renderDashboard();
}

function handleLogin(event) {
    event.preventDefault();
    const username = userSelect.value;
    const password = passwordInput.value.trim();
    const user = users.find(u => u.username === username);

    if (!user || user.password !== password) {
        loginError.textContent = 'Username or password is incorrect.';
        return;
    }

    currentUser = user;
    loginError.textContent = '';

    if (user.houses.length === 1) {
        currentHouse = user.houses[0];
        saveSession();
        showDashboard();
    } else {
        renderHouseOptions();
        houseSelectWrapper.classList.remove('d-none');
    }
}

function renderHouseOptions() {
    houseSelect.innerHTML = '';
    currentUser.houses.forEach(house => {
        const option = document.createElement('option');
        option.value = house.id;
        option.textContent = `${house.title} — ${house.address}`;
        houseSelect.appendChild(option);
    });
    houseSelect.addEventListener('change', () => {
        currentHouse = currentUser.houses.find(h => h.id === houseSelect.value);
    });
}

function selectHouseAndContinue() {
    const selectedId = houseSelect.value;
    if (!selectedId) return;
    currentHouse = currentUser.houses.find(h => h.id === selectedId);
    saveSession();
    showDashboard();
}

function saveSession() {
    localStorage.setItem('smartHomeUser', currentUser.username);
    localStorage.setItem('smartHomeHouse', currentHouse.id);
}

function clearSession() {
    localStorage.removeItem('smartHomeUser');
    localStorage.removeItem('smartHomeHouse');
    currentUser = null;
    currentHouse = null;
}

function renderDashboard() {
    dashboardTitle.textContent = `Welcome back, ${currentUser.name}`;
    dashboardSubtitle.textContent = `Controlling ${currentHouse.title} with live device status.`;
    selectedHouseName.textContent = currentHouse.title;
    refreshDashboard();
}

function refreshDashboard() {
    const deviceList = currentHouse.rooms.flatMap(room => room.devices);
    const activeCount = deviceList.filter(device => device.state).length;
    const currentWatts = calculateCurrentWatts(deviceList);
    const generatorOn = !currentHouse.mainSupply && currentWatts > 0;

    currentHouse.generatorOn = generatorOn;
    activeDeviceCount.textContent = `${activeCount}/${deviceList.length}`;
    document.getElementById('currentWatts').textContent = `${currentWatts} W`;
    document.getElementById('generatorState').textContent = generatorOn ? 'On' : currentHouse.mainSupply ? 'Offline' : 'Standby';
    costEstimate.textContent = `$${calculateDailyCost(deviceList).toFixed(2)}`;
    ecoAlertCount.textContent = generateEcoSuggestions(deviceList).length;
    renderRooms();
    renderChart(deviceList);
    renderEcoSuggestions(deviceList);
    renderWarning(deviceList);
}

function renderRooms() {
    roomsContainer.innerHTML = '';
    currentHouse.rooms.forEach(room => {
        const roomCol = document.createElement('div');
        roomCol.className = 'col-md-6';
        roomCol.innerHTML = `
            <div class="room-card p-4 h-100">
                <div class="d-flex align-items-center justify-content-between mb-3">
                    <div>
                        <h3 class="h6 room-title mb-1">${room.name}</h3>
                        <p class="text-muted small mb-0">${room.devices.length} smart device${room.devices.length > 1 ? 's' : ''}</p>
                    </div>
                    <span class="badge bg-secondary">${room.devices.filter(d => d.state).length} ON</span>
                </div>
                <div class="d-flex flex-wrap gap-2">
                    ${room.devices.map(device => createDeviceChip(device)).join('')}
                </div>
            </div>
        `;
        roomsContainer.appendChild(roomCol);
    });
}

function createDeviceChip(device) {
    const statusClass = device.state ? 'on' : 'off';
    const buttonText = device.state ? 'Turn Off' : 'Turn On';
    return `
        <div class="device-chip ${statusClass}">
            <i class="fas fa-${device.icon}"></i>
            <span>${device.label}</span>
            <span class="text-muted small">${device.watts} W</span>
            <span class="badge ${device.state ? 'bg-success' : 'bg-secondary'}">${device.state ? 'On' : 'Off'}</span>
            <button class="btn btn-sm btn-device ${device.state ? 'btn-outline-danger' : 'btn-outline-primary'}" data-device-id="${device.id}">${buttonText}</button>
        </div>
    `;
}

function renderChart(devices) {
    const labels = devices.map(device => device.label);
    const data = devices.map(device => device.watts);
    const activeWatts = devices.reduce((sum, device) => sum + (device.state ? device.watts : 0), 0);
    const total = activeWatts / 100;
    chartTotal.textContent = `${total.toFixed(1)} kWh`;

    if (!energyChart) {
        const ctx = document.getElementById('energyChart').getContext('2d');
        energyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Energy use (kWh)',
                    data: [5.4, 4.9, 5.8, 6.2, 5.6, 6.8, 7.1],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79,70,229,0.2)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

function renderEcoSuggestions(devices) {
    const suggestions = generateEcoSuggestions(devices);
    ecoSuggestions.innerHTML = suggestions.map(text => `<li><i class="fas fa-leaf text-success me-2"></i>${text}</li>`).join('');
}

function generateEcoSuggestions(devices) {
    const suggestions = [];
    const onLights = devices.filter(device => device.type === 'light' && device.state);
    if (onLights.length > 0) {
        suggestions.push(`Your ${onLights.map(device => device.label).join(', ')} ${onLights.length > 1 ? 'are' : 'is'} on. Consider switching off unused lights.`);
    }
    const highLoad = devices.filter(device => device.watts >= 100 && device.state);
    if (highLoad.length > 0) {
        suggestions.push(`High-usage devices ${highLoad.map(device => device.label).join(', ')} are active. Reduce runtime to save energy.`);
    }
    if (suggestions.length === 0) {
        suggestions.push('Your home is running efficiently. Keep it up!');
    }
    return suggestions;
}

function calculateDailyCost(devices) {
    const totalWatts = devices.reduce((sum, device) => sum + (device.state ? device.watts : 0), 0);
    const kWh = totalWatts / 100;
    const pricePerKWh = 0.18;
    return kWh * pricePerKWh;
}

function renderWarning(devices) {
    const hour = new Date().getHours();
    const daytime = hour >= 7 && hour <= 18;
    const lightOn = devices.some(device => device.type === 'light' && device.state);
    warningBanner.classList.toggle('d-none', !(daytime && lightOn));
}

function calculateCurrentWatts(devices) {
    return devices.reduce((sum, device) => sum + (device.state ? device.watts : 0), 0);
}

function updateClock() {
    const now = new Date();
    liveClock.textContent = now.toLocaleTimeString([], { hour12: false });
}

function toggleDeviceState(deviceId) {
    const allDevices = currentHouse.rooms.flatMap(room => room.devices);
    const device = allDevices.find(item => item.id === deviceId);
    if (!device) return;
    device.state = !device.state;
    refreshDashboard();
}

function handleDashboardClick(event) {
    const button = event.target.closest('[data-device-id]');
    if (!button) return;
    const id = button.getAttribute('data-device-id');
    toggleDeviceState(id);
}

function handleLogout() {
    clearSession();
    showLogin();
}

document.getElementById('loginForm').addEventListener('submit', event => {
    if (houseSelectWrapper.classList.contains('d-none')) {
        handleLogin(event);
    } else {
        event.preventDefault();
        selectHouseAndContinue();
    }
});

document.addEventListener('click', handleDashboardClick);
logoutBtn.addEventListener('click', handleLogout);
autoRefreshToggle.addEventListener('change', event => {
    autoRefresh = event.target.checked;
});

init();
