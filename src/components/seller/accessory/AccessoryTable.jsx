import React from 'react';
import {Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, Stack, Tooltip, IconButton} from '@mui/material';
import { Visibility as VisibilityIcon, Edit as EditIcon } from '@mui/icons-material';

export default function AccessoryTable({ items, isLoading, onViewDetail, onUpdate }) {
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
            pots: { label: 'CHẬU', color: 'success' },
            soils: { label: 'ĐẤT', color: 'warning' },
            decorations: { label: 'TRANG TRÍ', color: 'info' }
        };
        const cfg = map[category] || { label: String(category || '').toUpperCase(), color: 'default' };
        return (
            <Chip
                label={cfg.label}
                color={cfg.color}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 800, letterSpacing: 0.3 }}
            />
        );
    };

    return (
        <TableContainer component={Paper} sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
            border: '1px solid rgba(76, 175, 80, 0.1)'
        }}>
            <Table
                size="small"
                sx={{
                    minWidth: 650,
                    tableLayout: 'fixed',
                    '& .MuiTableCell-root': {
                        py: 1.25,
                        px: 2
                    }
                }}
            >
                <TableHead>
                    <TableRow sx={{
                        background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
                        '& .MuiTableCell-head': {
                            color: 'white',
                            fontWeight: 800,
                            fontSize: '1rem',
                            borderBottom: 'none'
                        }
                    }}>     
                        <TableCell sx={{width: '10%'}}>Ảnh</TableCell>
                        <TableCell sx={{width: '20%'}}>Tên</TableCell>
                        <TableCell sx={{width: '15%'}}>Danh mục</TableCell>
                        <TableCell sx={{width: '15%'}}>Size/Khối lượng</TableCell>
                        <TableCell sx={{width: '15%'}}>Giá</TableCell>
                        <TableCell sx={{width: '15%'}}>Trạng thái</TableCell>
                        <TableCell sx={{width: '10%'}} align="center">Thao Tác</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={5}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            </TableCell>
                        </TableRow>
                    ) : items && items.length > 0 ? (
                        items.map((acc, i) => (
                            <TableRow key={acc.id || `${acc.category}-${acc.name}-${i}`} hover sx={{
                                '&:nth-of-type(odd)': { backgroundColor: 'rgba(76, 175, 80, 0.02)' },
                                '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.05)' }
                            }}>
                                <TableCell sx={{width: 96}}>
                                    {(() => {
                                        const val = acc.imageUrl || (Array.isArray(acc.images) && acc.images[0]);
                                        const isUrl = typeof val === 'string' && /^(http|https):\/\//i.test(val);
                                        if (isUrl) {
                                            return (
                                                <img
                                                    src={val}
                                                    alt={acc.name}
                                                    style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 6 }}
                                                    onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
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
                                                {typeof val === 'string' ? val : ''}
                                            </Box>
                                        );
                                    })()}
                                </TableCell>
                                <TableCell sx={{width: '25%', fontWeight: 700, color: 'success.dark'}}>
                                    <Typography fontWeight={700} noWrap title={acc.name}>{acc.name}</Typography>
                                </TableCell>
                                <TableCell sx={{width: '15%'}}>
                                    {getCategoryChip(acc.category)}
                                </TableCell>
                                <TableCell sx={{width: '25%'}}>
                                    <Typography variant="body2" noWrap title={getSizeOrMassText(acc)}>
                                        {getSizeOrMassText(acc)}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{width: '15%'}}>
                                    <Typography variant="body2" fontWeight={600}>{getPriceText(acc)}</Typography>
                                </TableCell>
                                <TableCell sx={{width: '10%'}}>
                                    <Chip
                                        label={acc.status}
                                        color={acc.status === 'ACTIVE' || acc.status === 'Còn hàng' ? 'success' : 'error'}
                                        variant="filled"
                                        size="small"
                                        sx={{fontWeight: 600}}
                                    />
                                </TableCell>
                                <TableCell sx={{width: 120}} align="center">
                                    <Stack direction="row" spacing={1} justifyContent="center">
                                        <Tooltip title="Xem chi tiết">
                                            <IconButton
                                                color="primary"
                                                onClick={() => onViewDetail && onViewDetail(acc)}
                                                sx={{ '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' } }}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Cập nhật">
                                            <IconButton
                                                color="secondary"
                                                onClick={() => onUpdate && onUpdate(acc)}
                                                sx={{ '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.1)' } }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5}>
                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">Không có phụ kiện</Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}


