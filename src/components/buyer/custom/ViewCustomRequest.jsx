import React, {useEffect, useState, useMemo, useCallback, memo} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Grid,
    Paper,
    Skeleton,
    Stack,
    Typography
} from '@mui/material';
import {Build, Event as EventIcon, Schedule, Visibility} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {useSnackbar} from 'notistack';
import {viewCustomProductRequestByBuyer} from '@/services/CustomeRequestService.jsx';

const CUSTOM_REQUESTS_CACHE_KEY = 'custom_requests_cache';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

export default function ViewCustomRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();

    // Memoize user check to avoid repeated localStorage access
    const isAuthenticated = useMemo(() => {
        return sessionStorage.getItem("user") != null;
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            window.location.href = "/login";
            return;
        }

        fetchCustomRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const getCachedRequests = useCallback(() => {
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
    }, []);

    const setCachedRequests = useCallback((data) => {
        try {
            sessionStorage.setItem(CUSTOM_REQUESTS_CACHE_KEY, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Error caching requests:', error);
        }
    }, []);

    const parseResponseData = useCallback((response) => {
        // Optimized data parsing - check most common structure first
        if (response?.data?.data?.body?.data) {
            return response.data.data.body.data;
        }
        if (response?.data?.body?.data) {
            return response.data.body.data;
        }
        if (response?.data?.data) {
            return response.data.data;
        }
        return [];
    }, []);

    const fetchFreshData = useCallback(async (isBackgroundRefresh = false) => {
        try {
            if (!isBackgroundRefresh) {
                setLoading(true);
            } else {
                setIsRefreshing(true);
            }

            const response = await viewCustomProductRequestByBuyer();
            const data = parseResponseData(response);
            const requestsArray = Array.isArray(data) ? data : [];
            
            setRequests(requestsArray);
            setCachedRequests(requestsArray);
        } catch (error) {
            if (!isBackgroundRefresh) {
                enqueueSnackbar("Không thể tải danh sách yêu cầu", {variant: 'error'});
            }
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [parseResponseData, setCachedRequests, enqueueSnackbar]);

    const fetchCustomRequests = useCallback(async () => {
        // Try to get from cache first
        const cachedData = getCachedRequests();
        if (cachedData && cachedData.length > 0) {
            setRequests(cachedData);
            setLoading(false);
            // Fetch fresh data in background without showing loading
            fetchFreshData(true);
            return;
        }

        // No cache, fetch from API
        await fetchFreshData(false);
    }, [getCachedRequests, fetchFreshData]);

    const getStatusColor = useCallback((status) => {
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
    }, []);

    const formatDate = useCallback((dateString) => {
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
    }, []);

    const handleCardClick = useCallback((requestId) => {
        navigate('/custom-request/detail', {state: {id: requestId}});
    }, [navigate]);

    const handleCreateRequest = useCallback(() => {
        navigate('/create-custom-request');
    }, [navigate]);

    // Memoized Request Card Component
    const RequestCard = memo(({ request, onCardClick, getStatusColor, formatDate }) => {
        const statusColor = getStatusColor(request.status);
        const formattedDate = formatDate(request.createdAt);
        const hasOccasion = request.occasion && typeof request.occasion === 'string' && request.occasion.trim() !== '';

        return (
            <Grid item xs={12} sm={6} md={4}>
                <Card
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: '1px solid #E6F1ED',
                        backgroundColor: '#FAFFFD',
                        borderRadius: 2,
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                        }
                    }}
                    onClick={() => onCardClick(request.id)}
                >
                    <CardContent sx={{flexGrow: 1}}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 2
                        }}>
                            <Typography variant="h6" sx={{fontWeight: 600, color: '#0D3B2E'}}>
                                Yêu cầu #{request.id}
                            </Typography>
                            <Chip
                                label={request.status}
                                color={statusColor}
                                size="small"
                                sx={{fontWeight: 600}}
                            />
                        </Box>

                        <Stack spacing={1} sx={{mt: 2}}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                color: 'text.secondary'
                            }}>
                                <Schedule sx={{mr: 1, fontSize: 18}}/>
                                <Typography variant="body2">
                                    {formattedDate}
                                </Typography>
                            </Box>

                            {/* Occasion Badge - Compact Style */}
                            {hasOccasion && (
                                <Box sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.75,
                                    mt: 1,
                                    px: 1.5,
                                    py: 0.75,
                                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                                    borderRadius: 1.5,
                                    border: '1.5px solid #fff',
                                    boxShadow: '0 2px 6px rgba(252, 182, 159, 0.25)',
                                }}>
                                    <EventIcon sx={{
                                        color: '#d35400',
                                        fontSize: 16
                                    }}/>
                                    <Box>
                                        <Typography variant="caption" sx={{
                                            color: '#8b4513',
                                            fontWeight: 600,
                                            fontSize: '0.6rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3px',
                                            display: 'block',
                                            lineHeight: 1.2
                                        }}>
                                            Dịp
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            color: '#d35400',
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            lineHeight: 1.2
                                        }}>
                                            {request.occasion}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Stack>

                        <Button
                            fullWidth
                            variant="outlined"
                            color="success"
                            startIcon={<Visibility/>}
                            sx={{mt: 2}}
                            onClick={(e) => {
                                e.stopPropagation();
                                onCardClick(request.id);
                            }}
                        >
                            Xem Chi Tiết
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
        );
    });
    RequestCard.displayName = 'RequestCard';

    // Skeleton Loading Component
    const RequestSkeleton = memo(() => (
        <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #E6F1ED',
                backgroundColor: '#FAFFFD',
                borderRadius: 2
            }}>
                <CardContent sx={{flexGrow: 1}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2}}>
                        <Skeleton variant="text" width="40%" height={32} animation="wave" />
                        <Skeleton variant="rectangular" width={80} height={24} sx={{borderRadius: 1}} animation="wave" />
                    </Box>
                    <Stack spacing={1} sx={{mt: 2}}>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <Skeleton variant="circular" width={18} height={18} sx={{mr: 1}} animation="wave" />
                            <Skeleton variant="text" width="60%" height={20} animation="wave" />
                        </Box>
                        <Skeleton variant="rectangular" width="100%" height={60} sx={{borderRadius: 1.5, mt: 1}} animation="wave" />
                    </Stack>
                    <Skeleton variant="rectangular" width="100%" height={36} sx={{borderRadius: 2, mt: 2}} animation="wave" />
                </CardContent>
            </Card>
        </Grid>
    ));
    RequestSkeleton.displayName = 'RequestSkeleton';

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
                    <Paper elevation={0}
                           sx={{p: 4, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', backgroundColor: '#fff'}}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4}}>
                            <Skeleton variant="text" width={300} height={40} animation="wave" />
                            <Skeleton variant="rectangular" width={150} height={36} sx={{borderRadius: 2}} animation="wave" />
                        </Box>
                        <Grid container spacing={3}>
                            {[...Array(6)].map((_, index) => (
                                <RequestSkeleton key={`skeleton-${index}`} />
                            ))}
                        </Grid>
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
                <Paper elevation={0}
                       sx={{p: 4, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', backgroundColor: '#fff'}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4}}>
                        <Typography variant="h4" sx={{fontWeight: 700, color: '#0D3B2E'}}>
                            <Build sx={{verticalAlign: 'middle', mr: 1}}/>
                            Yêu Cầu Tùy Chỉnh Của Tôi
                        </Typography>
                        <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                            {isRefreshing && (
                                <CircularProgress size={20} sx={{color: '#4CAF50'}} />
                            )}
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleCreateRequest}
                                sx={{fontWeight: 600}}
                            >
                                + Tạo Yêu Cầu Mới
                            </Button>
                        </Box>
                    </Box>

                    {requests.length === 0 ? (
                        <Box sx={{textAlign: 'center', py: 8}}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Chưa có yêu cầu tùy chỉnh nào
                            </Typography>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleCreateRequest}
                                sx={{mt: 2}}
                            >
                                Tạo Yêu Cầu Đầu Tiên
                            </Button>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {requests.map((request) => (
                                <RequestCard
                                    key={request.id}
                                    request={request}
                                    onCardClick={handleCardClick}
                                    getStatusColor={getStatusColor}
                                    formatDate={formatDate}
                                />
                            ))}
                        </Grid>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

