import React, {useEffect, useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    Cancel as UnavailableIcon,
    CheckCircle as AvailableIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ExpandMore as ExpandMoreIcon,
    Grass as SoilIcon,
    LocalFlorist as SucculentIcon,
    LocalFlorist as PotIcon,
    MoreVert as MoreVertIcon,
    Search as SearchIcon,
    SortByAlpha as SortIcon,
    Star as DecorationIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import {viewProduct} from '../../../services/ProductService.jsx';
import CreateOrUpdateProductDialog from './CreateOrUpdateProductDialog.jsx';
import useNotify from '../../../hooks/useNotify.js';

const ProductTable = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Dialog states
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    // Menu states
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRowId, setSelectedRowId] = useState(null);

    const {showNotification} = useNotify();

    // Load products
    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await viewProduct();

            if (response && response.data && Array.isArray(response.data)) {
                setProducts(response.data);
                setFilteredProducts(response.data);
            } else {
                setProducts([]);
                setFilteredProducts([]);
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

    // Filter and sort products
    useEffect(() => {
        let filtered = [...products];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(product => product.status === statusFilter);
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'createAt':
                    aValue = new Date(a.createAt);
                    bValue = new Date(b.createAt);
                    break;
                case 'updateAt':
                    aValue = new Date(a.updateAt);
                    bValue = new Date(b.updateAt);
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    aValue = a[sortBy];
                    bValue = b[sortBy];
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredProducts(filtered);
        setPage(0); // Reset to first page when filtering
    }, [products, searchTerm, statusFilter, sortBy, sortOrder]);

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
        setAnchorEl(null);
    };

    // Handle view product details
    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setViewDialogOpen(true);
        setAnchorEl(null);
    };

    // Handle delete product
    const handleDeleteProduct = (product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
        setAnchorEl(null);
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

    // Handle menu actions
    const handleMenuOpen = (event, productId) => {
        setAnchorEl(event.currentTarget);
        setSelectedRowId(productId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRowId(null);
    };

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Handle sorting
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
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
            case 'có sẵn':
                return 'success';
            case 'unavailable':
            case 'hết hàng':
                return 'error';
            case 'draft':
            case 'bản nháp':
                return 'warning';
            default:
                return 'default';
        }
    };

    // Get status label
    const getStatusLabel = (status) => {
        switch (status) {
            case 'available':
            case 'có sẵn':
                return 'Có sẵn';
            case 'unavailable':
            case 'hết hàng':
                return 'Hết hàng';
            case 'draft':
            case 'bản nháp':
                return 'Bản nháp';
            default:
                return status;
        }
    };

    // Calculate total price for a size
    const calculateSizePrice = (size) => {
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

    // Get paginated data
    const paginatedProducts = filteredProducts.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px'}}>
                <CircularProgress size={60}/>
                <Typography variant="h6" sx={{ml: 2}}>
                    Đang tải danh sách sản phẩm...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{p: 3}}>
                <Alert severity="error" sx={{mb: 2}}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={loadProducts}>
                    Thử lại
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{p: 3}}>
            {/* Header */}
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h4" sx={{fontWeight: 700, color: 'success.dark'}}>
                    Bảng sản phẩm
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon/>}
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

            {/* Filters and Search */}
            <Paper sx={{p: 2, mb: 3, borderRadius: 2}}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon/>
                                    </InputAdornment>
                                ),
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                label="Trạng thái"
                            >
                                <MenuItem value="all">Tất cả</MenuItem>
                                <MenuItem value="available">Có sẵn</MenuItem>
                                <MenuItem value="unavailable">Hết hàng</MenuItem>
                                <MenuItem value="draft">Bản nháp</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sắp xếp theo</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                label="Sắp xếp theo"
                            >
                                <MenuItem value="createAt">Ngày tạo</MenuItem>
                                <MenuItem value="updateAt">Ngày cập nhật</MenuItem>
                                <MenuItem value="name">Tên sản phẩm</MenuItem>
                                <MenuItem value="status">Trạng thái</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<SortIcon/>}
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            size="small"
                        >
                            {sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Table */}
            <Paper sx={{borderRadius: 2, overflow: 'hidden'}}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{backgroundColor: '#f5f5f5'}}>
                            <TableRow>
                                <TableCell sx={{fontWeight: 700}}>Hình ảnh</TableCell>
                                <TableCell
                                    sx={{fontWeight: 700, cursor: 'pointer'}}
                                    onClick={() => handleSort('name')}
                                >
                                    Tên sản phẩm
                                    {sortBy === 'name' && (
                                        <SortIcon sx={{ml: 1, fontSize: 16}}/>
                                    )}
                                </TableCell>
                                <TableCell sx={{fontWeight: 700}}>Mô tả</TableCell>
                                <TableCell sx={{fontWeight: 700}}>Kích thước</TableCell>
                                <TableCell
                                    sx={{fontWeight: 700, cursor: 'pointer'}}
                                    onClick={() => handleSort('status')}
                                >
                                    Trạng thái
                                    {sortBy === 'status' && (
                                        <SortIcon sx={{ml: 1, fontSize: 16}}/>
                                    )}
                                </TableCell>
                                <TableCell
                                    sx={{fontWeight: 700, cursor: 'pointer'}}
                                    onClick={() => handleSort('createAt')}
                                >
                                    Ngày tạo
                                    {sortBy === 'createAt' && (
                                        <SortIcon sx={{ml: 1, fontSize: 16}}/>
                                    )}
                                </TableCell>
                                <TableCell sx={{fontWeight: 700}}>Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{textAlign: 'center', py: 4}}>
                                        <Typography variant="body1" color="text.secondary">
                                            Không tìm thấy sản phẩm nào
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedProducts.map((product) => (
                                    <TableRow key={product.id} hover>
                                        <TableCell>
                                            <Avatar
                                                src={product.images?.[0]?.url}
                                                alt={product.name}
                                                sx={{width: 60, height: 60}}
                                                variant="rounded"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                                                {product.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ID: {product.id}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    maxWidth: 200,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {product.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                                                {product.sizes?.slice(0, 2).map((size, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={`${size.name} - ${new Intl.NumberFormat('vi-VN').format(calculateSizePrice(size))}₫`}
                                                        size="small"
                                                        variant="outlined"
                                                        color="success"
                                                    />
                                                ))}
                                                {product.sizes && product.sizes.length > 2 && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        +{product.sizes.length - 2} kích thước khác
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={(product.status === 'available' || product.status === 'có sẵn') ? <AvailableIcon/> : <UnavailableIcon/>}
                                                label={getStatusLabel(product.status)}
                                                color={getStatusColor(product.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(product.createAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{display: 'flex', gap: 1}}>
                                                <Tooltip title="Xem chi tiết">
                                                    <IconButton
                                                        color="info"
                                                        size="small"
                                                        onClick={() => handleViewProduct(product)}
                                                    >
                                                        <ViewIcon/>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Chỉnh sửa">
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => handleEditProduct(product)}
                                                    >
                                                        <EditIcon/>
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Thêm">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenuOpen(e, product.id)}
                                                    >
                                                        <MoreVertIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredProducts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số dòng mỗi trang:"
                    labelDisplayedRows={({from, to, count}) =>
                        `${from}-${to} của ${count !== -1 ? count : `nhiều hơn ${to}`}`
                    }
                />
            </Paper>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    const product = products.find(p => p.id === selectedRowId);
                    if (product) handleViewProduct(product);
                }}>
                    <ListItemIcon>
                        <ViewIcon fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>Xem chi tiết</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    const product = products.find(p => p.id === selectedRowId);
                    if (product) handleEditProduct(product);
                }}>
                    <ListItemIcon>
                        <EditIcon fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>Chỉnh sửa</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    const product = products.find(p => p.id === selectedRowId);
                    if (product) handleDeleteProduct(product);
                }} sx={{color: 'error.main'}}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error"/>
                    </ListItemIcon>
                    <ListItemText>Xóa</ListItemText>
                </MenuItem>
            </Menu>

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
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <ViewIcon/>
                        Chi tiết sản phẩm: {selectedProduct?.name}
                    </Box>
                </DialogTitle>

                <DialogContent sx={{p: 3}}>
                    {selectedProduct && (
                        <Box>
                            {/* Basic Info */}
                            <Box sx={{mb: 3}}>
                                <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>
                                    Thông tin cơ bản
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">Tên sản phẩm:</Typography>
                                        <Typography variant="body1"
                                                    sx={{fontWeight: 500}}>{selectedProduct.name}</Typography>
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

                            <Divider sx={{my: 2}}/>

                            {/* Images */}
                            {selectedProduct.images && selectedProduct.images.length > 0 && (
                                <Box sx={{mb: 3}}>
                                    <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>
                                        Hình ảnh ({selectedProduct.images.length})
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {selectedProduct.images.map((image, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={image.id}>
                                                <Box sx={{position: 'relative'}}>
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

                            <Divider sx={{my: 2}}/>

                            {/* Sizes */}
                            <Box>
                                <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>
                                    Cấu hình kích thước ({selectedProduct.sizes?.length || 0})
                                </Typography>

                                {selectedProduct.sizes?.map((size, sizeIndex) => (
                                    <Accordion key={sizeIndex} sx={{mb: 2}}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                            <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                                Kích
                                                thước: {size.name} - {new Intl.NumberFormat('vi-VN').format(calculateSizePrice(size))}₫
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                {/* Succulents */}
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                                        Sen đá ({size.succulents?.length || 0})
                                                    </Typography>
                                                    <List dense>
                                                        {size.succulents?.map((succulent, index) => (
                                                            <ListItem key={index} sx={{pl: 0}}>
                                                                <ListItemIcon>
                                                                    <SucculentIcon color="success"/>
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={`${succulent.name} ${succulent.size && Array.isArray(succulent.size) ? `(${succulent.size[0]?.name})` : `(${succulent.size?.name})`}`}
                                                                    secondary={`Số lượng: ${succulent.size && Array.isArray(succulent.size) ? succulent.size[0]?.quantity : succulent.quantity} - Giá: ${new Intl.NumberFormat('vi-VN').format(succulent.size && Array.isArray(succulent.size) ? succulent.size[0]?.price : succulent.size?.price || 0)}₫`}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Box>

                                                {/* Pot */}
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                                        Chậu
                                                    </Typography>
                                                    <List dense>
                                                        <ListItem sx={{pl: 0}}>
                                                            <ListItemIcon>
                                                                <PotIcon color="primary"/>
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
                                                    <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                                        Đất trồng
                                                    </Typography>
                                                    <List dense>
                                                        <ListItem sx={{pl: 0}}>
                                                            <ListItemIcon>
                                                                <SoilIcon color="secondary"/>
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
                                                        <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1}}>
                                                            Trang trí ({size.decorations.length})
                                                        </Typography>
                                                        <List dense>
                                                            {size.decorations.map((decoration, index) => (
                                                                <ListItem key={index} sx={{pl: 0}}>
                                                                    <ListItemIcon>
                                                                        <DecorationIcon color="warning"/>
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

                <DialogActions sx={{p: 3}}>
                    <Button onClick={() => setViewDialogOpen(false)}>
                        Đóng
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<EditIcon/>}
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

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>
                    Xác nhận xóa sản phẩm
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa sản phẩm "{productToDelete?.name}"?
                        Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Hủy
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Đang xóa...' : 'Xóa'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductTable;
