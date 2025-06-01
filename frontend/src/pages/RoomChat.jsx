import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import {
    IoPeopleOutline,
    IoMailUnreadOutline,
    IoSend,
    IoCloudUploadOutline,
    IoCheckmarkCircleOutline,
    IoCloseCircleOutline
} from 'react-icons/io5';

function RoomChat() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user, profile } = useAuth();

    const [roomDetails, setRoomDetails] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [members, setMembers] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [showMembersPanel, setShowMembersPanel] = useState(false);
    const [showPendingRequestsPanel, setShowPendingRequestsPanel] = useState(false);
    const [socket, setSocket] = useState(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchRoomData = useCallback(async () => {
        if (!roomId || !user) return;
        setIsLoading(true);
        setError('');
        try {
            const { data: roomData, error: roomError } = await supabase
                .from('rooms')
                .select(`name, created_by, users (username), room_members (user_id, status, is_admin, users (id, username, avatar_url, gender))`)
                .eq('id', roomId)
                .single();
            if (roomError) throw roomError;
            if (!roomData) throw new Error("Room not found.");
            setRoomDetails(roomData);

            const currentUserMembership = roomData.room_members.find(m => m.user_id === user.id);
            if (!currentUserMembership || currentUserMembership.status !== 'member') {
                setError("You are not a member of this room or your access is pending.");
                setIsLoading(false);
                return;
            }
            setIsAdmin(currentUserMembership.is_admin);

            const { data: messagesData, error: messagesError } = await supabase
                .from('messages')
                .select(`id, content, content_type, file_url, created_at, user_id, users (username, avatar_url)`)
                .eq('room_id', roomId)
                .order('created_at', { ascending: true });
            if (messagesError) throw messagesError;
            setMessages(messagesData || []);

            if (currentUserMembership.is_admin) {
                const activeMembers = roomData.room_members.filter(m => m.status === 'member').map(m => m.users);
                setMembers(activeMembers);
                const { data: requestsData, error: requestsError } = await supabase
                    .from('room_members')
                    .select(`id, status, user_id, joined_at, users (id, username, avatar_url, gender)`)
                    .eq('room_id', roomId)
                    .eq('status', 'pending_approval');
                if (requestsError) throw requestsError;
                setPendingRequests(requestsData || []);
            }
        } catch (err) {
            setError(`Error loading room: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [roomId, user, navigate]);

    useEffect(() => {
        fetchRoomData();
    }, [fetchRoomData]);

    useEffect(() => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
        const newSocket = io(backendUrl, { transports: ['websocket'] });
        setSocket(newSocket);
        if (roomId) newSocket.emit('join_room', roomId);
        newSocket.on('new_message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });
        newSocket.on('connect_error', (err) => setError(`Socket connection failed: ${err.message}.`));
        return () => {
            if (roomId) newSocket.emit('leave_room', roomId);
            newSocket.disconnect();
        };
    }, [roomId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !roomId || !socket) return;
        const messagePayload = { roomId, content: newMessage, userId: user.id, contentType: 'text', fileUrl: null };
        socket.emit('send_message', messagePayload);
        setNewMessage('');
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !user || !roomId || !socket) return;
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${roomId}/${fileName}`;
        try {
            setError('');
            const { error: uploadError } = await supabase.storage.from('message-files').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('message-files').getPublicUrl(filePath);
            if (!urlData?.publicUrl) throw new Error('Could not get public URL.');
            let contentType = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : 'file');
            const messagePayload = { roomId, content: file.name, userId: user.id, contentType, fileUrl: urlData.publicUrl };
            socket.emit('send_message', messagePayload);
        } catch (err) {
            setError(`File upload failed: ${err.message}.`);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleApproveRequest = async (requestId) => {
        if (!isAdmin) return;
        try {
            const { error } = await supabase.from('room_members').update({ status: 'member' }).eq('id', requestId).eq('room_id', roomId);
            if (error) throw error;
            fetchRoomData();
        } catch (err) { setError(`Failed to approve request: ${err.message}`); }
    };

    const handleDenyRequest = async (requestId) => {
        if (!isAdmin) return;
        try {
            const { error } = await supabase.from('room_members').delete().eq('id', requestId).eq('room_id', roomId);
            if (error) throw error;
            fetchRoomData();
        } catch (err) { setError(`Failed to deny request: ${err.message}`); }
    };

    if (isLoading) return <div style={pageLevelFeedbackStyle}>Loading room...</div>;
    if (error) return <div style={{ ...pageLevelFeedbackStyle, color: 'var(--error-text)' }}>Error: {error} <Link to="/dashboard" style={{ color: 'var(--link-color)' }}>Go to Dashboard</Link></div>;
    if (!roomDetails) return <div style={pageLevelFeedbackStyle}>Room not found. <Link to="/dashboard" style={{ color: 'var(--link-color)' }}>Go to Dashboard</Link></div>;

    return (
        <div style={chatPageStyle}>
            <div style={chatHeaderStyle}>
                <h3 style={{ margin: 0, color: 'var(--text-color)' }}>{roomDetails.name}</h3>
                <p style={{ fontSize: '0.85em', color: 'var(--text-color-muted)', margin: '5px 0 0' }}>
                    Created by: {roomDetails.users?.username || 'Unknown'}
                </p>
                {isAdmin && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <button title="View Members" onClick={() => { setShowMembersPanel(p => !p); setShowPendingRequestsPanel(false); }} style={adminHeaderButtonStyle}>
                            <IoPeopleOutline /> Members ({members.length})
                        </button>
                        <button title="Pending Requests" onClick={() => { setShowPendingRequestsPanel(p => !p); setShowMembersPanel(false); }} style={adminHeaderButtonStyle}>
                            <IoMailUnreadOutline /> Requests ({pendingRequests.length})
                        </button>
                    </div>
                )}
            </div>

            {isAdmin && showMembersPanel && (
                <div style={panelStyle}>
                    <h4 style={panelTitleStyle}>Room Members:</h4>
                    {members.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {members.map(member => (
                                <li key={member.id} style={listItemStyle}>
                                    <img src={member.avatar_url || `https://avatar.iran.liara.run/public/${member.gender === 'female' ? 'girl' : 'boy'}?username=${member.username || member.id}`} alt={member.username} style={avatarSmallStyle} />
                                    {member.username}
                                </li>
                            ))}
                        </ul>
                    ) : <p style={{ color: 'var(--text-color-muted)' }}>No active members found.</p>}
                </div>
            )}

            {isAdmin && showPendingRequestsPanel && (
                <div style={panelStyle}>
                    <h4 style={panelTitleStyle}>Pending Join Requests:</h4>
                    {pendingRequests.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {pendingRequests.map(req => (
                                <li key={req.id} style={{ ...listItemStyle, justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <img src={req.users?.avatar_url || `https://avatar.iran.liara.run/public/${req.users?.gender === 'female' ? 'girl' : 'boy'}?username=${req.users?.username || req.user_id}`} alt={req.users?.username} style={avatarSmallStyle} />
                                        {req.users?.username || 'Unknown User'}
                                    </div>
                                    <div>
                                        <button onClick={() => handleApproveRequest(req.id)} style={approveButtonStyle} title="Approve Request">
                                            <IoCheckmarkCircleOutline />
                                        </button>
                                        <button onClick={() => handleDenyRequest(req.id)} style={denyButtonStyle} title="Deny Request">
                                            <IoCloseCircleOutline />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p style={{ color: 'var(--text-color-muted)' }}>No pending requests.</p>}
                </div>
            )}

            <div style={messagesAreaStyle}>
                {messages.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-color-muted)' }}>No messages yet. Be the first to send one!</p>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} style={{ ...messageBubbleStyle, ...(msg.user_id === user?.id ? sentMessageStyle : receivedMessageStyle) }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9em', color: msg.user_id === user?.id ? 'rgba(255,255,255,0.85)' : 'var(--link-color)', marginBottom: '4px' }}>
                                <img src={msg.users?.avatar_url || `https://avatar.iran.liara.run/public/?name=${msg.users?.username || 'User'}`} alt={msg.users?.username} style={avatarInMessageStyle} />
                                {msg.users?.username || 'User'}
                            </div>
                            {msg.content_type === 'text' ? (
                                <p style={{ margin: 0, wordBreak: 'break-word' }}>{msg.content}</p>
                            ) : msg.content_type === 'image' && msg.file_url ? (
                                <img src={msg.file_url} alt={msg.content || 'Uploaded image'} style={imageInMessageStyle} onClick={() => window.open(msg.file_url, '_blank')} />
                            ) : msg.content_type === 'video' && msg.file_url ? (
                                <video controls src={msg.file_url} style={videoInMessageStyle}>
                                    Your browser does not support the video tag. <a href={msg.file_url} target="_blank" rel="noopener noreferrer" style={{ color: msg.user_id === user?.id ? 'white' : 'var(--link-color)' }}>Download video</a>
                                </video>
                            ) : msg.file_url ? (
                                <p style={{ margin: '5px 0 0' }}>
                                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer" style={{ color: msg.user_id === user?.id ? 'white' : 'var(--link-color)' }}>
                                        View File: {msg.content || msg.file_url.split('/').pop()}
                                    </a>
                                </p>
                            ) : (
                                <p style={{ margin: '5px 0 0' }}><em>Unsupported message type: {msg.content_type}</em></p>
                            )}
                            <div style={{ fontSize: '0.75em', color: msg.user_id === user?.id ? 'rgba(255,255,255,0.7)' : 'var(--text-color-muted)', textAlign: 'right', marginTop: '5px' }}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={messageFormStyle}>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*,video/*,.pdf,.doc,.docx,.txt" />
                <button
                    type="button"
                    title="Upload File"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    style={{ ...messageButtonStyle, backgroundColor: 'transparent', color: 'var(--link-color)' }}
                >
                    <IoCloudUploadOutline />
                </button>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={messageInputStyle}
                    autoFocus
                />
                <button type="submit" style={messageButtonStyle} title="Send Message">
                    <IoSend />
                </button>
            </form>
        </div>
    );
}

const pageLevelFeedbackStyle = { padding: '20px', textAlign: 'center', fontSize: '1.1rem' };
const chatPageStyle = { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', backgroundColor: 'var(--background-color)', color: 'var(--text-color)' };
const chatHeaderStyle = { padding: '15px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--navbar-bg)' };
const adminHeaderButtonStyle = { padding: '8px 12px', backgroundColor: 'var(--button-bg)', color: 'var(--button-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' };
const panelStyle = { border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', padding: '15px', margin: '10px 20px', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' };
const panelTitleStyle = { marginTop: '0', marginBottom: '10px', fontSize: '1.1rem', fontWeight: '600', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--text-color)' };
const listItemStyle = { display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)' };
const avatarSmallStyle = { width: '30px', height: '30px', borderRadius: '50%', marginRight: '12px', objectFit: 'cover', border: '1px solid var(--border-color)' };
const actionButtonBase = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', padding: '5px' };
const approveButtonStyle = { ...actionButtonBase, color: 'var(--success-text)' };
const denyButtonStyle = { ...actionButtonBase, color: 'var(--error-text)', marginLeft: '8px' };
const messagesAreaStyle = { flexGrow: 1, overflowY: 'auto', padding: '15px 20px', display: 'flex', flexDirection: 'column' };
const messageBubbleStyle = { padding: '10px 15px', borderRadius: '12px', marginBottom: '10px', maxWidth: '75%', wordBreak: 'break-word', clear: 'both' };
const sentMessageStyle = { backgroundColor: 'var(--primary-color)', color: 'white', alignSelf: 'flex-end', marginLeft: 'auto', borderBottomRightRadius: '2px' };
const receivedMessageStyle = { backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', alignSelf: 'flex-start', marginRight: 'auto', border: '1px solid var(--border-color)', borderBottomLeftRadius: '2px' };
const avatarInMessageStyle = { width: '24px', height: '24px', borderRadius: '50%', marginRight: '8px', verticalAlign: 'middle', border: '1px solid var(--border-color)' };
const imageInMessageStyle = { maxWidth: '100%', maxHeight: '250px', marginTop: '8px', borderRadius: '8px', cursor: 'pointer', display: 'block' };
const videoInMessageStyle = { maxWidth: '100%', maxHeight: '250px', marginTop: '8px', borderRadius: '8px' };
const messageFormStyle = { display: 'flex', gap: '10px', padding: '15px 20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--navbar-bg)' };
const messageInputStyle = { flexGrow: 1, padding: '10px 18px', borderRadius: '22px', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', fontSize: '1rem', outline: 'none' };
const messageButtonStyle = { padding: '0', borderRadius: '50%', border: 'none', backgroundColor: 'var(--primary-color)', color: 'var(--button-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', width: '44px', height: '44px', flexShrink: 0 };

export default RoomChat;