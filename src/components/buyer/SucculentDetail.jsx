import React, {useEffect, useState} from 'react';
import {
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Divider,
    Link,
    List,
    ListItem,
    ListItemText,
    Paper,
    Rating,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';

// Mock data (should match SucculentList)
const succulents = [
    {
        id: 1,
        name: 'Sen Đá Kim Cương',
        image: '/senda.png',
        price: 120000,
        desc: 'Sen đá Kim Cương có hình dáng độc đáo, lá mọng nước, dễ chăm sóc, thích hợp làm quà tặng.',
        accessories: ['Chậu sứ trắng', 'Đá màu', 'Nơ đỏ'],
        detail: 'Sen đá Kim Cương là loại cây cảnh mini được yêu thích nhờ hình dáng độc đáo, dễ chăm sóc, phù hợp trang trí bàn làm việc, phòng khách, làm quà tặng ý nghĩa.',
        contact: 'Liên hệ: 0888.736.788 (Shop Sen Đá Hà Nội)'
    },
    {
        id: 2,
        name: 'Sen Đá Nâu',
        image: '/hinhKeSenda.jpg',
        price: 95000,
        desc: 'Sen đá Nâu với màu sắc lạ mắt, tượng trưng cho sự bền bỉ, thích hợp trang trí bàn làm việc.',
        accessories: ['Chậu đất nung', 'Sỏi trắng'],
        detail: 'Sen đá Nâu có màu sắc lạ mắt, tượng trưng cho sự bền bỉ, thích hợp trang trí bàn làm việc, phòng học.',
        contact: 'Liên hệ: 0888.736.788 (Shop Sen Đá Hà Nội)'
    },
    {
        id: 3,
        name: 'Sen Đá Đô La',
        image: '/senda.png',
        price: 110000,
        desc: 'Sen đá Đô La có lá tròn, mọng nước, tượng trưng cho tài lộc và may mắn.',
        accessories: ['Chậu nhựa', 'Đá màu', 'Nơ xanh'],
        detail: 'Sen đá Đô La có lá tròn, mọng nước, tượng trưng cho tài lộc và may mắn, phù hợp làm quà tặng.',
        contact: 'Liên hệ: 0888.736.788 (Shop Sen Đá Hà Nội)'
    }
];

const shopInfo = [
    'Shop cây cảnh 1: 188 Trung Kính, Cầu Giấy, Hà Nội',
    'Shop cây cảnh 2: 628 Hoàng Hoa Thám, Tây Hồ, Hà Nội',
    'Shop cây cảnh 3: 583 Hoàng Hoa Thám, Ba Đình, Hà Nội',
    'Shop cây cảnh 4: 616 Hoàng Hoa Thám, Tây Hồ, Hà Nội',
    'Shop cây cảnh 5: 06 đường Lê Văn Lương, Thanh Xuân, Hà Nội',
];

const mockReviews = [
    {name: 'Nguyễn Văn A', rating: 5, comment: 'Cây rất đẹp, giao hàng nhanh!', date: '2025-09-10'},
    {name: 'Trần Thị B', rating: 4, comment: 'Chất lượng tốt, sẽ ủng hộ tiếp.', date: '2025-09-12'},
];

export default function SucculentDetail() {
    const {id} = useParams();
    const navigate = useNavigate();
    const succulent = succulents.find(s => s.id === Number(id));
    const similar = succulents.filter(s => s.id !== Number(id));
    const newest = [...succulents]
        .filter(s => s.id !== Number(id))
        .sort((a, b) => b.id - a.id)
        .slice(0, 3);
    const [mainImage, setMainImage] = useState(succulent?.image || '');
    const [tab, setTab] = useState(0);
    const [reviews, setReviews] = useState(mockReviews);
    const [review, setReview] = useState({rating: 5, comment: '', image: null});
    const [imagePreview, setImagePreview] = useState(null);
    const [userDesign, setUserDesign] = useState([]);

    // Get user info from localStorage (mock, adjust as needed)
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        // ignore parse error and fall back to null
        currentUser = null;
    }
    const userName = currentUser?.name || 'Bạn';

    useEffect(() => {
        const cached = localStorage.getItem(`succulent-design-${id}`);
        if (cached) {
            try {
                setUserDesign(JSON.parse(cached));
            } catch {
                setUserDesign([]);
            }
        } else {
            setUserDesign([]);
        }
        setMainImage(succulent?.image || '');
    }, [id, succulent]);

    if (!succulent) return <Typography sx={{p: 4}}>Không tìm thấy sản phẩm.</Typography>;

    const handleTab = (_, v) => setTab(v);
    const handleReviewChange = e => setReview({...review, [e.target.name]: e.target.value});
    const handleRatingChange = (_, v) => setReview({...review, rating: v});
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            alert('Chỉ chấp nhận file PNG hoặc JPG!');
            return;
        }
        if (file.size > 25 * 1024 * 1024) {
            alert('File không được vượt quá 25MB!');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            setReview(r => ({...r, image: ev.target.result}));
            setImagePreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    };
    const handleReviewSubmit = e => {
        e.preventDefault();
        if (review.comment) {
            setReviews([{name: userName, ...review, date: new Date().toISOString().slice(0, 10)}, ...reviews]);
            setReview({rating: 5, comment: '', image: null});
            setImagePreview(null);
        }
    };

    return (
        <Box sx={{p: {xs: 1, sm: 2, md: 3}, width: '100%', minHeight: '100vh', bgcolor: '#f8f8f8'}}>
            <Box sx={{maxWidth: 1400, mx: 'auto'}}>
                <Breadcrumbs aria-label="breadcrumb" sx={{mb: 2}}>
                    <Link underline="hover" color="inherit" sx={{cursor: 'pointer'}}
                          onClick={() => navigate('/buyer/succulent')}>Danh sách</Link>
                    <Typography color="text.primary">{succulent.name}</Typography>
                </Breadcrumbs>

                <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 2, alignItems: 'flex-start'}}>
                    {/* Main content 9/12 */}
                    <Box sx={{flex: 3, minWidth: 0}}>
                        <Card sx={{borderRadius: 3, boxShadow: 2}}>
                            <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}}}>
                                {/* Left: image + thumbnails */}
                                <Box sx={{p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                    <Box component="img" src={mainImage} alt={succulent.name} sx={{
                                        width: {xs: '100%', md: 420},
                                        height: 420,
                                        objectFit: 'cover',
                                        borderRadius: 2
                                    }}/>
                                    <Stack direction="row" spacing={1} sx={{mt: 1, overflowX: 'auto'}}>
                                        {Array.from(new Set([succulent.image, '/hinhKeSenda.jpg', '/senda.png'])).map((img, idx) => (
                                            <Box key={idx} component="img" src={img} alt={`thumb-${idx}`}
                                                 onClick={() => setMainImage(img)} sx={{
                                                width: 72,
                                                height: 56,
                                                objectFit: 'cover',
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                border: mainImage === img ? '2px solid #4caf50' : '1px solid #eee'
                                            }}/>
                                        ))}
                                    </Stack>
                                </Box>

                                <CardContent sx={{flex: 1, minWidth: 0}}>
                                    <Typography variant="h4" fontWeight={800} mb={1}>{succulent.name}</Typography>
                                    <Typography variant="subtitle1" color="success.main" fontWeight={700} mb={1}>
                                        {succulent.price.toLocaleString('vi-VN')} ₫
                                    </Typography>
                                    <Typography variant="body1" mb={2}>{succulent.desc}</Typography>
                                    <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                                        {succulent.accessories.map(acc => (
                                            <Chip key={acc} label={acc} color="info"/>
                                        ))}
                                    </Stack>

                                    {/* User's custom design */}
                                    {userDesign && userDesign.length > 0 && (
                                        <Box sx={{
                                            mb: 2,
                                            p: 2,
                                            border: '1px dashed #4caf50',
                                            borderRadius: 2,
                                            background: '#f6fff6'
                                        }}>
                                            <Typography variant="subtitle2" color="success.main" fontWeight={600}
                                                        mb={1}>
                                                Thiết kế cá nhân của bạn:
                                            </Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                {userDesign.map((acc, idx) => (
                                                    <Chip key={`${acc}-${idx}`} label={acc} color="success"/>
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}

                                    <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} mt={1}>
                                        <Button
                                            variant="contained"
                                            sx={{borderRadius: 2}}
                                            onClick={() => navigate(`/buyer/succulent/${succulent.id}/design`)}
                                        >
                                            Thiết kế phụ kiện chậu
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            sx={{borderRadius: 2}}
                                            onClick={() => navigate('/buyer/succulent')}
                                        >
                                            Quay lại danh sách
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Box>
                        </Card>

                        {/* Tabs for description/contact */}
                        <Paper sx={{mt: 3, borderRadius: 2, width: '100%'}}>
                            <Tabs value={tab} onChange={handleTab} indicatorColor="primary" textColor="primary">
                                <Tab label="Mô tả"/>
                                <Tab label="Thông tin liên hệ"/>
                            </Tabs>
                            <Divider/>
                            <Box sx={{p: 2}}>
                                {tab === 0 && <Typography>{succulent.detail}</Typography>}
                                {tab === 1 && <Typography>{succulent.contact}</Typography>}
                            </Box>
                        </Paper>

                        {/* Reviews */}
                        <Paper sx={{mt: 3, p: 2, borderRadius: 2, width: '100%'}}>
                            <Typography variant="h6" fontWeight={600} mb={2}>Đánh giá sản phẩm</Typography>
                            <Box component="form" onSubmit={handleReviewSubmit} mb={2}>
                                <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems="center">
                                    {/* No name input, use logged-in user */}
                                    <Rating
                                        name="rating"
                                        value={review.rating}
                                        onChange={handleRatingChange}
                                        size="medium"
                                    />
                                    <TextField
                                        label="Nhận xét"
                                        name="comment"
                                        value={review.comment}
                                        onChange={handleReviewChange}
                                        size="small"
                                        required
                                        sx={{flex: 1}}
                                    />
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        sx={{minWidth: 120}}
                                    >
                                        {imagePreview ? 'Đổi ảnh' : 'Thêm ảnh'}
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            hidden
                                            onChange={handleImageChange}
                                        />
                                    </Button>
                                    <Button type="submit" variant="contained">Gửi</Button>
                                </Stack>
                                {imagePreview && (
                                    <Box mt={2}>
                                        <Typography variant="caption" color="text.secondary">Ảnh xem trước:</Typography>
                                        <Box
                                            component="img"
                                            src={imagePreview}
                                            alt="Ảnh nhận xét"
                                            sx={{maxHeight: 120, maxWidth: 180, borderRadius: 2, mt: 1}}
                                        />
                                    </Box>
                                )}
                            </Box>
                            <Divider sx={{mb: 2}}/>
                            <Stack spacing={2}>
                                {reviews.length === 0 &&
                                    <Typography color="text.secondary">Chưa có đánh giá nào.</Typography>}
                                {reviews.map((r, idx) => (
                                    <Box key={idx} sx={{p: 1, border: '1px solid #eee', borderRadius: 1}}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Typography fontWeight={600}>{r.name}</Typography>
                                            <Rating value={r.rating} readOnly size="small"/>
                                            <Typography color="text.secondary" fontSize={13}>{r.date}</Typography>
                                        </Stack>
                                        <Typography>{r.comment}</Typography>
                                        {r.image && (
                                            <Box mt={1}>
                                                <Box
                                                    component="img"
                                                    src={r.image}
                                                    alt="Ảnh nhận xét"
                                                    sx={{maxHeight: 120, maxWidth: 180, borderRadius: 2}}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </Box>
                    {/* Sidebar 3/12 */}
                    <Box sx={{flex: 1, minWidth: 0, position: {md: 'sticky'}, top: {md: 80}}}>
                        <Paper sx={{p: 2, mb: 2, borderRadius: 2}}>
                            <Typography variant="h6" fontWeight={600} mb={1}>Thông tin cửa hàng</Typography>
                            <List dense sx={{mb: 1}}>
                                {shopInfo.map((info, idx) => (
                                    <ListItem key={idx} disablePadding>
                                        <ListItemText primary={info}/>
                                    </ListItem>
                                ))}
                            </List>
                            <Divider sx={{my: 1}}/>
                            <Typography variant="body2" color="text.secondary">Giờ mở cửa: 8:00 - 20:00</Typography>
                            <Typography variant="body2" color="text.secondary">Hotline: 0888.736.788</Typography>
                        </Paper>

                        <Paper sx={{p: 2, mb: 2, borderRadius: 2}}>
                            <Typography variant="h6" fontWeight={600} mb={1}>Sản phẩm mới</Typography>
                            <Stack spacing={1}>
                                {newest.map(item => (
                                    <Card key={item.id} sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        boxShadow: 0,
                                        border: '1px solid #eee',
                                        borderRadius: 2
                                    }}>
                                        <CardMedia component="img" image={item.image} alt={item.name}
                                                   sx={{width: 64, height: 64, objectFit: 'cover', borderRadius: 1}}/>
                                        <CardContent sx={{p: 1}}>
                                            <Typography variant="subtitle2" fontWeight={600}>{item.name}</Typography>
                                            <Typography variant="caption" color="success.main"
                                                        fontWeight={600}>{item.price.toLocaleString('vi-VN')} ₫</Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        </Paper>

                        <Paper sx={{p: 2, borderRadius: 2}}>
                            <Typography variant="h6" fontWeight={600} mb={1}>Sản phẩm tương tự</Typography>
                            <Stack spacing={1}>
                                {similar.map(item => (
                                    <Card key={item.id} sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        boxShadow: 0,
                                        border: '1px solid #eee',
                                        borderRadius: 2
                                    }}>
                                        <CardMedia component="img" image={item.image} alt={item.name}
                                                   sx={{width: 64, height: 64, objectFit: 'cover', borderRadius: 1}}/>
                                        <CardContent sx={{p: 1}}>
                                            <Typography variant="subtitle2" fontWeight={600}>{item.name}</Typography>
                                            <Typography variant="caption" color="success.main"
                                                        fontWeight={600}>{item.price.toLocaleString('vi-VN')} ₫</Typography>
                                            <Button size="small" variant="text"
                                                    sx={{p: 0, minWidth: 0, mt: 0.5, textTransform: 'none'}}
                                                    onClick={() => navigate(`/buyer/succulent/${item.id}`)}>Xem</Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
