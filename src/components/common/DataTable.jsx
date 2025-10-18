import React from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    CircularProgress,
    Box
} from '@mui/material';

const DataTable = ({
    // Data props
    data = [],
    columns = [],
    
    // Loading & Error states
    loading = false,
    error = null,
    
    // Pagination props
    pagination = true,
    page = 0,
    rowsPerPage = 10,
    totalCount = 0,
    onPageChange,
    onRowsPerPageChange,
    rowsPerPageOptions = [5, 10, 25, 50],
    
    // Styling props
    headerBgColor = '#4CAF50',
    headerTextColor = 'white',
    hoverColor = '#f8f9fa',
    borderColor = '#e0e0e0',
    
    // Custom render props
    renderRow = null,
    emptyMessage = 'Không có dữ liệu',
    
    // Table props
    stickyHeader = false,
    size = 'medium'
}) => {
    // Default row renderer
    const defaultRenderRow = (row, index) => (
        <TableRow 
            key={row.id || index}
            hover
            sx={{
                '&:hover': {
                    backgroundColor: hoverColor
                },
                '& td': {
                    padding: '16px 12px',
                    borderBottom: `1px solid ${borderColor}`
                }
            }}
        >
            {columns.map((column, colIndex) => (
                <TableCell key={colIndex} align={column.align || 'left'}>
                    {column.render ? column.render(row, index) : row[column.field]}
                </TableCell>
            ))}
        </TableRow>
    );

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px'}}>
                <CircularProgress size={60}/>
                <Typography variant="h6" sx={{ml: 2}}>
                    Đang tải dữ liệu...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{p: 3, textAlign: 'center'}}>
                <Typography variant="body1" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Paper sx={{borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
            <TableContainer>
                <Table stickyHeader={stickyHeader} size={size}>
                    {/* Table Header */}
                    <TableHead sx={{backgroundColor: headerBgColor}}>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableCell
                                    key={index}
                                    align={column.align || 'left'}
                                    sx={{
                                        fontWeight: 700,
                                        color: headerTextColor,
                                        textTransform: 'uppercase',
                                        fontSize: '0.875rem',
                                        letterSpacing: '0.5px',
                                        padding: '16px 12px',
                                        cursor: column.sortable ? 'pointer' : 'default',
                                        '&:hover': column.sortable ? {
                                            backgroundColor: 'rgba(255,255,255,0.1)'
                                        } : {}
                                    }}
                                    onClick={column.sortable ? () => column.onSort && column.onSort(column.field) : undefined}
                                >
                                    {column.header}
                                    {column.sortable && column.sortIcon && (
                                        <span style={{marginLeft: 8}}>
                                            {column.sortIcon}
                                        </span>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    {/* Table Body */}
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} sx={{textAlign: 'center', py: 4}}>
                                    <Typography variant="body1" color="text.secondary">
                                        {emptyMessage}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, index) => 
                                renderRow ? renderRow(row, index) : defaultRenderRow(row, index)
                            )
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            {pagination && (
                <TablePagination
                    rowsPerPageOptions={rowsPerPageOptions}
                    component="div"
                    count={totalCount || data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={onPageChange}
                    onRowsPerPageChange={onRowsPerPageChange}
                    labelRowsPerPage="Số dòng mỗi trang:"
                    labelDisplayedRows={({from, to, count}) =>
                        `${from}-${to} của ${count !== -1 ? count : `nhiều hơn ${to}`}`
                    }
                />
            )}
        </Paper>
    );
};

export default DataTable;
