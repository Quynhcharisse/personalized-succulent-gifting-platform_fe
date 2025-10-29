import React from 'react';
import {Box, Chip, Dialog, DialogContent, DialogTitle, Paper, Typography} from '@mui/material';
import {LocalFlorist as LocalFloristIcon} from '@mui/icons-material';
import {DASHBOARD_STYLES, FENGSHUI, ZODIACS} from '../../constants.js';
import ActionButton from '../../buttonCustom/ActionButton.jsx';

const SucculentDetailDialog = ({open, onClose, succulent}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: DASHBOARD_STYLES.dialog
                }
            }}
        >
            <DialogTitle sx={{
                ...DASHBOARD_STYLES.dialogTitle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <LocalFloristIcon sx={{fontSize: '2rem'}}/>
                    Chi Tiết Sản Phẩm
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
            <DialogContent sx={DASHBOARD_STYLES.dialogContent}>
                {succulent && (
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 3,
                        height: '100%'
                    }}>
                        <Box sx={{
                            flex: {xs: '1 1 100%', sm: '1 1 260px'},
                            maxWidth: {sm: 320},
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {succulent.imageUrl ? (
                                <>
                                    <Box sx={{
                                        width: '100%',
                                        height: '200px',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                                        border: '2px solid rgba(76, 175, 80, 0.2)'
                                    }}>
                                        <img
                                            src={succulent.imageUrl}
                                            alt={succulent.speciesName}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="h6" sx={{
                                        color: '#0b3f31',
                                        fontWeight: 700,
                                        textAlign: 'center',
                                        mt: 1.5,
                                        px: 1
                                    }}>
                                        {succulent.speciesName}
                                    </Typography>
                                </>
                            ) : (
                                <Box sx={{
                                    width: '100%',
                                    height: '200px',
                                    textAlign: 'center',
                                    p: 3,
                                    background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
                                    borderRadius: 3,
                                    border: '2px dashed rgba(76, 175, 80, 0.3)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <LocalFloristIcon
                                        sx={{fontSize: '4rem', color: 'success.main', opacity: 0.7, mb: 1}}/>
                                    <Typography variant="h6"
                                                sx={{color: '#0b3f31', fontWeight: 600, opacity: 0.8}}>
                                        {succulent.speciesName}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Box sx={{flex: {xs: '1 1 100%', sm: '1 1 420px'}}}>
                            <Paper elevation={2} sx={{
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                                border: '1px solid rgba(76, 175, 80, 0.1)',
                                height: '100%',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%'}}>
                                    <Box>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#0b3f31',
                                            mb: 1.5,
                                            pb: 0.5,
                                            borderBottom: '2px solid rgba(11, 63, 49, 0.2)'
                                        }}>
                                            Mô tả
                                        </Typography>
                                        <Box sx={{
                                            p: 2,
                                            background: 'rgba(255, 193, 7, 0.05)',
                                            borderRadius: 2,
                                            border: '1px solid rgba(255, 193, 7, 0.1)',
                                            minHeight: '60px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <Typography variant="body1" sx={{
                                                color: 'text.primary',
                                                fontStyle: 'italic',
                                                lineHeight: 1.4,
                                                fontSize: '0.95rem',
                                                wordBreak: 'break-word',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}>
                                                {succulent.description}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Size Details */}
                                    {succulent.size && typeof succulent.size === 'object' && Object.keys(succulent.size).length > 0 && (
                                        <Box>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 700,
                                                color: '#0b3f31',
                                                mb: 1.5,
                                                pb: 0.5,
                                                borderBottom: '2px solid rgba(11, 63, 49, 0.2)'
                                            }}>
                                                Chi Tiết Kích Thước
                                            </Typography>
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                {Object.entries(succulent.size).map(([sizeName, sizeInfo]) => (
                                                    <Box key={sizeName} sx={{
                                                        p: 2,
                                                        backgroundColor: '#f8fffe',
                                                        borderRadius: 2,
                                                        border: '1px solid rgba(34, 197, 94, 0.2)'
                                                    }}>
                                                        <Typography variant="subtitle1"
                                                                    sx={{fontWeight: 600, mb: 1.5, color: '#0b3f31'}}>
                                                            {sizeName.toUpperCase()}
                                                        </Typography>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            flexDirection: {xs: 'column', sm: 'row'},
                                                            gap: 2
                                                        }}>
                                                            <Box sx={{flex: 1}}>
                                                                <Typography variant="body2" color="text.secondary"
                                                                            sx={{mb: 0.5}}>
                                                                    Giá bán:
                                                                </Typography>
                                                                <Typography variant="body1"
                                                                            sx={{fontWeight: 600, color: '#0b3f31'}}>
                                                                    {sizeInfo.price?.toLocaleString('vi-VN')} ₫
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{flex: 1}}>
                                                                <Typography variant="body2" color="text.secondary"
                                                                            sx={{mb: 0.5}}>
                                                                    Số lượng:
                                                                </Typography>
                                                                <Typography variant="body1"
                                                                            sx={{fontWeight: 600, color: '#0b3f31'}}>
                                                                    {sizeInfo.quantity}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{flex: 1}}>
                                                                <Typography variant="body2" color="text.secondary"
                                                                            sx={{mb: 0.5}}>
                                                                    Diện tích:
                                                                </Typography>
                                                                <Typography variant="body1"
                                                                            sx={{fontWeight: 600, color: '#0b3f31'}}>
                                                                    {sizeInfo.minArea} - {sizeInfo.maxArea} m²
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{flex: 1}}>
                                                                <Typography variant="body2" color="text.secondary"
                                                                            sx={{mb: 0.5}}>
                                                                    Trạng thái:
                                                                </Typography>
                                                                <Chip
                                                                    label={sizeInfo.status || 'Đang còn hàng'}
                                                                    color={sizeInfo.quantity > 0 ? 'success' : 'error'}
                                                                    variant="filled"
                                                                    size="small"
                                                                    sx={{fontWeight: 600}}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    <Box>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#0b3f31',
                                            mb: 1.5,
                                            pb: 0.5,
                                            borderBottom: '2px solid rgba(11, 63, 49, 0.2)'
                                        }}>
                                            Giá Cả & Trạng Thái
                                        </Typography>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1.5}}>
                                                <Box sx={{
                                                    flex: {xs: '1 1 100%', sm: '1 1 240px'},
                                                    p: 1.5,
                                                    background: 'rgba(76, 175, 80, 0.1)',
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(76, 175, 80, 0.2)',
                                                    textAlign: 'center',
                                                    minHeight: '50px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="subtitle2" sx={{
                                                        fontWeight: 600,
                                                        mb: 0.5,
                                                        color: 'text.secondary',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        Giá bán:
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        color: '#0b3f31',
                                                        fontWeight: 800,
                                                        fontSize: '1.1rem',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {succulent.size && typeof succulent.size === 'object'
                                                            ? `${Math.min(...Object.values(succulent.size).map(s => s.price || 0)).toLocaleString('vi-VN')} - ${Math.max(...Object.values(succulent.size).map(s => s.price || 0)).toLocaleString('vi-VN')}`
                                                            : (succulent.priceSell?.toLocaleString('vi-VN') || '0')
                                                        } ₫
                                                    </Typography>
                                                </Box>
                                                <Box sx={{
                                                    flex: {xs: '1 1 100%', sm: '1 1 240px'},
                                                    p: 1.5,
                                                    background: 'rgba(156, 39, 176, 0.1)',
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(156, 39, 176, 0.2)',
                                                    textAlign: 'center',
                                                    minHeight: '50px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="subtitle2" sx={{
                                                        fontWeight: 600,
                                                        mb: 0.5,
                                                        color: 'text.secondary',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        Số lượng:
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 800,
                                                        color: 'purple.main',
                                                        fontSize: '1.1rem'
                                                    }}>
                                                        {succulent.size && typeof succulent.size === 'object'
                                                            ? Object.values(succulent.size).reduce((sum, sizeInfo) => sum + (sizeInfo?.quantity || 0), 0)
                                                            : (succulent.quantity || 0)
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{
                                                p: 1.5,
                                                background: (() => {
                                                    const totalQuantity = succulent.size && typeof succulent.size === 'object'
                                                        ? Object.values(succulent.size).reduce((sum, sizeInfo) => sum + (sizeInfo?.quantity || 0), 0)
                                                        : (succulent.quantity || 0);
                                                    return totalQuantity > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';
                                                })(),
                                                borderRadius: 2,
                                                border: (() => {
                                                    const totalQuantity = succulent.size && typeof succulent.size === 'object'
                                                        ? Object.values(succulent.size).reduce((sum, sizeInfo) => sum + (sizeInfo?.quantity || 0), 0)
                                                        : (succulent.quantity || 0);
                                                    return totalQuantity > 0 ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(244, 67, 54, 0.2)';
                                                })(),
                                                textAlign: 'center',
                                                minHeight: '50px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center'
                                            }}>
                                                <Typography variant="subtitle2" sx={{
                                                    fontWeight: 600,
                                                    mb: 0.5,
                                                    color: 'text.secondary',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    Trạng thái:
                                                </Typography>
                                                <Chip
                                                    label={(() => {
                                                        const totalQuantity = succulent.size && typeof succulent.size === 'object'
                                                            ? Object.values(succulent.size).reduce((sum, sizeInfo) => sum + (sizeInfo?.quantity || 0), 0)
                                                            : (succulent.quantity || 0);
                                                        return totalQuantity > 0 ? 'Đang còn hàng' : 'Hết hàng';
                                                    })()}
                                                    color={(() => {
                                                        const totalQuantity = succulent.size && typeof succulent.size === 'object'
                                                            ? Object.values(succulent.size).reduce((sum, sizeInfo) => sum + (sizeInfo?.quantity || 0), 0)
                                                            : (succulent.quantity || 0);
                                                        return totalQuantity > 0 ? 'success' : 'error';
                                                    })()}
                                                    variant="filled"
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: '0.8rem',
                                                        px: 1.5,
                                                        py: 0.25,
                                                        maxWidth: 'fit-content',
                                                        mx: 'auto'
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{flex: 1}}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#0b3f31',
                                            mb: 1.5,
                                            pb: 0.5,
                                            borderBottom: '2px solid rgba(11, 63, 49, 0.2)'
                                        }}>
                                            Thuộc Tính Đặc Biệt
                                        </Typography>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                            <Box sx={{
                                                p: 1.5,
                                                background: 'rgba(76, 175, 80, 0.05)',
                                                borderRadius: 2,
                                                border: '1px solid rgba(76, 175, 80, 0.1)',
                                                minHeight: '60px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center'
                                            }}>
                                                <Typography variant="subtitle2" sx={{
                                                    fontWeight: 600,
                                                    mb: 1,
                                                    color: 'text.secondary',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    Phong thủy:
                                                </Typography>
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 0.5,
                                                    justifyContent: 'flex-start'
                                                }}>
                                                    {(succulent.fengShuiElements || succulent.fengShuiList) && (succulent.fengShuiElements || succulent.fengShuiList).length > 0 ?
                                                        (succulent.fengShuiElements || succulent.fengShuiList).map((element, index) => (
                                                            <Chip
                                                                key={index}
                                                                label={FENGSHUI.find(opt => opt.value === element)?.label || element}
                                                                color="success"
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    fontSize: '0.7rem',
                                                                    px: 1,
                                                                    py: 0.25
                                                                }}
                                                            />
                                                        )) : (
                                                            <Typography variant="body2" sx={{
                                                                color: 'text.secondary',
                                                                fontStyle: 'italic'
                                                            }}>
                                                                Chưa có thông tin phong thủy
                                                            </Typography>
                                                        )
                                                    }
                                                </Box>
                                            </Box>

                                            <Box sx={{
                                                p: 1.5,
                                                background: 'rgba(33, 150, 243, 0.05)',
                                                borderRadius: 2,
                                                border: '1px solid rgba(33, 150, 243, 0.1)',
                                                minHeight: '60px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center'
                                            }}>
                                                <Typography variant="subtitle2" sx={{
                                                    fontWeight: 600,
                                                    mb: 1,
                                                    color: 'text.secondary',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    Cung hoàng đạo:
                                                </Typography>
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 0.5,
                                                    justifyContent: 'flex-start'
                                                }}>
                                                    {(succulent.zodiacs || succulent.zodiacList) && (succulent.zodiacs || succulent.zodiacList).length > 0 ?
                                                        (succulent.zodiacs || succulent.zodiacList).map((zodiac, index) => (
                                                            <Chip
                                                                key={index}
                                                                label={ZODIACS.find(opt => opt.value === zodiac)?.label || zodiac}
                                                                color="info"
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    fontSize: '0.7rem',
                                                                    px: 1,
                                                                    py: 0.25
                                                                }}
                                                            />
                                                        )) : (
                                                            <Typography variant="body2" sx={{
                                                                color: 'text.secondary',
                                                                fontStyle: 'italic'
                                                            }}>
                                                                Chưa có thông tin cung hoàng đạo
                                                            </Typography>
                                                        )
                                                    }
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SucculentDetailDialog;


