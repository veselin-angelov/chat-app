console.log('Started');

const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 10);
};

// Message types enum (from server)
const IncomingMessageType = {
  SEND_MESSAGE: 'send-message',
  LIST_ROOMS: 'list-rooms',
  LIST_USERS: 'list-users',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  DIRECT_MESSAGE: 'direct-message',
  GET_HISTORY: 'get-history',
};

const OutgoingMessageType = {
  ACK: 'ack',
  ERROR: 'error',
  MESSAGE: 'message',
  ROOMS_LIST: 'rooms-list',
  USERS_LIST: 'users-list',
  ROOM_HISTORY: 'room-history',
  DIRECT_MESSAGE: 'direct-message',
  USER_CONNECTED: 'user-connected',
};

// DOM Elements
const connectBtn = document.getElementById('connect-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const statusDisplay = document.getElementById('status');
const form = document.getElementById('form');
const messageInput = document.getElementById('message');
const messages = document.getElementById('messages');
const sendBtn = document.getElementById('send-btn');
const refreshRoomsBtn = document.getElementById('refresh-rooms-btn');
const roomList = document.getElementById('room-list');
const roomHeader = document.getElementById('room-header');
const currentRoomName = document.getElementById('current-room-name');
const showUsersBtn = document.getElementById('show-users-btn');
const usersPanel = document.getElementById('users-panel');
const closeUsersPanel = document.getElementById('close-users-panel');
const usersList = document.getElementById('users-list');

// State
let socket = null;
let rooms = [];
let selectedRoomId = null;
let roomUsers = [];
let subscribedRooms = new Set(); // Keep track of subscribed rooms
let unreadMessages = new Map(); // Add a map to keep track of unread message counts
let isLoadingHistory = false; // Track if history is currently loading
let currentUser = { id: null, username: null }; // Track current user info

// Message handlers
const handlePing = (data) => {
  // Handle ping if needed
};

const handleAck = (data) => {
  console.log(`Message ${data.id} acknowledged`);

  // If this is an acknowledgment for a subscription, the server might include user info
  if (data.user) {
    // Store our user ID and username if available
    if (data.user.id && currentUser.id === null) {
      currentUser.id = data.user.id;
      console.log(`Identified current user: ${data.user.id}`);
    }
    if (data.user.username && currentUser.username === null) {
      currentUser.username = data.user.username;
    }
  }
};

const handleError = (data) => {
  console.error(`Error for message ${data.id}: ${data.message}`);

  // If we're waiting for history and get an error, clear the loading state
  if (isLoadingHistory) {
    isLoadingHistory = false;
    clearChat();

    // Show error message in the chat area
    const errorItem = document.createElement('li');
    errorItem.className = 'error-message';
    errorItem.textContent = `Error loading history: ${data.message}`;
    messages.appendChild(errorItem);
    return;
  }

  // Show alert for other errors
  alert(`Error: ${data.message}`);
};

const handleRoomsList = (data) => {
  updateRoomList(data.rooms);
};

const handleUsersList = (data) => {
  updateUsersList(data.users);
};

const handleMessage = (data) => {
  // Check if this message is from the current room or a subscribed room
  const isFromCurrentRoom = data.room === selectedRoomId;
  const isFromSubscribedRoom = subscribedRooms.has(data.room);
  const isOwnMessage = data.from.id === currentUser.id;

  // Always add messages from current room to the chat
  if (isFromCurrentRoom) {
    addMessageToChat({
      sender: isOwnMessage ? 'You' : data.from.username,
      senderId: data.from.id,
      content: data.message,
      sent: isOwnMessage,
    });
  }
  // For messages from subscribed rooms (but not current), show notification
  else if (isFromSubscribedRoom && !isOwnMessage) {
    showRoomNotification(data.room, data.from.username, data.message);

    // Find and highlight the room in the sidebar
    highlightRoom(data.room);
  }
};

const handleDirectMessage = (data) => {
  addMessageToChat({
    sender: data.from.username,
    senderId: data.from.id,
    content: data.message,
    sent: false,
    isDirect: true,
  });
};

const handleRoomHistory = (data) => {
  // Clear existing messages (removes loading indicator)
  clearChat();
  isLoadingHistory = false;

  // Sort messages by timestamp (oldest first so they appear in chronological order)
  const sortedMessages = [...data.messages].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );

  if (sortedMessages.length === 0) {
    // Show empty state message
    const emptyItem = document.createElement('li');
    emptyItem.className = 'empty-history';
    emptyItem.textContent =
      'No messages in this room yet. Start the conversation!';
    messages.appendChild(emptyItem);
    return;
  }

  // Add each message to the chat
  sortedMessages.forEach((message) => {
    // Use the currentUser.id provided by the server to determine if this is our message
    const isOwnMessage = message.userId === currentUser.id;

    addMessageToChat({
      sender: isOwnMessage ? 'You' : message.username,
      senderId: message.userId,
      content: message.content,
      sent: isOwnMessage,
    });
  });

  // Scroll to bottom after adding all messages
  messages.scrollTop = messages.scrollHeight;
};

