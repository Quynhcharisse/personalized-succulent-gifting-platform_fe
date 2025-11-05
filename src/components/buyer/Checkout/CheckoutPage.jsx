import { RoomServiceRounded, LocalActivityOutlined, ShoppingCartOutlined, PaymentOutlined, DeleteOutline } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Divider, Stack, Typography, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItemButton, ListItemText, Radio, RadioGroup, FormControlLabel, IconButton } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ShippingAddressDialog from "./ShippingAddressDialog.jsx";
import { COLORS, DASHBOARD_STYLES } from "../../constants.js";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../../../config/APIConfig.jsx";
import { getDefaultShippingAddress } from "../../../services/ShippingAddressService.jsx";
import { getWalletBalance } from "../../../services/WalletService.jsx";
import { removeItem } from "../../../store/slices/cartSlice.js";

export default function CheckoutPage() {

  const items = useSelector(state => state?.cart?.items || []);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showDialog, setShowDialog] = useState(false);

  // Shipping address (mock)
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);

  useEffect(() => {
    const loadDefaultAddress = async () => {
      setLoadingAddress(true);
      try {
        const res = await getDefaultShippingAddress();
        const data = res?.data?.data;
        console.log(data);
        if (data) {
          setSelectedAddress({
            shippingAddress: data.shippingAddress || "",
            address: data.address || "",
            districtId : data.districtId || 0,
            wardCode : data.wardCode || ""
          });
          if (data && data.districtId && data.wardCode && items.length > 0) {
            const resFee = await axiosClient.post("/ghn/calculate/fee", {
              toDistrictId: data.districtId,
              wardCode: data.wardCode,
              itemNames: items.map(i => i.name) // mỗi item name mặc định 200g như backend
            });
            setShippingFee(resFee?.data?.data || 0);
          }          
        }
      } catch (err) {
        console.error("Load default address error", err);
      } finally {
        setLoadingAddress(false);
      }
    };
  
    loadDefaultAddress();
  }, []);
  
  // Mock data: danh sách sản phẩm
  // const items = [
  //   {
  //     id: 1,
  //     name: "Combo Nhện Sen Đá - Size S",
  //     price: 89000,
  //     quantity: 2,
  //     image:
  //       "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=800&auto=format&fit=crop",
  //     shop: "PSGP Garden",
  //   },
  //   {
  //     id: 3,
  //     name: "Đất trồng mix hữu cơ 1kg",
  //     price: 39000,
  //     quantity: 3,
  //     image:
  //       "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=800&auto=format&fit=crop",
  //     shop: "PSGP Garden",
  //   },
  // ];

  // Prices are stored directly on cart items; no external loading needed.

