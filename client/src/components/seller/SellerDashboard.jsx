import {useEffect, useState} from 'react'
import {Box, Typography, Grid, Paper, Button, Divider, Chip, List, ListItem, ListItemText} from '@mui/material'

export default function SellerDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    todayOrders: 0,
    revenueVnd: 0,
    totalProducts: 0,
    lowStock: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    document.title = 'Kênh người bán | Lá Nhỏ Bên Thềm'

    // Placeholder: hook up API here if available
    // setIsLoading(true)
    // axiosClient.get('/seller/dashboard/summary').then(res => setStats(...))
    // axiosClient.get('/seller/orders?limit=5').then(res => setRecentOrders(...))
    //   .finally(() => setIsLoading(false))
  }, [])

  function formatCurrencyVnd(value) {
    try {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
    } catch (_) {
      return `${value ?? 0} ₫`
    }
  }

  return (
    <Box sx={{px: 3, py: 4}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3}}>
        <Box>
          <Typography variant="h4" sx={{fontWeight: 800, color: 'var(--secondary-500)'}}>
            Kênh người bán
          </Typography>
          <Typography variant="body2" className="muted">
            Tổng quan hiệu suất cửa hàng hôm nay
          </Typography>
        </Box>
        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
          <Button variant="contained">Tạo sản phẩm</Button>
          <Button variant="outlined">Xem đơn hàng</Button>
          <Button variant="outlined">Quản lý sản phẩm</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{p: 2, borderRadius: 2}}>
            <Typography variant="subtitle2" sx={{opacity: .7}}>Đơn hàng hôm nay</Typography>
            <Typography variant="h5" sx={{fontWeight: 800}}>{stats.todayOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{p: 2, borderRadius: 2}}>
            <Typography variant="subtitle2" sx={{opacity: .7}}>Doanh thu (VNĐ)</Typography>
            <Typography variant="h5" sx={{fontWeight: 800}}>{formatCurrencyVnd(stats.revenueVnd)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{p: 2, borderRadius: 2}}>
            <Typography variant="subtitle2" sx={{opacity: .7}}>Sản phẩm đang bán</Typography>
            <Typography variant="h5" sx={{fontWeight: 800}}>{stats.totalProducts}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{p: 2, borderRadius: 2}}>
            <Typography variant="subtitle2" sx={{opacity: .7}}>Sắp hết hàng</Typography>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Typography variant="h5" sx={{fontWeight: 800}}>{stats.lowStock}</Typography>
              <Chip size="small" color={stats.lowStock > 0 ? 'warning' : 'default'} label={stats.lowStock > 0 ? 'Kiểm tra' : 'Ổn định'} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{p: 3, borderRadius: 2}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <Typography variant="h6" sx={{fontWeight: 700}}>Đơn gần đây</Typography>
              <Button size="small">Xem tất cả</Button>
            </Box>
            <Divider sx={{my: 2}} />

            {isLoading ? (
              <Typography variant="body2">Đang tải...</Typography>
            ) : recentOrders.length === 0 ? (
              <Typography variant="body2" className="muted">Chưa có đơn hàng gần đây</Typography>
            ) : (
              <List>
                {recentOrders.map(order => (
                  <ListItem key={order.id} divider disableGutters>
                    <ListItemText
                      primary={`#${order.code} • ${order.customerName}`}
                      secondary={`${new Date(order.createdAt).toLocaleString('vi-VN')} • ${formatCurrencyVnd(order.total)}`}
                    />
                    <Chip size="small" label={order.statusLabel || 'Mới'} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
