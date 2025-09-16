import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Stack,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Add as AddIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

const ReceiveGoods = () => {
    const [receiveGoodsList, setReceiveGoodsList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    // Mock data for demonstration
    const mockData = [
        {
            id: 1,
            productName: 'Sen đá Echeveria',
            supplier: 'Nhà cung cấp A',
            quantity: 50,
            receivedDate: '2024-01-15',
            status: 'Đã nhận',
            notes: 'Hàng chất lượng tốt'
        },
        {
            id: 2,
            productName: 'Sen đá Bạch điểu',
            supplier: 'Nhà cung cấp B',
            quantity: 30,
            receivedDate: '2024-01-14',
            status: 'Chờ xác nhận',
            notes: 'Cần kiểm tra lại'
        }
    ];

    useEffect(() => {
        loadReceiveGoodsList();
    }, []);

    const loadReceiveGoodsList = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setReceiveGoodsList(mockData);
        } catch (error) {
            console.error('Error loading receive goods list:', error);
            setSubmitMessage({ type: 'error', text: 'Có lỗi xảy ra khi tải danh sách' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetail = (item) => {
        setSelectedItem(item);
        setShowDetailDialog(true);
    };

    const handleCloseDetailDialog = () => {
        setShowDetailDialog(false);
        setSelectedItem(null);
    };

    const handleCloseCreateDialog = () => {
        setShowCreateDialog(false);
        setSubmitMessage({ type: '', text: '' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Đã nhận':
                return 'success';
            case 'Chờ xác nhận':
                return 'warning';
            case 'Đã hủy':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.dark', mb: 1 }}>
                    Quản Lý Nhận Hàng
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Theo dõi và quản lý việc nhận hàng từ nhà cung cấp
                </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowCreateDialog(true)}
                    sx={{
                        background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                        borderRadius: 2,
                        fontWeight: 600,
                        px: 3
                    }}
                >
                    Thêm Phiếu Nhận Hàng
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadReceiveGoodsList}
                    disabled={isLoading}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                    Làm Mới
                </Button>
            </Box>

            {/* Submit Message */}
            {submitMessage.text && (
                <Alert
                    severity={submitMessage.type === 'success' ? 'success' : 'error'}
                    variant="filled"
                    sx={{ mb: 3, fontWeight: 600, borderRadius: 2 }}
                >
                    {submitMessage.text}
                </Alert>
            )}

            {/* Table */}
            <Paper
                elevation={3}
                sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                    border: '1px solid rgba(76, 175, 80, 0.1)'
                }}
            >
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress color="success" />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{
                                    background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
                                    '& .MuiTableCell-head': {
                                        color: 'white',
                                        fontWeight: 800,
                                        fontSize: '1rem',
                                        borderBottom: 'none'
                                    }
                                }}>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Tên Sản Phẩm</TableCell>
                                    <TableCell>Nhà Cung Cấp</TableCell>
                                    <TableCell>Số Lượng</TableCell>
                                    <TableCell>Ngày Nhận</TableCell>
                                    <TableCell>Trạng Thái</TableCell>
                                    <TableCell align="center">Thao Tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {receiveGoodsList.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'rgba(76, 175, 80, 0.05)'
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: 600, color: 'success.dark' }}>
                                            #{item.id}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'success.dark' }}>
                                            {item.productName}
                                        </TableCell>
                                        <TableCell>
                                            {item.supplier}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            {item.quantity}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(item.receivedDate).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.status}
                                                color={getStatusColor(item.status)}
                                                variant="filled"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="Xem chi tiết">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleViewDetail(item)}
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(76, 175, 80, 0.1)'
                                                            }
                                                        }}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Chỉnh sửa">
                                                    <IconButton
                                                        color="secondary"
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(156, 39, 176, 0.1)'
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {receiveGoodsList.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                Không có phiếu nhận hàng nào
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Detail Dialog */}
            <Dialog
                open={showDetailDialog}
                onClose={handleCloseDetailDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(120deg, #f8f9e9 0%, #e0f7fa 100%)'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1.2rem'
                }}>
                    Chi Tiết Phiếu Nhận Hàng
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {selectedItem && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    ID Phiếu:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    #{selectedItem.id}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    Tên Sản Phẩm:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedItem.productName}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    Nhà Cung Cấp:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedItem.supplier}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    Số Lượng:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedItem.quantity}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    Ngày Nhận:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {new Date(selectedItem.receivedDate).toLocaleDateString('vi-VN')}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    Trạng Thái:
                                </Typography>
                                <Chip
                                    label={selectedItem.status}
                                    color={getStatusColor(selectedItem.status)}
                                    variant="filled"
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    Ghi Chú:
                                </Typography>
                                <Typography variant="body1">
                                    {selectedItem.notes}
                                </Typography>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={handleCloseDetailDialog}
                        variant="outlined"
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Dialog */}
            <Dialog
                open={showCreateDialog}
                onClose={handleCloseCreateDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(120deg, #f8f9e9 0%, #e0f7fa 100%)'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1.2rem'
                }}>
                    Thêm Phiếu Nhận Hàng Mới
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Tên Sản Phẩm"
                                placeholder="Nhập tên sản phẩm"
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nhà Cung Cấp"
                                placeholder="Nhập tên nhà cung cấp"
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Số Lượng"
                                type="number"
                                placeholder="Nhập số lượng"
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Ngày Nhận"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Trạng Thái</InputLabel>
                                <Select label="Trạng Thái">
                                    <MenuItem value="Chờ xác nhận">Chờ xác nhận</MenuItem>
                                    <MenuItem value="Đã nhận">Đã nhận</MenuItem>
                                    <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Ghi Chú"
                                placeholder="Nhập ghi chú (tùy chọn)"
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button
                        onClick={handleCloseCreateDialog}
                        variant="outlined"
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)'
                        }}
                    >
                        Tạo Phiếu Nhận Hàng
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReceiveGoods;
