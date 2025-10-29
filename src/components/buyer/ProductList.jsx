import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Card, CardContent, CardMedia, Grid, Typography, Button, Box, Container, CircularProgress, Alert, TextField, InputAdornment, IconButton} from '@mui/material';
import {Search, Clear} from '@mui/icons-material';
import {useSnackbar} from 'notistack';
import {viewProduct} from '../../services/ProductService.jsx';

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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    if (loading) {
        return (
            <Container sx={{py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container sx={{py: 4}}>
            <Box sx={{mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2}}>
                <Typography variant="h4">
                    Sản phẩm
                </Typography>
                <TextField
                    variant="outlined"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    size="small"
                    sx={{minWidth: '300px'}}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={handleClearSearch}>
                                    <Clear />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            </Box>

            {filteredProducts.length === 0 && !loading && (
                <Alert severity="info" sx={{mb: 3}}>
                    {searchTerm ? `Không tìm thấy sản phẩm nào cho "${searchTerm}"` : 'Chưa có sản phẩm nào'}
                </Alert>
            )}

            <Grid container spacing={3}>
                {filteredProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                        <Card
                            sx={{
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: 6
                                }
                            }}
                            onClick={() => handleProductClick(product.id)}
                        >
                            <CardMedia
                                component="img"
                                height="200"
                                image={product.images?.[0]?.url || product.thumbnail || '/placeholder.jpg'}
                                alt={typeof product.name === 'object' ? JSON.stringify(product.name) : product.name}
                            />
                            <CardContent>
                                <Typography variant="h6" gutterBottom noWrap>
                                    {typeof product.name === 'object' ? JSON.stringify(product.name) : product.name}
                                </Typography>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <Typography variant="h6" color="primary">
                                        {product.sizes?.[0] ? new Intl.NumberFormat('vi-VN').format(calculateProductPrice(product.sizes[0])) + ' ₫' : 'N/A'}
                                    </Typography>
                                    <Button 
                                        variant="contained" 
                                        size="small"
                                        onClick={(e) => handleAddToCart(e, product)}
                                    >
                                        Thêm giỏ
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
