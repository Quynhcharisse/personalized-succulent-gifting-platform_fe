import React from 'react';
import {Avatar, Box, Card, CardContent, Chip, Dialog, DialogContent, DialogTitle, Typography} from '@mui/material';
import {
    AutoAwesome as DecorationIcon,
    Image as ImageIcon,
    Inventory as InventoryIcon,
    LocalFlorist as PotIcon,
    Park as SoilIcon,
    Spa as SucculentIcon
} from '@mui/icons-material';
import ActionButton from "../../buttonCustom/ActionButton.jsx";
import {DASHBOARD_STYLES} from '../../constants.js';

const ProductViewDialog = ({
                               open, onClose,
                               selectedProduct,
                               getStatusLabel,
                               getStatusColor,
                               calculateSizePrice,
                               handleEditProduct
                           }) => {
    if (!selectedProduct) return null;

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
                            Chi Tiết Sản Phẩm
                        </Typography>
                        <Typography variant="h6" sx={{fontWeight: 500, opacity: 0.9}}>
                            {typeof selectedProduct.name === 'object' ? JSON.stringify(selectedProduct.name) : selectedProduct.name}
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
                    {/* Basic Info Section */}
                    <Card sx={{
                        mb: 4,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0fff6 100%)',
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
                                    Thông tin cơ bản
                                </Typography>
                            </Box>

                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                {/* Product Images */}
                                {selectedProduct.images && selectedProduct.images.length > 0 && (
                                    <Box sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(255,255,255,0.7)',
                                        border: '1px solid rgba(11, 63, 49, 0.1)'
                                    }}>
                                        <Typography variant="subtitle2" sx={{
                                            fontWeight: 600,
                                            color: '#0b3f31',
                                            mb: 2,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <ImageIcon sx={{fontSize: '1rem'}}/>
                                            Hình ảnh sản phẩm ({selectedProduct.images.length})
                                        </Typography>
                                        <Box sx={{
                                            display: 'flex',
                                            gap: 2,
                                            flexWrap: 'wrap'
                                        }}>
                                            {selectedProduct.images.map((image, index) => (
                                                <Avatar
                                                    key={index}
                                                    src={image.url}
                                                    alt={`Product image ${index + 1}`}
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        borderRadius: 2,
                                                        border: '2px solid rgba(11, 63, 49, 0.2)',
                                                        boxShadow: '0 2px 8px rgba(11, 63, 49, 0.1)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            boxShadow: '0 4px 16px rgba(11, 63, 49, 0.2)'
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: {xs: 'column', md: 'row'},
                                    gap: 3
                                }}>
                                    <Box sx={{
                                        flex: 1,
                                        p: 3,
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(255,255,255,0.7)',
                                        border: '1px solid rgba(11, 63, 49, 0.1)'
                                    }}>
                                        <Typography variant="subtitle2" sx={{
                                            fontWeight: 600,
                                            color: '#0b3f31',
                                            mb: 1,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5
                                        }}>
                                            Tên sản phẩm
                                        </Typography>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#0b3f31',
                                            fontSize: '1.1rem'
                                        }}>
                                            {typeof selectedProduct.name === 'object' ? JSON.stringify(selectedProduct.name) : selectedProduct.name}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        flex: 1,
                                        p: 3,
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(255,255,255,0.7)',
                                        border: '1px solid rgba(11, 63, 49, 0.1)'
                                    }}>
                                        <Typography variant="subtitle2" sx={{
                                            fontWeight: 600,
                                            color: '#0b3f31',
                                            mb: 1,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5
                                        }}>
                                            Trạng thái
                                        </Typography>
                                        <Chip
                                            label={getStatusLabel(selectedProduct.status)}
                                            sx={{
                                                fontWeight: 700,
                                                backgroundColor: '#22c55e',
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
                                    </Box>
                                </Box>
                                <Box sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(255,255,255,0.7)',
                                    border: '1px solid rgba(11, 63, 49, 0.1)'
                                }}>
                                    <Typography variant="subtitle2" sx={{
                                        fontWeight: 600,
                                        color: '#0b3f31',
                                        mb: 1,
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5
                                    }}>
                                        Mô tả sản phẩm
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        fontWeight: 500,
                                        color: '#0b3f31',
                                        lineHeight: 1.6
                                    }}>
                                        {typeof selectedProduct.description === 'object' ? JSON.stringify(selectedProduct.description) : selectedProduct.description}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Sizes Section */}
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
                                mb: 4,
                                pb: 2,
                                borderBottom: '2px solid rgba(11, 63, 49, 0.1)'
                            }}>
                                <Box sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #0b3f31 0%, #1e5a4a 100%)',
                                    color: 'white'
                                }}>
                                    <SucculentIcon sx={{fontSize: '1.5rem'}}/>
                                </Box>
                                <Typography variant="h5" sx={{fontWeight: 800, color: '#0b3f31'}}>
                                    Cấu hình kích thước ({selectedProduct.sizes?.length || 0})
                                </Typography>
                            </Box>

                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
                                {selectedProduct.sizes?.map((size, sizeIndex) => (
                                    <Card key={sizeIndex} sx={{
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
                                        border: '2px solid rgba(11, 63, 49, 0.15)',
                                        boxShadow: '0 6px 20px rgba(11, 63, 49, 0.1)',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 12px 40px rgba(11, 63, 49, 0.15)'
                                        }
                                    }}>
                                        <CardContent sx={{p: 4}}>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mb: 4,
                                                pb: 3,
                                                borderBottom: '2px solid rgba(11, 63, 49, 0.1)'
                                            }}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Box sx={{
                                                        p: 1,
                                                        borderRadius: 2,
                                                        backgroundColor: '#0b3f31',
                                                        color: 'white'
                                                    }}>
                                                        <SucculentIcon sx={{fontSize: '1.2rem'}}/>
                                                    </Box>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 800,
                                                        color: '#0b3f31',
                                                        fontSize: '1.2rem'
                                                    }}>
                                                        Kích
                                                        thước: {typeof size.name === 'object' ? JSON.stringify(size.name) : size.name}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2
                                                }}>
                                                    {/* Price Highlight */}
                                                    <Box sx={{
                                                        p: 2,
                                                        backgroundColor: 'rgba(11, 63, 49, 0.1)',
                                                        borderRadius: 2,
                                                        border: '2px solid rgba(11, 63, 49, 0.2)',
                                                        textAlign: 'center'
                                                    }}>
                                                        <Typography variant="caption" sx={{
                                                            fontWeight: 600,
                                                            color: '#0b3f31',
                                                            opacity: 0.8,
                                                            display: 'block',
                                                            mb: 0.5
                                                        }}>
                                                            Giá bán:
                                                        </Typography>
                                                        <Typography variant="h6" sx={{
                                                            fontWeight: 800,
                                                            color: '#0b3f31',
                                                            fontSize: '1.1rem'
                                                        }}>
                                                            {new Intl.NumberFormat('vi-VN').format(calculateSizePrice(size))}₫
                                                        </Typography>
                                                    </Box>

                                                    {/* Components Count */}
                                                    <Box sx={{
                                                        p: 1.5,
                                                        backgroundColor: 'rgba(11, 63, 49, 0.05)',
                                                        borderRadius: 2,
                                                        border: '1px solid rgba(11, 63, 49, 0.1)',
                                                        textAlign: 'center'
                                                    }}>
                                                        <Typography variant="caption" sx={{
                                                            fontWeight: 600,
                                                            color: '#0b3f31',
                                                            opacity: 0.8,
                                                            display: 'block',
                                                            mb: 0.5
                                                        }}>
                                                            Thành phần:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            fontWeight: 700,
                                                            color: '#0b3f31'
                                                        }}>
                                                            {(size.succulents?.length || 0) + (size.pot ? 1 : 0) + (size.soil ? 1 : 0) + (size.decorations?.length || 0)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                                {/* Succulents */}
                                                {size.succulents && size.succulents.length > 0 && (
                                                    <Card sx={{
                                                        borderRadius: 3,
                                                        background: 'linear-gradient(135deg, #f0fff6 0%, #ffffff 100%)',
                                                        border: '2px solid rgba(34, 197, 94, 0.2)',
                                                        boxShadow: '0 4px 16px rgba(34, 197, 94, 0.1)'
                                                    }}>
                                                        <CardContent sx={{p: 3}}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 2,
                                                                mb: 3
                                                            }}>
                                                                <Box sx={{
                                                                    p: 1,
                                                                    borderRadius: 2,
                                                                    backgroundColor: '#22c55e',
                                                                    color: 'white'
                                                                }}>
                                                                    <SucculentIcon sx={{fontSize: '1.2rem'}}/>
                                                                </Box>
                                                                <Typography variant="h6" sx={{
                                                                    fontWeight: 700,
                                                                    color: '#0b3f31'
                                                                }}>
                                                                    Sen đá ({size.succulents.length})
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: {xs: 'column', sm: 'row'},
                                                                flexWrap: 'wrap',
                                                                gap: 2
                                                            }}>
                                                                {size.succulents.map((succulent, index) => (
                                                                    <Box key={index} sx={{
                                                                        flex: {
                                                                            xs: '1 1 100%',
                                                                            sm: '1 1 calc(50% - 8px)'
                                                                        },
                                                                        p: 2.5,
                                                                        borderRadius: 2,
                                                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                                                        border: '1px solid rgba(34, 197, 94, 0.15)',
                                                                        transition: 'all 0.2s ease',
                                                                        '&:hover': {
                                                                            backgroundColor: 'rgba(255,255,255,1)',
                                                                            transform: 'translateY(-1px)'
                                                                        }
                                                                    }}>
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 2,
                                                                            mb: 2
                                                                        }}>
                                                                            {/* Succulent Image */}
                                                                            {succulent.image ? (
                                                                                <Avatar
                                                                                    src={succulent.image}
                                                                                    alt={succulent.name}
                                                                                    sx={{
                                                                                        width: 60,
                                                                                        height: 60,
                                                                                        borderRadius: 2,
                                                                                        border: '2px solid rgba(34, 197, 94, 0.2)',
                                                                                        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)'
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    width: 60,
                                                                                    height: 60,
                                                                                    borderRadius: 2,
                                                                                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    border: '2px solid rgba(34, 197, 94, 0.2)'
                                                                                }}>
                                                                                    <SucculentIcon sx={{
                                                                                        fontSize: '1.5rem',
                                                                                        color: '#22c55e'
                                                                                    }}/>
                                                                                </Box>
                                                                            )}

                                                                            <Box sx={{flex: 1}}>
                                                                                <Typography variant="subtitle1" sx={{
                                                                                    fontWeight: 700,
                                                                                    color: '#0b3f31',
                                                                                    fontSize: '1rem',
                                                                                    mb: 0.5
                                                                                }}>
                                                                                    {succulent.name}
                                                                                </Typography>
                                                                                <Typography variant="caption" sx={{
                                                                                    color: '#0b3f31',
                                                                                    opacity: 0.7,
                                                                                    fontSize: '0.75rem'
                                                                                }}>
                                                                                    ID: {succulent.id}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>

                                                                        {/* Succulent Details */}
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            gap: 1
                                                                        }}>
                                                                            {/* Size and Quantity */}
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                justifyContent: 'space-between',
                                                                                alignItems: 'center',
                                                                                p: 1,
                                                                                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                                                                                borderRadius: 1,
                                                                                border: '1px solid rgba(34, 197, 94, 0.1)'
                                                                            }}>
                                                                                <Typography variant="caption" sx={{
                                                                                    fontWeight: 600,
                                                                                    color: '#0b3f31',
                                                                                    opacity: 0.8
                                                                                }}>
                                                                                    Kích thước:
                                                                                </Typography>
                                                                                <Typography variant="body2" sx={{
                                                                                    fontWeight: 700,
                                                                                    color: '#0b3f31'
                                                                                }}>
                                                                                    {Array.isArray(succulent.size) && succulent.size.length > 0 ?
                                                                                        `${succulent.size[0].name} (${succulent.size[0].area?.min}-${succulent.size[0].area?.max}cm²)` :
                                                                                        (succulent.size || 'N/A')}
                                                                                </Typography>
                                                                            </Box>

                                                                            {/* Quantity */}
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                justifyContent: 'space-between',
                                                                                alignItems: 'center',
                                                                                p: 1,
                                                                                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                                                                                borderRadius: 1,
                                                                                border: '1px solid rgba(34, 197, 94, 0.1)'
                                                                            }}>
                                                                                <Typography variant="caption" sx={{
                                                                                    fontWeight: 600,
                                                                                    color: '#0b3f31',
                                                                                    opacity: 0.8
                                                                                }}>
                                                                                    Số lượng:
                                                                                </Typography>
                                                                                <Typography variant="body2" sx={{
                                                                                    fontWeight: 700,
                                                                                    color: '#0b3f31'
                                                                                }}>
                                                                                    {Array.isArray(succulent.size) && succulent.size.length > 0 ?
                                                                                        succulent.size[0].quantity :
                                                                                        (succulent.quantity || 1)}
                                                                                </Typography>
                                                                            </Box>

                                                                            {/* Price */}
                                                                            {Array.isArray(succulent.size) && succulent.size.length > 0 && (
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    justifyContent: 'space-between',
                                                                                    alignItems: 'center',
                                                                                    p: 1,
                                                                                    backgroundColor: 'rgba(34, 197, 94, 0.05)',
                                                                                    borderRadius: 1,
                                                                                    border: '1px solid rgba(34, 197, 94, 0.1)'
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
                                                                                        {new Intl.NumberFormat('vi-VN').format(succulent.size[0].price)}₫
                                                                                    </Typography>
                                                                                </Box>
                                                                            )}

                                                                            {/* Description */}
                                                                            <Box sx={{
                                                                                p: 1,
                                                                                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                                                                                borderRadius: 1,
                                                                                border: '1px solid rgba(34, 197, 94, 0.1)'
                                                                            }}>
                                                                                <Typography variant="caption" sx={{
                                                                                    fontWeight: 600,
                                                                                    color: '#0b3f31',
                                                                                    opacity: 0.8,
                                                                                    display: 'block',
                                                                                    mb: 0.5
                                                                                }}>
                                                                                    Mô tả:
                                                                                </Typography>
                                                                                <Typography variant="body2" sx={{
                                                                                    fontWeight: 500,
                                                                                    color: '#0b3f31',
                                                                                    lineHeight: 1.4,
                                                                                    fontSize: '0.85rem'
                                                                                }}>
                                                                                    {typeof succulent.description === 'object' ? JSON.stringify(succulent.description) : (succulent.description || 'Không có mô tả')}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {/* Pot and Soil Row */}
                                                {(size.pot || size.soil) && (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: {xs: 'column', sm: 'row'},
                                                        gap: 3
                                                    }}>
                                                        {/* Pot */}
                                                        {size.pot && (
                                                            <Card sx={{
                                                                borderRadius: 3,
                                                                background: 'linear-gradient(135deg, #fef7f0 0%, #ffffff 100%)',
                                                                border: '2px solid rgba(245, 158, 11, 0.2)',
                                                                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.1)',
                                                                flex: 1
                                                            }}>
                                                                <CardContent sx={{p: 3}}>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 2,
                                                                        mb: 3
                                                                    }}>
                                                                        {/* Pot Image */}
                                                                        {size.pot.image && size.pot.image.length > 0 ? (
                                                                            <Avatar
                                                                                src={size.pot.image[0]}
                                                                                alt={size.pot.name}
                                                                                sx={{
                                                                                    width: 50,
                                                                                    height: 50,
                                                                                    borderRadius: 2,
                                                                                    border: '2px solid rgba(245, 158, 11, 0.2)',
                                                                                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)'
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <Box sx={{
                                                                                p: 1,
                                                                                borderRadius: 2,
                                                                                backgroundColor: '#f59e0b',
                                                                                color: 'white'
                                                                            }}>
                                                                                <PotIcon sx={{fontSize: '1.2rem'}}/>
                                                                            </Box>
                                                                        )}
                                                                        <Typography variant="h6" sx={{
                                                                            fontWeight: 700,
                                                                            color: '#0b3f31'
                                                                        }}>
                                                                            Chậu
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{
                                                                        p: 2.5,
                                                                        borderRadius: 2,
                                                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                                                        border: '1px solid rgba(245, 158, 11, 0.15)'
                                                                    }}>
                                                                        <Typography variant="subtitle1" sx={{
                                                                            fontWeight: 700,
                                                                            color: '#0b3f31',
                                                                            mb: 2,
                                                                            fontSize: '1rem'
                                                                        }}>
                                                                            {size.pot.name}
                                                                        </Typography>

                                                                        {/* Pot Details Grid */}
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            gap: 1.5
                                                                        }}>
                                                                            {/* Pot Size Details */}
                                                                            {Array.isArray(size.pot.size) && size.pot.size.length > 0 ? (
                                                                                <>
                                                                                    <Box sx={{
                                                                                        display: 'flex',
                                                                                        justifyContent: 'space-between',
                                                                                        alignItems: 'center',
                                                                                        p: 1.5,
                                                                                        backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                                                                        borderRadius: 1,
                                                                                        border: '1px solid rgba(245, 158, 11, 0.1)'
                                                                                    }}>
                                                                                        <Typography variant="caption"
                                                                                                    sx={{
                                                                                                        fontWeight: 600,
                                                                                                        color: '#0b3f31',
                                                                                                        opacity: 0.8
                                                                                                    }}>
                                                                                            Kích thước:
                                                                                        </Typography>
                                                                                        <Typography variant="body2"
                                                                                                    sx={{
                                                                                                        fontWeight: 700,
                                                                                                        color: '#0b3f31'
                                                                                                    }}>
                                                                                            {size.pot.size[0].name}
                                                                                        </Typography>
                                                                                    </Box>

                                                                                    <Box sx={{
                                                                                        display: 'flex',
                                                                                        justifyContent: 'space-between',
                                                                                        alignItems: 'center',
                                                                                        p: 1.5,
                                                                                        backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                                                                        borderRadius: 1,
                                                                                        border: '1px solid rgba(245, 158, 11, 0.1)'
                                                                                    }}>
                                                                                        <Typography variant="caption"
                                                                                                    sx={{
                                                                                                        fontWeight: 600,
                                                                                                        color: '#0b3f31',
                                                                                                        opacity: 0.8
                                                                                                    }}>
                                                                                            Chiều cao:
                                                                                        </Typography>
                                                                                        <Typography variant="body2"
                                                                                                    sx={{
                                                                                                        fontWeight: 700,
                                                                                                        color: '#0b3f31'
                                                                                                    }}>
                                                                                            {size.pot.size[0].height}cm
                                                                                        </Typography>
                                                                                    </Box>

                                                                                    <Box sx={{
                                                                                        display: 'flex',
                                                                                        justifyContent: 'space-between',
                                                                                        alignItems: 'center',
                                                                                        p: 1.5,
                                                                                        backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                                                                        borderRadius: 1,
                                                                                        border: '1px solid rgba(245, 158, 11, 0.1)'
                                                                                    }}>
                                                                                        <Typography variant="caption"
                                                                                                    sx={{
                                                                                                        fontWeight: 600,
                                                                                                        color: '#0b3f31',
                                                                                                        opacity: 0.8
                                                                                                    }}>
                                                                                            Diện tích mặt cắt:
                                                                                        </Typography>
                                                                                        <Typography variant="body2"
                                                                                                    sx={{
                                                                                                        fontWeight: 700,
                                                                                                        color: '#0b3f31'
                                                                                                    }}>
                                                                                            {size.pot.size[0].upperCrossSectionArea}cm²
                                                                                        </Typography>
                                                                                    </Box>

                                                                                    <Box sx={{
                                                                                        display: 'flex',
                                                                                        justifyContent: 'space-between',
                                                                                        alignItems: 'center',
                                                                                        p: 1.5,
                                                                                        backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                                                                        borderRadius: 1,
                                                                                        border: '1px solid rgba(245, 158, 11, 0.1)'
                                                                                    }}>
                                                                                        <Typography variant="caption"
                                                                                                    sx={{
                                                                                                        fontWeight: 600,
                                                                                                        color: '#0b3f31',
                                                                                                        opacity: 0.8
                                                                                                    }}>
                                                                                            Giá chậu:
                                                                                        </Typography>
                                                                                        <Typography variant="body2"
                                                                                                    sx={{
                                                                                                        fontWeight: 700,
                                                                                                        color: '#0b3f31'
                                                                                                    }}>
                                                                                            {new Intl.NumberFormat('vi-VN').format(size.pot.size[0].price)}₫
                                                                                        </Typography>
                                                                                    </Box>
                                                                                </>
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    justifyContent: 'space-between',
                                                                                    alignItems: 'center',
                                                                                    p: 1.5,
                                                                                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                                                                    borderRadius: 1,
                                                                                    border: '1px solid rgba(245, 158, 11, 0.1)'
                                                                                }}>
                                                                                    <Typography variant="caption" sx={{
                                                                                        fontWeight: 600,
                                                                                        color: '#0b3f31',
                                                                                        opacity: 0.8
                                                                                    }}>
                                                                                        Kích thước:
                                                                                    </Typography>
                                                                                    <Typography variant="body2" sx={{
                                                                                        fontWeight: 700,
                                                                                        color: '#0b3f31'
                                                                                    }}>
                                                                                        {size.pot.size || 'N/A'}
                                                                                    </Typography>
                                                                                </Box>
                                                                            )}

                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                justifyContent: 'space-between',
                                                                                alignItems: 'center',
                                                                                p: 1.5,
                                                                                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                                                                borderRadius: 1,
                                                                                border: '1px solid rgba(245, 158, 11, 0.1)'
                                                                            }}>
                                                                                <Typography variant="caption" sx={{
                                                                                    fontWeight: 600,
                                                                                    color: '#0b3f31',
                                                                                    opacity: 0.8
                                                                                }}>
                                                                                    Chất liệu:
                                                                                </Typography>
                                                                                <Typography variant="body2" sx={{
                                                                                    fontWeight: 700,
                                                                                    color: '#0b3f31'
                                                                                }}>
                                                                                    {typeof size.pot.material === 'object' ? JSON.stringify(size.pot.material) : (size.pot.material || 'N/A')}
                                                                                </Typography>
                                                                            </Box>

                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                justifyContent: 'space-between',
                                                                                alignItems: 'center',
                                                                                p: 1.5,
                                                                                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                                                                borderRadius: 1,
                                                                                border: '1px solid rgba(245, 158, 11, 0.1)'
                                                                            }}>
                                                                                <Typography variant="caption" sx={{
                                                                                    fontWeight: 600,
                                                                                    color: '#0b3f31',
                                                                                    opacity: 0.8
                                                                                }}>
                                                                                    Màu sắc:
                                                                                </Typography>
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 1
                                                                                }}>
                                                                                    {size.pot.color && typeof size.pot.color === 'string' && (
                                                                                        <Box sx={{
                                                                                            width: 16,
                                                                                            height: 16,
                                                                                            borderRadius: '50%',
                                                                                            backgroundColor: size.pot.color,
                                                                                            border: '1px solid rgba(0,0,0,0.2)'
                                                                                        }}/>
                                                                                    )}
                                                                                    <Typography variant="body2" sx={{
                                                                                        fontWeight: 700,
                                                                                        color: '#0b3f31'
                                                                                    }}>
                                                                                        {typeof size.pot.color === 'object' ? JSON.stringify(size.pot.color) : (size.pot.color || 'N/A')}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>

                                                                            <Box sx={{
                                                                                p: 1.5,
                                                                                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                                                                borderRadius: 1,
                                                                                border: '1px solid rgba(245, 158, 11, 0.1)'
                                                                            }}>
                                                                                <Typography variant="caption" sx={{
                                                                                    fontWeight: 600,
                                                                                    color: '#0b3f31',
                                                                                    opacity: 0.8,
                                                                                    display: 'block',
                                                                                    mb: 0.5
                                                                                }}>
                                                                                    Mô tả:
                                                                                </Typography>
                                                                                <Typography variant="body2" sx={{
                                                                                    fontWeight: 500,
                                                                                    color: '#0b3f31',
                                                                                    lineHeight: 1.4
                                                                                }}>
                                                                                    {typeof size.pot.description === 'object' ? JSON.stringify(size.pot.description) : (size.pot.description || 'Không có mô tả')}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>
                                                                </CardContent>
                                                            </Card>
                                                        )}

                                                        {/* Soil */}
                                                        {size.soil && (
                                                            <Card sx={{
                                                                borderRadius: 3,
                                                                background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                                                                border: '2px solid rgba(34, 197, 94, 0.2)',
                                                                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.1)',
                                                                flex: 1
                                                            }}>
                                                                <CardContent sx={{p: 3}}>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 2,
                                                                        mb: 3
                                                                    }}>
                                                                        {/* Soil Image */}
                                                                        {size.soil.image && size.soil.image.length > 0 ? (
                                                                            <Avatar
                                                                                src={size.soil.image[0].url}
                                                                                alt={size.soil.name}
                                                                                sx={{
                                                                                    width: 50,
                                                                                    height: 50,
                                                                                    borderRadius: 2,
                                                                                    border: '2px solid rgba(34, 197, 94, 0.2)',
                                                                                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)'
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <Box sx={{
                                                                                p: 1,
                                                                                borderRadius: 2,
                                                                                backgroundColor: '#22c55e',
                                                                                color: 'white'
                                                                            }}>
                                                                                <SoilIcon sx={{fontSize: '1.2rem'}}/>
                                                                            </Box>
                                                                        )}
                                                                        <Typography variant="h6" sx={{
                                                                            fontWeight: 700,
                                                                            color: '#0b3f31'
                                                                        }}>
                                                                            Đất trồng
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{
                                                                        p: 2.5,
                                                                        borderRadius: 2,
                                                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                                                        border: '1px solid rgba(34, 197, 94, 0.15)'
                                                                    }}>
                                                                        <Typography variant="subtitle1" sx={{
                                                                            fontWeight: 700,
                                                                            color: '#0b3f31',
                                                                            mb: 2,
                                                                            fontSize: '1rem'
                                                                        }}>
                                                                            {typeof size.soil.name === 'object' ? JSON.stringify(size.soil.name) : size.soil.name}
                                                                        </Typography>

                                                                        {/* Soil Details Grid */}
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            gap: 1.5
                                                                        }}>
                                                                            {/* Highlighted Mass Amount */}
                                                                            <Box sx={{
                                                                                p: 2,
                                                                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                                                borderRadius: 2,
                                                                                border: '2px solid rgba(34, 197, 94, 0.2)',
                                                                                textAlign: 'center'
                                                                            }}>
                                                                                <Typography variant="caption" sx={{
                                                                                    fontWeight: 600,
                                                                                    color: '#0b3f31',
                                                                                    opacity: 0.8,
                                                                                    display: 'block',
                                                                                    mb: 0.5
                                                                                }}>
                                                                                    Khối lượng đất trồng:
                                                                                </Typography>
                                                                                <Typography variant="h6" sx={{
                                                                                    fontWeight: 800,
                                                                                    color: '#0b3f31',
                                                                                    fontSize: '1.2rem'
                                                                                }}>
                                                                                    {size.soil.massAmount}g
                                                                                </Typography>
                                                                            </Box>

                                                                            <Box sx={{
                                                                                p: 1.5,
                                                                                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                                                                                borderRadius: 1,
                                                                                border: '1px solid rgba(34, 197, 94, 0.1)'
                                                                            }}>
                                                                                <Typography variant="caption" sx={{
                                                                                    fontWeight: 600,
                                                                                    color: '#0b3f31',
                                                                                    opacity: 0.8,
                                                                                    display: 'block',
                                                                                    mb: 0.5
                                                                                }}>
                                                                                    Mô tả:
                                                                                </Typography>
                                                                                <Typography variant="body2" sx={{
                                                                                    fontWeight: 500,
                                                                                    color: '#0b3f31',
                                                                                    lineHeight: 1.4
                                                                                }}>
                                                                                    {typeof size.soil.description === 'object' ? JSON.stringify(size.soil.description) : (size.soil.description || 'Không có mô tả')}
                                                                                </Typography>
                                                                            </Box>

                                                                            {/* Additional Soil Properties */}
                                                                            {size.soil.type && (
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    justifyContent: 'space-between',
                                                                                    alignItems: 'center',
                                                                                    p: 1.5,
                                                                                    backgroundColor: 'rgba(34, 197, 94, 0.05)',
                                                                                    borderRadius: 1,
                                                                                    border: '1px solid rgba(34, 197, 94, 0.1)'
                                                                                }}>
                                                                                    <Typography variant="caption" sx={{
                                                                                        fontWeight: 600,
                                                                                        color: '#0b3f31',
                                                                                        opacity: 0.8
                                                                                    }}>
                                                                                        Loại đất:
                                                                                    </Typography>
                                                                                    <Typography variant="body2" sx={{
                                                                                        fontWeight: 700,
                                                                                        color: '#0b3f31'
                                                                                    }}>
                                                                                        {typeof size.soil.type === 'object' ? JSON.stringify(size.soil.type) : size.soil.type}
                                                                                    </Typography>
                                                                                </Box>
                                                                            )}

                                                                            {size.soil.pH && (
                                                                                <Box sx={{
                                                                                    display: 'flex',
                                                                                    justifyContent: 'space-between',
                                                                                    alignItems: 'center',
                                                                                    p: 1.5,
                                                                                    backgroundColor: 'rgba(34, 197, 94, 0.05)',
                                                                                    borderRadius: 1,
                                                                                    border: '1px solid rgba(34, 197, 94, 0.1)'
                                                                                }}>
                                                                                    <Typography variant="caption" sx={{
                                                                                        fontWeight: 600,
                                                                                        color: '#0b3f31',
                                                                                        opacity: 0.8
                                                                                    }}>
                                                                                        Độ pH:
                                                                                    </Typography>
                                                                                    <Typography variant="body2" sx={{
                                                                                        fontWeight: 700,
                                                                                        color: '#0b3f31'
                                                                                    }}>
                                                                                        {typeof size.soil.pH === 'object' ? JSON.stringify(size.soil.pH) : size.soil.pH}
                                                                                    </Typography>
                                                                                </Box>
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </Box>
                                                )}

                                                {/* Decorations */}
                                                {size.decorations && size.decorations.length > 0 && (
                                                    <Card sx={{
                                                        borderRadius: 3,
                                                        background: 'linear-gradient(135deg, #fefce8 0%, #ffffff 100%)',
                                                        border: '2px solid rgba(245, 158, 11, 0.2)',
                                                        boxShadow: '0 4px 16px rgba(245, 158, 11, 0.1)'
                                                    }}>
                                                        <CardContent sx={{p: 3}}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 2,
                                                                mb: 3
                                                            }}>
                                                                {/* Decoration Icon */}
                                                                <Box sx={{
                                                                    p: 1,
                                                                    borderRadius: 2,
                                                                    backgroundColor: '#f59e0b',
                                                                    color: 'white'
                                                                }}>
                                                                    <DecorationIcon sx={{fontSize: '1.2rem'}}/>
                                                                </Box>
                                                                <Typography variant="h6" sx={{
                                                                    fontWeight: 700,
                                                                    color: '#0b3f31'
                                                                }}>
                                                                    Trang trí ({size.decorations.length})
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                flexDirection: {xs: 'column', sm: 'row'},
                                                                flexWrap: 'wrap',
                                                                gap: 2
                                                            }}>
                                                                {size.decorations.map((decoration, index) => (
                                                                    <Box key={index} sx={{
                                                                        flex: {
                                                                            xs: '1 1 100%',
                                                                            sm: '1 1 calc(50% - 8px)',
                                                                            md: '1 1 calc(33.333% - 11px)'
                                                                        },
                                                                        p: 2.5,
                                                                        borderRadius: 2,
                                                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                                                        border: '1px solid rgba(245, 158, 11, 0.15)',
                                                                        transition: 'all 0.2s ease',
                                                                        '&:hover': {
                                                                            backgroundColor: 'rgba(255,255,255,1)',
                                                                            transform: 'translateY(-1px)'
                                                                        }
                                                                    }}>
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 2,
                                                                            mb: 2
                                                                        }}>
                                                                            {/* Decoration Image */}
                                                                            {decoration.image && decoration.image.length > 0 ? (
                                                                                <Avatar
                                                                                    src={decoration.image[0]}
                                                                                    alt={decoration.name}
                                                                                    sx={{
                                                                                        width: 50,
                                                                                        height: 50,
                                                                                        borderRadius: 2,
                                                                                        border: '2px solid rgba(245, 158, 11, 0.2)',
                                                                                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)'
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <Box sx={{
                                                                                    width: 50,
                                                                                    height: 50,
                                                                                    borderRadius: 2,
                                                                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    border: '2px solid rgba(245, 158, 11, 0.2)'
                                                                                }}>
                                                                                    <DecorationIcon sx={{
                                                                                        fontSize: '1.2rem',
                                                                                        color: '#f59e0b'
                                                                                    }}/>
                                                                                </Box>
                                                                            )}

                                                                            <Box sx={{flex: 1}}>
                                                                                <Typography variant="subtitle1" sx={{
                                                                                    fontWeight: 700,
                                                                                    color: '#0b3f31',
                                                                                    mb: 0.5,
                                                                                    fontSize: '1rem'
                                                                                }}>
                                                                                    {typeof decoration.name === 'object' ? JSON.stringify(decoration.name) : decoration.name}
                                                                                </Typography>
                                                                                <Typography variant="caption" sx={{
                                                                                    color: '#0b3f31',
                                                                                    opacity: 0.7,
                                                                                    fontSize: '0.75rem'
                                                                                }}>
                                                                                    Đơn
                                                                                    giá: {new Intl.NumberFormat('vi-VN').format(decoration.unitPrice)}₫
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                        <Typography variant="body2" sx={{
                                                                            color: '#0b3f31',
                                                                            opacity: 0.8,
                                                                            lineHeight: 1.5,
                                                                            mb: 1
                                                                        }}>
                                                                            {typeof decoration.description === 'object' ? JSON.stringify(decoration.description) : decoration.description}
                                                                        </Typography>
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center',
                                                                            mt: 1
                                                                        }}>
                                                                            <Typography variant="caption" sx={{
                                                                                fontWeight: 600,
                                                                                color: '#0b3f31',
                                                                                opacity: 0.7
                                                                            }}>
                                                                                SL: {typeof decoration.quantity === 'object' ? JSON.stringify(decoration.quantity) : decoration.quantity}
                                                                            </Typography>
                                                                            <Typography variant="caption" sx={{
                                                                                fontWeight: 700,
                                                                                color: '#0b3f31',
                                                                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                                                px: 1,
                                                                                py: 0.5,
                                                                                borderRadius: 1
                                                                            }}>
                                                                                {new Intl.NumberFormat('vi-VN').format(decoration.totalPrice)}₫
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ProductViewDialog;
