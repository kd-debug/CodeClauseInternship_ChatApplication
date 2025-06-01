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
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Should be service_role key for backend

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is missing in backend/.env file.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('ConnectSphere Backend Running');
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    socket.on('send_message', async ({ roomId, content, userId, contentType = 'text', fileUrl = null }) => {
        console.log(`Message from ${userId} in room ${roomId} (${contentType}): ${content.substring(0, 50)}...`);
        if (!roomId || !content || !userId) {
            console.error("Missing data for send_message:", { roomId, content: content ? 'present' : 'missing', userId });
            return;
        }
        try {
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
            id, content, content_type, file_url, created_at, user_id,
            users (id, username, avatar_url)
        `)
                .single();

            if (insertError) {
                console.error('Error inserting message to Supabase:', insertError);
                return;
            }

            if (!newMessageData) {
                console.error('No data returned from Supabase after message insert.');
                return;
            }

            io.to(roomId).emit('new_message', newMessageData);
            console.log(`Message ID ${newMessageData.id} broadcasted to room ${roomId}`);

        } catch (error) {
            console.error('Error in send_message handler:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`ConnectSphere server listening on port ${PORT}`);
    console.log(`Supabase client initialized for URL: ${supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'NOT FOUND'}`);
});

module.exports = { app, server, io, supabase };