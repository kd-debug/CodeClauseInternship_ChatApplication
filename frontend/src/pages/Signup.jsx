import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { IoChatbubbleEllipsesOutline, IoPersonAddOutline, IoLogInOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'; // Import icons

// Function to generate a simple placeholder avatar based on gender
const getPlaceholderAvatar = (gender) => {
    // These are just example URLs, replace with your actual placeholder avatar URLs
    // or use a service like DiceBear Avatars, Gravatar, etc.
    if (gender === 'male') {
        return 'https://avatar.iran.liara.run/public/boy?username=Scott'; // Example male avatar
    } else if (gender === 'female') {
        return 'https://avatar.iran.liara.run/public/girl?username=Scott'; // Example female avatar
    } else {
        return 'https://avatar.iran.liara.run/public'; // Example neutral avatar
    }
};

function Signup() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [gender, setGender] = useState('male'); // Default gender
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!username || !email || !password || !confirmPassword || !gender) {
            setError("All fields are required.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password should be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            // Step 1: Sign up the user with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }

            if (!authData.user) {
                setError("Signup was not successful. No user data returned. Please try again.");
                setLoading(false);
                return;
            }

            // Step 2: Call the RPC function to create the user profile
            const avatarUrl = getPlaceholderAvatar(gender);
            const { error: profileError } = await supabase.rpc('create_user_profile', {
                user_id: authData.user.id,
                user_username: username,
                user_email: authData.user.email,
                user_gender: gender,
                user_avatar_url: avatarUrl
            });

            if (profileError) {
                // If profile creation fails, it's a tricky situation.
                // For now, we'll report the error. Ideally, you might want to clean up the auth user
                // or have a retry mechanism.
                setError(`User signed up, but profile creation failed: ${profileError.message}. Please contact support or try logging in.`);
                // Log the auth user details for debugging if profile insertion fails
                console.error("Auth user created but profile insertion failed:", authData.user);
                // Potentially, you might want to sign the user out or delete the auth user if profile setup is critical
                // await supabase.auth.signOut(); // or admin call to delete user
            } else {
                setMessage("Signup successful! Please check your email to confirm your account. You will be redirected to login.");
                // Clear form or redirect
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }

        } catch (err) {
            setError(err.message || "An unexpected error occurred during signup.");
            console.error("Signup catch error:", err);
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
    const selectStyle = {
        ...inputStyle, // Inherit base input styles
        appearance: 'none', // Remove default arrow on some browsers
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${getComputedStyle(document.documentElement).getPropertyValue('--text-color').substring(1)}'%3E%3Cpath d='M7 10l5 5 5-5H7z'/%3E%3C/svg%3E")`, // Custom arrow
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 15px center',
        backgroundSize: '1.2em',
        paddingRight: '40px' // Make space for custom arrow
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
        transition: 'background-color 0.3s ease',
        marginTop: '10px'
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
                <p style={{ color: 'var(--text-color)', marginBottom: '25px', fontSize: '1.1rem' }}>Just talk. We’ve got the rest.</p>

                <h2 style={{ marginBottom: '10px', fontWeight: '600', fontSize: '1.8rem' }}>Create Account</h2>

                {message && <p style={{ color: 'green', marginBottom: '15px' }}>{message}</p>}
                {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
                <form onSubmit={handleSignup}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <div style={passwordContainerStyle}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password (min. 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ ...inputStyle, marginBottom: '0' }}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={passwordToggleStyle} title={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                        </button>
                    </div>
                    <div style={passwordContainerStyle}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{ ...inputStyle, marginBottom: '0' }}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={passwordToggleStyle} title={showConfirmPassword ? "Hide password" : "Show password"}>
                            {showConfirmPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                        </button>
                    </div>
                    <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                        style={selectStyle}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                    <button type="submit" disabled={loading} style={buttonStyle}>
                        {loading ? 'Signing up...' : <><IoPersonAddOutline style={{ fontSize: '1.2rem' }} /> Sign Up</>}
                    </button>
                </form>
                <p style={{ marginTop: '25px', fontSize: '0.95rem' }}>
                    Already have an account? <Link to="/login" style={linkStyle}>Login <IoLogInOutline style={{ verticalAlign: 'middle', marginLeft: '3px' }} /></Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;