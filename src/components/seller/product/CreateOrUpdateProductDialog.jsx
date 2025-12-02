import React, {useEffect, useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    Inventory as InventoryIcon,
    PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import ActionButton from "../../buttonCustom/ActionButton.jsx";
import {createOrUpdateProduct, getAccessories, getSucculents} from '@/services/ProductService.jsx';
import uploadToCloudinary from '../../cloudinaryUpload.js';
import {DASHBOARD_STYLES} from '../../constants.js';

const toStringSafe = (value) => (value === null || value === undefined ? '' : String(value));

const resolveImageUrl = (image) => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.url ?? image.imageUrl ?? image.image ?? image.src ?? image.path ?? image.fileUrl ?? '';
};

const normalizeEditProductData = (product = {}) => {
    const normalizedSizes = Array.isArray(product.sizes) ? product.sizes.map((size) => {
        const normalizedSucculents = Array.isArray(size.succulents) ? size.succulents.map((succulent) => {
            const firstSize = Array.isArray(succulent.sizes) ? succulent.sizes[0] : null;
            const rawSizeValue = firstSize?.size ?? succulent.size ?? succulent.sizeCode ?? succulent.sizeName ?? firstSize?.name;
            return {
                id: toStringSafe(succulent.id ?? succulent.succulentId),
                name: succulent.name ?? succulent.speciesName ?? '',
                size: toStringSafe(rawSizeValue),
                quantity: toStringSafe(firstSize?.quantity ?? succulent.quantity ?? 1),
            };
        }) : [];

        const rawPot = size.pot ?? {};
        const potName = toStringSafe(rawPot.name ?? rawPot.potName ?? rawPot.title);
        const potSizeValue = (() => {
            const value = rawPot.size ?? rawPot.sizeName ?? rawPot.sizeCode ?? rawPot.selectedSize;
            if (Array.isArray(value)) {
                const first = value[0];
                if (typeof first === 'string') return first;
                return first?.name ?? first?.label ?? first?.value ?? '';
            }
            if (value && typeof value === 'object') {
                return value.name ?? value.label ?? value.value ?? '';
            }
            return value;
        })();

        const rawDecorationDetails = (() => {
            if (Array.isArray(size.decoration?.details)) {
                return size.decoration.details;
            }
            if (Array.isArray(size.decorations)) {
                return size.decorations;
            }
            return [];
        })();

        const decorationDetails = rawDecorationDetails.map((detail) => ({
            name: toStringSafe(detail?.name ?? detail?.title ?? detail?.id),
            quantity: toStringSafe(detail?.quantity ?? detail?.qty ?? detail?.count ?? 1),
        }));

        const decorationIncluded = (() => {
            if (typeof size.decoration?.included === 'boolean') {
                return size.decoration.included;
            }
            return decorationDetails.length > 0;
        })();

        return {
            name: toStringSafe(size.name),
            succulents: normalizedSucculents,
            pot: {
                name: potName,
                size: toStringSafe(potSizeValue),
            },
            soil: {
                name: toStringSafe(size.soil?.name ?? size.soil?.soilName),
                massAmount: toStringSafe(size.soil?.massAmount ?? size.soil?.weight ?? size.soil?.mass ?? size.soil?.amount),
            },
            decoration: {
                included: decorationIncluded,
                details: decorationDetails,
            },
        };
    }) : [];

    const normalizedImages = Array.isArray(product.images) ? product.images.map((image, index) => {
        const url = resolveImageUrl(image);
        return {
            url,
            altText: image?.altText ?? image?.description ?? '',
            primary: Boolean(image?.primary ?? (index === 0)),
            displayOrder: image?.displayOrder ?? index + 1,
        };
    }) : [];

    return {
        productId: product.productId ?? product.id ?? null,
        name: toStringSafe(product.name),
        description: toStringSafe(product.description),
        sizes: normalizedSizes,
        images: normalizedImages,
    };
};

const extractSucculentSizeOptions = (succulentEntity = {}) => {
    if (!succulentEntity) return [];
    const rawSize = succulentEntity.size;

    if (Array.isArray(rawSize)) {
        return rawSize.map((item, index) => {
            const value = toStringSafe(
                item?.name ??
                item?.size ??
                item?.label ??
                (typeof item === 'string' ? item : index)
            );
            const label = value ? value.charAt(0).toUpperCase() + value.slice(1) : `Size ${index + 1}`;
            return { value, label };
        }).filter(option => option.value !== '');
    }

    if (rawSize && typeof rawSize === 'object') {
        return Object.keys(rawSize).map((key) => ({
            value: toStringSafe(key),
            label: key.charAt(0).toUpperCase() + key.slice(1),
        }));
    }

    if (typeof rawSize === 'string') {
        const value = toStringSafe(rawSize);
        return value ? [{ value, label: value.charAt(0).toUpperCase() + value.slice(1) }] : [];
    }

    return [];
};

const extractPotSizeOptions = (potEntity = {}) => {
    if (!potEntity) return [];

    if (Array.isArray(potEntity.availableSizes)) {
        return potEntity.availableSizes.map((sizeName, index) => {
            const value = toStringSafe(sizeName ?? index);
            const label = value ? value.charAt(0).toUpperCase() + value.slice(1) : `Size ${index + 1}`;
            return { value, label };
        }).filter(option => option.value !== '');
    }

    if (Array.isArray(potEntity.size)) {
        return potEntity.size.map((item, index) => {
            const value = toStringSafe(item?.name ?? item?.value ?? item ?? index);
            const label = item?.displayName ?? item?.label ?? (value ? value.charAt(0).toUpperCase() + value.slice(1) : `Size ${index + 1}`);
            return { value, label };
        }).filter(option => option.value !== '');
    }

    const rawSize = potEntity.sizeName ?? potEntity.size ?? potEntity.defaultSize;
    if (rawSize) {
        const value = toStringSafe(rawSize);
        return value ? [{ value, label: value.charAt(0).toUpperCase() + value.slice(1) }] : [];
    }

    return [];
};

