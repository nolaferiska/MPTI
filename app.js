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

// Debug middleware untuk static files
app.use((req, res, next) => {
    if (req.url.startsWith('/css/') || req.url.startsWith('/js/') || req.url.startsWith('/images/')) {
        console.log(`📁 Static file request: ${req.url}`);
    }
    next();
});

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'candice-kids-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(flash());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layouts/public'); // default layout
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

// Socket.IO configuration
const { Komunikasi } = require('./models');

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user joining
    socket.on('join', (userData) => {
        console.log('User joined:', userData);
        socket.userId = userData.userId;
        socket.userRole = userData.userRole;
        socket.userName = userData.userName;
        
        // Store user connection
        connectedUsers.set(userData.userId, {
            socketId: socket.id,
            userId: userData.userId,
            userRole: userData.userRole,
            userName: userData.userName
        });

        // Join user to their own room
        socket.join(`user_${userData.userId}`);
        
        // Send current online users to the newly connected user
        const onlineUsers = Array.from(connectedUsers.values()).filter(user => user.userId !== userData.userId);
        socket.emit('online_users', onlineUsers);
        
        // Broadcast user online status to others
        socket.broadcast.emit('user_online', {
            userId: userData.userId,
            userRole: userData.userRole,
            userName: userData.userName
        });
        
        console.log(`User ${userData.userName} (${userData.userRole}) connected`);
    });

    // Handle sending messages
    socket.on('send_message', async (messageData) => {
        try {
            console.log('Received message:', messageData);
            
            // Save message to database
            const newMessage = await Komunikasi.create({
                pengirimId: messageData.pengirimId,
                penerimaId: messageData.penerimaId,
                pesan: messageData.pesan
            });

            // Get full message data with relations
            const fullMessage = await Komunikasi.findById(newMessage.id);
            
            // Send to sender
            socket.emit('message_sent', {
                success: true,
                message: fullMessage.toJSON()
            });

            // Send to receiver if they're online
            const receiverConnection = connectedUsers.get(messageData.penerimaId);
            if (receiverConnection) {
                io.to(`user_${messageData.penerimaId}`).emit('new_message', {
                    message: fullMessage.toJSON()
                });
                console.log(`Message delivered to online user ${messageData.penerimaId}`);
            } else {
                console.log(`User ${messageData.penerimaId} is offline, message saved to database`);
            }

            console.log(`Message sent from ${messageData.pengirimId} to ${messageData.penerimaId}`);
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('message_error', {
                error: 'Failed to send message'
            });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Remove user from connected users and broadcast offline status
        if (socket.userId) {
            connectedUsers.delete(socket.userId);
            
            // Broadcast user offline status
            socket.broadcast.emit('user_offline', {
                userId: socket.userId,
                userRole: socket.userRole,
                userName: socket.userName
            });
            
            console.log(`User ${socket.userName} disconnected`);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Candice Kids server running on http://localhost:${PORT}`);
    console.log(`📱 Admin: http://localhost:${PORT}/admin/login`);
    console.log(`👨‍👩‍👧‍👦 Orang Tua: http://localhost:${PORT}/login`);
});