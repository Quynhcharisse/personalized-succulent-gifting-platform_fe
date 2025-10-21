import React, { useState } from 'react';
import {Dialog, DialogTitle, DialogContent, Box, Typography, Chip, Stack, Card, CardContent, Avatar} from '@mui/material';
import {AutoAwesome as DecorationIcon, LocalFlorist as PotIcon, Park as SoilIcon, Image as ImageIcon, Inventory as InventoryIcon} from '@mui/icons-material';
import ActionButton from "../../buttonCustom/ActionButton.jsx";
import { DASHBOARD_STYLES } from '../../constants.js';

export default function AccessoryDetail({ open, onClose, item }) {
    const val = item?.raw || {};
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    
    // Lấy ảnh từ cấu trúc API chuẩn: image[0].url
    const image = Array.isArray(val.image) ? val.image.map(i => i?.url).filter(Boolean) : 
                   (Array.isArray(item?.image) ? item.image : []);
    
    const mainImage = image[selectedImageIndex] || image[0];
    
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        ...DASHBOARD_STYLES.dialog,
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #f8fffe 0%, #ffffff 100%)'
                    }
                }
            }}
        >
            <DialogTitle sx={{
                ...DASHBOARD_STYLES.dialogTitle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #0b3f31 0%, #1e5a4a 100%)',
                color: 'white',
                py: 3,
                px: 4
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <InventoryIcon sx={{fontSize: '2rem', color: 'white'}}/>
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{fontWeight: 700, mb: 0.5}}>
                    Chi tiết phụ kiện
                </Typography>
                        <Typography variant="h6" sx={{fontWeight: 500, opacity: 0.9}}>
                            {item?.name || 'Thông tin sản phẩm'}
                        </Typography>
                    </Box>
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
            <DialogContent sx={{
                ...DASHBOARD_STYLES.dialogContent,
                p: 0,
                backgroundColor: 'transparent'
            }}>
                <Box sx={{
                    p: {xs: 3, sm: 4, md: 5},
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                    minHeight: '70vh'
                }}>
                {!item ? (
                        <Card sx={{
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #ffffff 0%, #f0fff6 100%)',
                            border: '2px solid rgba(11, 63, 49, 0.1)',
                            boxShadow: '0 8px 32px rgba(11, 63, 49, 0.12)'
                        }}>
                            <CardContent sx={{p: 4, textAlign: 'center'}}>
                                <Typography variant="h6" sx={{color: '#0b3f31', fontWeight: 600}}>
                                    Không có dữ liệu
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
                            {/* Main Product Display - Similar to template */}
                            <Card sx={{
                                borderRadius: 4,
                                background: 'linear-gradient(135deg, #ffffff 0%, #f0fff6 100%)',
                                border: '2px solid rgba(11, 63, 49, 0.1)',
                                boxShadow: '0 8px 32px rgba(11, 63, 49, 0.12)',
                                overflow: 'hidden'
                            }}>
                                <CardContent sx={{p: 4}}>
                                    {/* Product Header */}
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        mb: 4,
                                        pb: 3,
                                        borderBottom: '2px solid rgba(11, 63, 49, 0.1)'
                                    }}>
                                        {/* Category Icon */}
                                        {item.category === 'pots' && (
                                            <Box sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                color: 'white'
                                            }}>
                                                <PotIcon sx={{fontSize: '1.5rem'}}/>
                                            </Box>
                                        )}
                                        {item.category === 'decorations' && (
                                            <Box sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                color: 'white'
                                            }}>
                                                <DecorationIcon sx={{fontSize: '1.5rem'}}/>
                                            </Box>
                                        )}
                                        {item.category === 'soils' && (
                        <Box sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                color: 'white'
                                            }}>
                                                <SoilIcon sx={{fontSize: '1.5rem'}}/>
                                            </Box>
                                        )}
                                        
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="h4" sx={{
                                                fontWeight: 800,
                                                color: '#0b3f31',
                                                fontSize: '1.8rem',
                                                mb: 0.5
                                            }}>
                                                {item.name}
                                            </Typography>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 500,
                                                color: '#0b3f31',
                                                opacity: 0.8,
                                                fontSize: '1rem'
                                            }}>
                                                {val.description || 'Mô tả sản phẩm'}
                                            </Typography>
                                        </Box>
                                        
                                        {/* Status Chips */}
                                        <Stack direction="row" spacing={1.5}>
                                <Chip 
                                    label={item.category} 
                                    sx={{ 
                                        fontWeight: 700,
                                                    backgroundColor: '#0b3f31',
                                                    color: 'white',
                                                    fontSize: '0.9rem',
                                                    px: 2,
                                                    py: 1,
                                                    height: 'auto',
                                                    '& .MuiChip-label': {
                                                        px: 1
                                                    }
                                    }}
                                />
                                <Chip 
                                    label={item.status === 'ACTIVE' ? 'Còn hàng' : 'Hết hàng'} 
                                    sx={{ 
                                        fontWeight: 700,
                                        backgroundColor: item.status === 'ACTIVE' ? '#22c55e' : '#ef4444',
                                                    color: 'white',
                                                    fontSize: '0.9rem',
                                                    px: 2,
                                                    py: 1,
                                                    height: 'auto',
                                                    '& .MuiChip-label': {
                                                        px: 1
                                                    }
                                    }}
                                />
                            </Stack>
                        </Box>

                                    {/* Main Content Layout */}
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: {xs: 'column', md: 'row'},
                                        gap: 4,
                                        alignItems: 'flex-start'
                                    }}>
                                        {/* Left Side - Main Image */}
                                        <Box sx={{
                                            flex: {xs: '1 1 100%', md: '1 1 50%'},
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            boxShadow: '0 8px 24px rgba(11, 63, 49, 0.15)',
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            border: '1px solid rgba(11, 63, 49, 0.1)'
                                        }}>
                                            {/* Main Image */}
                                            {mainImage ? (
                                                <Box sx={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    height: 300,
                                                    overflow: 'hidden'
                                                }}>
                                                    <img 
                                                        src={mainImage} 
                                                        alt={item.name}
                                                        style={{ 
                                                            width: '100%', 
                                                            height: '100%', 
                                                            objectFit: 'cover',
                                                            display: 'block'
                                                        }} 
                                                    />
                                                    {/* Overlay with product name */}
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                                        color: 'white',
                                                        p: 2,
                                                        textAlign: 'center'
                                                    }}>
                                                        <Typography variant="h6" sx={{
                                                            fontWeight: 700,
                                                            fontSize: '1.2rem'
                                                        }}>
                                                            {item.name}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Box sx={{
                                                    height: 300,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: 'rgba(11, 63, 49, 0.05)',
                                                    border: '2px dashed rgba(11, 63, 49, 0.2)'
                                                }}>
                                                    <Box sx={{textAlign: 'center'}}>
                                                        <ImageIcon sx={{fontSize: '3rem', color: 'rgba(11, 63, 49, 0.3)', mb: 2}}/>
                                                        <Typography variant="h6" sx={{color: '#0b3f31', fontWeight: 600}}>
                                                            Chưa có hình ảnh
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                            
                                            {/* Thumbnail Images */}
                                            {image.length > 1 && (
                                                <Box sx={{
                                                    p: 2,
                                                    display: 'flex',
                                                    gap: 1,
                                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                                    borderTop: '1px solid rgba(11, 63, 49, 0.1)',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    {image.map((src, idx) => (
                                                        <Box
                                                            key={idx}
                                                            onClick={() => setSelectedImageIndex(idx)}
                                                            sx={{
                                                                width: 60,
                                                                height: 60,
                                                                borderRadius: 2,
                                                                overflow: 'hidden',
                                                                cursor: 'pointer',
                                                                border: selectedImageIndex === idx ? '3px solid #0b3f31' : '2px solid rgba(11, 63, 49, 0.2)',
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                    transform: 'scale(1.05)',
                                                                    borderColor: '#0b3f31'
                                                                }
                                                            }}
                                                        >
                                                            <img 
                                                                src={src} 
                                                                alt={`Thumbnail ${idx + 1}`}
                                                                style={{ 
                                                                    width: '100%', 
                                                                    height: '100%', 
                                                                    objectFit: 'cover'
                                                                }} 
                                                            />
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                        
                                        {/* Right Side - Product Info */}
                                        <Box sx={{
                                            flex: {xs: '1 1 100%', md: '1 1 50%'},
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 3,
                                            minHeight: {xs: 'auto', md: 300}
                                        }}>
                                            {/* Category Title */}
                                            <Typography variant="h5" sx={{
                                                fontWeight: 700,
                                                color: '#0b3f31',
                                                fontSize: '1.3rem',
                                                textTransform: 'capitalize'
                                            }}>
                                                {item.category}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>


                            {/* Detailed Attributes Section */}
                            <Card sx={{
                                borderRadius: 4,
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                                border: '2px solid rgba(11, 63, 49, 0.1)',
                                boxShadow: '0 8px 32px rgba(11, 63, 49, 0.12)',
                                overflow: 'hidden'
                            }}>
                                <CardContent sx={{p: 4}}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        mb: 3,
                                        pb: 2,
                                        borderBottom: '2px solid rgba(11, 63, 49, 0.1)'
                                    }}>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #0b3f31 0%, #1e5a4a 100%)',
                                            color: 'white'
                                        }}>
                                            <InventoryIcon sx={{fontSize: '1.5rem'}}/>
                                        </Box>
                                        <Typography variant="h5" sx={{fontWeight: 800, color: '#0b3f31'}}>
                                            Thuộc tính chi tiết ({item.category})
                                        </Typography>
                        </Box>

                                    {/* Pots Category Details */}
                                    {item.category === 'pots' && (
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: {xs: 'column', md: 'row'},
                                            gap: 3
                                        }}>
                                            <Box sx={{
                                                flex: {xs: '1 1 100%', md: '1 1 50%'},
                                                p: 3,
                                                borderRadius: 3,
                                                backgroundColor: 'rgba(255,255,255,0.8)',
                                                border: '1px solid rgba(245, 158, 11, 0.15)'
                                            }}>
                                                <Typography variant="subtitle2" sx={{
                                                    fontWeight: 600,
                                                    color: '#0b3f31',
                                                    mb: 2,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5
                                                }}>
                                                    Thông tin cơ bản
                                                </Typography>
                                                
                                                <Box sx={{mb: 2}}>
                                                    <Typography variant="body2" sx={{fontWeight: 600, color: '#0b3f31', mb: 1}}>
                                                        Màu sắc:
                                                    </Typography>
                                                    {val.color ? (
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                            <Box sx={{
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: 2,
                                                                border: '2px solid rgba(0,0,0,0.2)',
                                                                backgroundColor: val.color,
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                            }} />
                                                            <Typography sx={{
                                                                fontFamily: 'monospace',
                                                                fontWeight: 700,
                                                                color: '#0b3f31',
                                                                fontSize: '1rem'
                                                            }}>
                                                                {val.color}
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="body2" sx={{color: '#0b3f31', opacity: 0.7}}>-</Typography>
                                                    )}
                                                </Box>
                                                
                                                <Box sx={{mb: 2}}>
                                                    <Typography variant="body2" sx={{fontWeight: 600, color: '#0b3f31', mb: 1}}>
                                                        Chất liệu:
                                                    </Typography>
                                                    <Typography variant="body1" sx={{color: '#0b3f31', fontWeight: 500}}>
                                                        {val.material || '-'}
                                                    </Typography>
                                                </Box>
                                                
                                                <Box>
                                                    <Typography variant="body2" sx={{fontWeight: 600, color: '#0b3f31', mb: 1}}>
                                                        Mô tả:
                                                    </Typography>
                                                    <Typography variant="body1" sx={{color: '#0b3f31', fontWeight: 500, lineHeight: 1.6}}>
                                                        {val.description || '-'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            
                                            <Box sx={{
                                                flex: {xs: '1 1 100%', md: '1 1 50%'},
                                                p: 3,
                                                borderRadius: 3,
                                                backgroundColor: 'rgba(255,255,255,0.8)',
                                                border: '1px solid rgba(245, 158, 11, 0.15)'
                                            }}>
                                                <Typography variant="subtitle2" sx={{
                                                    fontWeight: 600,
                                                    color: '#0b3f31',
                                                    mb: 2,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5
                                                }}>
                                                    Kích thước có sẵn ({(val.size || []).length})
                                                </Typography>
                                                
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 2
                                                }}>
                                                    {(val.size || []).map((s, i) => (
                                                        <Card key={i} sx={{
                                                            borderRadius: 2,
                                                            background: 'linear-gradient(135deg, #ffffff 0%, #fef7f0 100%)',
                                                            border: '1px solid rgba(245, 158, 11, 0.2)',
                                                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.15)'
                                                            }
                                                        }}>
                                                            <CardContent sx={{p: 2.5}}>
                                                                <Typography variant="h6" sx={{
                                                                    fontWeight: 800,
                                                                    color: '#0b3f31',
                                                                    mb: 2,
                                                                    fontSize: '1.1rem'
                                                                }}>
                                                                    {s.name}
                                                                </Typography>
                                                                
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: 1
                                                                }}>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                        <Typography variant="caption" sx={{
                                                                            fontWeight: 600,
                                                                            color: '#0b3f31',
                                                                            opacity: 0.8
                                                                        }}>
                                                                            Giá:
                                                                        </Typography>
                                                                        <Typography variant="body2" sx={{
                                                                            fontWeight: 700,
                                                                            color: '#0b3f31'
                                                                        }}>
                                                                            {s.price?.toLocaleString('vi-VN')} ₫
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                        <Typography variant="caption" sx={{
                                                                            fontWeight: 600,
                                                                            color: '#0b3f31',
                                                                            opacity: 0.8
                                                                        }}>
                                                                            Kho:
                                                                        </Typography>
                                                                        <Typography variant="body2" sx={{
                                                                            fontWeight: 700,
                                                                            color: '#0b3f31'
                                                                        }}>
                                                                            {s.availableQty}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                        <Typography variant="caption" sx={{
                                                                            fontWeight: 600,
                                                                            color: '#0b3f31',
                                                                            opacity: 0.8
                                                                        }}>
                                                                            Khối lượng đất tối đa:
                                                                        </Typography>
                                                                        <Typography variant="body2" sx={{
                                                                            fontWeight: 500,
                                                                            color: '#0b3f31'
                                                                        }}>
                                                                            {s.maxSoilMassValue}g
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                        <Typography variant="caption" sx={{
                                                                            fontWeight: 600,
                                                                            color: '#0b3f31',
                                                                            opacity: 0.8
                                                                        }}>
                                                                            Miệng chậu:
                                                                        </Typography>
                                                                        <Typography variant="body2" sx={{
                                                                            fontWeight: 500,
                                                                            color: '#0b3f31'
                                                                        }}>
                                                                            {s.potUpperCrossSectionArea}cm²
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                        <Typography variant="caption" sx={{
                                                                            fontWeight: 600,
                                                                            color: '#0b3f31',
                                                                            opacity: 0.8
                                                                        }}>
                                                                            Chiều cao:
                                                                        </Typography>
                                                                        <Typography variant="body2" sx={{
                                                                            fontWeight: 500,
                                                                            color: '#0b3f31'
                                                                        }}>
                                                                            {s.potHeight}cm
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Decorations Category Details */}
                                    {item.category === 'decorations' && (
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: {xs: 'column', md: 'row'},
                                            gap: 3
                                        }}>
                                            <Box sx={{
                                                flex: {xs: '1 1 100%', md: '1 1 33.333%'},
                                                p: 3,
                                                borderRadius: 3,
                                                backgroundColor: 'rgba(255,255,255,0.8)',
                                                border: '1px solid rgba(245, 158, 11, 0.15)'
                                            }}>
                                                <Typography variant="subtitle2" sx={{
                                                    fontWeight: 600,
                                                    color: '#0b3f31',
                                                    mb: 1,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5
                                                }}>
                                                    Giá bán
                                                </Typography>
                                                <Typography variant="h4" sx={{
                                                    fontWeight: 800,
                                                    color: '#0b3f31',
                                                    fontSize: '1.5rem'
                                                }}>
                                                    {val.price?.toLocaleString('vi-VN')} ₫
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                flex: {xs: '1 1 100%', md: '1 1 33.333%'},
                                                p: 3,
                                                borderRadius: 3,
                                                backgroundColor: 'rgba(255,255,255,0.8)',
                                                border: '1px solid rgba(245, 158, 11, 0.15)'
                                            }}>
                                                <Typography variant="subtitle2" sx={{
                                                    fontWeight: 600,
                                                    color: '#0b3f31',
                                                    mb: 1,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5
                                                }}>
                                                    Tồn kho
                                                </Typography>
                                                <Typography variant="h4" sx={{
                                                    fontWeight: 800,
                                                    color: '#0b3f31',
                                                    fontSize: '1.5rem'
                                                }}>
                                                    {val.availableQty}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                flex: {xs: '1 1 100%', md: '1 1 33.333%'},
                                                p: 3,
                                                borderRadius: 3,
                                                backgroundColor: 'rgba(255,255,255,0.8)',
                                                border: '1px solid rgba(245, 158, 11, 0.15)'
                                            }}>
                                                <Typography variant="subtitle2" sx={{
                                                    fontWeight: 600,
                                                    color: '#0b3f31',
                                                    mb: 1,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5
                                                }}>
                                                    Mô tả
                                                </Typography>
                                                <Typography variant="body1" sx={{
                                                    color: '#0b3f31',
                                                    fontWeight: 500,
                                                    lineHeight: 1.6
                                                }}>
                                                    {val.description || '-'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Soils Category Details */}
                                    {item.category === 'soils' && (
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: {xs: 'column', md: 'row'},
                                            gap: 3
                                        }}>
                                            <Box sx={{
                                                flex: {xs: '1 1 100%', md: '1 1 50%'},
                                                p: 3,
                                                borderRadius: 3,
                                                backgroundColor: 'rgba(255,255,255,0.8)',
                                                border: '1px solid rgba(34, 197, 94, 0.15)'
                                            }}>
                                                <Typography variant="subtitle2" sx={{
                                                    fontWeight: 600,
                                                    color: '#0b3f31',
                                                    mb: 2,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5
                                                }}>
                                                    Thông tin cơ bản
                                                </Typography>
                                                
                                                <Box sx={{mb: 2}}>
                                                    <Typography variant="body2" sx={{fontWeight: 600, color: '#0b3f31', mb: 1}}>
                                                        Mô tả:
                                                    </Typography>
                                                    <Typography variant="body1" sx={{color: '#0b3f31', fontWeight: 500, lineHeight: 1.6}}>
                                                        {val.description || '-'}
                                                    </Typography>
                                                </Box>
                                                
                                                <Box>
                                                    <Typography variant="body2" sx={{fontWeight: 600, color: '#0b3f31', mb: 1}}>
                                                        Tồn kho khối lượng:
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        color: '#0b3f31',
                                                        fontSize: '1.2rem'
                                                    }}>
                                                        {val.availableMassValue}g
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            
                                            <Box sx={{
                                                flex: {xs: '1 1 100%', md: '1 1 50%'},
                                                p: 3,
                                                borderRadius: 3,
                                                backgroundColor: 'rgba(255,255,255,0.8)',
                                                border: '1px solid rgba(34, 197, 94, 0.15)'
                                            }}>
                                                <Typography variant="subtitle2" sx={{
                                                    fontWeight: 600,
                                                    color: '#0b3f31',
                                                    mb: 2,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5
                                                }}>
                                                    Giá cơ sở
                                                </Typography>
                                                
                                                <Box sx={{
                                                    p: 2.5,
                                                    borderRadius: 2,
                                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                                                    border: '1px solid rgba(34, 197, 94, 0.2)'
                                                }}>
                                                    <Typography variant="h4" sx={{
                                                        fontWeight: 800,
                                                        color: '#0b3f31',
                                                        mb: 1,
                                                        fontSize: '1.5rem'
                                                    }}>
                                                        {val.basePricing?.price?.toLocaleString('vi-VN')} ₫
                                                    </Typography>
                                                    <Typography variant="body2" sx={{
                                                        color: '#0b3f31',
                                                        fontWeight: 600,
                                                        opacity: 0.8
                                                    }}>
                                                        / {val.basePricing?.massValue} {val.basePricing?.massUnit}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                    </Box>
                )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}


