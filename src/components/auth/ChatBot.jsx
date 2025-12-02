import React, {useState, useRef} from 'react';
import {Dialog, IconButton, Box, Typography} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import MinimizeIcon from '@mui/icons-material/Minimize';
import ChatIcon from '@mui/icons-material/Chat';

const ChatBot = () => {
    const [open, setOpen] = useState(false);
    const [size, setSize] = useState({width: 420, height: 600});
    const [isResizing, setIsResizing] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const resizeRef = useRef(null);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsResizing(true);
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;

        const handleMouseMove = (e) => {
            const deltaX = startX - e.clientX;
            const deltaY = startY - e.clientY;
            
            setSize({
                width: Math.max(360, Math.min(900, startWidth + deltaX)),
                height: Math.max(450, Math.min(window.innerHeight - 80, startHeight + deltaY))
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    return (
        <>
            {/* Chat Icon Button - Floating bubble */}
            {!open && (
                <Box
                    onClick={() => setOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1400,
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                        boxShadow: '0 4px 20px rgba(46, 125, 50, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 6px 24px rgba(46, 125, 50, 0.5)',
                        },
                        '&:active': {
                            transform: 'scale(0.95)',
                        }
                    }}
                >
                    <img src={'/chatbot.png'} alt="Chatbot" style={{width: 40, height: 40}}/>
                </Box>
            )}

            {/* Resizable Chat Dialog */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                slotProps={{
                    paper: {
                        sx: {
                            position: 'fixed',
                            right: isMaximized ? 0 : 24,
                            bottom: isMaximized ? 0 : 24,
                            top: isMaximized ? 0 : 'auto',
                            left: isMaximized ? 0 : 'auto',
                            m: 0,
                            width: isMaximized ? '100vw' : size.width,
                            height: isMaximized ? '100vh' : size.height,
                            maxWidth: '100vw',
                            maxHeight: '100vh',
                            p: 0,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: isMaximized ? 0 : 3,
                            boxShadow: isMaximized 
                                ? 'none' 
                                : '0 12px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                            border: isMaximized ? 'none' : '1px solid rgba(0,0,0,0.08)'
                        }
                    }
                }}
                hideBackdrop
            >
                {/* Control buttons - positioned absolute */}
                <Box sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 10,
                    display: 'flex',
                    gap: 1
                }}>
                    <IconButton 
                        size="small"
                        onClick={toggleMaximize}
                        title={isMaximized ? "Thu nhỏ" : "Phóng to"}
                        sx={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            '&:hover': {backgroundColor: 'rgba(255,255,255,1)'},
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                    >
                        {isMaximized ? <CloseFullscreenIcon fontSize="small"/> : <OpenInFullIcon fontSize="small"/>}
                    </IconButton>
                    <IconButton 
                        size="small"
                        onClick={() => setOpen(false)}
                        title="Đóng"
                        sx={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            '&:hover': {backgroundColor: 'rgba(255,255,255,1)'},
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                    >
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                </Box>

                {/* Chat Content */}
                <Box sx={{
                    flex: 1, 
                    minHeight: 0, 
                    position: 'relative',
                    backgroundColor: '#f8f9fa'
                }}>
                    <iframe
                        src="https://udify.app/chatbot/wELC5dhszeiBgJoJ"
                        title="Chatbot"
                        width="100%"
                        height="100%"
                        style={{border: 0, display: 'block'}}
                    />
                </Box>

                {/* Resize Handle - More visible and user-friendly */}
                {!isMaximized && (
                    <Box
                        ref={resizeRef}
                        onMouseDown={handleMouseDown}
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 40,
                            height: 40,
                            cursor: 'nwse-resize',
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, transparent 0%, transparent 50%, rgba(46, 125, 50, 0.15) 50%, rgba(46, 125, 50, 0.15) 100%)',
                            borderRadius: '0 0 12px 0',
                            transition: 'all 0.2s ease',
                            '&::after': {
                                content: '"⋰⋰"',
                                position: 'absolute',
                                bottom: 4,
                                right: 4,
                                fontSize: '16px',
                                color: 'rgba(46, 125, 50, 0.5)',
                                lineHeight: 1,
                                fontWeight: 'bold',
                                transform: 'rotate(-45deg)',
                            },
                            '&:hover': {
                                background: 'linear-gradient(135deg, transparent 0%, transparent 50%, rgba(46, 125, 50, 0.25) 50%, rgba(46, 125, 50, 0.25) 100%)',
                            },
                            '&:hover::after': {
                                color: 'rgba(46, 125, 50, 0.8)',
                            }
                        }}
                    />
                )}
            </Dialog>
        </>
    );
};

export default ChatBot;