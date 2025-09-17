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
                        <TableCell>ID</TableCell>
                        <TableCell>Tên</TableCell>
                        <TableCell>Danh mục</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Updated At</TableCell>
                        <TableCell align="center">Thao Tác</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={9}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            </TableCell>
                        </TableRow>
                    ) : items && items.length > 0 ? (
                        items.map((acc) => (
                            <TableRow key={acc.id} hover sx={{
                                '&:nth-of-type(odd)': { backgroundColor: 'rgba(76, 175, 80, 0.02)' },
                                '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.05)' }
                            }}>
                                <TableCell sx={{fontWeight: 600, color: 'success.dark'}}>#{acc.id}</TableCell>
                                <TableCell sx={{fontWeight: 700, color: 'success.dark'}}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {acc.imageUrl && (
                                            <img src={acc.imageUrl} alt={acc.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                                        )}
                                        <Typography fontWeight={700}>{acc.name}</Typography>
                                    </Box>
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
                                <TableCell sx={{minWidth: 160}}>{acc.createdAt ? new Date(acc.createdAt).toLocaleString('vi-VN') : '-'}</TableCell>
                                <TableCell sx={{minWidth: 160}}>{acc.updatedAt ? new Date(acc.updatedAt).toLocaleString('vi-VN') : '-'}</TableCell>
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
                            <TableCell colSpan={7}>
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


