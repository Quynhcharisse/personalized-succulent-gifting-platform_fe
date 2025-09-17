import React, {useEffect, useState} from 'react';
import {Alert, Box, Button, Container, Paper, Typography} from '@mui/material';
import {Add as AddIcon, Inventory as InventoryIcon} from '@mui/icons-material';
import {createAccessory, getAccessories} from '../../../services/ProductService.jsx';
import AccessoryTable from './AccessoryTable.jsx';
import CreateAccessoryDialog from './CreateAccessoryDialog.jsx';
import UpdateAccessoryDialog from './UpdateAccessoryDialog.jsx';

export default function Accessory() {
    const [accessories, setAccessories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({type: '', text: ''});
    const [showUpdate, setShowUpdate] = useState(false);
    const [selected, setSelected] = useState(null);

    const loadAccessories = async () => {
        setIsLoading(true);
        try {
            const response = await getAccessories();
            const list = response?.data?.data;
            setAccessories(Array.isArray(list) ? list : []);
        } catch (e) {
            setAccessories([]);
            setSubmitMessage({type: 'error', text: 'Lỗi tải danh sách phụ kiện'});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAccessories();
    }, []);

    const handleOpenCreate = () => {
        setSubmitMessage({type: '', text: ''});
        setShowCreate(true);
    };

    const handleCloseCreate = () => {
        setShowCreate(false);
    };

    const handleCreate = async (payload) => {
        try {
            const res = await createAccessory(payload);
            const msg = res?.data?.message || 'Tạo phụ kiện thành công';
            setSubmitMessage({type: 'success', text: msg});
            setShowCreate(false);
            await loadAccessories();
        } catch (e) {
            const errMsg = e?.response?.data?.message || 'Tạo phụ kiện thất bại';
            setSubmitMessage({type: 'error', text: errMsg});
        }
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
                <Box sx={{
                    display: 'flex',
                    flexDirection: {xs: 'column', sm: 'row'},
                    alignItems: {xs: 'flex-start', sm: 'center'},
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 4
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <InventoryIcon sx={{
                            fontSize: {xs: 38, sm: 44},
                            color: 'success.main',
                            mr: 2
                        }}/>
                        <Box>
                            <Typography variant="h4" sx={{fontWeight: 900, color: 'success.dark'}}>
                                Quản Lý Phụ Kiện
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Danh sách phụ kiện và thao tác tạo mới
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={handleOpenCreate}
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
                        Tạo Phụ Kiện
                    </Button>
                </Box>

                {submitMessage.text && (
                    <Alert severity={submitMessage.type === 'success' ? 'success' : 'error'} sx={{mb: 3}}>
                        {submitMessage.text}
                    </Alert>
                )}

                <AccessoryTable
                    items={accessories}
                    isLoading={isLoading}
                    onViewDetail={(acc) => { /* TODO: integrate detail dialog later */ }}
                    onUpdate={(acc) => { setSelected(acc); setShowUpdate(true); }}
                />
            </Paper>

            <CreateAccessoryDialog
                open={showCreate}
                onClose={handleCloseCreate}
                onCreate={handleCreate}
            />

            <UpdateAccessoryDialog
                open={showUpdate}
                onClose={() => { setShowUpdate(false); setSelected(null); }}
                accessory={selected}
                onUpdated={loadAccessories}
            />
        </Container>
    );
}

 