// Helper function to add messages to the chat
const addMessageToChat = ({
  sender,
  senderId,
  content,
  sent = false,
  isDirect = false,
}) => {
  // Remove the empty state message if it exists
  const emptyStateMessage = messages.querySelector('.empty-history');
  if (emptyStateMessage) {
    emptyStateMessage.remove();
  }

  const item = document.createElement('li');
  item.dataset.sent = sent;
  if (isDirect) item.dataset.direct = true;
  if (senderId) item.dataset.senderId = senderId;

  const senderEl = document.createElement('div');
  senderEl.className = 'sender';
  senderEl.textContent = sent ? 'You' : sender;

  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';
  contentEl.textContent = content;

  item.appendChild(senderEl);
  item.appendChild(contentEl);

  messages.appendChild(item);

  // Scroll to bottom
  messages.scrollTop = messages.scrollHeight;
};

// Helper function to show a notification for a room message
const showRoomNotification = (roomId, sender, message) => {
  // Find room name
  const room = rooms.find((r) => r.id === roomId);
  const roomName = room ? room.name || room.id : roomId;

  // Create notification
  const notification = document.createElement('div');
  notification.className = 'notification';

  // Add room name
  const roomEl = document.createElement('div');
  roomEl.className = 'notification-room';
  roomEl.textContent = roomName;

  // Add message preview
  const messageEl = document.createElement('div');
  messageEl.className = 'notification-message';
  messageEl.textContent = `${sender}: ${message.length > 30 ? message.substring(0, 27) + '...' : message}`;

  // Add to notification
  notification.appendChild(roomEl);
  notification.appendChild(messageEl);

  // Add notification to document
  document.body.appendChild(notification);

  // Set up click handler to go to that room
  notification.addEventListener('click', () => {
    const roomObj = rooms.find((r) => r.id === roomId);
    if (roomObj) {
      selectRoom(roomObj);
    }
    // Remove notification
    notification.remove();
  });

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('hiding');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
};

// Highlight a room in the sidebar to indicate new messages
const highlightRoom = (roomId) => {
  const roomItem = document.querySelector(
    `.room-list li[data-room-id="${roomId}"]`,
  );
  if (roomItem) {
    // Increment the unread message count
    const currentCount = unreadMessages.get(roomId) || 0;
    unreadMessages.set(roomId, currentCount + 1);

    // Add the has-new-messages class if not already present
    roomItem.classList.add('has-new-messages');

    // Find or create the counter element
    let counter = roomItem.querySelector('.message-counter');
    if (!counter) {
      counter = document.createElement('span');
      counter.className = 'message-counter';
      const roomName = roomItem.querySelector('.room-name');
      roomName.appendChild(counter);
    }

    // Update the counter text
    counter.textContent = unreadMessages.get(roomId);
  }
};

// Handle user connection information received from the server
const handleUserConnected = (data) => {
  console.log('Received user information:', data);

  // Store user ID and username
  if (data.user) {
    if (data.user.id) {
      currentUser.id = data.user.id;
      console.log(`User identified: ${data.user.id}`);
    }

    if (data.user.username) {
      currentUser.username = data.user.username;
      console.log(`Username: ${data.user.username}`);
    }
  }

  // If server sent subscribed rooms, update our tracking
  if (data.subscribedRooms && Array.isArray(data.subscribedRooms)) {
    // Clear existing subscriptions and add the ones from server
    subscribedRooms.clear();
    data.subscribedRooms.forEach((roomId) => {
      subscribedRooms.add(roomId);
    });

    // Update room list to show subscriptions
    updateRoomList(rooms);
  }
};

