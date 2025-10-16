import React, {useEffect, useState} from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    Typography,
    Stack,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import {viewProduct} from '../../../services/ProductService.jsx';
import CreateOrUpdateProductDialog from './CreateOrUpdateProductDialog.jsx';
import ProductViewDialog from './ProductViewDialog.jsx';
import useNotify from '../../../hooks/useNotify.js';
import DataTable from '../../common/DataTable.jsx';
import usePagination from '../../../hooks/usePagination.js';

const ProductTable = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination hook
    const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination(0, 10);

    // Dialog states
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const {showNotification} = useNotify();

    // Helper functions
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

    // Column configuration for DataTable
    const columns = [
        {
            field: 'image',
            header: 'Ảnh',
            align: 'center',
            render: (row) => (
                <Avatar
                    src={row.images?.[0]?.url}
                    alt={row.name}
                    sx={{width: 50, height: 50}}
                    variant="rounded"
                />
            )
        },
        {
            field: 'name',
            header: 'Tên',
            render: (row) => (
                <Typography variant="body1" sx={{fontWeight: 500, color: '#333'}}>
                    {row.name}
                </Typography>
            )
        },
        {
            field: 'category',
            header: 'Danh mục',
            render: (row) => (
                <Chip
                    label="SẢN PHẨM"
                    size="small"
                    sx={{
                        backgroundColor: '#e8f5e9',
                        color: '#388e3c',
                        border: '1px solid #c8e6c9',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase'
                    }}
                />
            )
        },
        {
            field: 'size',
            header: 'Size/Khối lượng',
            render: (row) => (
                <Typography variant="body2" sx={{color: '#333'}}>
                    {row.sizes?.[0]?.name || 'N/A'}
                </Typography>
            )
        },
        {
            field: 'price',
            header: 'Giá',
            render: (row) => (
                <Typography variant="body2" sx={{color: '#333'}}>
                    {row.sizes?.[0] ? new Intl.NumberFormat('vi-VN').format(calculateSizePrice(row.sizes[0])) + ' ₫' : 'N/A'}
                </Typography>
            )
        },
        {
            field: 'status',
            header: 'Trạng thái',
            render: (row) => (
                <Chip
                    label="ACTIVE"
                    size="small"
                    sx={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase'
                    }}
                />
            )
        },
        {
            field: 'actions',
            header: 'Thao tác',
            align: 'center',
            render: (row) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Xem chi tiết">
                        <IconButton
                            color="primary"
                            onClick={() => handleViewProduct(row)}
                            sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}
                        >
                            <ViewIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <IconButton
                            color="secondary"
                            onClick={() => handleEditProduct(row)}
                            sx={{ '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.1)' } }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ];

    // Load products
    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await viewProduct();

            if (response && response.data.data && Array.isArray(response.data.data)) {
                setProducts(response.data.data);
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
                <Typography variant="h4" sx={{fontWeight: 700, color: '#1a472a'}}>
                    Danh sách sản phẩm
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon/>}
                    onClick={handleCreateProduct}
                    sx={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: '#45a049'
                        }
                    }}
                >
                    Tạo sản phẩm mới
                </Button>
            </Box>


            {/* DataTable */}
            <DataTable
                data={products}
                columns={columns}
                loading={loading}
                pagination={true}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={products.length}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                headerBgColor="#4CAF50"
                headerTextColor="white"
                hoverColor="#f8f9fa"
                borderColor="#e0e0e0"
                emptyMessage="Không tìm thấy sản phẩm nào"
                stickyHeader={false}
                size="medium"
            />


            {/* Create/Edit Dialog */}
            <CreateOrUpdateProductDialog
                open={dialogOpen}
                onClose={handleDialogClose}
                onCreate={handleProductSaved}
                editProduct={selectedProduct}
                isEdit={isEdit}
            />

            {/* View Product Dialog */}
            <ProductViewDialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                selectedProduct={selectedProduct}
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
                calculateSizePrice={calculateSizePrice}
                handleEditProduct={handleEditProduct}
            />

        </Box>
    );
};

export default ProductTable;
