console.log('Started');

const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 10);
};

// Message types enum (from server) - updated to match new backend structure
const IncomingMessageType = {
  SEND_ROOM_MESSAGE: 'send-room-message',
  SEND_DIRECT_MESSAGE: 'send-direct-message',
  LIST_ROOMS: 'list-rooms',
  LIST_USERS: 'list-users',
  LIST_ROOM_USERS: 'list-room-users',
  FETCH_ROOM_MESSAGES_HISTORY: 'fetch-room-messages-history',
  FETCH_DIRECT_MESSAGE_HISTORY: 'fetch-direct-message-history',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
};

const OutgoingMessageType = {
  ACK: 'ack',
  ERROR: 'error',
  USER_CONNECTED: 'user-connected',
  ROOM_MESSAGE: 'room-message',
  DIRECT_MESSAGE: 'direct-message',
  ROOMS_LIST: 'rooms-list',
  USERS_LIST: 'users-list',
  ROOM_USERS_LIST: 'room-users-list',
  ROOM_MESSAGES_HISTORY: 'room-messages-history',
  DIRECT_MESSAGES_HISTORY: 'direct-messages-history',
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
const refreshUsersBtn = document.getElementById('refresh-users-btn');
const directUsersList = document.getElementById('direct-users-list');

// State
let socket = null;
let rooms = [];
let selectedRoomId = null;
let roomUsers = [];
let subscribedRooms = new Set(); // Keep track of subscribed rooms
let unreadMessages = new Map(); // Add a map to keep track of unread message counts
let isLoadingHistory = false; // Track if history is currently loading
let currentUser = { id: null, username: null }; // Track current user info
let allUsers = []; // All users for direct messaging
let selectedUserId = null; // Currently selected user for direct messaging
let directUnreadMessages = new Map(); // Track unread direct messages

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

const handleRoomUsersList = (data) => {
  updateUsersList(data.users);
};

// Update handler to use new ROOM_MESSAGE type
const handleRoomMessage = (data) => {
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

// Update the direct message handler to automatically reload users list when needed
const handleDirectMessage = (data) => {
  const isFromSelectedUser = data.from.id === selectedUserId;
  const isOwnMessage = data.from.id === currentUser.id;

  // If from the currently selected user, show in chat
  if (isFromSelectedUser && !isOwnMessage) {
    addMessageToChat({
      sender: data.from.username,
      senderId: data.from.id,
      content: data.message,
      sent: false,
      isDirect: true,
    });
  }
  // If from someone else, highlight their name in the sidebar
  else if (!isOwnMessage) {
    // Check if the sender is in our current users list
    const senderExists = allUsers.some((user) => user.id === data.from.id);

    // If the sender is not in our list, reload the users list
    if (!senderExists) {
      console.log(
        `Received message from unknown user ${data.from.username}, reloading users list`,
      );
      fetchAllUsers();
    }

    highlightUser(data.from.id, data.from.username, data.message);
  }
};

// Update handler to use new ROOM_MESSAGES_HISTORY type
const handleRoomMessagesHistory = (data) => {
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
    const isOwnMessage = message.from.id === currentUser.id;

    addMessageToChat({
      sender: isOwnMessage ? 'You' : message.from.username,
      senderId: message.from.id,
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

// WebSocket event handlers
const handleSocketOpen = () => {
  console.log('Connection opened.');
  connectBtn.disabled = true;
  disconnectBtn.disabled = false;
  refreshRoomsBtn.disabled = false;
  refreshUsersBtn.disabled = false;
  statusDisplay.textContent = 'Connected';

  // Only enable send button if a room or user is selected
  if (selectedRoomId || selectedUserId) {
    sendBtn.disabled = false;
  } else {
    sendBtn.disabled = true;
  }

  // Show room users button only if a room is selected
  showUsersBtn.disabled = !selectedRoomId;

  fetchRooms();
  fetchAllUsers();
  fetchSubscriptions();
};

const handleSocketMessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);

  switch (data.type) {
    case OutgoingMessageType.ACK:
      handleAck(data);
      break;
    case OutgoingMessageType.ERROR:
      handleError(data);
      break;
    case OutgoingMessageType.ROOMS_LIST:
      handleRoomsList(data);
      break;
    case OutgoingMessageType.USERS_LIST:
      handleAllUsersList(data);
      break;
    case OutgoingMessageType.ROOM_USERS_LIST:
      handleRoomUsersList(data);
      break;
    case OutgoingMessageType.ROOM_MESSAGE:
      handleRoomMessage(data);
      break;
    case OutgoingMessageType.DIRECT_MESSAGE:
      handleDirectMessage(data);
      break;
    case OutgoingMessageType.ROOM_MESSAGES_HISTORY:
      handleRoomMessagesHistory(data);
      break;
    case OutgoingMessageType.DIRECT_MESSAGES_HISTORY:
      handleDirectMessagesHistory(data);
      break;
    case OutgoingMessageType.USER_CONNECTED:
      handleUserConnected(data);
      break;
    default:
      console.warn('Unhandled message type:', data.type, data);
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

// Update handleFormSubmit to use new message types
const handleFormSubmit = (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();

  if (!message) return;

  if (socket && socket.readyState === WebSocket.OPEN) {
    const messageId = generateRandomId();

    // Check if we're sending to a room or a user
    if (selectedRoomId) {
      // Send to room
      socket.send(
        JSON.stringify({
          id: messageId,
          type: IncomingMessageType.SEND_ROOM_MESSAGE,
          room: selectedRoomId,
          message,
        }),
      );

      // Add message to chat immediately to provide instant feedback
      addMessageToChat({
        sender: 'You',
        senderId: currentUser.id,
        content: message,
        sent: true,
      });
    } else if (selectedUserId) {
      // Send direct message
      socket.send(
        JSON.stringify({
          id: messageId,
          type: IncomingMessageType.SEND_DIRECT_MESSAGE,
          userId: selectedUserId,
          message,
        }),
      );

      // Add message to chat immediately to provide instant feedback
      addMessageToChat({
        sender: 'You',
        senderId: currentUser.id,
        content: message,
        sent: true,
        isDirect: true,
      });
    }

    // Clear input
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
  refreshUsersBtn.disabled = true;
  showUsersBtn.disabled = true;
  roomHeader.style.display = 'none';
  statusDisplay.textContent = 'Disconnected';

  // Clear all data
  clearRoomList();
  clearDirectUsersList();
  clearChat();
  subscribedRooms.clear();
  selectedRoomId = null;
  selectedUserId = null;
  allUsers = [];
  directUnreadMessages.clear();

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
        type: IncomingMessageType.LIST_ROOM_USERS,
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

    // Optimistically add to subscribed rooms set
    subscribedRooms.add(roomId);
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

    // Optimistically remove from subscribed rooms set
    subscribedRooms.delete(roomId);
  }
};

const toggleRoomSubscription = (roomId) => {
  if (subscribedRooms.has(roomId)) {
    unsubscribeFromRoom(roomId);

    // Update the button UI immediately
    updateSubscriptionButton(roomId, false);
  } else {
    subscribeToRoom(roomId);

    // Update the button UI immediately
    updateSubscriptionButton(roomId, true);
  }
};

// Function to update the subscription button UI
const updateSubscriptionButton = (roomId, isSubscribed) => {
  const roomItem = document.querySelector(
    `.room-list li[data-room-id="${roomId}"]`,
  );
  if (roomItem) {
    // Update the data attribute
    roomItem.dataset.subscribed = isSubscribed;

    // Update the class
    if (isSubscribed) {
      roomItem.classList.add('subscribed');
    } else {
      roomItem.classList.remove('subscribed');
    }

    // Update the button icon
    const subscribeBtn = roomItem.querySelector('.subscribe-btn');
    if (subscribeBtn) {
      subscribeBtn.title = isSubscribed ? 'Unsubscribe' : 'Subscribe';
      subscribeBtn.innerHTML = isSubscribed
        ? '<span class="material-icons">notifications_active</span>'
        : '<span class="material-icons">notifications_none</span>';

      // Add a visual feedback of the action
      subscribeBtn.classList.add('button-flash');
      setTimeout(() => {
        subscribeBtn.classList.remove('button-flash');
      }, 300);
    }
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

  // Remove active class from all users
  document.querySelectorAll('.users-sidebar-list li').forEach((item) => {
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

  // Set the selected room ID and clear selected user
  selectedRoomId = room.id;
  selectedUserId = null;

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

  // Enable send button and user button if connected
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

// Update fetchRoomHistory to use the new message type
const fetchRoomHistory = () => {
  if (socket && socket.readyState === WebSocket.OPEN && selectedRoomId) {
    // Show loading indicator
    isLoadingHistory = true;
    showLoadingIndicator();

    const messageId = generateRandomId();
    socket.send(
      JSON.stringify({
        id: messageId,
        type: IncomingMessageType.FETCH_ROOM_MESSAGES_HISTORY,
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

// Update fetchAllUsers to use the correct message type
const fetchAllUsers = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const messageId = generateRandomId();
    socket.send(
      JSON.stringify({
        id: messageId,
        type: IncomingMessageType.LIST_USERS,
      }),
    );
  }
};

// Add a handler for the list of all users
const handleAllUsersList = (data) => {
  updateDirectUsersList(data.users);
};

// Function to update the direct users list in the sidebar
const updateDirectUsersList = (users) => {
  // Keep track of the previously selected user before updating the list
  const previousSelectedUserId = selectedUserId;

  // Update our users list but preserve any temporary flag
  allUsers = users.map((user) => {
    // Check if we had a temporary entry for this user
    const existingUser = allUsers.find((u) => u.id === user.id);
    if (existingUser && existingUser.isTemporary) {
      // Keep the temporary flag, might be useful for styling/identification
      return { ...user, isTemporary: true };
    }
    return user;
  });

  directUsersList.innerHTML = '';

  if (allUsers.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'No users available';
    directUsersList.appendChild(emptyItem);
    return;
  }

  // Filter out current user
  const otherUsers = allUsers.filter((user) => user.id !== currentUser.id);

  otherUsers.forEach((user) => {
    const item = document.createElement('li');
    item.dataset.userId = user.id;

    // Create user avatar
    const avatar = document.createElement('div');
    avatar.className = 'user-avatar';
    avatar.textContent = user.username.charAt(0).toUpperCase();

    // Create user name
    const userName = document.createElement('div');
    userName.className = 'user-name';
    userName.textContent = user.username;

    // Apply special styling for newly added users (those that were temporary)
    if (user.isTemporary) {
      userName.classList.add('new-user');
    }

    // Create unread indicator
    const dmIndicator = document.createElement('div');
    dmIndicator.className = 'dm-indicator';

    // Add unread class if there are unread messages
    if (directUnreadMessages.get(user.id) > 0) {
      item.classList.add('has-new-messages');
    }

    // Add active class if this is the selected user
    if (user.id === previousSelectedUserId) {
      item.classList.add('active');
      // Ensure we maintain the selected user id
      selectedUserId = previousSelectedUserId;
    }

    // Add elements to item
    item.appendChild(avatar);
    item.appendChild(userName);
    item.appendChild(dmIndicator);

    // Set up click handler
    item.addEventListener('click', () => selectUser(user));

    directUsersList.appendChild(item);
  });
};

// Function to select a user for direct messaging
const selectUser = (user) => {
  // Clear chat when changing users
  clearChat();

  // Remove active class from all users
  document.querySelectorAll('.users-sidebar-list li').forEach((item) => {
    item.classList.remove('active');
  });

  // Remove active class from all rooms
  document.querySelectorAll('.room-list li').forEach((item) => {
    item.classList.remove('active');
  });

  // Add active class to selected user
  const userItem = document.querySelector(
    `.users-sidebar-list li[data-user-id="${user.id}"]`,
  );
  if (userItem) {
    userItem.classList.add('active');

    // Clear unread messages for this user
    if (userItem.classList.contains('has-new-messages')) {
      userItem.classList.remove('has-new-messages');
      // Reset the unread counter
      directUnreadMessages.set(user.id, 0);
    }

    // If this was a new user, remove the new-user class after selection
    const userName = userItem.querySelector('.user-name');
    if (userName && userName.classList.contains('new-user')) {
      userName.classList.remove('new-user');

      // Also remove the temporary flag from the user object
      const userIndex = allUsers.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        delete allUsers[userIndex].isTemporary;
      }
    }
  }

  // Set the selected user ID and clear selected room
  selectedUserId = user.id;
  selectedRoomId = null;

  // Update room header (repurpose for direct messaging)
  roomHeader.style.display = 'flex';
  currentRoomName.textContent = `Chat with ${user.username}`;

  // Fetch direct message history
  fetchDirectMessageHistory(user.id);

  // Enable send button if connected
  if (socket && socket.readyState === WebSocket.OPEN) {
    sendBtn.disabled = false;
    showUsersBtn.disabled = true; // Disable room users button for DMs
  }
};

// Function to fetch direct message history
const fetchDirectMessageHistory = (userId) => {
  if (socket && socket.readyState === WebSocket.OPEN && userId) {
    // Show loading indicator
    isLoadingHistory = true;
    showLoadingIndicator();

    const messageId = generateRandomId();
    socket.send(
      JSON.stringify({
        id: messageId,
        type: IncomingMessageType.FETCH_DIRECT_MESSAGE_HISTORY,
        userId: userId,
      }),
    );
  }
};

// Add handler for direct message history
const handleDirectMessagesHistory = (data) => {
  // Clear existing messages (removes loading indicator)
  clearChat();
  isLoadingHistory = false;

  // Sort messages by timestamp (oldest first)
  const sortedMessages = [...data.messages].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );

  if (sortedMessages.length === 0) {
    // Show empty state message
    const emptyItem = document.createElement('li');
    emptyItem.className = 'empty-history';
    emptyItem.textContent = 'No messages yet. Start the conversation!';
    messages.appendChild(emptyItem);
    return;
  }

  // Add each message to the chat
  sortedMessages.forEach((message) => {
    // Use the currentUser.id to determine if this is our message
    const isOwnMessage = message.fromUserId === currentUser.id;

    addMessageToChat({
      sender: isOwnMessage ? 'You' : message.from.username,
      senderId: message.from.id,
      content: message.content,
      sent: isOwnMessage,
      isDirect: true,
    });
  });

  // Scroll to bottom after adding all messages
  messages.scrollTop = messages.scrollHeight;
};

// Function to highlight a user in the sidebar for new direct messages
const highlightUser = (userId, username, message) => {
  const userItem = document.querySelector(
    `.users-sidebar-list li[data-user-id="${userId}"]`,
  );

  if (userItem) {
    // Increment the unread message count
    const currentCount = directUnreadMessages.get(userId) || 0;
    directUnreadMessages.set(userId, currentCount + 1);

    // Add has-new-messages class
    userItem.classList.add('has-new-messages');
  } else {
    // User is not in the sidebar yet, but we still want to track unread messages
    // This will be used when the user list is reloaded
    const currentCount = directUnreadMessages.get(userId) || 0;
    directUnreadMessages.set(userId, currentCount + 1);

    // Check if the user exists in our list but just hasn't been rendered
    const userExists = allUsers.some((user) => user.id === userId);
    if (!userExists) {
      // Create a temporary user object to help with notifications
      // This will be replaced when fetchAllUsers completes
      allUsers.push({ id: userId, username: username, isTemporary: true });
    }
  }

  // Show notification for the direct message
  showDirectMessageNotification(userId, username, message);
};

// Function to show notification for direct messages
const showDirectMessageNotification = (userId, sender, message) => {
  // Create notification
  const notification = document.createElement('div');
  notification.className = 'notification';

  // Add sender name
  const senderEl = document.createElement('div');
  senderEl.className = 'notification-room'; // Reuse the room notification style
  senderEl.textContent = `Message from ${sender}`;

  // Add message preview
  const messageEl = document.createElement('div');
  messageEl.className = 'notification-message';
  messageEl.textContent =
    message.length > 30 ? message.substring(0, 27) + '...' : message;

  // Add to notification
  notification.appendChild(senderEl);
  notification.appendChild(messageEl);

  // Add notification to document
  document.body.appendChild(notification);

  // Set up click handler to go to that user's chat
  notification.addEventListener('click', () => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      selectUser(user);
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

// Function to clear the direct users list
const clearDirectUsersList = () => {
  directUsersList.innerHTML = '';
};

// Add a function to automatically clear temporary flags after a while
const clearTemporaryFlags = () => {
  // Find all users with temporary flags
  const temporaryUsers = allUsers.filter((user) => user.isTemporary);

  if (temporaryUsers.length > 0) {
    // For each temporary user, remove the flag and update the UI
    temporaryUsers.forEach((user) => {
      // Find the user element
      const userItem = document.querySelector(
        `.users-sidebar-list li[data-user-id="${user.id}"]`,
      );

      if (userItem) {
        const userName = userItem.querySelector('.user-name');
        if (userName) {
          userName.classList.remove('new-user');
        }
      }

      // Remove the temporary flag
      const userIndex = allUsers.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        delete allUsers[userIndex].isTemporary;
      }
    });
  }
};

// Set a timer to clear temporary flags after 30 seconds
setInterval(clearTemporaryFlags, 30000);

// Set up event listeners
connectBtn.addEventListener('click', connect);
disconnectBtn.addEventListener('click', disconnect);
refreshRoomsBtn.addEventListener('click', fetchRooms);
refreshUsersBtn.addEventListener('click', fetchAllUsers);
form.addEventListener('submit', handleFormSubmit);
showUsersBtn.addEventListener('click', toggleUsersPanel);
closeUsersPanel.addEventListener('click', () =>
  usersPanel.classList.remove('active'),
);

// Initial setup
sendBtn.disabled = true;
showUsersBtn.disabled = true;
