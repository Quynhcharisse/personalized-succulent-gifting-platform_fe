import React from 'react';
import {Chip, Stack, Tooltip, Typography, IconButton, Avatar, Box} from '@mui/material';
import {Edit as EditIcon, Visibility as VisibilityIcon} from '@mui/icons-material';
import DataTable from '../../common/DataTable.jsx';
import usePagination from '../../../hooks/usePagination.js';
import { DASHBOARD_STYLES } from '../../constants.js';

const SucculentTable = ({succulentList, isLoading, onViewDetail, onUpdate}) => {
    // Pagination hook
    const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination(0, 10);

    const renderSizeChips = (succulent) => {
        let labels = [];
        
        // Handle size object (from API response)
        if (succulent?.size && typeof succulent.size === 'object') {
            labels = Object.keys(succulent.size);
        } 
        // Handle sizeList array (from form data)
        else if (Array.isArray(succulent?.sizeList)) {
            labels = succulent.sizeList.map((s) => (s.sizeName || s.name || s).toString());
        } 
        // Handle size array (fallback)
        else if (Array.isArray(succulent?.size)) {
            labels = succulent.size.map((s) => (s.sizeName || s.name || s).toString());
        } 
        // Handle size string (fallback)
        else if (typeof succulent?.size === 'string') {
            labels = [succulent.size];
        }

        if (labels.length === 0) return null;
        return (
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {labels.map((label) => (
                    <Chip
                        key={label}
                        label={String(label).toUpperCase()}
                        color="info"
                        variant="outlined"
                        size="small"
                        sx={{fontWeight: 600}}
                    />
                ))}
            </Stack>
        );
    };

    // Column configuration for DataTable
    const columns = [
        {
            field: 'image',
            header: 'Hình ảnh',
            width: 80,
            align: 'center',
            render: (row) => (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {row.imageUrl ? (
                        <Avatar
                            src={row.imageUrl}
                            alt={row.speciesName}
                            sx={{
                                width: 50,
                                height: 50,
                                border: '2px solid rgba(11, 63, 49, 0.2)',
                                borderRadius: '12px', 
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <Avatar
                            sx={{
                                width: 50,
                                height: 50,
                                backgroundColor: 'rgba(11, 63, 49, 0.1)',
                                border: '2px dashed rgba(11, 63, 49, 0.3)'
                            }}
                        >
                            🌱
                        </Avatar>
                    )}
                </Box>
            )
        },
        {
            field: 'speciesName',
            header: 'Tên Sản Phẩm',
            render: (row) => (
                <Typography sx={{fontWeight: 700, color: '#0b3f31'}}>
                    {row.speciesName}
                </Typography>
            )
        },
        {
            field: 'size',
            header: 'Kích Thước',
            render: (row) => renderSizeChips(row)
        },
        {
            field: 'createdAt',
            header: 'Ngày tạo',
            render: (row) => (
                <Typography sx={{minWidth: 160}}>
                    {row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '-'}
                </Typography>
            )
        },
        {
            field: 'updatedAt',
            header: 'Ngày cập nhật',
            render: (row) => (
                <Typography sx={{minWidth: 160}}>
                    {row.updatedAt ? new Date(row.updatedAt).toLocaleString('vi-VN') : '-'}
                </Typography>
            )
        },
        {
            field: 'status',
            header: 'Trạng Thái',
            render: (row) => {
                let totalQuantity = 0;
                if (row?.size && typeof row.size === 'object') {
                    totalQuantity = Object.values(row.size).reduce((sum, sizeInfo) => {
                        return sum + (sizeInfo?.quantity || 0);
                    }, 0);
                } else if (row?.quantity) {
                    totalQuantity = row.quantity;
                }
                
                const isInStock = totalQuantity > 0;
                const statusText = isInStock ? 'Đang còn hàng' : 'Hết hàng';
                
                return (
                    <Chip
                        label={statusText}
                        variant="filled"
                        size="small"
                        sx={{
                            fontWeight: 600,
                            backgroundColor: isInStock ? '#22c55e' : '#ef4444',
                            color: 'white'
                        }}
                    />
                );
            }
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
                            onClick={() => onViewDetail(row)}
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
                            onClick={() => onUpdate(row)}
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
            )
        }
    ];

    return (
        <DataTable
            data={succulentList || []}
            columns={columns}
            loading={isLoading}
            pagination={true}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={succulentList?.length || 0}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            headerBgColor={DASHBOARD_STYLES.table.headerBgColor}
            headerTextColor={DASHBOARD_STYLES.table.headerTextColor}
            hoverColor={DASHBOARD_STYLES.table.hoverColor}
            borderColor={DASHBOARD_STYLES.table.borderColor}
            emptyMessage="Không có sản phẩm nào"
            stickyHeader={DASHBOARD_STYLES.table.stickyHeader}
            size={DASHBOARD_STYLES.table.size}
        />
    );
};

export default SucculentTable;


