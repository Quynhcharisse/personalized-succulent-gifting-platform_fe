import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Chip,
    Button,
    Grid,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Fab,
    Tooltip,
    Badge,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    ExpandMore as ExpandMoreIcon,
    LocalFlorist as SucculentIcon,
    Pot as PotIcon,
    Eco as SoilIcon,
    Star as DecorationIcon,
    Image as ImageIcon,
    CalendarToday as DateIcon,
    CheckCircle as AvailableIcon,
    Cancel as UnavailableIcon
} from '@mui/icons-material';
import { viewProduct, deleteProduct } from '../../../services/ProductService.jsx';
import CreateOrUpdateProductDialog from './CreateOrUpdateProductDialog.jsx';
import DeactiveProduct from './DeactiveProduct.jsx';
import { useNotify } from '../../../hooks/useNotify.js';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [deactiveDialogOpen, setDeactiveDialogOpen] = useState(false);
    const [productToDeactive, setProductToDeactive] = useState(null);
    
    const { showNotification } = useNotify();

    // Load products
    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await viewProduct();
            
            if (response && response.data) {
                setProducts(response.data);
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error('Error loading products:', err);
            setError('Không thể tải danh sách sản phẩm');
            showNotification('Lỗi khi tải danh sách sản phẩm', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    // Handle create new product
    const handleCreateProduct = () => {
        setSelectedProduct(null);
        setIsEdit(false);
        setDialogOpen(true);
    };

    // Handle edit product
    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setIsEdit(true);
        setDialogOpen(true);
    };

    // Handle view product details
    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setViewDialogOpen(true);
    };

    // Handle delete product
    const handleDeleteProduct = (product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    // Handle deactive product
    const handleDeactiveProduct = (product) => {
        setProductToDeactive(product);
        setDeactiveDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        
        try {
            setIsDeleting(true);
            const response = await deleteProduct(productToDelete.id);
            
            if (response && (response.status === 200 || response.status === 204)) {
                showNotification('Xóa sản phẩm thành công!', 'success');
                loadProducts(); // Reload the list
            } else {
                showNotification('Xóa sản phẩm thất bại', 'error');
            }
        } catch (err) {
            console.error('Error deleting product:', err);
            showNotification('Có lỗi xảy ra khi xóa sản phẩm', 'error');
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    };

    // Handle dialog close
    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedProduct(null);
        setIsEdit(false);
    };

    // Handle product created/updated
    const handleProductSaved = () => {
        loadProducts();
        showNotification(
            isEdit ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!', 
            'success'
        );
    };

    // Handle product deactivated
    const handleProductDeactivated = () => {
        loadProducts();
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'available':
                return 'success';
            case 'unavailable':
                return 'error';
            case 'draft':
                return 'warning';
            default:
                return 'default';
        }
    };

    // Get status label
    const getStatusLabel = (status) => {
        switch (status) {
            case 'available':
                return 'Có sẵn';
            case 'unavailable':
                return 'Hết hàng';
            case 'draft':
                return 'Bản nháp';
            default:
                return status;
        }
    };

    // Calculate total price for a size
    const calculateSizePrice = (size) => {
        let totalPrice = 0;
        
        // Add succulent prices
        size.succulents.forEach(succulent => {
            totalPrice += (succulent.size?.price || 0) * succulent.quantity;
        });
        
        // Add pot price
        if (size.pot?.size && size.pot.size.length > 0) {
            totalPrice += size.pot.size[0].price || 0;
        }
        
        // Add soil price
        if (size.soil?.basePricing) {
            const soilPrice = (size.soil.basePricing.price / size.soil.basePricing.massValue) * size.soil.massAmount;
            totalPrice += soilPrice;
        }
        
        // Add decoration prices
        size.decorations?.forEach(decoration => {
            totalPrice += decoration.totalPrice || 0;
        });
        
        return totalPrice;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Đang tải danh sách sản phẩm...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={loadProducts}>
                    Thử lại
                </Button>
            </Box>
        );
    }

    if (products.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>
                    Chưa có sản phẩm nào
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    Hãy tạo sản phẩm đầu tiên của bạn
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateProduct}
                    size="large"
                    sx={{
                        background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                        borderRadius: 2
                    }}
                >
                    Tạo sản phẩm mới
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.dark' }}>
                    Danh sách sản phẩm
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateProduct}
                    sx={{
                        background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                        borderRadius: 2,
                        px: 3,
                        py: 1.5
                    }}
                >
                    Tạo sản phẩm mới
                </Button>
            </Box>

            {/* Products Grid */}
            <Grid container spacing={3}>
                {products.map((product) => (
                    <Grid item xs={12} md={6} lg={4} key={product.id}>
                        <Card sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                            }
                        }}>
                            {/* Product Image */}
                            <Box sx={{ position: 'relative' }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={product.images?.[0]?.url || '/placeholder-product.jpg'}
                                    alt={product.images?.[0]?.altText || product.name}
                                    sx={{
                                        objectFit: 'cover',
                                        borderTopLeftRadius: 12,
                                        borderTopRightRadius: 12
                                    }}
                                />
                                
                                {/* Status Badge */}
                                <Chip
                                    icon={product.status === 'available' ? <AvailableIcon /> : <UnavailableIcon />}
                                    label={getStatusLabel(product.status)}
                                    color={getStatusColor(product.status)}
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        fontWeight: 600
                                    }}
                                />

                                {/* Image Count Badge */}
                                {product.images && product.images.length > 1 && (
                                    <Badge
                                        badgeContent={product.images.length}
                                        color="primary"
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            left: 8
                                        }}
                                    >
                                        <ImageIcon sx={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 1, p: 0.5 }} />
                                    </Badge>
                                )}
                            </Box>

                            {/* Product Content */}
                            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                                    {product.name}
                                </Typography>
                                
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, minHeight: '40px' }}>
                                    {product.description}
                                </Typography>

                                {/* Sizes Summary */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'success.dark' }}>
                                        Kích thước có sẵn:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {product.sizes?.map((size, index) => (
                                            <Chip
                                                key={index}
                                                label={`${size.name} - ${new Intl.NumberFormat('vi-VN').format(calculateSizePrice(size))}₫`}
                                                size="small"
                                                variant="outlined"
                                                color="success"
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                {/* Dates */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <DateIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            Tạo: {formatDate(product.createAt)}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Action Buttons */}
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                    <Tooltip title="Xem chi tiết">
                                        <IconButton
                                            color="info"
                                            onClick={() => handleViewProduct(product)}
                                            size="small"
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <Tooltip title="Chỉnh sửa">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleEditProduct(product)}
                                            size="small"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    {product.status === 'available' && (
                                        <Tooltip title="Vô hiệu hóa">
                                            <IconButton
                                                color="warning"
                                                onClick={() => handleDeactiveProduct(product)}
                                                size="small"
                                            >
                                                <UnavailableIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    
                                    <Tooltip title="Xóa">
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteProduct(product)}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Create/Edit Dialog */}
            <CreateOrUpdateProductDialog
                open={dialogOpen}
                onClose={handleDialogClose}
                onCreate={handleProductSaved}
                editProduct={selectedProduct}
                isEdit={isEdit}
            />

            {/* View Product Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                    color: 'white',
                    fontWeight: 700
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ViewIcon />
                        Chi tiết sản phẩm: {selectedProduct?.name}
                    </Box>
                </DialogTitle>
                
                <DialogContent sx={{ p: 3 }}>
                    {selectedProduct && (
                        <Box>
                            {/* Basic Info */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                    Thông tin cơ bản
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">Tên sản phẩm:</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedProduct.name}</Typography>
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

                            <Divider sx={{ my: 2 }} />

                            {/* Images */}
                            {selectedProduct.images && selectedProduct.images.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Hình ảnh ({selectedProduct.images.length})
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {selectedProduct.images.map((image, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={image.id}>
                                                <Box sx={{ position: 'relative' }}>
                                                    <img
                                                        src={image.url}
                                                        alt={image.altText}
                                                        style={{
                                                            width: '100%',
                                                            height: '150px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px',
                                                            border: image.primary ? '3px solid #4caf50' : '1px solid #e0e0e0'
                                                        }}
                                                    />
                                                    {image.primary && (
                                                        <Chip
                                                            label="Ảnh chính"
                                                            color="success"
                                                            size="small"
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 8,
                                                                left: 8
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}

                            <Divider sx={{ my: 2 }} />

                            {/* Sizes */}
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                    Cấu hình kích thước ({selectedProduct.sizes?.length || 0})
                                </Typography>
                                
                                {selectedProduct.sizes?.map((size, sizeIndex) => (
                                    <Accordion key={sizeIndex} sx={{ mb: 2 }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                Kích thước: {size.name} - {new Intl.NumberFormat('vi-VN').format(calculateSizePrice(size))}₫
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                {/* Succulents */}
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                                        Sen đá ({size.succulents?.length || 0})
                                                    </Typography>
                                                    <List dense>
                                                        {size.succulents?.map((succulent, index) => (
                                                            <ListItem key={index} sx={{ pl: 0 }}>
                                                                <ListItemIcon>
                                                                    <SucculentIcon color="success" />
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={`${succulent.name} (${succulent.size?.name})`}
                                                                    secondary={`Số lượng: ${succulent.quantity} - Giá: ${new Intl.NumberFormat('vi-VN').format(succulent.size?.price || 0)}₫`}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Box>

                                                {/* Pot */}
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                                        Chậu
                                                    </Typography>
                                                    <List dense>
                                                        <ListItem sx={{ pl: 0 }}>
                                                            <ListItemIcon>
                                                                <PotIcon color="primary" />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={size.pot?.name}
                                                                secondary={`${size.pot?.material} - ${size.pot?.color} - Giá: ${new Intl.NumberFormat('vi-VN').format(size.pot?.size?.[0]?.price || 0)}₫`}
                                                            />
                                                        </ListItem>
                                                    </List>
                                                </Box>

                                                {/* Soil */}
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                                        Đất trồng
                                                    </Typography>
                                                    <List dense>
                                                        <ListItem sx={{ pl: 0 }}>
                                                            <ListItemIcon>
                                                                <SoilIcon color="secondary" />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={size.soil?.name}
                                                                secondary={`Khối lượng: ${size.soil?.massAmount}g - Giá: ${new Intl.NumberFormat('vi-VN').format((size.soil?.basePricing?.price / size.soil?.basePricing?.massValue) * size.soil?.massAmount || 0)}₫`}
                                                            />
                                                        </ListItem>
                                                    </List>
                                                </Box>

                                                {/* Decorations */}
                                                {size.decorations && size.decorations.length > 0 && (
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                                            Trang trí ({size.decorations.length})
                                                        </Typography>
                                                        <List dense>
                                                            {size.decorations.map((decoration, index) => (
                                                                <ListItem key={index} sx={{ pl: 0 }}>
                                                                    <ListItemIcon>
                                                                        <DecorationIcon color="warning" />
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        primary={decoration.name}
                                                                        secondary={`Số lượng: ${decoration.quantity} - Giá: ${new Intl.NumberFormat('vi-VN').format(decoration.totalPrice || 0)}₫`}
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </Box>
                                                )}
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setViewDialogOpen(false)}>
                        Đóng
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => {
                            setViewDialogOpen(false);
                            handleEditProduct(selectedProduct);
                        }}
                        sx={{
                            background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)'
                        }}
                    >
                        Chỉnh sửa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Deactive Product Dialog */}
            <DeactiveProduct
                open={deactiveDialogOpen}
                onClose={() => setDeactiveDialogOpen(false)}
                product={productToDeactive}
                onSuccess={handleProductDeactivated}
            />
        </Box>
    );
};

export default ProductList;