// Define message type handlers map
const messageTypeHandlers = {
  [OutgoingMessageType.ACK]: handleAck,
  [OutgoingMessageType.ERROR]: handleError,
  [OutgoingMessageType.ROOMS_LIST]: handleRoomsList,
  [OutgoingMessageType.USERS_LIST]: handleUsersList,
  [OutgoingMessageType.MESSAGE]: handleMessage,
  [OutgoingMessageType.ROOM_HISTORY]: handleRoomHistory,
  [OutgoingMessageType.DIRECT_MESSAGE]: handleDirectMessage,
  [OutgoingMessageType.USER_CONNECTED]: handleUserConnected,
};

// WebSocket event handlers
const handleSocketOpen = () => {
  console.log('Connection opened.');
  connectBtn.disabled = true;
  disconnectBtn.disabled = false;
  refreshRoomsBtn.disabled = false;
  statusDisplay.textContent = 'Connected';

  // Only enable send button if a room is selected
  if (selectedRoomId) {
    sendBtn.disabled = false;
    showUsersBtn.disabled = false;
  } else {
    sendBtn.disabled = true;
    showUsersBtn.disabled = true;
  }

  fetchRooms();
  fetchSubscriptions();
};

const handleSocketMessage = (event) => {
  console.log(event);

  try {
    // Parse JSON messages
    const data = JSON.parse(event.data);

    // Handle message based on type
    const handler = messageTypeHandlers[data.type];
    if (!handler) {
      console.log('Unknown message type:', data.type);
      return;
    }

    handler(data);
  } catch (e) {
    console.error('Failed to parse message:', e);
  }
};

const handleSocketClose = () => {
  console.log('Connection closed.');
  disconnect();
};

const handleSocketError = (error) => {
  console.error('WebSocket error:', error);
  disconnect();
};

const handleFormSubmit = (e) => {
  e.preventDefault();

  if (!selectedRoomId) {
    alert('Please select a room first');
    return;
  }

  if (messageInput.value && socket && socket.readyState === WebSocket.OPEN) {
    const messageId = generateRandomId();
    const message = {
      id: messageId,
      type: IncomingMessageType.SEND_MESSAGE,
      room: selectedRoomId,
      message: messageInput.value,
    };

    socket.send(JSON.stringify(message));

    // If we already know our user ID, store the message with it
    // This helps with identifying our messages in the history
    if (currentUser.id) {
      // Store this message in a pending messages map to track it
      const messageContent = messageInput.value;

      setTimeout(() => {
        // Add this message to our trackable messages
        const pendingMessage = {
          id: messageId,
          content: messageContent,
          roomId: selectedRoomId,
          timestamp: new Date(),
        };

        // Store pending message by content to help identify it later
        currentUser.pendingMessages = currentUser.pendingMessages || new Map();
        currentUser.pendingMessages.set(messageContent, pendingMessage);
      }, 0);
    }

    // Add message to chat (optimistic UI update)
    // Use "You" as sender name for user's own messages
    addMessageToChat({
      sender: 'You',
      senderId: currentUser.id || 'self', // Use our ID if we know it
      content: messageInput.value,
      sent: true,
    });

    messageInput.value = '';
  }
};

// WebSocket connection functions
const connect = () => {
  if (socket) {
    console.log('Already connected');
    return;
  }

  socket = new WebSocket('ws://localhost:8080');

  socket.onopen = handleSocketOpen;
  socket.onmessage = handleSocketMessage;
  socket.onclose = handleSocketClose;
  socket.onerror = handleSocketError;
};

// Helper function to clear the chat messages
const clearChat = () => {
  messages.innerHTML = '';
};

const disconnect = () => {
  if (socket) {
    socket.close();
    socket = null;
  }

  connectBtn.disabled = false;
  disconnectBtn.disabled = true;
  sendBtn.disabled = true;
  refreshRoomsBtn.disabled = true;
  showUsersBtn.disabled = true;
  roomHeader.style.display = 'none';
  statusDisplay.textContent = 'Disconnected';

  // Clear all data
  clearRoomList();
  clearChat();
  subscribedRooms.clear();
  selectedRoomId = null;

  // Reset current user info
  currentUser = { id: null, username: null };

  // Hide any open panels
  usersPanel.classList.remove('active');
};

