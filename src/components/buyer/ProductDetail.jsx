import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
    Container,
    Grid,
    Typography,
    Button,
    Box,
    Chip,
    Rating,
    Divider,
    Paper,
    CircularProgress,
    Alert,
    Card,
    CardMedia
} from '@mui/material';
import {ShoppingCart, FavoriteBorder, Share, ArrowBack} from '@mui/icons-material';
import {useSnackbar} from 'notistack';
import axiosClient from '../../config/APIConfig.jsx';

export default function ProductDetail() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [imageError, setImageError] = useState(false);
    
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
            const response = await axiosClient.get(`/product/${id}`);
            setProduct(response.data.data);
            setError(null);
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
        console.log('Add to cart:', product.id, quantity);
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

    return (
        <Container sx={{py: 4}}>
            <Button startIcon={<ArrowBack/>} sx={{mb: 2}} onClick={() => navigate(-1)}>
                Quay lại
            </Button>
            
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '400px'
                        }}
                    >
                        {imageError ? (
                            <Box sx={{
                                width: '100%',
                                height: '400px',
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
                                alt={typeof product.name === 'object' ? JSON.stringify(product.name) : product.name}
                                onError={() => setImageError(true)}
                                sx={{
                                    maxHeight: '500px',
                                    objectFit: 'contain'
                                }}
                            />
                        )}
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Box>
                        <Box sx={{display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap'}}>
                            {product.badge && <Chip label={typeof product.badge === 'object' ? JSON.stringify(product.badge) : product.badge} color="primary" size="small"/>}
                            {product.category && <Chip label={typeof product.category === 'object' ? JSON.stringify(product.category) : product.category} variant="outlined" size="small"/>}
                        </Box>
                        
                        <Typography variant="h4" gutterBottom>
                            {typeof product.name === 'object' ? JSON.stringify(product.name) : product.name}
                        </Typography>
                        
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                            <Rating value={product.rating || 4.5} readOnly precision={0.5}/>
                            <Typography variant="body2" color="text.secondary">
                                ({product.reviewCount || 0} đánh giá)
                            </Typography>
                        </Box>
                        
                        <Divider sx={{my: 2}}/>
                        
                        <Box sx={{mb: 3}}>
                            {product.sizes?.[0] ? (
                                <Typography variant="h4" color="primary" sx={{fontWeight: 'bold'}}>
                                    {new Intl.NumberFormat('vi-VN').format(calculateProductPrice(product.sizes[0]))} ₫
                                </Typography>
                            ) : (
                                <Typography variant="h4" color="primary" sx={{fontWeight: 'bold'}}>
                                    N/A
                                </Typography>
                            )}
                        </Box>
                        
                        <Typography variant="body1" paragraph>
                            {typeof product.description === 'object' ? JSON.stringify(product.description) : product.description}
                        </Typography>
                        
                        <Divider sx={{my: 3}}/>
                        
                        <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                            <Typography variant="subtitle1">Số lượng:</Typography>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    -
                                </Button>
                                <Typography sx={{minWidth: '40px', textAlign: 'center'}}>
                                    {quantity}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    +
                                </Button>
                            </Box>
                        </Box>
                        
                        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<ShoppingCart/>}
                                onClick={handleAddToCart}
                                sx={{
                                    flex: 1,
                                    minWidth: '200px',
                                    backgroundColor: '#0D3B2E',
                                    '&:hover': {
                                        backgroundColor: '#1e5a4a',
                                    }
                                }}
                            >
                                Thêm vào giỏ
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<FavoriteBorder/>}
                                onClick={handleAddToWishlist}
                            >
                                Yêu thích
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<Share/>}
                            >
                                Chia sẻ
                            </Button>
                        </Box>
                        
                        <Divider sx={{my: 3}}/>
                        
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Thông tin sản phẩm:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Kích thước: {product.sizes?.[0]?.name || 'N/A'} • Trạng thái: {product.status || 'Còn hàng'}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}
