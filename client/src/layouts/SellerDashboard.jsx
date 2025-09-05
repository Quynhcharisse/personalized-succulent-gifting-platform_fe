import React, { useState, useEffect } from 'react';
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
    Grid,
    Button,
    Chip,
    Card,
    CardContent,
    Badge,
    alpha,
    Stack
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    ShoppingCart as ShoppingCartIcon,
    Assessment as AssessmentIcon,
    Settings as SettingsIcon,
    AccountCircle as AccountCircleIcon,
    Logout as LogoutIcon,
    Notifications as NotificationsIcon,
    TrendingUp as TrendingUpIcon,
    Add as AddIcon,
    Visibility as VisibilityIcon,
    Store as StoreIcon,
    LocalShipping as LocalShippingIcon
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
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
};

// Navigation configuration for sellers
const NAVIGATION = [
    {
        segment: 'dashboard',
        title: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/seller/dashboard'
    },
    {
        segment: 'succulent',
        title: 'Quản lý Sen Đá',
        icon: <InventoryIcon />,
        path: '/seller/succulent'
    },
    {
        segment: 'receive-goods',
        title: 'Nhập Hàng',
        icon: <LocalShippingIcon />,
        path: '/seller/receive-goods'
    },
    {
        segment: 'products',
        title: 'Quản lý sản phẩm',
        icon: <InventoryIcon />,
        path: '/seller/products'
    },
    {
        segment: 'orders',
        title: 'Đơn hàng',
        icon: <ShoppingCartIcon />,
        path: '/seller/orders'
    },
    {
        segment: 'analytics',
        title: 'Báo cáo & Thống kê',
        icon: <AssessmentIcon />,
        path: '/seller/analytics'
    },
    {
        segment: 'store',
        title: 'Cửa hàng của tôi',
        icon: <StoreIcon />,
        path: '/seller/store'
    },
    {
        segment: 'settings',
        title: 'Cài đặt',
        icon: <SettingsIcon />,
        path: '/seller/settings'
    }
];