// Room management functions
const fetchRooms = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const messageId = generateRandomId();
    socket.send(
      JSON.stringify({
        id: messageId,
        type: IncomingMessageType.LIST_ROOMS,
      }),
    );
  }
};

const fetchRoomUsers = () => {
  if (socket && socket.readyState === WebSocket.OPEN && selectedRoomId) {
    const messageId = generateRandomId();
    socket.send(
      JSON.stringify({
        id: messageId,
        type: IncomingMessageType.LIST_USERS,
        room: selectedRoomId,
      }),
    );
  }
};

// Not implemented in server yet - placeholder for future
const fetchSubscriptions = () => {
  // For now, we'll manage subscriptions client-side only
  updateRoomList(rooms);
};

const subscribeToRoom = (roomId) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const messageId = generateRandomId();
    socket.send(
      JSON.stringify({
        id: messageId,
        type: IncomingMessageType.SUBSCRIBE,
        room: roomId,
      }),
    );

    // Client-side tracking (optimistic update)
    subscribedRooms.add(roomId);
    updateRoomList(rooms);
  }
};

const unsubscribeFromRoom = (roomId) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const messageId = generateRandomId();
    socket.send(
      JSON.stringify({
        id: messageId,
        type: IncomingMessageType.UNSUBSCRIBE,
        room: roomId,
      }),
    );

    // Client-side tracking (optimistic update)
    subscribedRooms.delete(roomId);
    updateRoomList(rooms);
  }
};

const toggleRoomSubscription = (roomId) => {
  if (subscribedRooms.has(roomId)) {
    unsubscribeFromRoom(roomId);
  } else {
    subscribeToRoom(roomId);
  }
};

const updateRoomList = (newRooms) => {
  // Store the current active room ID before clearing the list
  const currentActiveRoomId = selectedRoomId;

  rooms = newRooms || [];
  roomList.innerHTML = '';

  if (rooms.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'No rooms available';
    roomList.appendChild(emptyItem);
    return;
  }

  rooms.forEach((room) => {
    const item = document.createElement('li');

    // Room container - holds room name and subscription button
    const roomContainer = document.createElement('div');
    roomContainer.className = 'room-container';

    // Room name
    const roomName = document.createElement('span');
    roomName.className = 'room-name';
    roomName.textContent = room.name || room.id;

    // Check if this room has unread messages
    if (unreadMessages.get(room.id) > 0) {
      // Create counter element for unread messages
      const counter = document.createElement('span');
      counter.className = 'message-counter';
      counter.textContent = unreadMessages.get(room.id);
      roomName.appendChild(counter);

      // Add has-new-messages class
      item.classList.add('has-new-messages');
    }

    // Subscription button
    const subscribeBtn = document.createElement('button');
    subscribeBtn.className = 'subscribe-btn';
    subscribeBtn.title = subscribedRooms.has(room.id)
      ? 'Unsubscribe'
      : 'Subscribe';
    const isSubscribed = subscribedRooms.has(room.id);
    subscribeBtn.innerHTML = isSubscribed
      ? '<span class="material-icons">notifications_active</span>'
      : '<span class="material-icons">notifications_none</span>';

    subscribeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent room selection when clicking the subscribe button
      toggleRoomSubscription(room.id);
    });

    // Add elements to room container
    roomContainer.appendChild(roomName);
    roomContainer.appendChild(subscribeBtn);

    // Set room data and event listener
    item.dataset.roomId = room.id;
    item.dataset.subscribed = isSubscribed;
    item.appendChild(roomContainer);
    item.addEventListener('click', () => selectRoom(room));

    // Add subscribed class if subscribed
    if (isSubscribed) {
      item.classList.add('subscribed');
    }

    // Add active class if this is the current room
    if (room.id === currentActiveRoomId) {
      item.classList.add('active');
    }

    roomList.appendChild(item);
  });
};

