import React from 'react';
import {Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, Stack, Tooltip, IconButton} from '@mui/material';
import { Visibility as VisibilityIcon, Edit as EditIcon } from '@mui/icons-material';

export default function AccessoryTable({ items, isLoading, onViewDetail, onUpdate }) {
    return (
        <TableContainer component={Paper} sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
            border: '1px solid rgba(76, 175, 80, 0.1)'
        }}>
            <Table sx={{minWidth: 650}}>
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
                        <TableCell>Ảnh</TableCell>
                        <TableCell>Tên</TableCell>
                        <TableCell>Danh mục</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell align="center">Thao Tác</TableCell>
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
                                <TableCell>
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
                                <TableCell sx={{fontWeight: 700, color: 'success.dark'}}>
                                    <Typography fontWeight={700}>{acc.name}</Typography>
                                </TableCell>
                                <TableCell>{acc.category}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={acc.status}
                                        color={acc.status === 'ACTIVE' || acc.status === 'Còn hàng' ? 'success' : 'error'}
                                        variant="filled"
                                        size="small"
                                        sx={{fontWeight: 600}}
                                    />
                                </TableCell>
                                <TableCell align="center">
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


