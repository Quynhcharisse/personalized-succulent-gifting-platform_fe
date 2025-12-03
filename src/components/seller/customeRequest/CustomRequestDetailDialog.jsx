import React, {useEffect, useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Paper,
    Typography,
    Collapse
} from '@mui/material';
import {
    Build as BuildIcon,
    ExpandMore as ExpandMoreIcon,
    Spa as SucculentIcon,
    LocalFlorist as PotIcon,
    Park as SoilIcon,
    AutoAwesome as DecorationIcon,
    Schedule as ScheduleIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import {viewRequestDetailBySeller, processCustomRequest} from '@/services/CustomeRequestService.jsx';
import {useSnackbar} from 'notistack';
import {FENGSHUI, ZODIACS, GENDERS, DASHBOARD_STYLES} from '../../constants.js';
import ActionButton from '../../buttonCustom/ActionButton.jsx';
import ProcessRequestDialog from './ProcessRequestDialog.jsx';

export default function CustomRequestDetailDialog({open, onClose, requestId, onSuccess}) {
    const {enqueueSnackbar} = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [request, setRequest] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        succulents: true,
        pot: true,
        soil: true,
        decorations: true
    });
    const [processDialogOpen, setProcessDialogOpen] = useState(false);
    const [rejecting, setRejecting] = useState(false);

    useEffect(() => {
        if (open && requestId) {
            fetchRequestDetail();
        }
    }, [open, requestId]);

    const fetchRequestDetail = async () => {
        try {
            setLoading(true);
            const response = await viewRequestDetailBySeller(requestId);
            // Handle nested data structure
            const data = response?.data?.data || response?.data || response;
            setRequest(data);
        } catch (error) {
            // Error fetching custom request detail
            setRequest(null);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessSuccess = () => {
        fetchRequestDetail();            // reload chi tiết
        if (onSuccess) onSuccess();      // reload danh sách + đóng dialog trong CustomRequestList
    };

    const handleRejectRequest = async () => {
        if (!request?.id) return;

        try {
            setRejecting(true);
            const requestData = {
                id: request.id,
                images: []
            };

            const response = await processCustomRequest(requestData, "false");
            if (response) {
                enqueueSnackbar('Từ chối yêu cầu thành công', {variant: 'success'});
                if (onSuccess) onSuccess(); // Refresh list data + close dialog
            }
        } catch (error) {
            // Error rejecting request
            const errorMsg = error?.response?.data?.message || 'Từ chối yêu cầu thất bại';
            enqueueSnackbar(errorMsg, {variant: 'error'});
        } finally {
            setRejecting(false);
        }
    };

    const handleToggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Đang chờ duyệt':
                return 'warning';
            case 'Đã duyệt':
                return 'success';
            case 'Đã từ chối':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    const getFengShuiLabel = (value) => {
        const item = FENGSHUI.find(f => f.value === value);
        return item ? item.label : value;
    };

    const getZodiacLabel = (value) => {
        const item = ZODIACS.find(z => z.value === value);
        return item ? item.label : value;
    };

    const getGenderLabel = (value) => {
        const item = GENDERS.find(g => g.value === value);
        return item ? item.label : value;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const getSizeLabel = (size) => {
        const sizeMap = {
            'small': 'Nhỏ',
            'medium': 'Trung bình',
            'large': 'Lớn'
        };
        return sizeMap[size] || size;
    };

    const formatDateArray = (dateArray) => {
        try {
            // Format: [year, month, day, hour, minute, second, nanoseconds]
            const [year, month, day, hour, minute, second] = dateArray;
            const date = new Date(year, month - 1, day, hour, minute, second || 0);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'N/A';
        }
    };

    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        ...DASHBOARD_STYLES.dialog,
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #f8fffe 0%, #ffffff 100%)'
                    }
                }
            }}
        >
            <DialogTitle sx={{
                ...DASHBOARD_STYLES.dialogTitle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 3,
                px: 4
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <BuildIcon sx={{fontSize: '2rem', color: 'white'}}/>
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{fontWeight: 700, mb: 0.5, color: 'white'}}>
                            Chi Tiết Yêu Cầu Tùy Chỉnh
                        </Typography>
                    </Box>
                </Box>
                
                <ActionButton
                    action="cancel"
                    onClick={onClose}
                    sx={{
                        alignSelf: 'flex-end',
                        minWidth: 'auto',
                        px: 2,
                        py: 0.5,
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.25)'
                        }
                    }}
                />
            </DialogTitle>

            <DialogContent sx={{...DASHBOARD_STYLES.dialogContent, 
                maxHeight: '80vh', 
                overflowY: 'auto',
                marginTop: 3
                }}>
                {loading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px'}}>
                        <CircularProgress/>
                    </Box>
                ) : !request ? (
                    <Box sx={{textAlign: 'center', py: 8}}>
                        <Typography variant="h6" color="text.secondary">
                            Không thể tải chi tiết yêu cầu
                        </Typography>
                    </Box>
                ) : (
                    
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        {/* Request Info */}
                        <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        mt: 1
    }}>
        <Button
            variant="contained"
            startIcon={<EditIcon/>}
            onClick={() => setProcessDialogOpen(true)}
            sx={{
                backgroundColor: '#0D3B2E',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                    backgroundColor: '#0a2e22'
                }
            }}
        >
            Cập nhật thiết kế
        </Button>
    </Box>
                        <Card sx={{border: '1px solid #E6F1ED', backgroundColor: '#FAFFFD', borderRadius: 2}}>
                            <CardContent>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2}}>
                                    <Typography variant="h6" sx={{fontWeight: 600, color: '#0D3B2E'}}>
                                        Thông tin yêu cầu
                                    </Typography>
                                    <Chip
                                        label={request.status}
                                        color={getStatusColor(request.status)}
                                        sx={{fontWeight: 600}}
                                    />
                                    
                                </Box>
                                <Box sx={{display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 2}}>
                                    <ScheduleIcon sx={{mr: 1}}/>
                                    <Typography variant="body2">
                                        Tạo lúc: {formatDate(request.createdAt)}
                                    </Typography>
                                </Box>
                                
                            </CardContent>
                        </Card>


                        {/* Buyer Info */}
                        {request.buyer && (
                            <Card sx={{border: '1px solid #E6F1ED', backgroundColor: '#FAFFFD', borderRadius: 2}}>
                                <CardContent>
                                    <Typography variant="h6" sx={{fontWeight: 600, color: '#0D3B2E', mb: 2}}>
                                        Thông tin khách hàng
                                    </Typography>
                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            <Avatar
                                                src={request.buyer.avatarUrl}
                                                sx={{width: 80, height: 80, mr: 2}}
                                            >
                                                {(request.buyer.name || '?').charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" sx={{fontWeight: 600, color: '#0D3B2E'}}>
                                                    {request.buyer.name || 'N/A'}
                                                </Typography>
                                                <Box sx={{display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap'}}>
                                                    {request.buyer.fengShui && (
                                                        <Chip
                                                            size="small"
                                                            label={`Mệnh: ${getFengShuiLabel(request.buyer.fengShui)}`}
                                                            sx={{backgroundColor: '#3b82f6', color: 'white'}}
                                                        />
                                                    )}
                                                    {request.buyer.zodiac && (
                                                        <Chip
                                                            size="small"
                                                            label={getZodiacLabel(request.buyer.zodiac)}
                                                            sx={{backgroundColor: '#a855f7', color: 'white'}}
                                                        />
                                                    )}
                                                    {request.buyer.gender && (
                                                        <Chip
                                                            size="small"
                                                            label={getGenderLabel(request.buyer.gender)}
                                                            sx={{backgroundColor: '#22c55e', color: 'white'}}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">Điện thoại</Typography>
                                                <Typography variant="body1" sx={{fontWeight: 600}}>
                                                    {request.buyer.phone || 'N/A'}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">Địa chỉ</Typography>
                                                <Typography variant="body1" sx={{fontWeight: 600}}>
                                                    {request.buyer.address || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* Custom Data */}
                        {request.customData && request.customData.length > 0 && (
                            <>
                                <Divider sx={{my: 2}}/>
                                <Typography variant="h6" sx={{fontWeight: 600, color: '#0D3B2E', mb: 3}}>
                                    Chi tiết sản phẩm tùy chỉnh
                                </Typography>
                                {request.customData.map((customItem, idx) => (
                                    <Paper key={idx} sx={{border: '1px solid #E6F1ED', backgroundColor: '#FAFFFD', borderRadius: 2, overflow: 'hidden', mb: 3}}>
                                        {/* Succulents */}
                                        {customItem.succulents && customItem.succulents.length > 0 && (
                                            <Box>
                                                <Box 
                                                    sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, cursor: 'pointer'}}
                                                    onClick={() => handleToggleSection('succulents')}
                                                >
                                                    <Typography variant="h6" sx={{fontWeight: 600, color: '#0D3B2E'}}>
                                                        Sen Đá
                                                    </Typography>
                                                    <IconButton size="small">
                                                        <ExpandMoreIcon sx={{
                                                            transform: expandedSections.succulents ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            transition: 'transform 0.3s'
                                                        }}/>
                                                    </IconButton>
                                                </Box>
                                                <Collapse in={expandedSections.succulents}>
                                                    <Box sx={{px: 2, pb: 2}}>
                                                        {customItem.succulents.map((succ, sIdx) => (
                                                            <Box key={sIdx} sx={{display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2, pb: 2, borderBottom: sIdx < customItem.succulents.length - 1 ? '1px solid #E6F1ED' : 'none'}}>
                                                                <Avatar
                                                                    src={succ.image}
                                                                    variant="rounded"
                                                                    sx={{width: 80, height: 80}}
                                                                >
                                                                    <SucculentIcon/>
                                                                </Avatar>
                                                                <Box sx={{flex: 1}}>
                                                                    <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 1}}>
                                                                        {succ.name}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                                                                        {succ.description}
                                                                    </Typography>
                                                                    {succ.size && succ.size.length > 0 && (
                                                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                                                            <Typography variant="body2" sx={{fontWeight: 600}}>Kích thước & Số lượng:</Typography>
                                                                            {succ.size.map((sz, sizeIdx) => (
                                                                                <Box key={sizeIdx} sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                                                                                    <Chip
                                                                                        label={getSizeLabel(sz.name)}
                                                                                        size="small"
                                                                                        sx={{width: 'fit-content', backgroundColor: '#0D3B2E', color: 'white'}}
                                                                                    />
                                                                                    <Typography variant="body2" sx={{fontWeight: 600}}>
                                                                                        Số lượng: {sz.quantity}
                                                                                    </Typography>
                                                                                    <Typography variant="body2" color="success.main" sx={{fontWeight: 600}}>
                                                                                        {formatPrice(sz.price)}
                                                                                    </Typography>
                                                                                </Box>
                                                                            ))}
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Collapse>
                                            </Box>
                                        )}

                                        {/* Pot */}
                                        {customItem.pot && (
                                            <Box sx={{borderTop: '1px solid #E6F1ED'}}>
                                                <Box 
                                                    sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, cursor: 'pointer'}}
                                                    onClick={() => handleToggleSection('pot')}
                                                >
                                                    <Typography variant="h6" sx={{fontWeight: 600, color: '#0D3B2E'}}>
                                                        Chậu
                                                    </Typography>
                                                    <IconButton size="small">
                                                        <ExpandMoreIcon sx={{
                                                            transform: expandedSections.pot ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            transition: 'transform 0.3s'
                                                        }}/>
                                                    </IconButton>
                                                </Box>
                                                <Collapse in={expandedSections.pot}>
                                                    <Box sx={{px: 2, pb: 2}}>
                                                        <Box sx={{display: 'flex', gap: 2, alignItems: 'flex-start'}}>
                                                            {customItem.pot.image && customItem.pot.image.length > 0 && (
                                                                <Avatar
                                                                    src={customItem.pot.image[0]}
                                                                    variant="rounded"
                                                                    sx={{width: 80, height: 80}}
                                                                >
                                                                    <PotIcon/>
                                                                </Avatar>
                                                            )}
                                                            <Box sx={{flex: 1}}>
                                                                <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 1}}>
                                                                    {customItem.pot.name}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                                                                    {customItem.pot.description}
                                                                </Typography>
                                                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 1}}>
                                                                    {customItem.pot.material && (
                                                                        <Box>
                                                                            <Typography variant="body2" color="text.secondary">Chất liệu</Typography>
                                                                            <Typography variant="body2" sx={{fontWeight: 600}}>
                                                                                {customItem.pot.material}
                                                                            </Typography>
                                                                        </Box>
                                                                    )}
                                                                    {customItem.pot.color && (
                                                                        <Box>
                                                                            <Typography variant="body2" color="text.secondary">Màu sắc</Typography>
                                                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                                                <Box sx={{
                                                                                    width: 24,
                                                                                    height: 24,
                                                                                    borderRadius: '50%',
                                                                                    backgroundColor: customItem.pot.color,
                                                                                    border: '1px solid #ddd'
                                                                                }}/>
                                                                                <Typography variant="body2" sx={{fontWeight: 600}}>
                                                                                    {customItem.pot.color}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                    )}
                                                                    {customItem.pot.size && customItem.pot.size.length > 0 && (
                                                                        <Box>
                                                                            <Typography variant="body2" color="text.secondary">Kích thước</Typography>
                                                                            {customItem.pot.size.map((sz, sIdx) => (
                                                                                <Typography key={sIdx} variant="body2" sx={{fontWeight: 600}}>
                                                                                    {getSizeLabel(sz.name)} - {formatPrice(sz.price)}
                                                                                </Typography>
                                                                            ))}
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Collapse>
                                            </Box>
                                        )}

                                        {/* Soil */}
                                        {customItem.soil && (
                                            <Box sx={{borderTop: '1px solid #E6F1ED'}}>
                                                <Box 
                                                    sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, cursor: 'pointer'}}
                                                    onClick={() => handleToggleSection('soil')}
                                                >
                                                    <Typography variant="h6" sx={{fontWeight: 600, color: '#0D3B2E'}}>
                                                        Đất
                                                    </Typography>
                                                    <IconButton size="small">
                                                        <ExpandMoreIcon sx={{
                                                            transform: expandedSections.soil ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            transition: 'transform 0.3s'
                                                        }}/>
                                                    </IconButton>
                                                </Box>
                                                <Collapse in={expandedSections.soil}>
                                                    <Box sx={{px: 2, pb: 2}}>
                                                        <Box sx={{display: 'flex', gap: 2, alignItems: 'flex-start'}}>
                                                            {customItem.soil.image && customItem.soil.image.length > 0 && customItem.soil.image[0]?.url && (
                                                                <Avatar
                                                                    src={customItem.soil.image[0].url}
                                                                    variant="rounded"
                                                                    sx={{width: 80, height: 80}}
                                                                >
                                                                    <SoilIcon/>
                                                                </Avatar>
                                                            )}
                                                            <Box sx={{flex: 1}}>
                                                                <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 1}}>
                                                                    {customItem.soil.name}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" sx={{mb: 1, whiteSpace: 'pre-line'}}>
                                                                    {customItem.soil.description}
                                                                </Typography>
                                                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 1}}>
                                                                    {customItem.soil.massAmount && (
                                                                        <Box>
                                                                            <Typography variant="body2" color="text.secondary">Khối lượng</Typography>
                                                                            <Typography variant="body2" sx={{fontWeight: 600}}>
                                                                                {customItem.soil.massAmount} kg
                                                                            </Typography>
                                                                        </Box>
                                                                    )}
                                                                    {customItem.soil.basePricing && (
                                                                        <Box>
                                                                            <Typography variant="body2" color="text.secondary">Giá cơ bản</Typography>
                                                                            <Typography variant="body2" sx={{fontWeight: 600}}>
                                                                                {formatPrice(customItem.soil.basePricing.price)}
                                                                            </Typography>
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Collapse>
                                            </Box>
                                        )}

                                        {/* Decorations */}
                                        {customItem.decorations && customItem.decorations.length > 0 && (
                                            <Box sx={{borderTop: '1px solid #E6F1ED'}}>
                                                <Box 
                                                    sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, cursor: 'pointer'}}
                                                    onClick={() => handleToggleSection('decorations')}
                                                >
                                                    <Typography variant="h6" sx={{fontWeight: 600, color: '#0D3B2E'}}>
                                                        Đồ Trang Trí
                                                    </Typography>
                                                    <IconButton size="small">
                                                        <ExpandMoreIcon sx={{
                                                            transform: expandedSections.decorations ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            transition: 'transform 0.3s'
                                                        }}/>
                                                    </IconButton>
                                                </Box>
                                                <Collapse in={expandedSections.decorations}>
                                                    <Box sx={{px: 2, pb: 2}}>
                                                        {customItem.decorations.map((decoration, dIdx) => (
                                                            <Box key={dIdx} sx={{display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2, pb: 2, borderBottom: dIdx < customItem.decorations.length - 1 ? '1px solid #E6F1ED' : 'none'}}>
                                                                {decoration.image && decoration.image.length > 0 && (
                                                                    <Avatar
                                                                        src={decoration.image[0]}
                                                                        variant="rounded"
                                                                        sx={{width: 80, height: 80}}
                                                                    >
                                                                        <DecorationIcon/>
                                                                    </Avatar>
                                                                )}
                                                                <Box sx={{flex: 1}}>
                                                                    <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 1}}>
                                                                        {decoration.name}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                                                                        {decoration.description}
                                                                    </Typography>
                                                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 1}}>
                                                                        {decoration.quantity && (
                                                                            <Box>
                                                                                <Typography variant="body2" color="text.secondary">Số lượng</Typography>
                                                                                <Typography variant="body2" sx={{fontWeight: 600}}>
                                                                                    {decoration.quantity}
                                                                                </Typography>
                                                                            </Box>
                                                                        )}
                                                                        {decoration.unitPrice && (
                                                                            <Box>
                                                                                <Typography variant="body2" color="text.secondary">Đơn giá</Typography>
                                                                                <Typography variant="body2" sx={{fontWeight: 600}}>
                                                                                    {formatPrice(decoration.unitPrice)}
                                                                                </Typography>
                                                                            </Box>
                                                                        )}
                                                                        {decoration.totalPrice && (
                                                                            <Box>
                                                                                <Typography variant="body2" color="text.secondary">Tổng tiền</Typography>
                                                                                <Typography variant="body2" color="success.main" sx={{fontWeight: 600}}>
                                                                                    {formatPrice(decoration.totalPrice)}
                                                                                </Typography>
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Collapse>
                                            </Box>
                                        )}
                                    </Paper>
                                ))}
                            </>
                        )}
{/* Latest Version */}
{request.latestVersion && (
    <>
        <Divider sx={{ my: 2 }} />
        <Typography
            variant="h6"
            sx={{
                fontWeight: 700,
                color: "#0D3B2E",
                mb: 2
            }}
        >
            Phiên bản mới nhất
        </Typography>

        <Paper
            sx={{
                border: "1px solid #E6F1ED",
                backgroundColor: "#F0FFF8",
                borderRadius: 2,
                overflow: "hidden",
                mb: 3
            }}
        >
            <Box sx={{ p: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2
                    }}
                >
                    <Box>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700,
                                color: "#0D3B2E"
                            }}
                        >
                        v_{request.latestVersion.parentVersion}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Loại: {request.latestVersion.type === 'design' ? 'Thiết kế' : request.latestVersion.type}
                     </Typography>
                    </Box>

                    <Chip
                        label={
                            request.latestVersion.status === "pending"
                                ? "Đang chờ"
                                : request.latestVersion.status
                        }
                        color={
                            request.latestVersion.status === "pending"
                                ? "warning"
                                : "success"
                        }
                        size="small"
                        sx={{ fontWeight: 600 }}
                    />
                </Box>

                {request.latestVersion.revisionContent && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Nội dung chỉnh sửa:
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{ fontWeight: 500, mt: 0.5 }}
                        >
                            {request.latestVersion.revisionContent}
                        </Typography>
                    </Box>
                )}

                {/* Images */}
                {request.latestVersion.images &&
                    request.latestVersion.images.length > 0 && (
                        <Box>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                            >
                                Ảnh thiết kế ({request.latestVersion.images.length})
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 2
                                }}
                            >
                                {request.latestVersion.images.map(
                                    (img, index) => (
                                        <Avatar
                                            key={index}
                                            src={img}
                                            variant="rounded"
                                            sx={{
                                                width: 130,
                                                height: 130,
                                                border: "2px solid #C6EADF",
                                                cursor: "pointer",
                                                "&:hover": {
                                                    borderColor: "#0D3B2E",
                                                    transform: "scale(1.05)",
                                                    transition: "all 0.2s"
                                                }
                                            }}
                                            onClick={() =>
                                                window.open(img, "_blank")
                                            }
                                        />
                                    )
                                )}
                            </Box>
                        </Box>
                    )}

                {/* Dates */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 3,
                        mt: 2,
                        fontSize: "0.875rem",
                        color: "text.secondary"
                    }}
                >
                    {request.latestVersion.revisionDate && (
                        <Typography variant="body2">
                            Ngày chỉnh sửa:{" "}
                            {formatDateArray(
                                request.latestVersion.revisionDate
                            )}
                        </Typography>
                    )}

                    {request.latestVersion.createDate && (
                        <Typography variant="body2">
                            Ngày tạo:{" "}
                            {formatDateArray(
                                request.latestVersion.createDate
                            )}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "end",
                        gap: 3,
                        mt: 2,
                 
                    }}
                >
                   <Button
                        variant="contained"
                        startIcon={<EditIcon/>}
                        onClick={() => setProcessDialogOpen(true)}
                        sx={{
                            backgroundColor: '#0D3B2E',
                            color: 'white',
                            fontWeight: 600,
                            px: 3,
                            py: 1,
                            '&:hover': {
                                backgroundColor: '#0a2e22'
                            }
                        }}
                    >
                     Cập Nhật Thiết Kế
                    </Button>
                </Box>
            </Box>
        </Paper>
    </>
)}

                        {/* Versions */}
                        {request.versions && request.versions.length > 0 && (
                            <>
                                <Divider sx={{my: 2}}/>
                                <Typography variant="h6" sx={{fontWeight: 600, color: '#0D3B2E', mb: 3}}>
                                    Lịch sử phiên bản thiết kế
                                </Typography>
                                {request.versions.map((version, idx) => (
                                    <Paper key={idx} sx={{border: '1px solid #E6F1ED', backgroundColor: '#FAFFFD', borderRadius: 2, overflow: 'hidden', mb: 2}}>
                                        <Box sx={{p: 2}}>
                                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2}}>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{fontWeight: 600, color: '#0D3B2E'}}>
                                                        {version.version}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Loại: {version.type === 'design' ? 'Thiết kế' : version.type}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={version.status === 'pending' ? 'Đang chờ' : version.status}
                                                    color={version.status === 'pending' ? 'warning' : 'success'}
                                                    size="small"
                                                    sx={{fontWeight: 600}}
                                                />
                                            </Box>
                                            {version.revisionContent && (
                                                <Box sx={{mb: 2}}>
                                                    <Typography variant="body2" color="text.secondary">Nội dung chỉnh sửa:</Typography>
                                                    <Typography variant="body1" sx={{fontWeight: 500, mt: 0.5}}>
                                                        {version.revisionContent}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {version.images && version.images.length > 0 && (
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                                                        Ảnh thiết kế ({version.images.length}):
                                                    </Typography>
                                                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
                                                        {version.images.map((image, imgIdx) => (
                                                            <Avatar
                                                                key={imgIdx}
                                                                src={image}
                                                                variant="rounded"
                                                                sx={{
                                                                    width: 120,
                                                                    height: 120,
                                                                    border: '2px solid #E6F1ED',
                                                                    cursor: 'pointer',
                                                                    '&:hover': {
                                                                        borderColor: '#0D3B2E',
                                                                        transform: 'scale(1.05)',
                                                                        transition: 'all 0.2s'
                                                                    }
                                                                }}
                                                                onClick={() => window.open(image, '_blank')}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}
                                            <Box sx={{display: 'flex', gap: 3, mt: 2, fontSize: '0.875rem', color: 'text.secondary'}}>
                                                {version.revisionDate && (
                                                    <Typography variant="body2">
                                                        Ngày chỉnh sửa: {formatDateArray(version.revisionDate)}
                                                    </Typography>
                                                )}
                                                {version.createDate && (
                                                    <Typography variant="body2">
                                                        Ngày tạo: {formatDateArray(version.createDate)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </Paper>
                                ))}
                            </>
                        )}
                    </Box>
                )}
            </DialogContent>

          

            <ProcessRequestDialog
                open={processDialogOpen}
                onClose={() => setProcessDialogOpen(false)}
                requestId={request?.id}
                onSuccess={handleProcessSuccess}
            />
        </Dialog>
    );
}

