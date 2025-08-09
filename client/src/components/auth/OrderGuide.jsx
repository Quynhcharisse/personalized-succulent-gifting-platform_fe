
export default function OrderGuide() {
  document.title = 'Hướng dẫn mua hàng | Lá Nhỏ Bên Thềm'
  return (
    <div className="guide">
      <div className="container">
        <header className="guide__header">
          <h1>Hướng dẫn đặt hàng</h1>
          <p className="muted">Quý khách có thể đặt hàng trực tuyến thông qua 6 bước cơ bản dưới đây.</p>
        </header>

        <section className="guide__section">
          <h2>1. Tìm kiếm sản phẩm</h2>
          <p>Quý khách có thể tìm sản phẩm theo 3 cách:</p>
          <ul>
            <li>Gõ tên sản phẩm vào thanh tìm kiếm</li>
            <li>Tìm theo danh mục</li>
            <li>Duyệt các sản phẩm gợi ý trên trang</li>
          </ul>
        </section>

        <section className="guide__section">
          <h2>2. Thêm sản phẩm vào giỏ hàng</h2>
          <p>
            Khi đã tìm được sản phẩm mong muốn, vui lòng bấm vào hình hoặc tên sản phẩm để vào trang
            chi tiết, sau đó:
          </p>
          <ul>
            <li>Chọn loại chậu mong muốn</li>
            <li>Chọn số lượng mong muốn</li>
            <li>Thêm sản phẩm vào giỏ hàng</li>
          </ul>
        </section>

        <section className="guide__section">
          <h2>3. Kiểm tra giỏ hàng và đặt hàng</h2>
          <p>Để đặt nhiều sản phẩm khác nhau vào cùng 1 đơn hàng, vui lòng:</p>
          <ul>
            <li>Chọn “Tiếp tục mua sắm” hoặc bấm vào logo để về trang chủ</li>
            <li>Tiếp tục thêm sản phẩm vào giỏ như Bước 2 (lặp lại đến khi đủ sản phẩm)</li>
          </ul>
          <p>Sau đó, trong trang giỏ hàng:</p>
          <ul>
            <li>Điều chỉnh số lượng và cập nhật giỏ hàng</li>
            <li>Nhập mã giảm giá (nếu có)</li>
            <li>Ghi chú đơn hàng (ví dụ: màu chậu, giao giờ hành chính,...)</li>
            <li>Bấm “Thanh toán” để bắt đầu đặt hàng</li>
          </ul>
        </section>

        <section className="guide__section">
          <h2>4. Đăng nhập hoặc đăng ký tài khoản</h2>
          <p>
            Vui lòng đăng nhập bằng tài khoản đã có. Nếu chưa có tài khoản, chỉ cần điền các thông tin cần
            thiết theo mẫu để đăng ký nhanh.
          </p>
        </section>

        <section className="guide__section">
          <h2>5. Chọn phương thức thanh toán, nhập mã giảm giá (nếu có) và “Đặt mua”</h2>
          <p>
            Hỗ trợ giao hàng và thanh toán tận nơi cho đơn hàng từ 100.000đ đến 2.000.000đ tại một số quận
            nội thành TP.HCM. Vui lòng nhập mã giảm giá (nếu có) và bấm “Hoàn tất đơn hàng”. Hệ thống sẽ
            tạo đơn dựa trên thông tin quý khách đã đăng ký.
          </p>
        </section>

        <section className="guide__section">
          <h2>Giao hàng</h2>
          <h3>1) Khu vực và thời gian giao hàng</h3>
          <p>
            Các quận trong TP.HCM. Giao qua đơn vị vận chuyển, thời gian dự kiến 2–3 ngày sau khi đặt hàng.
          </p>
          <h3>2) Kiểm tra sản phẩm lúc nhận hàng</h3>
          <p>
            Khách hàng có thể kiểm tra sản phẩm lúc nhận hoặc sau khi nhận. Sản phẩm hư hỏng do vận chuyển
            sẽ được hoàn tiền 100%. Vui lòng liên hệ Zalo 0968 374 473 nếu có vấn đề liên quan đến đơn hàng
            (xin để lại tin nhắn nếu không gọi được).
          </p>
        </section>

        <section className="guide__section">
          <h2>Hướng dẫn thanh toán</h2>
          <p>Hỗ trợ giao hàng và thu tiền tại nhà (COD) theo chính sách áp dụng.</p>
        </section>

        <section className="guide__section">
          <h2>Xem lại đơn hàng</h2>
          <p>
            Vui lòng nhập đúng số điện thoại lúc đặt hàng để tra cứu. Lưu ý số điện thoại không có dấu cách ở
            đầu, giữa và cuối.
          </p>
        </section>
      </div>
    </div>
  )
}


