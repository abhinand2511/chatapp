// Simulating a server using Socket.IO client-side library
const socket = io('https://localhost:3000', { autoConnect: false });

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const loginButton = document.getElementById('login-button');
const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const roomList = document.getElementById('room-list');
const newRoomInput = document.getElementById('new-room-input');
const createRoomButton = document.getElementById('create-room-button');
const currentRoomTitle = document.getElementById('current-room');

let currentUser = '';
let currentRoom = '';
const rooms = ['General', 'Technology', 'Random'];

// Event Listeners
loginButton.addEventListener('click', login);
sendButton.addEventListener('click', sendMessage);
createRoomButton.addEventListener('click', createRoom);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Functions
function login() {
    const username = usernameInput.value.trim();
    if (username) {
        currentUser = username;
        socket.auth = { username };
        socket.connect();
        loginScreen.classList.add('hidden');
        chatScreen.classList.remove('hidden');
        updateRoomList();
        joinRoom('General');
    }
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message && currentRoom) {
        const messageData = {
            user: currentUser,
            room: currentRoom,
            message: formatMessage(message),
            timestamp: new Date().toISOString()
        };
        socket.emit('chat message', messageData);
        displayMessage(messageData);
        messageInput.value = '';
    }
}

function createRoom() {
    const roomName = newRoomInput.value.trim();
    if (roomName && !rooms.includes(roomName)) {
        rooms.push(roomName);
        updateRoomList();
        newRoomInput.value = '';
    }
}

function joinRoom(room) {
    if (currentRoom) {
        socket.emit('leave room', currentRoom);
    }
    currentRoom = room;
    socket.emit('join room', room);
    currentRoomTitle.textContent = room;
    messageContainer.innerHTML = '';
    displayMessage({
        user: 'System',
        message: `Welcome to the ${room} room!`,
        timestamp: new Date().toISOString()
    });
}

function updateRoomList() {
    roomList.innerHTML = '';
    rooms.forEach(room => {
        const li = document.createElement('li');
        li.textContent = room;
        li.addEventListener('click', () => joinRoom(room));
        roomList.appendChild(li);
    });
}

function displayMessage(messageData) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
        <span class="username">${messageData.user}</span>
        <span class="timestamp">${new Date(messageData.timestamp).toLocaleTimeString()}</span>
        <p>${messageData.message}</p>
    `;
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function formatMessage(message) {
    return message
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
}

// Socket event handlers
socket.on('chat message', (messageData) => {
    if (messageData.room === currentRoom) {
        displayMessage(messageData);
    }
});

// Initialize
updateRoomList();