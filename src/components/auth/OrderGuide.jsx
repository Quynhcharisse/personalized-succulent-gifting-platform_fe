import React from 'react'
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    Typography
} from '@mui/material'
import {
    AccountCircle,
    CheckCircle,
    Circle,
    LocalShipping,
    MonetizationOn,
    Payment,
    Search,
    ShoppingCart
} from '@mui/icons-material'

export default function OrderGuide() {
    document.title = 'Hướng dẫn mua hàng | Lá Nhỏ Bên Thềm'

    const steps = [
       
        {
            label: 'Thêm sản phẩm vào giỏ hàng',
            icon: <ShoppingCart/>,
            color: '#ff9800',
            content: 'Khi đã tìm được sản phẩm mong muốn, vui lòng bấm vào hình hoặc tên sản phẩm để vào trang chi tiết, sau đó:',
            items: [
                'Chọn loại chậu mong muốn',
                'Chọn số lượng mong muốn',
                'Thêm sản phẩm vào giỏ hàng'
            ]
        },
        {
            label: 'Kiểm tra giỏ hàng và đặt hàng',
            icon: <CheckCircle/>,
            color: '#2196f3',
            content: 'Để đặt nhiều sản phẩm khác nhau vào cùng 1 đơn hàng, vui lòng:',
            items: [
                'Bấm vào logo để về trang chủ',
                'Tiếp tục thêm sản phẩm vào giỏ như Bước 2 (lặp lại đến khi đủ sản phẩm)'
            ],
            extraContent: 'Sau đó, trong trang giỏ hàng:',
            extraItems: [
                'Điều chỉnh số lượng và cập nhật giỏ hàng',
    
                'Bấm "Thanh toán" để bắt đầu đặt hàng'
            ]
        },
    ]

    return (
        <Box sx={{
            backgroundImage: "url('/header.jpg')",
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            minHeight: '100vh',
            width: '100%'
        }}>
            <Container maxWidth="lg" sx={{py: 4}}>
                {/* Header */}
                <Paper
                    elevation={0}
                    sx={{
                        backgroundColor: '#779977',
                        color: 'white',
                        p: 4,
                        mb: 4,
                        borderRadius: 3
                    }}
                >
                    <Typography variant="h3" component="h1" fontWeight="bold" textAlign="center" mb={2}
                                sx={{opacity: 0.9, color: '#F2E8D9'}}>
                        Hướng dẫn đặt hàng
                    </Typography>
                    <Typography variant="h6" textAlign="center" sx={{opacity: 0.9, color: '#F2E8D9'}}>
                        Quý khách có thể đặt hàng trực tuyến thông qua 5 bước cơ bản dưới đây
                    </Typography>
                </Paper>

                {/* Steps */}
                <Box mb={4}>
                    <Stepper orientation="vertical">
                        {steps.map((step, index) => (
                            <Step key={index} active={true}>
                                <StepLabel
                                    StepIconComponent={() => (
                                        <Box
                                            sx={{
                                                backgroundColor: step.color,
                                                color: 'white',
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}
                                        >
                                            {step.icon}
                                        </Box>
                                    )}
                                >
                                    <Typography variant="h6" fontWeight="bold" color={step.color}>
                                        {step.label}
                                    </Typography>
                                </StepLabel>
                                <StepContent>
                                    <Card elevation={2} sx={{ml: 2, mt: 1}}>
                                        <CardContent>
                                            <Typography variant="body1" paragraph>
                                                {step.content}
                                            </Typography>

                                            {step.items && (
                                                <List dense>
                                                    {step.items.map((item, itemIndex) => (
                                                        <ListItem key={itemIndex} sx={{py: 0.5}}>
                                                            <ListItemIcon sx={{minWidth: 32}}>
                                                                <Circle sx={{fontSize: 8, color: step.color}}/>
                                                            </ListItemIcon>
                                                            <ListItemText primary={item}/>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            )}

                                            {step.extraContent && (
                                                <>
                                                    <Typography variant="body1" paragraph sx={{mt: 2}}>
                                                        {step.extraContent}
                                                    </Typography>
                                                    <List dense>
                                                        {step.extraItems.map((item, itemIndex) => (
                                                            <ListItem key={itemIndex} sx={{py: 0.5}}>
                                                                <ListItemIcon sx={{minWidth: 32}}>
                                                                    <Circle sx={{fontSize: 8, color: step.color}}/>
                                                                </ListItemIcon>
                                                                <ListItemText primary={item}/>
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {/* Additional Information */}
                <Grid container spacing={3} sx={{alignItems: 'stretch'}}>
                    {/* Shipping Info */}
                    <Grid item xs={12} md={6} sx={{display: 'flex'}}>
                        <Card elevation={3} sx={{
                            width: '100vw',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <CardContent sx={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <LocalShipping sx={{color: '#4caf50', mr: 1, fontSize: 28}}/>
                                    <Typography variant="h5" fontWeight="bold" color="#4caf50">
                                        Giao hàng
                                    </Typography>
                                </Box>

                                <Box sx={{flexGrow: 1}}>
                                    <Typography variant="h6" fontWeight="600" mb={1} color="#666">
                                        1) Khu vực và thời gian giao hàng
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        Giao qua đơn vị vận chuyển GHN, thời gian dự kiến 2–3 ngày
                                        trong nội thành TP.HCM( 5 - 7 ngày ngoài nội thành TP.HCM.
                                        khi đặt hàng. )
                                    </Typography>

                                    <Divider sx={{my: 2}}/>

                                    <Typography variant="h6" fontWeight="600" mb={1} color="#666">
                                        2) Kiểm tra sản phẩm lúc nhận hàng
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        Khách hàng có thể kiểm tra sản phẩm lúc nhận hoặc sau khi nhận. Sản phẩm hư hỏng
                                        do
                                        vận chuyển sẽ được hoàn tiền 100%.
                                    </Typography>
                                </Box>

                                <Alert severity="info" sx={{mt: 2}}>
                                    <Typography variant="body2">
                                        Liên hệ Zalo <strong>0886 122578</strong> nếu có vấn đề liên quan đến đơn hàng
                                    </Typography>
                                </Alert>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Payment Info */}
                    <Grid item xs={12} md={6} sx={{display: 'flex'}}>
                        <Card elevation={3} sx={{
                            width: '100vw',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <CardContent sx={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <MonetizationOn sx={{color: '#ff9800', mr: 1, fontSize: 28}}/>
                                    <Typography variant="h5" fontWeight="bold" color="#ff9800">
                                        Hướng dẫn thanh toán
                                    </Typography>
                                </Box>

                                <Box sx={{flexGrow: 1}}>
                                    <Typography variant="body1" paragraph>
                                        Hỗ trợ giao hàng theo chính sách áp dụng.
                                    </Typography>

                                    <Box mt={3} mb={2}>
                                        <Chip
                                            label="Chuyển khoản ngân hàng"
                                            color="primary"
                                            variant="outlined"
                                            sx={{mb: 1}}
                                        />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}


