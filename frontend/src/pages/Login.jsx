import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { IoChatbubbleEllipsesOutline, IoLogInOutline, IoPersonAddOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'; // Import icons

function Login() {
    const navigate = useNavigate();
    const [emailOrUsername, setEmailOrUsername] = useState(''); // Can be email or username
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if user is already logged in
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

        // Attempt to see if it's a username and fetch email
        // This requires RLS to allow reading the users table for this purpose,
        // or a dedicated database function (rpc).
        // For simplicity, we'll assume email is used for login directly with Supabase Auth.
        // If you want username login, you'd typically:
        // 1. Create an RPC function in Supabase: `get_email_for_username(username_param TEXT)`
        // 2. Call it: `const { data, error } = await supabase.rpc('get_email_for_username', { username_param: emailOrUsername })`
        // 3. If email found, use it for `signInWithPassword`.
        // For this example, we'll stick to email for Supabase Auth.
        // If the user enters a username, this will likely fail unless their username is also their email.
        // A more robust solution would involve the RPC call mentioned above.

        // Log the credentials being sent for debugging
        console.log('Attempting to log in with email:', emailToLogin);
        console.log('Attempting to log in with password:', password); // For debugging only, remove in production

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: emailToLogin, // Supabase auth typically uses email
                password,
            });

            if (signInError) {
                setError(signInError.message);
                setLoading(false);
                return;
            }

            if (data.user && data.session) {
                // Login successful
                // The session is automatically handled by supabase-js, including localStorage.
                // The AuthProvider in App.jsx will pick up the session change.
                navigate('/dashboard'); // Redirect to dashboard
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError(err.message || "An unexpected error occurred during login.");
            console.error("Login catch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Basic styles (can be moved to a CSS file)
    const pageStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 70px)', // Adjust based on navbar height
        padding: '20px',
        backgroundColor: 'var(--background-color)',
        color: 'var(--text-color)',
    };
    const formContainerStyle = {
        backgroundColor: 'var(--navbar-bg)', // Using navbar-bg for contrast as in example
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
        backgroundColor: 'var(--button-bg)', // Use theme variable
        color: 'var(--button-text)', // Use theme variable
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

                {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
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