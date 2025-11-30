import React, {useEffect, useState, useMemo, useCallback, useRef, memo} from 'react';
import {useNavigate} from 'react-router-dom';
import {Card, CardContent, CardMedia, Typography, Button, Box, Container, TextField, InputAdornment, IconButton, Grid, Chip, Paper, Skeleton} from '@mui/material';
import {Search, Clear, LocalFlorist, ShoppingCart, Visibility} from '@mui/icons-material';
import {useSnackbar} from 'notistack';
import {viewProduct} from '@/services/ProductService.jsx';
import {createProductSlug} from '@utils/slugUtil.js';

// Cache key for sessionStorage
const PRODUCTS_CACHE_KEY = 'products_cache';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();
    const debounceTimerRef = useRef(null);
    
    // Check if user is logged in
    const isLoggedIn = useCallback(() => {
        const user = sessionStorage.getItem('user');
        return !!user;
    }, []);

    // Debounce search term to avoid excessive filtering
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms delay

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchTerm]);

    // Load cached data first for instant display
    useEffect(() => {
        const loadCachedData = () => {
            try {
                const cached = sessionStorage.getItem(PRODUCTS_CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    const now = Date.now();
                    
                    // Use cache if it's still valid (less than 5 minutes old)
                    if (now - timestamp < CACHE_EXPIRY_TIME) {
                        setProducts(data);
                        setLoading(false);
                        return true; // Cache was used
                    } else {
                        // Cache expired, remove it
                        sessionStorage.removeItem(PRODUCTS_CACHE_KEY);
                    }
                }
            } catch (error) {
                console.error('Error loading cached products:', error);
            }
            return false; // Cache was not used
        };

        const cacheUsed = loadCachedData();
        if (!cacheUsed) {
            fetchProducts();
        } else {
            // Still fetch fresh data in background
            fetchProducts(true);
        }
    }, []);

    // Memoized filtered products - only recalculate when debouncedSearchTerm or products change
    const filteredProducts = useMemo(() => {
        if (!debouncedSearchTerm.trim()) {
            return products;
        }
        
        const searchLower = debouncedSearchTerm.toLowerCase();
        return products.filter(product => {
            const productName = typeof product.name === 'object' 
                ? JSON.stringify(product.name) 
                : product.name || '';
            const description = product.description || '';
            
            return productName.toLowerCase().includes(searchLower) ||
                   description.toLowerCase().includes(searchLower);
        });
    }, [debouncedSearchTerm, products]);

    const fetchProducts = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }
            
            // Try to get all products (accessible without auth)
            const response = await viewProduct();
            const productsData = response.data.data || [];
            
            setProducts(productsData);
            
            // Cache the data in sessionStorage
            try {
                sessionStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify({
                    data: productsData,
                    timestamp: Date.now()
                }));
            } catch (error) {
                console.warn('Failed to cache products:', error);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            // Even if error, set empty array and stop loading
            setProducts([]);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    // Memoized price calculation function
    const calculateProductPrice = useCallback((size) => {
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
    }, []);

    // Memoized price info calculation
    const getPriceInfo = useCallback((product) => {
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
    }, [calculateProductPrice]);

    // Memoized Product Card Component to prevent unnecessary re-renders
    const ProductCard = memo(({ product, onProductClick, onAddToCart, onViewDetail, getPriceInfo }) => {
        const { currentPrice, originalPrice, discount } = getPriceInfo(product);
        const productName = typeof product.name === 'object' ? JSON.stringify(product.name) : product.name;
        const productImage = product.images?.[0]?.url || product.thumbnail || '/placeholder.jpg';
        
        return (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} sx={{maxWidth: {xs: '100%', sm: '320px', md: '300px', lg: '280px', xl: '270px'}}}>
                <Card
                    elevation={0}
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        maxWidth: '100%',
                        margin: '0 auto',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px rgba(13, 59, 46, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
                        '&:hover': {
                            transform: 'translateY(-16px) scale(1.03)',
                            boxShadow: '0 24px 48px rgba(13, 59, 46, 0.25), 0 8px 16px rgba(0, 0, 0, 0.12)',
                            borderColor: 'rgba(13, 59, 46, 0.3)',
                            background: 'rgba(255, 255, 255, 1)',
                            '& .product-image': {
                                transform: 'scale(1.15) rotate(2deg)'
                            },
                            '& .product-overlay': {
                                opacity: 1
                            },
                            '& .action-icons': {
                                opacity: 1,
                                transform: 'translateY(0)'
                            },
                            '& .view-detail-btn': {
                                opacity: 1,
                                transform: 'translateY(0)'
                            }
                        }
                    }}
                >
                    {/* Discount Badge - Enhanced */}
                    {discount && discount > 0 && (
                        <Chip
                            label={`🔥 -${discount}%`}
                            sx={{
                                position: 'absolute',
                                top: 16,
                                left: 16,
                                zIndex: 3,
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)',
                                color: 'white',
                                fontWeight: 900,
                                fontSize: '0.95rem',
                                height: '42px',
                                px: 2.5,
                                boxShadow: '0 6px 20px rgba(255, 71, 87, 0.5), 0 2px 8px rgba(0, 0, 0, 0.2)',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                backdropFilter: 'blur(10px)',
                                animation: 'pulse 2s ease-in-out infinite',
                                '@keyframes pulse': {
                                    '0%, 100%': {
                                        transform: 'scale(1)'
                                    },
                                    '50%': {
                                        transform: 'scale(1.05)'
                                    }
                                },
                                '& .MuiChip-label': {
                                    px: 1.5,
                                    letterSpacing: '0.5px'
                                }
                            }}
                        />
                    )}

                    {/* Action Icons - Enhanced Glass Morphism */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            zIndex: 3,
                            display: 'flex',
                            gap: 1.5,
                            opacity: 0,
                            transform: 'translateY(-10px)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            '& .MuiIconButton-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 4px 16px rgba(13, 59, 46, 0.2)',
                                border: '2px solid rgba(255, 255, 255, 0.6)',
                                '&:hover': {
                                    backgroundColor: '#0D3B2E',
                                    color: 'white',
                                    transform: 'scale(1.15) rotate(5deg)',
                                    boxShadow: '0 6px 20px rgba(13, 59, 46, 0.4)',
                                    borderColor: '#0D3B2E'
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }
                        }}
                        className="action-icons"
                    >
                        {/* View Detail Icon */}
                        <IconButton
                            size="small"
                            onClick={(e) => onViewDetail(e, product)}
                            sx={{
                                width: 44,
                                height: 44,
                                color: '#0D3B2E'
                            }}
                            title="Xem chi tiết"
                        >
                            <Visibility sx={{fontSize: '1.3rem'}}/>
                        </IconButton>
                        
                        {/* Shopping Cart Icon */}
                        <IconButton
                            size="small"
                            onClick={(e) => onAddToCart(e, product)}
                            sx={{
                                width: 44,
                                height: 44,
                                color: '#0D3B2E'
                            }}
                            title="Thêm vào giỏ"
                        >
                            <ShoppingCart sx={{fontSize: '1.3rem'}}/>
                        </IconButton>
                    </Box>
                    
                    {/* Image Container with Overlay */}
                    <Box 
                        onClick={() => onProductClick(product.id)}
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
                                background: 'linear-gradient(135deg, rgba(13,59,46,0.1) 0%, rgba(29,89,74,0.3) 50%, rgba(13,59,46,0.4) 100%)',
                                zIndex: 1,
                                opacity: 0,
                                transition: 'opacity 0.5s ease',
                                backdropFilter: 'blur(2px)'
                            }}
                        />
                        <CardMedia
                            component="img"
                            className="product-image"
                            image={productImage}
                            alt={productName}
                            loading="lazy"
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
                            
                            {/* View Detail Button - Enhanced */}
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<Visibility />}
                                onClick={(e) => onViewDetail(e, product)}
                                className="view-detail-btn"
                                sx={{
                                    background: 'linear-gradient(135deg, #0D3B2E 0%, #1a5f4a 100%)',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    py: 1.5,
                                    borderRadius: 2.5,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 16px rgba(13, 59, 46, 0.3)',
                                    opacity: 0.95,
                                    transform: 'translateY(5px)',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1a5f4a 0%, #2d8659 100%)',
                                        boxShadow: '0 8px 24px rgba(13, 59, 46, 0.4)',
                                        transform: 'translateY(0)',
                                        opacity: 1
                                    }
                                }}
                            >
                                Xem Chi Tiết
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        );
    });
    ProductCard.displayName = 'ProductCard';

    const handleProductClick = useCallback((product) => {
        const productName = typeof product.name === 'object' ? JSON.stringify(product.name) : product.name;
        const slug = createProductSlug(productName, product.id);
        navigate(`/product/${slug}`);
    }, [navigate]);
    
    const handleAddToCart = useCallback((e, product) => {
        e.stopPropagation(); // Prevent navigation when clicking button
        if (!isLoggedIn()) {
            enqueueSnackbar('Vui lòng đăng nhập để thêm vào giỏ hàng', {variant: 'info'});
            navigate('/login');
            return;
        }
        // TODO: Implement add to cart functionality
        console.log('Add to cart:', product.id);
        enqueueSnackbar('Đã thêm vào giỏ hàng', {variant: 'success'});
    }, [isLoggedIn, enqueueSnackbar, navigate]);

    const handleViewDetail = useCallback((e, product) => {
        e.stopPropagation();
        const productName = typeof product.name === 'object' ? JSON.stringify(product.name) : product.name;
        const slug = createProductSlug(productName, product.id);
        navigate(`/product/${slug}`);
    }, [navigate]);

    // Removed custom request on product card

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    // Skeleton Loading Component
    const ProductSkeleton = memo(() => (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} sx={{maxWidth: {xs: '100%', sm: '320px', md: '300px', lg: '280px', xl: '270px'}}}>
            <Card elevation={0} sx={{height: '100%', borderRadius: 4, overflow: 'hidden'}}>
                <Skeleton variant="rectangular" height={280} animation="wave" />
                <CardContent sx={{p: 3}}>
                    <Skeleton variant="text" height={56} animation="wave" sx={{mb: 2}} />
                    <Skeleton variant="rectangular" height={60} animation="wave" sx={{mb: 2, borderRadius: 2}} />
                    <Skeleton variant="rectangular" height={48} animation="wave" sx={{borderRadius: 2}} />
                </CardContent>
            </Card>
        </Grid>
    ));
    ProductSkeleton.displayName = 'ProductSkeleton';

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
                    {loading ? (
                        // Show skeleton loaders while loading
                        Array.from({ length: 8 }).map((_, index) => (
                            <ProductSkeleton key={`skeleton-${index}`} />
                        ))
                    ) : (
                        filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onProductClick={handleProductClick}
                                onAddToCart={handleAddToCart}
                                onViewDetail={handleViewDetail}
                                getPriceInfo={getPriceInfo}
                            />
                        ))
                    )}
                </Grid>
        </Container>
        </Box>
    );
}
