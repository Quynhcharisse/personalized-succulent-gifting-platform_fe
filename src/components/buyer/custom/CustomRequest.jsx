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
import {Add as AddIcon, ArrowBack, Build, Delete as DeleteIcon, PhotoCamera as PhotoCameraIcon} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {getAccessories, getSucculents} from '../../../services/ProductService.jsx';
import {createCustomProductRequest} from '../../../services/CustomeRequestService.jsx';
import {useSnackbar} from 'notistack';
import {FENGSHUI, ZODIACS} from '../../constants.js';
import uploadToCloudinary from '../../cloudinaryUpload.js';

export default function CustomRequest() {
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

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
        decorations: [], // Array of objects: [{name: '', quantity: 1}]
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
                console.error("Error loading data:", error);
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

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            // Transform data to match API payload structure
            const selectedPot = availablePots.find(p => p.name === formData.pot);
            const selectedSoil = availableSoils.find(s => s.name === formData.soil);

            const payload = {
                images: formData.images,
                size: {
                    succulents: formData.succulents.map(s => {
                        console.log("allSucculents: ", allSucculents)
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
            console.error("Error submitting custom request:", error);
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
                <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                    <Button
                        startIcon={<ArrowBack/>}
                        onClick={() => navigate('/custom-request')}
                        sx={{mr: 2, color: '#0D3B2E'}}
                    >
                        Quay lại
                    </Button>
                    <Typography variant="h4" sx={{fontWeight: 700, color: '#0D3B2E'}}>
                        <Build sx={{verticalAlign: 'middle', mr: 1}}/>
                        Điện Cây - Đặt hàng tùy chỉnh
                    </Typography>
                </Box>

                <Paper elevation={0}
                       sx={{p: 4, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', backgroundColor: '#fff'}}>
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
            </Container>
        </Box>
    );
}
