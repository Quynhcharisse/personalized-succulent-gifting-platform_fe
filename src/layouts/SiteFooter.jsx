import React from 'react'
import '../styles/ui/SiteFooter.css'

export default function SiteFooter() {
    return (
        <footer className="footer">
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


