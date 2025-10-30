import React, { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Box, Typography, Button, Divider, List, ListItem, ListItemText, Card, CardContent, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Radio } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { removeItem, clear } from '../../store/slices/cartSlice.js'
import { DASHBOARD_STYLES, COLORS } from '../constants.js'
import axiosClient from '../../config/APIConfig.jsx'

export default function Cart() {
    const items = useSelector(state => state?.cart?.items || [])
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [priceMap, setPriceMap] = useState({}) // key: `${id}-${size}` => price number
    const [voucherDialogOpen, setVoucherDialogOpen] = useState(false)
    const [vouchers] = useState([
        { id: 1, code: 'PSGP10', title: 'Giảm 10% cho đơn từ 150K', type: 'percent', value: 10, minOrder: 150000, maxDiscount: 40000 },
        { id: 2, code: 'FREESHIP', title: 'Giảm 30K phí vận chuyển', type: 'fixed', value: 30000, appliesTo: 'shipping', minOrder: 200000 },
        { id: 3, code: 'PSGP50K', title: 'Giảm 50K cho đơn từ 350K', type: 'fixed', value: 50000, minOrder: 350000, appliesTo: 'subtotal' }
    ])
    const [appliedVoucher, setAppliedVoucher] = useState(null)
    const [tempSelectedVoucherId, setTempSelectedVoucherId] = useState('')

    const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0)

    const calculateProductPrice = (size) => {
        if (!size) return 0
        let total = 0
        // succulents
        if (Array.isArray(size.succulents)) {
            size.succulents.forEach(sc => {
                if (Array.isArray(sc.size)) {
                    sc.size.forEach(sz => {
                        const unit = Number(sz?.price) || 0
                        const q = Number(sz?.quantity) || 1
                        total += unit * q
                    })
                } else if (sc.size?.price) {
                    const unit = Number(sc.size.price) || 0
                    const q = Number(sc.quantity) || 1
                    total += unit * q
                }
            })
        }
        // pot price: take first size price if exists
        if (Array.isArray(size.pot?.size) && size.pot.size.length > 0) {
            total += Number(size.pot.size[0]?.price) || 0
        }
        // soil price
        if (size.soil?.basePricing) {
            const unitPrice = Number(size.soil.basePricing.price) || 0
            const massValue = Number(size.soil.basePricing.massValue) || 1
            const massAmount = Number(size.soil.massAmount) || 0
            total += (unitPrice / massValue) * massAmount
        }
        // decorations
        if (Array.isArray(size.decorations)) {
            size.decorations.forEach(d => {
                total += Number(d?.totalPrice) || 0
            })
        }
        return total
    }

    useEffect(() => {
        const loadPrices = async () => {
            const entries = await Promise.all(items.map(async (it) => {
                const key = `${it.id}-${it.size || 'default'}`
                if (priceMap[key] != null) return [key, priceMap[key]]
                try {
                    const res = await axiosClient.get(`/product/${it.id}`)
                    const data = res?.data?.data
                    const size = Array.isArray(data?.sizes) ? (data.sizes.find(s => s.name === it.size) || data.sizes[0]) : null
                    const price = calculateProductPrice(size)
                    return [key, price]
                } catch (e) {
                    return [key, 0]
                }
            }))
            const next = { ...priceMap }
            entries.forEach(([k, v]) => { next[k] = v })
            setPriceMap(next)
        }
        if (items.length) loadPrices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
        console.log(priceMap);
    }, [items])

    const subtotal = useMemo(() => items.reduce((sum, it) => sum + (priceMap[`${it.id}-${it.size || 'default'}`] || 0), 0), [items, priceMap])
    const computeVoucherDiscount = () => {
        if (!appliedVoucher) return { discountOnSubtotal: 0 }
        if (subtotal < (appliedVoucher.minOrder || 0)) return { discountOnSubtotal: 0 }
        if (appliedVoucher.type === 'percent') {
            const raw = Math.floor((subtotal * appliedVoucher.value) / 100)
            const capped = Math.min(raw, appliedVoucher.maxDiscount || raw)
            return { discountOnSubtotal: capped }
        }
        if (appliedVoucher.appliesTo === 'subtotal' || !appliedVoucher.appliesTo) {
            return { discountOnSubtotal: Math.min(appliedVoucher.value, subtotal) }
        }
        // shipping voucher không tính ở trang giỏ
        return { discountOnSubtotal: 0 }
    }
    const { discountOnSubtotal } = computeVoucherDiscount()
    const discount = discountOnSubtotal
    const total = Math.max(0, subtotal - discount)

    return (
        <Box sx={DASHBOARD_STYLES.container}>
            <Card sx={{ ...DASHBOARD_STYLES.paper }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary }}>Giỏ hàng</Typography>
                        {items.length > 0 && (
                            <Button variant="outlined" color="error" onClick={() => dispatch(clear())}>Xóa tất cả</Button>
                        )}
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    {items.length === 0 ? (
                        <Typography color="text.secondary">Chưa có sản phẩm nào.</Typography>
                    ) : (
                        <>
                            {/* Voucher section */}
                            <Box sx={{ p: { xs: 1.5, sm: 2 }, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 2, border: `1px solid ${COLORS.primary}20`, mb: 2 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ color: COLORS.primary, fontWeight: 700 }}>VOUCHER CỦA SHOP</Typography>
                                    <Button 
                                        variant="text" 
                                        onClick={() => { setTempSelectedVoucherId(appliedVoucher?.id || ""); setVoucherDialogOpen(true); }}
                                        sx={{ color: 'white', textTransform: 'none', fontWeight: 600, ...DASHBOARD_STYLES.primaryButton }}
                                    >
                                        CHỌN VOUCHER
                                    </Button>
                                </Stack>
                                {appliedVoucher && (
                                    <Typography variant="body2" sx={{ mt: 1, color: COLORS.primary, fontWeight: 600 }}>
                                        Đã áp dụng: {appliedVoucher.code} — {appliedVoucher.title}
                                    </Typography>
                                )}
                            </Box>

                            {/* Cart items */}
                            <List sx={{ p: 0 }}>
                                {items.map((it) => (
                                    <ListItem
                                        key={`${it.id}-${it.size || 'default'}`}
                                        sx={{
                                            mb: 1,
                                            border: '1px solid #e0e0e0',
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255,255,255,0.9)'
                                        }}
                                        secondaryAction={
                                            <Button color="error" onClick={() => dispatch(removeItem({ id: it.id, size: it.size }))}>Xóa</Button>
                                        }
                                        button
                                        onClick={() => navigate(`/product/${it.id}`)}
                                    >
                                        <ListItemText
                                            primary={<Typography sx={{ color: COLORS.primary, fontWeight: 700 }}>{it.name} {it.size ? `(Size: ${it.size})` : ''}</Typography>}
                                            secondary={
                                                <>
                                                    <Typography variant="body2" sx={{ color: COLORS.primaryLight }}>Trạng thái: {it.status ?? '—'}</Typography>
                                                    <Typography variant="body2" sx={{ color: COLORS.primary, fontWeight: 700 }}>{formatCurrency(priceMap[`${it.id}-${it.size || 'default'}`] || 0)}</Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            {/* Voucher dialog */}
                            <Dialog 
                                open={voucherDialogOpen} 
                                onClose={() => setVoucherDialogOpen(false)} 
                                maxWidth="md" 
                                fullWidth
                                slotProps={{ paper: { sx: DASHBOARD_STYLES.dialog } }}
                            >
                                <DialogTitle sx={DASHBOARD_STYLES.dialogTitle}>
                                    Chọn Voucher
                                    <Typography variant="body2" sx={{opacity: 0.9, mt: 0.5, fontWeight: 400}}>
                                        Chọn voucher phù hợp để giảm giá cho đơn hàng của bạn
                                    </Typography>
                                </DialogTitle>
                                <DialogContent sx={DASHBOARD_STYLES.dialogContent}>
                                    <Box sx={DASHBOARD_STYLES.formSection}>
                                        <Typography variant="h6" sx={DASHBOARD_STYLES.sectionTitle}>Danh sách voucher khả dụng</Typography>
                                        <Divider sx={{mb: 2}}/>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {vouchers.map((v) => {
                                                const selected = tempSelectedVoucherId === v.id
                                                const reachable = subtotal >= (v.minOrder || 0)
                                                return (
                                                    <Box key={v.id} sx={{ p: 2, borderRadius: 2, border: selected ? `2px solid ${COLORS.primary}` : '1px solid #e0e0e0', backgroundColor: selected ? `${COLORS.primary}10` : 'white', cursor: reachable ? 'pointer' : 'not-allowed', opacity: reachable ? 1 : 0.6, transition: 'all 0.2s ease', '&:hover': reachable ? { backgroundColor: selected ? `${COLORS.primary}15` : '#f5f5f5' } : {}, display: 'flex', alignItems: 'center', gap: 2 }} onClick={() => reachable && setTempSelectedVoucherId(v.id)}>
                                                        <Radio checked={selected} disabled={!reachable} sx={{ color: COLORS.primary, '&.Mui-checked': { color: COLORS.primary } }} />
                                                        <Box sx={{ flex: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                                <Typography variant="subtitle1" fontWeight={600} sx={{ color: COLORS.primary }}>{v.code}</Typography>
                                                                <Typography variant="body2" sx={{ color: COLORS.primaryLight }}>—</Typography>
                                                                <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.primary }}>{v.title}</Typography>
                                                            </Box>
                                                            {!reachable && (
                                                                <Typography variant="caption" sx={{ color: 'error.main' }}>Đơn tối thiểu {formatCurrency(v.minOrder)}</Typography>
                                                            )}
                                                            {v.type === 'percent' && (
                                                                <Typography variant="caption" sx={{ color: COLORS.primaryLight, display: 'block' }}>Giảm tối đa {formatCurrency(v.maxDiscount || 0)}</Typography>
                                                            )}
                                                        </Box>
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.primary }}>
                                                                {v.type === 'percent' ? `${v.value}%` : formatCurrency(v.value)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                )
                                            })}
                                        </Box>
                                    </Box>
                                </DialogContent>
                                <DialogActions sx={{ p: 4, backgroundColor: '#eff5ef', borderTop: '1px solid #e0e0e0', justifyContent: 'space-between' }}>
                                    <Button onClick={() => setVoucherDialogOpen(false)} sx={{ textTransform: 'none', color: 'white', ...DASHBOARD_STYLES.primaryButton, px: 4, py: 1.5 }}>Hủy</Button>
                                    <Button variant="contained" onClick={() => { setAppliedVoucher(vouchers.find(v => v.id === tempSelectedVoucherId) || null); setVoucherDialogOpen(false); }} disabled={!tempSelectedVoucherId} sx={{ textTransform: 'none', color: 'white', ...DASHBOARD_STYLES.primaryButton, px: 4, py: 1.5, '&:disabled': { background: '#e0e0e0', color: '#9e9e9e', boxShadow: 'none' } }}>Áp dụng</Button>
                                </DialogActions>
                            </Dialog>
                            <Divider sx={{ my: 2 }} />
                            <Stack spacing={0.5} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ color: COLORS.primary }}>Tạm tính</Typography>
                                    <Typography sx={{ color: COLORS.primary, fontWeight: 700 }}>{formatCurrency(subtotal)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ color: COLORS.primaryLight }}>Giảm giá (áp dụng ở Checkout)</Typography>
                                    <Typography sx={{ color: COLORS.primaryLight, fontWeight: 700 }}>- {formatCurrency(discount)}</Typography>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ color: COLORS.primary, fontWeight: 900 }}>Tổng cộng</Typography>
                                    <Typography sx={{ color: COLORS.primary, fontWeight: 900 }}>{formatCurrency(total)}</Typography>
                                </Box>
                            </Stack>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button variant="contained" sx={{ ...DASHBOARD_STYLES.primaryButton, color: 'white' }} onClick={() => navigate('/checkout')}>Thanh toán</Button>
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    )
}


