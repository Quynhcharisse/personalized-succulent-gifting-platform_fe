import { RoomServiceRounded, LocalActivityOutlined, ShoppingCartOutlined, PaymentOutlined } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Divider, Stack, Typography, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItemButton, ListItemText, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ShippingAddressDialog from "./ShippingAddressDialog";
import { COLORS, DASHBOARD_STYLES } from "../../constants.js";

export default function CheckoutPage() {

  const [showDialog, setShowDialog] = useState(false);

  // Shipping address (mock)
  const [selectedAddress, setSelectedAddress] = useState({
    name: "Trần Văn Hứa Trí",
    phone: "0886 122 578",
    address: "Ký túc xá ĐHQG TP.HCM, Khu B, P. Đông Hòa, TP. Dĩ An, Bình Dương",
  });

  // Mock data: danh sách sản phẩm
  const items = [
    {
      id: 1,
      name: "Combo Nhện Sen Đá - Size S",
      price: 89000,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=800&auto=format&fit=crop",
      shop: "PSGP Garden",
    },
    {
      id: 3,
      name: "Đất trồng mix hữu cơ 1kg",
      price: 39000,
      quantity: 3,
      image:
        "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=800&auto=format&fit=crop",
      shop: "PSGP Garden",
    },
  ];

  const shippingFee = 32800;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Mock vouchers
  const vouchers = [
    {
      id: 1,
      code: "PSGP10",
      title: "Giảm 10% cho đơn từ 150K",
      type: "percent", // percent | fixed
      value: 10, // %
      minOrder: 150000,
      maxDiscount: 40000,
    },
    {
      id: 2,
      code: "FREESHIP",
      title: "Giảm 30K phí vận chuyển cho đơn từ 200K",
      type: "fixed",
      value: 30000,
      minOrder: 200000,
      appliesTo: "shipping", // shipping | subtotal
    },
    {
      id: 3,
      code: "PSGP50K",
      title: "Giảm 50K cho đơn từ 350K",
      type: "fixed",
      value: 50000,
      minOrder: 350000,
      appliesTo: "subtotal",
    },
  ];

  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
  const [tempSelectedVoucherId, setTempSelectedVoucherId] = useState("");

  const computeVoucherDiscount = () => {
    if (!appliedVoucher) return { discountOnSubtotal: 0, discountOnShipping: 0 };
    if (subtotal < (appliedVoucher.minOrder || 0)) return { discountOnSubtotal: 0, discountOnShipping: 0 };

    if (appliedVoucher.type === "percent") {
      const raw = Math.floor((subtotal * appliedVoucher.value) / 100);
      const capped = Math.min(raw, appliedVoucher.maxDiscount || raw);
      return { discountOnSubtotal: capped, discountOnShipping: 0 };
    }

    // fixed discount
    if (appliedVoucher.appliesTo === "shipping") {
      return { discountOnSubtotal: 0, discountOnShipping: Math.min(appliedVoucher.value, shippingFee) };
    }
    return { discountOnSubtotal: Math.min(appliedVoucher.value, subtotal), discountOnShipping: 0 };
  };

  const { discountOnSubtotal, discountOnShipping } = computeVoucherDiscount();
  const total = Math.max(0, subtotal - discountOnSubtotal) + Math.max(0, shippingFee - discountOnShipping);

  // Payment methods (mock)
  const paymentMethods = [
    { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
    { id: 'momo', label: 'MoMo E-Wallet' },
    { id: 'bank', label: 'Chuyển khoản ngân hàng' },
  ];
  const [selectedPayment, setSelectedPayment] = useState('cod');

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
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: COLORS.primary }}>{selectedAddress.name} - {selectedAddress.phone}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: COLORS.primaryLight }}>{selectedAddress.address}</Typography>
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
                gridTemplateColumns: "1fr 140px 120px 160px",
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
              <Typography variant="body2" fontWeight={700} textAlign="right">Đơn giá</Typography>
              <Typography variant="body2" fontWeight={700} textAlign="center">Số lượng</Typography>
              <Typography variant="body2" fontWeight={700} textAlign="right">Thành tiền</Typography>
            </Box>
        
          <Divider sx={{ my: 1 }} />

          {/* Product rows */}
          <Stack direction="column" spacing={1}>
            {items.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: { xs: "block", sm: "block", md: "grid" },
                  gridTemplateColumns: { sm: "1fr 140px 120px 160px" },
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
                      src={item.image}
                      alt={item.name}
                      style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: `2px solid ${COLORS.primary}20` }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ lineHeight: 1.3, color: COLORS.primary, fontWeight: 600 }}>{item.name}</Typography>
                      <Typography variant="caption" sx={{ color: COLORS.primaryLight }}>{item.shop}</Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: COLORS.primaryLight, fontSize: '0.875rem' }}>Đơn giá</Typography>
                      <Typography variant="body2" sx={{ color: COLORS.primary, fontWeight: 600 }}>{formatCurrency(item.price)}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: COLORS.primaryLight, fontSize: '0.875rem' }}>Số lượng</Typography>
                      <Typography variant="body2" sx={{ color: COLORS.primary, fontWeight: 600 }}>{item.quantity}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ color: COLORS.primaryLight, fontSize: '0.875rem' }}>Thành tiền</Typography>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: COLORS.primary }}>
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Desktop layout */}
                <Box sx={{ display: { xs: 'none', sm: 'none', md: 'contents' } }}>
                  {/* Product column */}
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: `2px solid ${COLORS.primary}20` }}
                    />
                    <Box>
                      <Typography variant="subtitle2" sx={{ lineHeight: 1.3, color: COLORS.primary, fontWeight: 600 }}>{item.name}</Typography>
                      <Typography variant="caption" sx={{ color: COLORS.primaryLight }}>{item.shop}</Typography>
                    </Box>
        </Stack>

                  {/* Unit price */}
                  <Typography variant="body2" textAlign="right" sx={{ color: COLORS.primary, fontWeight: 600 }}>{formatCurrency(item.price)}</Typography>

                  {/* Quantity */}
                  <Typography variant="body2" textAlign="center" sx={{ color: COLORS.primary, fontWeight: 600 }}>{item.quantity}</Typography>

                  {/* Line total */}
                  <Typography variant="subtitle2" textAlign="right" fontWeight={700} sx={{ color: COLORS.primary }}>
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </Box>
              </Box>
            ))}
      </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Voucher section */}
          <Box sx={{ p: { xs: 1.5, sm: 2 }, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 2, border: `1px solid ${COLORS.primary}20`, mb: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              mb: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 }
            }}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <LocalActivityOutlined sx={{ color: COLORS.primary, fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.primary }}>VOUCHER CỦA SHOP</Typography>
              </Stack>
              <Button 
                variant="text" 
                onClick={() => { setTempSelectedVoucherId(appliedVoucher?.id || ""); setVoucherDialogOpen(true); }} 
                sx={{ 
                  color: 'white', 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  ...DASHBOARD_STYLES.primaryButton,
                  alignSelf: { xs: 'stretch', sm: 'auto' }
                }}
              >
                CHỌN VOUCHER
              </Button>
            </Box>
            {appliedVoucher && (
              <Typography variant="body2" sx={{ mt: 1, color: COLORS.primary, fontWeight: 600 }}>
                Đã áp dụng: {appliedVoucher.code} — {appliedVoucher.title}
              </Typography>
            )}
          </Box>

          {/* Voucher dialog */}
          <Dialog 
            open={voucherDialogOpen} 
            onClose={() => setVoucherDialogOpen(false)} 
            maxWidth="md" 
            fullWidth
            slotProps={{
              paper: {
                sx: DASHBOARD_STYLES.dialog
              }
            }}
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
                    const selected = tempSelectedVoucherId === v.id;
                    const reachable = subtotal >= (v.minOrder || 0);
                    return (
                      <Box
                        key={v.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: selected ? `2px solid ${COLORS.primary}` : '1px solid #e0e0e0',
                          backgroundColor: selected ? `${COLORS.primary}10` : 'white',
                          cursor: reachable ? 'pointer' : 'not-allowed',
                          opacity: reachable ? 1 : 0.6,
                          transition: 'all 0.2s ease',
                          '&:hover': reachable ? {
                            backgroundColor: selected ? `${COLORS.primary}15` : '#f5f5f5',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          } : {},
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2
                        }}
                        onClick={() => reachable && setTempSelectedVoucherId(v.id)}
                      >
                        <Radio 
                          checked={selected} 
                          disabled={!reachable}
                          sx={{ 
                            color: COLORS.primary,
                            '&.Mui-checked': {
                              color: COLORS.primary
                            }
                          }} 
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ color: COLORS.primary }}>
                              {v.code}
                            </Typography>
                            <Typography variant="body2" sx={{ color: COLORS.primaryLight }}>
                              —
                            </Typography>
                            <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.primary }}>
                              {v.title}
                            </Typography>
                          </Box>
                          {!reachable && (
                            <Typography variant="caption" sx={{ color: 'error.main' }}>
                              Đơn tối thiểu {formatCurrency(v.minOrder)}
                            </Typography>
                          )}
                          {v.type === 'percent' && (
                            <Typography variant="caption" sx={{ color: COLORS.primaryLight, display: 'block' }}>
                              Giảm tối đa {formatCurrency(v.maxDiscount || 0)}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: COLORS.primary }}>
                            {v.type === 'percent' ? `${v.value}%` : formatCurrency(v.value)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </DialogContent>
            
            <DialogActions
              sx={{
                p: 4,
                backgroundColor: '#eff5ef',
                borderTop: '1px solid #e0e0e0',
                justifyContent: 'space-between'
              }}
            >
              <Button 
                onClick={() => setVoucherDialogOpen(false)} 
                sx={{ 
                  textTransform: "none", 
                  color: 'white', 
                  ...DASHBOARD_STYLES.primaryButton,
                  px: 4,
                  py: 1.5
                }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setAppliedVoucher(vouchers.find((v) => v.id === tempSelectedVoucherId) || null);
                  setSelectedVoucherId(tempSelectedVoucherId);
                  setVoucherDialogOpen(false);
                }}
                disabled={!tempSelectedVoucherId}
                sx={{ 
                  textTransform: "none", 
                  color: 'white', 
                  ...DASHBOARD_STYLES.primaryButton,
                  px: 4,
                  py: 1.5,
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e',
                    boxShadow: 'none'
                  }
                }}
              >
                Áp dụng
              </Button>
            </DialogActions>
          </Dialog>

          {/* Totals */}
          <Box sx={{ marginBottom: 4, p: { xs: 1.5, sm: 2 }, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 2, border: `1px solid ${COLORS.primary}20` }}>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                <Typography sx={{ color: COLORS.primary, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Tạm tính</Typography>
                <Typography sx={{ color: COLORS.primary, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{formatCurrency(subtotal)}</Typography>
              </Box>
              {discountOnSubtotal > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                  <Typography sx={{ color: COLORS.success, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Giảm giá</Typography>
                  <Typography sx={{ color: COLORS.success, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>- {formatCurrency(discountOnSubtotal)}</Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                <Typography sx={{ color: COLORS.primary, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Phí vận chuyển</Typography>
                <Typography sx={{ color: COLORS.primary, fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  {discountOnShipping > 0
                    ? `${formatCurrency(shippingFee)} → ${formatCurrency(Math.max(0, shippingFee - discountOnShipping))}`
                    : formatCurrency(shippingFee)}
                </Typography>
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
              <RadioGroup
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
              >
                {paymentMethods.map((pm) => (
                  <FormControlLabel
                    key={pm.id}
                    value={pm.id}
                    control={<Radio sx={{ color: COLORS.primary }} />}
                    label={<Typography sx={{ color: COLORS.primary, fontWeight: 600 }}>{pm.label}</Typography>}
                    sx={{ mb: 1 }}
                  />)
                )}
              </RadioGroup>
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
              onClick={() => alert(`Đặt hàng thành công!\nPhương thức: ${paymentMethods.find(p=>p.id===selectedPayment)?.label}\nTổng tiền: ${formatCurrency(total)}`)}
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
