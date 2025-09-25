import React from 'react'
import '../../styles/auth/Home.css'
import {useEffect, useRef, useState} from 'react'

export default function Home() {
    const [bannerVideoReady, setBannerVideoReady] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [showContactDropdown, setShowContactDropdown] = useState(false)
    const videoRef = useRef(null)
    // Prefer higher bitrate file if you have one, fallback to current mp4
    const bannerVideoSrc = '/videoBanner.mp4'

    useEffect(() => {
        const el = videoRef.current
        if (!el) return
        try {
            el.muted = isMuted
            if (!isMuted && el.paused) {
                el.play().catch(() => {
                })
            }
        } catch (error) {
            console.error('Error setting video muted state:', error)
        }
    }, [isMuted])

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

    const catalogProducts = [
        {
            id: 'succ-01',
            name: 'Sen đá Bông Hồng',
            priceVnd: 69000,
            salePriceVnd: null,
            badge: 'Mới',
            image:
                'https://i.pinimg.com/1200x/29/98/4f/29984fc6f66deffd71d93e96c813a85a.jpg',
        },
        {
            id: 'succ-02',
            name: 'Sen đá Giva',
            priceVnd: 79000,
            salePriceVnd: 59000,
            badge: 'Giảm 25%',
            image:
                'https://i.pinimg.com/1200x/29/98/4f/29984fc6f66deffd71d93e96c813a85a.jpg',
        },
        {
            id: 'succ-03',
            name: 'Sen đá Thạch Ngọc',
            priceVnd: 99000,
            salePriceVnd: 82000,
            badge: 'Bán chạy',
            image:
                'https://i.pinimg.com/1200x/29/98/4f/29984fc6f66deffd71d93e96c813a85a.jpg',
        },
        {
            id: 'succ-04',
            name: 'Sen đá Cẩm Thạch',
            priceVnd: 89000,
            salePriceVnd: null,
            badge: null,
            image:
                'https://i.pinimg.com/1200x/29/98/4f/29984fc6f66deffd71d93e96c813a85a.jpg',
        },
        {
            id: 'succ-05',
            name: 'Xương rồng Nhỏ',
            priceVnd: 49000,
            salePriceVnd: null,
            badge: 'Mới',
            image:
                'https://i.pinimg.com/1200x/29/98/4f/29984fc6f66deffd71d93e96c813a85a.jpg',
        },
        {
            id: 'succ-06',
            name: 'Sen đá Bọ Cạp',
            priceVnd: 76000,
            salePriceVnd: 65000,
            badge: 'Giảm 15%',
            image:
                'https://i.pinimg.com/1200x/29/98/4f/29984fc6f66deffd71d93e96c813a85a.jpg',
        },
        {
            id: 'succ-07',
            name: 'Sen đá Trắng',
            priceVnd: 89000,
            salePriceVnd: null,
            badge: null,
            image:
                'https://i.pinimg.com/1200x/29/98/4f/29984fc6f66deffd71d93e96c813a85a.jpg',
        },
        {
            id: 'succ-08',
            name: 'Sen đá Ruby',
            priceVnd: 99000,
            salePriceVnd: 83000,
            badge: 'Bán chạy',
            image:
                'https://i.pinimg.com/1200x/29/98/4f/29984fc6f66deffd71d93e96c813a85a.jpg',
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

    const formatPrice = (vnd) =>
        new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(vnd)

    document.title = 'Lá Nhỏ Bên Thềm | Sen đá & quà tặng xanh'

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
        }, { root: null, rootMargin: '0px 0px -40% 0px', threshold: [0.5, 0.75, 1] })
        sectionIds.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el) })
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
        <div className="home">

            <header className="hero">
                <div className="container hero__content">
                <div className="hero__panel">
                        <p className="hero__poem">
                            Chăm một lá nhỏ, gieo ngàn cung bậc<br/>
                            Bên thềm xanh mát, dệt mộng bình yên<br/>
                            Sen đá lung linh, từng nhánh dịu hiền<br/>
                            Mỗi chậu bé xinh, kể chuyện kiêu hãnh.<br/>
                            Cỏ cây quyện gió, hơi thở vỗ về<br/>
                            Không gian thầm lặng, vang vọng yêu thương<br/>
                            Lá ngắn, lá dài, nụ hoa hé nụ<br/>
                            Lá Nhỏ Bên Thềm – đong đầy cảm xúc
                        </p>
                        <div className="hero__actions">
                            <a className="btn btn--primary" href="#san-pham">Mua ngay</a>
                            <a className="btn btn--ghost" href="#ly-do">Vì sao chọn chúng tôi</a>
                        </div>
                    </div>
                </div>
            </header>

            <section className="features">
                <div className="container features__grid features__grid--3">
                    <div className="feature feature--card">
                        <div className="feature__icon-bubble">
                            <img src="/ButtonCar.png" alt="Điện cây"/>
                        </div>
                        <div>
                            <h3>Điện cây</h3>
                            <p>
                                Dịch vụ nhắc lịch đặt cây và gửi quà thân tặng vào dịp sinh nhật, kỷ niệm… Chúng tôi
                                chuẩn bị chậu cây xinh và giao đúng hẹn.
                            </p>
                        </div>
                    </div>
                    <div className="feature feature--card">
                        <div className="feature__icon-bubble">
                            <img src="/ButtonCommunity.png" alt="Tích hợp cộng đồng yêu cây"/>
                        </div>
                        <div>
                            <h3>Tích hợp cộng đồng yêu cây</h3>
                            <p>
                                Không gian thân thiện để bạn khoe cây, chia sẻ kinh nghiệm, hỏi – đáp và lan tỏa cảm
                                hứng mỗi ngày.
                            </p>
                        </div>
                    </div>
                    <div className="feature feature--card">
                        <div className="feature__icon-bubble">
                            <img src="/ButtonMoney.png" alt="Chất lượng trong tầm giá"/>
                        </div>
                        <div>
                            <h3>Chất lượng trong tầm giá</h3>
                            <p>
                                Chọn tận vườn, đóng gói cẩn thận và tư vấn tận tâm để mỗi món quà xanh luôn xứng đáng
                                với niềm tin bạn gửi gắm.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="banner banner--bleed">
                <div className="banner__inner">
                    <video
                        className="banner__video"
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                        preload="metadata"
                        poster="/nen.jpg"
                        onCanPlay={() => setBannerVideoReady(true)}
                        ref={videoRef}
                    >
                        <source src={bannerVideoSrc} type="video/mp4"/>
                    </video>
                    <button
                        className="banner__mute"
                        title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                        aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                        onClick={() => setIsMuted((m) => !m)}
                    >
                        {isMuted ? '🔇' : '🔊'}
                    </button>
                    {!bannerVideoReady && (
                        <img
                            className="banner__img"
                            src="/nen.jpg"
                            alt="Bộ sưu tập sen đá"
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
                        />
                    )}
                </div>
            </div>

            <section id="san-pham" className="bestsellers">
                <div className="container">
                    <h2 className="section-title">Sản phẩm bán chạy</h2>
                    <div className="bestsellers__grid">
                        <aside className="promo-card">
                            <div className="promo-card__content">
                                <h3>Đặt cây</h3>
                                <p>
                                    Chọn mẫu, đặt lịch giao, chúng tôi trồng phối cảnh theo yêu cầu. Thiết kế tối giản
                                    cho bàn làm việc.
                                </p>
                                <a className="btn btn--primary" href="#catalog">Mua ngay</a>
                            </div>
                        </aside>
                        {bestSellerTeasers.map((t) => (
                            <article key={t.id} className="teaser">
                                <div className="teaser__media">
                                    <img loading="lazy" src={t.image} alt={t.name}/>
                                </div>
                                <div className="teaser__body">
                                    <h3>{t.name}</h3>
                                    <div className="price">{formatPrice(t.priceVnd)}</div>
                                    <button className="btn btn--sm">Thêm vào giỏ</button>
                                </div>
                            </article>
                        ))}
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

            <section id="catalog" className="catalog">
                <div className="container">
                    <h2 className="section-title">Sản phẩm</h2>
                    <div className="catalog__subnav">
                        <button className="chip chip--active">Mới nhất</button>
                        <button className="chip">Bán chạy</button>
                        <button className="chip">Giảm giá</button>
                        <button className="chip">Phù hợp nơi sáng</button>
                    </div>
                    <div className="card-grid">
                        {catalogProducts.map((p) => (
                            <article key={p.id} className="product-card">
                                {p.badge && <span className="badge">{p.badge}</span>}
                                <div className="product-card__media">
                                    <img loading="lazy" src={p.image} alt={p.name}/>
                                </div>
                                <div className="product-card__body">
                                    <h3>{p.name}</h3>
                                    <div className="product-card__meta">
                                        <div>
                                            {p.salePriceVnd ? (
                                                <>
                                                    <span
                                                        className="price price--sale">{formatPrice(p.salePriceVnd)}</span>
                                                    <span className="price price--old">{formatPrice(p.priceVnd)}</span>
                                                </>
                                            ) : (
                                                <span className="price">{formatPrice(p.priceVnd)}</span>
                                            )}
                                        </div>
                                        <button className="btn btn--sm">Thêm vào giỏ</button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                    <div className="center mt-16">
                        <a className="btn" href="#">Xem thêm</a>
                    </div>
                </div>
            </section>


            <section id="ly-do" className="reasons">
                <div className="container">
                    <div className="section-title-card">
                        <h2 className="section-title">Điều gì giúp chúng tôi trở thành lựa chọn hàng đầu giúp bạn sở hữu sen đá ưng ý</h2>
                    </div>
                    <div className="reasons__grid">
                        <article className="reason-card">
                            <div className="reason-card__icon">
                                <img src="/IconChatBox.png" alt="Chat box AI" />
                            </div>
                            <h3>Chat box AI</h3>
                            <p>
                                Bất cứ khi nào bạn cần tư vấn chọn cây, hỏi cách chăm sóc, nhờ gợi ý quà tặng hay đóng
                                góp ý kiến, chatbot thông minh của Lá Nhỏ Bên Thềm luôn sẵn sàng lắng nghe và phản hồi.
                            </p>
                        </article>

                        <article className="reason-card">
                            <div className="reason-card__icon">
                                <img src="/IconMem.png" alt="Cộng đồng yêu cây" />
                            </div>
                            <h3>Cộng đồng yêu cây</h3>
                            <p>
                                Chúng tôi xây dựng một không gian thân thiện để bạn có thể đăng bài chia sẻ kinh nghiệm
                                chăm cây, khoe chậu cây xinh, hỏi – đáp các vấn đề thường gặp hay đơn giản là cùng nhau
                                ngắm lá mỗi ngày.
                            </p>
                        </article>

                        <article className="reason-card">
                            <div className="reason-card__icon">
                                <img src="/IconDiamon.png" alt="Chất lượng trong tầm giá" />
                            </div>
                            <h3>Chất lượng trong tầm giá</h3>
                            <p>
                                Từng sản phẩm đều được tuyển chọn kỹ lưỡng và chăm chút tỉ mỉ, đi kèm dịch vụ tư vấn –
                                bảo hành đầy đủ để bạn yên tâm gắn bó lâu dài cùng Lá Nhỏ Bên Thềm.
                            </p>
                        </article>

                        <article className="reason-card">
                            <div className="reason-card__icon">
                                <img src="/IconTree.png" alt="Thiết bị IoT đo độ ẩm đất" />
                            </div>
                            <h3>Thiết bị IOT đo độ ẩm đất</h3>
                            <p>
                                Theo dõi độ ẩm trong đất và nhắc tưới nước đúng lúc qua điện thoại. Không còn lo cây thiếu
                                nước hay úng rễ, bạn chăm cây như một người làm vườn chuyên nghiệp.
                            </p>
                        </article>

                        <article className="reason-card">
                            <div className="reason-card__icon">
                                <img src="/IconCar.png" alt="Điện cây" />
                            </div>
                            <h3>Điện cây</h3>
                            <p>
                                Dịch vụ “Điện cây” sẽ gọi điện hoặc nhắn tin nhắc bạn đặt cây vào các dịp lễ, sinh nhật,
                                kỷ niệm… để kịp trao quà cho người thân yêu. Chỉ cần để lại danh sách ngày quan trọng, chúng
                                tôi sẽ chuẩn bị và nhắc đúng lúc.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="newsletter newsletter--bleed">
                <div className="container newsletter__inner">
                    <div>
                        <span className="eyebrow">Ưu đãi đặc biệt</span>
                        <h2 className="newsletter__title">
                        🎁 Giảm giá 20% cho đơn đặt hàng đầu tiên của bạn
                        </h2>
                        <p className="muted">Nhận tin cây hằng tuần và ưu đãi hấp dẫn của chúng tôi.</p>
                    </div>
                    <form className="newsletter__form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Email" required/>
                        <button className="btn btn--primary" type="submit">Nhận thông tin</button>
                    </form>
                </div>
            </section>

            {/* Contact Float Widget */}
            <div className="contact-widget">
                {/* Contact Dropdown */}
                {showContactDropdown && (
                    <div className="contact-dropdown">
                        <div className="contact-dropdown__header">
                            <div className="contact-dropdown__header-icon">
                                <img src="/LaNhoBenThemLogo.png" alt="Lá Nhỏ Bên Thềm"/>
                            </div>
                            <div className="contact-dropdown__header-text">
                                <h3>Lá Nhỏ Bên Thềm có thể hỗ trợ gì cho anh chị?</h3>
                            </div>
                            <button
                                className="contact-dropdown__close"
                                onClick={() => setShowContactDropdown(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div>
                            <iframe
                                name="myiFrame"
                                width="600px"
                                height="400px"
                                src="https://udify.app/chatbot/lEPq0T619KaQc5OR"
                                scrolling="no"
                                style={{ border: '0px none #ffffff' }}
                            ></iframe>
                        </div>

                        <div className="contact-dropdown__options">
                            <a
                                href="https://m.me/lanhobenthem"
                                className="contact-dropdown__option"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <div className="contact-dropdown__option-icon contact-dropdown__option-icon--messenger">
                                    <img src="/messengerIcon.png" alt="Messenger"/>
                                </div>
                                <div>
                                    <div className="contact-dropdown__option-title">Messenger</div>
                                    <div className="contact-dropdown__option-subtitle">https://m.me/lanhobenthem</div>
                                </div>
                            </a>

                            <a
                                href="mailto:support@lanhobenthem.com"
                                className="contact-dropdown__option"
                            >
                                <div className="contact-dropdown__option-icon contact-dropdown__option-icon--email">
                                    <img src="/mailIcon.png" alt="Email"/>
                                </div>
                                <div>
                                    <div className="contact-dropdown__option-title">Email</div>
                                    <div className="contact-dropdown__option-subtitle">support@lanhobenthem.com</div>
                                </div>
                            </a>

                            <a
                                href="tel:0908304247"
                                className="contact-dropdown__option"
                            >
                                <div className="contact-dropdown__option-icon contact-dropdown__option-icon--phone">
                                    <img src="/phoneIcon.png" alt="Phone"/>
                                </div>
                                <div>
                                    <div className="contact-dropdown__option-title">Hotline</div>
                                    <div className="contact-dropdown__option-subtitle">0908304247</div>
                                </div>
                            </a>
                        </div>

                        <div className="contact-dropdown__footer">
                            <p>Cung cấp bởi <strong>Lá Nhỏ Bên Thềm</strong></p>
                        </div>
                    </div>
                )}

                {/* Contact Float Button */}
                <button
                    className="contact-widget__button"
                    onClick={() => setShowContactDropdown(!showContactDropdown)}
                    title="Liên hệ Lá Nhỏ Bên Thềm"
                >
                    <span className="contact-widget__icon">
                        <img src="/communications.png" alt="Contact"/>
                    </span>
                    {/* <span className="contact-widget__text">Liên hệ</span> */}
                </button>
            </div>
        </div>
    )
}
