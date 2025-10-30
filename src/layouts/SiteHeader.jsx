import React, {useEffect, useMemo, useState} from 'react'
import '../styles/ui/SiteHeader.css'
import {Link, NavLink, useLocation, useNavigate} from 'react-router-dom'
import {Avatar, Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Typography} from '@mui/material'
import {
    AccountCircle as AccountCircleIcon,
    Dashboard as DashboardIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Home as HomeIcon,
    LocalGroceryStore as LocalGroceryStoreIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Storefront as StorefrontIcon
} from '@mui/icons-material'
import {enqueueSnackbar} from 'notistack'
import {signOut} from '../services/AccountService.jsx'
import {NotificationDisplay} from '../services/NotificationService.jsx';
import {getAccessToken} from '../utils/CookieUtil.jsx';
import {jwtDecode} from 'jwt-decode';

export default function SiteHeader() {
    const navigate = useNavigate()
    const location = useLocation()
    const [anchorEl, setAnchorEl] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    const menuOpen = Boolean(anchorEl)

    useEffect(() => {
        const raw = localStorage.getItem('user')

        if (!raw || raw === 'undefined') {
            setCurrentUser(null)
            return
        }

        try {
            const parsed = JSON.parse(raw)
            setCurrentUser(parsed || null)
        } catch (error) {
            setCurrentUser(null)
            localStorage.removeItem('user') // Xóa dữ liệu không hợp lệ
        }
    }, [location.pathname])

    const [role, setRole] = useState(null);
    
    useEffect(() => {
        // Strategy: Dùng localStorage với verification định kỳ
        if (!currentUser) {
            setRole(null)
            return
        }
        
        // Lấy role từ localStorage (performance)
        const localRole = currentUser?.role || null
        
        // Verify với JWT ngay lần đầu, sau đó cache trong 5 phút
        const lastVerified = sessionStorage.getItem('role_verified_at')
        const now = Date.now()
        const FIVE_MINUTES = 5 * 60 * 1000
        
        const verifyRole = async () => {
            try {
                const access = await getAccessToken()
                if (access) {
                    const decoded = jwtDecode(access)
                    const jwtRole = decoded?.role || null
                    
                    if (localRole !== jwtRole) {
                        // Role bị fake, dùng JWT role
                        setRole(jwtRole)
                        sessionStorage.setItem('role_verified_at', now.toString())
                    } else {
                        setRole(localRole)
                        sessionStorage.setItem('role_verified_at', now.toString())
                    }
                } else {
                    setRole(localRole)
                }
            } catch (error) {
                setRole(localRole)
            }
        }
        
        // Verify lần đầu hoặc sau 5 phút
        if (!lastVerified || (now - parseInt(lastVerified)) > FIVE_MINUTES) {
            verifyRole()
        } else {
            setRole(localRole)
        }
    }, [currentUser, location.pathname])

    const displayName = currentUser?.name || currentUser?.fullName || currentUser?.displayName || 'Tài khoản'
    const avatarUrl = currentUser?.avatar || currentUser?.avatarUrl || currentUser?.photoURL || currentUser?.picture || ''

    const handleOpenMenu = (event) => setAnchorEl(event.currentTarget)
    const handleCloseMenu = () => setAnchorEl(null)

    const handleLogout = async () => {
        try {
            await signOut()
            localStorage.clear()
            enqueueSnackbar('Đã đăng xuất', {variant: 'success'})
            handleCloseMenu()
            navigate('/', {replace: true})
            // Reload to refresh header state derived from storage/cookies
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
                </Link>
                <nav className="main-nav" aria-label="Điều hướng chính">
                    <NavLink to="/" end> Sản phẩm </NavLink>
                    <NavLink to="/huong-dan-mua-hang"> Hướng dẫn mua hàng </NavLink>
                    <NavLink to="/cham-soc"> Chăm sóc </NavLink>
                    <NavLink to="/buyer/posts"> Bài đăng </NavLink>
                    <NavLink to="/custom-request"> Điện Cây </NavLink>
                </nav>
                <div className="header__actions">
                    <div className="searchbar">
                        <input
                            className="searchbar__input"
                            placeholder="Tìm sen đá, phụ kiện..."
                            aria-label="Tìm kiếm sen đá, phụ kiện"
                        />
                    </div>
                    <div className="header__icons" style={{display: 'flex', alignItems: 'center', gap: 12}}>
                        <Link className="header__icon" title="Yêu thích" to="#">
                            <FavoriteBorderIcon
                                sx={{
                                    width: 22,
                                    height: 22,
                                    color: '#0D3B2E'
                                }}
                            />
                        </Link>
                        <Link className="header__icon" title="Giỏ hàng" to="#">
                            <LocalGroceryStoreIcon
                                sx={{
                                    width: 22,
                                    height: 22,
                                    color: '#0D3B2E'
                                }}
                            />
                        </Link>
                        <Link className="header__icon" title="Thông báo" to="#">
                            <NotificationDisplay/>
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
                                    width: 44,
                                    height: 44,
                                    borderRadius: '50%',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                            >
                                <PersonIcon
                                    sx={{
                                        width: 22,
                                        height: 22,
                                        color: '#0D3B2E'
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
                                    {role === 'BUYER' && (
                                        <MenuItem onClick={() => navigate('/')}>
                                            <ListItemIcon><HomeIcon fontSize="small"/></ListItemIcon>
                                            Trang sản phẩm
                                        </MenuItem>
                                    )}
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


