import React from 'react';
import {Box, Button, Chip, Dialog, DialogContent, DialogTitle, Paper, Typography} from '@mui/material';
import {LocalFlorist as LocalFloristIcon} from '@mui/icons-material';
import {FENG_SHUI_OPTIONS, ZODIAC_OPTIONS} from '../../../hooks/constants.js';

const SucculentDetailDialog = ({open, onClose, succulent}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        border: '1px solid rgba(76, 175, 80, 0.1)',
                        overflow: 'hidden'
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
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
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <LocalFloristIcon sx={{fontSize: '2rem'}}/>
                    Chi Tiết Sản Phẩm
                </Box>

                <Button
                    onClick={onClose}
                    variant="outlined"
                    size="small"
                    sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        px: 2,
                        py: 0.5,
                        borderColor: 'rgba(255, 255, 255, 0.8)',
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        fontSize: '0.8rem',
                        minWidth: 'auto',
                        '&:hover': {
                            borderColor: 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                        <Box sx={{fontSize: '0.9rem'}}>✕</Box>
                        Đóng
                    </Box>
                </Button>
            </DialogTitle>
            <DialogContent sx={{
                p: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                minHeight: '400px'
            }}>
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
                                            alt={succulent.speciesName || succulent.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </Box>
                                    <Typography variant="h6" sx={{
                                        color: 'success.dark',
                                        fontWeight: 700,
                                        textAlign: 'center',
                                        mt: 1.5,
                                        px: 1
                                    }}>
                                        {succulent.speciesName || succulent.speciesName}
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
                                    <LocalFloristIcon sx={{fontSize: '4rem', color: 'success.main', opacity: 0.7, mb: 1}}/>
                                    <Typography variant="h6" sx={{color: 'success.dark', fontWeight: 600, opacity: 0.8}}>
                                        {succulent.speciesName || succulent.name}
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
                                            color: 'success.dark',
                                            mb: 1.5,
                                            pb: 0.5,
                                            borderBottom: '2px solid rgba(76, 175, 80, 0.2)'
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

                                    <Box>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: 'success.dark',
                                            mb: 1.5,
                                            pb: 0.5,
                                            borderBottom: '2px solid rgba(76, 175, 80, 0.2)'
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
                                                    <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 0.5, color: 'text.secondary', fontSize: '0.8rem'}}>
                                                        Giá bán:
                                                    </Typography>
                                                    <Typography variant="h6" sx={{color: 'success.main', fontWeight: 800, fontSize: '1.1rem', wordBreak: 'break-word'}}>
                                                        {succulent.priceSell?.toLocaleString('vi-VN')} ₫
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
                                                    <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 0.5, color: 'text.secondary', fontSize: '0.8rem'}}>
                                                        Số lượng:
                                                    </Typography>
                                                    <Typography variant="h6" sx={{fontWeight: 800, color: 'purple.main', fontSize: '1.1rem'}}>
                                                        {succulent.quantity}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{
                                                p: 1.5,
                                                background: succulent.quantity > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                                borderRadius: 2,
                                                border: succulent.quantity > 0 ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(244, 67, 54, 0.2)',
                                                textAlign: 'center',
                                                minHeight: '50px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center'
                                            }}>
                                                <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 0.5, color: 'text.secondary', fontSize: '0.8rem'}}>
                                                    Trạng thái:
                                                </Typography>
                                                <Chip
                                                    label={succulent.status}
                                                    color={succulent.quantity > 0 ? 'success' : 'error'}
                                                    variant="filled"
                                                    size="small"
                                                    sx={{fontWeight: 700, fontSize: '0.8rem', px: 1.5, py: 0.25, maxWidth: 'fit-content', mx: 'auto'}}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{flex: 1}}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: 'success.dark',
                                            mb: 1.5,
                                            pb: 0.5,
                                            borderBottom: '2px solid rgba(76, 175, 80, 0.2)'
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
                                                <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1, color: 'text.secondary', fontSize: '0.8rem'}}>
                                                    Phong thủy:
                                                </Typography>
                                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-start'}}>
                                                    {succulent.fengShuiElements?.map((element, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={FENG_SHUI_OPTIONS.find(opt => opt.value === element)?.label || element}
                                                            color="success"
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{fontWeight: 600, fontSize: '0.7rem', px: 1, py: 0.25}}
                                                        />
                                                    ))}
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
                                                <Typography variant="subtitle2" sx={{fontWeight: 600, mb: 1, color: 'text.secondary', fontSize: '0.8rem'}}>
                                                    Cung hoàng đạo:
                                                </Typography>
                                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-start'}}>
                                                    {succulent.zodiacs?.map((zodiac, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={ZODIAC_OPTIONS.find(opt => opt.value === zodiac)?.label || zodiac}
                                                            color="info"
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{fontWeight: 600, fontSize: '0.7rem', px: 1, py: 0.25}}
                                                        />
                                                    ))}
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


