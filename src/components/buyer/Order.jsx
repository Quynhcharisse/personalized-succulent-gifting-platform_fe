import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {
    Alert,
    Avatar,
    Badge,
    Box,
    Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material'
import {
    AccessTime,
    CancelOutlined,
    CheckCircle,
    ChevronRight,
    FilterAlt,
    Inventory2,
    LocalShipping,
    PendingActions,
    Refresh,
    Search,
    ShoppingBag
} from '@mui/icons-material'
import OrderService from '../../services/OrderService.jsx'

const ORDER_STATUSES = [
    {value: 'ALL', label: 'Tất cả', color: '#0D3B2E'},
    {value: 'PACKAGING', label: 'Đang đóng gói', color: '#2d9cdb'},
    {value: 'SHIPPING', label: 'Đang vận chuyển', color: '#6c5ce7'},
    {value: 'DONE', label: 'Đơn hàng thành công', color: '#27ae60'},
    {value: 'FAILED_SHIPPING', label: 'Vận chuyển thất bại', color: '#eb5757'}
]

const statusMeta = {
    PACKAGING: {label: 'Đang đóng gói', color: 'info', icon: PendingActions},
    SHIPPING: {label: 'Đang vận chuyển', color: 'primary', icon: LocalShipping},
    DONE: {label: 'Đơn hàng thành công', color: 'success', icon: CheckCircle},
    FAILED_SHIPPING: {label: 'Vận chuyển thất bại', color: 'error', icon: CancelOutlined}
}




const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
}).format(Number(value || 0))

const formatDate = (isoDate) => {
    if (!isoDate) return '—'
    return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
}).format(new Date(isoDate))
}

