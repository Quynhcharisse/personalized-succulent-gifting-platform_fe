
export default function Blogs() {
  const posts = [
    {
      id: 'huong-dan-tuoi-nuoc',
      title: 'Hướng dẫn tưới nước cho sen đá: Bí quyết để cây luôn khỏe mạnh!',
      author: 'Tòng Nguyễn Thanh',
      date: '18 Tháng 05, 2025',
      category: 'Hướng dẫn chăm sóc sen đá',
      img: 'huong-dan-tuoi-nuoc.jpg',
      url: 'https://www.vuonsenda.vn/blogs/news',
    },
    {
      id: 'ten-goi-cac-loai-sen-da',
      title: 'Tên gọi của các loại sen đá',
      author: 'Nguyễn Thanh Tòng',
      date: '15 Tháng 09, 2020',
      category: 'Hướng dẫn chăm sóc sen đá',
      url: 'https://www.vuonsenda.vn/blogs/news',
    },
    {
      id: '3-phuong-phap-nhan-giong',
      title: '3 Phương pháp nhân giống sen đá phổ biến',
      author: 'Nguyễn Thanh Tòng',
      date: '15 Tháng 09, 2020',
      category: 'Hướng dẫn chăm sóc sen đá',
      url: 'https://www.vuonsenda.vn/blogs/news',
    },
    {
      id: 'mua-mua-cham-soc',
      title: 'Mùa mưa chăm sóc sen đá thế nào?',
      author: 'Nguyễn Thanh Tòng',
      date: '15 Tháng 09, 2020',
      category: 'Hướng dẫn chăm sóc sen đá',
      url: 'https://www.vuonsenda.vn/blogs/news',
    },
    {
      id: '10-sai-lam',
      title: '10 Sai lầm ai cũng mắc khi chăm sóc sen đá',
      author: 'Nguyễn Thanh Tòng',
      date: '15 Tháng 09, 2020',
      category: 'Hướng dẫn chăm sóc sen đá',
      url: 'https://www.vuonsenda.vn/blogs/news',
    },
    {
      id: 'nhat-ky-30-ngay',
      title: 'Nhật ký chăm sóc sen đá trong vòng 30 ngày',
      author: 'Nguyễn Thanh Tòng',
      date: '15 Tháng 09, 2020',
      category: 'Hướng dẫn chăm sóc sen đá',
      url: 'https://www.vuonsenda.vn/blogs/news',
    },
  ]

  return (
    <div className="blogs">
      <div className="blogs__header">
        <h2 className="section-title">Góc chăm sóc sen đá</h2>
        <p className="muted small">Tổng hợp các bài viết hướng dẫn và kinh nghiệm thực tế (nguồn tham khảo: Vườn sen đá)</p>
      </div>

      <div className="blogs__grid">
        {posts.map((post) => (
          <article key={post.id} className="blog-card">
            <div className="blog-card__meta small muted">{post.category} • {post.date} • {post.author}</div>
            <h3 className="blog-card__title">{post.title}</h3>
            <div className="blog-card__actions">
              <a href={post.url} target="_blank" rel="noreferrer" className="btn btn--sm">Xem bài gốc</a>
            </div>
          </article>
        ))}
      </div>

      <div className="center mt-16">
        <a className="btn" href="https://www.vuonsenda.vn/blogs/news" target="_blank" rel="noreferrer">Xem thêm bài viết</a>
      </div>
    </div>
  )
}


