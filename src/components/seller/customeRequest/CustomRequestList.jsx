import React, {useEffect, useState} from 'react';
import {Box, Button, Paper, Typography} from '@mui/material';
import CustomRequestTable from './CustomRequestTable.jsx';
import CustomRequestDetailDialog from './CustomRequestDetailDialog.jsx';
import {viewRequestBySeller} from '../../../services/CustomeRequestService.jsx';
import usePagination from '../../../hooks/usePagination.js';

export default function CustomRequestList() {
    const {page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, resetPagination} = usePagination(0, 10);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await viewRequestBySeller({page, size: rowsPerPage});
            // Handle nested data structure: response.data.data.body.data
            const payload = res?.data?.data?.body?.data || res?.data?.body?.data || res?.data?.data || [];
            setRows(payload);
            // If API returns total, use it. Otherwise, fallback to array length
            setTotal(res?.data?.data?.body?.total || res?.data?.body?.total || res?.data?.total || payload.length);
        } catch (e) {
            setError('Không thể tải danh sách yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (row) => {
        setSelectedRequestId(row.id);
        setDetailDialogOpen(true);
    };

    const handleCloseDetailDialog = () => {
        setDetailDialogOpen(false);
        setSelectedRequestId(null);
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage]);

    return (
        <Box sx={{p: 3}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                <Typography variant="h5" sx={{fontWeight: 700}}>Yêu cầu đặt hàng tùy chỉnh</Typography>
                <Button variant="outlined" onClick={() => { resetPagination(); loadData(); }}>Tải lại</Button>
            </Box>
            <Paper sx={{p: 2}}>
                <CustomRequestTable
                    data={rows}
                    loading={loading}
                    error={error}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalCount={total}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onViewDetail={handleViewDetail}
                />
            </Paper>

            <CustomRequestDetailDialog
                open={detailDialogOpen}
                onClose={handleCloseDetailDialog}
                requestId={selectedRequestId}
            />
        </Box>
    );
}