function SellerDashboardContent({ session }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        todayOrders: 18,
        revenueVnd: 8750000,
        totalProducts: 42,
        lowStock: 3
    });

    const [recentOrders] = useState([
        {
            id: 1,
            code: 'ORD001',
            customerName: 'Nguyễn Văn A',
            total: 250000,
            statusLabel: 'Mới',
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            code: 'ORD002',
            customerName: 'Trần Thị B',
            total: 150000,
            statusLabel: 'Đang xử lý',
            createdAt: new Date(Date.now() - 3600000).toISOString()
        }
    ]);

    function formatCurrencyVnd(value) {
        try {
            return new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(value || 0);
        } catch (_) {
            return `${value ?? 0} ₫`;
        }
    }

    const StatCard = ({ title, value, icon, color, trend, suffix }) => (
        <Card sx={{
            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
            color: 'white',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px ${alpha(color, 0.3)}`,
            },
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: `radial-gradient(circle, ${alpha('#ffffff', 0.1)} 0%, transparent 70%)`,
                transform: 'translate(30px, -30px)',
            }
        }}>
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box sx={{
                        backgroundColor: alpha('#ffffff', 0.2),
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {icon}
                    </Box>
                    {trend && (
                        <Chip 
                            size="small" 
                            label={trend} 
                            sx={{ 
                                backgroundColor: alpha('#ffffff', 0.2),
                                color: 'white',
                                fontWeight: 600
                            }} 
                        />
                    )}
                </Stack>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontSize: '0.875rem' }}>
                    {title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
                        {value}
                    </Typography>
                    {suffix && (
                        <Chip 
                            size="small"
                            label={suffix}
                            sx={{
                                backgroundColor: alpha('#ffffff', 0.2),
                                color: 'white',
                                fontSize: '0.75rem'
                            }}
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );

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
                    Tổng quan hiệu suất cửa hàng của bạn hôm nay
                    </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Đơn hàng hôm nay"
                        value={stats.todayOrders}
                        icon={<ShoppingCartIcon sx={{ fontSize: 28 }} />}
                        color={colors.primary}
                        trend="+15%"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Doanh thu hôm nay"
                        value={formatCurrencyVnd(stats.revenueVnd)}
                        icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
                        color={colors.success}
                        trend="+12%"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Sản phẩm đang bán"
                        value={stats.totalProducts}
                        icon={<InventoryIcon sx={{ fontSize: 28 }} />}
                        color={colors.info}
                        trend="+3"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Sắp hết hàng"
                        value={stats.lowStock}
                        icon={<LocalShippingIcon sx={{ fontSize: 28 }} />}
                        color={stats.lowStock > 0 ? colors.warning : colors.success}
                        suffix={stats.lowStock > 0 ? 'Kiểm tra' : 'Ổn định'}
                    />
                </Grid>
                </Grid>

            {/* Main Content Grid */}
            <Grid container spacing={3}>
                {/* Quick Actions */}
                <Grid item xs={12} lg={8}>
                    <Card sx={{
                        borderRadius: 4,
                        border: `1px solid ${alpha(colors.primary, 0.1)}`,
                        background: `linear-gradient(135deg, ${colors.surface} 0%, ${alpha(colors.surfaceVariant, 0.5)} 100%)`,
                        boxShadow: `0 4px 20px ${alpha(colors.primary, 0.1)}`,
                        mb: 3
                    }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h5" sx={{ 
                                fontWeight: 700, 
                                mb: 3,
                                color: colors.primary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Box sx={{
                                    width: 6,
                                    height: 24,
                                    backgroundColor: colors.primary,
                                    borderRadius: 1
                                }} />
                                Tác vụ nhanh
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate('/seller/succulent')}
                                    sx={{
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.5,
                                        backgroundColor: colors.primary,
                                        '&:hover': { backgroundColor: colors.primaryDark }
                                    }}
                                >
                                    Tạo sản phẩm sen đá
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => navigate('/seller/orders')}
                                    sx={{
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.5,
                                        borderColor: colors.primary,
                                        color: colors.primary,
                                        '&:hover': { borderColor: colors.primaryDark }
                                    }}
                                >
                                    Xem đơn hàng
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<InventoryIcon />}
                                    onClick={() => navigate('/seller/succulent')}
                                    sx={{
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.5,
                                        borderColor: colors.primary,
                                        color: colors.primary,
                                        '&:hover': { borderColor: colors.primaryDark }
                                    }}
                                >
                                    Quản lý sen đá
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Orders */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{
                        borderRadius: 4,
                        border: `1px solid ${alpha(colors.primary, 0.1)}`,
                        background: `linear-gradient(135deg, ${colors.surface} 0%, ${alpha(colors.surfaceVariant, 0.5)} 100%)`,
                        boxShadow: `0 4px 20px ${alpha(colors.primary, 0.1)}`,
                        height: 'fit-content'
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>
                                    Đơn gần đây
                                </Typography>
                                <Button 
                                    size="small" 
                                    sx={{ color: colors.primary }}
                                    onClick={() => navigate('/seller/orders')}
                                >
                                    Xem tất cả
                                </Button>
                        </Box>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Stack spacing={2}>
                                {recentOrders.map(order => (
                                    <Box key={order.id} sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: alpha(colors.primary, 0.05),
                                        border: `1px solid ${alpha(colors.primary, 0.1)}`,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: alpha(colors.primary, 0.1),
                                            transform: 'translateX(4px)'
                                        }
                                    }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors.primary }}>
                                                #{order.code}
                                            </Typography>
                                            <Chip 
                                                size="small" 
                                                label={order.statusLabel} 
                                                sx={{ 
                                                    backgroundColor: order.statusLabel === 'Mới' ? colors.success : colors.warning,
                                                    color: 'white',
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                            {order.customerName}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>
                                            {formatCurrencyVnd(order.total)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default function SellerDashboard() {
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
            avatar: '',
            role: ''
        }
    });

    useEffect(() => {
        document.title = 'Kênh người bán | Lá Nhỏ Bên Thềm';
        
        // Lấy thông tin user từ localStorage
        try {
            const userData = localStorage.getItem('user');
            
            if (userData) {
                const parsedUser = JSON.parse(userData);
                
                const sessionData = {
                    user: {
                        name: parsedUser.user?.name || parsedUser.name || 'User',
                        email: parsedUser.email || '',
                        image: parsedUser.user?.avatarUrl || parsedUser.avatarUrl || parsedUser.avatar || null,
                        role: parsedUser.role || ''
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
        navigate('/seller/profile');
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
                    Kênh {session.user.role?.toLowerCase() || 'người dùng'}
                </Typography>
                <List sx={{ mt: 1 }}>
                    {NAVIGATION.map((item) => (
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
                        {location.pathname === '/seller/dashboard' ? 'Dashboard' : 
                         NAVIGATION.find(nav => nav.path === location.pathname)?.title || `Kênh ${session.user.role?.toLowerCase() || 'người dùng'}`}
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
                            <Badge badgeContent={5} color="error">
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
                        onClick={handleProfileClick}
                        sx={{
                            mx: 1,
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: alpha(colors.primary, 0.1),
                                transform: 'translateX(4px)',
                            }
                        }}
                    >
                        <ListItemIcon>
                            <AccountCircleIcon fontSize="small" sx={{ color: colors.primary }} />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Hồ sơ cá nhân"
                        />
                    </MenuItem>
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
                        keepMounted: true,
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
                    mt: '64px',
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
                 {location.pathname === '/seller/dashboard' ? (
                     <SellerDashboardContent session={session} />
                 ) : (
                    <Box sx={{ p: 4 }}>
                        <Outlet />
                    </Box>
                )}
            </Box>
        </Box>
    );
}
