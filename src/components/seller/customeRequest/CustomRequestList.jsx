import React, {useEffect, useState} from 'react';
import {Box, Button, Paper, Typography} from '@mui/material';
import CustomRequestTable from './CustomRequestTable.jsx';
import {viewRequestBySeller} from '../../../services/CustomeRequestService.jsx';
import usePagination from '../../../hooks/usePagination.js';

export default function CustomRequestList() {
    const {page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, resetPagination} = usePagination(0, 10);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            // If backend supports pagination: pass page + size
            const res = await viewRequestBySeller({page, size: rowsPerPage});
            const payload = res?.data?.data || [];
            setRows(payload);
            // If API returns total, use it. Otherwise, fallback to array length
            setTotal(res?.data?.total || payload.length);
        } catch (e) {
            setError('Không thể tải danh sách yêu cầu');
        } finally {
            setLoading(false);
        }
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
                />
            </Paper>
        </Box>
    );
}
