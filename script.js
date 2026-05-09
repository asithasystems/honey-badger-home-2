// =========================================
// FIREBASE IMPORTS
// =========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// =========================================
// FIREBASE CONFIG
// REPLACE WITH YOUR OWN CONFIG
// =========================================
const firebaseConfig = {
    apiKey: "AIzaSyDytlj1VjjGRh9B1A5lrfoqFRyhok1KU5I",
  authDomain: "honey-badger-home-1c37d.firebaseapp.com",
  databaseURL: "https://honey-badger-home-1c37d-default-rtdb.firebaseio.com",
  projectId: "honey-badger-home-1c37d",
  storageBucket: "honey-badger-home-1c37d.firebasestorage.app",
  messagingSenderId: "495177643240",
  appId: "1:495177643240:web:b1ce824bb5db0f19fd455d"
};

// =========================================
// INITIALIZE FIREBASE
// =========================================
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========================================
// USERS DATA
// =========================================
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
                            {
                                id: 'living-light',
                                label: 'Main Light',
                                icon: 'lightbulb',
                                type: 'light',
                                state: false,
                                watts: 45
                            },

                            {
                                id: 'living-tv',
                                label: 'Smart TV',
                                icon: 'tv',
                                type: 'tv',
                                state: false,
                                watts: 28
                            },

                            {
                                id: 'living-ac',
                                label: 'AC Unit',
                                icon: 'snowflake',
                                type: 'ac',
                                state: false,
                                watts: 120
                            }
                        ]
                    },

                    {
                        name: 'Bedroom',

                        devices: [
                            {
                                id: 'bedroom-light',
                                label: 'Ambient Light',
                                icon: 'lightbulb',
                                type: 'light',
                                state: false,
                                watts: 18
                            },

                            {
                                id: 'bedroom-fan',
                                label: 'Ceiling Fan',
                                icon: 'fan',
                                type: 'fan',
                                state: false,
                                watts: 35
                            }
                        ]
                    },

                    {
                        name: 'Kitchen',

                        devices: [
                            {
                                id: 'kitchen-light',
                                label: 'Kitchen Light',
                                icon: 'lightbulb',
                                type: 'light',
                                state: false,
                                watts: 25
                            },

                            {
                                id: 'kitchen-heater',
                                label: 'Water Heater',
                                icon: 'fire',
                                type: 'heater',
                                state: false,
                                watts: 150
                            }
                        ]
                    }

                ]
            }
        ]
    }
];

// =========================================
// GLOBAL VARIABLES
// =========================================
let currentUser = null;
let currentHouse = null;
let energyChart = null;
let autoRefresh = true;

// =========================================
// HTML ELEMENTS
// =========================================
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

// =========================================
// INITIALIZE APP
// =========================================
function init() {

    populateUserSelect();

    updateClock();

    setInterval(() => {

        updateClock();

        if (autoRefresh && currentHouse) {
            refreshDashboard();
        }

    }, 1000);

    listenFirebaseStates();
}

// =========================================
// FIREBASE LIVE LISTENER
// =========================================
function listenFirebaseStates() {

    const devicesRef = ref(db, "devices");

    onValue(devicesRef, snapshot => {

        const data = snapshot.val();

        if (!data || !currentHouse) return;

        currentHouse.rooms.forEach(room => {

            room.devices.forEach(device => {

                if (data[device.id]) {

                    device.state =
                        data[device.id].state == 1;
                }

            });

        });

        refreshDashboard();

    });

}

// =========================================
// USER SELECT
// =========================================
function populateUserSelect() {

    users.forEach(user => {

        const option = document.createElement('option');

        option.value = user.username;

        option.textContent =
            `${user.name} (${user.username})`;

        userSelect.appendChild(option);

    });

}

// =========================================
// LOGIN SCREEN
// =========================================
function showLogin() {

    loginScreen.classList.remove('d-none');
    dashboard.classList.add('d-none');

}

// =========================================
// DASHBOARD SCREEN
// =========================================
function showDashboard() {

    loginScreen.classList.add('d-none');
    dashboard.classList.remove('d-none');

    renderDashboard();
}

// =========================================
// LOGIN
// =========================================
function handleLogin(event) {

    event.preventDefault();

    const username = userSelect.value;

    const password =
        passwordInput.value.trim();

    const user =
        users.find(u =>
            u.username === username &&
            u.password === password
        );

    if (!user) {

        loginError.textContent =
            'Wrong username or password';

        return;
    }

    currentUser = user;
    currentHouse = user.houses[0];

    showDashboard();
}

// =========================================
// DASHBOARD DATA
// =========================================
function renderDashboard() {

    dashboardTitle.textContent =
        `Welcome back, ${currentUser.name}`;

    dashboardSubtitle.textContent =
        `Controlling ${currentHouse.title}`;

    selectedHouseName.textContent =
        currentHouse.title;

    refreshDashboard();
}

// =========================================
// REFRESH DASHBOARD
// =========================================
function refreshDashboard() {

    const devices =
        currentHouse.rooms.flatMap(
            room => room.devices
        );

    const activeCount =
        devices.filter(
            device => device.state
        ).length;

    const currentWatts =
        calculateCurrentWatts(devices);

    activeDeviceCount.textContent =
        `${activeCount}/${devices.length}`;

    document.getElementById('currentWatts').textContent =
        `${currentWatts} W`;

    costEstimate.textContent =
        `$${calculateDailyCost(devices).toFixed(2)}`;

    ecoAlertCount.textContent =
        generateEcoSuggestions(devices).length;

    renderRooms();
    renderChart(devices);
    renderEcoSuggestions(devices);
    renderWarning(devices);
}

