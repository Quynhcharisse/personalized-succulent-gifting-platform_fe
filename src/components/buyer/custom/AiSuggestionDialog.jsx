import React, {useState} from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from '@mui/material';
import {AutoAwesome as AutoAwesomeIcon} from '@mui/icons-material';
import {getAiSuggestion} from '@/services/AiSuggestionService.jsx';
import {useSnackbar} from 'notistack';

export default function AiSuggestionDialog({open, onClose, onApplySuggestion}) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const {enqueueSnackbar} = useSnackbar();

    const handleGetSuggestion = async () => {
        if (!query.trim()) {
            enqueueSnackbar('Vui lòng nhập yêu cầu của bạn', {variant: 'warning'});
            return;
        }

        setLoading(true);
        try {
            // Get user ID from localStorage
            const user = JSON.parse(sessionStorage.getItem('user') || '{}');
            const userId = user.id || 'guest';

            const response = await getAiSuggestion(query, userId);

            if (response?.data) {
                const aiData = response.data;
                
                // Parse the answer JSON string from Dify AI
                let suggestionData;
                try {
                    suggestionData = JSON.parse(aiData.answer);
                } catch (parseError) {
                    console.error('Error parsing AI response:', parseError);
                    enqueueSnackbar('Không thể xử lý kết quả từ AI', {variant: 'error'});
                    return;
                }

                // Pass the parsed data to parent component
                onApplySuggestion(suggestionData);
                enqueueSnackbar('Đã áp dụng gợi ý từ AI!', {variant: 'success'});
                handleClose();
            } else {
                enqueueSnackbar('Không nhận được phản hồi từ AI', {variant: 'error'});
            }
        } catch (error) {
            console.error('Error getting AI suggestion:', error);
            enqueueSnackbar('Có lỗi xảy ra khi lấy gợi ý từ AI', {variant: 'error'});
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setQuery('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: '#F9FCFB',
                borderBottom: '1px solid #E0EBE7'
            }}>
                <AutoAwesomeIcon sx={{color: '#2E7D32'}}/>
                <Typography variant="h6" sx={{fontWeight: 600}}>
                    AI Gợi Ý Thiết Kế
                </Typography>
            </DialogTitle>
            
            <DialogContent sx={{mt: 2}}>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                    Hãy mô tả chi tiết về chậu cây bạn muốn thiết kế. Ví dụ: "Tôi muốn một chậu cây tặng bạn tốt nghiệp đại học, phong cách trẻ trung, hiện đại"
                </Typography>
                
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Mô tả yêu cầu của bạn"
                    placeholder="Ví dụ: Hãy giúp tôi thiết kế 1 chậu cây tặng người thân tốt nghiệp"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={loading}
                    sx={{
                        backgroundColor: '#F9FCFB',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E0EBE7'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#BFD9D1'
                        },
                        '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#2E7D32'
                        }
                    }}
                />

                {loading && (
                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2}}>
                        <CircularProgress size={24} sx={{color: '#2E7D32'}}/>
                        <Typography variant="body2" color="text.secondary">
                            AI đang suy nghĩ...
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions sx={{px: 3, pb: 2}}>
                <Button onClick={handleClose} disabled={loading}>
                    Hủy
                </Button>
                <Button
                    variant="contained"
                    onClick={handleGetSuggestion}
                    disabled={loading || !query.trim()}
                    startIcon={loading ? <CircularProgress size={16}/> : <AutoAwesomeIcon/>}
                    sx={{
                        backgroundColor: '#2E7D32',
                        '&:hover': {
                            backgroundColor: '#1B5E20'
                        }
                    }}
                >
                    {loading ? 'Đang xử lý...' : 'Lấy Gợi Ý'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
