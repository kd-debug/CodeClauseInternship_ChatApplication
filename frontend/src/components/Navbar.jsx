import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { IoChatbubbleEllipsesOutline, IoSunnyOutline, IoMoonOutline } from 'react-icons/io5'; // Import icons

// Theme toggle function using a body class
const applyBodyTheme = (theme) => {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    }
    // The CSS variables in index.css will take care of styling
};

function Navbar() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    // Initialize theme from localStorage or default to 'light'
    const [currentTheme, setCurrentTheme] = useState(() => {
        const savedTheme = localStorage.getItem('connectsphere-theme');
        return savedTheme || 'light';
    });

    useEffect(() => {
        applyBodyTheme(currentTheme);
        localStorage.setItem('connectsphere-theme', currentTheme);
    }, [currentTheme]);

    const handleThemeChange = () => {
        setCurrentTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login'); // Redirect to login after logout
        } catch (error) {
            console.error("Error logging out:", error);
            // Handle logout error (e.g., show a notification)
        }
    };

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--navbar-bg)',
            color: 'var(--text-color)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link to={user ? "/dashboard" : "/"} style={{ textDecoration: 'none', color: 'var(--link-color)', fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
                    <IoChatbubbleEllipsesOutline style={{ marginRight: '8px', fontSize: '2rem' }} />
                    ConnectSphere
                </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                    onClick={handleThemeChange}
                    title={currentTheme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--link-color)', // Use link color for icon buttons
                        cursor: 'pointer',
                        fontSize: '1.5rem', // Adjust icon size
                        marginRight: '20px',
                        padding: '5px'
                    }}
                >
                    {currentTheme === 'light' ? <IoMoonOutline /> : <IoSunnyOutline />}
                </button>
                {user ? (
                    <>
                        {profile && (
                            <img
                                src={profile.avatar_url || `https://avatar.iran.liara.run/public/${profile.gender === 'female' ? 'girl' : 'boy'}?username=${profile.username || user.id}`}
                                alt={profile.username || 'User'}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '10px', border: '1px solid var(--border-color)', objectFit: 'cover' }}
                            />
                        )}
                        <span style={{ marginRight: '20px', fontWeight: '500' }}>
                            {profile?.username || user.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'none', // Make it look less like a prominent button
                                border: '1px solid var(--border-color)', // Subtle border
                                color: 'var(--text-color)', // Use general text color that adapts
                                cursor: 'pointer',
                                padding: '7px 15px', // Adjusted padding
                                borderRadius: '6px',
                                fontWeight: '500',
                                transition: 'background-color 0.2s ease, color 0.2s ease'
                            }}
                            onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--background-color)'; }}
                            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-color)'; }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ marginRight: '15px', textDecoration: 'none', color: 'var(--link-color)' }}>Login</Link>
                        <Link to="/signup" style={{ textDecoration: 'none', color: 'var(--link-color)' }}>Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;