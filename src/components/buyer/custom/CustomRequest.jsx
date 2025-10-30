import React, { useEffect, useState, useMemo } from 'react';
import {
    Container, Typography, Box, Paper, Button, CircularProgress, Alert,
    TextField, FormControl, InputLabel, Select, MenuItem, Grid, IconButton, Divider,
    Card, InputAdornment
} from '@mui/material';
import { Build, Add as AddIcon, Delete as DeleteIcon, PhotoCamera as PhotoCameraIcon, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getSucculents, getAccessories } from '../../../services/ProductService.jsx';
import { createCustomProductRequest } from '../../../services/CustomeRequestService.jsx';
import { useSnackbar } from 'notistack';
import { FENGSHUI, ZODIACS } from '../../constants.js';
import uploadToCloudinary from '../../cloudinaryUpload.js';

export default function CustomRequest() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // API Data
    const [allSucculents, setAllSucculents] = useState([]);
    const [availablePots, setAvailablePots] = useState([]);
    const [availableSoils, setAvailableSoils] = useState([]);
    const [availableDecorations, setAvailableDecorations] = useState([]);

    // Form Data State
    const [formData, setFormData] = useState({
        images: [],
        succulents: [],
        pot: '',
        potSize: '',
        soil: '',
        soilMass: 500,
        decorations: [],
    });

    // Filter State
    const [fengShuiFilter, setFengShuiFilter] = useState('all');
    const [zodiacFilter, setZodiacFilter] = useState('all');

    // Data Fetching
    useEffect(() => {
        const loadData = async () => {
            try {
                const [succulentsRes, accessoriesRes] = await Promise.all([
                    getSucculents(),
                    getAccessories('all')
                ]);

                if (succulentsRes?.data?.data) {
                    setAllSucculents(succulentsRes.data.data);
                }
                if (accessoriesRes?.data?.data) {
                    const acc = accessoriesRes.data.data;
                    setAvailablePots(acc.pots || []);
                    setAvailableSoils(acc.soils || []);
                    setAvailableDecorations(acc.decorations || []);
                }
            } catch (error) {
                console.error("Error loading data:", error);
                enqueueSnackbar("Không thể tải dữ liệu cho form", { variant: 'error' });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    
    // Filtered Succulents
    const filteredSucculents = useMemo(() => {
        return allSucculents.filter(s => {
            const fengShuiMatch = fengShuiFilter === 'all' || (s.fengShuiList && s.fengShuiList.includes(fengShuiFilter));
            const zodiacMatch = zodiacFilter === 'all' || (s.zodiacList && s.zodiacList.includes(zodiacFilter));
            return fengShuiMatch && zodiacMatch;
        });
    }, [allSucculents, fengShuiFilter, zodiacFilter]);

    // Handlers
    const handleAddSucculent = () => {
        setFormData(prev => ({
            ...prev,
            succulents: [...prev.succulents, { id: '', size: '', quantity: 1 }]
        }));
    };

    const handleRemoveSucculent = (index) => {
        setFormData(prev => ({
            ...prev,
            succulents: prev.succulents.filter((_, i) => i !== index)
        }));
    };

    const handleSucculentChange = (index, field, value) => {
        const newSucculents = [...formData.succulents];
        newSucculents[index][field] = value;
        if (field === 'id') {
            newSucculents[index].size = ''; // Reset size on new succulent
        }
        setFormData(prev => ({ ...prev, succulents: newSucculents }));
    };

    const handlePotChange = (e) => {
        setFormData(prev => ({ ...prev, pot: e.target.value, potSize: '' }));
    };
    
    const handleFileSelected = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const imageUrl = await uploadToCloudinary(file);
            setFormData(prev => ({ ...prev, images: [...prev.images, { url: imageUrl }] }));
        } catch (error) {
            enqueueSnackbar('Tải ảnh thất bại', { variant: 'error' });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            // Transform data to match API payload structure
            const selectedPot = availablePots.find(p => p.name === formData.pot);
            const selectedPotSize = selectedPot?.size.find(s => s.name === formData.potSize);
            const selectedSoil = availableSoils.find(s => s.name === formData.soil);
            
            const payload = {
                images: formData.images,
                sizes: [
                    {
                        name: "Custom Request", // Or generate a name
                        pot: selectedPot ? {
                            ...selectedPot,
                            size: [selectedPotSize] // API expects an array
                        } : null,
                        soil: selectedSoil ? {
                            ...selectedSoil,
                            massAmount: formData.soilMass,
                        } : null,
                        decorations: formData.decorations.map(name => availableDecorations.find(d => d.name === name)),
                        succulents: formData.succulents.map(s => {
                            const succulentData = allSucculents.find(as => as.id === s.id);
                            const sizeData = succulentData?.size.find(sz => sz.name === s.size);
                            return {
                                ...succulentData,
                                size: [{...sizeData, quantity: s.quantity }]
                            }
                        })
                    }
                ]
            };
            
            await createCustomProductRequest(payload);
            enqueueSnackbar('Gửi yêu cầu thành công!', { variant: 'success' });
            navigate('/');
        } catch (error) {
            console.error("Error submitting custom request:", error);
            enqueueSnackbar('Gửi yêu cầu thất bại', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Container>;
    }

    const selectedPotForSize = availablePots.find(p => p.name === formData.pot);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
             <Button startIcon={<ArrowBack/>} onClick={() => navigate(-1)} sx={{mb: 3}}>
                    Quay lại
                </Button>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0D3B2E', mb: 3 }}>
                <Build sx={{ verticalAlign: 'middle', mr: 1 }} />
                Điện Cây - Đặt hàng tùy chỉnh
            </Typography>

            <Paper elevation={2} sx={{ p: 4 }}>
                {/* Filters */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Bộ lọc sen đá</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Theo mệnh</InputLabel>
                                <Select value={fengShuiFilter} label="Theo mệnh" onChange={(e) => setFengShuiFilter(e.target.value)}>
                                    <MenuItem value="all">Tất cả</MenuItem>
                                    {FENGSHUI.map(item => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Theo cung hoàng đạo</InputLabel>
                                <Select value={zodiacFilter} label="Theo cung hoàng đạo" onChange={(e) => setZodiacFilter(e.target.value)}>
                                    <MenuItem value="all">Tất cả</MenuItem>
                                    {ZODIACS.map(item => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
                
                <Divider sx={{ my: 4 }} />

                {/* Succulents */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Chọn Sen Đá</Typography>
                        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddSucculent}>Thêm sen đá</Button>
                    </Box>
                    {formData.succulents.map((succulent, index) => (
                        <Card key={index} sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                            <FormControl sx={{ flex: 3 }}>
                                <InputLabel>Sen đá</InputLabel>
                                <Select value={succulent.id} label="Sen đá" onChange={(e) => handleSucculentChange(index, 'id', e.target.value)}>
                                    {filteredSucculents.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ flex: 2 }} disabled={!succulent.id}>
                                <InputLabel>Size</InputLabel>
                                <Select value={succulent.size} label="Size" onChange={(e) => handleSucculentChange(index, 'size', e.target.value)}>
                                    {allSucculents.find(s => s.id === succulent.id)?.size.map(sz => <MenuItem key={sz.name} value={sz.name}>{sz.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <TextField sx={{ flex: 1 }} label="Số lượng" type="number" value={succulent.quantity} onChange={(e) => handleSucculentChange(index, 'quantity', parseInt(e.target.value) || 1)} InputProps={{ inputProps: { min: 1 } }}/>
                            <IconButton color="error" onClick={() => handleRemoveSucculent(index)}><DeleteIcon /></IconButton>
                        </Card>
                    ))}
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Pot, Soil, Decorations */}
                <Grid container spacing={3}>
                    {/* Pot */}
                    <Grid item xs={12} md={6}>
                         <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Chọn Chậu</Typography>
                        <FormControl fullWidth>
                            <InputLabel>Loại chậu</InputLabel>
                            <Select value={formData.pot} label="Loại chậu" onChange={handlePotChange}>
                                {availablePots.map(p => <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{mt: 2}} disabled={!formData.pot}>
                            <InputLabel>Kích thước chậu</InputLabel>
                            <Select value={formData.potSize} label="Kích thước chậu" onChange={(e) => setFormData(prev => ({...prev, potSize: e.target.value}))}>
                                {selectedPotForSize?.size.map(s => <MenuItem key={s.name} value={s.name}>{s.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    {/* Soil */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Chọn Đất</Typography>
                        <FormControl fullWidth>
                            <InputLabel>Loại đất</InputLabel>
                            <Select value={formData.soil} label="Loại đất" onChange={(e) => setFormData(prev => ({...prev, soil: e.target.value}))}>
                                {availableSoils.map(s => <MenuItem key={s.name} value={s.name}>{s.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField fullWidth label="Khối lượng (gram)" type="number" value={formData.soilMass} onChange={(e) => setFormData(prev => ({...prev, soilMass: parseInt(e.target.value) || 0}))} sx={{ mt: 2 }} InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }} />
                    </Grid>
                     {/* Decorations */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Chọn Đồ Trang Trí</Typography>
                        <FormControl fullWidth>
                            <InputLabel>Đồ trang trí</InputLabel>
                            <Select multiple value={formData.decorations} label="Đồ trang trí" onChange={(e) => setFormData(prev => ({...prev, decorations: e.target.value}))} renderValue={(selected) => selected.join(', ')}>
                                {availableDecorations.map(d => <MenuItem key={d.name} value={d.name}>{d.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                
                <Divider sx={{ my: 4 }} />

                {/* Image Upload */}
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Hình ảnh tham khảo</Typography>
                    <Grid container spacing={2}>
                        {formData.images.map((image, index) => (
                            <Grid item key={index}>
                                <Box sx={{ position: 'relative' }}>
                                    <img src={image.url} alt="upload" width="100" height="100" style={{ objectFit: 'cover' }} />
                                    <IconButton size="small" sx={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'white' }} onClick={() => handleRemoveImage(index)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Grid>
                        ))}
                         <Grid item>
                            <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />} sx={{height: '100px', width: '100px'}}>
                                Tải ảnh
                                <input type="file" hidden accept="image/*" onChange={handleFileSelected} />
                            </Button>
                         </Grid>
                    </Grid>
                    {isUploading && <CircularProgress size={20} />}
                </Box>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" size="large" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : "Gửi Yêu Cầu"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