const [shippingFee, setShippingFee] = useState(0);
  const subtotal = items.reduce((sum, i) => {
    const unit = Number(i?.price) || 0;
    return sum + unit * (i.quantity || 1);
  }, 0);

  useEffect(() => {
    const updateFee = async () => {
      if (selectedAddress && items.length > 0) {
        const totalWeight = items.reduce((sum, i) => sum + (i.quantity || 1) * 200, 0);
      
        const resFee = await axiosClient.post("/ghn/calculate/fee", {
          toDistrictId: selectedAddress.districtId,
          wardCode: selectedAddress.wardCode,
          itemNames: items.map(i => i.name),
          weight: totalWeight
        });
      
        setShippingFee(resFee?.data?.data || 0);
      } else {
        setShippingFee(0);
      }
    };
  
    updateFee();
  }, [selectedAddress, items]);

  // Voucher removed
  const [walletBalance, setWalletBalance] = useState(0);
  const preWalletTotal = Math.max(0, subtotal) + Math.max(0, shippingFee);
  const walletDeduction = Math.min(walletBalance, preWalletTotal);
  const total = Math.max(0, preWalletTotal - walletDeduction);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const res = await getWalletBalance();
        const balance = Number(res?.data?.data) || 0;
        setWalletBalance(balance);
      } catch (e) {
        setWalletBalance(0);
      }
    };
    loadWallet();
  }, []);


  const formatCurrency = (v) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  return  (
    <>
    <Box
      sx={{
        bgcolor: 'white',
        px: { xs: 1, sm: 2, md: 3 },
        py: 2.5,
        borderRadius: 1,
        mb: 2,
        mt: 2,
        borderTop: '1px solid #e0e0e0',
      }}
    >
    {/* Combined checkout card */}
    <Card sx={{ ...DASHBOARD_STYLES.paper }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Shipping address section */}
        <Box 
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 140px 120px 160px" },
            gap: 2,
            px: { xs: 1, sm: 2 },
            py: 1.5,
            backgroundColor: COLORS.primary,
            borderRadius: 2,
            color: 'white',
            fontWeight: 600,
            marginTop: 3
          }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <RoomServiceRounded sx={{ color: 'white', fontSize: 16 }} />
            <Typography variant="body2" fontWeight={700} >ĐỊA CHỈ NHẬN HÀNG</Typography>
        </Stack>
        </Box>
        <Divider sx={{ my: 1 }} />

        <Box sx={{ p: { xs: 1.5, sm: 2 }, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 2, border: `1px solid ${COLORS.primary}20`, mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Box sx={{ flex: 1 }}>
            {loadingAddress ? (
  <Typography variant="subtitle2" fontWeight={600} sx={{ color: COLORS.primary }}>
    Đang tải địa chỉ...
  </Typography>
) : (
  <>
    <Typography variant="subtitle2" fontWeight={600} sx={{ color: COLORS.primary }}>
      {selectedAddress?.shippingAddress || "Chưa có địa chỉ"}
    </Typography>

    <Typography variant="body2" sx={{ mt: 0.5, color: COLORS.primaryLight }}>
      {selectedAddress?.address || ""}
    </Typography>
  </>
)}
            </Box>
        <Button
          size="small"
        sx={{
            textTransform: 'none',
                color: 'white', 
                fontWeight: 600, 
                ...DASHBOARD_STYLES.primaryButton,
                alignSelf: { xs: 'flex-end', sm: 'auto' }
              }} 
              onClick={() => setShowDialog(true)}
            >
              THAY ĐỔI
            </Button>
          </Box>
        </Box>
        <Divider sx={{  my: 1, borderBottomWidth: 2, borderColor: COLORS.primary }} />
          {/* Header row */}
     
            <Box
              sx={{
                display: { xs: "none", md: "grid" },
                gridTemplateColumns: "1fr 140px 160px 1fr 120px",
                gap: 2,
                px: 2,
                py: 1.5,
                backgroundColor: COLORS.primary,
                borderRadius: 2,
                color: 'white',
                fontWeight: 600,
                marginTop: 3
              }}
            >
        <Stack direction="row" alignItems="center" spacing={1}>
                <ShoppingCartOutlined sx={{ color: 'white', fontSize: 16 }} />
                <Typography variant="body2" fontWeight={700}>SẢN PHẨM</Typography>
        </Stack>
              <Typography variant="body2" fontWeight={700} textAlign="right">Số lượng</Typography>
              <Typography variant="body2" fontWeight={700} textAlign="right">Size</Typography>
              <Typography variant="body2" fontWeight={700} textAlign="right">Thành tiền</Typography>
              <Typography variant="body2" fontWeight={700} textAlign="right">Thao tác</Typography>
            </Box>
        
          <Divider sx={{ my: 1 }} />

          {/* Product rows */}
          <Stack direction="column" spacing={1}>
            {items.map((item) => (
              <Box
              key={`${item.id}-${item.size}`}
              sx={{
                  display: { xs: "block", sm: "block", md: "grid" },
                  gridTemplateColumns: "1fr 140px 160px 1fr 120px",
                  gap: 2,
                  alignItems: "center",
                  px: { xs: 1.5, sm: 2 },
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
                }}
              >
                {/* Mobile layout */}
                <Box sx={{ display: { xs : 'block', sm: 'block', md: 'none' } }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: `2px solid ${COLORS.primary}20` }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ lineHeight: 1.3, color: COLORS.primary, fontWeight: 600 }}>{item.name}</Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.primaryLight, fontSize: '0.875rem' }}>Số lượng</Typography>
                      <Typography variant="body2" sx={{ color: COLORS.primary, fontWeight: 600 }}>{item.quantity || 1}</Typography>
                    </Box>
                  
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ color: COLORS.primaryLight, fontSize: '0.875rem' }}>Thành tiền</Typography>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: COLORS.primary }}>
                      {formatCurrency(item.price || 0)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.primaryLight, fontSize: '0.875rem' }}>Size</Typography>
                      <Typography variant="body2" sx={{ color: COLORS.primary, fontWeight: 600 }}>{item.size}</Typography>
                    </Box>
                    <IconButton color="error" aria-label="Xóa khỏi giỏ" onClick={() => dispatch(removeItem({ id: item.id, size: item.size }))}>
                      <DeleteOutline />
                    </IconButton>
                  </Box>
                </Box>

                {/* Desktop layout */}
                <Box sx={{ display: { xs: 'none', sm: 'none', md: 'contents' } }}>
                  {/* Product column */}
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: `2px solid ${COLORS.primary}20` }}
                    />
                    <Box>
                      <Typography variant="subtitle2" sx={{ lineHeight: 1.3, color: COLORS.primary, fontWeight: 600 }}>{item.name}</Typography>
                      <Typography variant="caption" sx={{ color: COLORS.primaryLight }}>{item.shop}</Typography>
                    </Box>
        </Stack>

                  {/* Quantity */}
                  <Typography variant="body2" textAlign="right" sx={{ color: COLORS.primary, fontWeight: 600 }}>{item.quantity || 1}</Typography>

                  {/* Size */}
                  <Typography variant="body2" textAlign="right" sx={{ color: COLORS.primary, fontWeight: 600 }}>{item.size}</Typography>
                
                  {/* Line total */}
                  <Typography variant="subtitle2" textAlign="right" fontWeight={700} sx={{ color: COLORS.primary }}>
                   {formatCurrency(item.price || 0)}
                  </Typography>

                  {/* Actions */}
                  <Box sx={{ textAlign: 'right' }}>
                    <IconButton color="error" aria-label="Xóa khỏi giỏ" onClick={() => dispatch(removeItem({ id: item.id, size: item.size }))}>
                      <DeleteOutline />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
      </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Voucher removed */}

          {/* Totals */}
          <Box sx={{ marginBottom: 4, p: { xs: 1.5, sm: 2 }, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 2, border: `1px solid ${COLORS.primary}20` }}>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                <Typography sx={{ color: COLORS.primary, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Tạm tính</Typography>
                <Typography sx={{ color: COLORS.primary, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{formatCurrency(subtotal)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                <Typography sx={{ color: COLORS.primary, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Phí vận chuyển</Typography>
                <Typography sx={{ color: COLORS.primary, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{formatCurrency(shippingFee)}</Typography>
              </Box>
              {walletDeduction > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                  <Typography sx={{ color: COLORS.success, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Thanh toán qua ví</Typography>
                  <Typography sx={{ color: COLORS.success, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>- {formatCurrency(walletDeduction)}</Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                <Typography sx={{ color: COLORS.primaryLight, fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Số dư ví khả dụng</Typography>
                <Typography sx={{ color: COLORS.primaryLight, fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{formatCurrency(walletBalance)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", py: 1.5, backgroundColor: 'white' }}>
                <Typography fontWeight={900} sx={{ color: COLORS.primary, fontSize: { xs: '1rem', sm: '1.2rem' } }}>Tổng thanh toán</Typography>
                <Typography fontWeight={900} sx={{ color: COLORS.primary, fontSize: { xs: '1rem', sm: '1.2rem' } }}>{formatCurrency(total)}</Typography>
              </Box>
        </Stack>
          </Box>
        
          <Divider sx={{ my: 1, borderBottomWidth: 2, borderColor: COLORS.primary }} />
          {/* Payment method section */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 140px 120px 160px" },
                gap: 2,
                px: { xs: 1, sm: 2 },
                py: 1.5,
                backgroundColor: COLORS.primary,
                borderRadius: 2,
                color: 'white',
                fontWeight: 600,
              }}>
             <Stack direction="row" alignItems="center" spacing={1}>
               <PaymentOutlined sx={{ color: "white", fontSize: 16 }} />
               <Typography variant="body2" fontWeight={700} >PHƯƠNG THỨC THANH TOÁN</Typography>
              </Stack>
              </Box>
             <Divider sx={{ my: 1 }} />
             <Box sx={{ p: { xs: 1.5, sm: 2 }, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 2, border: `1px solid ${COLORS.primary}20`, mb: 3 }}>
              <Typography sx={{ color: COLORS.primary, fontWeight: 600 }}>
                Thanh toán Online
              </Typography>
            </Box>
        
            <Divider sx={{  my: 1, borderBottomWidth: 2, borderColor: COLORS.primary }} />

              <Button 
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ 
                mt: 2, 
                textTransform: 'none', 
                fontWeight: 700, 
                color: 'white', 
                ...DASHBOARD_STYLES.primaryButton,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                py: { xs: 1.5, sm: 2 }
              }}
              onClick={() => {
                const orderCode = Math.random().toString(36).slice(2, 8).toUpperCase();
                navigate('/buyer/payment', {
                  state: {
                    orderCode,
                    total,
                    items,
                    shippingAddress: selectedAddress,
                    subtotal,
                    shippingFee,
                    walletDeduction,
                  }
                });
              }}
            >
              ĐẶT HÀNG — {formatCurrency(total)}
            </Button>
          </Box>
</CardContent>
      </Card>
    </Box>
    <ShippingAddressDialog 
      open={showDialog} 
      onClose={() => setShowDialog(false)} 
      onSelect={(addr) => setSelectedAddress(addr)}
    />
    </>
    );
}
