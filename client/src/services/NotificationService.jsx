import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import useNotify from '../hooks/useNotify';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

export function NotificationDisplay() {
    const { info } = useNotify();
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        const socket = new SockJS('/ws-endpoint');
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            stompClient.subscribe('/topic/notifications', (message) => {
                const notification = JSON.parse(message.body);
                setNotifications((prev) => [notification, ...prev]);
            });
        });

        return () => {
            stompClient.disconnect();
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/v1/notifications');
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            info('Failed to fetch notifications');
            console.error(error);
        }
    };

    const handleIconClick = (event) => {
        setAnchorEl(event.currentTarget);
        fetchNotifications();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleIconClick}>
                <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                        <MenuItem key={index} onClick={handleClose}>
                            <Typography variant="body2">{notification.message}</Typography>
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem onClick={handleClose}>
                        <Typography variant="body2">No new notifications</Typography>
                    </MenuItem>
                )}
            </Menu>
        </>
    );
}