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
        const wsEndpoint = import.meta.env.MODE === 'development'
            ? '/ws-endpoint'
            : `${import.meta.env.VITE_API_URL}/ws-endpoint`;
        
        console.log('NotificationService: Connecting to WebSocket at', wsEndpoint);
        
        const socket = new SockJS(wsEndpoint);
        const stompClient = Stomp.over(socket);
        let isConnected = false;

        stompClient.connect({}, () => {
            isConnected = true;
            console.log('NotificationService: WebSocket connected successfully');
            stompClient.subscribe('/topic/notifications', (message) => {
                const notification = JSON.parse(message.body);
                setNotifications((prev) => [notification, ...prev]);
            });
        }, (error) => {
            console.error('NotificationService: WebSocket connection error:', error);
        });
        
        // Handle socket errors
        socket.onerror = (error) => {
            console.error('NotificationService: Socket error:', error);
        };
        
        socket.onopen = () => {
            console.log('NotificationService: Socket opened');
        };
        
        socket.onclose = (event) => {
            console.log('NotificationService: Socket closed', event);
        };

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