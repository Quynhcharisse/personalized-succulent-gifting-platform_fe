import React, {useEffect, useState} from 'react'
import '../styles/ui/SiteHeader.css'
import {Link, NavLink, useLocation, useNavigate} from 'react-router-dom'
import {Avatar, Badge, Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Typography} from '@mui/material'
import {
    AccountCircle as AccountCircleIcon,
    Build as BuildIcon,
    Dashboard as DashboardIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Home as HomeIcon,
    LocalGroceryStore as LocalGroceryStoreIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Receipt as ReceiptIcon,
    Storefront as StorefrontIcon
} from '@mui/icons-material'
import {enqueueSnackbar} from 'notistack'
import {signOut} from '../services/AccountService.jsx'
import {NotificationDisplay} from '../services/NotificationService.jsx';

import {getAccessToken} from '../utils/CookieUtil.jsx';
import {jwtDecode} from 'jwt-decode';

import {useDispatch, useSelector} from 'react-redux';
import {reloadFromStorage} from '../store/slices/cartSlice';


export default function SiteHeader() {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    const menuOpen = Boolean(anchorEl)
    const cartCount = useSelector(state => state?.cart?.items?.length || 0)

    useEffect(() => {
        const raw = sessionStorage.getItem('user')

        if (!raw || raw === 'undefined') {
            setCurrentUser(null)
            return
        }

        try {
            const parsed = JSON.parse(raw)
            setCurrentUser(parsed || null)
        } catch (error) {
            setCurrentUser(null)
            sessionStorage.removeItem('user') // Xóa dữ liệu không hợp lệ
        }
    }, [location.pathname])

    useEffect(() => {
        // Reload cart when user context changes (per-account cart storage)
        dispatch(reloadFromStorage())
    }, [currentUser, dispatch])

    const [role, setRole] = useState(null);

    useEffect(() => {
        // Strategy: Dùng localStorage với verification định kỳ
        if (!currentUser) {
            setRole(null)
            return
        }

        const localRole = (currentUser?.role || null)
        const lastVerified = sessionStorage.getItem('role_verified_at')
        const now = Date.now()
        const FIVE_MINUTES = 5 * 60 * 1000

        const verifyRole = async () => {
            try {
                const access = await getAccessToken()
                if (access) {
                    const decoded = jwtDecode(access)
                    const jwtRole = (decoded?.role || null)

                    if (localRole !== jwtRole) {
                        setRole(jwtRole ? jwtRole.toUpperCase() : null)
                        sessionStorage.setItem('role_verified_at', now.toString())
                    } else {
                        setRole(localRole ? localRole.toUpperCase() : null)
                        sessionStorage.setItem('role_verified_at', now.toString())
                    }
                } else {
                    setRole(localRole ? localRole.toUpperCase() : null)
                }
            } catch (error) {
                setRole(localRole ? localRole.toUpperCase() : null)
            }
        }

        if (!lastVerified || (now - parseInt(lastVerified)) > FIVE_MINUTES) {
            verifyRole()
        } else {
            setRole(localRole ? localRole.toUpperCase() : null)
        }
    }, [currentUser, location.pathname])

    const displayName = currentUser?.name || currentUser?.fullName || currentUser?.displayName || 'Tài khoản'
    const avatarUrl = currentUser?.avatar || currentUser?.avatarUrl || currentUser?.photoURL || currentUser?.picture || ''

    const handleOpenMenu = (event) => setAnchorEl(event.currentTarget)
    const handleCloseMenu = () => setAnchorEl(null)

    const handleLogout = async () => {
        try {
            await signOut()
            // Remove only current user's cart and user info
            try {
                const rawUser = sessionStorage.getItem('user')
                if (rawUser) {
                    const parsed = JSON.parse(rawUser)
                    const userIdentifier = parsed?.id || parsed?.userId || parsed?.email || 'guest'
                    const cartKey = `psgp_cart_v1_${userIdentifier}`
                    sessionStorage.removeItem(cartKey)
                }
            } catch {
            }
            sessionStorage.removeItem('user')
            enqueueSnackbar('Đã đăng xuất', {variant: 'success'})
            handleCloseMenu()
            navigate('/', {replace: true})
            setTimeout(() => window.location.reload(), 300)
        } catch (error) {
            enqueueSnackbar('Không thể đăng xuất. Vui lòng thử lại', {variant: 'error'})
        }
    }

    return (
        <div className="site-header" id="siteHeader">
            <div className="container header__row">
                <Link className="brand" to="/">
          <span className="brand__logo" aria-hidden>
            <img src="/senda.png" alt="Lá Nhỏ Bên Thềm"/>
          </span>
                    <span className="brand__name">Lá Nhỏ Bên Thềm</span>
                </Link>
                <nav className="main-nav" aria-label="Điều hướng chính">
                    <NavLink to="/" end> Trang chủ </NavLink>
                    <NavLink to="/huong-dan-mua-hang"> Hướng dẫn mua hàng </NavLink>
                    <NavLink to="/cham-soc"> Chăm sóc </NavLink>
                    <NavLink to="/posts"> Bài đăng </NavLink>
                    {(!currentUser || role === 'BUYER') && (
                        <NavLink to="/custom-request"> Điện Cây </NavLink>
                    )}
                </nav>
                <div className="header__actions">
                    <div className="header__icons" style={{display: 'flex', alignItems: 'center', gap: 16}}>
                        <Link 
                            className="header__icon" 
                            title="Yêu thích" 
                            to="#"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <FavoriteBorderIcon
                                sx={{
                                    width: 24,
                                    height: 24,
                                    color: '#0D3B2E',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                        transform: 'scale(1.1)'
                                    }
                                }}
                            />
                        </Link>
                        <Link 
                            className="header__icon" 
                            title="Giỏ hàng" 
                            to="/buyer/checkout"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Badge 
                                badgeContent={cartCount} 
                                color="error" 
                                overlap="circular" 
                                invisible={!cartCount}
                                sx={{
                                    '& .MuiBadge-badge': {
                                        fontSize: '0.7rem',
                                        height: 18,
                                        minWidth: 18,
                                        fontWeight: 600
                                    }
                                }}
                            >
                                <LocalGroceryStoreIcon
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        color: '#0D3B2E',
                                        transition: 'transform 0.2s ease',
                                        '&:hover': {
                                            transform: 'scale(1.1)'
                                        }
                                    }}
                                />
                            </Badge>
                        </Link>
                        {!currentUser ? (
                            <Link
                                to="/login"
                                className="header__icon"
                                title="Đăng nhập"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: 'transparent'
                                }}
                            >
                                <PersonIcon
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        color: '#0D3B2E',
                                        transition: 'transform 0.2s ease',
                                        '&:hover': {
                                            transform: 'scale(1.1)'
                                        }
                                    }}
                                />
                            </Link>
                        ) : (
                            // Khi đã đăng nhập, hiển thị avatar và menu
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <IconButton
                                    className="header__icon"
                                    onClick={handleOpenMenu}
                                    title={displayName}
                                    sx={{p: 0}}
                                >
                                    {avatarUrl ? (
                                        <Avatar
                                            src={avatarUrl}
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: '50%',
                                                border: '1px solid #e0e0e0',
                                                backgroundColor: '#fff'
                                            }}
                                        />
                                    ) : (
                                        <AccountCircleIcon
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                color: '#666',
                                                backgroundColor: '#f5f5f5',
                                                borderRadius: '50%',
                                                border: '1px solid rgba(0, 0, 0, 0.12)'
                                            }}
                                        />
                                    )}
                                </IconButton>

                                <Menu
                                    anchorEl={anchorEl}
                                    id="account-menu"
                                    open={menuOpen}
                                    onClose={handleCloseMenu}
                                    onClick={handleCloseMenu}
                                    slotProps={{paper: {elevation: 3, sx: {mt: 1.5, minWidth: 220}}}}
                                    transformOrigin={{horizontal: 'right', vertical: 'top'}}
                                    anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                                >
                                    <Box sx={{px: 2, pt: 1, pb: 1}}>
                                        <Typography variant="subtitle2"
                                                    sx={{fontWeight: 700}}>{displayName}</Typography>
                                        <Typography variant="caption" className="muted">
                                            {currentUser?.email || 'Đã đăng nhập'}
                                        </Typography>
                                    </Box>
                                    <Divider/>
                                    <MenuItem onClick={() => {
                                        if (role === 'BUYER') {
                                            navigate('/buyer/profile')
                                        } else if (role === 'SELLER') {
                                            navigate('/seller/profile')
                                        } else if (role === 'ADMIN') {
                                            navigate('/admin/profile')
                                        } else {
                                            navigate('/profile')
                                        }
                                    }}>
                                        <ListItemIcon><PersonIcon fontSize="small"/></ListItemIcon>
                                        Hồ sơ của tôi
                                    </MenuItem>
                                    {role === 'BUYER' && [
                                        (
                                            <MenuItem key="buyer-home" onClick={() => navigate('/')}>
                                                <ListItemIcon><HomeIcon fontSize="small"/></ListItemIcon>
                                                Trang sản phẩm
                                            </MenuItem>
                                        ),
                                        (
                                            <MenuItem key="buyer-custom" onClick={() => navigate('/custom-request')}>
                                                <ListItemIcon><BuildIcon fontSize="small"/></ListItemIcon>
                                                Yêu cầu tùy chỉnh
                                            </MenuItem>
                                        ),
                                        (
                                            <MenuItem key="buyer-order" onClick={() => navigate('/buyer/orders')}>
                                                <ListItemIcon><ReceiptIcon fontSize="small"/></ListItemIcon>
                                                Đơn hàng
                                            </MenuItem>
                                        )
                                    ]}
                                    {role === 'ADMIN' && (
                                        <MenuItem onClick={() => navigate('/admin/dashboard')}>
                                            <ListItemIcon><DashboardIcon fontSize="small"/></ListItemIcon>
                                            Admin Dashboard
                                        </MenuItem>
                                    )}
                                    {role === 'SELLER' && (
                                        <MenuItem onClick={() => navigate('/seller/dashboard')}>
                                            <ListItemIcon><StorefrontIcon fontSize="small"/></ListItemIcon>
                                            Kênh người bán
                                        </MenuItem>
                                    )}

                                    <MenuItem onClick={handleLogout}>
                                        <ListItemIcon>
                                            <LogoutIcon fontSize="small"/>
                                        </ListItemIcon>
                                        Đăng xuất
                                    </MenuItem>
                                </Menu>
                            </Box>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}


