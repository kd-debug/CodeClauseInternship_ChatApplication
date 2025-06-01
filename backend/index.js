require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000", // Adjust for your frontend URL
        methods: ["GET", "POST"]
    }
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is missing. Please check your .env file.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000" // Adjust for your frontend URL
}));
app.use(express.json()); // Middleware to parse JSON bodies

// Basic route
app.get('/', (req, res) => {
    res.send('Chat App Backend Running');
});

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);
    });

    socket.on('send_message', async ({ roomId, content, userId, contentType = 'text', fileUrl = null }) => {
        console.log(`Message received for room ${roomId}:`, content);
        if (!roomId || !content || !userId) {
            console.error("Missing data for send_message:", { roomId, content, userId });
            // Optionally emit an error back to the sender
            // socket.emit('message_error', { error: "Missing data for message." });
            return;
        }
        try {
            // 1. Insert the message into Supabase
            const { data: newMessageData, error: insertError } = await supabase
                .from('messages')
                .insert({
                    room_id: roomId,
                    user_id: userId,
                    content: content,
                    content_type: contentType,
                    file_url: fileUrl
                })
                .select(`
            id,
            content,
            content_type,
            file_url,
            created_at,
            user_id,
            users (id, username, avatar_url)
        `) // Select the full message object with user details
                .single(); // Expecting a single row back

            if (insertError) {
                console.error('Error inserting message to Supabase:', insertError);
                // socket.emit('message_error', { error: "Failed to save message." });
                return;
            }

            if (!newMessageData) {
                console.error('No data returned from Supabase after message insert.');
                // socket.emit('message_error', { error: "Failed to retrieve message after saving." });
                return;
            }

            // 2. Broadcast the new message to all clients in the room
            io.to(roomId).emit('new_message', newMessageData);
            console.log(`Message broadcasted to room ${roomId}:`, newMessageData);

        } catch (error) {
            console.error('Error handling send_message:', error);
            // socket.emit('message_error', { error: "Server error while sending message." });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Here you might want to handle removing the user from any rooms they were in
        // if you're tracking active users per room in memory on the server.
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Supabase client initialized for URL: ${supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'NOT FOUND'}`);
});

module.exports = { app, server, io, supabase }; // Export for potential testing or other modules