import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Card, CardContent, CardMedia, Typography, Button, Box, Container, CircularProgress, TextField, InputAdornment, IconButton, Grid, Chip, Paper} from '@mui/material';
import {Search, Clear, LocalFlorist, ShoppingCart, Visibility} from '@mui/icons-material';
import {useSnackbar} from 'notistack';
import {viewProduct} from '../../../services/ProductService.jsx';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();
    
    // Check if user is logged in
    const isLoggedIn = () => {
        const user = localStorage.getItem('user');
        return !!user;
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Filter products based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredProducts(filtered);
        }
    }, [searchTerm, products]);

    const fetchProducts = async () => {
        try {
            // Try to get all products (accessible without auth)
            const response = await viewProduct();
            setProducts(response.data.data || []);
            setFilteredProducts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            // Even if error, set empty array and stop loading
            setProducts([]);
            setFilteredProducts([]);
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
                // New structure: size is array with quantity
                succulent.size.forEach(sizeItem => {
                    totalPrice += (sizeItem.price || 0) * (sizeItem.quantity || 1);
                });
            } else if (succulent.size?.price) {
                // Old structure: size is object
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

    const getPriceInfo = (product) => {
        if (!product.sizes || product.sizes.length === 0) {
            return { currentPrice: 0, originalPrice: null, discount: null };
        }

        const prices = product.sizes.map(size => calculateProductPrice(size));
        const minPrice = Math.min(...prices);
        const currentPrice = minPrice;

        // Discount can be calculated or from API (for now, assume no discount)
        const discount = product.discountPercentage || null;
        const originalPrice = discount && discount > 0 
            ? Math.round(currentPrice / (1 - discount / 100))
            : null;
        
        return { currentPrice, originalPrice, discount };
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };
    
    const handleAddToCart = (e, product) => {
        e.stopPropagation(); // Prevent navigation when clicking button
        if (!isLoggedIn()) {
            enqueueSnackbar('Vui lòng đăng nhập để thêm vào giỏ hàng', {variant: 'info'});
            navigate('/login');
            return;
        }
        // TODO: Implement add to cart functionality
        console.log('Add to cart:', product.id);
        enqueueSnackbar('Đã thêm vào giỏ hàng', {variant: 'success'});
    };

    const handleViewDetail = (e, productId) => {
        e.stopPropagation();
        navigate(`/product/${productId}`);
    };

    // Removed custom request on product card

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    if (loading) {
        return (
            <Box sx={{
                minHeight: '60vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%)'
            }}>
                <CircularProgress sx={{color: '#0D3B2E'}} />
            </Box>
        );
    }

    return (
        <Box sx={{minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%)', py: 6}}>
            <Container maxWidth="xl">
                {/* Header Section with Gradient */}
                <Paper 
                    elevation={0}
                    sx={{
                        background: 'linear-gradient(135deg, #0D3B2E 0%, #1e5a4a 100%)',
                        borderRadius: 4,
                        p: 4,
                        mb: 5,
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(13, 59, 46, 0.2)'
                    }}
                >
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3}}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backdropFilter: 'blur(10px)',
                                    border: '2px solid rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                <LocalFlorist sx={{fontSize: '2.5rem', color: 'white'}}/>
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{fontWeight: 800, mb: 0.5, fontSize: {xs: '1.75rem', md: '2.125rem'}}}>
                                    Sản Phẩm
                                </Typography>
                                <Typography variant="body2" sx={{opacity: 0.95, fontSize: '0.95rem'}}>
                                    Khám phá bộ sưu tập sen đá độc đáo của chúng tôi
                </Typography>
                            </Box>
                        </Box>
                <TextField
                    variant="outlined"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                            size="medium"
                            sx={{
                                minWidth: {xs: '100%', sm: '380px'},
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                borderRadius: 2,
                                backdropFilter: 'blur(10px)',
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        borderWidth: 2
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.8)',
                                    },
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    opacity: 1
                                }
                            }}
                            slotProps={{
                                input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                            <Search sx={{color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.5rem'}}/>
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                            <IconButton 
                                                size="small" 
                                                onClick={handleClearSearch}
                                                sx={{color: 'rgba(255, 255, 255, 0.9)'}}
                                            >
                                    <Clear />
                                </IconButton>
                            </InputAdornment>
                        )
                                }
                    }}
                />
            </Box>
                </Paper>

                {/* Empty State */}
            {filteredProducts.length === 0 && !loading && (
                    <Paper 
                        elevation={0}
                        sx={{
                            p: 8,
                            textAlign: 'center',
                            background: 'white',
                            borderRadius: 4,
                            mb: 4,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                        }}
                    >
                        <LocalFlorist sx={{fontSize: '5rem', color: '#0D3B2E', opacity: 0.2, mb: 2}}/>
                        <Typography variant="h5" sx={{color: '#0D3B2E', fontWeight: 700, mb: 1}}>
                            {searchTerm ? `Không tìm thấy sản phẩm` : 'Chưa có sản phẩm nào'}
                        </Typography>
                        <Typography variant="body1" sx={{color: 'text.secondary'}}>
                            {searchTerm ? `Không có sản phẩm nào phù hợp với "${searchTerm}"` : 'Vui lòng quay lại sau'}
                        </Typography>
                    </Paper>
                )}

                {/* Products Grid */}
                <Grid container spacing={4} sx={{justifyContent: {xs: 'flex-start', sm: 'center'}}}>
                    {filteredProducts.map((product) => {
                        const { currentPrice, originalPrice, discount } = getPriceInfo(product);
                        const productName = typeof product.name === 'object' ? JSON.stringify(product.name) : product.name;
                        const productImage = product.images?.[0]?.url || product.thumbnail || '/placeholder.jpg';
                        
                        return (
                            <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={product.id} sx={{maxWidth: {xs: '100%', sm: '320px', md: '300px', lg: '280px', xl: '270px'}}}>
                        <Card
                                    elevation={0}
                            sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                cursor: 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        maxWidth: '100%',
                                        margin: '0 auto',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        border: '1px solid rgba(13, 59, 46, 0.08)',
                                        background: 'white',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                                        '&:hover': {
                                            transform: 'translateY(-12px) scale(1.02)',
                                            boxShadow: '0 20px 40px rgba(13, 59, 46, 0.2)',
                                            borderColor: '#0D3B2E',
                                            '& .product-image': {
                                                transform: 'scale(1.1)'
                                            },
                                            '& .product-overlay': {
                                                opacity: 1
                                            },
                                            '& .action-icons': {
                                                opacity: 1
                                            }
                                        }
                                    }}
                                >
                                    {/* Discount Badge */}
                                    {discount && discount > 0 && (
                                        <Chip
                                            label={`-${discount}%`}
                                            sx={{
                                                position: 'absolute',
                                                top: 12,
                                                left: 12,
                                                zIndex: 3,
                                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                                                color: 'white',
                                                fontWeight: 800,
                                                fontSize: '0.875rem',
                                                height: '38px',
                                                px: 2,
                                                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.5)',
                                                '& .MuiChip-label': {
                                                    px: 1.5
                                                }
                                            }}
                                        />
                                    )}

                                    {/* Action Icons - View and Custom Request */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            zIndex: 3,
                                            display: 'flex',
                                            gap: 1,
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease',
                                            '& .MuiIconButton-root': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                backdropFilter: 'blur(10px)',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                '&:hover': {
                                                    backgroundColor: 'white',
                                                    transform: 'scale(1.1)',
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                                                },
                                                transition: 'all 0.2s ease'
                                            }
                                        }}
                                        className="action-icons"
                                    >
                                        {/* View Detail Icon */}
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleViewDetail(e, product.id)}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                color: '#0D3B2E'
                                            }}
                                            title="Xem chi tiết"
                                        >
                                            <Visibility sx={{fontSize: '1.2rem'}}/>
                                        </IconButton>
                                        
                                        {/* Custom request entry removed from product list */}
                                    </Box>
                                    
                                    {/* Image Container with Overlay */}
                                    <Box 
                            onClick={() => handleProductClick(product.id)}
                                        sx={{ 
                                            flexGrow: 1,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            backgroundColor: '#f8f9fa',
                                            height: '280px'
                                        }}
                                    >
                                        <Box
                                            className="product-overlay"
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(13,59,46,0.15) 100%)',
                                                zIndex: 1,
                                                opacity: 0,
                                                transition: 'opacity 0.3s ease'
                                            }}
                                        />
                            <CardMedia
                                component="img"
                                            className="product-image"
                                            image={productImage}
                                            alt={productName}
                                            sx={{
                                                objectFit: 'cover',
                                                width: '100%',
                                                height: '100%',
                                                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        />
                                    </Box>

                                    <CardContent sx={{ 
                                        flexGrow: 1, 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        p: 3,
                                        '&:last-child': {
                                            pb: 3
                                        }
                                    }}>
                                        {/* Product Name */}
                                        <Typography 
                                            variant="h6" 
                                            gutterBottom 
                                            sx={{
                                                minHeight: '3.5rem',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                fontWeight: 700,
                                                color: '#0D3B2E',
                                                mb: 2.5,
                                                fontSize: '1.1rem',
                                                lineHeight: 1.5
                                            }}
                                        >
                                            {productName}
                                        </Typography>
                                        
                                        <Box sx={{ mt: 'auto' }}>
                                            {/* Price Section */}
                                            <Box sx={{ 
                                                mb: 2.5,
                                                p: 2,
                                                background: 'linear-gradient(135deg, #f0f8f4 0%, #e8f5e9 100%)',
                                                borderRadius: 2.5,
                                                border: '1px solid rgba(13, 59, 46, 0.1)'
                                            }}>
                                                {originalPrice ? (
                                                    <Box>
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
                                                            <Typography 
                                                                variant="body2" 
                                                                sx={{ 
                                                                    textDecoration: 'line-through',
                                                                    color: '#757575',
                                                                    fontSize: '0.875rem'
                                                                }}
                                                            >
                                                                {new Intl.NumberFormat('vi-VN').format(originalPrice)} ₫
                                                            </Typography>
                                                            <Chip 
                                                                label="Giảm giá" 
                                                                size="small"
                                                                sx={{
                                                                    height: '22px',
                                                                    fontSize: '0.7rem',
                                                                    background: '#ff6b6b',
                                                                    color: 'white',
                                                                    fontWeight: 700
                                                                }}
                                                            />
                                                        </Box>
                                                        <Typography 
                                                            variant="h5" 
                                                            sx={{ 
                                                                fontWeight: 800, 
                                                                color: '#0D3B2E',
                                                                fontSize: '1.6rem'
                                                            }}
                                                        >
                                                            {new Intl.NumberFormat('vi-VN').format(currentPrice)} ₫
                                </Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography 
                                                        variant="h5" 
                                                        sx={{ 
                                                            fontWeight: 800, 
                                                            color: '#0D3B2E',
                                                            fontSize: '1.6rem'
                                                        }}
                                                    >
                                                        {currentPrice > 0 ? new Intl.NumberFormat('vi-VN').format(currentPrice) + ' ₫' : 'N/A'}
                                    </Typography>
                                                )}
                                            </Box>                                 
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                        );
                    })}
            </Grid>
        </Container>
        </Box>
    );
}
