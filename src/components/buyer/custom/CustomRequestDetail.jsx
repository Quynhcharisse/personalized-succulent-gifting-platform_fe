import React, {useEffect, useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Collapse,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import {
    ArrowBack,
    AutoAwesome as DecorationIcon,
    Build,
    Edit as EditIcon,
    Event as EventIcon,
    ExpandMore as ExpandMoreIcon,
    LocalFlorist as PotIcon,
    Park as SoilIcon,
    Schedule,
    Spa as SucculentIcon,
    ConfirmationNumberRounded
} from '@mui/icons-material';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {useSnackbar} from 'notistack';
import {confirmCustomRequest, createRevision, viewCustomProductRequestByBuyer} from '@/services/CustomeRequestService.jsx';
import {FENGSHUI, GENDERS, ZODIACS} from '../../constants.js';


export default function CustomRequestDetail() {
    const {id: idParam} = useParams();
    const location = useLocation();
    const stateId = location?.state?.id;
    const id = stateId ?? idParam;
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();
    const [showDialog, setShowDialog] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [loading, setLoading] = useState(true);
    const [request, setRequest] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        succulents: true,
        pot: true,
        soil: true,
        decorations: true,
        versions: false
    });
    const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
    const [revisionComment, setRevisionComment] = useState('');
    const [submittingRevision, setSubmittingRevision] = useState(false);

    const CUSTOM_REQUESTS_CACHE_KEY = 'custom_requests_cache';
    const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

    useEffect(() => {
        if (sessionStorage.getItem("user") == null) {
            window.location.href = "/login";
            return;
        }

        fetchCustomRequestDetail();
    }, [id]);

    const getCachedRequests = () => {
        try {
            const cached = sessionStorage.getItem(CUSTOM_REQUESTS_CACHE_KEY);
            if (!cached) return null;

            const {data, timestamp} = JSON.parse(cached);
            const now = Date.now();

            // Check if cache is still valid
            if (now - timestamp < CACHE_EXPIRY_TIME) {
                return data;
            }

            // Cache expired, remove it
            sessionStorage.removeItem(CUSTOM_REQUESTS_CACHE_KEY);
            return null;
        } catch (error) {
            return null;
        }
    };

    const fetchCustomRequestDetail = async () => {
        try {
            setLoading(true);

            // Try to get from cache first
            const cachedData = getCachedRequests();
            if (cachedData) {
                const foundRequest = Array.isArray(cachedData) 
                    ? cachedData.find(req => req.id.toString() === id.toString()) 
                    : null;
                
                if (foundRequest) {
                    setRequest(foundRequest);
                    setLoading(false);
                    // Fetch fresh data in background
                    fetchFreshData();
                    return;
                }
            }

            // No cache or not found in cache, fetch from API
            await fetchFreshData();
        } catch (error) {
            enqueueSnackbar("Không thể tải chi tiết yêu cầu", {variant: 'error'});
            navigate('/custom-request');
        } finally {
            setLoading(false);
        }
    };

    const fetchFreshData = async () => {
        try {
            const response = await viewCustomProductRequestByBuyer();

            // Handle nested data structure
            const data = response?.data?.data?.body?.data || response?.data?.body?.data || response?.data?.data || [];
            const requestsArray = Array.isArray(data) ? data : [];
            
            // Find the request by ID
            const foundRequest = requestsArray.find(req => req.id.toString() === id.toString());
            setRequest(foundRequest);

            // Update cache
            try {
                sessionStorage.setItem(CUSTOM_REQUESTS_CACHE_KEY, JSON.stringify({
                    data: requestsArray,
                    timestamp: Date.now()
                }));
            } catch (error) {
                console.error('Error caching requests:', error);
            }

            if (!foundRequest) {
                enqueueSnackbar("Không tìm thấy yêu cầu", {variant: 'warning'});
            }
        } catch (error) {
            enqueueSnackbar("Không thể tải chi tiết yêu cầu", {variant: 'error'});
            navigate('/custom-request');
        }
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
    const handleConfirmDelivery = async () => {
        try {
            const response = await confirmCustomRequest(request.id);
    
            enqueueSnackbar("Xác nhận yêu cầu thành công!", { variant: "success" });
    
            // refresh lại request để ẩn nút
            await fetchCustomRequestDetail();
            setShowDialog(false);
    
        } catch (error) {
            enqueueSnackbar("Không thể xác nhận yêu cầu", { variant: "error" });
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

    const handleToggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleSubmitRevision = async () => {
        if (!revisionComment.trim()) {
            enqueueSnackbar("Vui lòng nhập lý do chỉnh sửa", {variant: 'warning'});
            return;
        }

        try {
            setSubmittingRevision(true);
            const response = await createRevision({
                id: request.id,
                comment: revisionComment
            });

            if (response) {
                enqueueSnackbar("Yêu cầu chỉnh sửa đã được gửi thành công", {variant: 'success'});
                setRevisionDialogOpen(false);
                setRevisionComment('');
                // Refresh the request details
                fetchCustomRequestDetail();
            }
        } catch (error) {
            enqueueSnackbar("Không thể gửi yêu cầu chỉnh sửa", {variant: 'error'});
        } finally {
            setSubmittingRevision(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                py: 4,
                backgroundImage: "url('/header.jpg')",
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover'
            }}>
                <Container maxWidth="lg">
                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh'}}>
                        <CircularProgress/>
                    </Box>
                </Container>
            </Box>
        );
    }

    if (!request) {
        return (
            <Box sx={{
                minHeight: '100vh',
                py: 4,
                backgroundImage: "url('/header.jpg')",
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover'
            }}>
                <Container maxWidth="lg">
                    <Paper elevation={0} sx={{
                        p: 4,
                        borderRadius: 3,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                        backgroundColor: '#fff'
                    }}>
                        <Typography variant="h6" color="error" gutterBottom>
                            Không tìm thấy yêu cầu
                        </Typography>
                        <Button variant="contained" color="success" onClick={() => navigate('/custom-request')}
                                sx={{mt: 2}}>
                            Quay lại danh sách
                        </Button>
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            py: 4,
            backgroundImage: "url('/header.jpg')",
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
        }}>
            <Container maxWidth="lg">
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3}}>
                    <Box sx={{display: 'flex', alignItems: 'center', color: 'white'}}>
                        <Button
                            startIcon={<ArrowBack/>}
                            onClick={() => navigate('/custom-request')}
                            sx={{mr: 2, color: 'white'}}
                        >
                            Quay lại
                        </Button>
                        <Typography variant="h4" sx={{fontWeight: 700, color: 'white'}}>
                            <Build sx={{verticalAlign: 'middle', mr: 1, color: 'white'}}/>
                            Chi Tiết Yêu Cầu #{request.id}
                        </Typography>
                    </Box>
                  
                </Box>

                <Paper elevation={0}
                       sx={{p: 4, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', backgroundColor: '#fff'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        {/* Request Info */}
                        <Box>
                            <Card sx={{border: '1px solid #E6F1ED', backgroundColor: '#FAFFFD', borderRadius: 2}}>
                                <CardContent>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        mb: 2
                                    }}>
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
                                        <Schedule sx={{mr: 1}}/>
                                        <Typography variant="body2">
                                            Tạo lúc: {formatDate(request.createdAt)}
                                        </Typography>
                                    </Box>

                                    {/* Occasion Badge - Compact Corner Style */}
                                    {request.occasion && typeof request.occasion === 'string' && request.occasion.trim() !== '' && (
                                        <Box sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            mt: 2,
                                            px: 2,
                                            py: 1,
                                            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                                            borderRadius: 2,
                                            border: '2px solid #fff',
                                            boxShadow: '0 2px 8px rgba(252, 182, 159, 0.3)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 12px rgba(252, 182, 159, 0.4)'
                                            }
                                        }}>
                                            <EventIcon sx={{
                                                color: '#d35400',
                                                fontSize: 20
                                            }}/>
                                            <Box>
                                                <Typography variant="caption" sx={{
                                                    color: '#8b4513',
                                                    fontWeight: 600,
                                                    fontSize: '0.65rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    display: 'block',
                                                    lineHeight: 1.2
                                                }}>
                                                    Dịp đặc biệt
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: '#d35400',
                                                    fontWeight: 700,
                                                    fontSize: '0.95rem',
                                                    lineHeight: 1.3
                                                }}>
                                                    {request.occasion}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Box>

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
        {( request.status !== 'Đang chỉnh sửa' && request.status !== 'thành công' ) && (

        <Button
            variant="contained"
            color="warning"
            startIcon={<EditIcon />}
            onClick={() => setRevisionDialogOpen(true)}
            sx={{ color: "white" }}
        >
            Yêu Cầu Chỉnh Sửa
        </Button>
                )}
        {( request.status !== 'Đang chỉnh sửa' && request.status !== 'thành công' ) && (
       <Button
       variant="contained"
       startIcon={<ConfirmationNumberRounded />}
       onClick={handleConfirmDelivery}   // <-- đổi ở đây
       sx={{
           backgroundColor: "#0D3B2E",
           color: "white",
           fontWeight: 600,
           px: 3,
           py: 1,
           "&:hover": {
               backgroundColor: "#0a2e22",
           },
       }}
   >
       Xác Nhận Giao Hàng
   </Button>   
        )}
