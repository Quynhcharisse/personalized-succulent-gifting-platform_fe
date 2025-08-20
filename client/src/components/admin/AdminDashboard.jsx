import {Box, Typography, Grid, Paper, Button} from '@mui/material'
import {useEffect} from 'react'

export default function AdminDashboard() {
  useEffect(() => {
    document.title = 'Admin Dashboard | Lá Nhỏ Bên Thềm'
  }, [])

  return (
    <Box sx={{px: 3, py: 4}}>
      <Typography variant="h4" sx={{fontWeight: 800, mb: 3, color: 'var(--secondary-500)'}}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{p: 2, borderRadius: 2}}>
            <Typography variant="subtitle2" sx={{opacity: .7}}>Đơn hàng hôm nay</Typography>
            <Typography variant="h5" sx={{fontWeight: 800}}>0</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{p: 2, borderRadius: 2}}>
            <Typography variant="subtitle2" sx={{opacity: .7}}>Doanh thu (VNĐ)</Typography>
            <Typography variant="h5" sx={{fontWeight: 800}}>0</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{p: 2, borderRadius: 2}}>
            <Typography variant="subtitle2" sx={{opacity: .7}}>Người dùng mới</Typography>
            <Typography variant="h5" sx={{fontWeight: 800}}>0</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={2} sx={{p: 3, borderRadius: 2}}>
            <Typography variant="h6" sx={{fontWeight: 700, mb: 1}}>Tác vụ nhanh</Typography>
            <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
              <Button variant="contained">Tạo sản phẩm</Button>
              <Button variant="outlined">Xem đơn hàng</Button>
              <Button variant="outlined">Quản lý người dùng</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}


