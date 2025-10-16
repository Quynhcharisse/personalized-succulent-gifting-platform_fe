import React from 'react';
import {Box, Button, Card, CardContent, CardMedia, Grid, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';

// Mock data for succulents
const succulents = [
    {
        id: 1,
        name: 'Sen Đá Kim Cương',
        image: '/senda.png',
        price: 120000,
        shortDesc: 'Sen đá với hình dáng độc đáo, dễ chăm sóc.'
    },
    {
        id: 2,
        name: 'Sen Đá Nâu',
        image: '/hinhKeSenda.jpg',
        price: 95000,
        shortDesc: 'Màu nâu lạ mắt, thích hợp trang trí bàn làm việc.'
    },
    {
        id: 3,
        name: 'Sen Đá Đô La',
        image: '/senda.png',
        price: 110000,
        shortDesc: 'Lá tròn, mọng nước, tượng trưng cho tài lộc.'
    }
];

export default function SucculentList() {
    const navigate = useNavigate();
    return (
        <Box sx={{p: 4}}>
            <Typography variant="h4" fontWeight={700} mb={3}>
                Danh sách Sen Đá
            </Typography>
            <Grid container spacing={3}>
                {succulents.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card sx={{borderRadius: 3, boxShadow: 2}}>
                            <CardMedia
                                component="img"
                                height="180"
                                image={item.image}
                                alt={item.name}
                                sx={{objectFit: 'cover'}}
                            />
                            <CardContent>
                                <Typography variant="h6" fontWeight={600}>{item.name}</Typography>
                                <Typography variant="body2" color="text.secondary" mb={1}>{item.shortDesc}</Typography>
                                <Typography variant="subtitle1" color="success.main" fontWeight={700}>
                                    {item.price.toLocaleString('vi-VN')} ₫
                                </Typography>
                                <Button
                                    variant="contained"
                                    sx={{mt: 2, borderRadius: 2}}
                                    onClick={() => navigate(`/buyer/succulent/${item.id}`)}
                                    fullWidth
                                >
                                    Xem chi tiết
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

