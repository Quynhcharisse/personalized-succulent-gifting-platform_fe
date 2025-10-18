import React from 'react';
import {Dialog, DialogTitle, DialogContent, Box, Typography, Chip, Grid, Stack} from '@mui/material';
import ActionButton from "../../buttonCustom/ActionButton.jsx";
import { DASHBOARD_STYLES } from '../../constants.js';

export default function AccessoryDetail({ open, onClose, item }) {
    const val = item?.raw || {};
    // Lấy ảnh từ cấu trúc API chuẩn: image[0].url
    const image = Array.isArray(val.image) ? val.image.map(i => i?.url).filter(Boolean) : 
                   (Array.isArray(item?.image) ? item.image : []);
    
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
            <DialogTitle sx={{
                ...DASHBOARD_STYLES.dialogTitle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Chi tiết phụ kiện
                </Typography>

                <ActionButton
                    action="cancel"
                    onClick={onClose}
                    sx={{
                        alignSelf: 'flex-end',
                        minWidth: 'auto',
                        px: 2,
                        py: 0.5
                    }}
                />
            </DialogTitle>
            <DialogContent sx={DASHBOARD_STYLES.dialogContent}>
                <Box sx={{
                    m: { xs: 2, sm: 3 },
                    p: { xs: 2.5, sm: 4 },
                    pt: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    backgroundColor: 'white',
                    border: '1px solid rgba(76,175,80,0.12)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
                }}>
                {!item ? (
                    <Typography color="text.secondary">Không có dữ liệu</Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{
                            p: 2.5,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #ffffff 0%, #f0fff6 100%)',
                            border: '1px solid rgba(76,175,80,0.15)'
                        }}>
                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#0b3f31' }}>{item.name}</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                <Chip 
                                    label={item.category} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ 
                                        fontWeight: 700,
                                        color: '#0b3f31',
                                        borderColor: '#0b3f31'
                                    }}
                                />
                                <Chip 
                                    label={item.status === 'ACTIVE' ? 'Còn hàng' : 'Hết hàng'} 
                                    size="small" 
                                    sx={{ 
                                        fontWeight: 700,
                                        backgroundColor: item.status === 'ACTIVE' ? '#22c55e' : '#ef4444',
                                        color: 'white'
                                    }}
                                />
                            </Stack>
                        </Box>

                        {/* Images */}
                        <Box sx={{
                            p: 2,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                            border: '1px solid rgba(33,150,243,0.12)'
                        }}>
                            <Typography sx={{ fontWeight: 800, mb: 1, color: 'text.secondary' }}>Hình ảnh</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {image.length > 0 ? image.map((src, idx) => (
                                    /^https?:\/\//i.test(src) ? (
                                        <img key={idx} src={src} alt={`img-${idx}`} style={{ width: 92, height: 92, objectFit: 'cover', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                    ) : (
                                        <Box key={idx} sx={{ p: 1, border: '1px dashed #ddd', borderRadius: 1, fontSize: 12 }}>{src}</Box>
                                    )
                                )) : (
                                    <Typography color="text.secondary">Không có ảnh</Typography>
                                )}
                            </Stack>
                        </Box>

                        {/* By category */}
                        {item.category === 'pots' && (
                            <Box sx={{ p: 2, borderRadius: 3, background: 'linear-gradient(135deg, #ffffff 0%, #fdfcf7 100%)', border: '1px solid rgba(255,193,7,0.15)'}}>
                                <Typography sx={{ fontWeight: 800, mb: 1, color: '#0b3f31' }}>Thuộc tính chậu</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                    <Typography>Màu sắc:</Typography>
                                    {val.color ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 22, height: 22, borderRadius: 1, border: '1px solid rgba(0,0,0,0.2)', backgroundColor: val.color }} />
                                            <Typography sx={{ fontFamily: 'monospace', fontWeight: 800 }}>{val.color}</Typography>
                                        </Box>
                                    ) : (
                                        <Typography>-</Typography>
                                    )}
                                </Box>
                                <Typography>Chất liệu: {val.material || '-'}</Typography>
                                <Typography>Mô tả: {val.description || '-'}</Typography>
                                <Box sx={{ mt: 1 }}>
                                    <Typography sx={{ fontWeight: 800, mb: 1 }}>Kích thước</Typography>
                                    <Grid container spacing={1}>
                                        {(val.size || []).map((s, i) => (
                                            <Grid item xs={12} sm={6} md={4} key={i}>
                                                <Box sx={{ p: 1.5, border: '1px solid rgba(76,175,80,0.18)', borderRadius: 2, background: 'rgba(76,175,80,0.03)'}}>
                                                    <Typography sx={{ fontWeight: 800, color: '#0b3f31', mb: 0.5 }}>{s.name}</Typography>
                                                    <Typography>Giá: {s.price?.toLocaleString('vi-VN')} ₫</Typography>
                                                    <Typography>Kho: {s.availableQty}</Typography>
                                                    <Typography>Khối lượng đất tối đa: {s.maxSoilMassValue}</Typography>
                                                    <Typography>Miệng chậu: {s.potUpperCrossSectionArea}</Typography>
                                                    <Typography>Chiều cao: {s.potHeight}</Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </Box>
                        )}

                        {item.category === 'decorations' && (
                            <Box sx={{ p: 2, borderRadius: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f7fbff 100%)', border: '1px solid rgba(33,150,243,0.12)'}}>
                                <Typography sx={{ fontWeight: 800, mb: 1, color: '#0b3f31' }}>Thuộc tính trang trí</Typography>
                                <Typography>Mô tả: {val.description || '-'}</Typography>
                                <Typography>Giá: {val.price?.toLocaleString('vi-VN')} ₫</Typography>
                                <Typography>Kho: {val.availableQty}</Typography>
                            </Box>
                        )}

                        {item.category === 'soils' && (
                            <Box sx={{ p: 2, borderRadius: 3, background: 'linear-gradient(135deg, #ffffff 0%, #fff8f8 100%)', border: '1px solid rgba(244,67,54,0.12)'}}>
                                <Typography sx={{ fontWeight: 800, mb: 1, color: '#0b3f31' }}>Thuộc tính đất</Typography>
                                <Typography>Mô tả: {val.description || '-'}</Typography>
                                <Typography>Kho khối lượng: {val.availableMassValue}</Typography>
                                <Typography>Giá cơ sở: {val.basePricing?.price?.toLocaleString('vi-VN')} ₫ / {val.basePricing?.massValue} {val.basePricing?.massUnit}</Typography>
                            </Box>
                        )}
                    </Box>
                )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}


