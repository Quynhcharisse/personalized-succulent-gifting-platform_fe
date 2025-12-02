import React, {useEffect, useState, useMemo, useCallback, useRef, memo} from 'react';
import {useNavigate} from 'react-router-dom';
import {Card, CardContent, CardMedia, Typography, Button, Box, Container, TextField, InputAdornment, IconButton, Grid, Chip, Paper, Skeleton, ToggleButtonGroup, ToggleButton, Divider, Stack, FormControl, InputLabel, Select, MenuItem} from '@mui/material';
import {Search, Clear, LocalFlorist, ShoppingCart, Visibility, FilterList, SortByAlpha, AttachMoney, GridView, ViewList, Stars, Spa} from '@mui/icons-material';
import {useSnackbar} from 'notistack';
import {viewProduct} from '@/services/ProductService.jsx';
import {createProductSlug} from '@utils/slugUtil.js';
import {FENGSHUI, ZODIACS} from '../../constants.js';

// Cache key for sessionStorage
const PRODUCTS_CACHE_KEY = 'products_cache';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name'); // name, price-asc, price-desc, newest
    const [priceRange, setPriceRange] = useState('all'); // all, under50k, 50k-100k, 100k-200k, over200k
    const [fengShuiFilter, setFengShuiFilter] = useState('all'); // all, KIM, MOC, THUY, HOA, THO
    const [zodiacFilter, setZodiacFilter] = useState('all'); // all, BACH_DUONG, etc.
    const [viewMode, setViewMode] = useState('grid'); // grid or list
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

    // Memoized filtered and sorted products
    const filteredProducts = useMemo(() => {
        let filtered = [...products];
        
        // Apply search filter
        if (debouncedSearchTerm.trim()) {
            const searchLower = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(product => {
                const productName = typeof product.name === 'object' 
                    ? JSON.stringify(product.name) 
                    : product.name || '';
                const description = product.description || '';
                
                return productName.toLowerCase().includes(searchLower) ||
                       description.toLowerCase().includes(searchLower);
            });
        }
        
        // Apply price range filter
        if (priceRange !== 'all') {
            filtered = filtered.filter(product => {
                const { currentPrice } = getPriceInfo(product);
                switch (priceRange) {
                    case 'under50k':
                        return currentPrice < 50000;
                    case '50k-100k':
                        return currentPrice >= 50000 && currentPrice < 100000;
                    case '100k-200k':
                        return currentPrice >= 100000 && currentPrice < 200000;
                    case 'over200k':
                        return currentPrice >= 200000;
                    default:
                        return true;
                }
            });
        }
        
        // Apply Feng Shui filter - check if ANY succulent matches
        if (fengShuiFilter !== 'all') {
            filtered = filtered.filter(product => {
                // Check if product has fengShui at product level
                if (product.fengShui === fengShuiFilter || product.tags?.includes(fengShuiFilter)) {
                    return true;
                }
                
                // Check all sizes for any succulent with matching fengShui
                return product.sizes?.some(size => {
                    if (!size.succulents || size.succulents.length === 0) return false;
                    
                    return size.succulents.some(succulent => {
                        // API returns 'fengsui' (array) not 'fengShui' (string)
                        const fengsui = succulent.fengsui || succulent.succulent?.fengsui;
                        // Check if the array includes the filter value
                        return Array.isArray(fengsui) && fengsui.includes(fengShuiFilter);
                    });
                });
            });
        }
        
        // Apply Zodiac filter - check if ANY succulent matches
        if (zodiacFilter !== 'all') {
            filtered = filtered.filter(product => {
                // Check if product has zodiac at product level
                if (product.zodiac === zodiacFilter || product.tags?.includes(zodiacFilter)) {
                    return true;
                }
                
                // Check all sizes for any succulent with matching zodiac
                return product.sizes?.some(size => {
                    if (!size.succulents || size.succulents.length === 0) return false;
                    
                    return size.succulents.some(succulent => {
                        // API returns 'zodiacs' (array) not 'zodiac' (string)
                        const zodiacs = succulent.zodiacs || succulent.succulent?.zodiacs;
                        // Check if the array includes the filter value
                        return Array.isArray(zodiacs) && zodiacs.includes(zodiacFilter);
                    });
                });
            });
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    const nameA = (typeof a.name === 'object' ? JSON.stringify(a.name) : a.name || '').toLowerCase();
                    const nameB = (typeof b.name === 'object' ? JSON.stringify(b.name) : b.name || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                case 'price-asc':
                    return getPriceInfo(a).currentPrice - getPriceInfo(b).currentPrice;
                case 'price-desc':
                    return getPriceInfo(b).currentPrice - getPriceInfo(a).currentPrice;
                case 'newest':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                default:
                    return 0;
            }
        });
        
        return filtered;
    }, [debouncedSearchTerm, products, sortBy, priceRange, fengShuiFilter, zodiacFilter, getPriceInfo]);

    // Memoized Product Card Component to prevent unnecessary re-renders
    // Removed ProductCard component - now integrated directly in grid

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

    // Skeleton Loading Component - Enhanced
    const ProductSkeleton = memo(() => (
        <Grid item xs={12} sm={6} md={4} lg={3}>
            <Card 
                elevation={0} 
                sx={{
                    height: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid rgba(13, 59, 46, 0.08)',
                    background: 'white'
                }}
            >
                <Skeleton 
                    variant="rectangular" 
                    sx={{
                        paddingTop: '100%',
                        position: 'relative'
                    }}
                    animation="wave" 
                />
                <CardContent sx={{p: 2.5}}>
                    <Skeleton variant="text" height={48} animation="wave" sx={{mb: 2}} />
                    <Skeleton variant="text" height={32} animation="wave" sx={{mb: 1}} />
                    <Skeleton variant="rectangular" height={36} animation="wave" sx={{borderRadius: 2}} />
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
                        mb: 4,
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(13, 59, 46, 0.2)'
                    }}
                >
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3, mb: 3}}>
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
                                    🌿 Sản Phẩm
                                </Typography>
                                <Typography variant="body2" sx={{opacity: 0.95, fontSize: '0.95rem'}}>
                                    Khám phá {products.length} sản phẩm sen đá độc đáo
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

                {/* Main Content Layout with Sidebar */}
                <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                    {/* Left Sidebar - Filters */}
                    <Paper 
                        elevation={0}
                        sx={{
                            width: 280,
                            flexShrink: 0,
                            p: 2.5,
                            borderRadius: 2,
                            background: 'white',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                            border: '1px solid #e0e0e0',
                            height: 'fit-content',
                            position: 'sticky',
                            top: 20,
                            display: { xs: 'none', md: 'block' }
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D3B2E', mb: 2.5, fontSize: '1.1rem' }}>
                            Bộ lọc
                        </Typography>
                        
                        <Stack spacing={2.5}>
                            {/* Sort */}
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D3B2E', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <SortByAlpha fontSize="small" /> Sắp xếp
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <MenuItem value="name">Tên A-Z</MenuItem>
                                        <MenuItem value="price-asc">Giá thấp đến cao</MenuItem>
                                        <MenuItem value="price-desc">Giá cao đến thấp</MenuItem>
                                        <MenuItem value="newest">Mới nhất</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <Divider />

                            {/* Price Range */}
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D3B2E', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AttachMoney fontSize="small" /> Khoảng giá
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(e.target.value)}
                                    >
                                        <MenuItem value="all">Tất cả</MenuItem>
                                        <MenuItem value="under50k">Dưới 50.000đ</MenuItem>
                                        <MenuItem value="50k-100k">50.000đ - 100.000đ</MenuItem>
                                        <MenuItem value="100k-200k">100.000đ - 200.000đ</MenuItem>
                                        <MenuItem value="over200k">Trên 200.000đ</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <Divider />

                            {/* Feng Shui */}
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D3B2E', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Spa fontSize="small" /> Mệnh phong thủy
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={fengShuiFilter}
                                        onChange={(e) => setFengShuiFilter(e.target.value)}
                                    >
                                        <MenuItem value="all">Tất cả</MenuItem>
                                        {FENGSHUI.map(item => (
                                            <MenuItem key={item.value} value={item.value}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box 
                                                        sx={{ 
                                                            width: 12, 
                                                            height: 12, 
                                                            borderRadius: '50%', 
                                                            backgroundColor: item.color 
                                                        }} 
                                                    />
                                                    {item.label}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            <Divider />

                            {/* Zodiac */}
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0D3B2E', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Stars fontSize="small" /> Cung hoàng đạo
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={zodiacFilter}
                                        onChange={(e) => setZodiacFilter(e.target.value)}
                                    >
                                        <MenuItem value="all">Tất cả</MenuItem>
                                        {ZODIACS.map(item => (
                                            <MenuItem key={item.value} value={item.value}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography>{item.icon}</Typography>
                                                    {item.label}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Stack>

                        {/* Clear All Filters Button */}
                        {(priceRange !== 'all' || fengShuiFilter !== 'all' || zodiacFilter !== 'all') && (
                            <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                    setPriceRange('all');
                                    setFengShuiFilter('all');
                                    setZodiacFilter('all');
                                }}
                                sx={{
                                    mt: 2,
                                    borderColor: '#d32f2f',
                                    color: '#d32f2f',
                                    '&:hover': {
                                        borderColor: '#d32f2f',
                                        backgroundColor: '#ffebee'
                                    }
                                }}
                            >
                                Xóa tất cả bộ lọc
                            </Button>
                        )}
                    </Paper>

                    {/* Right Content - Products */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>

                        {/* Top Bar */}
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 2,
                            pb: 2,
                            borderBottom: '1px solid #e0e0e0'
                        }}>
                            <Chip 
                                icon={<FilterList />}
                                label={`${filteredProducts.length} sản phẩm`}
                                sx={{
                                    fontWeight: 600,
                                    background: '#0D3B2E',
                                    color: 'white'
                                }}
                            />
                            <ToggleButtonGroup
                                value={viewMode}
                                exclusive
                                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                                size="small"
                                sx={{
                                    '& .MuiToggleButton-root': {
                                        borderColor: '#e0e0e0',
                                        '&.Mui-selected': {
                                            backgroundColor: '#0D3B2E',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: '#1a5f4a'
                                            }
                                        }
                                    }
                                }}
                            >
                                <ToggleButton value="grid" aria-label="grid view">
                                    <GridView fontSize="small" />
                                </ToggleButton>
                                <ToggleButton value="list" aria-label="list view">
                                    <ViewList fontSize="small" />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {/* Active Filters Display */}
                        {(debouncedSearchTerm || priceRange !== 'all' || fengShuiFilter !== 'all' || zodiacFilter !== 'all') && (
                            <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', mr: 0.5 }}>
                                        Đang lọc:
                                    </Typography>
                                    
                                    {debouncedSearchTerm && (
                                        <Chip
                                            size="small"
                                            label={`"${debouncedSearchTerm}"`}
                                            onDelete={() => setSearchTerm('')}
                                            sx={{
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2',
                                                height: 24
                                            }}
                                        />
                                    )}
                                    
                                    {priceRange !== 'all' && (
                                        <Chip
                                            size="small"
                                            label={
                                                priceRange === 'under50k' ? 'Dưới 50k' :
                                                priceRange === '50k-100k' ? '50k-100k' :
                                                priceRange === '100k-200k' ? '100k-200k' :
                                                'Trên 200k'
                                            }
                                            onDelete={() => setPriceRange('all')}
                                            sx={{
                                                backgroundColor: '#fff3e0',
                                                color: '#f57c00',
                                                height: 24
                                            }}
                                        />
                                    )}
                                    
                                    {fengShuiFilter !== 'all' && (
                                        <Chip
                                            size="small"
                                            label={FENGSHUI.find(f => f.value === fengShuiFilter)?.label || fengShuiFilter}
                                            onDelete={() => setFengShuiFilter('all')}
                                            sx={{
                                                backgroundColor: FENGSHUI.find(f => f.value === fengShuiFilter)?.color + '20' || '#e8f5e9',
                                                color: FENGSHUI.find(f => f.value === fengShuiFilter)?.color || '#2E7D32',
                                                height: 24
                                            }}
                                        />
                                    )}
                                    
                                    {zodiacFilter !== 'all' && (
                                        <Chip
                                            size="small"
                                            label={`${ZODIACS.find(z => z.value === zodiacFilter)?.icon || ''} ${ZODIACS.find(z => z.value === zodiacFilter)?.label || zodiacFilter}`}
                                            onDelete={() => setZodiacFilter('all')}
                                            sx={{
                                                backgroundColor: '#f3e5f5',
                                                color: '#7b1fa2',
                                                height: 24
                                            }}
                                        />
                                    )}
                                </Stack>
                            </Box>
                        )}

                        {/* Empty State */}
                        {filteredProducts.length === 0 && !loading && (
                            <Paper 
                                elevation={0}
                                sx={{
                                    p: 8,
                                    textAlign: 'center',
                                    background: 'white',
                                    borderRadius: 2,
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                                }}
                            >
                                <LocalFlorist sx={{fontSize: '4rem', color: '#0D3B2E', opacity: 0.2, mb: 2}}/>
                                <Typography variant="h6" sx={{color: '#0D3B2E', fontWeight: 700, mb: 1}}>
                                    {searchTerm ? `Không tìm thấy sản phẩm` : 'Chưa có sản phẩm nào'}
                                </Typography>
                                <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                    {searchTerm ? `Không có sản phẩm nào phù hợp với "${searchTerm}"` : 'Vui lòng quay lại sau'}
                                </Typography>
                            </Paper>
                        )}

                        {/* Products Flexbox Layout */}
                        <Box 
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: { xs: 1.5, sm: 2 },
                                mb: 4
                            }}
                        >
                            {loading ? (
                                // Show skeleton loaders while loading
                                Array.from({ length: 8 }).map((_, index) => (
                                    <Box
                                        key={`skeleton-${index}`}
                                        sx={{
                                            width: { xs: 'calc(50% - 6px)', sm: 'calc(33.333% - 11px)', md: 'calc(25% - 12px)', lg: 'calc(20% - 13px)' },
                                            minWidth: 180
                                        }}
                                    >
                                        <ProductSkeleton />
                                    </Box>
                                ))
                            ) : (
                                filteredProducts.map((product, index) => (
                                    <Box
                                        key={product.id}
                                        sx={{
                                            width: { xs: 'calc(50% - 6px)', sm: 'calc(33.333% - 11px)', md: 'calc(25% - 12px)', lg: 'calc(20% - 13px)' },
                                            minWidth: 180,
                                            display: 'flex'
                                        }}
                                    >
                                <Card
                                    elevation={0}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        position: 'relative',
                                        borderRadius: { xs: 1.5, sm: 2 },
                                        overflow: 'hidden',
                                        border: '1px solid #e0e0e0',
                                        background: 'white',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                            borderColor: '#0D3B2E',
                                            '& .product-image': {
                                                transform: 'scale(1.05)'
                                            },
                                            '& .quick-view-btn': {
                                                opacity: 1
                                            }
                                        }
                                    }}
                                    onClick={() => handleProductClick(product)}
                                >
                                    {/* Discount Badge */}
                                    {(() => {
                                        const { discount } = getPriceInfo(product);
                                        return discount && discount > 0 ? (
                                            <Chip
                                                label={`-${discount}%`}
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 6,
                                                    left: 6,
                                                    zIndex: 3,
                                                    background: '#ff4757',
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem',
                                                    height: '22px',
                                                    '& .MuiChip-label': {
                                                        px: 0.75
                                                    }
                                                }}
                                            />
                                        ) : null;
                                    })()}

                                    {/* Image Container */}
                                    <Box 
                                        sx={{ 
                                            position: 'relative',
                                            paddingTop: '100%',
                                            overflow: 'hidden',
                                            backgroundColor: '#f5f5f5',
                                            borderBottom: '1px solid #e0e0e0'
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            className="product-image"
                                            image={product.images?.[0]?.url || product.thumbnail || '/placeholder.jpg'}
                                            alt={typeof product.name === 'object' ? JSON.stringify(product.name) : product.name}
                                            loading="lazy"
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.3s ease'
                                            }}
                                        />
                                        
                                        {/* Quick View Button */}
                                        <IconButton
                                            className="quick-view-btn"
                                            size="small"
                                            onClick={(e) => handleViewDetail(e, product)}
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                zIndex: 2,
                                                opacity: 0,
                                                transition: 'all 0.2s ease',
                                                background: 'white',
                                                color: '#0D3B2E',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                '&:hover': {
                                                    background: '#0D3B2E',
                                                    color: 'white',
                                                    transform: 'translate(-50%, -50%) scale(1.1)'
                                                }
                                            }}
                                        >
                                            <Visibility />
                                        </IconButton>
                                        
                                        {/* Add to Cart Button */}
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleAddToCart(e, product)}
                                            sx={{
                                                position: 'absolute',
                                                top: 6,
                                                right: 6,
                                                zIndex: 2,
                                                background: 'white',
                                                color: '#0D3B2E',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                width: 32,
                                                height: 32,
                                                '&:hover': {
                                                    background: '#0D3B2E',
                                                    color: 'white'
                                                }
                                            }}
                                        >
                                            <ShoppingCart sx={{ fontSize: '1rem' }} />
                                        </IconButton>
                                    </Box>

                                    <CardContent sx={{ 
                                        flexGrow: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        p: { xs: 1, sm: 1.25 },
                                        '&:last-child': { pb: { xs: 1, sm: 1.25 } }
                                    }}>
                                        {/* Product Name */}
                                        <Typography 
                                            variant="body2"
                                            sx={{
                                                minHeight: { xs: '2.2rem', sm: '2.4rem' },
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                fontWeight: 500,
                                                color: '#333',
                                                mb: 0.75,
                                                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                                lineHeight: 1.3
                                            }}
                                        >
                                            {typeof product.name === 'object' ? JSON.stringify(product.name) : product.name}
                                        </Typography>
                                        
                                        {/* Price Section */}
                                        <Box sx={{ mt: 'auto' }}>
                                            {(() => {
                                                const { currentPrice, originalPrice } = getPriceInfo(product);
                                                return originalPrice ? (
                                                    <Box>
                                                        <Typography 
                                                            variant="caption" 
                                                            sx={{ 
                                                                textDecoration: 'line-through',
                                                                color: '#999',
                                                                fontSize: '0.7rem',
                                                                display: 'block',
                                                                mb: 0.25
                                                            }}
                                                        >
                                                            {new Intl.NumberFormat('vi-VN').format(originalPrice)} ₫
                                                        </Typography>
                                                        <Typography 
                                                            variant="h6" 
                                                            sx={{ 
                                                                fontWeight: 700,
                                                                color: '#d32f2f',
                                                                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                                                                lineHeight: 1
                                                            }}
                                                        >
                                                            {new Intl.NumberFormat('vi-VN').format(currentPrice)} ₫
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ 
                                                            fontWeight: 700,
                                                            color: '#0D3B2E',
                                                            fontSize: { xs: '0.95rem', sm: '1.05rem' },
                                                            lineHeight: 1
                                                        }}
                                                    >
                                                        {currentPrice > 0 ? new Intl.NumberFormat('vi-VN').format(currentPrice) + ' ₫' : 'N/A'}
                                                    </Typography>
                                                );
                                            })()}
                                        </Box>
                                    </CardContent>
                                    </Card>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Box>
                </Box>
        </Container>
        </Box>
    );
}
