import React from 'react';
import {Button} from '@mui/material';

export default function ButtonCancel({onClick}) {
    return (
        <Button
            onClick={onClick}
            variant='contained'
            color='error'
            sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
            }}
        >
            Hủy bỏ
        </Button>
    )
}