const alignSucculentSizesWithOptions = (sizes = [], succulentsList = []) => {
    if (!Array.isArray(sizes) || sizes.length === 0) return sizes;

    let changed = false;
    const alignedSizes = sizes.map((size) => {
        const alignedSucculents = Array.isArray(size.succulents) ? size.succulents.map((succulent) => {
            if (!succulent?.id) return succulent;
            const succulentEntity = succulentsList.find((s) => toStringSafe(s.id) === succulent.id);
            const options = extractSucculentSizeOptions(succulentEntity);
            if (!options.length) return succulent;

            const currentValue = toStringSafe(succulent.size);
            const matched = options.find((opt) =>
                opt.value === currentValue ||
                opt.value.toLowerCase() === currentValue.toLowerCase()
            );

            if (matched) {
                if (matched.value !== currentValue) changed = true;
                return {...succulent, size: matched.value};
            }

            changed = true;
            return {...succulent, size: options[0].value};
        }) : size.succulents;

        if (alignedSucculents !== size.succulents) {
            return {...size, succulents: alignedSucculents};
        }
        return size;
    });

    return changed ? alignedSizes : sizes;
};

const alignPotSizesWithOptions = (sizes = [], potsList = []) => {
    if (!Array.isArray(sizes) || sizes.length === 0) return sizes;

    let changed = false;
    const alignedSizes = sizes.map((size) => {
        if (!size?.pot?.name) return size;

        const potEntity = potsList.find((pot) => toStringSafe(pot.name) === toStringSafe(size.pot.name));
        if (!potEntity) return size;

        const options = extractPotSizeOptions(potEntity);
        if (!options.length) return size;

        const currentValue = toStringSafe(size.pot.size);
        const matched = options.find((opt) =>
            opt.value === currentValue ||
            opt.value.toLowerCase() === currentValue.toLowerCase()
        );

        if (matched) {
            if (matched.value !== currentValue) changed = true;
            return {
                ...size,
                pot: {
                    ...size.pot,
                    size: matched.value,
                },
            };
        }

        changed = true;
        return {
            ...size,
            pot: {
                ...size.pot,
                size: options[0].value,
            },
        };
    });

    return changed ? alignedSizes : sizes;
};
const CreateOrUpdateProductDialog = ({
                                         open,
                                         onClose,
                                         onCreate,
                                         editProduct = null,
                                         isEdit = false,
                                         loading = false
                                     }) => {
    const [formData, setFormData] = useState({
        productId: null,
        name: '',
        description: '',
        sizes: [],
        images: []
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({type: '', text: ''});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Data for dropdowns
    const [succulents, setSucculents] = useState([]);
    const [accessories, setAccessories] = useState([]);

    // Initialize form data
    useEffect(() => {
        if (!open) {
            return;
        }

        if (isEdit) {
            if (loading) return;
            if (!editProduct) return;

            const initialData = normalizeEditProductData(editProduct);
            setFormData(initialData);
        } else {
            const initialData = {
                productId: null,
                name: '',
                description: '',
                sizes: [],
                images: []
            };
            setFormData(initialData);
        }
    }, [isEdit, editProduct, open, loading]);

    // Load dropdown data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [succulentsRes, accessoriesRes] = await Promise.all([
                    getSucculents(),
                    getAccessories('all')
                ]);

                // Handle succulents data
                if (succulentsRes?.data?.data && Array.isArray(succulentsRes.data.data)) {
                    setSucculents(succulentsRes.data.data);
                } else if (succulentsRes?.data && Array.isArray(succulentsRes.data)) {
                    setSucculents(succulentsRes.data);
                } else {
                    console.warn('Succulents data is not an array:', succulentsRes);
                    setSucculents([]);
                }

                // Handle accessories data - transform to expected format
                if (accessoriesRes?.data?.data) {
                    const accessoriesData = accessoriesRes.data.data;
                    const transformedAccessories = [];

                    // Transform pots data
                    if (accessoriesData.pots && Array.isArray(accessoriesData.pots)) {
                        accessoriesData.pots.forEach(pot => {
                            transformedAccessories.push({
                                id: `pot_${pot.name}`,
                                name: pot.name,
                                category: 'PLANT_POT',
                                description: pot.description,
                                material: pot.material,
                                color: pot.color,
                                size: pot.size || [],
                                availableSizes: pot.size ? pot.size.map(s => s.name) : []
                            });
                        });
                    }

                    // Transform soils data
                    if (accessoriesData.soils && Array.isArray(accessoriesData.soils)) {
                        accessoriesData.soils.forEach(soil => {
                            transformedAccessories.push({
                                id: `soil_${soil.name}`,
                                name: soil.name,
                                category: 'SOIL',
                                description: soil.description,
                                basePricing: soil.basePricing,
                                availableMassValue: soil.availableMassValue
                            });
                        });
                    }

                    // Transform decorations data
                    if (accessoriesData.decorations && Array.isArray(accessoriesData.decorations)) {
                        accessoriesData.decorations.forEach(decoration => {
                            transformedAccessories.push({
                                id: `decoration_${decoration.name}`,
                                name: decoration.name,
                                category: 'DECORATION',
                                description: decoration.description,
                                price: decoration.price,
                                availableQty: decoration.availableQty
                            });
                        });
                    }

                    setAccessories(transformedAccessories);
                } else if (accessoriesRes?.data && Array.isArray(accessoriesRes.data)) {
                    setAccessories(accessoriesRes.data);
                } else {
                    console.warn('Accessories data is not in expected format:', accessoriesRes);
                    setAccessories([]);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                setSucculents([]);
                setAccessories([]);
            }
        };

        if (open) {
            loadData();
        }
    }, [open]);

    // Align succulent sizes once dropdown data is available (especially when editing)
    useEffect(() => {
        if (!open || !isEdit || !editProduct || loading || !Array.isArray(succulents) || succulents.length === 0) {
            return;
        }

        setFormData(prev => {
            const alignedSizes = alignSucculentSizesWithOptions(prev.sizes, succulents);
            if (alignedSizes === prev.sizes) return prev;
            return {
                ...prev,
                sizes: alignedSizes,
            };
        });
    }, [open, isEdit, editProduct, succulents, loading]);

    // Align pot sizes once pots data is loaded (edit mode)
    useEffect(() => {
        if (!open || !isEdit || !editProduct || loading || !Array.isArray(accessories) || accessories.length === 0) {
            return;
        }

        const pots = Array.isArray(accessories) ? accessories.filter(acc => acc.category === 'PLANT_POT') : [];
        if (!pots.length) return;

        setFormData(prev => {
            const alignedSizes = alignPotSizesWithOptions(prev.sizes, pots);
            if (alignedSizes === prev.sizes) return prev;
            return {
                ...prev,
                sizes: alignedSizes,
            };
        });
    }, [open, isEdit, editProduct, accessories, loading]);

    const addSize = () => {
        setFormData(prev => ({
            ...prev,
            sizes: [
                ...prev.sizes,
                {
                    name: '',
                    succulents: [],
                    pot: {name: '', size: ''},
                    soil: {name: '', massAmount: ''},
                    decoration: {
                        included: false,
                        details: []
                    }
                }
            ]
        }));
    };

    const removeSize = (index) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.filter((_, i) => i !== index)
        }));
    };

    const updateSize = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === index ? {...size, [field]: value} : size
            )
        }));
    };

    const addSucculentToSize = (sizeIndex) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === sizeIndex
                    ? {
                        ...size,
                        succulents: [
                            ...size.succulents,
                            {id: '', name: '', size: '', quantity: ''}
                        ]
                    }
                    : size
            )
        }));
    };

    const removeSucculentFromSize = (sizeIndex, succulentIndex) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === sizeIndex
                    ? {
                        ...size,
                        succulents: size.succulents.filter((_, j) => j !== succulentIndex)
                    }
                    : size
            )
        }));
    };

    const updateSucculentInSize = (sizeIndex, succulentIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === sizeIndex
                    ? {
                        ...size,
                        succulents: size.succulents.map((succulent, j) =>
                            j === succulentIndex ? {...succulent, [field]: value} : succulent
                        )
                    }
                    : size
            )
        }));
    };

    const addDecorationDetail = (sizeIndex) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === sizeIndex
                    ? {
                        ...size,
                        decoration: {
                            ...(size.decoration || {included: false, details: []}),
                            details: [
                                ...(size.decoration?.details || []),
                                {name: '', quantity: ''}
                            ]
                        }
                    }
                    : size
            )
        }));
    };

    const removeDecorationDetail = (sizeIndex, detailIndex) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === sizeIndex
                    ? {
                        ...size,
                        decoration: {
                            ...(size.decoration || {included: false, details: []}),
                            details: (size.decoration?.details || []).filter((_, j) => j !== detailIndex)
                        }
                    }
                    : size
            )
        }));
    };

    const updateDecorationDetail = (sizeIndex, detailIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((size, i) =>
                i === sizeIndex
                    ? {
                        ...size,
                        decoration: {
                            ...(size.decoration || {included: false, details: []}),
                            details: (size.decoration?.details || []).map((detail, j) =>
                                j === detailIndex ? {...detail, [field]: value} : detail
                            )
                        }
                    }
                    : size
            )
        }));
    };

    const addImage = () => {
        setFormData(prev => ({
            ...prev,
            images: [
                ...prev.images,
                {
                    url: '',
                    altText: '',
                    primary: false,
                    displayOrder: prev.images.length + 1
                }
            ]
        }));
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const updateImage = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map((image, i) =>
                i === index ? {...image, [field]: value} : image
            )
        }));
    };

    const handleFileSelected = async (event, imageIndex) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        setMessage({type: '', text: ''});

        try {
            const imageUrl = await uploadToCloudinary(file, {onProgress: (p) => setUploadProgress(p)});
            updateImage(imageIndex, 'url', imageUrl);
        } catch (error) {
            setMessage({type: 'error', text: 'Tải ảnh thất bại'});
        } finally {
            setIsUploading(false);
            if (event.target) event.target.value = '';
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Basic validation
        if (!formData.name.trim()) newErrors.name = 'Tên sản phẩm là bắt buộc';
        if (!formData.description.trim()) newErrors.description = 'Mô tả là bắt buộc';
        if (!formData.sizes || formData.sizes.length === 0) {
            newErrors.sizes = 'Phải có ít nhất một kích thước';
        }

        // Validate sizes
        formData.sizes.forEach((size, sizeIndex) => {
            if (!size.name.trim()) {
                newErrors[`size_${sizeIndex}_name`] = 'Tên kích thước là bắt buộc';
            }
            if (!size.succulents || size.succulents.length === 0) {
                newErrors[`size_${sizeIndex}_succulents`] = 'Phải có ít nhất một sen đá';
            }
            if (!size.pot.name.trim()) {
                newErrors[`size_${sizeIndex}_pot`] = 'Chậu là bắt buộc';
            }
            if (!size.soil.name.trim()) {
                newErrors[`size_${sizeIndex}_soil`] = 'Đất trồng là bắt buộc';
            }
        });

        // Validate images
        if (!formData.images || formData.images.length === 0) {
            newErrors.images = 'Phải có ít nhất một hình ảnh';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const transformDataForAPI = () => {
        const payload = {
            createAction: !isEdit,
            productId: isEdit ? formData.productId : null,
            name: formData.name.trim(),
            description: formData.description.trim(),
            sizes: formData.sizes.map(size => ({
                name: size.name.trim(),
                pot: {
                    name: size.pot.name.trim(),
                    size: size.pot.size.trim()
                },
                soil: {
                    name: size.soil.name.trim(),
                    massAmount: parseFloat(size.soil.massAmount) || 0
                },
                decoration: {
                    included: size.decoration?.included || false,
                    details: Array.isArray(size.decoration?.details) ? size.decoration.details.map(detail => ({
                        name: detail.name.trim(),
                        quantity: parseInt(detail.quantity) || 0
                    })) : []
                },
                succulents: Array.isArray(size.succulents) ? size.succulents.map(succulent => ({
                    id: parseInt(succulent.id) || 0,
                    name: succulent.name.trim(),
                    sizes: [{
                        size: succulent.size.trim(),
                        quantity: parseInt(succulent.quantity) || 0
                    }]
                })) : []
            })),
            images: Array.isArray(formData.images) ? formData.images.map(image => ({
                url: image.url.trim()
            })) : []
        };
        return payload;
    };

    const handleSubmit = async () => {
        setMessage({type: '', text: ''});

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = transformDataForAPI();
            const response = await createOrUpdateProduct(payload);

            if (response && response.data && response.data.message) {
                setMessage({
                    type: 'success',
                    text: response.data.message
                });

                setTimeout(() => {
                    onClose();
                    onCreate && onCreate();
                }, 1500);
            } else {
                setMessage({
                    type: 'error',
                    text: isEdit ? 'Cập nhật sản phẩm thất bại' : 'Tạo sản phẩm thất bại'
                });
            }
        } catch (error) {
            console.error('Error creating/updating product:', error);
            const errorMessage = error.response?.data?.message ||
                (isEdit ? 'Có lỗi xảy ra khi cập nhật sản phẩm' : 'Có lỗi xảy ra khi tạo sản phẩm');
            setMessage({type: 'error', text: errorMessage});
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get available pots, soils, and decorations from accessories
    const availablePots = Array.isArray(accessories) ? accessories.filter(acc => acc.category === 'PLANT_POT') : [];
    const availableSoils = Array.isArray(accessories) ? accessories.filter(acc => acc.category === 'SOIL') : [];
    const availableDecorations = Array.isArray(accessories) ? accessories.filter(acc => acc.category === 'DECORATION') : [];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
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
                    <InventoryIcon sx={{fontSize: '2rem'}}/>
                    <Box>
                        <Typography variant="h4" sx={{
                            fontWeight: 900,
                            mb: 0.5,
                            fontSize: '1.6rem'
                        }}>
                            {isEdit ? 'Cập Nhật Sản Phẩm' : 'Tạo Sản Phẩm Mới'}
                        </Typography>
                        <Typography variant="body1" sx={{opacity: 0.9, fontWeight: 400, color: "white"}}>
                            {isEdit ? 'Chỉnh sửa thông tin sản phẩm' : 'Thiết lập thông tin sản phẩm hoàn chỉnh'}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={DASHBOARD_STYLES.dialogContent}>
                {loading && isEdit ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320}}>
                        <CircularProgress size={48}/>
                    </Box>
                ) : (
                <>
                {message.text && (
                    <Alert severity={message.type === 'success' ? 'success' : 'error'} variant="filled"
                           sx={{mb: 3, fontWeight: 600, borderRadius: 2}}>
                        {message.text}
                    </Alert>
                )}

                {/* Basic Information */}
                <Box sx={[
                    {display: 'flex', flexDirection: 'column', marginTop: 3},
                    DASHBOARD_STYLES.formSection
                ]}>
                    <Typography sx={DASHBOARD_STYLES.sectionTitle}>
                        Thông tin cơ bản
                    </Typography>
                    <Divider sx={{mb: 2}}/>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        <TextField
                            fullWidth
                            label="Tên sản phẩm"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                            error={!!errors.name}
                            helperText={errors.name}
                            placeholder="Nhập tên sản phẩm"
                            required
                            sx={DASHBOARD_STYLES.formField}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Mô tả sản phẩm"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                            error={!!errors.description}
                            helperText={errors.description}
                            placeholder="Mô tả chi tiết về sản phẩm..."
                            required
                            sx={DASHBOARD_STYLES.formField}
                        />
                    </Box>
                </Box>

                {/* Sizes Configuration */}
                <Box sx={DASHBOARD_STYLES.formSection}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography sx={DASHBOARD_STYLES.sectionTitle}>
                            Cấu hình kích thước
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon/>}
                            onClick={addSize}
                            sx={DASHBOARD_STYLES.primaryButton}
                        >
                            Thêm kích thước
                        </Button>
                    </Box>
                    <Divider sx={{mb: 2}}/>

                    {errors.sizes && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {errors.sizes}
                        </Alert>
                    )}

                    {Array.isArray(formData.sizes) && formData.sizes.map((size, sizeIndex) => (
                        <Box key={sizeIndex} sx={{mb: 2}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
                                <Accordion sx={{flex: 1, borderRadius: 2}}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                        <Typography variant="h6" sx={{fontWeight: 600}}>
                                            Kích thước: {size.name || `Kích thước ${sizeIndex + 1}`}
                                        </Typography>
                                    </AccordionSummary>
                                </Accordion>
                                <IconButton
                                    color="error"
                                    onClick={() => removeSize(sizeIndex)}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(239, 68, 68, 0.2)'
                                        }
                                    }}
                                >
                                    <DeleteIcon/>
                                </IconButton>
                            </Box>
                            <Accordion sx={{borderRadius: 2}}>
                                <AccordionDetails>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 3,
                                        p: 2,
                                        backgroundColor: '#f8fffe',
                                        borderRadius: 2,
                                        border: '1px solid rgba(11, 63, 49, 0.1)'
                                    }}>
                                        {/* Size Name */}
                                        <Card sx={{
                                            p: 2,
                                            backgroundColor: '#ffffff',
                                            borderRadius: 2,
                                            border: '1px solid rgba(11, 63, 49, 0.15)'
                                        }}>
                                            <Typography variant="subtitle1"
                                                        sx={{fontWeight: 600, mb: 2, color: '#0b3f31'}}>
                                                Tên kích thước
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                label="Tên kích thước"
                                                value={size.name}
                                                onChange={(e) => updateSize(sizeIndex, 'name', e.target.value)}
                                                error={!!errors[`size_${sizeIndex}_name`]}
                                                helperText={errors[`size_${sizeIndex}_name`]}
                                                placeholder="medium, large, etc."
                                                sx={DASHBOARD_STYLES.formField}
                                            />
                                        </Card>

                                        {/* Succulents */}
                                        <Card sx={{
                                            p: 3,
                                            backgroundColor: '#ffffff',
                                            borderRadius: 2,
                                            border: '1px solid rgba(11, 63, 49, 0.15)'
                                        }}>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mb: 3
                                            }}>
                                                <Typography variant="subtitle1"
                                                            sx={{fontWeight: 600, color: '#0b3f31'}}>
                                                    🌱 Sen đá
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<AddIcon/>}
                                                    onClick={() => addSucculentToSize(sizeIndex)}
                                                    sx={{
                                                        borderColor: '#0b3f31',
                                                        color: '#0b3f31',
                                                        '&:hover': {
                                                            borderColor: '#0b3f31',
                                                            backgroundColor: 'rgba(11, 63, 49, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    Thêm sen đá
                                                </Button>
                                            </Box>

                                            {errors[`size_${sizeIndex}_succulents`] && (
                                                <Alert severity="error" sx={{mb: 2}}>
                                                    {errors[`size_${sizeIndex}_succulents`]}
                                                </Alert>
                                            )}

                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                {Array.isArray(size.succulents) && size.succulents.map((succulent, succulentIndex) => (
                                                    <Card key={succulentIndex} sx={{
                                                        p: 3,
                                                        backgroundColor: '#f8fffe',
                                                        borderRadius: 2,
                                                        border: '1px solid rgba(34, 197, 94, 0.2)',
                                                        position: 'relative'
                                                    }}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            mb: 3
                                                        }}>
                                                            <Typography variant="subtitle2"
                                                                        sx={{fontWeight: 600, color: '#0b3f31'}}>
                                                                Sen đá #{succulentIndex + 1}
                                                            </Typography>
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={() => removeSucculentFromSize(sizeIndex, succulentIndex)}
                                                                sx={{
                                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(239, 68, 68, 0.2)'
                                                                    }
                                                                }}
                                                            >
                                                                <DeleteIcon/>
                                                            </IconButton>
                                                        </Box>

                                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                            <FormControl fullWidth>
                                                                <InputLabel>Chọn sen đá</InputLabel>
                                                                <Select
                                                                    value={succulent.id}
                                                                    onChange={(e) => {
                                                                        const value = toStringSafe(e.target.value);
                                                                        const selectedSucculent = succulents.find(s => toStringSafe(s.id) === value);
                                                                        updateSucculentInSize(sizeIndex, succulentIndex, 'id', value);
                                                                        updateSucculentInSize(sizeIndex, succulentIndex, 'name', selectedSucculent?.speciesName || '');
                                                                        // Reset size khi chọn succulent mới
                                                                        updateSucculentInSize(sizeIndex, succulentIndex, 'size', '');
                                                                    }}
                                                                    label="Chọn sen đá"
                                                                    sx={DASHBOARD_STYLES.formField}
                                                                        MenuProps={{
                                                                            PaperProps: {
                                                                                sx: {
                                                                                    maxHeight: 360,
                                                                                    '& .MuiList-root': {
                                                                                        maxHeight: 360,
                                                                                        overflowY: 'scroll',
                                                                                        '&::-webkit-scrollbar': {
                                                                                            width: '8px'
                                                                                        },
                                                                                        '&::-webkit-scrollbar-track': {
                                                                                            background: '#f1f1f1',
                                                                                            borderRadius: '10px'
                                                                                        },
                                                                                        '&::-webkit-scrollbar-thumb': {
                                                                                            background: '#888',
                                                                                            borderRadius: '10px',
                                                                                            '&:hover': {
                                                                                                background: '#555'
                                                                                            }
                                                                                        }
                                                                                    },
                                                                                    '& .MuiMenuItem-root': {
                                                                                        minHeight: 52,
                                                                                        py: 1.5
                                                                                    }
                                                                                }
                                                                            }
                                                                        }}
                                                                >
                                                                    {Array.isArray(succulents) && succulents.map((s) => (
                                                                        <MenuItem key={s.id} value={toStringSafe(s.id)}>
                                                                            {s.speciesName}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>

                                                            <Box sx={{display: 'flex', gap: 2}}>
                                                                <FormControl fullWidth>
                                                                    <InputLabel>Kích thước</InputLabel>
                                                                    <Select
                                                                        value={succulent.size}
                                                                        onChange={(e) => updateSucculentInSize(sizeIndex, succulentIndex, 'size', e.target.value)}
                                                                        label="Kích thước"
                                                                        disabled={!succulent.id}
                                                                        sx={DASHBOARD_STYLES.formField}
                                                                        MenuProps={{
                                                                            PaperProps: {
                                                                                sx: {
                                                                                    maxHeight: 360,
                                                                                    '& .MuiList-root': {
                                                                                        maxHeight: 360,
                                                                                        overflowY: 'scroll',
                                                                                        '&::-webkit-scrollbar': {
                                                                                            width: '8px'
                                                                                        },
                                                                                        '&::-webkit-scrollbar-track': {
                                                                                            background: '#f1f1f1',
                                                                                            borderRadius: '10px'
                                                                                        },
                                                                                        '&::-webkit-scrollbar-thumb': {
                                                                                            background: '#888',
                                                                                            borderRadius: '10px',
                                                                                            '&:hover': {
                                                                                                background: '#555'
                                                                                            }
                                                                                        }
                                                                                    },
                                                                                    '& .MuiMenuItem-root': {
                                                                                        minHeight: 52,
                                                                                        py: 1.5
                                                                                    }
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        {(() => {
                                                                            const selectedSucculent = succulents.find(s => toStringSafe(s.id) === succulent.id);
                                                                            const options = extractSucculentSizeOptions(selectedSucculent);
                                                                            if (options.length === 0) {
                                                                                return (
                                                                                    <MenuItem value="" disabled>
                                                                                        Không có dữ liệu kích thước
                                                                                    </MenuItem>
                                                                                );
                                                                            }
                                                                            return options.map((opt) => (
                                                                                <MenuItem key={opt.value} value={opt.value}>
                                                                                    {opt.label}
                                                                                </MenuItem>
                                                                            ));
                                                                        })()}
                                                                    </Select>
                                                                </FormControl>

                                                                <TextField
                                                                    fullWidth
                                                                    label="Số lượng"
                                                                    type="number"
                                                                    value={succulent.quantity}
                                                                    onChange={(e) => updateSucculentInSize(sizeIndex, succulentIndex, 'quantity', e.target.value)}
                                                                    inputProps={{min: 1}}
                                                                    sx={DASHBOARD_STYLES.formField}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </Card>
                                                ))}
                                            </Box>
                                        </Card>

                                        {/* Pot */}
                                        <Card sx={{
                                            p: 3,
                                            backgroundColor: '#ffffff',
                                            borderRadius: 2,
                                            border: '1px solid rgba(11, 63, 49, 0.15)'
                                        }}>
                                            <Typography variant="subtitle1"
                                                        sx={{fontWeight: 600, mb: 3, color: '#0b3f31'}}>
                                                🪴 Chậu
                                            </Typography>
                                            {errors[`size_${sizeIndex}_pot`] && (
                                                <Alert severity="error" sx={{mb: 2}}>
                                                    {errors[`size_${sizeIndex}_pot`]}
                                                </Alert>
                                            )}
                                            <Box sx={{display: 'flex', gap: 2}}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Chọn chậu</InputLabel>
                                                    <Select
                                                        value={size.pot.name}
                                                        onChange={(e) => updateSize(sizeIndex, 'pot', {
                                                            ...size.pot,
                                                            name: e.target.value,
                                                            size: '' // Reset size khi chọn pot mới
                                                        })}
                                                        label="Chọn chậu"
                                                        sx={DASHBOARD_STYLES.formField}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                sx: {
                                                                    maxHeight: 360,
                                                                    '& .MuiList-root': {
                                                                        maxHeight: 360,
                                                                        overflowY: 'scroll',
                                                                        '&::-webkit-scrollbar': {
                                                                            width: '8px'
                                                                        },
                                                                        '&::-webkit-scrollbar-track': {
                                                                            background: '#f1f1f1',
                                                                            borderRadius: '10px'
                                                                        },
                                                                        '&::-webkit-scrollbar-thumb': {
                                                                            background: '#888',
                                                                            borderRadius: '10px',
                                                                            '&:hover': {
                                                                                background: '#555'
                                                                            }
                                                                        }
                                                                    },
                                                                    '& .MuiMenuItem-root': {
                                                                        minHeight: 52,
                                                                        py: 1.5
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {availablePots.map((pot) => (
                                                            <MenuItem key={pot.id} value={pot.name}>
                                                                {pot.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                                <FormControl fullWidth>
                                                    <InputLabel>Kích thước chậu</InputLabel>
                                                    <Select
                                                        value={size.pot.size}
                                                        onChange={(e) => updateSize(sizeIndex, 'pot', {
                                                            ...size.pot,
                                                            size: e.target.value
                                                        })}
                                                        label="Kích thước chậu"
                                                        disabled={!size.pot.name}
                                                        sx={DASHBOARD_STYLES.formField}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                sx: {
                                                                    maxHeight: 360,
                                                                    '& .MuiList-root': {
                                                                        maxHeight: 360,
                                                                        overflowY: 'scroll',
                                                                        '&::-webkit-scrollbar': {
                                                                            width: '8px'
                                                                        },
                                                                        '&::-webkit-scrollbar-track': {
                                                                            background: '#f1f1f1',
                                                                            borderRadius: '10px'
                                                                        },
                                                                        '&::-webkit-scrollbar-thumb': {
                                                                            background: '#888',
                                                                            borderRadius: '10px',
                                                                            '&:hover': {
                                                                                background: '#555'
                                                                            }
                                                                        }
                                                                    },
                                                                    '& .MuiMenuItem-root': {
                                                                        minHeight: 52,
                                                                        py: 1.5
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {(() => {
                                                            const selectedPot = availablePots.find(p => toStringSafe(p.name) === toStringSafe(size.pot.name));
                                                            const options = extractPotSizeOptions(selectedPot);
                                                            const finalOptions = options.length ? options : [
                                                                { value: 'small', label: 'Small' },
                                                                { value: 'medium', label: 'Medium' },
                                                                { value: 'large', label: 'Large' },
                                                            ];
                                                            return finalOptions.map((opt) => (
                                                                <MenuItem key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </MenuItem>
                                                            ));
                                                        })()}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </Card>

                                        {/* Soil */}
                                        <Card sx={{
                                            p: 3,
                                            backgroundColor: '#ffffff',
                                            borderRadius: 2,
                                            border: '1px solid rgba(11, 63, 49, 0.15)'
                                        }}>
                                            <Typography variant="subtitle1"
                                                        sx={{fontWeight: 600, mb: 3, color: '#0b3f31'}}>
                                                🌿 Đất trồng
                                            </Typography>
                                            {errors[`size_${sizeIndex}_soil`] && (
                                                <Alert severity="error" sx={{mb: 2}}>
                                                    {errors[`size_${sizeIndex}_soil`]}
                                                </Alert>
                                            )}
                                            <Box sx={{display: 'flex', gap: 2}}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Chọn đất trồng</InputLabel>
                                                    <Select
                                                        value={size.soil.name}
                                                        onChange={(e) => updateSize(sizeIndex, 'soil', {
                                                            ...size.soil,
                                                            name: e.target.value
                                                        })}
                                                        label="Chọn đất trồng"
                                                        sx={DASHBOARD_STYLES.formField}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                sx: {
                                                                    maxHeight: 360,
                                                                    '& .MuiList-root': {
                                                                        maxHeight: 360,
                                                                        overflowY: 'scroll',
                                                                        '&::-webkit-scrollbar': {
                                                                            width: '8px'
                                                                        },
                                                                        '&::-webkit-scrollbar-track': {
                                                                            background: '#f1f1f1',
                                                                            borderRadius: '10px'
                                                                        },
                                                                        '&::-webkit-scrollbar-thumb': {
                                                                            background: '#888',
                                                                            borderRadius: '10px',
                                                                            '&:hover': {
                                                                                background: '#555'
                                                                            }
                                                                        }
                                                                    },
                                                                    '& .MuiMenuItem-root': {
                                                                        minHeight: 52,
                                                                        py: 1.5
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {availableSoils.map((soil) => (
                                                            <MenuItem key={soil.id} value={soil.name}>
                                                                {soil.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                                <TextField
                                                    fullWidth
                                                    label="Khối lượng (gram)"
                                                    type="number"
                                                    value={size.soil.massAmount}
                                                    onChange={(e) => updateSize(sizeIndex, 'soil', {
                                                        ...size.soil,
                                                        massAmount: e.target.value
                                                    })}
                                                    inputProps={{min: 0, step: 0.1}}
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end">g</InputAdornment>
                                                    }}
                                                    sx={DASHBOARD_STYLES.formField}
                                                />
                                            </Box>
                                        </Card>

                                        {/* Decoration */}
                                        <Card sx={{
                                            p: 3,
                                            backgroundColor: '#ffffff',
                                            borderRadius: 2,
                                            border: '1px solid rgba(11, 63, 49, 0.15)'
                                        }}>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mb: 3
                                            }}>
                                                <Typography variant="subtitle1"
                                                            sx={{fontWeight: 600, color: '#0b3f31'}}>
                                                    ✨ Trang trí
                                                </Typography>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Typography variant="body2" sx={{color: '#0b3f31'}}>Bao gồm trang
                                                        trí:</Typography>
                                                    <FormControl size="small" sx={{minWidth: 80}}>
                                                        <Select
                                                            value={size.decoration?.included || false}
                                                            onChange={(e) => updateSize(sizeIndex, 'decoration', {
                                                                ...(size.decoration || {included: false, details: []}),
                                                                included: e.target.value
                                                            })}
                                                            sx={{
                                                                '& .MuiSelect-select': {
                                                                    color: '#0b3f31',
                                                                    fontWeight: 600
                                                                }
                                                            }}
                                                        >
                                                            <MenuItem value={true}>Có</MenuItem>
                                                            <MenuItem value={false}>Không</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Box>
                                            </Box>

                                            {size.decoration?.included && (
                                                <Box>
                                                    <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 3}}>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<AddIcon/>}
                                                            onClick={() => addDecorationDetail(sizeIndex)}
                                                            sx={{
                                                                borderColor: '#0b3f31',
                                                                color: '#0b3f31',
                                                                '&:hover': {
                                                                    borderColor: '#0b3f31',
                                                                    backgroundColor: 'rgba(11, 63, 49, 0.1)'
                                                                }
                                                            }}
                                                        >
                                                            Thêm chi tiết trang trí
                                                        </Button>
                                                    </Box>

                                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                                        {Array.isArray(size.decoration?.details) && size.decoration.details.map((detail, detailIndex) => (
                                                            <Card key={detailIndex} sx={{
                                                                p: 3,
                                                                backgroundColor: '#f8fffe',
                                                                borderRadius: 2,
                                                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                                                position: 'relative'
                                                            }}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    mb: 3
                                                                }}>
                                                                    <Typography variant="subtitle2"
                                                                                sx={{
                                                                                    fontWeight: 600,
                                                                                    color: '#0b3f31'
                                                                                }}>
                                                                        Chi tiết #{detailIndex + 1}
                                                                    </Typography>
                                                                    <IconButton
                                                                        color="error"
                                                                        size="small"
                                                                        onClick={() => removeDecorationDetail(sizeIndex, detailIndex)}
                                                                        sx={{
                                                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                                            '&:hover': {
                                                                                backgroundColor: 'rgba(239, 68, 68, 0.2)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <DeleteIcon/>
                                                                    </IconButton>
                                                                </Box>

                                                                <Box sx={{display: 'flex', gap: 2}}>
                                                                    <FormControl fullWidth>
                                                                        <InputLabel>Tên chi tiết trang trí</InputLabel>
                                                                        <Select
                                                                            value={detail.name}
                                                                            onChange={(e) => updateDecorationDetail(sizeIndex, detailIndex, 'name', e.target.value)}
                                                                            label="Tên chi tiết trang trí"
                                                                            sx={DASHBOARD_STYLES.formField}
                                                                            MenuProps={{
                                                                                PaperProps: {
                                                                                    sx: {
                                                                                        maxHeight: 360,
                                                                                        '& .MuiList-root': {
                                                                                            maxHeight: 360,
                                                                                            overflowY: 'scroll',
                                                                                            '&::-webkit-scrollbar': {
                                                                                                width: '8px'
                                                                                            },
                                                                                            '&::-webkit-scrollbar-track': {
                                                                                                background: '#f1f1f1',
                                                                                                borderRadius: '10px'
                                                                                            },
                                                                                            '&::-webkit-scrollbar-thumb': {
                                                                                                background: '#888',
                                                                                                borderRadius: '10px',
                                                                                                '&:hover': {
                                                                                                    background: '#555'
                                                                                                }
                                                                                            }
                                                                                        },
                                                                                        '& .MuiMenuItem-root': {
                                                                                            minHeight: 52,
                                                                                            py: 1.5
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }}
                                                                        >
                                                                            {availableDecorations.map((decoration) => (
                                                                                <MenuItem key={decoration.id}
                                                                                          value={decoration.name}>
                                                                                    {decoration.name}
                                                                                </MenuItem>
                                                                            ))}
                                                                        </Select>
                                                                    </FormControl>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Số lượng"
                                                                        type="number"
                                                                        value={detail.quantity}
                                                                        onChange={(e) => updateDecorationDetail(sizeIndex, detailIndex, 'quantity', e.target.value)}
                                                                        inputProps={{min: 1}}
                                                                        sx={DASHBOARD_STYLES.formField}
                                                                    />
                                                                </Box>
                                                            </Card>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}
                                        </Card>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </Box>
                    ))}
                </Box>

                {/* Images */}
                <Card sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)'
                }}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography sx={DASHBOARD_STYLES.sectionTitle}>
                            Hình ảnh sản phẩm
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<PhotoCameraIcon/>}
                            onClick={addImage}
                            sx={DASHBOARD_STYLES.primaryButton}
                        >
                            Thêm hình ảnh
                        </Button>
                    </Box>
                    <Divider sx={{mb: 2}}/>

                    {errors.images && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {errors.images}
                        </Alert>
                    )}

                    {Array.isArray(formData.images) && formData.images.map((image, imageIndex) => (
                        <Card key={imageIndex} sx={{p: 2, mb: 2, backgroundColor: '#f8fffe'}}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                    Hình ảnh #{imageIndex + 1}
                                </Typography>
                                <IconButton
                                    color="error"
                                    onClick={() => removeImage(imageIndex)}
                                >
                                    <DeleteIcon/>
                                </IconButton>
                            </Box>

                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                                <Box sx={{display: 'flex', gap: 3}}>
                                    {/* Image Upload & Preview */}
                                    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <Box>
                                            <input
                                                accept="image/*"
                                                style={{display: 'none'}}
                                                id={`image-upload-${imageIndex}`}
                                                type="file"
                                                onChange={(e) => handleFileSelected(e, imageIndex)}
                                            />
                                            <label htmlFor={`image-upload-${imageIndex}`}>
                                                <Button
                                                    variant="outlined"
                                                    component="span"
                                                    startIcon={<PhotoCameraIcon/>}
                                                    fullWidth
                                                    disabled={isUploading}
                                                    sx={{
                                                        borderColor: '#0b3f31',
                                                        color: '#0b3f31',
                                                        py: 1.5,
                                                        '&:hover': {
                                                            borderColor: '#0b3f31',
                                                            backgroundColor: 'rgba(11, 63, 49, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    {isUploading ? 'Đang tải...' : 'Chọn hình ảnh'}
                                                </Button>
                                            </label>
                                            {isUploading && (
                                                <Typography variant="caption" color="text.secondary"
                                                            sx={{mt: 1, display: 'block'}}>
                                                    Tiến độ: {uploadProgress}%
                                                </Typography>
                                            )}
                                        </Box>

                                        {image.url && (
                                            <Box sx={{
                                                border: '2px solid rgba(11, 63, 49, 0.2)',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                backgroundColor: '#f8fffe'
                                            }}>
                                                <img
                                                    src={image.url}
                                                    alt="Preview"
                                                    style={{
                                                        width: '100%',
                                                        height: '200px',
                                                        objectFit: 'cover',
                                                        display: 'block'
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Card>
                    ))}
                </Card>
                </>
                )}
            </DialogContent>

            <DialogActions sx={{p: 3, backgroundColor: '#f7faf7'}}>
                <ActionButton
                    onClick={onClose}
                    type="button"
                    action="cancel"
                />

                <ActionButton
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    action={isEdit ? "update" : "create"}
                    type="submit"
                >
                    {isSubmitting ? (
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Box sx={{
                                width: 18,
                                height: 18,
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTop: '2px solid white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}/>
                            {isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
                        </Box>
                    ) : (
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Box sx={{fontSize: '1.2rem'}}>✓</Box>
                            {isEdit ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
                        </Box>
                    )}
                </ActionButton>
            </DialogActions>
        </Dialog>
    );
};

export default CreateOrUpdateProductDialog;
