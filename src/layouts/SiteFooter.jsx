import React from 'react'
import '../styles/ui/SiteFooter.css'

export default function SiteFooter() {
    const handleContactSubmit = (e) => {
        e.preventDefault()
        // Form submission logic here
        alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.')
    }

    return (
        <footer className="footer">
            {/* Contact Form Section - NEW VSenda Style */}
            <div id="lien-he" className="footer__contact-section">
                <div className="container footer__contact-wrapper">
                    <div className="footer__contact-left">
                        <h2 className="elementor-heading-title elementor-size-default footer__contact-title">LIÊN HỆ
                            NGAY</h2>
                    </div>
                    <div className="footer__contact-right">
                        <form
                            className="footer__contact-form elementor-form elementor-form-fields-wrapper elementor-labels-above"
                            onSubmit={handleContactSubmit}>
                            <input
                                type="text"
                                name="name"
                                className="footer__form-input elementor-field elementor-size-sm elementor-field-textual"
                                placeholder="Tên"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                className="footer__form-input elementor-field elementor-size-sm elementor-field-textual"
                                placeholder="Email"
                                required
                            />
                            <input
                                type="tel"
                                name="phone"
                                className="footer__form-input elementor-field elementor-size-sm elementor-field-textual"
                                placeholder="Số Điện Thoại"
                                required
                            />
                            <div className="e-form__buttons">
                                <button
                                    type="submit"
                                    className="footer__submit-btn elementor-button elementor-size-md elementor-animation-grow"
                                >
                                    Gửi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Chinh Logo*/}
            <div id="gioi-thieu" className="footer__top">
                <div className="container footer__top-content">
                    <div className="footer__brand">
                        <img className="footer__logo-large" src="/LaNhoBenThemLogo.png" alt="Lá Nhỏ Bên Thềm"/>
                        <p className="footer__tagline">Làm đẹp cho đời sống tinh thần</p>
                    </div>

                    <div className="footer__social">
                        <a href="#" className="footer__social-link" aria-label="Facebook">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                        <a href="#" className="footer__social-link" aria-label="Shop">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 25" fill="currentColor">
                                <path
                                    d="M17,5.3h2.1c1.7,0,3.1,1.4,3.1,3.1l1,10.3c0,3.5-2.7,6.3-6.2,6.3H6.7c-3.4,0-6.2-2.8-6.2-6.2l1-10.5c0-1.7,1.4-3,3.1-3h2.1C6.7,2.4,9,0,11.9,0s5.2,2.3,5.2,5.2ZM16,7.3H4.6c-.6,0-1,.5-1,1l-1,10.5c0,2.3,1.9,4.1,4.2,4h10.4c2.3,0,4.2-1.9,4.2-4.2l-1-10.3c0-.6-.4-1.1-1-1.1h-3.1ZM8.7,5.3h6.2c0-1.7-1.4-3.1-3.1-3.1s-3.1,1.4-3.1,3.1ZM14.3,12.4c0,0-.2-.1-.3-.2-.1,0-.3-.2-.6-.3-.2,0-.5-.2-.7-.2-.3,0-.5-.1-.8-.1-.5,0-.8,0-1.1.3-.2.2-.3.4-.3.7s0,.4.2.6c.1.1.4.3.7.4.3,0,.7.2,1.1.3.6.1,1.1.3,1.5.5.4.2.8.5,1,.8.2.3.3.8.3,1.3s0,.9-.3,1.2c-.2.3-.4.6-.7.8-.3.2-.7.4-1,.5-.4,0-.8.1-1.2.1s-.9,0-1.3-.1c-.4,0-.9-.2-1.3-.4-.4-.2-.8-.4-1.1-.6l.8-1.5c0,0,.2.2.4.3.2.1.4.2.7.4.3.1.6.2.9.3.3,0,.7.1,1,.1s.8,0,1.1-.2c.2-.2.4-.4.4-.7s0-.5-.3-.6c-.2-.1-.5-.3-.8-.4-.3-.1-.7-.2-1.2-.4-.6-.2-1-.3-1.4-.5-.4-.2-.7-.4-.8-.7-.2-.3-.3-.7-.3-1.1s.1-1.1.4-1.5c.3-.4.7-.7,1.2-.9.5-.2,1-.3,1.6-.3s.8,0,1.2.1c.4,0,.7.2,1,.4.3.1.6.3.9.5l-.8,1.4Z"/>
                            </svg>
                        </a>
                        <a href="#" className="footer__social-link" aria-label="TikTok">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                            </svg>
                        </a>
                        <a href="#" className="footer__social-link" aria-label="Instagram">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>
                    </div>

                    <p className="footer__copyright">© {new Date().getFullYear()} lanhobenthem.com</p>
                </div>
            </div>

            {/* Bottom Section: Grouped Info Panel */}
            <div className="footer__bottom-section">
                <div className="container">
                    <div className="footer__info-panel">
                        <div className="footer__grid">
                            <div className="footer__column">
                                <h4 className="footer__title">Sitemap</h4>
                                <ul className="footer__list">
                                    <li><a href="/">Trang chủ</a></li>
                                    <li><a href="/#ly-do">Giới thiệu</a></li>
                                    <li><a href="/custom-request">Điện cây</a></li>
                                    <li><a href="/#san-pham">Sản phẩm</a></li>
                                    <li><a href="/cham-soc">Chăm sóc</a></li>
                                </ul>
                            </div>
                            <div className="footer__column">
                                <h2 className="footer__title">Liên hệ</h2>
                                <ul className="footer__list">
                                    <li>Ho Chi Minh City, Vietnam</li>
                                    <li>Email: lanhobenthem@gmail.com</li>
                                    <li>Phone: 0886122578</li>
                                    <li>FB: https://bit.ly/lanhobenthem</li>
                                </ul>
                            </div>
                            <div className="footer__column">
                                <h4 className="footer__title">Chính sách</h4>
                                <ul className="footer__list">
                                    <li><a href="#">Điều khoản & Điều kiện</a></li>
                                    <li><a href="#">Chính sách giá</a></li>
                                    <li><a href="#">Chính sách trả hàng</a></li>
                                    <li><a href="#">Chính sách vận chuyển</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}


