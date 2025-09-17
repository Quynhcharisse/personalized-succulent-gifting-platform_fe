import React from 'react';
import {Chip, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, IconButton, Box} from '@mui/material';
import {Edit as EditIcon, Visibility as VisibilityIcon} from '@mui/icons-material';

const SucculentTable = ({succulentList, isLoading, onViewDetail, onUpdate}) => {
    if (isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', py: 8}}>
                <CircularProgress color="success" size={60}/>
            </Box>
        );
    }

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
                        <TableCell>Tên Sản Phẩm</TableCell>
                        <TableCell>Kích Thước</TableCell>
                        <TableCell>Ngày tạo</TableCell>
                        <TableCell>Ngày cập nhật</TableCell>
                        <TableCell>Trạng Thái</TableCell>
                        <TableCell align="center">Thao Tác</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.isArray(succulentList) && succulentList.map((succulent) => (
                        <TableRow
                            key={succulent.id}
                            sx={{
                                '&:nth-of-type(odd)': {
                                    backgroundColor: 'rgba(76, 175, 80, 0.02)'
                                },
                                '&:hover': {
                                    backgroundColor: 'rgba(76, 175, 80, 0.05)'
                                }
                            }}
                        >
                            <TableCell sx={{fontWeight: 600, color: 'success.dark'}}>
                                #{succulent.id}
                            </TableCell>
                            <TableCell sx={{fontWeight: 700, color: 'success.dark'}}>
                                {succulent.speciesName}
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={succulent.size}
                                    color="info"
                                    variant="outlined"
                                    size="small"
                                    sx={{fontWeight: 600}}
                                />
                            </TableCell>
                            <TableCell sx={{minWidth: 160}}>
                                {succulent.createdAt ? new Date(succulent.createdAt).toLocaleString('vi-VN') : '-'}
                            </TableCell>
                            <TableCell sx={{minWidth: 160}}>
                                {succulent.updatedAt ? new Date(succulent.updatedAt).toLocaleString('vi-VN') : '-'}
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={succulent.status}
                                    color={succulent.status === 'ACTIVE' || succulent.status === 'Còn hàng' ? 'success' : 'error'}
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
                                            onClick={() => onViewDetail(succulent)}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: 'rgba(76, 175, 80, 0.1)'
                                                }
                                            }}
                                        >
                                            <VisibilityIcon/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Cập nhật">
                                        <IconButton
                                            color="secondary"
                                            onClick={() => onUpdate(succulent)}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: 'rgba(156, 39, 176, 0.1)'
                                                }
                                            }}
                                        >
                                            <EditIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                    {Array.isArray(succulentList) && succulentList.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} align="center" sx={{py: 4}}>
                                <Typography variant="body1" color="text.secondary">
                                    Không có sản phẩm nào
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SucculentTable;


