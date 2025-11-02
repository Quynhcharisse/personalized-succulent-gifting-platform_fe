import React, {useState} from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import {uploadToCloudinary} from '../../cloudinaryUpload.js';
import {processCustomRequest} from '../../../services/CustomeRequestService.jsx';
import {useSnackbar} from 'notistack';
import {DASHBOARD_STYLES} from '../../constants.js';
import ActionButton from '../../buttonCustom/ActionButton.jsx';

export default function ProcessRequestDialog({open, onClose, requestId, onSuccess, isReject = false}) {
    const {enqueueSnackbar} = useSnackbar();
    const [images, setImages] = useState([{url: ''}]);
    const [uploading, setUploading] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [rejectOpen, setRejectOpen] = useState(false);

    const handleAddImage = () => {
        setImages(prev => [...prev, {url: ''}]);
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileChange = async (event, index) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadingIndex(index);
        setError('');

        try {
            const imageUrl = await uploadToCloudinary(file);
            setImages(prev => prev.map((img, i) => i === index ? {url: imageUrl} : img));
            enqueueSnackbar('Tải ảnh thành công', {variant: 'success'});
        } catch (error) {
            console.error('Error uploading image:', error);
            enqueueSnackbar('Tải ảnh thất bại', {variant: 'error'});
            setError('Tải ảnh thất bại. Vui lòng thử lại.');
        } finally {
            setUploading(false);
            setUploadingIndex(null);
            if (event.target) event.target.value = '';
        }
    };

    const handleApprove = async () => {
        const validImages = images.filter(img => img.url && img.url.trim() !== '');
        if (validImages.length === 0) {
            setError('Vui lòng tải ít nhất một ảnh thiết kế');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const requestData = {
                id: requestId,
                images: validImages.map(img => ({ url: img.url })),
                rejectReason: rejectReason && rejectReason.trim() !== '' ? rejectReason.trim() : undefined
            };

            const response = await processCustomRequest(requestData, "true");
            if (response) {
                enqueueSnackbar('Cập nhật thiết kế thành công', {variant: 'success'});
                if (onSuccess) onSuccess();
                handleClose();
            }
        } catch (error) {
            console.error('Error submitting design:', error);
            const errorMsg = error?.response?.data?.message || 'Cập nhật thiết kế thất bại';
            setError(errorMsg);
            enqueueSnackbar(errorMsg, {variant: 'error'});
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenReject = () => {
        setRejectOpen(true);
    };

    const handleConfirmReject = async () => {
        setSubmitting(true);
        setError('');

        try {
            const requestData = {
                id: requestId,
                images: [],
                rejectReason: rejectReason && rejectReason.trim() !== '' ? rejectReason.trim() : undefined
            };
            const response = await processCustomRequest(requestData, "false");
            if (response) {
                enqueueSnackbar('Từ chối yêu cầu thành công', {variant: 'success'});
                if (onSuccess) onSuccess();
                handleClose();
            }
        } catch (error) {
            console.error('Error submitting design:', error);
            const errorMsg = error?.response?.data?.message || 'Từ chối yêu cầu thất bại';
            setError(errorMsg);
            enqueueSnackbar(errorMsg, {variant: 'error'});
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setImages([{url: ''}]);
        setError('');
        setRejectReason('');
        setRejectOpen(false);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        ...DASHBOARD_STYLES.dialog,
                        borderRadius: 4
                    }
                }
            }}
        >
            <DialogTitle sx={DASHBOARD_STYLES.dialogTitle}>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Typography variant="h5" sx={{fontWeight: 700}}>
                        Xem Xét & Cập Nhật Thiết Kế
                    </Typography>
                    <ActionButton
                        action="cancel"
                        onClick={handleClose}
                        sx={{
                            minWidth: 'auto',
                            px: 2,
                            py: 0.5
                        }}
                    />
                </Box>
            </DialogTitle>

            <DialogContent sx={DASHBOARD_STYLES.dialogContent}>
                {error && (
                    <Alert severity="error" sx={{mb: 3, borderRadius: 2}}>
                        {error}
                    </Alert>
                )}

                <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                    <Box>
                        <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 2, color: '#0D3B2E'}}>
                            Upload Ảnh Thiết Kế
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                            Tải lên các ảnh thiết kế của sản phẩm tùy chỉnh. Bạn có thể tải nhiều ảnh.
                        </Typography>

                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
                            {images.map((image, index) => (
                                <Box key={index} sx={{position: 'relative'}}>
                                    <Avatar
                                        src={image.url}
                                        variant="rounded"
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            backgroundColor: '#f0f0f0',
                                            border: '2px dashed #ccc',
                                            '&:hover': {
                                                borderColor: '#0D3B2E'
                                            }
                                        }}
                                    >
                                        {!image.url && (
                                            <PhotoCameraIcon sx={{fontSize: 40, color: '#999'}}/>
                                        )}
                                    </Avatar>
                                    <input
                                        accept="image/*"
                                        style={{display: 'none'}}
                                        id={`upload-button-${index}`}
                                        type="file"
                                        onChange={(e) => handleFileChange(e, index)}
                                        disabled={uploading}
                                    />

                                    <label htmlFor={`upload-button-${index}`}>
                                        <IconButton
                                            component="span"
                                            disabled={uploading}
                                            sx={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                backgroundColor: 'white',
                                                boxShadow: 2,
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5'
                                                },
                                                '&.Mui-disabled': {
                                                    opacity: 0.5
                                                }
                                            }}
                                        >
                                            {uploading && uploadingIndex === index ? (
                                                <CloudUploadIcon sx={{color: '#0D3B2E'}}/>
                                            ) : (
                                                <CloudUploadIcon sx={{color: '#0D3B2E'}}/>
                                            )}
                                        </IconButton>
                                    </label>
                                    {image.url && (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveImage(index)}
                                            sx={{
                                                position: 'absolute',
                                                top: -8,
                                                left: -8,
                                                backgroundColor: 'error.main',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: 'error.dark'
                                                }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    )}
                                </Box>
                            ))}

                            {images.length < 10 && (
                                <Box
                                    component="button"
                                    onClick={handleAddImage}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        border: '2px dashed #ccc',
                                        borderRadius: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: 'transparent',
                                        '&:hover': {
                                            borderColor: '#0D3B2E',
                                            backgroundColor: 'rgba(11, 63, 49, 0.05)'
                                        }
                                    }}
                                >
                                    <AddIcon sx={{fontSize: 40, color: '#999'}}/>
                                    <Typography variant="caption" color="text.secondary" sx={{mt: 0.5}}>
                                        Thêm ảnh
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                </Box>
            </DialogContent>

            <DialogActions sx={{p: 3, pt: 0, gap: 1}}>
                <Button
                    variant={'contained'}
                    color="error"
                    onClick={handleOpenReject}
                    disabled={submitting}
                    sx={{fontWeight: 600}}
                >
                    Từ chối
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleApprove}
                    disabled={submitting || images.filter(img => img.url).length === 0}
                    sx={{fontWeight: 600}}
                >
                    Phê duyệt
                </Button>
            </DialogActions>

            {/* Confirm Reject Dialog */}
            <Dialog
                open={rejectOpen}
                onClose={() => setRejectOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Xác nhận từ chối</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{mb: 2}}>
                        Bạn có chắc chắn muốn từ chối yêu cầu này? Vui lòng nhập lý do (tuỳ chọn).
                    </Typography>
                    <TextField
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Nhập lý do từ chối"
                        fullWidth
                        multiline
                        minRows={3}
                    />
                </DialogContent>
                <DialogActions sx={{p: 2}}>
                    <Button onClick={() => setRejectOpen(false)} disabled={submitting}>Hủy</Button>
                    <Button color="error" variant="contained" onClick={handleConfirmReject} disabled={submitting}>
                        Xác nhận từ chối
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
}

