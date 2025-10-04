import React, {useEffect, useState} from 'react';
import {Alert, Box, Container, Paper, Typography, Tabs, Tab} from '@mui/material';
import {Add as AddIcon, Inventory as InventoryIcon} from '@mui/icons-material';
import {getAccessories} from '../../../services/ProductService.jsx';
import AccessoryTable from './AccessoryTable.jsx';
import AccessoryDetail from './AccessoryDetail.jsx';
import CreateAccessoryDialog from './CreateAccessoryDialog.jsx';
import ActionButton from "../../buttonCustom/ActionButton.jsx";

export default function Accessory() {
    const [accessories, setAccessories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeType, setActiveType] = useState('all'); // all | pots | soils | decorations
    const [showCreate, setShowCreate] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({type: '', text: ''});
    const [showUpdate, setShowUpdate] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selected, setSelected] = useState(null);

    const loadAccessories = async (type = activeType) => {
        setIsLoading(true);
        try {
            const response = await getAccessories(type);
            const data = response?.data?.data;
            const pickImageUrl = (arr) => Array.isArray(arr) && arr.length > 0 ? (arr[0]?.image || '') : '';
            const mapPots = (arr = []) => arr.map((item, idx) => {
                const totalQty = Array.isArray(item.size) ? item.size.reduce((sum, s) => sum + (Number(s.availableQty) || 0), 0) : 0;
                return {
                    id: `pots-${idx}-${item.name}`,
                    name: item.name,
                    imageUrl: pickImageUrl(item.image),
                    images: Array.isArray(item.image) ? item.image.map(it => it?.image).filter(Boolean) : [],
                    category: 'pots',
                    status: totalQty > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
                    createdAt: null,
                    updatedAt: null,
                    raw: item,
                };
            });
            const mapDecorations = (arr = []) => arr.map((item, idx) => ({
                id: `decor-${idx}-${item.name}`,
                name: item.name,
                imageUrl: pickImageUrl(item.image),
                images: Array.isArray(item.image) ? item.image.map(it => it?.image).filter(Boolean) : [],
                category: 'decorations',
                status: (Number(item.availableQty) || 0) > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
                createdAt: null,
                updatedAt: null,
                raw: item,
            }));
            const mapSoils = (arr = []) => arr.map((item, idx) => ({
                id: `soils-${idx}-${item.name}`,
                name: item.name,
                imageUrl: pickImageUrl(item.image),
                images: Array.isArray(item.image) ? item.image.map(it => it?.image).filter(Boolean) : [],
                category: 'soils',
                status: (Number(item.availableMassValue) || 0) > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
                createdAt: null,
                updatedAt: null,
                raw: item,
            }));

            let list = [];
            if (type === 'pots') list = mapPots(data?.pots);
            else if (type === 'soils') list = mapSoils(data?.soils);
            else if (type === 'decorations') list = mapDecorations(data?.decorations);
            else {
                list = [
                    ...mapPots(data?.pots),
                    ...mapSoils(data?.soils),
                    ...mapDecorations(data?.decorations),
                ];
            }
            list.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
            setAccessories(list);
        } catch (e) {
            setAccessories([]);
            setSubmitMessage({type: 'error', text: 'Lỗi tải danh sách phụ kiện'});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAccessories(activeType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeType]);

    const handleOpenCreate = () => {
        setSubmitMessage({type: '', text: ''});
        setShowCreate(true);
    };

    const handleCloseCreate = () => {
        setShowCreate(false);
    };

    const handleCreateSuccess = async () => {
        await loadAccessories();
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

                    <ActionButton
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
                        }}>
                        Tạo Phụ Kiện
                    </ActionButton>
                </Box>

                <Tabs value={activeType} onChange={(e, v) => setActiveType(v)} sx={{mb: 2}}>
                    <Tab value="all" label="Tất cả" />
                    <Tab value="pots" label="Chậu (pots)" />
                    <Tab value="soils" label="Đất (soils)" />
                    <Tab value="decorations" label="Trang trí (decorations)" />
                </Tabs>

                {submitMessage.text && (
                    <Alert severity={submitMessage.type === 'success' ? 'success' : 'error'} sx={{mb: 3}}>
                        {submitMessage.text}
                    </Alert>
                )}

                <AccessoryTable
                    items={accessories}
                    isLoading={isLoading}
                    onViewDetail={(acc) => {
                        setSelected(acc);
                        setShowDetail(true);
                    }}
                    onUpdate={(acc) => {
                        setSelected(acc);
                        setShowUpdate(true);
                    }}
                />
            </Paper>

            <CreateAccessoryDialog
                open={showCreate}
                onClose={handleCloseCreate}
                onCreate={handleCreateSuccess}
            />

            <AccessoryDetail
                open={showDetail}
                onClose={() => setShowDetail(false)}
                item={selected}
            />
        </Container>
    );
}

 