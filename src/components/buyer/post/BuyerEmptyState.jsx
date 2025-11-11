import React from 'react';
import { Card, CardContent, Typography, Stack, Button } from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const BuyerEmptyState = ({ onRefresh }) => (
    <Card sx={{ borderRadius: 3, boxShadow: 2, textAlign: 'center', py: 6 }}>
        <CardContent>
            <Stack alignItems="center" spacing={2}>
                <SentimentDissatisfiedIcon fontSize="large" color="disabled" />
                <Typography variant="h6" sx={{ color: 'black', fontWeight: 'bold' }}>Chưa có bài đăng</Typography>
                <Typography variant="body2" color="text.secondary">
                    Hiện chưa có bài đăng nào từ người bán.
                </Typography>
                <Button variant="contained" onClick={onRefresh}>Tải lại</Button>
            </Stack>
        </CardContent>
    </Card>
);

export default BuyerEmptyState;
