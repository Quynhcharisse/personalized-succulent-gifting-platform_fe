import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    List,
    ListItem,
    ListItemButton,
    useTheme,
    useMediaQuery,
    Paper,
    Grid,
    Button,
    Chip,
    Card,
    CardContent,
    Badge,
    alpha,
    Stack,
    LinearProgress
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    AccountCircle as AccountCircleIcon,
    Logout as LogoutIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 280;

// Color palette based on #0b3f31
const colors = {
    primary: '#0b3f31',
    primaryLight: '#1a6b4e',
    primaryDark: '#073026',
    secondary: '#2c7a5e',
    accent: '#4ade80',
    surface: '#f8fffe',
    surfaceVariant: '#e8f5f2',
    onSurface: '#0d1a16',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
};

// Navigation configuration
const NAVIGATION = [
    {
        segment: 'dashboard',
        title: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/admin/dashboard'
    },
    {
        segment: 'suppliers',
        title: 'Nhà cung cấp',
        icon: <PeopleIcon />,
        path: '/admin/suppliers'
    },
    {
        segment: 'users',
        title: 'Quản lý người dùng',
        icon: <PeopleIcon />,
        path: '/admin/users'
    }
];

function AdminDashboardContent({ session }) {
    return (
        <Box sx={{ px: 4, py: 5 }}>
            {/* Header */}
            <Box sx={{ mb: 5 }}>
                <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                }}>
                    {session.user.role || 'User'} Dashboard
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
                    Chào mừng trở lại! Đây là tổng quan về hoạt động của hệ thống
                </Typography>
            </Box>

            {/* Quick Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${alpha(colors.primary, 0.8)} 100%)`,
                        color: 'white',
                        borderRadius: 3,
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 25px ${alpha(colors.primary, 0.3)}`,
                        }
                    }}>
                        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                            <Box sx={{
                                backgroundColor: alpha('#ffffff', 0.2),
                                borderRadius: 2,
                                p: 1.5,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                            }}>
                                <PeopleIcon sx={{ fontSize: 28, color: 'white' }} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                Quản lý
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Tài khoản người dùng
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: `linear-gradient(135deg, ${colors.success} 0%, ${alpha(colors.success, 0.8)} 100%)`,
                        color: 'white',
                        borderRadius: 3,
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 25px ${alpha(colors.success, 0.3)}`,
                        }
                    }}>
                        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                            <Box sx={{
                                backgroundColor: alpha('#ffffff', 0.2),
                                borderRadius: 2,
                                p: 1.5,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                            }}>
                                <DashboardIcon sx={{ fontSize: 28, color: 'white' }} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                Hệ thống
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Quản trị tổng thể
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: `linear-gradient(135deg, ${colors.info} 0%, ${alpha(colors.info, 0.8)} 100%)`,
                        color: 'white',
                        borderRadius: 3,
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 25px ${alpha(colors.info, 0.3)}`,
                        }
                    }}>
                        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                            <Box sx={{
                                backgroundColor: alpha('#ffffff', 0.2),
                                borderRadius: 2,
                                p: 1.5,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                            }}>
                                <NotificationsIcon sx={{ fontSize: 28, color: 'white' }} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                Thông báo
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Cập nhật hệ thống
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        background: `linear-gradient(135deg, ${colors.warning} 0%, ${alpha(colors.warning, 0.8)} 100%)`,
                        color: 'white',
                        borderRadius: 3,
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 25px ${alpha(colors.warning, 0.3)}`,
                        }
                    }}>
                        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                            <Box sx={{
                                backgroundColor: alpha('#ffffff', 0.2),
                                borderRadius: 2,
                                p: 1.5,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                            }}>
                                <AccountCircleIcon sx={{ fontSize: 28, color: 'white' }} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                Tài khoản
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Thông tin cá nhân
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Welcome Message */}
            <Card sx={{
                borderRadius: 4,
                border: `1px solid ${alpha(colors.primary, 0.1)}`,
                background: `linear-gradient(135deg, ${colors.surface} 0%, ${alpha(colors.surfaceVariant, 0.5)} 100%)`,
                boxShadow: `0 4px 20px ${alpha(colors.primary, 0.1)}`,
                mb: 4
            }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        mb: 2,
                        color: colors.primary
                    }}>
                        Chào mừng đến với Admin Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                        Sử dụng menu bên trái để điều hướng đến các chức năng quản lý
                    </Typography>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: 2, 
                        flexWrap: 'wrap' 
                    }}>
                        <Button
                            variant="contained"
                            startIcon={<PeopleIcon />}
                            onClick={() => window.location.href = '/admin/users'}
                            sx={{
                                borderRadius: 3,
                                px: 3,
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                backgroundColor: colors.primary,
                                '&:hover': {
                                    backgroundColor: colors.primaryDark,
                                }
                            }}
                        >
                            Quản lý người dùng
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* System Info */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{
                        borderRadius: 3,
                        border: `1px solid ${alpha(colors.primary, 0.1)}`,
                        background: `linear-gradient(135deg, ${colors.surface} 0%, ${alpha(colors.surfaceVariant, 0.3)} 100%)`,
                        boxShadow: `0 2px 12px ${alpha(colors.primary, 0.08)}`,
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                mb: 2,
                                color: colors.primary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Box sx={{
                                    width: 4,
                                    height: 20,
                                    backgroundColor: colors.primary,
                                    borderRadius: 1
                                }} />
                                Thông tin hệ thống
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Phiên bản:</Typography>
                                    <Chip label="v1.0.0" size="small" color="primary" variant="outlined" />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                                    <Chip label="Hoạt động" size="small" color="success" />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Cập nhật cuối:</Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        {new Date().toLocaleDateString('vi-VN')}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card sx={{
                        borderRadius: 3,
                        border: `1px solid ${alpha(colors.primary, 0.1)}`,
                        background: `linear-gradient(135deg, ${colors.surface} 0%, ${alpha(colors.surfaceVariant, 0.3)} 100%)`,
                        boxShadow: `0 2px 12px ${alpha(colors.primary, 0.08)}`,
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                mb: 2,
                                color: colors.primary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Box sx={{
                                    width: 4,
                                    height: 20,
                                    backgroundColor: colors.primary,
                                    borderRadius: 1
                                }} />
                                Hướng dẫn nhanh
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                    • Sử dụng menu bên trái để điều hướng
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                    • Click vào "Quản lý người dùng" để xem danh sách
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                    • Sử dụng avatar để đăng xuất hoặc xem thông tin
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default function AdminDashboard() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [session, setSession] = useState({
        user: {
            name: '',
            email: '',
            image: null,
            role: ''
        }
    });

    useEffect(() => {
        document.title = 'Admin Dashboard | Lá Nhỏ Bên Thềm';
        
        // Lấy thông tin user từ localStorage
        try {
            const userData = localStorage.getItem('user');
            
            if (userData) {
                const parsedUser = JSON.parse(userData);
                
                const sessionData = {
                    user: {
                        name: parsedUser.user?.name || parsedUser.name || 'Admin User',
                        email: parsedUser.email || '',
                        image: parsedUser.user?.avatarUrl || parsedUser.avatarUrl || parsedUser.avatar || null,
                        role: parsedUser.role || 'ADMIN'
                    }
                };
                
                setSession(sessionData);
            } else {
                console.warn('⚠️ No user data found in localStorage');
            }
        } catch (error) {
            console.error('❌ Error parsing user data:', error);
        }
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        // Implement logout logic
        handleMenuClose();
        // Clear user data from localStorage
        localStorage.removeItem('user');
        // Clear cookies if any
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        // Navigate to home page
        navigate('/');
    };

    const handleProfileClick = () => {
        handleMenuClose();
        navigate('/admin/profile');
    };

    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    const drawer = (
        <Box sx={{ 
            height: '100%',
            background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
            color: 'white',
            overflow: 'hidden'
        }}>
            {/* Logo Section */}
            <Toolbar sx={{ 
                background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
                borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
                position: 'relative',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: `linear-gradient(90deg, transparent 0%, ${alpha('#ffffff', 0.3)} 50%, transparent 100%)`
                }
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha('#ffffff', 0.2)} 0%, ${alpha('#ffffff', 0.1)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0.5,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha('#ffffff', 0.2)}`
                    }}>
                        <img 
                            src="/LaNhoBenThemLogo.png" 
                            alt="Lá Nhỏ Bên Thềm Logo"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                borderRadius: '6px'
                            }}
                        />
                    </Box>
                    <Typography variant="h6" noWrap component="div" sx={{ 
                        fontWeight: 700,
                        background: `linear-gradient(135deg, #ffffff 0%, ${alpha('#ffffff', 0.8)} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Lá Nhỏ Bên Thềm
                    </Typography>
                </Box>
            </Toolbar>

            {/* Navigation */}
            <Box sx={{ p: 2, pt: 3 }}>
                <Typography variant="caption" sx={{ 
                    px: 2, 
                    opacity: 0.7, 
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: 'uppercase'
                }}>
                    {session.user.role || 'User'} Navigation
                </Typography>
                <List sx={{ mt: 1 }}>
                    {NAVIGATION.map((item, index) => (
                        <ListItem key={item.segment} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                selected={isActiveRoute(item.path)}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '4px',
                                        backgroundColor: colors.accent,
                                        transform: 'scaleY(0)',
                                        transition: 'transform 0.3s ease',
                                        transformOrigin: 'bottom'
                                    },
                                    '&.Mui-selected': {
                                        backgroundColor: alpha('#ffffff', 0.15),
                                        color: 'white',
                                        boxShadow: `0 4px 12px ${alpha('#000000', 0.2)}`,
                                        '&::before': {
                                            transform: 'scaleY(1)',
                                        },
                                        '&:hover': {
                                            backgroundColor: alpha('#ffffff', 0.2),
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: colors.accent,
                                        }
                                    },
                                    '&:hover': {
                                        backgroundColor: alpha('#ffffff', 0.1),
                                        transform: 'translateX(4px)',
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ 
                                    color: isActiveRoute(item.path) ? colors.accent : alpha('#ffffff', 0.8),
                                    minWidth: 40,
                                    transition: 'all 0.3s ease'
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.title}
                                    primaryTypographyProps={{
                                        fontWeight: isActiveRoute(item.path) ? 600 : 500,
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Bottom decoration */}
            <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '120px',
                background: `linear-gradient(180deg, transparent 0%, ${alpha('#000000', 0.1)} 100%)`,
                pointerEvents: 'none'
            }} />
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                    background: `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha(colors.surface, 0.9)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`,
                    color: colors.primary,
                }}
            >
                <Toolbar sx={{ px: 3 }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ 
                            mr: 2, 
                            display: { md: 'none' },
                            backgroundColor: alpha(colors.primary, 0.1),
                            '&:hover': {
                                backgroundColor: alpha(colors.primary, 0.2),
                            }
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    
                    <Typography variant="h6" noWrap component="div" sx={{ 
                        flexGrow: 1,
                        fontWeight: 600,
                        color: colors.primary
                    }}>
                        {location.pathname === '/admin/dashboard' ? 'Dashboard' : 
                         NAVIGATION.find(nav => nav.path === location.pathname)?.title || `${session.user.role || 'User'} Panel`}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                            color="inherit"
                            sx={{
                                backgroundColor: alpha(colors.primary, 0.1),
                                color: colors.primary,
                                '&:hover': {
                                    backgroundColor: alpha(colors.primary, 0.2),
                                    transform: 'scale(1.05)',
                                },
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Badge badgeContent={3} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        
                        <IconButton
                            onClick={handleMenuOpen}
                            size="small"
                            sx={{ 
                                ml: 1,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                }
                            }}
                            aria-controls={anchorEl ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={anchorEl ? 'true' : undefined}
                        >
                            <Avatar 
                                sx={{ 
                                    width: 36, 
                                    height: 36,
                                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                                    fontWeight: 600,
                                    boxShadow: `0 4px 12px ${alpha(colors.primary, 0.3)}`
                                }}
                                src={session.user.image}
                            >
                                {session.user.name.charAt(0)}
                            </Avatar>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Account Menu */}
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        elevation: 8,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 4px 16px rgba(11,63,49,0.15))',
                            mt: 1.5,
                            borderRadius: 3,
                            minWidth: 240,
                            border: `1px solid ${alpha(colors.primary, 0.1)}`,
                            background: `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha(colors.surface, 0.9)} 100%)`,
                            backdropFilter: 'blur(10px)',
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                                border: `1px solid ${alpha(colors.primary, 0.1)}`,
                                borderBottom: 'none',
                                borderRight: 'none',
                            },
                        },
                    },
                }}
            >
                <Box sx={{ 
                    px: 3, 
                    py: 2,
                    background: `linear-gradient(135deg, ${alpha(colors.primary, 0.05)} 0%, ${alpha(colors.surface, 0.8)} 100%)`,
                    borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Avatar 
                            sx={{ 
                                width: 40, 
                                height: 40,
                                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                            }}
                            src={session.user.image}
                        >
                            {session.user.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.primary }}>
                                {session.user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {session.user.email}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip 
                        size="small" 
                        label={session.user.role || 'User'} 
                        sx={{ 
                            backgroundColor: alpha(colors.primary, 0.1),
                            color: colors.primary,
                            fontWeight: 600,
                            fontSize: '0.75rem'
                        }} 
                    />
                </Box>
                <Box sx={{ py: 1 }}>
                    <MenuItem 
                        onClick={handleLogout}
                        sx={{
                            mx: 1,
                            borderRadius: 2,
                            color: colors.error,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: alpha(colors.error, 0.1),
                                transform: 'translateX(4px)',
                            }
                        }}
                    >
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" sx={{ color: colors.error }} />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Đăng xuất"
                            primaryTypographyProps={{ fontWeight: 500 }}
                        />
                    </MenuItem>
                </Box>
            </Menu>

            {/* Navigation Drawer */}
            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
                    }}
                >
                    {drawer}
                </Drawer>
                
                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    mt: '64px', // Height of AppBar
                    minHeight: 'calc(100vh - 64px)',
                    background: `linear-gradient(135deg, ${alpha(colors.surface, 0.3)} 0%, ${alpha(colors.surfaceVariant, 0.1)} 100%)`,
                    position: 'relative',
                    overflow: 'auto',
                    '&::before': {
                        content: '""',
                        position: 'fixed',
                        top: 0,
                        left: { md: DRAWER_WIDTH },
                        right: 0,
                        height: '100vh',
                        background: `radial-gradient(ellipse at top right, ${alpha(colors.primary, 0.05)} 0%, transparent 50%), radial-gradient(ellipse at bottom left, ${alpha(colors.secondary, 0.03)} 0%, transparent 50%)`,
                        zIndex: -1,
                        pointerEvents: 'none'
                    }
                }}
            >
                                 {/* Dashboard content or nested routes */}
                 {location.pathname === '/admin/dashboard' ? (
                     <AdminDashboardContent session={session} />
                 ) : (
                    <Box sx={{ p: 4 }}>
                        <Outlet />
                    </Box>
                )}
            </Box>
        </Box>
    );
}