import React, {useEffect, useMemo, useState} from 'react';
import {
    Box,
    Button,
    Card,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    ArrowBack,
    AutoAwesome as AutoAwesomeIcon,
    Build,
    Delete as DeleteIcon,
    PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {getAccessories, getSucculents} from '../../../services/ProductService.jsx';
import {createCustomProductRequest} from '../../../services/CustomeRequestService.jsx';
import {useSnackbar} from 'notistack';
import {FENGSHUI, ZODIACS} from '../../constants.js';
import uploadToCloudinary from '../../cloudinaryUpload.js';
import AiSuggestionDialog from './AiSuggestionDialog.jsx';

export default function CustomRequest() {
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [aiDialogOpen, setAiDialogOpen] = useState(false);

    // API Data
    const [allSucculents, setAllSucculents] = useState([]);
    const [availablePots, setAvailablePots] = useState([]);
    const [availableSoils, setAvailableSoils] = useState([]);
    const [availableDecorations, setAvailableDecorations] = useState([]);

    const succulentSizeOrder = ['small', 'medium', 'large']

    // Form Data State
    const [formData, setFormData] = useState({
        images: [],
        succulents: [],
        pot: '',
        potSize: '',
        soil: '',
        soilMass: 500,
        decorations: [],
        occasion: '',
    });

    // Filter State (single-select type, conditional values)
    const [filterType, setFilterType] = useState('none'); // 'none' | 'fengshui' | 'zodiac'
    const [filterValue, setFilterValue] = useState('all');

    // Data Fetching
    useEffect(() => {
        if (localStorage.getItem("user") == null) {
            window.location.href = "/login"
        }

        const loadData = async () => {
            try {
                const [succulentsRes, accessoriesRes] = await Promise.all([
                    getSucculents(),
                    getAccessories('all')
                ]);

                if (succulentsRes?.data?.data) {
                    setAllSucculents(succulentsRes.data.data || []);
                }
                if (accessoriesRes?.data?.data) {
                    const acc = accessoriesRes.data.data;
                    setAvailablePots(acc.pots || []);
                    setAvailableSoils(acc.soils || []);
                    setAvailableDecorations(acc.decorations || []);
                }
            } catch (error) {
                enqueueSnackbar("Không thể tải dữ liệu cho form", {variant: 'error'});
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Filtered Succulents
    const filteredSucculents = useMemo(() => {
        return allSucculents.filter(s => {
            if (filterType === 'none' || filterValue === 'all') return true;
            if (filterType === 'fengshui') {
                return s.fengShuiElements && s.fengShuiElements.includes(filterValue);
            }
            if (filterType === 'zodiac') {
                return s.zodiacs && s.zodiacs.includes(filterValue);
            }
            return true;
        });
    }, [allSucculents, filterType, filterValue]);

    // Handlers
    const handleAddSucculent = () => {
        setFormData(prev => ({
            ...prev,
            succulents: [...prev.succulents, {id: '', size: '', quantity: 1}]
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
        setFormData(prev => ({...prev, succulents: newSucculents}));
    };

    const handlePotChange = (e) => {
        setFormData(prev => ({...prev, pot: e.target.value, potSize: ''}));
    };

    const handleAddDecoration = () => {
        setFormData(prev => ({
            ...prev,
            decorations: [...prev.decorations, {name: '', quantity: 1}]
        }));
    };

    const handleRemoveDecoration = (index) => {
        setFormData(prev => ({
            ...prev,
            decorations: prev.decorations.filter((_, i) => i !== index)
        }));
    };

    const handleDecorationChange = (index, field, value) => {
        const newDecorations = [...formData.decorations];
        newDecorations[index][field] = value;
        setFormData(prev => ({...prev, decorations: newDecorations}));
    };

    const handleFileSelected = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const imageUrl = await uploadToCloudinary(file);
            setFormData(prev => ({...prev, images: [...prev.images, {url: imageUrl}]}));
        } catch (error) {
            enqueueSnackbar('Tải ảnh thất bại', {variant: 'error'});
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

    const handleApplyAiSuggestion = (aiData) => {
        try {
            const newFormData = {...formData};
            let matchWarnings = [];

            // Apply images
            if (aiData.images && Array.isArray(aiData.images)) {
                newFormData.images = aiData.images;
            }

            // Apply occasion
            if (aiData.occasion) {
                newFormData.occasion = aiData.occasion;
            }

            // Apply succulents
            if (aiData.size?.succulents && Array.isArray(aiData.size.succulents)) {
                const mappedSucculents = [];
                
                aiData.size.succulents.forEach(aiSucculent => {
                    // Try to find matching succulent by name (case-insensitive)
                    const matchedSucculent = allSucculents.find(s => 
                        s.speciesName.toLowerCase().includes(aiSucculent.name.toLowerCase()) ||
                        aiSucculent.name.toLowerCase().includes(s.speciesName.toLowerCase())
                    );

                    if (matchedSucculent && aiSucculent.sizes && aiSucculent.sizes.length > 0) {
                        // Check if size exists for this succulent
                        const aiSize = aiSucculent.sizes[0].size;
                        const hasSize = matchedSucculent.size && matchedSucculent.size[aiSize];
                        
                        mappedSucculents.push({
                            id: matchedSucculent.id,
                            size: hasSize ? aiSize : '',
                            quantity: aiSucculent.sizes[0].quantity || 1
                        });

                        if (!hasSize) {
                            matchWarnings.push(`Sen đá "${aiSucculent.name}" không có size "${aiSize}", vui lòng chọn lại`);
                        }
                    } else {
                        // Succulent not found, add empty entry
                        matchWarnings.push(`Không tìm thấy sen đá "${aiSucculent.name}" trong hệ thống`);
                        mappedSucculents.push({id: '', size: '', quantity: aiSucculent.sizes?.[0]?.quantity || 1});
                    }
                });

                newFormData.succulents = mappedSucculents;
            }

            // Apply pot
            if (aiData.size?.pot) {
                const matchedPot = availablePots.find(p => 
                    p.name.toLowerCase().includes(aiData.size.pot.name.toLowerCase()) ||
                    aiData.size.pot.name.toLowerCase().includes(p.name.toLowerCase())
                );

                if (matchedPot) {
                    newFormData.pot = matchedPot.name;
                    
                    // Check if size exists
                    const hasPotSize = matchedPot.size.some(s => s.name === aiData.size.pot.size);
                    if (hasPotSize) {
                        newFormData.potSize = aiData.size.pot.size;
                    } else {
                        newFormData.potSize = '';
                        matchWarnings.push(`Chậu "${aiData.size.pot.name}" không có size "${aiData.size.pot.size}", vui lòng chọn lại`);
                    }
                } else {
                    matchWarnings.push(`Không tìm thấy chậu "${aiData.size.pot.name}" trong hệ thống`);
                }
            }

            // Apply soil
            if (aiData.size?.soil) {
                const matchedSoil = availableSoils.find(s => 
                    s.name.toLowerCase().includes(aiData.size.soil.name.toLowerCase()) ||
                    aiData.size.soil.name.toLowerCase().includes(s.name.toLowerCase())
                );

                if (matchedSoil) {
                    newFormData.soil = matchedSoil.name;
                    newFormData.soilMass = (aiData.size.soil.massAmount || 1) * 1000; // Convert kg to grams
                } else {
                    matchWarnings.push(`Không tìm thấy loại đất "${aiData.size.soil.name}" trong hệ thống`);
                }
            }

            // Apply decorations
            if (aiData.size?.decoration?.details && Array.isArray(aiData.size.decoration.details)) {
                const mappedDecorations = [];
                
                aiData.size.decoration.details.forEach(aiDeco => {
                    const matchedDeco = availableDecorations.find(d => 
                        d.name.toLowerCase().includes(aiDeco.name.toLowerCase()) ||
                        aiDeco.name.toLowerCase().includes(d.name.toLowerCase())
                    );

                    if (matchedDeco) {
                        mappedDecorations.push({
                            name: matchedDeco.name,
                            quantity: aiDeco.quantity || 1
                        });
                    } else {
                        matchWarnings.push(`Không tìm thấy đồ trang trí "${aiDeco.name}" trong hệ thống`);
                        // Still add it, user can change
                        mappedDecorations.push({
                            name: '',
                            quantity: aiDeco.quantity || 1
                        });
                    }
                });

                newFormData.decorations = mappedDecorations;
            }

            // Update form data
            setFormData(newFormData);

            // Show warnings if any items didn't match
            if (matchWarnings.length > 0) {
                enqueueSnackbar(
                    `Đã áp dụng gợi ý! Tuy nhiên: ${matchWarnings.join('; ')}`,
                    {variant: 'warning', autoHideDuration: 8000}
                );
            }
        } catch (error) {
            console.error('Error applying AI suggestion:', error);
            enqueueSnackbar('Có lỗi khi áp dụng gợi ý từ AI', {variant: 'error'});
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            // Transform data to match API payload structure
            const selectedPot = availablePots.find(p => p.name === formData.pot);
            const selectedSoil = availableSoils.find(s => s.name === formData.soil);

            const payload = {
                images: formData.images,
                occasion: formData.occasion || null,
                size: {
                    succulents: formData.succulents.map(s => {
                        const succulentData = allSucculents.find(as => as.id === s.id);
                        return {
                            id: succulentData?.id,
                            name: succulentData?.speciesName,
                            sizes: [{
                                size: s.size,
                                quantity: s.quantity
                            }]
                        }
                    }),
                    pot: selectedPot && formData.potSize ? {
                        name: formData.pot,
                        size: formData.potSize
                    } : null,
                    soil: selectedSoil ? {
                        name: formData.soil,
                        massAmount: formData.soilMass / 1000 // Convert from grams to kg
                    } : null,
                    decoration: formData.decorations.length > 0 ? {
                        included: true,
                        details: formData.decorations.map(dec => ({
                            name: dec.name,
                            quantity: dec.quantity
                        }))
                    } : null
                }
            };

            await createCustomProductRequest(payload);
            enqueueSnackbar('Gửi yêu cầu thành công!', {variant: 'success'});
            navigate('/custom-request');
        } catch (error) {
            enqueueSnackbar('Gửi yêu cầu thất bại', {variant: 'error'});
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <Container sx={{py: 8, display: 'flex', justifyContent: 'center'}}><CircularProgress/></Container>;
    }

    const selectedPotForSize = availablePots.find(p => p.name === formData.pot);

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
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2}}>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Button
                            startIcon={<ArrowBack/>}
                            onClick={() => navigate('/custom-request')}
                            sx={{mr: 2, color: 'white'}}
                        >
                            Quay lại
                        </Button>
                        <Typography variant="h4" sx={{fontWeight: 700, color: 'white'}}>
                            <Build sx={{verticalAlign: 'middle', mr: 1, color: 'white'}}/>
                            Điện Cây - Đặt hàng tùy chỉnh
                        </Typography>
                    </Box>
                    
                    <Button
                        variant="contained"
                        startIcon={<AutoAwesomeIcon/>}
                        onClick={() => setAiDialogOpen(true)}
                        sx={{
                            background: 'linear-gradient(135deg, #4ade80 0%, #2E7D32 100%)',
                            color: 'white',
                            fontWeight: 600,
                            px: 3,
                            py: 1.5,
                            borderRadius: 3,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                                boxShadow: '0 6px 16px rgba(46, 125, 50, 0.6)',
                                transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Khó quá nhờ tui suggest cho nè?
                    </Button>
                </Box>

                <Paper elevation={0}
                       sx={{p: 4, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', backgroundColor: '#fff'}}>

                    {/* Occasion Field */}
                    <Box sx={{mb: 4}}>
                        <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>Dịp đặc biệt (tùy chọn)</Typography>

                        {/* Quick Select Buttons */}
                        <Box sx={{mb: 2}}>
                            <Typography variant="body2" sx={{mb: 1, color: 'text.secondary'}}>Chọn nhanh:</Typography>
                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                {[
                                    'Sinh nhật',
                                    'Ngày 8/3',
                                    'Ngày 20/10',
                                    'Valentine',
                                    'Tết Nguyên Đán',
                                    'Khai trương',
                                    'Tốt nghiệp',
                                    'Cưới hỏi',
                                    'Thăng chức',
                                    'Chúc mừng',
                                    'Xin lỗi',
                                    'Cảm ơn'
                                ].map((occasion) => (
                                    <Button
                                        key={occasion}
                                        variant={formData.occasion === occasion ? 'contained' : 'outlined'}
                                        size="small"
                                        onClick={() => setFormData(prev => ({...prev, occasion}))}
                                        sx={{
                                            borderRadius: 20,
                                            textTransform: 'none',
                                            fontSize: '0.875rem',
                                            ...(formData.occasion === occasion ? {
                                                backgroundColor: '#2E7D32',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: '#1B5E20'
                                                }
                                            } : {
                                                borderColor: '#E0EBE7',
                                                color: '#2E7D32',
                                                '&:hover': {
                                                    borderColor: '#2E7D32',
                                                    backgroundColor: 'rgba(46, 125, 50, 0.04)'
                                                }
                                            })
                                        }}
                                    >
                                        {occasion}
                                    </Button>
                                ))}
                            </Box>
                        </Box>

                        <TextField
                            fullWidth
                            label="Hoặc nhập dịp khác"
                            placeholder="Nhập dịp đặc biệt khác..."
                            value={formData.occasion}
                            onChange={(e) => setFormData(prev => ({...prev, occasion: e.target.value}))}
                            sx={{
                                backgroundColor: '#F9FCFB',
                                borderRadius: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#E0EBE7'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#BFD9D1'
                                },
                                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#2E7D32'
                                }
                            }}
                        />
                    </Box>

                    <Divider sx={{my: 4}}/>

                    {/* Filters */}
                    <Box sx={{mb: 4}}>
                        <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>Bộ lọc sen đá</Typography>
                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
                            <Box sx={{width: {xs: '100%', sm: 'calc(50% - 8px)'}}}>
                                <FormControl fullWidth size="small" sx={{
                                    backgroundColor: '#F9FCFB',
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#E0EBE7'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#BFD9D1'
                                    },
                                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#2E7D32'
                                    }
                                }}>
                                    <InputLabel>Chọn bộ lọc</InputLabel>
                                    <Select
                                        value={filterType}
                                        label="Chọn bộ lọc"
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            setFilterType(newType);
                                            setFilterValue('all');
                                        }}
                                    >
                                        <MenuItem value="none">Tất cả</MenuItem>
                                        <MenuItem value="fengshui">Theo mệnh</MenuItem>
                                        <MenuItem value="zodiac">Theo cung hoàng đạo</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            {filterType !== 'none' && (
                                <Box sx={{width: {xs: '100%', sm: 'calc(50% - 8px)'}}}>
                                    <FormControl fullWidth size="small" sx={{
                                        backgroundColor: '#F9FCFB',
                                        borderRadius: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#E0EBE7'
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#BFD9D1'
                                        },
                                        '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#2E7D32'
                                        }
                                    }}>
                                        <InputLabel>{filterType === 'fengshui' ? 'Theo mệnh' : 'Theo cung hoàng đạo'}</InputLabel>
                                        <Select
                                            value={filterValue}
                                            label={filterType === 'fengshui' ? 'Theo mệnh' : 'Theo cung hoàng đạo'}
                                            onChange={(e) => setFilterValue(e.target.value)}
                                        >
                                            <MenuItem value="all">Tất cả</MenuItem>
                                            {(filterType === 'fengshui' ? FENGSHUI : ZODIACS).map(item => (
                                                <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{my: 4}}/>

                    {/* Succulents */}
                    <Box sx={{mb: 4}}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                            <Typography variant="h6" sx={{fontWeight: 600}}>Chọn Sen Đá</Typography>
                            <Button variant="outlined"
                                    color="success"
                                    startIcon={<AddIcon/>}
                                    onClick={handleAddSucculent}
                            >
                                Thêm sen đá
                            </Button>
                        </Box>
                        {formData.succulents.map((succulent, index) => (
                            <Card key={index} sx={{
                                p: 2,
                                mb: 2,
                                display: 'flex',
                                gap: 2,
                                alignItems: 'center',
                                border: '1px solid #E6F1ED',
                                backgroundColor: '#FAFFFD',
                                borderRadius: 2
                            }}>
                                <FormControl sx={{flex: 3}}>
                                    <InputLabel>Sen đá</InputLabel>
                                    <Select value={succulent.id} label="Sen đá"
                                            onChange={(e) => handleSucculentChange(index, 'id', e.target.value)}
                                            variant="outlined">
                                        {filteredSucculents.map(s =>
                                            <MenuItem key={s.id} value={s.id}>
                                                {s.speciesName}
                                            </MenuItem>)}
                                    </Select>
                                </FormControl>
                                <FormControl sx={{flex: 2}} disabled={!succulent.id}>
                                    <InputLabel>Size</InputLabel>
                                    <Select value={succulent.size} label="Size"
                                            onChange={(e) => handleSucculentChange(index, 'size', e.target.value)}
                                            variant="outlined">
                                        {
                                            succulent.id ?
                                                (Object.keys(allSucculents.find(s => s.id === succulent.id)?.size)
                                                    .sort(
                                                        (s1, s2) => succulentSizeOrder.indexOf(s1) - succulentSizeOrder.indexOf(s2))
                                                    .map(
                                                        sizeKey => {
                                                            return (
                                                                <MenuItem key={sizeKey} value={sizeKey}>
                                                                    {sizeKey.substring(0, 1).toUpperCase() + sizeKey.substring(1).toLowerCase()}
                                                                </MenuItem>
                                                            )
                                                        }
                                                    ))
                                                :
                                                ""
                                        }
                                    </Select>
                                </FormControl>
                                <TextField sx={{flex: 1}} label="Số lượng" type="number" value={succulent.quantity}
                                           onChange={(e) => handleSucculentChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                           slotProps={{
                                               input: {
                                                   min: 1
                                               }
                                           }}
                                />
                                <IconButton color="error"
                                            onClick={() => handleRemoveSucculent(index)}><DeleteIcon/></IconButton>
                            </Card>
                        ))}
                    </Box>

                    <Divider sx={{my: 4}}/>

                    {/* Pot, Soil, Decorations */}
                    <Box>
                        {/* Pot */}
                        <Box sx={{mb: 3}}>
                            <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>Chọn Chậu</Typography>
                            <FormControl fullWidth>
                                <InputLabel>Loại chậu</InputLabel>
                                <Select value={formData.pot} label="Loại chậu" onChange={handlePotChange}
                                        variant="outlined">
                                    {availablePots.map(p => <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth sx={{mt: 2}} disabled={!formData.pot}>
                                <InputLabel>Kích thước chậu</InputLabel>
                                <Select value={formData.potSize} label="Kích thước chậu"
                                        onChange={(e) => setFormData(prev => ({...prev, potSize: e.target.value}))}
                                        variant="outlined">
                                    {
                                        selectedPotForSize?.size.map(s =>
                                            <MenuItem key={s.name} value={s.name}>{s.name}</MenuItem>
                                        )
                                    }
                                </Select>
                            </FormControl>
                        </Box>
                        {/* Soil */}
                        <Box>
                            <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>Chọn Đất</Typography>
                            <FormControl fullWidth>
                                <InputLabel>Loại đất</InputLabel>
                                <Select value={formData.soil} label="Loại đất"
                                        onChange={(e) => setFormData(prev => ({...prev, soil: e.target.value}))}>
                                    {availableSoils.map(s => <MenuItem key={s.name} value={s.name}>{s.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <TextField fullWidth label="Khối lượng (gram)" type="number" value={formData.soilMass}
                                       onChange={(e) => setFormData(prev => ({
                                           ...prev,
                                           soilMass: parseInt(e.target.value) || 0
                                       }))} sx={{mt: 2}}
                                       slotProps={{
                                           input: {
                                               endAdornment: <InputAdornment position="end">g</InputAdornment>
                                           }
                                       }}
                            />
                        </Box>
                    </Box>

                    <Divider sx={{my: 4}}/>

                    {/* Decorations */}
                    <Box sx={{mb: 4}}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                            <Typography variant="h6" sx={{fontWeight: 600}}>Chọn Đồ Trang Trí</Typography>
                            <Button variant="outlined"
                                    color="success"
                                    startIcon={<AddIcon/>}
                                    onClick={handleAddDecoration}
                            >
                                Thêm đồ trang trí
                            </Button>
                        </Box>
                        {formData.decorations.map((decoration, index) => (
                            <Card key={index} sx={{
                                p: 2,
                                mb: 2,
                                display: 'flex',
                                gap: 2,
                                alignItems: 'center',
                                border: '1px solid #E6F1ED',
                                backgroundColor: '#FAFFFD',
                                borderRadius: 2
                            }}>
                                <FormControl sx={{flex: 3}}>
                                    <InputLabel>Đồ trang trí</InputLabel>
                                    <Select value={decoration.name} label="Đồ trang trí"
                                            onChange={(e) => handleDecorationChange(index, 'name', e.target.value)}
                                            variant="outlined">
                                        {availableDecorations.map(d =>
                                            <MenuItem key={d.name} value={d.name}>
                                                {d.name}
                                            </MenuItem>)}
                                    </Select>
                                </FormControl>
                                <TextField sx={{flex: 1}} label="Số lượng" type="number" value={decoration.quantity}
                                           onChange={(e) => handleDecorationChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                           slotProps={{
                                               input: {
                                                   min: 1
                                               }
                                           }}
                                />
                                <IconButton color="error"
                                            onClick={() => handleRemoveDecoration(index)}><DeleteIcon/></IconButton>
                            </Card>
                        ))}
                    </Box>

                    <Divider sx={{my: 4}}/>

                    {/* Image Upload */}
                    <Box>
                        <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>Hình ảnh tham khảo</Typography>
                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
                            {formData.images.map((image, index) => (
                                <Box key={index}>
                                    <Box sx={{position: 'relative'}}>
                                        <img src={image.url} alt="upload" width="100" height="100"
                                             style={{objectFit: 'cover'}}/>
                                        <IconButton size="small" sx={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            backgroundColor: 'white'
                                        }} onClick={() => handleRemoveImage(index)}>
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </Box>
                                </Box>
                            ))}
                            <Box>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    component="label"
                                    startIcon={<PhotoCameraIcon/>}
                                    sx={{
                                        height: '100px',
                                        width: '100px',
                                        borderStyle: 'dashed',
                                        backgroundColor: '#fff'
                                    }}
                                >
                                    Tải ảnh
                                    <input type="file" hidden accept="image/*" onChange={handleFileSelected}/>
                                </Button>
                            </Box>
                        </Box>
                        {isUploading && <CircularProgress size={20}/>}
                    </Box>

                    <Box sx={{mt: 4, display: 'flex', justifyContent: 'flex-end'}}>
                        <Button variant="contained" color="success" size="large" onClick={handleSubmit}
                                disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={24}/> : "Gửi Yêu Cầu"}
                        </Button>
                    </Box>
                </Paper>
                
                {/* AI Suggestion Dialog */}
                <AiSuggestionDialog
                    open={aiDialogOpen}
                    onClose={() => setAiDialogOpen(false)}
                    onApplySuggestion={handleApplyAiSuggestion}
                />
            </Container>
        </Box>
    );
}
