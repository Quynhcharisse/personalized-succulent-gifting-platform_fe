import {
    Add,
    DeleteOutline,
    HomeOutlined,
    PaymentOutlined,
    Remove,
    RoomServiceRounded,
    ShoppingCartOutlined
} from "@mui/icons-material";
import {Box, Button, Card, CardContent, Divider, IconButton, Stack, Typography, Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import React, {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";

import {COLORS, DASHBOARD_STYLES} from "../../constants.js";
import {useDispatch, useSelector} from "react-redux";
import axiosClient from "../../../config/APIConfig.jsx";
import {getWalletBalance} from "@/services/WalletService.jsx";
import {incrementQuantityBySize, removeItem} from "@/store/slices/cartSlice.js";
import useNotify from "../../../hooks/useNotify.js";
import {useSnackbar} from 'notistack';
import {checkAvailabilityProductsBySize} from "@/services/ProductService.jsx";

export default function Cart() {
    const items = useSelector((state) => state?.cart?.items || []);
    const hasItems = items.length > 0;
    const navigate = useNavigate();
    const dispatch = useDispatch();
 

    const isAuthenticated = useMemo(() => {
        return sessionStorage.getItem("user") != null;
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            window.location.href = "/login";
            return;
        }

    }, [isAuthenticated]);

    const subtotal = items.reduce((sum, i) => (sum + (Number(i?.price) || 0) * (i.quantity || 1)), 0);
  

    const formatCurrency = (v) => new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(v);

   

    return (
        <>
        
         
            <Box sx={{
                bgcolor: 'white',
                px: {xs: 1, sm: 2, md: 3},
                py: 2.5,
                borderRadius: 1,
                mb: 2,
                mt: 2,
                borderTop: '1px solid #e0e0e0'
            }}>

                <Card sx={{...DASHBOARD_STYLES.paper}}>
                    <CardContent sx={{p: {xs: 2, sm: 3}}}>
                        {/* Back to Home inside card (placed before Address Header) */}
                        <Box sx={{display: 'flex', justifyContent: 'flex-start', mb: 1}}>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<HomeOutlined/>}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 999,
                                    px: 1.5,
                                    color: COLORS.primary,
                                    borderColor: `${COLORS.primary}66`,
                                    backgroundColor: 'transparent',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        borderColor: COLORS.primary,
                                        backgroundColor: 'rgba(11,63,49,0.06)',
                                        boxShadow: 'none',
                                    },
                                    '& .MuiButton-startIcon': {mr: 0.75},
                                }}
                                onClick={() => navigate('/')}
                            >
                                Về trang chủ
                            </Button>
                        </Box>
                
                        {/* Table header */}
                        <Box sx={{
                            display: {xs: "none", md: "grid"},
                            gridTemplateColumns: "1fr 140px 160px 1fr 120px",
                            gap: 2,
                            px: 2,
                            py: 1.5,
                            backgroundColor: COLORS.primary,
                            borderRadius: 2,
                            color: 'white',
                            fontWeight: 600,
                            marginTop: 3
                        }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <ShoppingCartOutlined sx={{color: 'white', fontSize: 16}}/>
                                <Typography variant="body2" fontWeight={700} sx={{color: 'white'}}>SẢN PHẨM</Typography>
                            </Stack>
                            <Typography variant="body2" fontWeight={700} textAlign="right"  sx={{color: 'white'}}>Số lượng</Typography>
                            <Typography variant="body2" fontWeight={700} textAlign="right"  sx={{color: 'white'}}>Size</Typography>
                            <Typography variant="body2" fontWeight={700} textAlign="right"  sx={{color: 'white'}}>Giá tiền 1 sản phẩm (VNĐ)</Typography>
                            <Typography variant="body2" fontWeight={700} textAlign="right"  sx={{color: 'white'}}>Thao tác</Typography>
                        </Box>

                        <Divider sx={{my: 1}}/>

                        {/* Product rows */}
                        <Stack direction="column" spacing={1}>
                            {items.map((item) => (
                                <Box key={`${item.id}-${item.size}`} sx={{
                                    display: {xs: "block", sm: "block", md: "grid"},
                                    gridTemplateColumns: "1fr 140px 160px 1fr 120px",
                                    gap: 2,
                                    alignItems: "center",
                                    px: {xs: 1.5, sm: 2},
                                    py: 1.5,
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    borderRadius: 2,
                                    border: `1px solid ${COLORS.primary}20`,
                                    '&:hover': {
                                        backgroundColor: 'rgba(11,63,49,0.05)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(11,63,49,0.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}>
                                    {/* Mobile */}
                                    <Box sx={{display: {xs: 'block', sm: 'block', md: 'none'}}}>
                                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{mb: 1.5}}>
                                            <img src={item.image || '/placeholder.jpg'} alt={item.name} style={{
                                                width: 48,
                                                height: 48,
                                                objectFit: "cover",
                                                borderRadius: 8,
                                                border: `2px solid ${COLORS.primary}20`
                                            }}/>
                                            <Box sx={{flex: 1}}>
                                                <Typography variant="subtitle2" sx={{
                                                    lineHeight: 1.3,
                                                    color: COLORS.primary,
                                                    fontWeight: 600
                                                }}>{item.name}</Typography>
                                            </Box>
                                        </Stack>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Box>
                                                <Typography variant="body2"
                                                            sx={{color: COLORS.primaryLight, fontSize: '0.875rem'}}>Số
                                                    lượng</Typography>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <IconButton size="small" disabled={(item.quantity || 1) <= 1}
                                                                onClick={() => dispatch(incrementQuantityBySize({
                                                                    id: item.id,
                                                                    size: item.size,
                                                                    delta: -1
                                                                }))}>
                                                        <Remove fontSize="small"/>
                                                    </IconButton>
                                                    <Typography variant="body2" sx={{
                                                        color: COLORS.primary,
                                                        fontWeight: 600,
                                                        minWidth: 20,
                                                        textAlign: 'center'
                                                    }}>{item.quantity || 1}</Typography>
                                                    <IconButton size="small"
                                                                onClick={() => dispatch(incrementQuantityBySize({
                                                                    id: item.id,
                                                                    size: item.size,
                                                                    delta: 1
                                                                }))}>
                                                        <Add fontSize="small"/>
                                                    </IconButton>
                                                </Stack>
                                            </Box>
                                            <Box sx={{textAlign: 'right'}}>
                                                <Typography variant="body2"
                                                            sx={{color: COLORS.primaryLight, fontSize: '0.875rem'}}>Thành
                                                    tiền</Typography>
                                                <Typography variant="subtitle2" fontWeight={700}
                                                            sx={{color: COLORS.primary}}>{formatCurrency(item.price || 0)}</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 1}}>
                                            <Box>
                                                <Typography variant="body2" sx={{
                                                    color: COLORS.primaryLight,
                                                    fontSize: '0.875rem'
                                                }}>Size</Typography>
                                                <Typography variant="body2" sx={{
                                                    color: COLORS.primary,
                                                    fontWeight: 600
                                                }}>{item.size}</Typography>
                                            </Box>
                                            <IconButton color="error" aria-label="Xóa khỏi giỏ"
                                                        onClick={() => dispatch(removeItem({
                                                            id: item.id,
                                                            size: item.size
                                                        }))}>
                                                <DeleteOutline/>
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    {/* Desktop */}
                                    <Box sx={{display: {xs: 'none', sm: 'none', md: 'contents'}}}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <img src={item.image || '/placeholder.jpg'} alt={item.name} style={{
                                                width: 56,
                                                height: 56,
                                                objectFit: "cover",
                                                borderRadius: 8,
                                                border: `2px solid ${COLORS.primary}20`
                                            }}/>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{
                                                    lineHeight: 1.3,
                                                    color: COLORS.primary,
                                                    fontWeight: 600
                                                }}>{item.name}</Typography>
                                                <Typography variant="caption"
                                                            sx={{color: COLORS.primaryLight}}>{item.shop}</Typography>
                                            </Box>
                                        </Stack>
                                        <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <IconButton size="small" disabled={(item.quantity || 1) <= 1}
                                                            onClick={() => dispatch(incrementQuantityBySize({
                                                                id: item.id,
                                                                size: item.size,
                                                                delta: -1
                                                            }))}>
                                                    <Remove fontSize="small"/>
                                                </IconButton>
                                                <Typography variant="body2" sx={{
                                                    color: COLORS.primary,
                                                    fontWeight: 600,
                                                    minWidth: 24,
                                                    textAlign: 'center'
                                                }}>{item.quantity || 1}</Typography>
                                                <IconButton size="small"
                                                            onClick={() => dispatch(incrementQuantityBySize({
                                                                id: item.id,
                                                                size: item.size,
                                                                delta: 1
                                                            }))}>
                                                    <Add fontSize="small"/>
                                                </IconButton>
                                            </Stack>
                                        </Box>
                                        <Typography variant="body2" textAlign="right" sx={{
                                            color: COLORS.primary,
                                            fontWeight: 600
                                        }}>{item.size}</Typography>
                                        <Typography variant="subtitle2" textAlign="right" fontWeight={700}
                                                    sx={{color: COLORS.primary}}>{formatCurrency(item.price || 0)}</Typography>
                                        <Box sx={{textAlign: 'right'}}>
                                            <IconButton color="error" aria-label="Xóa khỏi giỏ"
                                                        onClick={() => dispatch(removeItem({
                                                            id: item.id,
                                                            size: item.size
                                                        }))}>
                                                <DeleteOutline/>
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>

                        <Divider sx={{my: 2}}/>

                        {/* Totals */}
                        <Box sx={{
                            mb: 4,
                            p: {xs: 1.5, sm: 2},
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            borderRadius: 2,
                            border: `1px solid ${COLORS.primary}20`
                        }}>
                            <Stack spacing={1}>
                                <Row label="Tạm tính" value={formatCurrency(subtotal)} bold/>
                              
                            
                            </Stack>
                        </Box>
                        <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                sx={{
                                    mt: 2,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    color: 'white', ...DASHBOARD_STYLES.primaryButton,
                                    fontSize: {xs: '0.9rem', sm: '1rem'},
                                    py: {xs: 1.5, sm: 2},
                                    '&.Mui-disabled': {background: '#e0e0e0', color: '#9e9e9e', boxShadow: 'none'}
                                }}
                                disabled={!hasItems }
                                onClick={() => navigate('/checkout')}
                                >
                                MUA NGAY
                            </Button>
                    </CardContent>
                </Card>
            </Box>

      
        </>
    );
}

function Row({label, value, bold, xbold, small, positive}) {
    return (
        <Box sx={{display: "flex", justifyContent: "space-between", py: 0.5}}>
            <Typography sx={{
                color: positive ? 'success.main' : (small ? 'text.secondary' : COLORS.primary),
                fontWeight: xbold ? 900 : bold ? 600 : small ? 500 : 600,
                fontSize: small ? {xs: '0.75rem', sm: '0.875rem'} : {xs: '0.875rem', sm: '1rem'}
            }}>{label}</Typography>
            <Typography sx={{
                color: positive ? 'success.main' : (small ? 'text.secondary' : COLORS.primary),
                fontWeight: xbold ? 900 : bold ? 600 : small ? 600 : 600,
                fontSize: small ? {xs: '0.75rem', sm: '0.875rem'} : {xs: '0.875rem', sm: '1rem'}
            }}>{value}</Typography>
        </Box>
    );
}
