import React, {useMemo} from "react";
import {Box, Button, Card, CardContent, Divider, Stack, Typography} from "@mui/material";
import {CheckCircleOutline, HomeOutlined, ReceiptLongOutlined, ShoppingBagOutlined} from "@mui/icons-material";
import {useLocation, useNavigate} from "react-router-dom";
import {COLORS, DASHBOARD_STYLES} from "../../constants.js";

export default function PaymentConfirmation() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const {
        orderCode,
        total = 0,
        paymentMethod = "",
        items = [],
        shippingAddress = null,
    } = state || {};

    const formatCurrency = (v) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);

    const title = useMemo(() => (
        paymentMethod?.toLowerCase() === 'cod'
            ? 'Đặt hàng thành công'
            : 'Thanh toán thành công'
    ), [paymentMethod]);

    return (
        <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 2, mt: 2 }}>
            <Card sx={{ ...DASHBOARD_STYLES.paper }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack alignItems="center" spacing={1.5} sx={{ textAlign: 'center', mb: 2 }}>
                        <CheckCircleOutline sx={{ color: COLORS.success || '#2e7d32', fontSize: 48 }} />
                        <Typography variant="h5" fontWeight={800} sx={{ color: COLORS.primary }}>{title}</Typography>
                        <Typography variant="body2" sx={{ color: COLORS.primaryLight }}>
                            Cảm ơn bạn đã {paymentMethod?.toLowerCase() === 'cod' ? 'đặt hàng' : 'thanh toán'} tại PSGP Garden.
                        </Typography>
                        {orderCode && (
                            <Typography variant="subtitle2" sx={{ color: COLORS.primary, fontWeight: 700 }}>
                                Mã đơn: #{orderCode}
                            </Typography>
                        )}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={2}>
                        <Box sx={{ p: { xs: 1.5, sm: 2 }, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 2, border: `1px solid ${COLORS.primary}20` }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <ReceiptLongOutlined sx={{ color: COLORS.primary }} />
                                <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.primary }}>Thông tin đơn hàng</Typography>
                            </Stack>
                            <Stack spacing={0.5}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ color: COLORS.primaryLight }}>Phương thức</Typography>
                                    <Typography sx={{ color: COLORS.primary, fontWeight: 600 }}>{paymentMethod}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ color: COLORS.primaryLight }}>Tổng thanh toán</Typography>
                                    <Typography sx={{ color: COLORS.primary, fontWeight: 800 }}>{formatCurrency(total)}</Typography>
                                </Box>
                            </Stack>
                        </Box>

                        {shippingAddress && (
                            <Box sx={{ p: { xs: 1.5, sm: 2 }, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 2, border: `1px solid ${COLORS.primary}20` }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                    <HomeOutlined sx={{ color: COLORS.primary }} />
                                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.primary }}>Địa chỉ giao hàng</Typography>
                                </Stack>
                                <Typography variant="subtitle2" sx={{ color: COLORS.primary, fontWeight: 700 }}>{shippingAddress?.shippingAddress}</Typography>
                                <Typography variant="body2" sx={{ color: COLORS.primaryLight }}>{shippingAddress?.address}</Typography>
                            </Box>
                        )}

                        {!!items?.length && (
                            <Box sx={{ p: { xs: 1.5, sm: 2 }, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 2, border: `1px solid ${COLORS.primary}20` }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                    <ShoppingBagOutlined sx={{ color: COLORS.primary }} />
                                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.primary }}>Sản phẩm</Typography>
                                </Stack>
                                <Stack spacing={1}>
                                    {items.map((it) => (
                                        <Box key={`${it.id}-${it.size || 'default'}`} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography sx={{ color: COLORS.primary }}>{it.name} {it.size ? `(${it.size})` : ''}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ textTransform: 'none', color: 'white', ...DASHBOARD_STYLES.primaryButton }}
                            onClick={() => navigate('/')}
                        >
                            Tiếp tục mua sắm
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{ textTransform: 'none', color: COLORS.primary, borderColor: COLORS.primary }}
                            onClick={() => navigate('/buyer/checkout')}
                        >
                            Mua thêm
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}


