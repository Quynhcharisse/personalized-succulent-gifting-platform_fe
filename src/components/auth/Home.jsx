import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Button} from '@mui/material'
import '../../styles/auth/Home.css'
import ChatBot from './ChatBot.jsx'
import {viewProduct} from '../../services/ProductService.jsx'

export default function Home() {
    const navigate = useNavigate()
    const [showContactDropdown, setShowContactDropdown] = useState(false)
    const [products, setProducts] = useState([]);
    const [catalogProducts, setCatalogProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await viewProduct();
                if (response && response.data) {
                    setProducts(response.data.data || []);
                    setCatalogProducts(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);

    // Removed video control effect (no video in hero now)

    // Compact header shadow on scroll
    useEffect(() => {
        const header = document.getElementById('siteHeader')
        if (!header) return
        const onScroll = () => {
            if (window.scrollY > 6) header.classList.add('is-scrolled')
            else header.classList.remove('is-scrolled')
        }
        window.addEventListener('scroll', onScroll)
        onScroll()
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const bestSellerTeasers = [
        {
            id: 'kit-01',
            name: 'Bộ dụng cụ chăm cây 5 món',
            priceVnd: 129000,
            image:
                'https://i.pinimg.com/1200x/91/1c/2b/911c2b2c588dd90c2682f527a2b3a2fb.jpg',
        },
        {
            id: 'pot-01',
            name: 'Chậu gốm men mờ 10cm',
            priceVnd: 99000,
            image:
                'https://i.pinimg.com/1200x/91/1c/2b/911c2b2c588dd90c2682f527a2b3a2fb.jpg',
        },
        {
            id: 'mix-01',
            name: 'Combo 3 chậu phối cảnh',
            priceVnd: 219000,
            image:
                'https://i.pinimg.com/1200x/91/1c/2b/911c2b2c588dd90c2682f527a2b3a2fb.jpg',
        },
    ]


    const testimonials = [
        {
            id: 'rv-01',
            name: 'Khải Anh',
            text:
                'Shop tư vấn rất nhiệt tình. Cây đóng gói chắc chắn, nhận hàng lá vẫn tươi.',
            rating: 5,
        },
        {
            id: 'rv-02',
            name: 'Chi Lam',
            text: 'Giá hợp lý, cây khỏe. Mua tặng bạn được khen hết lời!',
            rating: 5,
        },
        {
            id: 'rv-03',
            name: 'Minh Quân',
            text: 'Lần đầu trồng vẫn sống tốt nhờ hướng dẫn chăm rất chi tiết.',
            rating: 4,
        },
    ]

    const calculateProductPrice = (size) => {
        if (!size) return 0;
        let totalPrice = 0;

        // Add succulent prices
        size.succulents?.forEach(succulent => {
            if (succulent.size && Array.isArray(succulent.size)) {
                succulent.size.forEach(sizeItem => {
                    totalPrice += (sizeItem.price || 0) * (sizeItem.quantity || 1);
                });
            } else if (succulent.size?.price) {
                totalPrice += (succulent.size.price || 0) * (succulent.quantity || 1);
            }
        });

        // Add pot price
        if (size.pot?.size && size.pot.size.length > 0) {
            totalPrice += size.pot.size[0].price || 0;
        }

        // Add soil price
        if (size.soil?.basePricing) {
            const soilPrice = (size.soil.basePricing.price / size.soil.basePricing.massValue) * size.soil.massAmount;
            totalPrice += soilPrice;
        }

        // Add decoration prices
        size.decorations?.forEach(decoration => {
            totalPrice += decoration.totalPrice || 0;
        });

        return totalPrice;
    };

    // Highlight only sections on Home (exclude /cham-soc which is a separate page)
    useEffect(() => {
        const sectionIds = ['san-pham', 'danh-gia', 'ly-do']
        const linkById = new Map(sectionIds.map(id => [id, document.querySelector(`.main-nav a[href="#${id}"]`)]))
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const link = linkById.get(entry.target.id)
                if (!link) return
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'))
                    link.classList.add('active')
                }
            })
        }, {root: null, rootMargin: '0px 0px -40% 0px', threshold: [0.5, 0.75, 1]})
        sectionIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [])

    // Close contact dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showContactDropdown && !event.target.closest('.contact-widget')) {
                setShowContactDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showContactDropdown])

    return (
        <>
            <div className="home">
                <header className="hero">
                    <h2 className="elementor-heading-title elementor-size-default">Kết tinh kì diệu cho đời sống tinh thần</h2>
                    <p className="hero__poem">
                        Sen đá biểu tượng của sự bền bỉ, sức sống mạnh mẽ và ý chí kiên cương vươn lên trong cuộc sống.
                    </p>
                </header>

                {/* About Section - Elementor-like layout */}
                <div
                    className="elementor-element elementor-element-60fcf008 e-flex e-con-boxed e-con e-parent e-lazyloaded"
                    id="about">
                    <div className="e-con-inner">
                        <div className="elementor-element elementor-element-5d8340c e-con-full e-flex e-con e-child">
                            <div
                                className="elementor-element elementor-element-575f7dda elementor-widget elementor-widget-heading">
                                <h2 className="elementor-heading-title elementor-size-default">Về chúng tôi</h2>
                            </div>
                            <div
                                className="elementor-element elementor-element-6156fef5 elementor-widget elementor-widget-text-editor">
                                <p>
                                    <strong>Sứ mệnh Lá Nhỏ Bên Thềm</strong>   mang không gian xanh và tái định nghĩa trải nghiệm sen đá bằng sự kết hợp giữa Nghệ thuật Thiết kế Thủ công và Dịch vụ "Điện Cây" cá nhân hóa,
                                     hướng tới trở thành thương hiệu sen đá tiên phong về chất lượng, sự độc đáo, và giải pháp chăm sóc hỗ trợ.
                                </p>
                            </div>
                        </div>

                        <div className="elementor-element elementor-element-1bc7c3c2 e-con-full e-flex e-con e-child">
                            <div
                                className="elementor-element elementor-element-166b09a9 elementor-widget elementor-widget-image">
                                <img decoding="async" width="380" height="782" 
                                     src="/vien.jpg" alt=""/>
                            </div>
                        </div>

                        <div className="elementor-element elementor-element-4c7cb06b e-con-full e-flex e-con e-child">
                            <div
                                className="elementor-element elementor-element-4219b4f7 elementor-widget elementor-widget-text-editor">
                                <p>
                                    <strong>Lá Nhỏ Bên Thềm</strong> là thương hiệu tiên phong xây dựng Hệ sinh thái Sen đá Kỹ thuật số (Digital Succulent Ecosystem) trong lĩnh vực sen đá online, đặt mục tiêu trở thành thương hiệu dẫn đầu về thiết kế nghệ thuật, cá nhân hóa, và giải pháp chăm sóc hỗ trợ.
                                    <strong>Lá Nhỏ Bên Thềm</strong> tượng trưng cho sự bình an, vĩnh cửu, ý chí kiên cường, phấn đấu vươn lên
                                    trong cuộc sống, không khuất phục trước nghịch cảnh.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <section id="san-pham" className="bestsellers">
                    <div className="container">
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: '2rem'
                        }}>
                            <h2 className="section-title">Sản phẩm bán chạy</h2>
                        </div>
                        <div className="bestsellers__grid">
                            {(catalogProducts.length > 0 ? catalogProducts.slice(0, 3) : bestSellerTeasers).map((t) => {
                                const productName = typeof t.name === 'object' ? JSON.stringify(t.name) : t.name;
                                const productImage = t.images?.[0]?.url || t.thumbnail || t.image;
                                return (
                                    <article key={t.id} className="teaser" style={{cursor: 'pointer'}}>
                                        <div className="teaser__media">
                                            <img loading="lazy" src={productImage} alt={productName}/>
                                        </div>
                                        <div className="teaser__body">
                                            <h3>{productName}</h3>
                                            <button
                                                className="btn btn--sm"
                                                onClick={() => navigate(`/product/${t.id}`)}
                                            >
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                        <div style={{display: 'flex', justifyContent: 'center', marginTop: '2rem'}}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/product')}
                                sx={{
                                    borderColor: '#0D3B2E',
                                    color: '#0D3B2E',
                                    fontWeight: 600,
                                    '&:hover': {
                                        backgroundColor: '#0D3B2E',
                                        color: '#fff',
                                        borderColor: '#0D3B2E',
                                    }
                                }}
                            >
                                Xem tất cả sản phẩm →
                            </Button>
                        </div>
                    </div>
                </section>

                <section id="danh-gia" className="testimonials">
                    <div className="container">
                        <h2 className="section-title">Đánh giá của khách hàng</h2>
                        <div className="testimonials__grid">
                            {testimonials.map((r) => (
                                <article key={r.id} className="review">
                                    <div className="review__header">
                                        <div className="stars" aria-label={`${r.rating} sao`}>
                                            {'★★★★★'.slice(0, r.rating)}
                                        </div>
                                        <span className="review__name">{r.name}</span>
                                    </div>
                                    <p className="review__text">{r.text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>


                <section id="ly-do" className="reasons">
                    <div className="container">
                        <div className="elementor-element elementor-element-6d252b79 e-flex e-con-boxed e-con e-parent">
                            <div className="e-con-inner">
                                <div
                                    className="elementor-element elementor-element-7b84a565 elementor-widget elementor-widget-heading">
                                    <h2 className="elementor-heading-title elementor-size-default">Cam kết</h2>
                                </div>
                                <div
                                    className="elementor-element elementor-element-5a73d3b1 e-grid e-con-full e-con e-child">
                                    {/* Item 1 */}
                                    <div
                                        className="elementor-element elementor-element-22eb2061 e-con-full e-flex e-con e-child">
                                        <div
                                            className="elementor-element elementor-element-40c811af elementor-widget elementor-widget-image">
                                            <img loading="lazy" decoding="async" width="600" height="600"
                                                 src="/bantay.png" alt=""/>
                                        </div>
                                        <div
                                            className="elementor-element elementor-element-26b9fae3 elementor-widget elementor-widget-heading">
                                            <h2 className="elementor-heading-title elementor-size-default">Dịch vụ tận
                                                tâm</h2>
                                        </div>
                                        <div
                                            className="elementor-element elementor-element-6b266173 elementor-widget elementor-widget-text-editor">
                                            <p>Chúng tôi luôn lắng nghe và phục vụ khách hàng bằng sự chu đáo, tận tình
                                                trong từng chi tiết.</p>
                                        </div>
                                    </div>
                                    {/* Item 2 */}
                                    <div
                                        className="elementor-element elementor-element-7755ab64 e-con-full e-flex e-con e-child">
                                        <div
                                            className="elementor-element elementor-element-252d3d08 elementor-widget elementor-widget-image">
                                            <img loading="lazy" decoding="async" width="600" height="600"
                                                 src="/bantay2.png" alt=""/>
                                        </div>
                                        <div
                                            className="elementor-element elementor-element-32183c64 elementor-widget elementor-widget-heading">
                                            <h2 className="elementor-heading-title elementor-size-default">Cam kết giao
                                                hàng</h2>
                                        </div>
                                        <div
                                            className="elementor-element elementor-element-714e591a elementor-widget elementor-widget-text-editor">
                                            <p>Chúng tôi cam kết giao hàng đúng hẹn, đúng địa điểm, đảm bảo giữ trọn vẹn
                                                cảm xúc người nhận.</p>
                                        </div>
                                    </div>
                                    {/* Item 3 */}
                                    <div
                                        className="elementor-element elementor-element-3dc346e4 e-con-full e-flex e-con e-child">
                                        <div
                                            className="elementor-element elementor-element-573d98eb elementor-widget elementor-widget-image">
                                            <img loading="lazy" decoding="async" width="600" height="600"
                                                 src="/bantay3.png" alt=""/>
                                        </div>
                                        <div
                                            className="elementor-element elementor-element-78f96308 elementor-widget elementor-widget-heading">
                                            <h2 className="elementor-heading-title elementor-size-default">Cam kết chất
                                                lượng</h2>
                                        </div>
                                        <div
                                            className="elementor-element elementor-element-4a62d908 elementor-widget elementor-widget-text-editor">
                                            <p>Chúng tôi cam kết cung cấp sản phẩm chất lượng cao, đảm bảo độ tươi lâu
                                                và hình thức đẹp nhất khi đến tay bạn.</p>
                                        </div>
                                    </div>
                                    {/* Item 4 */}
                                    <div
                                        className="elementor-element elementor-element-11a263ab e-con-full e-flex e-con e-child">
                                        <div
                                            className="elementor-element elementor-element-70cbeb47 elementor-widget elementor-widget-image">
                                            <img loading="lazy" decoding="async" width="600" height="600"
                                                 src="/bantay4.png" alt=""/>
                                        </div>
                                        <div
                                            className="elementor-element elementor-element-415a9d02 elementor-widget elementor-widget-heading">
                                            <h2 className="elementor-heading-title elementor-size-default">Sản phẩm đa
                                                dạng</h2>
                                        </div>
                                        <div
                                            className="elementor-element elementor-element-5ac501 elementor-widget elementor-widget-text-editor">
                                            <p>Từ sen đá mẫu mã đến điện cây, chúng tôi có đủ sản phẩm phù hợp mọi dịp
                                                tặng quà, cá nhân hóa từ mệnh và cùng hoàng đạo theo yêu cầu.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <ChatBot/>
        </>
    )
}
