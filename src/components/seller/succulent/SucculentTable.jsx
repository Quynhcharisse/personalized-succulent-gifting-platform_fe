import React from 'react';
import {Chip, Stack, Tooltip, Typography, IconButton} from '@mui/material';
import {Edit as EditIcon, Visibility as VisibilityIcon} from '@mui/icons-material';
import DataTable from '../../common/DataTable.jsx';
import usePagination from '../../../hooks/usePagination.js';
import { DASHBOARD_STYLES } from '../../constants.js';

const SucculentTable = ({succulentList, isLoading, onViewDetail, onUpdate}) => {
    // Pagination hook
    const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination(0, 10);

    const renderSizeChips = (succulent) => {
        let labels = [];
        if (Array.isArray(succulent?.sizeList)) {
            labels = succulent.sizeList.map((s) => (s.sizeName || s.name || s).toString());
        } else if (Array.isArray(succulent?.size)) {
            labels = succulent.size.map((s) => (s.sizeName || s.name || s).toString());
        } else if (succulent?.size && typeof succulent.size === 'object') {
            labels = Object.keys(succulent.size);
        } else if (typeof succulent?.size === 'string') {
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
            field: 'id',
            header: 'ID',
            render: (row) => (
                <Typography sx={{fontWeight: 600, color: '#0b3f31'}}>
                    #{row.id}
                </Typography>
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
            render: (row) => (
                <Chip
                    label={row.status === 'ACTIVE' || row.status === 'AVAILABLE' ? 'Còn hàng' : 'Hết hàng'}
                    variant="filled"
                    size="small"
                    sx={{
                        fontWeight: 600,
                        backgroundColor: (row.status === 'ACTIVE' || row.status === 'AVAILABLE') ? '#22c55e' : '#ef4444',
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


