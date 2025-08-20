import '../styles/ui/SiteHeader.css'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, Box, IconButton, Menu, MenuItem, Tooltip, Typography, Divider, ListItemIcon } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import StorefrontIcon from '@mui/icons-material/Storefront'
import PersonIcon from '@mui/icons-material/Person'
import { enqueueSnackbar } from 'notistack'
import { getCookie } from '../utils/CookieUtil.jsx'
import { jwtDecode } from 'jwt-decode'
import { signout } from '../services/AccountService.jsx'

export default function SiteHeader() {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const menuOpen = Boolean(anchorEl)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      setCurrentUser(raw ? JSON.parse(raw) : null)
    } catch (_) {
      setCurrentUser(null)
    }
  }, [])

  const role = useMemo(() => {
    try {
      const access = getCookie('access')
      if (!access) return null
      return jwtDecode(access)?.role || null
    } catch (_) {
      return null
    }
  }, [currentUser])

  const displayName = currentUser?.name || currentUser?.fullName || 'Tài khoản'
  const avatarUrl = currentUser?.avatar || currentUser?.photoURL || ''

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget)
  const handleCloseMenu = () => setAnchorEl(null)

  const handleLogout = async () => {
    try {
      await signout()
    } catch (_) { /* ignore */ }
    localStorage.clear()
    enqueueSnackbar('Đã đăng xuất', { variant: 'success' })
    handleCloseMenu()
    navigate('/', { replace: true })
    // Reload to refresh header state derived from storage/cookies
    setTimeout(() => window.location.reload(), 300)
  }

  return (
    <div className="site-header" id="siteHeader">
      <div className="container header__row">
        <Link className="brand" to="/">
          <span className="brand__logo" aria-hidden>
            <img src="/senda.png" alt="Lá Nhỏ Bên Thềm" />
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
          <div className="header__icons" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a className="header__icon" title="Yêu thích" href="#">
              <img src="/TraiTym.png" alt="Yêu thích" />
            </a>
            <a className="header__icon" title="Giỏ hàng" href="#">
              <img src="/MuaHang.png" alt="Giỏ hàng" />
            </a>
            <a className="header__icon" title="Thông báo" href="#">
              <img src="/Chuong.png" alt="Thông báo" />
            </a>

            {!currentUser ? (
              <NavLink className="header__icon" title="Đăng nhập" to="/sign-in">
                <img src="/nguoidung.png" alt="Đăng nhập" />
              </NavLink>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={displayName}>
                  <IconButton onClick={handleOpenMenu} size="small" sx={{ ml: 1 }} aria-controls={menuOpen ? 'account-menu' : undefined} aria-haspopup="true" aria-expanded={menuOpen ? 'true' : undefined}>
                    <Avatar src={avatarUrl} sx={{ width: 36, height: 36 }}>
                      {displayName?.charAt(0)?.toUpperCase() || <PersonIcon fontSize="small" />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', md: 'block' } }}>
                  {displayName}
                </Typography>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={menuOpen}
                  onClose={handleCloseMenu}
                  onClick={handleCloseMenu}
                  PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 220 } }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, pt: 1, pb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{displayName}</Typography>
                    <Typography variant="caption" className="muted">{role ? `Role: ${role}` : 'Đã đăng nhập'}</Typography>
                  </Box>
                  <Divider />
                  {role === 'admin' && (
                    <MenuItem onClick={() => navigate('/admin/dashboard')}> 
                      <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                      Admin Dashboard
                    </MenuItem>
                  )}
                  {role === 'seller' && (
                    <MenuItem onClick={() => navigate('/seller/dashboard')}>
                      <ListItemIcon><StorefrontIcon fontSize="small" /></ListItemIcon>
                      Kênh người bán
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
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


