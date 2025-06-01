import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { IoChatbubbleEllipsesOutline, IoLogInOutline, IoPersonAddOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

function Login() {
    const navigate = useNavigate();
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate('/dashboard');
            }
        };
        checkUser();
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!emailOrUsername || !password) {
            setError("Email/Username and password are required.");
            setLoading(false);
            return;
        }

        let emailToLogin = emailOrUsername;

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: emailToLogin,
                password,
            });

            if (signInError) {
                setError(signInError.message);
                setLoading(false);
                return;
            }

            if (data.user && data.session) {
                navigate('/dashboard');
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError(err.message || "An unexpected error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    const pageStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 70px)',
        padding: '20px',
        backgroundColor: 'var(--background-color)',
        color: 'var(--text-color)',
    };
    const formContainerStyle = {
        backgroundColor: 'var(--navbar-bg)',
        padding: '30px 40px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
    };
    const inputStyle = {
        width: '100%',
        padding: '12px 15px',
        marginBottom: '15px',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--background-color)',
        color: 'var(--text-color)',
        fontSize: '1rem',
        boxSizing: 'border-box'
    };
    const passwordContainerStyle = {
        position: 'relative',
        width: '100%',
        marginBottom: '15px',
    };
    const passwordToggleStyle = {
        position: 'absolute',
        top: '50%',
        right: '15px',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: 'var(--text-color)',
        cursor: 'pointer',
        fontSize: '1.2rem'
    };
    const buttonStyle = {
        width: '100%',
        padding: '12px 15px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: 'var(--button-bg)',
        color: 'var(--button-text)',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'background-color 0.3s ease'
    };
    const linkStyle = {
        color: 'var(--link-color)',
        textDecoration: 'none',
        fontWeight: '500'
    };

    return (
        <div style={pageStyle}>
            <div style={formContainerStyle}>
                <IoChatbubbleEllipsesOutline style={{ fontSize: '3.5rem', color: 'var(--link-color)', marginBottom: '5px' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--link-color)', marginBottom: '5px' }}>ConnectSphere</h1>
                <p style={{ color: 'var(--text-color)', marginBottom: '25px', fontSize: '1.1rem' }}>Your World, Seamlessly Connected.</p>

                <h2 style={{ marginBottom: '10px', fontWeight: '600', fontSize: '1.8rem' }}>Welcome Back!</h2>
                <p style={{ marginBottom: '25px', color: 'var(--text-color)' }}>Login with your username or email.</p>

                {error && <p style={{ color: 'var(--error-text)', marginBottom: '15px' }}>{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username or Email"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <div style={passwordContainerStyle}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ ...inputStyle, marginBottom: '0' }}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={passwordToggleStyle} title={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                        </button>
                    </div>
                    <button type="submit" disabled={loading} style={buttonStyle}>
                        {loading ? 'Logging in...' : <><IoLogInOutline style={{ fontSize: '1.2rem' }} /> Login</>}
                    </button>
                </form>
                <p style={{ marginTop: '25px', fontSize: '0.95rem' }}>
                    Don't have an account? <Link to="/signup" style={linkStyle}>Sign Up <IoPersonAddOutline style={{ verticalAlign: 'middle', marginLeft: '3px' }} /></Link>
                </p>
            </div>
        </div>
    );
}

export default Login;