import { useState } from 'react';

const usePagination = (initialPage = 0, initialRowsPerPage = 10) => {
    const [page, setPage] = useState(initialPage);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when changing rows per page
    };

    const resetPagination = () => {
        setPage(0);
    };

    return {
        page,
        rowsPerPage,
        handleChangePage,
        handleChangeRowsPerPage,
        resetPagination
    };
};

export default usePagination;