const updateUsersList = (users) => {
  roomUsers = users || [];
  usersList.innerHTML = '';

  if (roomUsers.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'No users in this room';
    usersList.appendChild(emptyItem);
    return;
  }

  roomUsers.forEach((user) => {
    const item = document.createElement('li');

    const avatar = document.createElement('div');
    avatar.className = 'user-avatar';
    avatar.textContent = user.username.charAt(0).toUpperCase();

    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';

    const userName = document.createElement('div');
    userName.className = 'user-name';
    userName.textContent = user.username;

    const userIdEl = document.createElement('div');
    userIdEl.className = 'user-id';
    userIdEl.textContent = user.id;

    userInfo.appendChild(userName);
    userInfo.appendChild(userIdEl);

    item.appendChild(avatar);
    item.appendChild(userInfo);
    item.dataset.userId = user.id;

    usersList.appendChild(item);
  });
};

const clearRoomList = () => {
  rooms = [];
  roomList.innerHTML = '';
  unreadMessages.clear();

  // Reset room selection UI
  selectedRoomId = null;
  roomHeader.style.display = 'none';
  currentRoomName.textContent = 'Select a room';

  // Disable room-specific buttons
  sendBtn.disabled = true;
  showUsersBtn.disabled = true;
};

const selectRoom = (room) => {
  // Clear chat when changing rooms
  clearChat();

  // Remove active class from all rooms
  document.querySelectorAll('.room-list li').forEach((item) => {
    item.classList.remove('active');
  });

  // Add active class to selected room
  const roomItem = document.querySelector(
    `.room-list li[data-room-id="${room.id}"]`,
  );
  if (roomItem) {
    roomItem.classList.add('active');

    // Clear unread messages for this room
    if (roomItem.classList.contains('has-new-messages')) {
      roomItem.classList.remove('has-new-messages');
      // Reset the unread counter
      unreadMessages.set(room.id, 0);
      // Remove the counter element
      const counter = roomItem.querySelector('.message-counter');
      if (counter) {
        counter.remove();
      }
    }
  }

  // Set the selected room ID
  selectedRoomId = room.id;

  // Auto-subscribe to the selected room if not already subscribed
  const wasAlreadySubscribed = subscribedRooms.has(room.id);
  if (!wasAlreadySubscribed) {
    subscribeToRoom(room.id);
    // We need to refresh the room list to update UI classes after subscribing
    // This ensures the room gets proper styling as both active and subscribed
    setTimeout(() => updateRoomList(rooms), 0);
  }

  // Request room history
  fetchRoomHistory();

  // Update room header
  roomHeader.style.display = 'flex';
  currentRoomName.textContent = room.name || room.id;

  // Enable send button if connected
  if (socket && socket.readyState === WebSocket.OPEN) {
    sendBtn.disabled = false;
    showUsersBtn.disabled = false;
  }
};

const toggleUsersPanel = () => {
  const isVisible = usersPanel.classList.contains('active');

  if (isVisible) {
    usersPanel.classList.remove('active');
  } else {
    usersPanel.classList.add('active');
    fetchRoomUsers();
  }
};

// Function to fetch room history
const fetchRoomHistory = () => {
  if (socket && socket.readyState === WebSocket.OPEN && selectedRoomId) {
    // Show loading indicator
    isLoadingHistory = true;
    showLoadingIndicator();

    const messageId = generateRandomId();
    socket.send(
      JSON.stringify({
        id: messageId,
        type: IncomingMessageType.GET_HISTORY,
        room: selectedRoomId,
      }),
    );
  }
};

// Show loading indicator in the chat area
const showLoadingIndicator = () => {
  // Clear chat first
  clearChat();

  // Add loading message
  const loadingItem = document.createElement('li');
  loadingItem.className = 'loading-message';

  const loadingText = document.createElement('div');
  loadingText.className = 'loading-text';
  loadingText.textContent = 'Loading message history...';

  loadingItem.appendChild(loadingText);
  messages.appendChild(loadingItem);
};

// Set up event listeners
connectBtn.addEventListener('click', connect);
disconnectBtn.addEventListener('click', disconnect);
refreshRoomsBtn.addEventListener('click', fetchRooms);
form.addEventListener('submit', handleFormSubmit);
showUsersBtn.addEventListener('click', toggleUsersPanel);
closeUsersPanel.addEventListener('click', () =>
  usersPanel.classList.remove('active'),
);

// Initial setup
sendBtn.disabled = true;
showUsersBtn.disabled = true;
