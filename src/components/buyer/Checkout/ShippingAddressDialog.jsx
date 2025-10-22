import { Dialog, DialogTitle, DialogContent, DialogActions, List, ListItemButton, ListItemText, Radio, Button, Stack, Typography, Box, Divider } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { COLORS, DASHBOARD_STYLES } from '../../constants.js';
import { getShippingAddresses } from '../../../services/ShippingAddressService.jsx';

const ShippingAddressDialog = ({ open, onClose, onCreate, onView, onSelect }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadAddresses = async () => {
            setLoading(true);
            try {
                const res = await getShippingAddresses();
                console.log('Address response:', res);
                const addressList = res?.data?.data || [];
                setAddresses(addressList)
                // Set first address as selected if available
                if (addressList.length > 0) {
                    setSelectedId(addressList[0].id);
                }
            } catch (error) {
                console.error('Error loading addresses:', error);
               
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            loadAddresses();
        }
    }, [open]);

    const handleApply = () => {
        const picked = addresses.find(a => a.id === selectedId);
        if (onSelect) onSelect(picked);
        if (onClose) onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: DASHBOARD_STYLES.dialog
                }
            }}
        >
            <DialogTitle sx={DASHBOARD_STYLES.dialogTitle}>
                Chọn Địa Chỉ Nhận Hàng
                <Typography variant="body2" sx={{opacity: 0.9, mt: 0.5, fontWeight: 400}}>
                    Chọn địa chỉ giao hàng phù hợp cho đơn hàng của bạn
                </Typography>
            </DialogTitle>
            
            <DialogContent sx={{...DASHBOARD_STYLES.dialogContent}}>
                <Box sx={DASHBOARD_STYLES.formSection}>
                    <Typography variant="h6" sx={DASHBOARD_STYLES.sectionTitle}>Danh sách địa chỉ</Typography>
                    <Divider sx={{mb: 2}}/>
                    
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" sx={{ color: COLORS.primaryLight }}>
                                Đang tải danh sách địa chỉ...
                            </Typography>
                        </Box>
                    ) : addresses.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" sx={{ color: COLORS.primaryLight }}>
                                Chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {addresses.map(addr => {
                            const selected = selectedId === addr.id;
                            return (
                                <Box
                                    key={addr.id}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        border: selected ? `2px solid ${COLORS.primary}` : '1px solid #e0e0e0',
                                        backgroundColor: selected ? `${COLORS.primary}10` : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: selected ? `${COLORS.primary}15` : '#f5f5f5',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        },
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 2
                                    }}
                                    onClick={() => setSelectedId(addr.id)}
                                >
                                    <Radio 
                                        checked={selected} 
                                        sx={{ 
                                            color: COLORS.primary,
                                            '&.Mui-checked': {
                                                color: COLORS.primary
                                            },
                                            mt: 0.5
                                        }} 
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                                            <Typography variant="subtitle1" fontWeight={600} sx={{ color: COLORS.primary }}>
                                                {addr.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: COLORS.primaryLight }}>
                                                •
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.primary }}>
                                                {addr.phone}
                                            </Typography>
                                            {addr.isDefault && (
                                                <Box
                                                    sx={{
                                                        px: 1.5,
                                                        py: 0.25,
                                                        backgroundColor: COLORS.success,
                                                        borderRadius: 1,
                                                        ml: 1
                                                    }}
                                                >
                                                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                                                        Mặc định
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                        <Typography variant="body2" sx={{ color: COLORS.primaryLight, lineHeight: 1.4 }}>
                                            {addr.address}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                        </Box>
                    )}
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
                    onClick={onClose} 
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
                    onClick={handleApply}
                    disabled={!selectedId || loading}
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
                    Sử dụng địa chỉ này
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShippingAddressDialog;


