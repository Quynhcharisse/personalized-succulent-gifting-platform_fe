import React, {useEffect, useState} from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Stack,
    Button,
    Paper,
    Grid
} from '@mui/material';
import {Build, Schedule, Visibility, Event as EventIcon} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {useSnackbar} from 'notistack';
import {viewCustomProductRequestByBuyer} from '../../../services/CustomeRequestService.jsx';

export default function ViewCustomRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (localStorage.getItem("user") == null) {
            window.location.href = "/login";
            return;
        }

        fetchCustomRequests();
    }, []);

    const fetchCustomRequests = async () => {
        try {
            setLoading(true);
            const response = await viewCustomProductRequestByBuyer();
            
            // Handle nested data structure
            const data = response?.data?.data?.body?.data || response?.data?.body?.data || response?.data?.data || [];
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching custom requests:", error);
            enqueueSnackbar("Không thể tải danh sách yêu cầu", {variant: 'error'});
        } finally {
            setLoading(false);
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
                <Paper elevation={0} sx={{p: 4, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', backgroundColor: '#fff'}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4}}>
                        <Typography variant="h4" sx={{fontWeight: 700, color: '#0D3B2E'}}>
                            <Build sx={{verticalAlign: 'middle', mr: 1}}/>
                            Yêu Cầu Tùy Chỉnh Của Tôi
                        </Typography>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => navigate('/create-custom-request')}
                            sx={{fontWeight: 600}}
                        >
                            + Tạo Yêu Cầu Mới
                        </Button>
                    </Box>

                    {requests.length === 0 ? (
                        <Box sx={{textAlign: 'center', py: 8}}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Chưa có yêu cầu tùy chỉnh nào
                            </Typography>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => navigate('/create-custom-request')}
                                sx={{mt: 2}}
                            >
                                Tạo Yêu Cầu Đầu Tiên
                            </Button>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {requests.map((request) => (
                                <Grid item xs={12} sm={6} md={4} key={request.id}>
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
                                        onClick={() => navigate('/custom-request/detail', { state: { id: request.id } })}
                                    >
                                        <CardContent sx={{flexGrow: 1}}>
                                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2}}>
                                                <Typography variant="h6" sx={{fontWeight: 600, color: '#0D3B2E'}}>
                                                    Yêu cầu #{request.id}
                                                </Typography>
                                                <Chip
                                                    label={request.status}
                                                    color={getStatusColor(request.status)}
                                                    size="small"
                                                    sx={{fontWeight: 600}}
                                                />
                                            </Box>

                                            <Stack spacing={1} sx={{mt: 2}}>
                                                <Box sx={{display: 'flex', alignItems: 'center', color: 'text.secondary'}}>
                                                    <Schedule sx={{mr: 1, fontSize: 18}}/>
                                                    <Typography variant="body2">
                                                        {formatDate(request.createdAt)}
                                                    </Typography>
                                                </Box>
                                                
                                                {/* Occasion Info */}
                                                {request.occasion && typeof request.occasion === 'string' && request.occasion.trim() !== '' && (
                                                    <Box sx={{display: 'flex', alignItems: 'center', color: 'text.secondary'}}>
                                                        <EventIcon sx={{mr: 1, fontSize: 18}}/>
                                                        <Typography variant="body2">
                                                            Dịp: {request.occasion}
                                                        </Typography>
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
                                                    navigate('/custom-request/detail', { state: { id: request.id } });
                                                }}
                                            >
                                                Xem Chi Tiết
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

