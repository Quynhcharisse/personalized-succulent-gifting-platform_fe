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

                    <p className="footer__copyright">© {new Date().getFullYear()} lanhobenthem.com</p>
                </div>
            </div>
        </footer>
    )
}


