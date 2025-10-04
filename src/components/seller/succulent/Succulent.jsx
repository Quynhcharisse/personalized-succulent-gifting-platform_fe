import React, {useEffect, useRef, useState} from 'react';
import {Alert, Box, Button, Container, Paper, Typography} from '@mui/material';
import {Add as AddIcon, LocalFlorist as LocalFloristIcon} from '@mui/icons-material';
import {createSucculent, getSucculents} from '../../../services/ProductService.jsx';
import SucculentTable from './SucculentTable.jsx';
import SucculentDetailDialog from './SucculentDetailDialog.jsx';
import CreateSucculentDialog from './CreateSucculentDialog.jsx';
import uploadToCloudinary from "../../cloudinaryUpload.js";
import UpdateSucculentDialog from "./UpdateSucculentDialog.jsx";

const SucculentForm = () => {
    // Form state
    const [formData, setFormData] = useState({
        species_name: '',
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
    const [uploadProgress] = useState(0);
    const [isUploading] = useState(false);
    useRef(null);
    useRef(null);

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
            species_name: '',
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
        if (!formData.species_name.trim()) {
            newErrors.species_name = 'Tên loài sen đá là bắt buộc';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Mô tả sản phẩm là bắt buộc';
        }
        if (!formData.imageUrl.trim()) {
            newErrors.imageUrl = 'URL hình ảnh là bắt buộc';
        }
        return newErrors;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (formData.selectedSizes.length === 0) {
            newErrors.selectedSizes = 'Vui lòng chọn ít nhất một kích thước';
        }
        return newErrors;
    };

    const validateStep3 = () => {
        const newErrors = {};
        formData.sizeDetailRequests.forEach((size, index) => {
            if (!size.priceSell || size.priceSell <= 0) {
                newErrors[`size_${index}_priceSell`] = 'Giá bán phải lớn hơn 0';
            }
            if (!size.quantity || Number(size.quantity) <= 0) {
                newErrors[`size_${index}_quantity`] = 'Số lượng phải lớn hơn 0';
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
                    ...(formData.fengShuiList.length === 0 ? {fengShuiList: 'Phong thủy là bắt buộc'} : {}),
                    ...(formData.zodiacList.length === 0 ? {zodiacList: 'Cung hoàng đạo là bắt buộc'} : {})
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
                speciesName: formData.species_name.trim(),
                description: formData.description.trim(),
                imageUrl: formData.imageUrl.trim(),
                fengShuiList: formData.fengShuiList,
                zodiacList: formData.zodiacList,
                sizeList: formData.sizeDetailRequests.map(size => ({
                    sizeName: size.name,
                    price: parseInt(size.priceSell),
                    quantity: parseInt(size.quantity)
                }))
            };

            try {
                const response = await createSucculent(apiData);
                if (response && response.data) {
                    setSubmitMessage({text: 'Tạo sản phẩm thành công!', type: 'success'});
                    setTimeout(() => {
                        handleCloseCreateDialog();
                        loadSucculentList();
                    }, 1500);
                } else {
                    setSubmitMessage({text: 'Có lỗi xảy ra khi tạo sản phẩm', type: 'error'});
                }
            } catch (error) {
                console.error('Error creating succulent:', error);
                setSubmitMessage({text: 'Có lỗi xảy ra khi tạo sản phẩm', type: 'error'});
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
        <Container maxWidth="xl" sx={{py: {xs: 3, sm: 5}}}>
            <Paper elevation={0} sx={{
                p: {xs: 2.5, sm: 4, md: 5},
                borderRadius: 4,
                background: 'linear-gradient(120deg, #f8f9e9 0%, #e0f7fa 100%)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.7)'
            }}>
                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: {xs: 'column', sm: 'row'},
                    alignItems: {xs: 'flex-start', sm: 'center'},
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 4
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <LocalFloristIcon sx={{
                            fontSize: {xs: 38, sm: 44},
                            color: 'success.main',
                            mr: 2,
                            filter: 'drop-shadow(0 4px 6px rgba(46, 125, 50, 0.2))'
                        }}/>
                        <Box>
                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{
                                    fontWeight: 900,
                                    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                    color: 'success.dark',
                                    letterSpacing: 1,
                                    fontSize: {xs: '1.7rem', sm: '2.2rem'}
                                }}
                            >
                                Quản Lý Sản Phẩm Sen Đá
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Quản lý danh sách sản phẩm sen đá của bạn
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={handleOpenCreateDialog}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            py: 1.2,
                            px: 3,
                            background: 'linear-gradient(90deg, #43a047 0%, #388e3c 100%)',
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(90deg, #388e3c 0%, #2e7d32 100%)',
                                boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)'
                            }
                        }}
                    >
                        Tạo Sản Phẩm
                    </Button>
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
