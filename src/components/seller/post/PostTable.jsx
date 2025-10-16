import React from 'react';
import { IconButton, Tooltip, Typography, Chip, Stack } from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import DataTable from '../../common/DataTable.jsx';
import usePagination from '../../../hooks/usePagination.js';

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
                <Typography sx={{fontWeight: 600, color: 'primary.dark'}}>
                    #{row.id}
                </Typography>
            )
        },
        {
            field: 'title',
            header: 'Title',
            render: (row) => (
                <Typography sx={{fontWeight: 500}}>
                    {row.title}
                </Typography>
            )
        },
        {
            field: 'product',
            header: 'Product',
            render: (row) => (
                <Typography>
                    {row.product?.name || '-'}
                </Typography>
            )
        },
        {
            field: 'status',
            header: 'Status',
            render: (row) => (
                <Chip
                    label={statusLabels[row.status] || row.status}
                    color={statusColors[row.status] || 'default'}
                    size="small"
                />
            )
        },
        {
            field: 'tags',
            header: 'Tags',
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
            header: 'Created At',
            render: (row) => (
                <Typography>
                    {row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '-'}
                </Typography>
            )
        },
        {
            field: 'actions',
            header: 'Actions',
            align: 'center',
            render: (row) => (
                <Tooltip title="View Details">
                    <IconButton 
                        color="primary" 
                        onClick={() => onViewDetail(row)}
                        sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}
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
            headerBgColor="#1976D2"
            headerTextColor="white"
            hoverColor="rgba(25, 118, 210, 0.05)"
            borderColor="#e0e0e0"
            emptyMessage="No posts found"
            stickyHeader={false}
            size="medium"
        />
    );
};

export default PostTable;
