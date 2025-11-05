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

import { useDispatch, useSelector } from 'react-redux';
import { viewProduct } from '../../../services/ProductService.jsx';
import { addItem } from '../../../store/slices/cartSlice.js';

export default function ProductDetail() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    
    const dispatch = useDispatch();
    const cartItems = useSelector(state => state?.cart?.items || []);

    // Check if user is logged in
    const isLoggedIn = () => {
        const user = localStorage.getItem('user');
        return !!user;
    };

    useEffect(() => {
        fetchProductDetail();
    }, [id]);

    // Reset quantity when size changes
    useEffect(() => {
        setQuantity(1);
    }, [selectedSizeIndex]);

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

    const calculateProductPrice = (size) => {
        let totalPrice = 0;

        // Add succulent prices - handle new structure where size is array
        size.succulents?.forEach(succulent => {
            if (succulent.size && Array.isArray(succulent.size)) {
                succulent.size.forEach(sizeItem => {
                    totalPrice += (sizeItem.price || 0) * (sizeItem.quantity || 1);
                });
            } else if (succulent.size?.price) {
                totalPrice += (succulent.size.price || 0);
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

    const isOutOfStock = !!(product?.status && !String(product.status).toLowerCase().includes('còn hàng'));

    const handleAddToCart = () => {
        if (!isLoggedIn()) {
            enqueueSnackbar('Vui lòng đăng nhập để thêm vào giỏ hàng', {variant: 'info'});
            navigate('/login', {state: {from: `/product/${id}`}});
            return;
        }

        // TODO: Implement add to cart functionality
        console.log('Add to cart:', {
            productId: product.id,
            size: product.sizes?.[selectedSizeIndex],
            quantity: quantity
        });
        enqueueSnackbar(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`, {variant: 'success'});
    };
    
    const handleBuyNow = () => {
        if (!isLoggedIn()) {
            enqueueSnackbar('Vui lòng đăng nhập để mua hàng', {variant: 'info'});
            navigate('/login', {state: {from: `/product/${id}`}});
            return;
        }
        // TODO: Implement buy now functionality - redirect to checkout
        console.log('Buy now:', {
            productId: product.id,
            size: product.sizes?.[selectedSizeIndex],
            quantity: quantity
        });
        enqueueSnackbar('Đang chuyển đến trang thanh toán...', {variant: 'info'});
        // navigate('/checkout', { state: { ... } });

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
                        
                        {/* Quantity Selector */}
                        {selectedSize && (
                            <Box sx={{mb: 3}}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 3, mb: 2}}>
                                    <Typography variant="subtitle1" sx={{fontWeight: 600, minWidth: '80px'}}>
                                        Số Lượng
                                    </Typography>
                                    
                                    {/* Quantity Controls */}
                                    <Box sx={{display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 1}}>
                                        <Button
                                            variant="text"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                            sx={{
                                                minWidth: '40px',
                                                height: '40px',
                                                color: '#666',
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5'
                                                }
                                            }}
                                        >
                                            -
                                        </Button>
                                        
                                        <Typography sx={{
                                            minWidth: '60px', 
                                            textAlign: 'center', 
                                            px: 2,
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            color: '#d32f2f'
                                        }}>
                                            {quantity}
                                        </Typography>
                                        
                                        <Button
                                            variant="text"
                                            onClick={() => setQuantity(Math.min(selectedSize.quantity, quantity + 1))}
                                            disabled={quantity >= selectedSize.quantity}
                                            sx={{
                                                minWidth: '40px',
                                                height: '40px',
                                                color: '#666',
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5'
                                                }
                                            }}
                                        >
                                            +
                                        </Button>
                                    </Box>
                                    
                                    {/* Stock Info */}
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedSize.quantity} sản phẩm có sẵn
                                    </Typography>
                                </Box>

                                {/* Succulent Quantities Info */}
                                {selectedSize.succulents && (
                                    <Box sx={{mt: 2}}>
                                        <Typography variant="body2" sx={{mb: 1, fontWeight: 500, color: '#666'}}>
                                            Thành phần sản phẩm:
                                        </Typography>
                                        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                                            {selectedSize.succulents.map((succulent, idx) => (
                                                <Box key={idx}>
                                                    {succulent.size && Array.isArray(succulent.size) && (
                                                        succulent.size.map((sizeItem, sizeIdx) => (
                                                            <Chip
                                                                key={sizeIdx}
                                                                label={`${succulent.name} (${sizeItem.name}): ${sizeItem.quantity} cây`}
                                                                size="small"
                                                                sx={{
                                                                    mr: 0.5,
                                                                    mb: 0.5,
                                                                    backgroundColor: '#f0f8f4',
                                                                    color: '#0D3B2E',
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            />
                                                        ))
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        )}
                        
                        <Divider sx={{my: 3}}/>
                        

                        {/* Action Buttons */}
                        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4}}>
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<ShoppingCart/>}
                                onClick={handleAddToCart}

                                disabled={selectedSize?.quantity === 0}

                                sx={{
                                    flex: 1,
                                    minWidth: '200px',
                                    borderColor: selectedSize?.quantity === 0 ? '#ccc' : '#d32f2f',
                                    color: selectedSize?.quantity === 0 ? '#ccc' : '#d32f2f',
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    '&:hover': {
                                        borderColor: selectedSize?.quantity === 0 ? '#ccc' : '#b71c1c',
                                        backgroundColor: selectedSize?.quantity === 0 ? 'transparent' : 'rgba(211, 47, 47, 0.04)',
                                    },
                                    '&:disabled': {
                                        borderColor: '#ccc',
                                        color: '#ccc'
                                    }
                                }}
                            >

                                {selectedSize?.quantity === 0 ? 'Hết hàng' : 'Thêm Vào Giỏ Hàng'}

                            </Button>
                            
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleBuyNow}
                                disabled={selectedSize?.quantity === 0}
                                sx={{
                                    flex: 1,
                                    minWidth: '200px',
                                    backgroundColor: selectedSize?.quantity === 0 ? '#ccc' : '#d32f2f',
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    '&:hover': {
                                        backgroundColor: selectedSize?.quantity === 0 ? '#ccc' : '#b71c1c',
                                    },
                                    '&:disabled': {
                                        backgroundColor: '#ccc',
                                        color: '#666'
                                    }
                                }}
                            >
                                {selectedSize?.quantity === 0 ? 'Hết hàng' : 'Mua Ngay'}
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
                    
                    {/* Combined Product Components */}
                    <Paper elevation={2} sx={{p: 4, mb: 3}}>
                        <Typography variant="h6" sx={{fontWeight: 700, mb: 3, color: '#0D3B2E'}}>
                            Thành phần sản phẩm
                        </Typography>
                        
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                            {/* Succulents */}
                            {selectedSize.succulents && selectedSize.succulents.length > 0 && (
                                <Box>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                        <LocalFlorist sx={{mr: 1, color: '#4caf50'}}/>
                                        <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                                            Sen Đá
                                        </Typography>
                                    </Box>
                                    <Box sx={{pl: 4}}>
                                        {selectedSize.succulents.map((succulent, idx) => (
                                            <Box key={idx} sx={{mb: 2}}>
                                                <Typography variant="body1" sx={{fontWeight: 600, mb: 0.5}}>
                                                    • {succulent.name}
                                                </Typography>
                                                {succulent.description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ml: 2, mb: 1}}>
                                                        {succulent.description}
                                                    </Typography>
                                                )}
                                                {succulent.size && Array.isArray(succulent.size) && (
                                                    <Box sx={{ml: 2, mt: 1}}>
                                                        {succulent.size.map((sizeItem, sizeIdx) => (
                                                            <Chip
                                                                key={sizeIdx}
                                                                label={`${sizeItem.name}: ${sizeItem.quantity} cây`}
                                                                size="small"
                                                                sx={{mr: 1, mb: 0.5, backgroundColor: '#e8f5e9'}}
                                                            />
                                                        ))}
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Pot */}
                            {selectedSize.pot && (
                                <Box>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                        <SquareFoot sx={{mr: 1, color: '#ff9800'}}/>
                                        <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                                            Chậu
                                        </Typography>
                                    </Box>
                                    <Box sx={{pl: 4}}>
                                        <Typography variant="body1" sx={{fontWeight: 600, mb: 1}}>
                                            • {selectedSize.pot.name}
                                        </Typography>
                                        {selectedSize.pot.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ml: 2, mb: 2}}>
                                                {selectedSize.pot.description}
                                            </Typography>
                                        )}
                                        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', ml: 2}}>
                                            <Chip label={`Chất liệu: ${selectedSize.pot.material}`} size="small" sx={{backgroundColor: '#fff3e0'}}/>
                                            {selectedSize.pot.color && (
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                                    <Typography variant="caption">Màu:</Typography>
                                                    <Box sx={{width: 20, height: 20, backgroundColor: selectedSize.pot.color, borderRadius: '50%', border: '1px solid #ddd'}}/>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            )}

                            {/* Soil */}
                            {selectedSize.soil && (
                                <Box>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                        <WaterDrop sx={{mr: 1, color: '#2196f3'}}/>
                                        <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                                            Đất/Đá
                                        </Typography>
                                    </Box>
                                    <Box sx={{pl: 4}}>
                                        <Typography variant="body1" sx={{fontWeight: 600, mb: 1}}>
                                            • {selectedSize.soil.name}
                                        </Typography>
                                        {selectedSize.soil.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ml: 2, whiteSpace: 'pre-line'}}>
                                                {selectedSize.soil.description}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            )}
                            {/* Decorations */}
                            {selectedSize.decorations && selectedSize.decorations.length > 0 && (
                                <Box>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                        <Brush sx={{mr: 1, color: '#9c27b0'}}/>
                                        <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                                            Trang trí
                                        </Typography>
                                    </Box>
                                    <Box sx={{pl: 4}}>
                                        {selectedSize.decorations.map((decoration, idx) => (
                                            <Box key={idx} sx={{mb: 2}}>
                                                <Typography variant="body1" sx={{fontWeight: 600, mb: 0.5}}>
                                                    • {decoration.name || `Phụ kiện ${idx + 1}`}
                                                </Typography>
                                                {decoration.description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ml: 2}}>
                                                        {decoration.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Box>
            )}
        </Container>
    );
}
