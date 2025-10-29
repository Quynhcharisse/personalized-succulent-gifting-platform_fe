import React, {useEffect, useState} from 'react';
import {Alert, Box, Container, Paper, Typography} from '@mui/material';
import {Add as AddIcon, LocalFlorist as LocalFloristIcon} from '@mui/icons-material';
import {createSucculent, getSucculents} from '../../../services/ProductService.jsx';
import SucculentTable from './SucculentTable.jsx';
import SucculentDetailDialog from './SucculentDetailDialog.jsx';
import CreateSucculentDialog from './CreateSucculentDialog.jsx';
import uploadToCloudinary from "../../cloudinaryUpload.js";
import UpdateSucculentDialog from "./UpdateSucculentDialog.jsx";
import ActionButton from "../../buttonCustom/ActionButton.jsx";
import usePagination from '../../../hooks/usePagination.js';
import {DASHBOARD_STYLES} from '../../constants.js';

const SucculentForm = () => {
    // Pagination hook
    const {resetPagination} = usePagination(0, 10);

    // Form state
    const [formData, setFormData] = useState({
        speciesName: '',
        description: '',
        imageUrl: '',
        fengShuiList: [],
        zodiacList: [],
        selectedSizes: [],
        sizeDetailRequests: []
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({type: '', text: ''});
    const [, setTabIndex] = useState(0);
    const [, setMaxStep] = useState(0);
    const [succulentList, setSucculentList] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [selectedSucculent, setSelectedSucculent] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isValidating, setIsValidating] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    async function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            try {
                // call cloudinary upload API
                const imageUrl = await uploadToCloudinary(file, {
                    onProgress: (progress) => setUploadProgress(progress),
                });
                if (imageUrl) {
                    setFormData(prev => ({...prev, imageUrl}));
                    setSubmitMessage({text: 'Upload ảnh thành công!', type: 'success'});
                } else {
                    setSubmitMessage({text: 'Không thể upload ảnh', type: 'error'});
                }
            } catch (error) {
                setSubmitMessage({text: 'Lỗi upload ảnh', type: 'error'});
            }
        }
        // Reset file input
        if (event.target) {
            event.target.value = '';
        }
    }

    // Load succulent list
    const loadSucculentList = async () => {
        setIsLoadingList(true);
        try {
            const response = await getSucculents();
            if (response && response.data && Array.isArray(response.data.data)) {
                setSucculentList(response.data.data);
                resetPagination(); // Reset pagination when data changes
            } else if (response && response.data && Array.isArray(response.data)) {
                // Handle case where data is directly in response.data
                setSucculentList(response.data);
                resetPagination();
            } else {
                setSucculentList([]);
                console.warn('API response data is not an array:', response);
            }
        } catch (error) {
            console.error('Error loading succulent list:', error);
            setSucculentList([]);
            setSubmitMessage({
                type: 'error',
                text: 'Có lỗi xảy ra khi tải danh sách sản phẩm'
            });
        } finally {
            setIsLoadingList(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        loadSucculentList();
    }, []);

    // Handle dialog actions
    const handleOpenCreateDialog = () => {
        setShowCreateDialog(true);
        setTabIndex(0);
        setMaxStep(0);
        setErrors({});
        setSubmitMessage({type: '', text: ''});
    };

    const handleCloseCreateDialog = () => {
        setShowCreateDialog(false);
        setFormData({
            speciesName: '',
            description: '',
            imageUrl: '',
            fengShuiList: [],
            zodiacList: [],
            selectedSizes: [],
            sizeDetailRequests: []
        });
        setErrors({});
        setSubmitMessage({type: '', text: ''});
        setCurrentStep(1);
        setIsValidating(false);
    };

    // Step validation functions
    const validateStep1 = () => {
        const newErrors = {};
        const species = (formData.speciesName || '').trim();
        const description = (formData.description || '').trim();
        const imageUrl = (formData.imageUrl || '').trim();

        if (!species) {
            newErrors.speciesName = 'Tên loài là bắt buộc';
        } else if (species.length > 100) {
            newErrors.speciesName = 'Tên loài không được vượt quá 100 ký tự';
        }

        if (!description) {
            newErrors.description = 'Mô tả là bắt buộc';
        }
        
        if (!imageUrl) {
            newErrors.imageUrl = 'Image URL is required';
        } else if (!/^(http|https):\/\/.+/i.test(imageUrl)) {
            newErrors.imageUrl = 'Invalid Image URL format';
        } else if (!/\.(jpg|jpeg|png|gif)$/i.test(imageUrl)) {
            newErrors.imageUrl = 'Image URL must end with a valid image file extension (jpg, jpeg, png, gif)';
        }

        if (Array.isArray(formData.fengShuiList) && formData.fengShuiList.some((v) => v == null)) {
            newErrors.fengShuiList = 'Danh sách phong thủy chứa giá trị không hợp lệ';
        }
        if (Array.isArray(formData.zodiacList) && formData.zodiacList.some((v) => v == null)) {
            newErrors.zodiacList = 'Danh sách cung hoàng đạo chứa giá trị không hợp lệ';
        }
        return newErrors;
    };

    const validateStep2 = () => {
        const newErrors = {};
        const count = Array.isArray(formData.sizeDetailRequests) ? formData.sizeDetailRequests.length : 0;
        if (count === 0) {
            newErrors.selectedSizes = 'Vui lòng chọn ít nhất một kích thước';
        } else if (count > 5) {
            newErrors.selectedSizes = 'Hệ thống chỉ có tối đa 5 kích thước';
        }
        return newErrors;
    };

    const validateStep3 = () => {
        const newErrors = {};
        formData.sizeDetailRequests.forEach((size, index) => {
            if (!size.name || !String(size.name).trim()) {
                newErrors[`size_${index}_name`] = 'Tên kích thước là bắt buộc';
            }
            if (size.price === '' || size.price === null || Number(size.price) <= 0) {
                newErrors[`size_${index}_price`] = 'Cần nhập giá bán lớn hơn 0';
            }
            if (size.quantity === '' || size.quantity === null || Number(size.quantity) < 0) {
                newErrors[`size_${index}_quantity`] = 'Số lượng cây không được là số âm';
            }
        });
        return newErrors;
    };

    const handleNextStep = () => {
        setIsValidating(true);
        let stepErrors = {};

        switch (currentStep) {
            case 1:
                stepErrors = {
                    ...validateStep1(),
                };
                break;
            case 2:
                stepErrors = {
                    ...validateStep2(),
                    ...validateStep3()
                };
                break;
            default:
                break;
        }

        setErrors(stepErrors);

        if (Object.keys(stepErrors).length === 0) {
            setCurrentStep(prev => Math.min(prev + 1, 2));
        }

        setTimeout(() => setIsValidating(false), 500);
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setErrors({});
    };

    const handleSubmitForm = async () => {
        setIsValidating(true);
        const allErrors = {
            ...validateStep1(),
            ...(formData.fengShuiList.length === 0 ? {fengShuiList: 'Phong thủy là bắt buộc'} : {}),
            ...(formData.zodiacList.length === 0 ? {zodiacList: 'Cung hoàng đạo là bắt buộc'} : {}),
            ...validateStep2(),
            ...validateStep3()
        };

        setErrors(allErrors);

        if (Object.keys(allErrors).length === 0) {
            setIsSubmitting(true);
            const apiData = {
                speciesName: formData.speciesName.trim(),
                description: formData.description.trim(),
                imageUrl: formData.imageUrl.trim(),
                fengShuiList: formData.fengShuiList,
                zodiacList: formData.zodiacList,
                sizeList: formData.sizeDetailRequests.map(size => ({
                    sizeName: String(size.sizeName || size.name).trim().toLowerCase(),
                    price: Number(size.price),
                    minArea: Number(size.minArea) || 0,
                    maxArea: Number(size.maxArea) || 0,
                    quantity: Number(size.quantity)
                }))
            };

            try {
                const response = await createSucculent(apiData);
                if (response && response.data && response.data.message) {
                    setSubmitMessage({text: response.data.message, type: 'success'});
                    setTimeout(() => {
                        handleCloseCreateDialog();
                        loadSucculentList();
                    }, 1500);
                } else {
                    setSubmitMessage({text: 'Có lỗi xảy ra khi tạo sản phẩm', type: 'error'});
                }
            } catch (error) {
                console.error('Error creating succulent:', error);
                const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo sản phẩm';
                setSubmitMessage({text: errorMessage, type: 'error'});
            } finally {
                setIsSubmitting(false);
            }
        }

        setTimeout(() => setIsValidating(false), 500);
    };

    const handleViewDetail = (succulent) => {
        setSelectedSucculent(succulent);
        setShowDetailDialog(true);
    };

    const handleUpdate = (succulent) => {
        setSelectedSucculent(succulent);
        setShowUpdateDialog(true);
    };

    const handleCloseDetailDialog = () => {
        setShowDetailDialog(false);
        setSelectedSucculent(null);
    };

    const handleCloseUpdateDialog = () => {
        setShowUpdateDialog(false);
        setSelectedSucculent(null);
    };

    return (
        <Container maxWidth={DASHBOARD_STYLES.container.maxWidth} sx={DASHBOARD_STYLES.container}>
            <Paper elevation={0} sx={DASHBOARD_STYLES.paper}>
                {/* Header */}
                <Box sx={DASHBOARD_STYLES.headerSection}>
                    <Box sx={DASHBOARD_STYLES.titleSection}>
                        <LocalFloristIcon sx={DASHBOARD_STYLES.titleIcon}/>
                        <Box>
                            <Typography sx={DASHBOARD_STYLES.mainTitle}>
                                Quản Lý Sản Phẩm Sen Đá
                            </Typography>
                            <Typography sx={DASHBOARD_STYLES.subtitle}>
                                Quản lý danh sách sản phẩm sen đá của bạn
                            </Typography>
                        </Box>
                    </Box>
                    <ActionButton
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={handleOpenCreateDialog}
                        sx={DASHBOARD_STYLES.primaryButton}
                    >
                        Tạo Sản Phẩm
                    </ActionButton>
                </Box>

                {/* Error Message */}
                {submitMessage.text && (
                    <Alert
                        severity={submitMessage.type === 'success' ? 'success' : 'error'}
                        variant="filled"
                        sx={{
                            mb: 4,
                            fontWeight: 600,
                            fontSize: '1.05rem',
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {submitMessage.text}
                    </Alert>
                )}

                {/* Succulent List Table */}
                <SucculentTable
                    succulentList={succulentList}
                    isLoading={isLoadingList}
                    onViewDetail={handleViewDetail}
                    onUpdate={handleUpdate}
                />
            </Paper>

            <SucculentDetailDialog
                open={showDetailDialog}
                onClose={handleCloseDetailDialog}
                succulent={selectedSucculent}
            />

            <CreateSucculentDialog
                open={showCreateDialog}
                onClose={handleCloseCreateDialog}
                currentStep={currentStep}
                isValidating={isValidating}
                isSubmitting={isSubmitting}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                submitMessage={submitMessage}
                onPrev={handlePrevStep}
                onNext={handleNextStep}
                onSubmit={handleSubmitForm}
                onFileSelected={handleFileSelect}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
            />

            {/* Update Dialog */}
            <UpdateSucculentDialog
                open={showUpdateDialog}
                onClose={handleCloseUpdateDialog}
                succulent={selectedSucculent}
                onUpdated={loadSucculentList}
            />

        </Container>
    );
};

export default SucculentForm;
