import React from 'react';
import {Chip, Avatar, Box, Typography, IconButton} from '@mui/material';
import {Visibility as VisibilityIcon} from '@mui/icons-material';
import DataTable from '../../common/DataTable.jsx';
import {COLORS, FENGSHUI, ZODIACS} from '../../constants.js';

export default function CustomRequestTable({
    data = [],
    loading = false,
    error = null,
    page,
    rowsPerPage,
    totalCount,
    onPageChange,
    onRowsPerPageChange,
    onViewDetail
}) {
    const getFengShuiLabel = (value) => {
        const item = FENGSHUI.find(f => f.value === value);
        return item ? item.label : value;
    };

    const getZodiacLabel = (value) => {
        const item = ZODIACS.find(z => z.value === value);
        return item ? item.label : value;
    };

    const columns = [
        {header: 'ID', field: 'id', align: 'left'},
        {
            header: 'Khách hàng',
            field: 'buyer',
            render: (row) => (
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                    <Avatar src={row.buyer?.avatarUrl || ''} sx={{width: 32, height: 32}}>
                        {(row.buyer?.name || '?').charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                            {row.buyer?.name || '—'}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            header: 'Liên hệ',
            field: 'contact',
            render: (row) => (
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                    <Typography variant="body2">{row.buyer?.address || '—'}</Typography>
                </Box>
            )
        },
        {
            header: 'Phong thủy / Cung',
            field: 'meta',
            render: (row) => (
                <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                    {row.buyer?.fengShui && (
                        <Chip size="small" label={`Mệnh: ${getFengShuiLabel(row.buyer.fengShui)}`} sx={{borderColor: COLORS.primary, color: COLORS.primary}} variant="outlined"/>
                    )}
                    {row.buyer?.zodiac && (
                        <Chip size="small" label={getZodiacLabel(row.buyer.zodiac)} sx={{borderColor: COLORS.info, color: COLORS.info}} variant="outlined"/>
                    )}
                </Box>
            )
        },
        {
            header: 'Trạng thái',
            field: 'status',
            render: (row) => (
                <Chip
                    label={row.status}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        backgroundColor:
                            row.status?.includes('duyệt') ? COLORS.success : row.status?.includes('từ chối') ? COLORS.error : COLORS.warning,
                        color: 'white'
                    }}
                />
            )
        },
        {
            header: 'Ngày tạo',
            field: 'createdAt',
            render: (row) => new Date(row.createdAt).toLocaleString('vi-VN')
        },
        {
            header: 'Hành động',
            field: 'action',
            align: 'center',
            render: (row) => (
                <IconButton
                    color="primary"
                    onClick={() => onViewDetail?.(row)}
                    sx={{
                        '&:hover': {
                            backgroundColor: 'rgba(11, 63, 49, 0.1)'
                        }
                    }}
                >
                    <VisibilityIcon/>
                </IconButton>
            )
        }
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            loading={loading}
            error={error}
            pagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            headerBgColor={COLORS.primary}
            headerTextColor={'white'}
            hoverColor={'#f8f9fa'}
            borderColor={'#e0e0e0'}
            emptyMessage="Không có yêu cầu nào"
            stickyHeader={false}
            size={'medium'}
        />
    );
}
