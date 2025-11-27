import React, {useEffect, useState} from 'react';
import {Alert, Box, Container, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Chip, Stack, Tooltip, IconButton} from '@mui/material';
import {Add as AddIcon, Inventory as InventoryIcon, Visibility as VisibilityIcon, Edit as EditIcon} from '@mui/icons-material';
import {getAccessories} from '@/services/ProductService.jsx';
import DataTable from '../../common/DataTable.jsx';
import AccessoryDetail from './AccessoryDetail.jsx';
import CreateAccessoryDialog from './CreateAccessoryDialog.jsx';
import ActionButton from "../../buttonCustom/ActionButton.jsx";
import usePagination from '../../../hooks/usePagination.js';
import { DASHBOARD_STYLES } from '../../constants.js';

export default function Accessory() {
    const [accessories, setAccessories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeType, setActiveType] = useState('all'); // all | pots | soils | decorations
    const [showCreate, setShowCreate] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({type: '', text: ''});
    const [showUpdate, setShowUpdate] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selected, setSelected] = useState(null);
    
    // Pagination hook
    const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination(0, 10);

    // Helper functions for data formatting
    const formatCurrency = (num) => {
        const n = Number(num);
        if (!Number.isFinite(n)) return '-';
        return n.toLocaleString('vi-VN');
    };

    const getSizeOrMassText = (acc) => {
        const raw = acc?.raw || {};
        if (acc.category === 'pots') {
            const sizes = Array.isArray(raw.size) ? raw.size : (Array.isArray(raw.sizes) ? raw.sizes : []);
            if (!sizes.length) return '—';
            const names = sizes.map(s => s?.name).filter(Boolean).slice(0, 3).join(', ');
            const more = sizes.length > 3 ? ` +${sizes.length - 3}` : '';
            return names ? `${names}${more}` : `${sizes.length} size`;
        }
        if (acc.category === 'soils') {
            const available = raw?.availableMassValue;
            return Number.isFinite(Number(available)) ? `${available} g` : '—';
        }
        if (acc.category === 'decorations') {
            const qty = raw?.availableQty;
            return Number.isFinite(Number(qty)) ? `SL: ${qty}` : '—';
        }
        return '—';
    };

    const getPriceText = (acc) => {
        const raw = acc?.raw || {};
        if (acc.category === 'pots') {
            const sizes = Array.isArray(raw.size) ? raw.size : (Array.isArray(raw.sizes) ? raw.sizes : []);
            if (!sizes.length) return '—';
            const prices = sizes.map(s => Number(s?.price)).filter(p => Number.isFinite(p));
            if (!prices.length) return '—';
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            return min === max ? `${formatCurrency(min)} đ` : `${formatCurrency(min)} - ${formatCurrency(max)} đ`;
        }
        if (acc.category === 'soils') {
            const bp = raw?.basePricing || {};
            if (!Number.isFinite(Number(bp?.price)) || !Number.isFinite(Number(bp?.massValue))) return '—';
            const unit = bp?.massUnit === 'kg' ? 'kg' : 'g';
            return `${formatCurrency(bp.price)} đ / ${bp.massValue}${unit}`;
        }
        if (acc.category === 'decorations') {
            return Number.isFinite(Number(raw?.price)) ? `${formatCurrency(raw.price)} đ` : '—';
        }
        return '—';
    };

    const getCategoryChip = (category) => {
        const map = {
            pots: { label: 'CHẬU', color: '#0b3f31' },
            soils: { label: 'ĐẤT', color: '#f59e0b' },
            decorations: { label: 'TRANG TRÍ', color: '#3b82f6' }
        };
        const cfg = map[category] || { label: String(category || '').toUpperCase(), color: '#666' };
        return (
            <Chip
                label={cfg.label}
                size="small"
                variant="outlined"
                sx={{ 
                    fontWeight: 800, 
                    letterSpacing: 0.3,
                    color: cfg.color,
                    borderColor: cfg.color,
                    '&:hover': {
                        backgroundColor: `${cfg.color}15`
                    }
                }}
            />
        );
    };

    // Column configuration for DataTable
    const columns = [
        {
            field: 'image',
            header: 'Ảnh',
            align: 'center',
            render: (row) => {
                const image = Array.isArray(row.image) && row.image.length > 0 ? row.image[0] : '';
                const isUrl = typeof image === 'string' && /^(http|https):\/\//i.test(image);
                if (isUrl) {
                    return (
                        <img
                            src={image}
                            alt={row.name}
                            style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 6 }}
                            onError={(e) => { 
                                console.log('Image load error:', image);
                                e.currentTarget.style.visibility = 'hidden'; 
                            }}
                        />
                    );
                }
                return (
                    <Box sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: 'text.secondary',
                        px: 0.5,
                        textAlign: 'center',
                        overflow: 'hidden'
                    }}>
                        No Image
                    </Box>
                );
            }
        },
        {
            field: 'name',
            header: 'Tên',
            render: (row) => (
                <Typography fontWeight={700} noWrap title={row.name} sx={{ color: '#0b3f31' }}>
                    {row.name}
                </Typography>
            )
        },
        {
            field: 'category',
            header: 'Danh mục',
            render: (row) => getCategoryChip(row.category)
        },
        {
            field: 'size',
            header: 'Size/Khối lượng',
            render: (row) => (
                <Typography variant="body2" noWrap title={getSizeOrMassText(row)}>
                    {getSizeOrMassText(row)}
                </Typography>
            )
        },
        {
            field: 'price',
            header: 'Giá',
            render: (row) => (
                <Typography variant="body2" fontWeight={600}>
                    {getPriceText(row)}
                </Typography>
            )
        },
        {
            field: 'status',
            header: 'Trạng thái',
            render: (row) => (
                <Chip
                    label={row.status === 'ACTIVE' ? 'Còn hàng' : 'Hết hàng'}
                    variant="filled"
                    size="small"
                    sx={{
                        fontWeight: 600,
                        backgroundColor: row.status === 'ACTIVE' ? '#22c55e' : '#ef4444',
                        color: 'white'
                    }}
                />
            )
        },
        {
            field: 'actions',
            header: 'Thao Tác',
            align: 'center',
            render: (row) => (
                <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Xem chi tiết">
                        <IconButton
                            color="primary"
                            onClick={() => {
                                setSelected(row);
                                setShowDetail(true);
                            }}
                            sx={{ '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' } }}
                        >
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Cập nhật">
                        <IconButton
                            color="secondary"
                            onClick={() => {
                                setSelected(row);
                                setShowUpdate(true);
                            }}
                            sx={{ '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.1)' } }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ];

    const loadAccessories = async (type = activeType) => {
        setIsLoading(true);
        try {
            const response = await getAccessories(type);
            const data = response?.data?.data;
            
            const mapPots = (arr = []) => arr.map((item, idx) => {
                const totalQty = Array.isArray(item.size) ? item.size.reduce((sum, s) => sum + (Number(s.availableQty) || 0), 0) : 0;
                return {
                    id: `pots-${idx}-${item.name}`,
                    name: item.name,
                    image: Array.isArray(item.image) ? item.image.map(it => it?.url).filter(Boolean) : [],
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
                image: Array.isArray(item.image) ? item.image.map(it => it?.url).filter(Boolean) : [],
                category: 'decorations',
                status: (Number(item.availableQty) || 0) > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
                createdAt: null,
                updatedAt: null,
                raw: item,
            }));
            const mapSoils = (arr = []) => arr.map((item, idx) => ({
                id: `soils-${idx}-${item.name}`,
                name: item.name,
                image: Array.isArray(item.image) ? item.image.map(it => it?.url).filter(Boolean) : [],
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
        <Container maxWidth={DASHBOARD_STYLES.container.maxWidth} sx={DASHBOARD_STYLES.container}>
            <Paper elevation={0} sx={DASHBOARD_STYLES.paper}>
                <Box sx={DASHBOARD_STYLES.headerSection}>
                    <Box sx={DASHBOARD_STYLES.titleSection}>
                        <InventoryIcon sx={DASHBOARD_STYLES.titleIcon}/>
                        <Box>
                            <Typography sx={DASHBOARD_STYLES.mainTitle}>
                                Quản Lý Phụ Kiện
                            </Typography>
                            <Typography sx={DASHBOARD_STYLES.subtitle}>
                                Danh sách phụ kiện và thao tác tạo mới
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={DASHBOARD_STYLES.actionSection}>
                        <FormControl size="small" sx={DASHBOARD_STYLES.filterSelect}>
                            <InputLabel>Danh mục</InputLabel>
                            <Select
                                label="Danh mục"
                                value={activeType}
                                onChange={(e) => setActiveType(e.target.value)}
                            >
                                <MenuItem value="all">Tất cả</MenuItem>
                                <MenuItem value="pots">Chậu (pots)</MenuItem>
                                <MenuItem value="soils">Đất (soils)</MenuItem>
                                <MenuItem value="decorations">Trang trí (decorations)</MenuItem>
                            </Select>
                        </FormControl>

                        <ActionButton
                            startIcon={<AddIcon/>}
                            onClick={handleOpenCreate}
                            sx={DASHBOARD_STYLES.primaryButton}>
                            Tạo Phụ Kiện
                        </ActionButton>
                    </Box>
                </Box>
                

                {submitMessage.text && (
                    <Alert severity={submitMessage.type === 'success' ? 'success' : 'error'} sx={{mb: 3}}>
                        {submitMessage.text}
                    </Alert>
                )}

                <DataTable
                    data={accessories}
                    columns={columns}
                    loading={isLoading}
                    pagination={true}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalCount={accessories.length}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    headerBgColor={DASHBOARD_STYLES.table.headerBgColor}
                    headerTextColor={DASHBOARD_STYLES.table.headerTextColor}
                    hoverColor={DASHBOARD_STYLES.table.hoverColor}
                    borderColor={DASHBOARD_STYLES.table.borderColor}
                    emptyMessage="Không có phụ kiện"
                    stickyHeader={DASHBOARD_STYLES.table.stickyHeader}
                    size={DASHBOARD_STYLES.table.size}
                />
            </Paper>

            <CreateAccessoryDialog
                open={showCreate}
                onClose={handleCloseCreate}
                onCreate={handleCreateSuccess}
            />

            <CreateAccessoryDialog
                open={showUpdate}
                onClose={() => setShowUpdate(false)}
                onCreate={handleCreateSuccess}
                editItem={selected}
                isEdit={true}
            />

            <AccessoryDetail
                open={showDetail}
                onClose={() => setShowDetail(false)}
                item={selected}
            />
        </Container>
    );
}

 