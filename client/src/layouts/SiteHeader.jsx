import '../styles/ui/SiteHeader.css'
import {Link, NavLink, useLocation, useNavigate} from 'react-router-dom'
import {useEffect, useMemo, useState} from 'react'
import {Avatar, Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Typography} from '@mui/material'
import {
    Dashboard as DashboardIcon,
    Home as HomeIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Storefront as StorefrontIcon
} from '@mui/icons-material'
import {enqueueSnackbar} from 'notistack'
import {getCookie} from '../utils/CookieUtil.jsx'
import {jwtDecode} from 'jwt-decode'
import {signOut} from '../services/AccountService.jsx'

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

    const role = useMemo(() => {
        try {
            const access = getCookie('access')
            if (!access) return null
            const decoded = jwtDecode(access)
            return decoded?.role || null
        } catch (error) {
            return null
        }
    }, [currentUser])

    const displayName = currentUser?.name || currentUser?.fullName || 'Tài khoản'
    const avatarUrl = currentUser?.avatar || currentUser?.photoURL || ''

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
                    <span className="brand__name">Lá Nhỏ Bên Thềm</span>
                </Link>
                <nav className="main-nav" aria-label="Điều hướng chính">
                    <NavLink to="/" end> Sản phẩm </NavLink>
                    <NavLink to="/huong-dan-mua-hang"> Hướng dẫn mua hàng </NavLink>
                    <NavLink to="/cham-soc"> Chăm sóc </NavLink>
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
                            <img src="/TraiTym.png" alt="Yêu thích"/>
                        </Link>
                        <Link className="header__icon" title="Giỏ hàng" to="#">
                            <img src="/MuaHang.png" alt="Giỏ hàng"/>
                        </Link>
                        <Link className="header__icon" title="Thông báo" to="#">
                            <img src="/Chuong.png" alt="Thông báo"/>
                        </Link>

                        {!currentUser ? (
                            <Link 
                                to="/sign-in"
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
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                            >
                                <img 
                                    src="/nguoidung.png" 
                                    alt="Đăng nhập" 
                                    style={{ 
                                        width: 24, 
                                        height: 24,
                                        objectFit: 'contain'
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
                                        <Avatar src={avatarUrl} sx={{width: 36, height: 36}}/>
                                    ) : (
                                        <img src="/nguoidung.png" alt={displayName}/>
                                    )}
                                </IconButton>
                                <Typography variant="body2" sx={{fontWeight: 600, display: {xs: 'none', md: 'block'}}}>
                                    {displayName}
                                </Typography>
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
                                            {role === 'ADMIN' ? 'Quản trị viên' :
                                                role === 'SELLER' ? 'Người bán' :
                                                    role === 'BUYER' ? 'Khách hàng' : 'Đã đăng nhập'}
                                        </Typography>
                                    </Box>
                                    <Divider/>
                                    <MenuItem onClick={() => navigate('/account/profile')}>
                                        <ListItemIcon><PersonIcon fontSize="small"/></ListItemIcon>
                                        Hồ sơ của tôi
                                    </MenuItem>
                                    {role === 'buyer' && (
                                        <MenuItem onClick={() => navigate('/')}>
                                            <ListItemIcon><HomeIcon fontSize="small"/></ListItemIcon>
                                            Trang sản phẩm
                                        </MenuItem>
                                    )}
                                    {role === 'admin' && (
                                        <MenuItem onClick={() => navigate('/admin/dashboard')}>
                                            <ListItemIcon><DashboardIcon fontSize="small"/></ListItemIcon>
                                            Admin Dashboard
                                        </MenuItem>
                                    )}
                                    {role === 'seller' && (
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


