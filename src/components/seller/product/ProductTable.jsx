import React, {useEffect, useState} from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    Container,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Inventory as InventoryIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import {deactiveProduct, viewProduct} from '../../../services/ProductService.jsx';
import CreateOrUpdateProductDialog from './CreateOrUpdateProductDialog.jsx';
import useNotify from '../../../hooks/useNotify.js';
import DataTable from '../../common/DataTable.jsx';
import usePagination from '../../../hooks/usePagination.js';
import {DASHBOARD_STYLES} from '../../constants.js';
import ProductViewDialog from "./ProductViewDialog.jsx";
import { useConfirm } from 'material-ui-confirm';

const ProductTable = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const confirm = useConfirm();

    // Pagination hook
    const {page, rowsPerPage, handleChangePage, handleChangeRowsPerPage} = usePagination(0, 10);

    // Dialog states
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const {showNotification} = useNotify();

    // Helper functions
    const STATUS_STYLES = [
        {
            matches: ['available', 'có sẵn', 'co san', 'in_stock', 'in stock', 'đang còn hàng', 'dang con hang'],
            label: 'ĐANG CÒN HÀNG',
            chipSx: {
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)'
            }
        },
        {
            matches: ['unavailable', 'hết hàng', 'het hang', 'out_of_stock', 'out of stock'],
            label: 'HẾT HÀNG',
            chipSx: {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
            }
        },
        {
            matches: ['draft', 'bản nháp', 'ban nhap', 'pending'],
            label: 'BẢN NHÁP',
            chipSx: {
                background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                color: '#1f2937',
                boxShadow: '0 4px 12px rgba(234, 179, 8, 0.25)'
            }
        }
    ];

    const getStatusDisplay = (status) => {
        const normalized = (status ?? '').toString().trim().toLowerCase();
        const matched = STATUS_STYLES.find((style) => style.matches.includes(normalized));

        if (matched) {
            return {
                label: matched.label,
                chipSx: matched.chipSx
            };
        }

        return {
            label: (status ?? 'Không xác định').toString().toUpperCase(),
            chipSx: {
                backgroundColor: '#e5e7eb',
                color: '#374151',
                boxShadow: 'none',
                border: '1px solid rgba(107, 114, 128, 0.35)'
            }
        };
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
            header: 'Tên Sản Phẩm',
            render: (row) => (
                <Typography variant="body1" sx={{fontWeight: 500, color: '#0b3f31'}}>
                    {row.name}
                </Typography>
            )
        },
        {
            field: 'category',
            header: 'Danh Mục',
            render: (row) => (
                <Chip
                    label="SẢN PHẨM"
                    size="small"
                    sx={{
                        backgroundColor: '#0b3f31',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase'
                    }}
                />
            )
        },
        {
            field: 'size',
            header: 'Kích Thước',
            render: (row) => (
                <Typography variant="body2" sx={{color: '#0b3f31', fontWeight: 500}}>
                    {row.sizes?.[0]?.name || 'N/A'}
                </Typography>
            )
        },
        {
            field: 'price',
            header: 'Giá Bán',
            render: (row) => (
                <Typography variant="body2" sx={{color: '#0b3f31', fontWeight: 600}}>
                    {row.sizes?.[0] ? new Intl.NumberFormat('vi-VN').format(calculateSizePrice(row.sizes[0])) + ' ₫' : 'N/A'}
                </Typography>
            )
        },
        {
            field: 'status',
            header: 'Trạng Thái',
            render: (row) => (
                (() => {
                    const status = getStatusDisplay(row.status);
                    return (
                        <Chip
                            label={status.label}
                            size="small"
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.6px',
                                px: 2.2,
                                py: 0.5,
                                borderRadius: '999px',
                                ...status.chipSx
                            }}
                        />
                    );
                })()
            )
        },
        {
            field: 'actions',
            header: 'Thao Tác',
            align: 'center',
            render: (row) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Xem Chi Tiết">
                        <IconButton
                            onClick={() => handleViewProduct(row)}
                            sx={{
                                color: '#0b3f31',
                                '&:hover': {
                                    backgroundColor: 'rgba(11, 63, 49, 0.1)',
                                    transform: 'scale(1.1)'
                                }
                            }}
                        >
                            <ViewIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh Sửa">
                        <IconButton
                            onClick={() => handleEditProduct(row)}
                            sx={{
                                color: '#0b3f31',
                                '&:hover': {
                                    backgroundColor: 'rgba(11, 63, 49, 0.1)',
                                    transform: 'scale(1.1)'
                                }
                            }}
                        >
                            <EditIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa Sản Phẩm">
        <IconButton
          onClick={() => handleDeleteProduct(row)}
          sx={{
            color: 'red',
            '&:hover': {
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              transform: 'scale(1.1)'
            }
          }}
        >
          <DeleteIcon />
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
        if (!product) {
            showNotification('Không xác định được sản phẩm cần chỉnh sửa', 'error');
            return;
        }

        const productClone = JSON.parse(JSON.stringify(product));
        setSelectedProduct(productClone);
        setIsEdit(true);
        setDialogOpen(true);
    };

    // Handle view product details
    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setViewDialogOpen(true);
    };



const handleDeleteProduct = async (product) => {
  try {
    await confirm({
      title: 'Xác nhận xoá sản phẩm',
      description: `Bạn có chắc chắn muốn xoá "${product.name}" không?`,
      confirmationText: 'Xoá',
      cancellationText: 'Huỷ',
      confirmationButtonProps: { color: 'error' },
    });

    const response = await deactiveProduct(product.id);
    showNotification(response.data.message || 'Xoá sản phẩm thành công', 'success');
    loadProducts();
  } catch (err) {
    if (err) { // Nếu người dùng bấm Huỷ thì confirm sẽ ném error, nên check kỹ
      showNotification('Không thể xoá sản phẩm', 'error');
    }
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
        <Container sx={DASHBOARD_STYLES.container}>
            <Paper sx={DASHBOARD_STYLES.paper}>
                <Box sx={DASHBOARD_STYLES.headerSection}>
                    <Box sx={DASHBOARD_STYLES.titleSection}>
                        <InventoryIcon sx={DASHBOARD_STYLES.titleIcon}/>
                        <Box>
                            <Typography sx={DASHBOARD_STYLES.mainTitle}>
                                Quản Lý Sản Phẩm
                            </Typography>
                            <Typography sx={DASHBOARD_STYLES.subtitle}>
                                Quản lý các sản phẩm tổng hợp của bạn tại đây
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={handleCreateProduct}
                        sx={DASHBOARD_STYLES.primaryButton}
                    >
                        Tạo Sản Phẩm Mới
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
                    headerBgColor={DASHBOARD_STYLES.table.headerBgColor}
                    headerTextColor={DASHBOARD_STYLES.table.headerTextColor}
                    hoverColor={DASHBOARD_STYLES.table.hoverColor}
                    borderColor={DASHBOARD_STYLES.table.borderColor}
                    emptyMessage="Không tìm thấy sản phẩm nào"
                    stickyHeader={DASHBOARD_STYLES.table.stickyHeader}
                    size={DASHBOARD_STYLES.table.size}
                />
            </Paper>

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
                getStatusDisplay={getStatusDisplay}
                calculateSizePrice={calculateSizePrice}
                handleEditProduct={handleEditProduct}
            />
        </Container>
    );
};

export default ProductTable;
