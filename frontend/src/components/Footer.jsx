import React from 'react';
import { IoChatbubbleEllipsesOutline, IoLogoLinkedin, IoLogoGithub } from 'react-icons/io5';

function Footer() {
    const footerStyle = {
        backgroundColor: 'var(--navbar-bg)',
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
                <div style={socialIconsStyle}>
                    <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={iconLinkStyle}
                        title="LinkedIn"
                        onMouseOver={e => e.currentTarget.style.color = 'var(--link-color)'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-color)'}
                    >
                        <IoLogoLinkedin />
                    </a>
                    <a
                        href="https://github.com/kd-debug/CodeClauseInternship_ChatApplication"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={iconLinkStyle}
                        title="GitHub"
                        onMouseOver={e => e.currentTarget.style.color = 'var(--link-color)'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-color)'}
                    >
                        <IoLogoGithub />
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;