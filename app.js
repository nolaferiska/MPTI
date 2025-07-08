// app.js - Fixed Socket.IO implementation
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.set('io', io);
const PORT = process.env.PORT || 3000;

// Import routes
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const orangTuaRoutes = require('./routes/orangTua');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files MUST be before routes
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'candice-kids-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(flash());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layouts/public');
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// Global variables for views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.info_msg = req.flash('info_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);
app.use('/', orangTuaRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('public/404', {
        title: 'Halaman Tidak Ditemukan - Candice Kids',
        layout: 'layouts/public'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('public/500', {
        title: 'Terjadi Kesalahan - Candice Kids',
        layout: 'layouts/public'
    });
});

// --- FIXED SOCKET.IO CHAT HANDLER ---
const connectedUsers = new Map(); // userId -> socket.id
const onlineUsers = new Set();

io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    // User joins their own room
    socket.on('join_room', ({ userId }) => {
        if (userId) {
            console.log(`User ${userId} joining room user_${userId}`);
            socket.join(`user_${userId}`);
            socket.userId = userId; // Store userId on socket for cleanup
            connectedUsers.set(String(userId), socket.id);
            onlineUsers.add(String(userId));

            // Broadcast to all clients that user is online
            io.emit('user_online', { userId: String(userId) });
            console.log(`User ${userId} is now online`);
        }
    });

    // Handle message sending (unified handler for both admin and orangtua)
    socket.on('send_message', (data) => {
        console.log('Received send_message:', data);

        if (data && data.pengirimId && data.penerimaId && data.pesan) {
            // Create message object with timestamp
            const messageData = {
                id: Date.now(), // Temporary ID
                pengirimId: String(data.pengirimId),
                penerimaId: String(data.penerimaId),
                pesan: data.pesan,
                createdAt: new Date().toISOString(),
                pengirim: data.pengirim || { id: data.pengirimId, role: data.senderRole || 'orangtua' }
            };

            // Send to both sender and receiver rooms
            io.to(`user_${data.penerimaId}`).emit('new_message', messageData);
            io.to(`user_${data.pengirimId}`).emit('new_message', messageData);

            console.log(`Message sent from ${data.pengirimId} to ${data.penerimaId}`);
        }
    });

    // Handle admin sending message (separate handler for clarity)
    socket.on('admin_send_message', (data) => {
        console.log('Received admin_send_message:', data);

        if (data && data.penerimaId && data.pesan) {
            const messageData = {
                id: Date.now(), // Temporary ID
                pengirimId: String(socket.userId),
                penerimaId: String(data.penerimaId),
                pesan: data.pesan,
                createdAt: new Date().toISOString(),
                pengirim: { id: socket.userId, role: 'admin' }
            };

            // Send to both admin and parent
            io.to(`user_${data.penerimaId}`).emit('new_message', messageData);
            io.to(`user_${socket.userId}`).emit('new_message', messageData);

            console.log(`Admin message sent from ${socket.userId} to ${data.penerimaId}`);
        }
    });

    // Get online users
    socket.on('get_online_users', () => {
        console.log('Sending online users:', Array.from(onlineUsers));
        socket.emit('online_users', Array.from(onlineUsers));
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);

        if (socket.userId) {
            // Remove from connected users
            connectedUsers.delete(String(socket.userId));

            // Check if user still has other connections
            const userRoom = io.sockets.adapter.rooms.get(`user_${socket.userId}`);
            if (!userRoom || userRoom.size === 0) {
                onlineUsers.delete(String(socket.userId));
                io.emit('user_offline', { userId: String(socket.userId) });
                console.log(`User ${socket.userId} is now offline`);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Candice Kids server running on http://localhost:${PORT}`);
    console.log(`📱 Admin: http://localhost:${PORT}/admin/login`);
    console.log(`👨‍👩‍👧‍👦 Orang Tua: http://localhost:${PORT}/login`);
});