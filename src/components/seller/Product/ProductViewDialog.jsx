import React from 'react';
import {Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Typography} from '@mui/material';
import {Edit as EditIcon, Visibility as ViewIcon} from '@mui/icons-material';
import ActionButton from "../../buttonCustom/ActionButton.jsx";

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
        >
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: 'white',
                fontWeight: 700
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <ViewIcon/>
                    Chi tiết sản phẩm: {selectedProduct.name}
                </Box>
            </DialogTitle>

            <DialogContent sx={{p: 3}}>
                <Box>
                    {/* Basic Info */}
                    <Box sx={{mb: 3}}>
                        <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>
                            Thông tin cơ bản
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Tên sản phẩm:</Typography>
                                <Typography variant="body1" sx={{fontWeight: 500}}>{selectedProduct.name}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                                <Chip
                                    label={getStatusLabel(selectedProduct.status)}
                                    color={getStatusColor(selectedProduct.status)}
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
                        <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>
                            Cấu hình kích thước ({selectedProduct.sizes?.length || 0})
                        </Typography>
                        {selectedProduct.sizes?.map((size, sizeIndex) => (
                            <Paper key={sizeIndex} sx={{p: 2, mb: 2}}>
                                <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 1}}>
                                    Kích
                                    thước: {size.name} - {new Intl.NumberFormat('vi-VN').format(calculateSizePrice(size))}₫
                                </Typography>

                                {/* Succulents */}
                                {size.succulents && size.succulents.length > 0 && (
                                    <Box sx={{mb: 2}}>
                                        <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                            Sen đá ({size.succulents.length})
                                        </Typography>
                                        {size.succulents.map((succulent, index) => (
                                            <Box key={index} sx={{ml: 2, mb: 1}}>
                                                <Typography variant="body2" sx={{fontWeight: 500}}>
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
                                        <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                            Chậu
                                        </Typography>
                                        <Box sx={{ml: 2}}>
                                            <Typography variant="body2" sx={{fontWeight: 500}}>
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
                                        <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                            Đất trồng
                                        </Typography>
                                        <Box sx={{ml: 2}}>
                                            <Typography variant="body2" sx={{fontWeight: 500}}>
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
                                        <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                            Trang trí ({size.decorations.length})
                                        </Typography>
                                        {size.decorations.map((decoration, index) => (
                                            <Box key={index} sx={{ml: 2, mb: 1}}>
                                                <Typography variant="body2" sx={{fontWeight: 500}}>
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

            <DialogActions sx={{p: 3}}>
                <ActionButton
                    action={'cancel'}
                    type={'button'}
                    onClick={onClose}/>

                <ActionButton
                    action={'update'}
                    type={'submit'}
                    startIcon={<EditIcon/>}
                    onClick={() => {
                        onClose();
                        handleEditProduct(selectedProduct);
                    }}
                />
            </DialogActions>
        </Dialog>
    );
};

export default ProductViewDialog;