export default function Order() {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeStatus, setActiveStatus] = useState('ALL')
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState(null)

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await OrderService.getOrders()
            const orderList = response?.data?.data ?? []

            const ordersWithDetails = await Promise.all(orderList.map(async (order) => {
                try {
                    const detailResponse = await OrderService.getOrderDetail(order.orderId)
                    return {...order, ...(detailResponse?.data?.data || {})}
                } catch (detailFetchError) {
                    console.error('Failed to fetch order detail', detailFetchError)
                    return order
                }
            }))

            setOrders(ordersWithDetails)
        } catch (ordersError) {
            console.error('Failed to fetch orders list', ordersError)
            setError(ordersError?.response?.data?.message || 'Không thể tải danh sách đơn hàng')
            setOrders([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const summaryStats = useMemo(() => ({
        total: orders.length,
        packaging: orders.filter(order => order.status === 'PACKAGING').length,
        shipping: orders.filter(order => order.status === 'SHIPPING').length,
        done: orders.filter(order => order.status === 'DONE').length,
        failed: orders.filter(order => order.status === 'FAILED_SHIPPING').length,
    }), [orders])

    const filteredOrders = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase()
        return orders.filter(order => {
            const matchStatus = activeStatus === 'ALL' || order.status === activeStatus
            const orderCode = order.orderId?.toString().toLowerCase() || ''
            const recipientName = (order.buyerName || '').toLowerCase()
            const matchSearch = !normalizedSearch
                || orderCode.includes(normalizedSearch)
                || recipientName.includes(normalizedSearch)
            return matchStatus && matchSearch
        })
    }, [activeStatus, searchTerm, orders])

    const handleOpenDetail = async (order) => {
        setDetailOpen(true)
        setDetailLoading(true)
        setDetailError(null)
        setSelectedOrder(order)
        try {
            const detailResponse = await OrderService.getOrderDetail(order.orderId)
            setSelectedOrder(prev => ({...(prev || {}), ...(detailResponse?.data?.data || {})}))
        } catch (detailFetchError) {
            console.error('Failed to fetch order detail', detailFetchError)
            setDetailError(detailFetchError?.response?.data?.message || 'Không thể tải chi tiết đơn hàng')
        } finally {
            setDetailLoading(false)
        }
    }

    const handleCloseDetail = () => {
        setDetailOpen(false)
        setSelectedOrder(null)
        setDetailError(null)
    }

    const renderStatusChip = (status) => {
        const meta = statusMeta[status] || {}
        const Icon = meta.icon || Inventory2
        return (
            <Chip
                icon={<Icon fontSize="small"/>}
                label={meta.label || status}
                color={meta.color || 'default'}
                sx={{fontWeight: 600}}
            />
        )
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%)',
            py: {xs: 4, md: 6}
        }}>
            <Container maxWidth="lg">
                <Stack spacing={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: {xs: 3, md: 4},
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #0D3B2E 0%, #1e5a4a 100%)',
                            color: 'white',
                            boxShadow: '0 24px 60px rgba(13,59,46,0.35)'
                        }}
                    >
                        <Stack direction={{xs: 'column', md: 'row'}} spacing={3} alignItems="center"
                               justifyContent="space-between">
                            <Stack spacing={1}>
                             
                                <Typography variant="h4" sx={{fontWeight: 800}}>
                                    Đơn hàng của bạn
                                </Typography>
                             
                            </Stack>
                            <Stack direction="row" spacing={2}>
                                <Tooltip title={loading ? 'Đang tải...' : 'Làm mới danh sách'}>
                                    <span>
                                    <IconButton
                                            onClick={fetchOrders}
                                            disabled={loading}
                                        sx={{
                                            backgroundColor: 'rgba(255,255,255,0.15)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            color: 'white',
                                                '&:hover': {backgroundColor: 'rgba(255,255,255,0.25)'},
                                                opacity: loading ? 0.7 : 1
                                        }}
                                    >
                                        <Refresh/>
                                    </IconButton>
                                    </span>
                                </Tooltip>
                             
                            </Stack>
                        </Stack>
                    </Paper>

                    <Grid container spacing={3}>
                        {[
                            {
                                label: 'Tổng đơn',
                                value: summaryStats.total,
                                icon: ShoppingBag,
                                bg: '#fff',
                                accent: '#0D3B2E'
                            },
                            {
                                label: 'Đang đóng gói',
                                value: summaryStats.packaging,
                                icon: PendingActions,
                                bg: '#fff8e1',
                                accent: '#f2994a'
                            },
                            {
                                label: 'Đang vận chuyển',
                                value: summaryStats.shipping,
                                icon: LocalShipping,
                                bg: '#e3f2fd',
                                accent: '#0d47a1'
                            },
                            {
                                label: 'Thành công',
                                value: summaryStats.done,
                                icon: CheckCircle,
                                bg: '#e8f5e9',
                                accent: '#1b5e20'
                            },
                            {
                                label: 'Vận chuyển thất bại',
                                value: summaryStats.failed,
                                icon: CancelOutlined,
                                bg: '#ffebee',
                                accent: '#b71c1c'
                            }
                        ].map((stat) => (
                            <Grid item xs={12} sm={6} md={3} key={stat.label}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        backgroundColor: stat.bg,
                                        border: '1px solid rgba(13, 59, 46, 0.08)',
                                        height: '100%',
                                        boxShadow: '0 14px 40px rgba(13,59,46,0.08)'
                                    }}
                                >
                                    <Stack spacing={2}>
                                        <Avatar
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                backgroundColor: `${stat.accent}15`,
                                                color: stat.accent
                                            }}
                                        >
                                            <stat.icon/>
                                        </Avatar>
                                        <div>
                                            <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                                {stat.label}
                                            </Typography>
                                            <Typography variant="h4" sx={{fontWeight: 800}}>
                                                {stat.value}
                                            </Typography>
                                        </div>
                                    </Stack>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    <Paper
                        elevation={0}
                        sx={{
                            p: {xs: 2, md: 3},
                            borderRadius: 3,
                            border: '1px solid rgba(13,59,46,0.08)',
                            backgroundColor: 'white'
                        }}
                    >
                        <Stack spacing={3}>
                          

                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {ORDER_STATUSES.map((status) => (
                                    <Chip
                                        key={status.value}
                                        label={status.label}
                                        onClick={() => setActiveStatus(status.value)}
                                        variant={activeStatus === status.value ? 'filled' : 'outlined'}
                                        sx={{
                                            borderRadius: 999,
                                            borderColor: status.color,
                                            color: activeStatus === status.value ? 'white' : status.color,
                                            backgroundColor: activeStatus === status.value ? status.color : 'transparent',
                                            fontWeight: 600
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Stack>
                    </Paper>

                    {error && (
                        <Alert severity="error" sx={{borderRadius: 2}}>
                            {error}
                        </Alert>
                    )}

                    {loading && (
                        <LinearProgress sx={{borderRadius: 999}}/>
                    )}

                    <Stack spacing={3}>
                        {filteredOrders.length === 0 && !loading && (
                            <Paper
                                elevation={0}
                                sx={{
                                    py: 8,
                                    borderRadius: 4,
                                    textAlign: 'center',
                                    border: '1px dashed rgba(13,59,46,0.2)',
                                    backgroundColor: 'rgba(255,255,255,0.8)'
                                }}
                            >
                                <Typography variant="h6" sx={{fontWeight: 700, color: '#0D3B2E'}}>
                                    Không tìm thấy đơn hàng phù hợp
                                </Typography>
                             
                            </Paper>
                        )}

                        {filteredOrders.map((order) => (
                            <Paper
                                key={`order-${order.orderId}`}
                                elevation={0}
                                sx={{
                                    p: {xs: 2.5, md: 3},
                                    borderRadius: 4,
                                    backgroundColor: 'white',
                                    border: '1px solid rgba(13,59,46,0.08)',
                                    boxShadow: '0 20px 45px rgba(13,59,46,0.08)'
                                }}
                            >
                                <Stack spacing={2.5}>
                                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2}
                                           justifyContent="space-between"
                                           alignItems={{xs: 'flex-start', md: 'center'}}>
                                        <Stack spacing={0.5}>
                                            <Typography variant="subtitle2" sx={{color: 'text.secondary'}}>
                                                Mã đơn
                                            </Typography>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Typography variant="h6" sx={{fontWeight: 800}}>
                                                    #{order.orderId}
                                                </Typography>
                                                {renderStatusChip(order.status)}
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary">
                                                Người nhận: {order.buyerName || 'Đang cập nhật'} • Email: {order.email || '—'}
                                            </Typography>
                                        </Stack>
                                        <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems="center">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <AccessTime fontSize="small" color="action"/>
                                                <Typography variant="body2" color="text.secondary">
                                                    Tạo lúc {formatDate(order.orderDate)}
                                                </Typography>
                                            </Stack>
                                          
                                        </Stack>
                                    </Stack>

                                    <Divider/>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={7}>
                                            <Stack spacing={2}>
                                                {(order.orderItems && order.orderItems.length > 0) ? (
                                                    order.orderItems.map((item, index) => (
                                                        <Stack key={`${order.orderId}-${index}`} direction="row" spacing={2}
                                                           alignItems="center"
                                                           sx={{p: 2, borderRadius: 2, backgroundColor: 'rgba(13,59,46,0.02)'}}
                                                    >
                                                        <Badge
                                                            badgeContent={`x${item.quantity}`}
                                                            color="secondary"
                                                            sx={{'& .MuiBadge-badge': {fontWeight: 600}}}
                                                        >
                                                            <Avatar
                                                                variant="rounded"
                                                                sx={{
                                                                    width: 48,
                                                                    height: 48,
                                                                    backgroundColor: 'rgba(13,59,46,0.08)',
                                                                    color: '#0D3B2E',
                                                                    fontWeight: 700
                                                                }}
                                                            >
                                                                <ShoppingBag/>
                                                            </Avatar>
                                                        </Badge>
                                                        <Box sx={{flexGrow: 1}}>
                                                            <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                                                    {item.productName}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                    Kích thước: {item.sizeName || '—'} • Số lượng: {item.quantity}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                                                            {formatCurrency(item.price)}
                                                        </Typography>
                                                    </Stack>
                                                    ))
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Thông tin sản phẩm sẽ hiển thị khi mở chi tiết đơn hàng.
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </Grid>

                                        <Grid item xs={12} md={5}>
                                            <Stack spacing={2}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 2.5,
                                                        borderRadius: 3,
                                                        borderColor: 'rgba(13,59,46,0.1)'
                                                    }}
                                                >
                                                    <Stack spacing={1}>
                                                        <Typography variant="subtitle2" sx={{color: 'text.secondary'}}>
                                                            Giao hàng
                                                        </Typography>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Avatar
                                                                sx={{
                                                                    width: 48,
                                                                    height: 48,
                                                                    backgroundColor: 'rgba(108,92,231,0.15)',
                                                                    color: '#6c5ce7'
                                                                }}
                                                            >
                                                                <LocalShipping/>
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="subtitle1"
                                                                            sx={{fontWeight: 600}}>
                                                                    Giao hàng nhanh
                                                                </Typography>
                                                            
                                                            </Box>
                                                        </Stack>
                                                        <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                                            Địa chỉ: {order.address || 'Địa chỉ đang cập nhật'}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                                            Liên hệ:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{color: 'text.secondary', pl: 2}}>
                                                            SĐT: {order.buyerPhone || '—'}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{color: 'text.secondary', pl: 2}}>
                                                            Email: {order.email || '—'}
                                                        </Typography>
                                                    </Stack>
                                                </Paper>

                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 2.5,
                                                        borderRadius: 3,
                                                        borderColor: 'rgba(13,59,46,0.1)'
                                                    }}
                                                >
                                                    <Stack spacing={1}>
                                                        <Typography variant="subtitle2" sx={{color: 'text.secondary'}}>
                                                            Thanh toán
                                                        </Typography>
                                                        <Typography variant="body1" sx={{fontWeight: 600}}>
                                                            Phương thức: VNPAY
                                                        </Typography>
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography variant="body2" color="text.secondary">
                                                                Tạm tính
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {formatCurrency(order.totalAmount)}
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography variant="body2" color="text.secondary">
                                                                Phí vận chuyển
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {formatCurrency(order.shippingFee)}
                                                            </Typography>
                                                        </Stack>
                                                        <Divider sx={{my: 1}}/>
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                                                                Tổng thanh toán
                                                            </Typography>
                                                            <Typography variant="subtitle1" sx={{fontWeight: 800, color: '#0D3B2E'}}>
                                                                {formatCurrency(order.finalAmount)}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                </Paper>
                                            </Stack>
                                        </Grid>
                                    </Grid>

                                  
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                </Stack>
            </Container>
            <Dialog
                open={detailOpen}
                onClose={handleCloseDetail}
                fullWidth
                maxWidth="md"
                scroll="body"
            >
                <DialogTitle sx={{fontWeight: 700}}>
                    {selectedOrder ? `Chi tiết đơn #${selectedOrder.orderId}` : 'Chi tiết đơn hàng'}
                </DialogTitle>
                <DialogContent dividers sx={{backgroundColor: 'rgba(13,59,46,0.02)'}}>
                    {detailLoading && (
                        <LinearProgress sx={{mb: 2}}/>
                    )}

                    {detailError && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {detailError}
                        </Alert>
                    )}

                    {selectedOrder && (
                        <Stack spacing={3}>
                            <Paper
                                variant="outlined"
                                sx={{p: 3, borderRadius: 3, borderColor: 'rgba(13,59,46,0.1)'}}
                            >
                                <Stack direction={{xs: 'column', md: 'row'}} spacing={3}
                                       justifyContent="space-between">
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{color: 'text.secondary'}}>
                                            Trạng thái
                                        </Typography>
                                        {renderStatusChip(selectedOrder.status)}
                                    </Stack>
                                    <Stack spacing={0.5}>
                                        <Typography variant="subtitle2" sx={{color: 'text.secondary'}}>
                                            Thời gian
                                        </Typography>
                                        <Typography variant="body2">
                                            Đặt lúc: {formatDate(selectedOrder.orderDate)}
                                        </Typography>
                                     
                                    </Stack>
                                </Stack>
                            </Paper>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Paper variant="outlined" sx={{p: 3, borderRadius: 3, height: '100%'}}>
                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2" sx={{color: 'text.secondary'}}>
                                                Thông tin người nhận
                                            </Typography>
                                            <Typography variant="h6" sx={{fontWeight: 700}}>
                                                {selectedOrder.buyerName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Email: {selectedOrder.email}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                SĐT: {selectedOrder.buyerPhone}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Địa chỉ: {selectedOrder.address}
                                            </Typography>
                                        </Stack>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Paper variant="outlined" sx={{p: 3, borderRadius: 3, height: '100%'}}>
                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2" sx={{color: 'text.secondary'}}>
                                                Thanh toán
                                            </Typography>
                                            <Typography variant="body2">
                                                Phương thức: {selectedOrder.paymentMethod}
                                            </Typography>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">
                                                    Tạm tính
                                                </Typography>
                                                <Typography variant="body2" sx={{fontWeight: 600}}>
                                                    {formatCurrency(selectedOrder.totalAmount)}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2" color="text.secondary">
                                                    Phí vận chuyển
                                                </Typography>
                                                <Typography variant="body2" sx={{fontWeight: 600}}>
                                                    {formatCurrency(selectedOrder.shippingFee)}
                                                </Typography>
                                            </Stack>
                                            <Divider sx={{my: 1}}/>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                                                    Tổng thanh toán
                                                </Typography>
                                                <Typography variant="h6" sx={{fontWeight: 800, color: '#0D3B2E'}}>
                                                    {formatCurrency(selectedOrder.finalAmount)}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Paper variant="outlined" sx={{p: 3, borderRadius: 3}}>
                                <Stack spacing={2}>
                                    <Typography variant="subtitle2" sx={{color: 'text.secondary'}}>
                                        Sản phẩm trong đơn
                                    </Typography>
                                    <Stack spacing={2}>
                                        {selectedOrder.orderItems.map((item, idx) => (
                                            <Stack key={`${selectedOrder.orderId}-detail-${idx}`}
                                                   direction="row"
                                                   spacing={2}
                                                   alignItems="center"
                                                   sx={{
                                                       p: 2,
                                                       borderRadius: 2,
                                                       backgroundColor: 'rgba(13,59,46,0.04)'
                                                   }}
                                            >
                                                <Badge badgeContent={`x${item.quantity}`} color="secondary">
                                                    <Avatar
                                                        variant="rounded"
                                                        sx={{
                                                            width: 48,
                                                            height: 48,
                                                            backgroundColor: 'rgba(13,59,46,0.1)',
                                                            color: '#0D3B2E',
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        <ShoppingBag/>
                                                    </Avatar>
                                                </Badge>
                                                <Box sx={{flexGrow: 1}}>
                                                    <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                                        {item.productName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Kích thước: {item.sizeName}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                                                    {formatCurrency(item.price)}
                                                </Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{p: 2}}>
                    <Button onClick={handleCloseDetail} sx={{borderRadius: 2}}>
                        Đóng
                    </Button>
                    <Button variant="contained" sx={{borderRadius: 2}} onClick={handleCloseDetail}>
                        Liên hệ hỗ trợ
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}



