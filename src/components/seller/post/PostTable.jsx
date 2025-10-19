import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, CircularProgress, Box, Typography, Chip, Stack } from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import DataTable from '../../common/DataTable.jsx';
import usePagination from '../../../hooks/usePagination.js';
import { DASHBOARD_STYLES } from '../../constants.js';

const statusLabels = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived'
};

const statusColors = {
    DRAFT: 'default',
    PUBLISHED: 'success',
    ARCHIVED: 'warning'
};

const PostTable = ({ postList, isLoading, onViewDetail }) => {
    // Pagination hook
    const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination(0, 10);

    // Column configuration for DataTable
    const columns = [
        {
            field: 'id',
            header: 'ID',
            render: (row) => (
                <Typography sx={{fontWeight: 600, color: '#0b3f31'}}>
                    #{row.id}
                </Typography>
            )
        },
        {
            field: 'title',
            header: 'Tiêu Đề',
            render: (row) => (
                <Typography sx={{fontWeight: 500, color: '#0b3f31'}}>
                    {row.title}
                </Typography>
            )
        },
        {
            field: 'product',
            header: 'Sản Phẩm',
            render: (row) => (
                <Typography>
                    {row.product?.name || '-'}
                </Typography>
            )
        },
        {
            field: 'status',
            header: 'Trạng Thái',
            render: (row) => (
                <Chip
                    label={statusLabels[row.status] || row.status}
                    sx={{
                        fontWeight: 600,
                        backgroundColor: row.status === 'PUBLISHED' ? '#22c55e' :
                                       row.status === 'DRAFT' ? '#f59e0b' : '#ef4444',
                        color: 'white'
                    }}
                    size="small"
                />
            )
        },
        {
            field: 'tags',
            header: 'Thẻ',
            render: (row) => (
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {Array.isArray(row.tags) && row.tags.length > 0
                        ? row.tags.map((tag, idx) => (
                            <Chip key={idx} label={tag} size="small" variant="outlined" />
                        ))
                        : <Typography variant="caption" color="text.secondary">-</Typography>
                    }
                </Stack>
            )
        },
        {
            field: 'createdAt',
            header: 'Ngày Tạo',
            render: (row) => (
                <Typography>
                    {row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '-'}
                </Typography>
            )
        },
        {
            field: 'actions',
            header: 'Thao Tác',
            align: 'center',
            render: (row) => (
                <Tooltip title="Xem Chi Tiết">
                    <IconButton
                        onClick={() => onViewDetail(row)}
                        sx={{
                            color: '#0b3f31',
                            '&:hover': {
                                backgroundColor: 'rgba(11, 63, 49, 0.1)',
                                transform: 'scale(1.1)'
                            }
                        }}
                    >
                        <VisibilityIcon />
                    </IconButton>
                </Tooltip>
            )
        }
    ];

    return (
        <DataTable
            data={postList || []}
            columns={columns}
            loading={isLoading}
            pagination={true}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={postList?.length || 0}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            headerBgColor={DASHBOARD_STYLES.table.headerBgColor}
            headerTextColor={DASHBOARD_STYLES.table.headerTextColor}
            hoverColor={DASHBOARD_STYLES.table.hoverColor}
            borderColor={DASHBOARD_STYLES.table.borderColor}
            emptyMessage="Không tìm thấy bài viết nào"
            stickyHeader={DASHBOARD_STYLES.table.stickyHeader}
            size={DASHBOARD_STYLES.table.size}
        />
    );
};

export default PostTable;
