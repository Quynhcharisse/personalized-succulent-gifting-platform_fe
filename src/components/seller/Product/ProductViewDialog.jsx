import React from 'react';
import {Box, Chip, Dialog, DialogContent, DialogTitle, Grid, Paper, Typography} from '@mui/material';
import {Inventory as InventoryIcon} from '@mui/icons-material';
import ActionButton from "../../buttonCustom/ActionButton.jsx";
import {DASHBOARD_STYLES} from '../../constants.js';

const ProductViewDialog = ({
                               open,
                               onClose,
                               selectedProduct,
                               getStatusLabel,
                               getStatusColor,
                               calculateSizePrice,
                               handleEditProduct
                           }) => {
    if (!selectedProduct) return null;

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
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <InventoryIcon sx={{fontSize: '2rem'}}/>
                    <Typography variant="h6" sx={{fontWeight: 600}}>
                        Chi Tiết Sản Phẩm: {selectedProduct.name}
                    </Typography>
                </Box>

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
                    m: {xs: 2, sm: 3},
                    p: {xs: 2.5, sm: 4},
                    pt: {xs: 2, sm: 3},
                    borderRadius: 3,
                    backgroundColor: 'white',
                    border: '1px solid rgba(76,175,80,0.12)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
                }}>
                    {/* Basic Info */}
                    <Box sx={{
                        p: 2.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0fff6 100%)',
                        border: '1px solid rgba(76,175,80,0.15)',
                        mb: 3
                    }}>
                        <Typography variant="h6" sx={{fontWeight: 800, mb: 2, color: '#0b3f31'}}>
                            Thông tin cơ bản
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Tên sản phẩm:</Typography>
                                <Typography variant="body1"
                                            sx={{fontWeight: 600, color: '#0b3f31'}}>{selectedProduct.name}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                                <Chip
                                    label={getStatusLabel(selectedProduct.status)}
                                    sx={{
                                        fontWeight: 600,
                                        backgroundColor: '#22c55e',
                                        color: 'white'
                                    }}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">Mô tả:</Typography>
                                <Typography variant="body1">{selectedProduct.description}</Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Sizes */}
                    <Box>
                        <Typography variant="h6" sx={{fontWeight: 800, mb: 2, color: '#0b3f31'}}>
                            Cấu hình kích thước ({selectedProduct.sizes?.length || 0})
                        </Typography>
                        {selectedProduct.sizes?.map((size, sizeIndex) => (
                            <Paper key={sizeIndex} sx={{
                                p: 2.5,
                                mb: 2,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                                border: '1px solid rgba(33,150,243,0.12)'
                            }}>
                                <Typography variant="subtitle1" sx={{fontWeight: 800, mb: 1, color: '#0b3f31'}}>
                                    Kích
                                    thước: {size.name} - {new Intl.NumberFormat('vi-VN').format(calculateSizePrice(size))}₫
                                </Typography>

                                {/* Succulents */}
                                {size.succulents && size.succulents.length > 0 && (
                                    <Box sx={{mb: 2}}>
                                        <Typography variant="subtitle2" sx={{fontWeight: 800, mb: 1, color: '#0b3f31'}}>
                                            Sen đá ({size.succulents.length})
                                        </Typography>
                                        {size.succulents.map((succulent, index) => (
                                            <Box key={index} sx={{ml: 2, mb: 1}}>
                                                <Typography variant="body2" sx={{fontWeight: 600, color: '#0b3f31'}}>
                                                    {succulent.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {succulent.description}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}

                                {/* Pot */}
                                {size.pot && (
                                    <Box sx={{mb: 2}}>
                                        <Typography variant="subtitle2" sx={{fontWeight: 800, mb: 1, color: '#0b3f31'}}>
                                            Chậu
                                        </Typography>
                                        <Box sx={{ml: 2}}>
                                            <Typography variant="body2" sx={{fontWeight: 600, color: '#0b3f31'}}>
                                                {size.pot.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {size.pot.description} - {size.pot.material} - {size.pot.color}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {/* Soil */}
                                {size.soil && (
                                    <Box sx={{mb: 2}}>
                                        <Typography variant="subtitle2" sx={{fontWeight: 800, mb: 1, color: '#0b3f31'}}>
                                            Đất trồng
                                        </Typography>
                                        <Box sx={{ml: 2}}>
                                            <Typography variant="body2" sx={{fontWeight: 600, color: '#0b3f31'}}>
                                                {size.soil.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {size.soil.description} - Khối lượng: {size.soil.massAmount}g
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {/* Decorations */}
                                {size.decorations && size.decorations.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{fontWeight: 800, mb: 1, color: '#0b3f31'}}>
                                            Trang trí ({size.decorations.length})
                                        </Typography>
                                        {size.decorations.map((decoration, index) => (
                                            <Box key={index} sx={{ml: 2, mb: 1}}>
                                                <Typography variant="body2" sx={{fontWeight: 600, color: '#0b3f31'}}>
                                                    {decoration.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {decoration.description} - Số lượng: {decoration.quantity} -
                                                    Giá: {new Intl.NumberFormat('vi-VN').format(decoration.totalPrice)}₫
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Paper>
                        ))}
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ProductViewDialog;