// =========================================
// RENDER ROOMS
// =========================================
function renderRooms() {

    roomsContainer.innerHTML = '';

    currentHouse.rooms.forEach(room => {

        const roomCol =
            document.createElement('div');

        roomCol.className = 'col-md-6';

        roomCol.innerHTML = `

            <div class="room-card p-4 h-100">

                <div class="d-flex align-items-center justify-content-between mb-3">

                    <div>
                        <h3 class="h6 room-title mb-1">
                            ${room.name}
                        </h3>

                        <p class="text-muted small mb-0">
                            ${room.devices.length} smart devices
                        </p>
                    </div>

                    <span class="badge bg-secondary">
                        ${room.devices.filter(d => d.state).length} ON
                    </span>

                </div>

                <div class="d-flex flex-wrap gap-2">
                    ${room.devices.map(device =>
                        createDeviceChip(device)).join('')}
                </div>

            </div>
        `;

        roomsContainer.appendChild(roomCol);

    });

}

// =========================================
// DEVICE CARD
// =========================================
function createDeviceChip(device) {

    return `

        <div class="device-chip ${device.state ? 'on' : 'off'}">

            <i class="fas fa-${device.icon}"></i>

            <span>${device.label}</span>

            <span class="text-muted small">
                ${device.watts} W
            </span>

            <span class="badge ${device.state ? 'bg-success' : 'bg-secondary'}">
                ${device.state ? 'ON' : 'OFF'}
            </span>

            <button
                class="btn btn-sm btn-device ${device.state ? 'btn-outline-danger' : 'btn-outline-primary'}"
                data-device-id="${device.id}">

                ${device.state ? 'Turn Off' : 'Turn On'}

            </button>

        </div>

    `;
}

// =========================================
// TOGGLE DEVICE
// =========================================
async function toggleDeviceState(deviceId) {

    const allDevices =
        currentHouse.rooms.flatMap(
            room => room.devices
        );

    const device =
        allDevices.find(
            d => d.id === deviceId
        );

    if (!device) return;

    device.state = !device.state;

    // SAVE TO FIREBASE
    await set(
        ref(db, "devices/" + device.id),
        {
            state: device.state ? 1 : 0
        }
    );

    refreshDashboard();
}

// =========================================
// CLICK EVENTS
// =========================================
function handleDashboardClick(event) {

    const button =
        event.target.closest('[data-device-id]');

    if (!button) return;

    const deviceId =
        button.getAttribute('data-device-id');

    toggleDeviceState(deviceId);
}

// =========================================
// POWER FUNCTIONS
// =========================================
function calculateCurrentWatts(devices) {

    return devices.reduce((sum, device) => {

        return sum +
            (device.state ? device.watts : 0);

    }, 0);

}

function calculateDailyCost(devices) {

    const totalWatts =
        calculateCurrentWatts(devices);

    const kWh = totalWatts / 1000;

    return kWh * 0.18;
}

// =========================================
// ECO SUGGESTIONS
// =========================================
function generateEcoSuggestions(devices) {

    const suggestions = [];

    const onLights =
        devices.filter(
            d => d.type === 'light' && d.state
        );

    if (onLights.length > 0) {

        suggestions.push(
            'Turn off unused lights to save electricity.'
        );

    }

    if (suggestions.length === 0) {

        suggestions.push(
            'Your home is energy efficient.'
        );

    }

    return suggestions;
}

// =========================================
// ECO RENDER
// =========================================
function renderEcoSuggestions(devices) {

    const suggestions =
        generateEcoSuggestions(devices);

    ecoSuggestions.innerHTML =
        suggestions.map(text => `
            <li>
                <i class="fas fa-leaf text-success me-2"></i>
                ${text}
            </li>
        `).join('');
}

// =========================================
// WARNING BANNER
// =========================================
function renderWarning(devices) {

    const hour =
        new Date().getHours();

    const daytime =
        hour >= 7 && hour <= 18;

    const lightOn =
        devices.some(
            d => d.type === 'light' && d.state
        );

    warningBanner.classList.toggle(
        'd-none',
        !(daytime && lightOn)
    );
}

// =========================================
// CLOCK
// =========================================
function updateClock() {

    const now = new Date();

    liveClock.textContent =
        now.toLocaleTimeString([], {
            hour12: false
        });

}

// =========================================
// CHART
// =========================================
function renderChart(devices) {

    const total =
        calculateCurrentWatts(devices) / 1000;

    chartTotal.textContent =
        `${total.toFixed(2)} kWh`;

    if (!energyChart) {

        const ctx =
            document.getElementById('energyChart')
            .getContext('2d');

        energyChart = new Chart(ctx, {

            type: 'line',

            data: {

                labels: [
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat',
                    'Sun'
                ],

                datasets: [{

                    label: 'Energy Use',

                    data: [5, 6, 4, 7, 5, 6, 8],

                    borderColor: '#4f46e5',

                    backgroundColor:
                        'rgba(79,70,229,0.2)',

                    tension: 0.3,

                    fill: true

                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false
            }

        });

    }

}

// =========================================
// LOGOUT
// =========================================
function handleLogout() {

    currentUser = null;
    currentHouse = null;

    showLogin();
}

// =========================================
// EVENTS
// =========================================
document
    .getElementById('loginForm')
    .addEventListener(
        'submit',
        handleLogin
    );

document
    .addEventListener(
        'click',
        handleDashboardClick
    );

logoutBtn
    .addEventListener(
        'click',
        handleLogout
    );

autoRefreshToggle
    .addEventListener(
        'change',
        event => {

            autoRefresh =
                event.target.checked;

        }
    );

// =========================================
// START APP
// =========================================
init();
