import React from 'react';
import {Box, Chip, Dialog, DialogContent, DialogTitle, Paper, Typography} from '@mui/material';
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
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            <Box sx={{display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, gap: 3}}>
                                <Box sx={{flex: 1}}>
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>Tên sản phẩm:</Typography>
                                    <Typography variant="body1"
                                                sx={{fontWeight: 600, color: '#0b3f31'}}>{selectedProduct.name}</Typography>
                                </Box>
                                <Box sx={{flex: 1}}>
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>Trạng thái:</Typography>
                                    <Chip
                                        label={getStatusLabel(selectedProduct.status)}
                                        sx={{
                                            fontWeight: 600,
                                            backgroundColor: '#22c55e',
                                            color: 'white'
                                        }}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>Mô tả:</Typography>
                                <Typography variant="body1">{selectedProduct.description}</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Sizes */}
                    <Box>
                        <Typography variant="h6" sx={{fontWeight: 800, mb: 3, color: '#0b3f31'}}>
                            Cấu hình kích thước ({selectedProduct.sizes?.length || 0})
                        </Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            {selectedProduct.sizes?.map((size, sizeIndex) => (
                                <Paper key={sizeIndex} sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                                    border: '1px solid rgba(11, 63, 49, 0.15)',
                                    boxShadow: '0 4px 12px rgba(11, 63, 49, 0.08)'
                                }}>
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                                        <Typography variant="h6" sx={{fontWeight: 800, color: '#0b3f31'}}>
                                            🌱 Kích thước: {size.name}
                                        </Typography>
                                        <Chip
                                            label={`${new Intl.NumberFormat('vi-VN').format(calculateSizePrice(size))}₫`}
                                            sx={{
                                                fontWeight: 700,
                                                backgroundColor: '#0b3f31',
                                                color: 'white',
                                                fontSize: '0.9rem',
                                                px: 2
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                        {/* Succulents */}
                                        {size.succulents && size.succulents.length > 0 && (
                                            <Box sx={{
                                                p: 2.5,
                                                borderRadius: 2,
                                                backgroundColor: '#f0fff6',
                                                border: '1px solid rgba(34, 197, 94, 0.2)'
                                            }}>
                                                <Typography variant="subtitle1" sx={{fontWeight: 700, mb: 2, color: '#0b3f31'}}>
                                                    🌱 Sen đá ({size.succulents.length})
                                                </Typography>
                                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                                    {size.succulents.map((succulent, index) => (
                                                        <Box key={index} sx={{
                                                            p: 2,
                                                            backgroundColor: 'white',
                                                            borderRadius: 2,
                                                            border: '1px solid rgba(34, 197, 94, 0.1)'
                                                        }}>
                                                            <Typography variant="body1" sx={{fontWeight: 600, color: '#0b3f31', mb: 0.5}}>
                                                                {succulent.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {succulent.description}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Pot */}
                                        {size.pot && (
                                            <Box sx={{
                                                p: 2.5,
                                                borderRadius: 2,
                                                backgroundColor: '#fef7f0',
                                                border: '1px solid rgba(245, 158, 11, 0.2)'
                                            }}>
                                                <Typography variant="subtitle1" sx={{fontWeight: 700, mb: 2, color: '#0b3f31'}}>
                                                    🪴 Chậu
                                                </Typography>
                                                <Box sx={{
                                                    p: 2,
                                                    backgroundColor: 'white',
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(245, 158, 11, 0.1)'
                                                }}>
                                                    <Typography variant="body1" sx={{fontWeight: 600, color: '#0b3f31', mb: 0.5}}>
                                                        {size.pot.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {size.pot.description} - {size.pot.material} - {size.pot.color}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Soil */}
                                        {size.soil && (
                                            <Box sx={{
                                                p: 2.5,
                                                borderRadius: 2,
                                                backgroundColor: '#f0fdf4',
                                                border: '1px solid rgba(34, 197, 94, 0.2)'
                                            }}>
                                                <Typography variant="subtitle1" sx={{fontWeight: 700, mb: 2, color: '#0b3f31'}}>
                                                    🌿 Đất trồng
                                                </Typography>
                                                <Box sx={{
                                                    p: 2,
                                                    backgroundColor: 'white',
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(34, 197, 94, 0.1)'
                                                }}>
                                                    <Typography variant="body1" sx={{fontWeight: 600, color: '#0b3f31', mb: 0.5}}>
                                                        {size.soil.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {size.soil.description} - Khối lượng: {size.soil.massAmount}g
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Decorations */}
                                        {size.decorations && size.decorations.length > 0 && (
                                            <Box sx={{
                                                p: 2.5,
                                                borderRadius: 2,
                                                backgroundColor: '#fefce8',
                                                border: '1px solid rgba(245, 158, 11, 0.2)'
                                            }}>
                                                <Typography variant="subtitle1" sx={{fontWeight: 700, mb: 2, color: '#0b3f31'}}>
                                                    ✨ Trang trí ({size.decorations.length})
                                                </Typography>
                                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                                    {size.decorations.map((decoration, index) => (
                                                        <Box key={index} sx={{
                                                            p: 2,
                                                            backgroundColor: 'white',
                                                            borderRadius: 2,
                                                            border: '1px solid rgba(245, 158, 11, 0.1)'
                                                        }}>
                                                            <Typography variant="body1" sx={{fontWeight: 600, color: '#0b3f31', mb: 0.5}}>
                                                                {decoration.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {decoration.description} - Số lượng: {decoration.quantity} -
                                                                Giá: {new Intl.NumberFormat('vi-VN').format(decoration.totalPrice)}₫
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ProductViewDialog;
