import React, {useState} from 'react';
import {Box, Button, Chip, Divider, Paper, Stack, Typography} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';

const allAccessories = [
    'Chậu sứ trắng',
    'Chậu đất nung',
    'Chậu nhựa',
    'Đá màu',
    'Sỏi trắng',
    'Nơ đỏ',
    'Nơ xanh',
    'Sticker dễ thương',
    'Dây ruy băng',
];

export default function PotAccessoryDesigner() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [selected, setSelected] = useState([]);

    const handleToggle = (item) => {
        setSelected(sel => sel.includes(item) ? sel.filter(i => i !== item) : [...sel, item]);
    };

    const handleSave = () => {
        localStorage.setItem(`succulent-design-${id}`, JSON.stringify(selected));
        navigate(`/buyer/succulent/${id}`);
    };

    return (
        <Box sx={{p: 4, maxWidth: 700, mx: 'auto'}}>
            <Typography variant="h5" fontWeight={700} mb={2}>
                Thiết kế phụ kiện cho chậu sen đá #{id}
            </Typography>
            <Paper sx={{p: 3, mb: 3, borderRadius: 3}}>
                <Typography variant="subtitle1" mb={1}>Chọn phụ kiện:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {allAccessories.map(acc => (
                        <Chip
                            key={acc}
                            label={acc}
                            color={selected.includes(acc) ? 'success' : 'default'}
                            variant={selected.includes(acc) ? 'filled' : 'outlined'}
                            onClick={() => handleToggle(acc)}
                            sx={{mb: 1, cursor: 'pointer'}}
                        />
                    ))}
                </Stack>
            </Paper>
            <Divider sx={{mb: 2}}/>
            <Typography variant="subtitle1" mb={1}>Phụ kiện đã chọn:</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>
                {selected.length === 0 ? <Typography color="text.secondary">Chưa chọn phụ kiện nào.</Typography> :
                    selected.map(acc => (
                        <Chip key={acc} label={acc} color="success"/>
                    ))}
            </Stack>
            <Button
                variant="contained"
                sx={{borderRadius: 2, mr: 2}}
                onClick={handleSave}
            >
                Lưu thiết kế
            </Button>
            <Button
                variant="outlined"
                sx={{borderRadius: 2}}
                onClick={() => navigate(`/buyer/succulent/${id}`)}
            >
                Quay lại chi tiết sản phẩm
            </Button>
        </Box>
    );
}
