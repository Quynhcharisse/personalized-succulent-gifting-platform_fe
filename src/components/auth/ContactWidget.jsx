import React, {useState} from 'react';
import {Box, IconButton} from '@mui/material';

const ContactWidget = () => {
    const [showContactDropdown, setShowContactDropdown] = useState(false);

    return (
        <Box
            className="contact-widget"
            sx={{
                position: 'fixed',
                bottom: 88, // Move above ChatBot button
                right: 24,
                zIndex: 1399, // Below ChatBot
            }}
        >
            {showContactDropdown && (
                <Box
                    className="contact-dropdown"
                    sx={{
                        position: 'absolute',
                        bottom: 80,
                        right: 0,
                        width: 320,
                        backgroundColor: 'white',
                        borderRadius: 2,
                        boxShadow: 3,
                    }}
                >
                    <div className="contact-dropdown__header">
                        <div className="contact-dropdown__header-icon">
                            <img src="/LaNhoBenThemLogo.png" alt="Lá Nhỏ Bên Thềm"/>
                        </div>
                        <div className="contact-dropdown__header-text">
                            <h3>Lá Nhỏ Bên Thềm có thể hỗ trợ gì cho anh chị?</h3>
                        </div>
                        <button
                            className="contact-dropdown__close"
                            onClick={() => setShowContactDropdown(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="contact-dropdown__options">
                        <a
                            href="https://m.me/lanhobenthem"
                            className="contact-dropdown__option"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className="contact-dropdown__option-icon contact-dropdown__option-icon--messenger">
                                <img src="/messengerIcon.png" alt="Messenger"/>
                            </div>
                            <div>
                                <div className="contact-dropdown__option-title">Messenger</div>
                                <div className="contact-dropdown__option-subtitle">https://m.me/lanhobenthem</div>
                            </div>
                        </a>

                        <a
                            href="mailto:support@lanhobenthem.com"
                            className="contact-dropdown__option"
                        >
                            <div className="contact-dropdown__option-icon contact-dropdown__option-icon--email">
                                <img src="/mailIcon.png" alt="Email"/>
                            </div>
                            <div>
                                <div className="contact-dropdown__option-title">Email</div>
                                <div className="contact-dropdown__option-subtitle">support@lanhobenthem.com</div>
                            </div>
                        </a>

                        <a
                            href="tel:0908304247"
                            className="contact-dropdown__option"
                        >
                            <div className="contact-dropdown__option-icon contact-dropdown__option-icon--phone">
                                <img src="/phoneIcon.png" alt="Phone"/>
                            </div>
                            <div>
                                <div className="contact-dropdown__option-title">Hotline</div>
                                <div className="contact-dropdown__option-subtitle">0908304247</div>
                            </div>
                        </a>
                    </div>

                    <div className="contact-dropdown__footer">
                        <p>Cung cấp bởi <strong>Lá Nhỏ Bên Thềm</strong></p>
                    </div>
                </Box>
            )}

            {/* Only show button when dropdown is closed */}
            {!showContactDropdown && (
                <IconButton
                    className="contact-widget__button"
                    onClick={() => setShowContactDropdown(true)}
                    style={{
                        position: 'relative',
                        bottom: 80, // Space above ChatBot button
                    }}
                >
                    <span className="contact-widget__icon">
                        <img src="/communications.png" alt="Contact"/>
                    </span>
                </IconButton>
            )}
        </Box>
    );
};

export default ContactWidget;
