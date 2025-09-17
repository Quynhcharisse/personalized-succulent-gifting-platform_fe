import React, {useRef} from 'react';
import {Box, Button, CircularProgress, LinearProgress, Typography} from '@mui/material';
import {LocalFlorist as LocalFloristIcon} from '@mui/icons-material';

const UploadImageField = ({
    imageUrl,
    isUploading,
    uploadProgress,
    onFileSelected,
    errorText
}) => {
    const localInputRef = useRef(null);

    const handleClick = () => {
        if (localInputRef.current) {
            localInputRef.current.click();
        }
    };

    return (
        <Box sx={{width: '100%'}}>
            <Typography variant="body2" sx={{
                mb: 1,
                fontWeight: 700,
                color: '#424242',
                fontSize: '0.95rem'
            }}>
                Hình ảnh sản phẩm *
            </Typography>

            <input
                type="file"
                ref={localInputRef}
                onChange={onFileSelected}
                accept="image/*"
                style={{display: 'none'}}
            />

            <Button
                variant="outlined"
                component="label"
                disabled={isUploading}
                onClick={handleClick}
                sx={{
                    width: '100%',
                    height: '56px',
                    borderRadius: 3,
                    border: '2px dashed #4caf50',
                    backgroundColor: imageUrl ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    color: imageUrl ? '#4caf50' : '#424242',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    '&:hover': {
                        backgroundColor: imageUrl ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
                        borderColor: '#4caf50',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                    },
                    '&:disabled': {
                        opacity: 0.7
                    }
                }}
            >
                {isUploading ? (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <CircularProgress size={20}/>
                        <Typography>Đang upload...</Typography>
                    </Box>
                ) : imageUrl ? (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <LocalFloristIcon/>
                        <Typography>✓ Đã upload ảnh</Typography>
                    </Box>
                ) : (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <LocalFloristIcon/>
                        <Typography>Chọn ảnh để upload</Typography>
                    </Box>
                )}
            </Button>

            {isUploading && (
                <Box sx={{mt: 1}}>
                    <LinearProgress
                        variant="determinate"
                        value={uploadProgress}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: '#4caf50'
                            }
                        }}
                    />
                    <Typography variant="caption" sx={{
                        display: 'block',
                        textAlign: 'center',
                        mt: 0.5,
                        color: '#4caf50',
                        fontWeight: 600
                    }}>
                        {uploadProgress}% hoàn thành
                    </Typography>
                </Box>
            )}

            {imageUrl && (
                <Box sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: 'rgba(76, 175, 80, 0.05)',
                    borderRadius: 2,
                    border: '1px solid rgba(76, 175, 80, 0.2)'
                }}>
                    <Typography variant="body2" sx={{
                        color: '#4caf50',
                        fontWeight: 600,
                        wordBreak: 'break-all'
                    }}>
                        ✓ {imageUrl}
                    </Typography>
                </Box>
            )}

            {errorText && (
                <Typography variant="caption" sx={{
                    color: 'error.main',
                    mt: 0.5,
                    display: 'block'
                }}>
                    {errorText}
                </Typography>
            )}
        </Box>
    );
};

export default UploadImageField;


