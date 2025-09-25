import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    alpha
} from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';
import { getTotalBuyerCount } from '../../services/AccountService.jsx';

const colors = {
    primary: '#0b3f31',
    primaryLight: '#1a6b4e',
    secondary: '#2c7a5e',
    accent: '#4ade80',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
};

export default function BuyerStatsChart() {
    const [totalBuyers, setTotalBuyers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await getTotalBuyerCount();
          
            const count = response?.data?.data?.totalBuyerCount || 0;
          
            setTotalBuyers(count);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error fetching buyer count:', err);
            setError('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{
            borderRadius: 4,
            border: `1px solid ${alpha(colors.primary, 0.1)}`,
            background: `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha(colors.primary, 0.02)} 100%)`,
            boxShadow: `0 8px 32px ${alpha(colors.primary, 0.1)}`,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            height: '100%',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 40px ${alpha(colors.primary, 0.2)}`,
            }
        }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${alpha(colors.primary, 0.3)}`,
                        mr: 2
                    }}>
                        <PeopleIcon sx={{ fontSize: 32, color: 'white' }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            color: colors.primary,
                            mb: 0.5
                        }}>
                            Tổng số người mua
                        </Typography>
                        {loading ? (
                            <CircularProgress size={24} sx={{ color: colors.primary }} />
                        ) : error ? (
                            <Alert severity="error" sx={{ mt: 1, p: 1 }}>{error}</Alert>
                        ) : (
                            <Typography variant="h3" sx={{ 
                                fontWeight: 800, 
                                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                lineHeight: 1.2
                            }}>
                                {totalBuyers.toLocaleString('vi-VN')}
                            </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            tài khoản đã đăng ký
                        </Typography>
                    </Box>
                </Box>
                {lastUpdated && (
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 'auto', textAlign: 'left' }}>
                        Cập nhật lần cuối: {lastUpdated.toLocaleString('vi-VN')}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}