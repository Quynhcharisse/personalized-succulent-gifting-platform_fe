import React, {useEffect} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import {FENGSHUI, ZODIACS} from '../../constants.js';
import UploadImageField from './UploadImageField.jsx';
import ActionButton from "../../buttonCustom/ActionButton.jsx";

const CreateSucculentDialog = ({
                                   open,
                                   onClose,
                                   currentStep,
                                   isValidating,
                                   isSubmitting,
                                   formData,
                                   setFormData,
                                   errors,
                                   submitMessage,
                                   onPrev,
                                   onNext,
                                   onSubmit,
                                   onFileSelected,
                                   isUploading,
                                   uploadProgress
                               }) => {
    const buildCreateSucculentPayload = (data) => {
        const nonEmpty = (data.sizeDetailRequests || []).filter((item) =>
            (item && String(item.name || '').trim())
        );
        const sizeList = nonEmpty.map((item) => ({
            sizeName: (item.name || '').toLowerCase(),
            price: Number(item.price) || 0,
            maxArea: Number(item.maxArea) || 0,
            minArea: Number(item.minArea) || 0,
            quantity: Number(item.quantity) || 0,
        }));

        return {
            speciesName: data.species_name,
            description: data.description,
            imageUrl: data.imageUrl,
            fengShuiList: data.fengShuiList || [],
            zodiacList: data.zodiacList || [],
            sizeList
        };
    };
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.12)',
                        border: '2px solid rgba(76, 175, 80, 0.08)',
                        overflow: 'hidden',
                        minHeight: '600px'
                    }
                }
            }}
        >
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.4rem',
                py: 3,
                position: 'relative',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)'
                }
            }}>
                <Box sx={{textAlign: 'center'}}>
                    <Typography variant="h4" sx={{
                        fontWeight: 900,
                        mb: 2,
                        fontSize: '1.6rem'
                    }}>
                        Tạo Sản Phẩm Sen Đá Mới
                    </Typography>

                    <Box sx={{mt: 3}}>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5}}>
                            {[1, 2].map((step) => (
                                <Box key={step} sx={{display: 'flex', alignItems: 'center'}}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 800,
                                            fontSize: '1rem',
                                            backgroundColor: step <= currentStep ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.3)',
                                            color: step <= currentStep ? '#4caf50' : 'rgba(255, 255, 255, 0.7)',
                                            transition: 'all 0.3s ease',
                                            boxShadow: step <= currentStep ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
                                            border: step <= currentStep ? '3px solid rgba(255, 255, 255, 0.9)' : '2px solid rgba(255, 255, 255, 0.3)'
                                        }}
                                    >
                                        {step}
                                    </Box>
                                    {step < 2 && (
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 3,
                                                backgroundColor: step < currentStep ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                                                ml: 1.5,
                                                borderRadius: 2,
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    )}
                                </Box>
                            ))}
                        </Box>
                        <Typography variant="h6" sx={{
                            display: 'block',
                            textAlign: 'center',
                            mt: 2,
                            opacity: 0.95,
                            fontSize: '1rem',
                            fontWeight: 600
                        }}>
                            Bước {currentStep}/2: {currentStep === 1 ? 'Thông tin cơ bản & Thuộc tính' : 'Kích thước & Giá bán'}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent sx={{
                p: 5,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                minHeight: '450px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start'
            }}>
                <Box sx={{width: '100%', maxWidth: '800px', mx: 'auto'}}>
                    <Grid container spacing={4} mt={2}>
                        {currentStep === 1 && (
                            <Box sx={{width: '100%', display: 'flex', flexDirection: 'column', gap: 3}}>
                                <TextField
                                    fullWidth
                                    label="Tên loài sen đá"
                                    value={formData.species_name}
                                    onChange={(e) => setFormData(prev => ({...prev, species_name: e.target.value}))}
                                    error={!!errors.species_name}
                                    helperText={errors.species_name}
                                    placeholder="Tên loài sen đá *"
                                    required
                                    sx={{mt: 5}}
                                />

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Mô tả sản phẩm"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                                    error={!!errors.description}
                                    helperText={errors.description || 'Mô tả chi tiết về loài sen đá, đặc điểm, cách chăm sóc...'}
                                    placeholder="Mô tả chi tiết về loài sen đá, đặc điểm, cách chăm sóc..."
                                    required
                                />

                                <FormControl fullWidth error={!!errors.fengShuiList} required>
                                    <InputLabel sx={{fontWeight: 700, color: '#424242', fontSize: '0.95rem'}}>Phong
                                        Thủy</InputLabel>
                                    <Select
                                        multiple
                                        value={formData.fengShuiList}
                                        onChange={(e) => setFormData(prev => ({...prev, fengShuiList: e.target.value}))}
                                        label="Phong Thủy *"
                                        renderValue={(selected) => (
                                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                                {selected.map((val) => {
                                                    const label = FENGSHUI.find(opt => opt.value === val)?.label || val;
                                                    return <Chip key={val} label={label} size="small"/>;
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {FENGSHUI.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth error={!!errors.zodiacList} required>
                                    <InputLabel sx={{fontWeight: 700, color: '#424242', fontSize: '0.95rem'}}>Cung Hoàng
                                        Đạo</InputLabel>
                                    <Select
                                        multiple
                                        value={formData.zodiacList}
                                        onChange={(e) => setFormData(prev => ({...prev, zodiacList: e.target.value}))}
                                        label="Cung Hoàng Đạo *"
                                        renderValue={(selected) => (
                                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                                {selected.map((val) => {
                                                    const label = ZODIACS.find(opt => opt.value === val)?.label || val;
                                                    return <Chip key={val} label={label} size="small"/>;
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {ZODIACS.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <UploadImageField
                                    imageUrl={formData.imageUrl}
                                    isUploading={isUploading}
                                    uploadProgress={uploadProgress}
                                    onFileSelected={onFileSelected}
                                    errorText={errors.imageUrl}
                                />
                            </Box>
                        )}

                        {currentStep === 2 && (
                            <Box sx={{width: '100%', display: 'flex', flexDirection: 'column', gap: 3}}>
                                {errors.selectedSizes && (
                                    <Typography color="error" variant="body2">{errors.selectedSizes}</Typography>
                                )}
                                {useEffect(() => {
                                    if (!Array.isArray(formData.sizeDetailRequests) || formData.sizeDetailRequests.length === 0) {
                                        setFormData(prev => ({
                                            ...prev,
                                            sizeDetailRequests: [{ name: '', price: '', minArea: '', maxArea: '', quantity: '' }]
                                        }))
                                    }
                                }, [formData.sizeDetailRequests?.length])}
                                {formData.sizeDetailRequests.length > 0 && (
                                    <>
                                        <Typography variant="h5" sx={{
                                            mb: 2,
                                            fontWeight: 800,
                                            color: 'success.dark',
                                            textAlign: 'center',
                                            pb: 1,
                                            borderBottom: '3px solid rgba(76, 175, 80, 0.2)'
                                        }}>
                                            Chi Tiết Giá Bán
                                        </Typography>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                            {formData.sizeDetailRequests.map((size, index) => (
                                                <Card key={index} variant="outlined" sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                                                    border: '2px solid rgba(76, 175, 80, 0.1)',
                                                    mt: 2
                                                }}>
                                                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                        <Typography variant="h6" sx={{
                                                            mb: 2,
                                                            fontWeight: 700,
                                                            color: 'success.dark',
                                                            pb: 1,
                                                            borderBottom: '2px solid rgba(76, 175, 80, 0.2)'
                                                        }}>
                                                            Kích thước #{index + 1}
                                                        </Typography>
                                                        <Button color="error" onClick={() => {
                                                            const updated = [...formData.sizeDetailRequests];
                                                            updated.splice(index, 1);
                                                            setFormData(prev => ({...prev, sizeDetailRequests: updated}));
                                                        }}>Xóa</Button>
                                                    </Box>
                                                    <TextField
                                                        fullWidth
                                                        label="Tên kích thước (ví dụ: small, medium)"
                                                        value={size.name}
                                                        onChange={(e) => {
                                                            const updatedSizes = [...formData.sizeDetailRequests];
                                                            updatedSizes[index] = {
                                                                ...updatedSizes[index],
                                                                name: e.target.value
                                                            };
                                                            // auto-append a new empty row if this is the last and now non-empty
                                                            const isLast = index === updatedSizes.length - 1;
                                                            const isNonEmpty = String(e.target.value || '').trim().length > 0;
                                                            const canAdd = updatedSizes.length < 5;
                                                            const nextList = isLast && isNonEmpty && canAdd
                                                                ? [...updatedSizes, { name: '', price: '', minArea: '', maxArea: '', quantity: '' }]
                                                                : updatedSizes;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                sizeDetailRequests: nextList
                                                            }));
                                                        }}
                                                        error={!!errors[`size_${index}_name`]}
                                                        helperText={errors[`size_${index}_name`] || 'Nhập tên kích thước'}
                                                        placeholder="small"
                                                        required
                                                    />
                                                    <Box sx={{height: 12}}/>
                                                    <Typography variant="h6" sx={{
                                                        mb: 2,
                                                        fontWeight: 700,
                                                        color: 'success.dark',
                                                        textAlign: 'center',
                                                        pb: 1,
                                                        borderBottom: '2px solid rgba(76, 175, 80, 0.2)'
                                                    }}>
                                                        Thiết lập giá và số lượng
                                                    </Typography>
                                                    <TextField
                                                        fullWidth
                                                        label="Giá bán (VNĐ)"
                                                        type="number"
                                                        inputProps={{min: 1}}
                                                        value={size.price}
                                                        onChange={(e) => {
                                                            const updatedSizes = [...formData.sizeDetailRequests];
                                                            updatedSizes[index] = {
                                                                ...updatedSizes[index],
                                                                price: e.target.value
                                                            };
                                                            const isLast = index === updatedSizes.length - 1;
                                                            const isNonEmpty = String(e.target.value || '').trim().length > 0;
                                                            const canAdd = updatedSizes.length < 5;
                                                            const nextList = isLast && isNonEmpty && canAdd
                                                                ? [...updatedSizes, { name: '', price: '', minArea: '', maxArea: '', quantity: '' }]
                                                                : updatedSizes;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                sizeDetailRequests: nextList
                                                            }));
                                                        }}
                                                        error={!!errors[`size_${index}_price`]}
                                                        helperText={errors[`size_${index}_price`] || 'Nhập giá bán cho kích thước này'}
                                                        placeholder="16500"
                                                        InputProps={{
                                                            startAdornment: <InputAdornment
                                                                position="start">₫</InputAdornment>
                                                        }}
                                                        required
                                                    />
                                                    <Box sx={{height: 12}}/>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Diện tích tối thiểu (m²)"
                                                                type="number"
                                                                inputProps={{min: 0}}
                                                                value={size.minArea || ''}
                                                                onChange={(e) => {
                                                                    const updatedSizes = [...formData.sizeDetailRequests];
                                                                    updatedSizes[index] = {
                                                                        ...updatedSizes[index],
                                                                        minArea: e.target.value
                                                                    };
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        sizeDetailRequests: updatedSizes
                                                                    }));
                                                                }}
                                                                error={!!errors[`size_${index}_minArea`]}
                                                                helperText={errors[`size_${index}_minArea`] || 'Nhập diện tích tối thiểu'}
                                                                placeholder="1"
                                                                required
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Diện tích tối đa (m²)"
                                                                type="number"
                                                                inputProps={{min: 0}}
                                                                value={size.maxArea || ''}
                                                                onChange={(e) => {
                                                                    const updatedSizes = [...formData.sizeDetailRequests];
                                                                    updatedSizes[index] = {
                                                                        ...updatedSizes[index],
                                                                        maxArea: e.target.value
                                                                    };
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        sizeDetailRequests: updatedSizes
                                                                    }));
                                                                }}
                                                                error={!!errors[`size_${index}_maxArea`]}
                                                                helperText={errors[`size_${index}_maxArea`] || 'Nhập diện tích tối đa'}
                                                                placeholder="2"
                                                                required
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                    <Box sx={{height: 12}}/>
                                                    <TextField
                                                        fullWidth
                                                        label="Số lượng"
                                                        type="number"
                                                        inputProps={{min: 1}}
                                                        value={size.quantity || ''}
                                                        onChange={(e) => {
                                                            const updatedSizes = [...formData.sizeDetailRequests];
                                                            updatedSizes[index] = {
                                                                ...updatedSizes[index],
                                                                quantity: e.target.value
                                                            };
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                sizeDetailRequests: updatedSizes
                                                            }));
                                                        }}
                                                        error={!!errors[`size_${index}_quantity`]}
                                                        helperText={errors[`size_${index}_quantity`] || 'Nhập số lượng cho kích thước này'}
                                                        placeholder="100"
                                                        required
                                                    />
                                                </Card>
                                            ))}
                                        </Box>
                                    </>
                                )}
                            </Box>
                        )}
                    </Grid>
                </Box>

                {submitMessage.text && (
                    <Alert severity={submitMessage.type === 'success' ? 'success' : 'error'} variant="filled"
                           sx={{mt: 3, fontWeight: 600, borderRadius: 2}}>
                        {submitMessage.text}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions sx={{
                p: 4,
                gap: 3,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderTop: '2px solid rgba(76, 175, 80, 0.1)',
                justifyContent: 'space-between',
                minHeight: '90px',
                borderRadius: '0 0 24px 24px'
            }}>
                <ActionButton
                    onClick={onClose}
                    type={"button"}
                    action={'cancel'}
                />

                <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                    {currentStep > 1 && (
                        <Button onClick={onPrev} variant="outlined" disabled={isValidating} sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            borderColor: '#4caf50',
                            color: '#4caf50',
                            fontSize: '0.95rem',
                            minWidth: '120px'
                        }}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <Box sx={{fontSize: '1.2rem'}}>←</Box>
                                Trước
                            </Box>
                        </Button>
                    )}

                    {currentStep < 2 ? (
                        <Button onClick={onNext} variant="contained" disabled={isValidating} sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            px: 5,
                            py: 1.5,
                            background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                            fontSize: '0.95rem',
                            minWidth: '140px'
                        }}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                {isValidating ? <Box sx={{
                                    width: 18,
                                    height: 18,
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTop: '2px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}/> : (<>
                                    Tiếp theo
                                    <Box sx={{fontSize: '1.2rem'}}>→</Box>
                                </>)}
                            </Box>
                        </Button>
                    ) : (
                <ActionButton onClick={() => onSubmit && onSubmit(buildCreateSucculentPayload(formData))} disabled={isSubmitting || isValidating}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                {isSubmitting ? <Box sx={{
                                    width: 18,
                                    height: 18,
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTop: '2px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}/> : (<>
                                    <Box sx={{fontSize: '1.2rem'}}>✓</Box>
                                    Tạo Sản Phẩm
                                </>)}
                            </Box>
                        </ActionButton>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default CreateSucculentDialog;


