import React from 'react';
import { IoChatbubbleEllipsesOutline, IoLogoLinkedin, IoLogoGithub, IoLogoTwitter } from 'react-icons/io5';

function Footer() {
    const footerStyle = {
        backgroundColor: 'var(--navbar-bg)', // Use navbar-bg for consistency or a dedicated footer-bg
        color: 'var(--text-color)',
        padding: '25px 0',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.9rem',
    };

    const logoStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: 'var(--link-color)',
    };

    const socialIconsStyle = {
        marginTop: '10px',
    };

    const iconLinkStyle = {
        color: 'var(--text-color)',
        margin: '0 10px',
        fontSize: '1.5rem',
        transition: 'color 0.2s ease-in-out',
    };

    // Hover effect can be done with CSS if preferred, or simple JS like this for direct style
    // For CSS: a:hover { color: var(--link-color); }

    return (
        <footer style={footerStyle}>
            <div className="container">
                <div style={logoStyle}>
                    <IoChatbubbleEllipsesOutline style={{ marginRight: '8px', fontSize: '1.8rem' }} />
                    ConnectSphere
                </div>
                <p style={{ margin: '5px 0' }}>
                    &copy; {new Date().getFullYear()} ConnectSphere. All rights reserved.
                </p>
                <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: '5px 0' }}>
                    Your World, Seamlessly Connected.
                </p>
                <div style={socialIconsStyle}>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle} title="LinkedIn" onMouseOver={e => e.currentTarget.style.color = 'var(--link-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-color)'}>
                        <IoLogoLinkedin />
                    </a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle} title="GitHub" onMouseOver={e => e.currentTarget.style.color = 'var(--link-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-color)'}>
                        <IoLogoGithub />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle} title="Twitter" onMouseOver={e => e.currentTarget.style.color = 'var(--link-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-color)'}>
                        <IoLogoTwitter />
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;