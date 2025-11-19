import React, {useState} from 'react';
import {Dialog, IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ChatBot = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Chat Icon Button */}
            {!open && (
                <IconButton
                    onClick={() => setOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1400,
                        p: 1.5
                    }}
                    size="large"
                >
                    <img src={'/chatbot.png'} alt="Chatbot" style={{width: 48, height: 48}}/>
                </IconButton>
            )}

            {/* Simple Chat Dialog */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                slotProps={{
                    paper: {
                        sx: {
                            position: 'fixed',
                            right: 24,
                            bottom: 24,
                            m: 0,
                            width: 360,
                            height: '50vh',
                            p: 0,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }
                    }
                }}
                hideBackdrop
            >
                {/* Chat Content */}
                <IconButton onClick={() => setOpen(false)}
                            sx={{position: 'absolute', top: 8, right: 8, zIndex: 1}}>
                    <CloseIcon/>
                </IconButton>
                <iframe
                    src="https://udify.app/chatbot/wELC5dhszeiBgJoJ"
                    title="Chatbot"
                    width="100%"
                    height="100%"
                    style={{border: 1, flex: 1, minHeight: 0}}
                />
            </Dialog>
        </>
    );
};

export default ChatBot;