import React, {useEffect, useState} from 'react';
import {Box, Button, Container, Paper, Typography} from '@mui/material';
import {Build as BuildIcon} from '@mui/icons-material';
import CustomRequestTable from './CustomRequestTable.jsx';
import CustomRequestDetailDialog from './CustomRequestDetailDialog.jsx';
import ProcessRequestDialog from './ProcessRequestDialog.jsx';
import {viewRequestBySeller} from '@/services/CustomeRequestService.jsx';
import usePagination from '../../../hooks/usePagination.js';
import {DASHBOARD_STYLES} from '../../constants.js';

export default function CustomRequestList() {
    const {page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, resetPagination} = usePagination(0, 10);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [processDialogOpen, setProcessDialogOpen] = useState(false);

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

    if (error) {
        return (
            <Box sx={{p: 3}}>
                <Typography color="error" sx={{mb: 2}}>{error}</Typography>
                <Button variant="contained" onClick={loadData}>Thử lại</Button>
            </Box>
        );
    }

    return (
        <Container sx={DASHBOARD_STYLES.container}>
            <Paper sx={DASHBOARD_STYLES.paper}>
                <Box sx={DASHBOARD_STYLES.headerSection}>
                    <Box sx={DASHBOARD_STYLES.titleSection}>
                        <BuildIcon sx={DASHBOARD_STYLES.titleIcon}/>
                        <Box>
                            <Typography sx={DASHBOARD_STYLES.mainTitle}>
                                Quản Lý Yêu Cầu Tùy Chỉnh
                            </Typography>
                            <Typography sx={DASHBOARD_STYLES.subtitle}>
                                Quản lý các yêu cầu đặt hàng tùy chỉnh từ khách hàng
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        color='warning'
                        onClick={() => {
                            resetPagination();
                            loadData();
                        }}
                        sx={{
                            fontWeight: 600,
                            borderColor: DASHBOARD_STYLES.table.headerBgColor
                        }}
                    >
                        Tải lại
                    </Button>
                </Box>

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
                onSuccess={() => {
                    handleCloseDetailDialog();
                    loadData();
                }}
            />

            <ProcessRequestDialog
                open={processDialogOpen}
                onClose={() => setProcessDialogOpen(false)}
                requestId={selectedRequestId}
                onSuccess={() => {
                    setProcessDialogOpen(false);
                    loadData();
                }}
            />
        </Container>
    );
}
