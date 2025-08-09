import '../styles/layout/SiteHeader.css'
import { Link, NavLink } from 'react-router-dom'

export default function SiteHeader() {
  return (
    <div className="site-header" id="siteHeader">
      <div className="container header__row">
        <Link className="brand" to="/">
          <span className="brand__logo" aria-hidden>
            <img src="/senda.png" alt="Lá Nhỏ Bên Thềm" />
          </span>
          <span className="brand__name">Lá Nhỏ Bên Thềm</span>
        </Link>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <NavLink to="/" end> Sản phẩm </NavLink>
          <NavLink to="/huong-dan-mua-hang"> Hướng dẫn mua hàng </NavLink>
          <NavLink to="/cham-soc"> Chăm sóc </NavLink>
        </nav>
        <div className="header__actions">
          <div className="searchbar">
            <input
              className="searchbar__input"
              placeholder="Tìm sen đá, phụ kiện..."
              aria-label="Tìm kiếm sen đá, phụ kiện"
            />
          </div>
          <div className="header__icons">
            <NavLink className="header__icon" title="Tài khoản" to="/sign-in">
              <img src="/nguoidung.png" alt="Tài khoản" />
            </NavLink>
            <a className="header__icon" title="Yêu thích" href="#">
              <img src="/TraiTym.png" alt="Yêu thích" />
            </a>
            <a className="header__icon" title="Giỏ hàng" href="#">
              <img src="/MuaHang.png" alt="Giỏ hàng" />
            </a>
            <a className="header__icon" title="Thông báo" href="#">
              <img src="/Chuong.png" alt="Thông báo" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}


