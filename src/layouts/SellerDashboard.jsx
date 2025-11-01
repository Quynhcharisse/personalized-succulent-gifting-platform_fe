import React, {useEffect, useState} from 'react';
import {
    alpha,
    AppBar,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    AccountCircle as AccountCircleIcon,
    Add as AddIcon,
    Assessment as AssessmentIcon,
    Build as BuildIcon,
    Dashboard as DashboardIcon,
    Extension as AccessoryIcon,
    Inventory as InventoryIcon,
    LocalShipping as LocalShippingIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    ShoppingCart as ShoppingCartIcon,
    TrendingUp as TrendingUpIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {NotificationDisplay} from '../services/NotificationService.jsx';
import {COLORS} from '../components/constants.js';

const DRAWER_WIDTH = 280;

// Navigation configuration for sellers
const NAVIGATION = [
    {
        segment: 'dashboard',
        title: 'Dashboard',
        icon: <DashboardIcon/>,
        path: '/seller/dashboard'
    },
    {
        segment: 'succulent',
        title: 'Quản lý Sen Đá',
        icon: <InventoryIcon/>,
        path: '/seller/succulent'
    },
    {
        segment: 'accessory',
        title: 'Quản lý phụ kiện',
        icon: <AccessoryIcon/>,
        path: '/seller/accessory'
    },
    {
        segment: 'products',
        title: 'Quản lý sản phẩm',
        icon: <InventoryIcon/>,
        path: '/seller/products'
    },  
    {
        segment: 'custom-request',
        title: 'Quản lý yêu cầu tùy chỉnh',
        icon: <BuildIcon/>,
        path: '/seller/custom-request'
    },
    {
        segment: 'posts',
        title: 'Bài viết',
        icon: <AssessmentIcon/>,
        path: '/seller/posts'
    },
    {
        segment: 'orders',
        title: 'Đơn hàng',
        icon: <ShoppingCartIcon/>,
        path: '/seller/orders'
    },
    {
        segment: 'analytics',
        title: 'Báo cáo & Thống kê',
        icon: <AssessmentIcon/>,
        path: '/seller/analytics'
    },
    {
        segment: 'profile',
        title: 'Hồ Sơ Của Tôi',
        icon: <AccountCircleIcon/>,
        path: '/seller/profile'
    }
];

function SellerDashboardContent({session}) {
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

    const StatCard = ({title, value, icon, color, trend, suffix}) => (
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
            <CardContent sx={{p: 3, position: 'relative', zIndex: 1}}>
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
                <Typography variant="body2" sx={{opacity: 0.9, mb: 1, fontSize: '0.875rem'}}>
                    {title}
                </Typography>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Typography variant="h4" sx={{fontWeight: 700, lineHeight: 1}}>
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
        <Box sx={{px: 4, py: 5}}>
            {/* Header */}
            <Box sx={{mb: 5}}>
                <Typography variant="h3" sx={{
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                }}>
                    {session.user.role || 'User'} Dashboard
                </Typography>
                <Typography variant="body1" sx={{color: 'text.secondary', fontSize: '1.1rem'}}>
                    Tổng quan hiệu suất cửa hàng của bạn hôm nay
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                mb: 4
            }}>
                <Box sx={{flex: {xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', lg: '1 1 calc(25% - 18px)'}, minWidth: 0}}>
                    <StatCard
                        title="Đơn hàng hôm nay"
                        value={stats.todayOrders}
                        icon={<ShoppingCartIcon sx={{fontSize: 28}}/>}
                        color={COLORS.primary}
                        trend="+15%"
                    />
                </Box>
                <Box sx={{flex: {xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', lg: '1 1 calc(25% - 18px)'}, minWidth: 0}}>
                    <StatCard
                        title="Doanh thu hôm nay"
                        value={formatCurrencyVnd(stats.revenueVnd)}
                        icon={<TrendingUpIcon sx={{fontSize: 28}}/>}
                        color={COLORS.success}
                        trend="+12%"
                    />
                </Box>
                <Box sx={{flex: {xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', lg: '1 1 calc(25% - 18px)'}, minWidth: 0}}>
                    <StatCard
                        title="Sản phẩm đang bán"
                        value={stats.totalProducts}
                        icon={<InventoryIcon sx={{fontSize: 28}}/>}
                        color={COLORS.info}
                        trend="+3"
                    />
                </Box>
                <Box sx={{flex: {xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', lg: '1 1 calc(25% - 18px)'}, minWidth: 0}}>
                    <StatCard
                        title="Sắp hết hàng"
                        value={stats.lowStock}
                        icon={<LocalShippingIcon sx={{fontSize: 28}}/>}
                        color={stats.lowStock > 0 ? COLORS.warning : COLORS.success}
                        suffix={stats.lowStock > 0 ? 'Kiểm tra' : 'Ổn định'}
                    />
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3
            }}>
                {/* Quick Actions */}
                <Box sx={{flex: {xs: '1 1 100%', lg: '1 1 calc(66.666% - 12px)'}, minWidth: 0}}>
                    <Card sx={{
                        borderRadius: 4,
                        border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
                        background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${alpha(COLORS.surfaceVariant, 0.5)} 100%)`,
                        boxShadow: `0 4px 20px ${alpha(COLORS.primary, 0.1)}`,
                        mb: 3
                    }}>
                        <CardContent sx={{p: 4}}>
                            <Typography variant="h5" sx={{
                                fontWeight: 700,
                                mb: 3,
                                color: COLORS.primary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Box sx={{
                                    width: 6,
                                    height: 24,
                                    backgroundColor: COLORS.primary,
                                    borderRadius: 1
                                }}/>
                                Tác vụ nhanh
                            </Typography>
                            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} flexWrap="wrap">
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon/>}
                                    onClick={() => navigate('/seller/succulent')}
                                    sx={{
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.5,
                                        backgroundColor: COLORS.primary,
                                        '&:hover': {backgroundColor: COLORS.primaryDark}
                                    }}
                                >
                                    Tạo sản phẩm sen đá
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon/>}
                                    onClick={() => navigate('/seller/accessory')}
                                    sx={{
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.5,
                                        backgroundColor: COLORS.primaryLight
                                    }}
                                >
                                    Tạo phụ kiện
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<VisibilityIcon/>}
                                    onClick={() => navigate('/seller/orders')}
                                    sx={{
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.5,
                                        borderColor: COLORS.primaryDark,
                                        color: COLORS.primaryDark
                                    }}
                                >
                                    Xem đơn hàng
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<InventoryIcon/>}
                                    onClick={() => navigate('/seller/succulent')}
                                    sx={{
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.5,
                                        borderColor: COLORS.primary,
                                        color: COLORS.primary
                                    }}
                                >
                                    Quản lý sen đá
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>

                {/* Recent Orders */}
                <Box sx={{flex: {xs: '1 1 100%', lg: '1 1 calc(33.333% - 12px)'}, minWidth: 0}}>
                    <Card sx={{
                        borderRadius: 4,
                        border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
                        background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${alpha(COLORS.surfaceVariant, 0.5)} 100%)`,
                        boxShadow: `0 4px 20px ${alpha(COLORS.primary, 0.1)}`,
                        height: 'fit-content'
                    }}>
                        <CardContent sx={{p: 3}}>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3}}>
                                <Typography variant="h6" sx={{fontWeight: 700, color: COLORS.primary}}>
                                    Đơn gần đây
                                </Typography>
                                <Button
                                    size="small"
                                    sx={{color: COLORS.primary}}
                                    onClick={() => navigate('/seller/orders')}
                                >
                                    Xem tất cả
                                </Button>
                            </Box>
                            <Divider sx={{mb: 2}}/>

                            <Stack spacing={2}>
                                {recentOrders.map(order => (
                                    <Box key={order.id} sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: alpha(COLORS.primary, 0.05),
                                        border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            mb: 1
                                        }}>
                                            <Typography variant="subtitle2"
                                                        sx={{fontWeight: 600, color: COLORS.primary}}>
                                                #{order.code}
                                            </Typography>
                                            <Chip
                                                size="small"
                                                label={order.statusLabel}
                                                sx={{
                                                    backgroundColor: order.statusLabel === 'Mới' ? COLORS.success : COLORS.warning,
                                                    color: 'white',
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="body2" sx={{color: 'text.secondary', mb: 1}}>
                                            {order.customerName}
                                        </Typography>
                                        <Typography variant="body2" sx={{fontWeight: 600, color: COLORS.primary}}>
                                            {formatCurrencyVnd(order.total)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
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
    const [avatarError, setAvatarError] = useState(false);
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
        document.cookie.split(";").forEach(function (c) {
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
            background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
            color: 'white',
            overflow: 'hidden'
        }}>
            {/* Logo Section */}
            <Toolbar sx={{
                background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`,
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
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
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
            <Box sx={{p: 2, pt: 3}}>
                <Typography variant="caption" sx={{
                    px: 2,
                    opacity: 0.7,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: 'uppercase'
                }}>
                    Kênh {session.user.role?.toLowerCase() || 'người dùng'}
                </Typography>
                <List sx={{mt: 1}}>
                    {NAVIGATION.map((item) => (
                        <ListItem key={item.segment} disablePadding sx={{mb: 0.5}}>
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
                                        backgroundColor: COLORS.accent,
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
                                        '& .MuiListItemIcon-root': {
                                            color: COLORS.accent,
                                        }
                                    }
                                }}
                            >
                                <ListItemIcon sx={{
                                    color: isActiveRoute(item.path) ? COLORS.accent : alpha('#ffffff', 0.8),
                                    minWidth: 40,
                                    transition: 'all 0.3s ease'
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.title}
                                    slotProps={{
                                        primary: {
                                            sx: {
                                                fontWeight: isActiveRoute(item.path) ? 600 : 500,
                                                fontSize: '0.9rem'
                                            }
                                        }
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
            }}/>
        </Box>
    );

    return (
        <Box sx={{display: 'flex'}}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: {md: `calc(100% - ${DRAWER_WIDTH}px)`},
                    ml: {md: `${DRAWER_WIDTH}px`},
                    background: `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha(COLORS.surface, 0.9)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    borderBottom: `1px solid ${alpha(COLORS.primary, 0.1)}`,
                    color: COLORS.primary,
                }}
            >
                <Toolbar sx={{px: 3}}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 2,
                            display: {md: 'none'},
                            backgroundColor: alpha(COLORS.primary, 0.1)
                        }}
                    >
                        <MenuIcon/>
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{
                        flexGrow: 1,
                        fontWeight: 600,
                        color: COLORS.primary
                    }}>
                        {location.pathname === '/seller/dashboard' ? 'Dashboard' :
                            NAVIGATION.find(nav => nav.path === location.pathname)?.title || `Kênh ${session.user.role?.toLowerCase() || 'người dùng'}`}
                    </Typography>

                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <IconButton
                            color="inherit"
                            sx={{
                                backgroundColor: alpha(COLORS.primary, 0.1),
                                color: COLORS.primary,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <NotificationDisplay/>
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
                                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                                    fontWeight: 600,
                                    boxShadow: `0 4px 12px ${alpha(COLORS.primary, 0.3)}`
                                }}
                                src={session.user.image && !avatarError ? session.user.image : null}
                                imgProps={{
                                    onError: () => setAvatarError(true)
                                }}
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
                transformOrigin={{horizontal: 'right', vertical: 'top'}}
                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                slotProps={{
                    paper: {
                        elevation: 8,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 4px 16px rgba(11,63,49,0.15))',
                            mt: 1.5,
                            borderRadius: 3,
                            minWidth: 240,
                            border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
                            background: `linear-gradient(135deg, ${alpha(COLORS.surface, 0.95)} 0%, ${alpha(COLORS.surface, 0.9)} 100%)`,
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
                                border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
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
                    background: `linear-gradient(135deg, ${alpha(COLORS.primary, 0.05)} 0%, ${alpha(COLORS.surface, 0.8)} 100%)`,
                    borderBottom: `1px solid ${alpha(COLORS.primary, 0.1)}`
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                            }}
                            src={session.user.image && !avatarError ? session.user.image : null}
                            imgProps={{
                                onError: () => setAvatarError(true)
                            }}
                        >
                            {session.user.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" sx={{fontWeight: 600, color: COLORS.primary}}>
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
                            backgroundColor: alpha(COLORS.primary, 0.1),
                            color: COLORS.primary,
                            fontWeight: 600,
                            fontSize: '0.75rem'
                        }}
                    />
                </Box>
                <Box sx={{py: 1}}>
                    <MenuItem
                        onClick={handleProfileClick}
                        sx={{
                            mx: 1,
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: alpha(COLORS.primary, 0.1),
                                transform: 'translateX(4px)',
                            }
                        }}
                    >
                        <ListItemIcon>
                            <AccountCircleIcon fontSize="small" sx={{color: COLORS.primary}}/>
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
                            color: COLORS.error,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: alpha(COLORS.error, 0.1),
                                transform: 'translateX(4px)',
                            }
                        }}
                    >
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" sx={{color: COLORS.error}}/>
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
                sx={{width: {md: DRAWER_WIDTH}, flexShrink: {md: 0}}}
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
                        display: {xs: 'block', md: 'none'},
                        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: DRAWER_WIDTH},
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: {xs: 'none', md: 'block'},
                        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: DRAWER_WIDTH},
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
                    width: {md: `calc(100% - ${DRAWER_WIDTH}px)`},
                    mt: '64px',
                    minHeight: 'calc(100vh - 64px)',
                    background: `linear-gradient(135deg, ${alpha(COLORS.surface, 0.3)} 0%, ${alpha(COLORS.surfaceVariant, 0.1)} 100%)`,
                    position: 'relative',
                    overflow: 'auto',
                    '&::before': {
                        content: '""',
                        position: 'fixed',
                        top: 0,
                        left: {md: DRAWER_WIDTH},
                        right: 0,
                        height: '100vh',
                        background: `radial-gradient(ellipse at top right, ${alpha(COLORS.primary, 0.05)} 0%, transparent 50%), radial-gradient(ellipse at bottom left, ${alpha(COLORS.secondary, 0.03)} 0%, transparent 50%)`,
                        zIndex: -1,
                        pointerEvents: 'none'
                    }
                }}
            >
                {location.pathname === '/seller/dashboard' ? (
                    <SellerDashboardContent session={session}/>
                ) : (
                    <Box sx={{p: 4}}>
                        <Outlet/>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
