import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { IoTrashOutline } from 'react-icons/io5';

function Dashboard() {
    const { user, profile } = useAuth();
    const [roomName, setRoomName] = useState('');
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('myRooms');
    const [message, setMessage] = useState('');

    const pageStyle = { padding: '20px 30px', maxWidth: '1200px', margin: '0 auto' };
    const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
    const welcomeMsgStyle = { fontSize: '1.8rem', fontWeight: '600', margin: 0, color: 'var(--text-color)' };
    const createRoomFormStyle = {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        marginBottom: '30px'
    };
    const inputStyle = { padding: '12px 15px', borderRadius: '6px', border: '1px solid var(--border-color)', flexGrow: 1, backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', fontSize: '1rem' };
    const buttonStyle = { padding: '12px 20px', borderRadius: '6px', border: 'none', background: 'var(--button-bg)', color: 'var(--button-text)', cursor: 'pointer', fontWeight: '500', fontSize: '1rem' };
    const tabsContainerStyle = { display: 'flex', marginBottom: '20px', borderBottom: '1px solid var(--border-color)' };
    const tabButtonStyle = (isActive) => ({
        padding: '10px 20px',
        cursor: 'pointer',
        border: 'none',
        borderBottom: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
        backgroundColor: 'transparent',
        color: isActive ? 'var(--primary-color)' : 'var(--text-color)',
        fontWeight: isActive ? '600' : 'normal',
        fontSize: '1.1rem',
        marginRight: '10px',
        transition: 'all 0.2s ease-in-out'
    });
    const roomCardStyle = {
        border: '1px solid var(--border-color)',
        padding: '20px',
        marginBottom: '15px',
        borderRadius: '8px',
        backgroundColor: 'var(--card-bg)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        color: 'var(--text-color)'
    };
    const actionButtonStyle = { padding: '8px 15px', borderRadius: '6px', border: 'none', background: 'var(--button-bg)', color: 'var(--button-text)', cursor: 'pointer', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' };

    const fetchRooms = useCallback(async () => {
        setLoadingRooms(true);
        setError('');
        try {
            if (!user || !user.id) {
                setError("User not available for fetching rooms.");
                setLoadingRooms(false);
                return;
            }
            const { data, error: rpcError } = await supabase
                .rpc('get_rooms_with_last_message', { p_user_id: user.id });

            if (rpcError) throw rpcError;

            const formattedRooms = (data || []).map(room => ({
                id: room.id,
                name: room.name,
                created_at: room.created_at,
                users: {
                    id: room.created_by,
                    username: room.creator_username,
                    avatar_url: room.creator_avatar_url
                },
                lastMessage: room.last_message_content ? {
                    content: room.last_message_content,
                    created_at: room.last_message_created_at,
                    user: { username: room.last_message_user_username }
                } : null,
                currentUserMembership: {
                    user_id: user.id,
                    status: room.current_user_member_status,
                    is_admin: room.current_user_is_admin
                },
                room_members: []
            }));
            setRooms(formattedRooms);
        } catch (err) {
            setError(`Failed to fetch rooms: ${err.message}`);
        } finally {
            setLoadingRooms(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchRooms();
        }
    }, [user, fetchRooms]);

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!roomName.trim()) {
            setError("Room name cannot be empty.");
            return;
        }
        if (!user || !profile || !user.id) {
            setError("You must be logged in to create a room.");
            return;
        }
        setError('');
        setMessage('');
        try {
            const { data: newRoom, error: createRoomError } = await supabase
                .from('rooms')
                .insert({ name: roomName, created_by: user.id })
                .select()
                .single();

            if (createRoomError) throw createRoomError;
            if (!newRoom) throw new Error("Room creation failed, no data returned.");

            const { error: addMemberError } = await supabase
                .from('room_members')
                .insert({
                    room_id: newRoom.id,
                    user_id: user.id,
                    status: 'member',
                    is_admin: true
                });

            if (addMemberError) {
                setError(`Room created, but failed to add you as admin member: ${addMemberError.message}.`);
            } else {
                setMessage(`Room "${roomName}" created successfully!`);
                setRoomName('');
                fetchRooms();
            }
        } catch (err) {
            setError(`Failed to create room: ${err.message}`);
        }
    };

    const handleJoinRoomRequest = async (roomId) => {
        if (!user) {
            setError("Please log in to join a room.");
            return;
        }
        setError('');
        setMessage('');
        try {
            const { data: existingMembership, error: checkError } = await supabase
                .from('room_members')
                .select('id, status')
                .eq('room_id', roomId)
                .eq('user_id', user.id)
                .maybeSingle();

            if (checkError) throw checkError;

            if (existingMembership) {
                if (existingMembership.status === 'member') {
                    setMessage("You are already a member of this room.");
                } else if (existingMembership.status === 'pending_approval') {
                    setMessage("You already have a pending request for this room.");
                } else {
                    setMessage(`Your status for this room is: ${existingMembership.status}.`);
                }
                return;
            }

            const { error: requestError } = await supabase
                .from('room_members')
                .insert({ room_id: roomId, user_id: user.id, status: 'pending_approval' });

            if (requestError) throw requestError;

            setMessage(`Request to join room sent successfully!`);
            fetchRooms();
        } catch (err) {
            setError(`Failed to send join request: ${err.message}`);
        }
    };

    const handleDeleteRoom = async (roomId, roomName) => {
        if (!window.confirm(`Are you sure you want to delete the room "${roomName}"? This action cannot be undone.`)) {
            return;
        }
        try {
            const roomToDelete = rooms.find(r => r.id === roomId);
            if (roomToDelete?.users?.id !== user?.id) {
                setError("You are not authorized to delete this room. Only the creator can delete it.");
                return;
            }

            const { error: deleteError } = await supabase
                .from('rooms')
                .delete()
                .eq('id', roomId);

            if (deleteError) throw deleteError;
            setMessage(`Room "${roomName}" deleted successfully.`);
            fetchRooms();
        } catch (err) {
            setError(`Failed to delete room: ${err.message}`);
        }
    };

    if (!profile && loadingRooms) {
        return <div style={pageStyle}><p style={{ color: 'var(--text-color)' }}>Loading user profile and rooms...</p></div>;
    }
    if (loadingRooms && !rooms.length) {
        return <div style={pageStyle}><p style={{ color: 'var(--text-color)' }}>Loading rooms...</p></div>;
    }

    const myRooms = rooms.filter(room => room.currentUserMembership?.status === 'member' || room.currentUserMembership?.is_admin);
    const discoverRooms = rooms.filter(room => !myRooms.find(myRoom => myRoom.id === room.id));

    const renderRoomList = (roomList, isMyRoomsTab) => {
        if (loadingRooms && !roomList.length) return <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-color)' }}>Loading rooms...</p>;
        if (!loadingRooms && roomList.length === 0) {
            return <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-color)' }}>{isMyRoomsTab ? "You haven't joined or created any rooms yet." : "No other rooms to discover right now."}</p>;
        }

        return (
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {roomList.map((room) => (
                    <li key={room.id} style={roomCardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: 'var(--link-color)' }}>
                                    {room.name}
                                </h4>
                                <small style={{ color: 'var(--text-color-muted)', opacity: 0.8 }}>
                                    Created by: {room.users?.username || 'Unknown User'}
                                    {room.users?.avatar_url && <img src={room.users.avatar_url} alt={room.users.username} style={{ width: '20px', height: '20px', borderRadius: '50%', marginLeft: '5px', verticalAlign: 'middle', border: '1px solid var(--border-color)' }} />}
                                    {' on '} {new Date(room.created_at).toLocaleDateString()}
                                </small>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {room.currentUserMembership?.status === 'member' || room.currentUserMembership?.is_admin ? (
                                    <Link
                                        to={`/room/${room.id}`}
                                        style={actionButtonStyle}
                                    >
                                        View Room
                                    </Link>
                                ) : room.currentUserMembership?.status === 'pending_approval' ? (
                                    <button
                                        disabled
                                        style={{ ...actionButtonStyle, backgroundColor: 'var(--border-color)', color: 'var(--text-color-muted)', opacity: 0.7, cursor: 'default' }}
                                    >
                                        Request Sent
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleJoinRoomRequest(room.id)}
                                        style={actionButtonStyle}
                                    >
                                        Join Room
                                    </button>
                                )}
                                {isMyRoomsTab && room.users?.id === user?.id && (
                                    <button
                                        onClick={() => handleDeleteRoom(room.id, room.name)}
                                        title="Delete Room"
                                        style={{ ...actionButtonStyle, background: 'var(--error-text)', color: 'white', padding: '8px 10px' }}
                                    >
                                        <IoTrashOutline />
                                    </button>
                                )}
                            </div>
                        </div>
                        {room.lastMessage ? (
                            <p style={{ margin: '0', fontSize: '0.9em', color: 'var(--text-color)', opacity: 0.9, borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                                <span style={{ fontWeight: '500' }}>{room.lastMessage.user?.username || 'Someone'}:</span> {room.lastMessage.content.substring(0, 70)}{room.lastMessage.content.length > 70 ? '...' : ''}
                                <span style={{ fontSize: '0.8em', color: 'var(--text-color-muted)', opacity: 0.6, marginLeft: '8px' }}>({new Date(room.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                            </p>
                        ) : (
                            <p style={{ margin: '0', fontSize: '0.9em', color: 'var(--text-color-muted)', opacity: 0.7, borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                                <em>No messages yet.</em>
                            </p>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div style={pageStyle}>
            <header style={headerStyle}>
                <h2 style={welcomeMsgStyle}>Welcome to the Dashboard, {profile?.username || user?.email}!</h2>
            </header>

            {error && <p style={{ color: 'var(--error-text)', backgroundColor: 'rgba(220, 53, 69, 0.1)', padding: '10px', borderRadius: '6px', border: `1px solid var(--error-text)` }}>{error}</p>}
            {message && <p style={{ color: 'var(--success-text)', backgroundColor: 'rgba(40, 167, 69, 0.1)', padding: '10px', borderRadius: '6px', border: `1px solid var(--success-text)` }}>{message}</p>}

            <div style={createRoomFormStyle}>
                <h3 style={{ margin: '0 20px 0 0', fontSize: '1.3rem', fontWeight: '600', color: 'var(--text-color)' }}>Create New Room</h3>
                <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexGrow: 1, gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Enter room name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <button type="submit" style={buttonStyle}>
                        Create Room
                    </button>
                </form>
            </div>

            <div style={tabsContainerStyle}>
                <button style={tabButtonStyle(activeTab === 'myRooms')} onClick={() => setActiveTab('myRooms')}>
                    My Rooms ({myRooms.length})
                </button>
                <button style={tabButtonStyle(activeTab === 'discoverRooms')} onClick={() => setActiveTab('discoverRooms')}>
                    Discover Rooms ({discoverRooms.length})
                </button>
            </div>

            <div>
                {activeTab === 'myRooms' && renderRoomList(myRooms, true)}
                {activeTab === 'discoverRooms' && renderRoomList(discoverRooms, false)}
            </div>
        </div>
    );
}

export default Dashboard;