</Box>

            </Box>
        </Paper>
    </>
)}


                        {/* Buyer Info */}
                        {request.buyer && (
                            <Box>
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
                                                                label={`${getZodiacLabel(request.buyer.zodiac)}`}
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
                                                    <Typography variant="body2" color="text.secondary">Điện
                                                        thoại</Typography>
                                                    <Typography variant="body1" sx={{fontWeight: 600}}>
                                                        {request.buyer.phone || 'N/A'}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">Địa
                                                        chỉ</Typography>
                                                    <Typography variant="body1" sx={{fontWeight: 600}}>
                                                        {request.buyer.address || 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}

                        {/* Custom Data */}
                        {request.customData && request.customData.length > 0 && (
                            <>
                                <Divider sx={{my: 2}}/>
                                <Box>
                                    <Typography variant="h6" sx={{fontWeight: 600, color: '#0D3B2E', mb: 3}}>
                                        Chi tiết sản phẩm tùy chỉnh
                                    </Typography>
                                    {request.customData.map((customItem, idx) => (
                                        <Paper key={idx} sx={{
                                            border: '1px solid #E6F1ED',
                                            backgroundColor: '#FAFFFD',
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            mb: 3
                                        }}>
                                            {/* Succulents */}
                                            {customItem.succulents && customItem.succulents.length > 0 && (
                                                <Box>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            p: 2,
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleToggleSection('succulents')}
                                                    >
                                                        <Typography variant="h6"
                                                                    sx={{fontWeight: 600, color: '#0D3B2E'}}>
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
                                                                <Box key={sIdx} sx={{
                                                                    display: 'flex',
                                                                    gap: 2,
                                                                    alignItems: 'flex-start',
                                                                    mb: 2,
                                                                    pb: 2,
                                                                    borderBottom: sIdx < customItem.succulents.length - 1 ? '1px solid #E6F1ED' : 'none'
                                                                }}>
                                                                    <Avatar
                                                                        src={succ.image}
                                                                        variant="rounded"
                                                                        sx={{width: 80, height: 80}}
                                                                    >
                                                                        <SucculentIcon/>
                                                                    </Avatar>
                                                                    <Box sx={{flex: 1}}>
                                                                        <Typography variant="subtitle1"
                                                                                    sx={{fontWeight: 600, mb: 1}}>
                                                                            {succ.name}
                                                                        </Typography>
                                                                        <Typography variant="body2"
                                                                                    color="text.secondary" sx={{mb: 1}}>
                                                                            {succ.description}
                                                                        </Typography>
                                                                        {succ.size && succ.size.length > 0 && (
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                flexDirection: 'column',
                                                                                gap: 1
                                                                            }}>
                                                                                <Typography variant="body2"
                                                                                            sx={{fontWeight: 600}}>Kích
                                                                                    thước & Số lượng:</Typography>
                                                                                {succ.size.map((sz, sizeIdx) => (
                                                                                    <Box key={sizeIdx} sx={{
                                                                                        display: 'flex',
                                                                                        flexDirection: 'column',
                                                                                        gap: 0.5
                                                                                    }}>
                                                                                        <Chip
                                                                                            label={getSizeLabel(sz.name)}
                                                                                            size="small"
                                                                                            sx={{
                                                                                                width: 'fit-content',
                                                                                                backgroundColor: '#0D3B2E',
                                                                                                color: 'white'
                                                                                            }}
                                                                                        />
                                                                                        <Typography variant="body2"
                                                                                                    sx={{fontWeight: 600}}>
                                                                                            Số lượng: {sz.quantity}
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
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            p: 2,
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleToggleSection('pot')}
                                                    >
                                                        <Typography variant="h6"
                                                                    sx={{fontWeight: 600, color: '#0D3B2E'}}>
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
                                                            <Box sx={{
                                                                display: 'flex',
                                                                gap: 2,
                                                                alignItems: 'flex-start'
                                                            }}>
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
                                                                    <Typography variant="subtitle1"
                                                                                sx={{fontWeight: 600, mb: 1}}>
                                                                        {customItem.pot.name}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary"
                                                                                sx={{mb: 1}}>
                                                                        {customItem.pot.description}
                                                                    </Typography>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: 2,
                                                                        mt: 1
                                                                    }}>
                                                                        {customItem.pot.material && (
                                                                            <Box>
                                                                                <Typography variant="body2"
                                                                                            color="text.secondary">Chất
                                                                                    liệu</Typography>
                                                                                <Typography variant="body2"
                                                                                            sx={{fontWeight: 600}}>
                                                                                    {customItem.pot.material}
                                                                                </Typography>
                                                                            </Box>
                                                                        )}
                                                                        {customItem.pot.color && (
                                                                            <Box>
                                                                                <Typography variant="body2"
                                                                                            color="text.secondary">Màu
                                                                                    sắc</Typography>
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 1
                                                                                }}>
                                                                                    <Box sx={{
                                                                                        width: 24,
                                                                                        height: 24,
                                                                                        borderRadius: '50%',
                                                                                        backgroundColor: customItem.pot.color,
                                                                                        border: '1px solid #ddd'
                                                                                    }}/>
                                                                                    <Typography variant="body2"
                                                                                                sx={{fontWeight: 600}}>
                                                                                        {customItem.pot.color}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        )}
                                                                        {customItem.pot.size && customItem.pot.size.length > 0 && (
                                                                            <Box>
                                                                                <Typography variant="body2"
                                                                                            color="text.secondary">Kích
                                                                                    thước</Typography>
                                                                                {customItem.pot.size.map((sz, sIdx) => (
                                                                                    <Typography key={sIdx}
                                                                                                variant="body2"
                                                                                                sx={{fontWeight: 600}}>
                                                                                        {getSizeLabel(sz.name)}
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
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            p: 2,
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleToggleSection('soil')}
                                                    >
                                                        <Typography variant="h6"
                                                                    sx={{fontWeight: 600, color: '#0D3B2E'}}>
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
                                                            <Box sx={{
                                                                display: 'flex',
                                                                gap: 2,
                                                                alignItems: 'flex-start'
                                                            }}>
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
                                                                    <Typography variant="subtitle1"
                                                                                sx={{fontWeight: 600, mb: 1}}>
                                                                        {customItem.soil.name}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary"
                                                                                sx={{mb: 1, whiteSpace: 'pre-line'}}>
                                                                        {customItem.soil.description}
                                                                    </Typography>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: 2,
                                                                        mt: 1
                                                                    }}>
                                                                        {customItem.soil.massAmount && (
                                                                            <Box>
                                                                                <Typography variant="body2"
                                                                                            color="text.secondary">Khối
                                                                                    lượng</Typography>
                                                                                <Typography variant="body2"
                                                                                            sx={{fontWeight: 600}}>
                                                                                    {customItem.soil.massAmount} kg
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
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            p: 2,
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleToggleSection('decorations')}
                                                    >
                                                        <Typography variant="h6"
                                                                    sx={{fontWeight: 600, color: '#0D3B2E'}}>
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
                                                                <Box key={dIdx} sx={{
                                                                    display: 'flex',
                                                                    gap: 2,
                                                                    alignItems: 'flex-start',
                                                                    mb: 2,
                                                                    pb: 2,
                                                                    borderBottom: dIdx < customItem.decorations.length - 1 ? '1px solid #E6F1ED' : 'none'
                                                                }}>
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
                                                                        <Typography variant="subtitle1"
                                                                                    sx={{fontWeight: 600, mb: 1}}>
                                                                            {decoration.name}
                                                                        </Typography>
                                                                        <Typography variant="body2"
                                                                                    color="text.secondary" sx={{mb: 1}}>
                                                                            {decoration.description}
                                                                        </Typography>
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            gap: 2,
                                                                            mt: 1
                                                                        }}>
                                                                            {decoration.quantity && (
                                                                                <Box>
                                                                                    <Typography variant="body2"
                                                                                                color="text.secondary">Số
                                                                                        lượng</Typography>
                                                                                    <Typography variant="body2"
                                                                                                sx={{fontWeight: 600}}>
                                                                                        {decoration.quantity}
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
                                </Box>
                            </>
                        )}

                        {/* Versions */}
                         {/* Versions in Collapse */}
{request.versions && request.versions.length > 0 && (
    <>
        <Divider sx={{ my: 2 }} />

        {/* Header */}
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                mb: 2
            }}
            onClick={() => handleToggleSection("versions")}
        >
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#0D3B2E" }}>
                Lịch sử phiên bản thiết kế
            </Typography>

            <IconButton size="small">
                <ExpandMoreIcon
                    sx={{
                        transform: expandedSections.versions ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s"
                    }}
                />
            </IconButton>
        </Box>

        {/* COLLAPSE BODY */}
        <Collapse in={expandedSections.versions}>
            {request.versions.map((version, idx) => (
                <Paper
                    key={idx}
                    sx={{
                        border: "1px solid #E6F1ED",
                        backgroundColor: "#FAFFFD",
                        borderRadius: 2,
                        overflow: "hidden",
                        mb: 2
                    }}
                >
                    <Box sx={{ p: 2 }}>
                        {/* Header Row */}
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
                                    sx={{ fontWeight: 600, color: "#0D3B2E" }}
                                >
                                    {version.version}
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    Loại:{" "}
                                    {version.type === "design"
                                        ? "Thiết kế"
                                        : "Chỉnh sửa"}
                                </Typography>
                            </Box>

                            <Chip
                                label={
                                    version.status === "pending"
                                        ? "Đang chờ"
                                        : version.status === "fixed"
                                        ? "Đã chỉnh sửa"
                                        : version.status
                                }
                                color={
                                    version.status === "pending"
                                        ? "warning"
                                        : version.status === "fixed"
                                        ? "success"
                                        : "default"
                                }
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                        </Box>

                        {/* Revision Content */}
                        {version.revisionContent && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Nội dung chỉnh sửa:
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                                    {version.revisionContent}
                                </Typography>
                            </Box>
                        )}

                        {/* Images */}
                        {version.images && version.images.length > 0 && (
                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 1 }}
                                >
                                    Ảnh thiết kế ({version.images.length})
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 2
                                    }}
                                >
                                    {version.images.map((image, imgIdx) => (
                                        <Avatar
                                            key={imgIdx}
                                            src={image}
                                            variant="rounded"
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                border: "2px solid #E6F1ED",
                                                cursor: "pointer",
                                                "&:hover": {
                                                    borderColor: "#0D3B2E",
                                                    transform: "scale(1.05)",
                                                    transition: "all 0.2s"
                                                }
                                            }}
                                            onClick={() =>
                                                window.open(image, "_blank")
                                            }
                                        />
                                    ))}
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
        </Collapse>
    </>
)}

                    </Box>
                </Paper>
            </Container>

            {/* Revision Dialog */}
            <Dialog
                open={revisionDialogOpen}
                onClose={() => {
                    setRevisionDialogOpen(false);
                    setRevisionComment('');
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{fontWeight: 600, color: '#0D3B2E'}}>
                    Yêu Cầu Chỉnh Sửa
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                        Vui lòng mô tả chi tiết những thay đổi bạn muốn thực hiện với yêu cầu này.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label="Lý do chỉnh sửa"
                        placeholder="Ví dụ: Yêu cầu chỉnh sửa: thay Sen ngọc Bích size large thành size medium"
                        value={revisionComment}
                        onChange={(e) => setRevisionComment(e.target.value)}
                        variant="outlined"
                        sx={{mt: 1}}
                    />
                </DialogContent>
                <DialogActions sx={{p: 2}}>
                    <Button
                        onClick={() => {
                            setRevisionDialogOpen(false);
                            setRevisionComment('');
                        }}
                        variant="outlined"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmitRevision}
                        variant="contained"
                        color="warning"
                        disabled={submittingRevision || !revisionComment.trim()}
                    >
                        {submittingRevision ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                    </Button>
                </DialogActions>
            </Dialog>
           
        </Box>
        
    );
}

