import '../styles/layout/SiteFooter.css'

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <span className="footer__logo" aria-hidden>
            <img src="/LaNhoBenThemLogo.png" alt="Lá Nhỏ Bên Thềm" />
          </span>
          <p className="footer__desc">
            Shop sen đá chuyên cung cấp combo mix sẵn và dịch vụ điện cây theo yêu cầu. Chúng tôi cam kết
            mang đến những chậu sen đá chất lượng, phù hợp khí hậu Sài Gòn, kèm chậu sứ, đất trồng và phụ kiện decor.
            Tại Lá Nhỏ Bên Thềm, mỗi sản phẩm đều được chăm chút tỉ mỉ để tạo nên không gian xanh thanh thiện, trong
            lành và cá nhân hóa cho từng góc nhỏ trong ngôi nhà bạn.
          </p>
        </div>
        <div>
          <h4 className="footer__title">QUICK LINK</h4>
          <ul className="footer__list">
            <li><a href="/public">Giỏ hàng</a></li>
            <li><a href="/public#san-pham">Sản phẩm</a></li>
            <li><a href="/cham-soc">Chăm sóc</a></li>
            <li><a href="/huong-dan-mua-hang">Hướng dẫn mua hàng</a></li>
          </ul>
        </div>
        <div>
          <h4 className="footer__title">Chính sách</h4>
          <ul className="footer__list">
            <li><a href="#">Khách hàng thân thiết</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
            <li><a href="#">Chính sách bảo hành</a></li>
            <li><a href="#">Chính sách vận chuyển</a></li>
          </ul>
          <p className="footer__hours small">Làm việc : Từ 9:00 đến 20:00 hằng ngày. Trừ chủ nhật</p>
          <div className="payments">
            <img className="payment-img" src="/mastercard_visa.png" alt="Visa & MasterCard" />
            <img className="payment-img" src="/mastercard.png" alt="MasterCard" />
            <img className="payment-img" src="/momo_card.jpg" alt="MoMo" />
            <img className="payment-img" src="/zalopaylogo-3.jpg" alt="ZaloPay" />
          </div>
        </div>
        <div>
          <h4 className="footer__title">Liên hệ</h4>
          <ul className="footer__list">
            <li>Email: support@lanhobenthem.local</li>
            <li>Phone: 0703346041</li>
            <li>FB: fb.com/lanhobenthem</li>
          </ul>
        </div>
      </div>
      <div className="container footer__bottom center">
        <p className="muted small">© {new Date().getFullYear()} Lá Nhỏ Bên Thềm. All rights reserved.</p>
      </div>
    </footer>
  )
}


