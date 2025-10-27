import React, {useEffect, useState} from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import useNotify from '../hooks/useNotify';
import {Badge, Menu, MenuItem, Typography,} from '@mui/material';
import {Notifications as NotificationsIcon} from '@mui/icons-material';
import axiosClient from "../config/APIConfig.jsx";


export function NotificationDisplay() {
    const {info} = useNotify();
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        // Determine WS endpoint based on environment
        const isDevelopment = import.meta.env.MODE === 'development';
        const wsEndpoint = isDevelopment 
            ? 'http://localhost:5173/ws-endpoint'  // Use localhost proxy in dev
            : `${import.meta.env.VITE_API_URL}/ws-endpoint`;  // Direct to server in prod
        
        const socket = new SockJS(wsEndpoint);
        const stompClient = Stomp.over(socket);
        let isConnected = false;

        stompClient.connect({}, () => {
            isConnected = true;
            stompClient.subscribe('/topic/notifications', (message) => {
                const notification = JSON.parse(message.body);
                setNotifications((prev) => [notification, ...prev]);
            });
        }, (error) => {
            console.error('WebSocket connection error:', error);
        });

        return () => {
            if (isConnected && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axiosClient.get('/notifications');
            setNotifications(response.data.data.notifications);
        } catch (error) {
            info('Failed to fetch notifications');
            console.error(error);
        }
    };

    const handleIconClick = (event) => {
        setAnchorEl(event.currentTarget);
        fetchNotifications().then(() => {
        });
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Badge badgeContent={notifications.length} color="error" onClick={handleIconClick}>
                <NotificationsIcon/>
            </Badge>
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