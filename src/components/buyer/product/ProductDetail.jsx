import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    Box,
    Chip,
    Divider,
    Paper,
    CircularProgress,
    Alert,
    Card,
    CardMedia
} from '@mui/material';
import {ShoppingCart, FavoriteBorder, ArrowBack, LocalFlorist, SquareFoot, WaterDrop, Brush} from '@mui/icons-material';
import {useSnackbar} from 'notistack';
import {viewProduct} from '../../../services/ProductService.jsx';

export default function ProductDetail() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [imageError, setImageError] = useState(false);
    const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
    
    // Check if user is logged in
    const isLoggedIn = () => {
        const user = localStorage.getItem('user');
        return !!user;
    };

    useEffect(() => {
        fetchProductDetail();
    }, [id]);

    const fetchProductDetail = async () => {
        try {
            // Get all products and filter by id
            const response = await viewProduct();
            if (response && response.data && response.data.data) {
                const product = response.data.data.find(p => p.id === parseInt(id));
                if (product) {
                    setProduct(product);
                    setError(null);
                } else {
                    setError('Không tìm thấy sản phẩm');
                }
            } else {
                setError('Không thể tải thông tin sản phẩm');
            }
        } catch (error) {
            console.error('Error fetching product detail:', error);
            setError('Không thể tải thông tin sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (vnd) => {
        return new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(vnd);
    };

    const calculateProductPrice = (size) => {
        let totalPrice = 0;

        // Add succulent prices - handle new structure where size is array
        size.succulents?.forEach(succulent => {
            if (succulent.size && Array.isArray(succulent.size)) {
                succulent.size.forEach(sizeItem => {
                    totalPrice += (sizeItem.price || 0) * (sizeItem.quantity || 1);
                });
            } else if (succulent.size?.price) {
                totalPrice += (succulent.size.price || 0) * (succulent.quantity || 1);
            }
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

    const handleAddToCart = () => {
        if (!isLoggedIn()) {
            enqueueSnackbar('Vui lòng đăng nhập để thêm vào giỏ hàng', {variant: 'info'});
            navigate('/login', {state: {from: `/product/${id}`}});
            return;
        }
        // TODO: Implement add to cart functionality
        console.log('Add to cart:', product.id, quantity, product.sizes?.[selectedSizeIndex]);
        enqueueSnackbar('Đã thêm vào giỏ hàng', {variant: 'success'});
    };
    
    const handleAddToWishlist = () => {
        if (!isLoggedIn()) {
                enqueueSnackbar('Vui lòng đăng nhập để thêm vào yêu thích', {variant: 'info'});
            navigate('/login', {state: {from: `/product/${id}`}});
            return;
        }
        // TODO: Implement add to wishlist functionality
        console.log('Add to wishlist:', product.id);
        enqueueSnackbar('Đã thêm vào yêu thích', {variant: 'success'});
    };

    // Removed custom request entry from product detail

    if (loading) {
        return (
            <Container sx={{py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{py: 4}}>
                <Button startIcon={<ArrowBack/>} sx={{mb: 2}} onClick={() => navigate(-1)}>
                    Quay lại
                </Button>
                <Alert severity="error" sx={{mb: 3}}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container sx={{py: 4}}>
                <Button startIcon={<ArrowBack/>} sx={{mb: 2}} onClick={() => navigate(-1)}>
                    Quay lại
                </Button>
                <Alert severity="warning">
                    Không tìm thấy sản phẩm
                </Alert>
            </Container>
        );
    }

    const selectedSize = product.sizes?.[selectedSizeIndex];
    const currentPrice = selectedSize ? calculateProductPrice(selectedSize) : 0;
    const productName = typeof product.name === 'object' ? JSON.stringify(product.name) : product.name;

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <Button startIcon={<ArrowBack/>} sx={{mb: 2}} onClick={() => navigate(-1)}>
                Quay lại
            </Button>
            
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 4}}>
                {/* Product Images */}
                <Box sx={{flex: {xs: '1 1 100%', md: '1 1 calc(50% - 16px)'}}}>
                    <Card
                        sx={{
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '500px',
                            position: 'sticky',
                            top: 20
                        }}
                    >
                        {imageError ? (
                            <Box sx={{
                                width: '100%',
                                height: '500px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#f5f5f5'
                            }}>
                                <Typography color="text.secondary">Không có hình ảnh</Typography>
                            </Box>
                        ) : (
                            <CardMedia
                                component="img"
                                image={product.images?.[0]?.url || product.thumbnail || '/placeholder.jpg'}
                                alt={productName}
                                onError={() => setImageError(true)}
                                sx={{
                                    maxHeight: '600px',
                                    width: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        )}
                    </Card>
                </Box>
                
                {/* Product Info */}
                <Box sx={{flex: {xs: '1 1 100%', md: '1 1 calc(50% - 16px)'}}}>
                    <Box>
                        {/* Status Chip */}
                        {product.status && (
                            <Chip 
                                label={product.status} 
                                color={product.status.includes('còn hàng') ? 'success' : 'error'}
                                sx={{mb: 2}}
                            />
                        )}
                        
                        <Typography variant="h4" gutterBottom sx={{fontWeight: 700, color: '#0D3B2E', mb: 2}}>
                            {productName}
                        </Typography>
                        
                        <Divider sx={{my: 2}}/>
                        
                        {/* Price */}
                        <Box sx={{mb: 3}}>
                            <Typography variant="h3" color="primary" sx={{fontWeight: 'bold', color: '#0D3B2E'}}>
                                {currentPrice > 0 ? new Intl.NumberFormat('vi-VN').format(currentPrice) + ' ₫' : 'N/A'}
                            </Typography>
                        </Box>
                        
                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 1 && (
                            <Box sx={{mb: 3}}>
                                <Typography variant="subtitle1" sx={{mb: 1, fontWeight: 600}}>
                                    Chọn kích thước:
                                </Typography>
                                <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                                    {product.sizes.map((size, index) => (
                                        <Button
                                            key={index}
                                            variant={selectedSizeIndex === index ? 'contained' : 'outlined'}
                                            onClick={() => setSelectedSizeIndex(index)}
                                            sx={{
                                                borderColor: '#0D3B2E',
                                                color: selectedSizeIndex === index ? 'white' : '#0D3B2E',
                                                backgroundColor: selectedSizeIndex === index ? '#0D3B2E' : 'transparent',
                                                '&:hover': {
                                                    borderColor: '#0D3B2E',
                                                    backgroundColor: selectedSizeIndex === index ? '#1e5a4a' : 'rgba(13, 59, 46, 0.1)',
                                                }
                                            }}
                                        >
                                            {size.name || `Kích thước ${index + 1}`}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>
                        )}
                        
                        <Divider sx={{my: 3}}/>
                        
                        {/* Quantity */}
                        <Box sx={{display: 'flex', gap: 2, mb: 3, alignItems: 'center'}}>
                            <Typography variant="subtitle1" sx={{fontWeight: 600}}>Số lượng:</Typography>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #ddd', borderRadius: 1}}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    sx={{minWidth: '40px'}}
                                >
                                    -
                                </Button>
                                <Typography sx={{minWidth: '50px', textAlign: 'center', px: 2}}>
                                    {quantity}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    onClick={() => setQuantity(quantity + 1)}
                                    sx={{minWidth: '40px'}}
                                >
                                    +
                                </Button>
                            </Box>
                        </Box>
                        
                        {/* Action Buttons */}
                        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4}}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<ShoppingCart/>}
                                onClick={handleAddToCart}
                                sx={{
                                    flex: 1,
                                    minWidth: '200px',
                                    backgroundColor: '#0D3B2E',
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    '&:hover': {
                                        backgroundColor: '#1e5a4a',
                                    }
                                }}
                            >
                                Thêm vào giỏ hàng
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<FavoriteBorder/>}
                                onClick={handleAddToWishlist}
                            >
                                Yêu thích
                            </Button>
                           
                        </Box>
                        {/* Custom request button removed from product detail */}
                        
                        <Divider sx={{my: 4}}/>
                        
                        {/* Description */}
                        <Box sx={{mb: 4}}>
                            <Typography variant="h6" gutterBottom sx={{fontWeight: 700, mb: 2}}>
                                Mô tả sản phẩm
                            </Typography>
                            <Typography variant="body1" sx={{whiteSpace: 'pre-line', lineHeight: 1.8}}>
                                {typeof product.description === 'object' ? JSON.stringify(product.description) : product.description}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Detailed Product Information */}
            {selectedSize && (
                <Box sx={{mt: 6}}>
                    <Typography variant="h5" gutterBottom sx={{fontWeight: 700, mb: 3, color: '#0D3B2E'}}>
                        Chi tiết sản phẩm - {selectedSize.name}
                    </Typography>
                    
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 3}}>
                        {/* Succulents */}
                        {selectedSize.succulents && selectedSize.succulents.length > 0 && (
                            <Box sx={{flex: {xs: '1 1 100%', md: '1 1 calc(50% - 12px)'}}}>
                                <Paper elevation={2} sx={{p: 3, height: '100%'}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                        <LocalFlorist sx={{mr: 1, color: '#4caf50'}}/>
                                        <Typography variant="h6" sx={{fontWeight: 700}}>
                                            Sen Đá
                                        </Typography>
                                    </Box>
                                    {selectedSize.succulents.map((succulent, idx) => (
                                        <Box key={idx} sx={{mb: 2, pb: 2, borderBottom: idx < selectedSize.succulents.length - 1 ? '1px solid #eee' : 'none'}}>
                                            <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 1}}>
                                                {succulent.name}
                                            </Typography>
                                            {succulent.description && (
                                                <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                                                    {succulent.description}
                                                </Typography>
                                            )}
                                            {succulent.size && Array.isArray(succulent.size) && (
                                                <Box sx={{mt: 1}}>
                                                    {succulent.size.map((sizeItem, sizeIdx) => (
                                                        <Chip
                                                            key={sizeIdx}
                                                            label={`${sizeItem.name}: ${new Intl.NumberFormat('vi-VN').format(sizeItem.price)} ₫ (SL: ${sizeItem.quantity})`}
                                                            size="small"
                                                            sx={{mr: 1, mb: 0.5}}
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </Paper>
                            </Box>
                        )}

                        {/* Pot */}
                        {selectedSize.pot && (
                            <Box sx={{flex: {xs: '1 1 100%', md: '1 1 calc(50% - 12px)'}}}>
                                <Paper elevation={2} sx={{p: 3, height: '100%'}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                        <SquareFoot sx={{mr: 1, color: '#ff9800'}}/>
                                        <Typography variant="h6" sx={{fontWeight: 700}}>
                                            Chậu
                                        </Typography>
                                    </Box>
                                    <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 1}}>
                                        {selectedSize.pot.name}
                                    </Typography>
                                    {selectedSize.pot.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                            {selectedSize.pot.description}
                                        </Typography>
                                    )}
                                    <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1}}>
                                        <Chip label={`Chất liệu: ${selectedSize.pot.material}`} size="small"/>
                                        {selectedSize.pot.color && (
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                                <Typography variant="caption">Màu:</Typography>
                                                <Box sx={{width: 24, height: 24, backgroundColor: selectedSize.pot.color, borderRadius: '50%', border: '1px solid #ddd'}}/>
                                            </Box>
                                        )}
                                    </Box>
                                    {selectedSize.pot.size && selectedSize.pot.size.length > 0 && (
                                        <Box sx={{mt: 2}}>
                                            {selectedSize.pot.size.map((potSize, idx) => (
                                                <Box key={idx} sx={{mb: 1}}>
                                                    <Typography variant="body2">
                                                        <strong>{potSize.name}:</strong> {new Intl.NumberFormat('vi-VN').format(potSize.price)} ₫
                                                        {potSize.upperCrossSectionArea && ` • Diện tích: ${potSize.upperCrossSectionArea}m²`}
                                                        {potSize.height && ` • Chiều cao: ${potSize.height}cm`}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Paper>
                            </Box>
                        )}

                        {/* Soil */}
                        {selectedSize.soil && (
                            <Box sx={{flex: {xs: '1 1 100%', md: '1 1 calc(50% - 12px)'}}}>
                                <Paper elevation={2} sx={{p: 3, height: '100%'}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                        <WaterDrop sx={{mr: 1, color: '#2196f3'}}/>
                                        <Typography variant="h6" sx={{fontWeight: 700}}>
                                            Đất/Đá
                                        </Typography>
                                    </Box>
                                    <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 1}}>
                                        {selectedSize.soil.name}
                                    </Typography>
                                    {selectedSize.soil.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{mb: 2, whiteSpace: 'pre-line'}}>
                                            {selectedSize.soil.description}
                                        </Typography>
                                    )}
                                    {selectedSize.soil.basePricing && (
                                        <Box>
                                            <Typography variant="body2">
                                                <strong>Khối lượng:</strong> {selectedSize.soil.massAmount} {selectedSize.soil.basePricing.massUnit || 'gram'}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Giá:</strong> {new Intl.NumberFormat('vi-VN').format(
                                                    (selectedSize.soil.basePricing.price / selectedSize.soil.basePricing.massValue) * selectedSize.soil.massAmount
                                                )} ₫
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>
                        )}

                        {/* Decorations */}
                        {selectedSize.decorations && selectedSize.decorations.length > 0 && (
                            <Box sx={{flex: {xs: '1 1 100%', md: '1 1 calc(50% - 12px)'}}}>
                                <Paper elevation={2} sx={{p: 3, height: '100%'}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                        <Brush sx={{mr: 1, color: '#9c27b0'}}/>
                                        <Typography variant="h6" sx={{fontWeight: 700}}>
                                            Trang trí
                                        </Typography>
                                    </Box>
                                    {selectedSize.decorations.map((decoration, idx) => (
                                        <Box key={idx} sx={{mb: 2}}>
                                            <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                                                {decoration.name || `Phụ kiện ${idx + 1}`}
                                            </Typography>
                                            {decoration.totalPrice && (
                                                <Typography variant="body2" color="text.secondary">
                                                    Giá: {new Intl.NumberFormat('vi-VN').format(decoration.totalPrice)} ₫
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}
                                </Paper>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}
        </Container>
    );
}
