// ================= FIREBASE CONFIG =================
const firebaseConfig = {
    apiKey: "",
    databaseURL: "https://honey-badger-home-1c37d-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// ================= USERS =================
const users = [
    {
        username: "alexa",
        password: "123",
        name: "Alexa",
        rooms: [
            {
                name: "Living Room",
                devices: [
                    { id: "living-light", label: "Light", icon: "lightbulb", state: false },
                    { id: "living-fan", label: "Fan", icon: "fan", state: false }
                ]
            }
        ]
    }
];

let currentUser = null;


// ================= ELEMENTS =================
const loginForm = document.getElementById("loginForm");
const userSelect = document.getElementById("userSelect");
const passwordInput = document.getElementById("passwordInput");

const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");

const roomsContainer = document.getElementById("roomsContainer");
const dashboardTitle = document.getElementById("dashboardTitle");


// ================= INIT =================
function init() {
    users.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u.username;
        opt.innerText = u.username;
        userSelect.appendChild(opt);
    });
}

init();


// ================= LOGIN =================
loginForm.addEventListener("submit", e => {
    e.preventDefault();

    const user = users.find(u => u.username === userSelect.value);

    if (!user || user.password !== passwordInput.value) {
        alert("Wrong login");
        return;
    }

    currentUser = user;

    loginScreen.classList.add("d-none");
    dashboard.classList.remove("d-none");

    dashboardTitle.innerText = "Welcome " + user.name;

    renderUI();
    startLiveSync();
});


// ================= RENDER UI =================
function renderUI() {
    roomsContainer.innerHTML = "";

    currentUser.rooms.forEach(room => {

        const div = document.createElement("div");

        div.innerHTML = `
            <h4>${room.name}</h4>
        `;

        room.devices.forEach(device => {

            const btn = document.createElement("button");

            btn.innerText = device.label;
            btn.className = "btn btn-primary m-2";

            btn.onclick = () => toggleDevice(device.id);

            div.appendChild(btn);
        });

        roomsContainer.appendChild(div);
    });
}


// ================= TOGGLE DEVICE =================
function toggleDevice(id) {

    const ref = db.ref("devices/" + id);

    ref.once("value").then(snap => {
        const val = snap.val();
        const newVal = val === 1 ? 0 : 1;

        ref.set(newVal);
    });
}


// ================= LIVE SYNC =================
function startLiveSync() {

    db.ref("devices").on("value", snap => {
        const data = snap.val();

        if (!data) return;

        currentUser.rooms.forEach(room => {
            room.devices.forEach(device => {

                if (data[device.id] !== undefined) {
                    device.state = data[device.id] === 1;
                }

            });
        });

        updateUI();
    });
}


// ================= UPDATE UI =================
function updateUI() {

    const buttons = document.querySelectorAll("button");

    buttons.forEach(btn => {

        const label = btn.innerText;

        const device = currentUser.rooms[0].devices.find(d => d.label === label);

        if (device) {
            btn.className = device.state
                ? "btn btn-success m-2"
                : "btn btn-danger m-2";
        }
    });
}
