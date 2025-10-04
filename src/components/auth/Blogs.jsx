import React, {useState} from 'react'
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Chip,
    Collapse,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography
} from '@mui/material'
import {
    AccessTime as TimeIcon,
    ArrowForward as ArrowForwardIcon,
    CalendarToday as CalendarIcon,
    Close as CloseIcon,
    ExpandLess,
    ExpandMore
} from '@mui/icons-material'

// Component để render nội dung có hình ảnh
const ContentRenderer = ({content}) => {
    // Tách nội dung thành các dòng
    const lines = content.split('\n');

    return (<Box>
            {lines.map((line, index) => {
                const trimmedLine = line.trim();

                // Kiểm tra nếu là markdown image: ![alt](url)
                const markdownMatch = trimmedLine.match(/^!\[(.*?)\]\((.*?)\)$/);
                if (markdownMatch) {
                    const [, altText, src] = markdownMatch;
                    return (<Box key={index} sx={{my: 2}}>
                            <img
                                src={src}
                                alt={altText}
                                style={{
                                    width: '100%',
                                    maxWidth: '600px',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    display: 'block'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </Box>);
                }

                // Kiểm tra nếu là URL hình ảnh thuần túy: http://... hoặc https://...
                const urlMatch = trimmedLine.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg)(_grande\.jpg|\.jpg)?$/i);
                if (urlMatch) {
                    return (<Box key={index} sx={{my: 2}}>
                            <img
                                src={trimmedLine}
                                alt="Hình ảnh minh họa"
                                style={{
                                    width: '100%',
                                    maxWidth: '600px',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    display: 'block'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </Box>);
                }

                // Kiểm tra nếu là URL file.hstatic.net (không cần đuôi file)
                const hstaticMatch = trimmedLine.match(/^https?:\/\/file\.hstatic\.net\/.*$/i);
                if (hstaticMatch) {
                    return (<Box key={index} sx={{my: 2}}>
                            <img
                                src={trimmedLine}
                                alt="Hình ảnh minh họa"
                                style={{
                                    width: '100%',
                                    maxWidth: '600px',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    display: 'block'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </Box>);
                }

                // Nếu không phải hình ảnh, render như text thường
                if (trimmedLine) {
                    return (<Typography
                            key={index}
                            variant="body1"
                            sx={{
                                lineHeight: 1.8, mb: line === '' ? 1 : 0, '& strong': {
                                    color: 'primary.main', fontWeight: 700
                                }
                            }}
                        >
                            {line}
                        </Typography>);
                } else {
                    // Dòng trống tạo khoảng cách
                    return <Box key={index} sx={{height: '0.5rem'}}/>;
                }
            })}
        </Box>);
};

export default function Blogs() {
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedPost, setSelectedPost] = useState(null)
    const [expandedSections, setExpandedSections] = useState({})
    const [showAdditionalPosts, setShowAdditionalPosts] = useState(false)

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev, [sectionId]: !prev[sectionId]
        }))
    }

    const handleOpenPost = (post) => {
        setSelectedPost(post)
        setOpenDialog(true)
    }

    const handleClosePost = () => {
        setOpenDialog(false)
        setSelectedPost(null)
        setExpandedSections({})
    }

    const posts = [{
        id: 'huong-dan-tuoi-nuoc',
        title: 'Hướng dẫn tưới nước cho sen đá: Bí quyết để cây luôn khỏe mạnh!',
        author: 'Tòng Nguyễn Thanh',
        date: 'Thứ 6, 15 Tháng 11, 2025',
        category: 'Hướng dẫn chăm sóc sen đá',
        readTime: '5 phút đọc',
        description: '💧 Tưới nước đúng cách là yếu tố quan trọng nhất quyết định sự sống còn của sen đá. Khám phá những bí quyết vàng từ chuyên gia với hướng dẫn chi tiết từng bước, tần suất và những lưu ý quan trọng.',
        tags: ['Tưới nước', 'Chăm sóc cơ bản', 'Sen đá'],
        difficulty: 'Dễ',
        img: '/huongdantuoinuoc.webp',
        content: {
            intro: 'Chào mừng bạn quay trở lại Vườn sen đá! Hôm nay, chúng ta sẽ đi sâu vào một trong những khía cạnh quan trọng nhất và cũng là thách thức lớn nhất khi chăm sóc sen đá: cách tưới nước đúng chuẩn. Dù sen đá nổi tiếng với khả năng chịu hạn, việc tưới nước sai cách lại là nguyên nhân hàng đầu khiến chúng "ra đi" đấy!',
            sections: [{
                id: 'nguyen-tac-vang', title: 'Nguyên tắc Vàng: "Ngâm và Khô" (Soak and Dry)', content: `Đây là phương pháp tưới nước cơ bản và hiệu quả nhất cho sen đá. Hãy nhớ kỹ:

                        Tưới thật đẫm: Đổ nước từ từ và đều khắp bề mặt đất cho đến khi bạn thấy nước chảy ra từ lỗ thoát nước dưới đáy chậu. Đảm bảo toàn bộ đất trong chậu được làm ẩm hoàn toàn.

                        Để nước thoát hoàn toàn: Sau khi tưới, hãy để nước thừa chảy hết. Đừng bao giờ để chậu sen đá của bạn ngâm trong nước đọng ở đĩa lót hoặc khay, vì điều này chắc chắn sẽ dẫn đến thối rễ.

                        Đợi đất khô hoàn toàn: Đây là bước quan trọng nhất! Hãy chờ đến khi đất trong chậu khô cong, không còn ẩm chút nào, rồi mới tưới đợt tiếp theo.`
            },

                {
                    id: 'cach-kiem-tra', title: 'Làm thế nào để biết khi nào cần tưới?', content: `Đừng bao giờ tưới nước cho sen đá theo một lịch trình cố định. Thay vào đó, hãy kiểm tra độ ẩm của đất:

                        Kiểm tra bằng ngón tay: Cắm ngón tay sâu khoảng 2-3cm vào đất. Nếu cảm thấy khô ráo, đó là lúc cây cần nước.

                        Quan sát bằng mắt: Đất khô thường có màu nhạt hơn và có thể co lại một chút, tạo ra khoảng trống nhỏ giữa đất và thành chậu.

                        Cân trọng lượng chậu: Một chậu sen đá khô sẽ nhẹ hơn đáng kể so với một chậu vừa được tưới.

                        Quan sát cây: Lá sen đá hơi héo, nhăn nheo hoặc mềm nhũn đôi khi là dấu hiệu của việc cây đang khát.`
                },

                {
                    id: 'tan-suat-tuoi', title: 'Tần suất tưới nước: Không có con số cố định!', content: `Tần suất tưới nước phụ thuộc vào nhiều yếu tố:

                    Mùa trong năm:
                    Mùa sinh trưởng (xuân và hè): 1-2 tuần/lần
                    Mùa nghỉ (thu và đông): 3-4 tuần/lần hoặc lâu hơn

                    Khí hậu:
                    Nóng và khô: Cần tưới thường xuyên hơn
                    Mát mẻ và ẩm ướt: Có thể không cần tưới trong nhiều tuần

                    Các yếu tố khác:
                    Ánh sáng: Nhiều ánh sáng = tiêu thụ nước nhiều hơn
                    Kích thước chậu: Chậu nhỏ khô nhanh hơn
                    Loại đất: Đất thoát nước tốt khô nhanh hơn`
                },

                {
                    id: 'thoi-diem-tuoi',
                    title: 'Thời điểm tốt nhất để tưới nước',
                    content: `Nên tưới nước cho sen đá vào buổi sáng sớm. Điều này giúp đất có thời gian khô ráo trong ngày, giảm thiểu nguy cơ độ ẩm tồn đọng quá lâu. Tránh tưới vào buổi tối muộn vì đất ẩm qua đêm dễ sinh nấm bệnh.`
                }, {
                    id: 'luu-y-quan-trong', title: 'Những lưu ý quan trọng khác', content: `💧 Nguyên tắc tưới nước cơ bản:

                        1. Tưới vào đất, không tưới lên lá: Hạn chế việc để nước đọng trên lá, đặc biệt ở phần lõi để tránh thối nhũn.

                        2. Sử dụng chậu có lỗ thoát nước: Điều kiện bắt buộc! Nước thừa phải được thoát ra ngoài.

                        3. Sử dụng đất thoát nước tốt: Chọn đất chuyên dụng cho sen đá hoặc trộn với perlite, pumice, xỉ than.

                        4. Không phun sương: Phun sương không cung cấp đủ nước cho rễ và tạo điều kiện cho nấm phát triển.

                        5. Tưới "đẫm" nhưng không "ngâm": Đảm bảo nước chảy ra khỏi lỗ thoát nước, sau đó để ráo hoàn toàn.`
                }, {
                    id: 'dau-hieu-sai-cach', title: 'Dấu hiệu của việc tưới nước sai cách', content: `Úng nước (Overwatering):
                        1. Lá chuyển màu vàng, nhũn, trong mờ và mềm
                        2. Lá dễ rụng khi chạm vào
                        3. Thân cây mềm nhũn, có đốm đen hoặc nâu
                        4. Có mùi hôi từ đất

                        Thiếu nước (Underwatering):
                        1. Lá teo tóp, nhăn nheo, khô lại và giòn
                        2. Cây có vẻ yếu ớt, không căng mọng
                        
                        Bằng cách tuân thủ nguyên tắc "ngâm và khô" và quan sát kỹ cây, bạn sẽ sớm trở thành bậc thầy trong việc tưới nước cho sen đá. Hãy nhớ: thà để cây khát một chút còn hơn là để cây úng nước!`
                }]
        }
    }, {
        id: 'ten-goi-cac-loai-sen-da',
        title: 'Tên gọi của các loại sen đá',
        author: 'Nguyễn Thanh Tòng',
        date: 'Chủ nhật, 23 Tháng 11, 2025',
        category: 'Kiến thức cơ bản',
        readTime: '7 phút đọc',
        description: '🌿 Khám phá thế giới đa dạng của sen đá với hàng trăm loài khác nhau. Cùng tìm hiểu tên gọi khoa học và tên thường gọi của các loại sen đá phổ biến tại Việt Nam qua video hướng dẫn chi tiết.',
        tags: ['Phân loại', 'Kiến thức', 'Đa dạng sinh học'],
        difficulty: 'Trung bình',
        img: 'https://file.hstatic.net/1000187613/article/3114278_501865876025351308_n_copy_e916b1c9aa604492b627610d379c113f_5b930c122bc84777b7b8fc3f16deeb60.jpg',
        content: {
            intro: 'Sen đá thuộc họ Crassulaceae với hơn 400 loài khác nhau trên toàn thế giới. Mỗi loài có đặc điểm riêng về hình dáng, màu sắc và cách chăm sóc.',
            videoUrl: 'https://youtu.be/C7ytQoOSN2I',
            sections: [{
                id: 'video-huong-dan', title: '🎥 Video hướng dẫn nhận biết các loại sen đá', content: `Xem video chi tiết để nhận biết và phân biệt các loại sen đá phổ biến:

                        Nội dung video bao gồm:
                        Cách nhận biết sen đá qua hình dáng lá
                        Đặc điểm màu sắc của từng loài
                        Kích thước và cách phát triển
                        Mẹo phân biệt các loài tương tự
                        Video này sẽ giúp bạn nhận biết chính xác các loại sen đá phổ biến và tránh nhầm lẫn khi mua sắm.`
            }, {
                id: 'sen-da-pho-bien', title: 'Các loại sen đá phổ biến tại Việt Nam', content: `Echeveria (Sen đá hoa hồng):
                        Echeveria elegans - Sen đá trắng: Lá dày, màu xanh bạc với viền hồng nhạt
                        Echeveria pulidonis - Sen đá xanh bạc: Lá có viền đỏ cam đặc trưng
                        Echeveria Black Prince - Sen đá đen: Lá màu tím đen, rất độc đáo

                        Sedum (Sen đá bông):
                        Sedum morganianum - Đuôi lừa: Thân dài rủ xuống, lá nhỏ xếp chồng
                        Sedum rubrotinctum - Đậu xanh đỏ: Lá hình hạt đậu, đầu lá chuyển đỏ khi có ánh sáng
                        Sedum adolphii - Sen đá vàng: Lá dày, màu vàng xanh
                        
                        Sempervivum (Sen đá nhện):
                        Sempervivum tectorum - Sen đá mái nhà: Hình hoa hồng, có lông mịn
                        Sempervivum arachnoideum - Sen đá tơ nhện: Có sợi trắng như tơ nhện phủ trên lá
                        
                        Mẹo nhận biết:
                        1. Quan sát hình dáng tổng thể của cây
                        2. Chú ý đến màu sắc và texture của lá
                        3. Xem cách lá xếp chồng lên nhau
                        4. Kiểm tra có lông tơ hay không`
            }, {
                id: 'cach-phan-biet', title: 'Cách phân biệt các loại sen đá tương tự', content: `Echeveria vs Sempervivum:
                        1. Echeveria: Lá mịn, bóng, không có lông
                        2. Sempervivum: Thường có lông mịn, chịu lạnh tốt hơn

                        Sedum vs Crassula:
                        1. Sedum: Lá thường nhỏ, mọc xen kẽ
                        2. Crassula: Lá mọc đối xứng, dày hơn

                        Haworthia vs Aloe nhỏ:
                        1. Haworthia: Lá có đốm trắng, không gai
                        2. Aloe: Lá có gai nhỏ ở viền

                        Việc nhận biết chính xác tên loài sẽ giúp bạn chăm sóc đúng cách và tìm hiểu thêm thông tin chuyên sâu về từng loại.`
            }]
        }
    }, {
        id: '3-phuong-phap-nhan-giong',
        title: '3 Phương pháp nhân giống sen đá phổ biến',
        author: 'Nguyễn Thanh Tòng',
        date: 'Thứ 3, 05 Tháng 11, 2025',
        category: 'Kỹ thuật nâng cao',
        readTime: '10 phút đọc',
        description: '🌱 Học cách nhân giống sen đá bằng lá, chồi bên và chia cụm một cách hiệu quả. Mỗi phương pháp có ưu nhược điểm riêng, phù hợp với từng loại sen đá khác nhau. Tạo vườn sen đá của riêng bạn!',
        tags: ['Nhân giống', 'Kỹ thuật', 'Lá cành'],
        difficulty: 'Nâng cao',
        img: 'https://file.hstatic.net/1000187613/article/57015457904_7174790791213088768_n_fb56bd2012fd4b098a7b92312258f9ad_3f24a91b5c884ff88621dadf66d5c4c8.jpg',
        content: {
            intro: 'Nhân giống sen đá là cách tuyệt vời để mở rộng bộ sưu tập mà không tốn chi phí. Có 3 phương pháp chính được sử dụng phổ biến: nhân giống bằng lá, chồi bên và chia cụm.',
            videoUrl: 'https://youtu.be/QgtHwOEW1VU',
            sections: [{
                id: 'video-huong-dan-nhan-giong',
                title: '🎥 Video hướng dẫn chi tiết 3 phương pháp nhân giống',
                content: `Xem video hướng dẫn từng bước cách nhân giống sen đá hiệu quả:

                        Nội dung video bao gồm:
                        1. Cách chọn lá khỏe mạnh để nhân giống
                        2. Kỹ thuật tách chồi bên an toàn
                        3. Phương pháp chia cụm đúng cách
                        4. Chuẩn bị đất và môi trường phù hợp
                        Video này sẽ giúp bạn thực hành thành công các phương pháp nhân giống sen đá ngay tại nhà.`
            }, {
                id: 'nhan-giong-bang-la', title: '1. Phương pháp nhân giống bằng lá 🍃', content: `Đây là phương pháp phổ biến và dễ thực hiện nhất:

                        Bước 1: Chọn lá
                        1. Chọn lá khỏe mạnh, đầy đặn từ cây mẹ
                        2. Lá phải còn nguyên vẹn, không bị thương tổn
                        3. Bứt lá từ gốc một cách nhẹ nhàng, đảm bảo có đầu lá

                        Bước 2: Để khô vết thương
                        1. Để lá ở nơi khô ráo, thoáng mát 2-3 ngày
                        2. Vết bứt cần khô hoàn toàn để tránh thối

                        Bước 3: Đặt lên đất
                        1. Dùng đất chuyên dụng cho sen đá hoặc đất cát pha
                        2. Đặt lá lên bề mặt đất, không chôn sâu
                        3. Giữ độ ẩm vừa phải cho đất

                        Bước 4: Chăm sóc và chờ đợi
                        1. Phun sương nhẹ 2-3 ngày/lần
                        2. Sau 2-4 tuần sẽ xuất hiện rễ và chồi non
                        3. Khi cây con đủ lớn (3-5cm) có thể tách riêng

                        Tỷ lệ thành công: 70-80% với hầu hết các loại sen đá`
            }, {
                id: 'nhan-giong-bang-choi-ben', title: '2. Phương pháp nhân giống bằng chồi bên 🌿', content: `Phù hợp với sen đá có khả năng đẻ chồi bên:

                        Bước 1: Xác định chồi bên
                        1. Chồi bên mọc từ thân chính của cây mẹ
                        2. Chọn chồi đã có kích thước ít nhất 2-3cm
                        3. Đảm bảo chồi có hệ rễ riêng hoặc điểm phát rễ

                        Bước 2: Tách chồi
                        1. Dùng dao sắc, khử trùng để cắt chồi
                        2. Cắt sát gốc, để lại một chút thân gốc
                        3. Tránh làm tổn thương cây mẹ

                        Bước 3: Xử lý vết cắt
                        1. Rắc bột quế hoặc than hoạt tính lên vết cắt
                        2. Để khô 1-2 ngày ở nơi thoáng mát
                        3. Quan sát vết cắt có khô ráo không

                        Bước 4: Trồng chồi mới
                        1. Trồng vào chậu nhỏ với đất tơi xốp
                        2. Tưới nước nhẹ, tránh úng
                        3. Đặt ở nơi sáng nhưng không ánh sáng trực tiếp

                        Thời gian: Chồi sẽ ổn định sau 1-2 tuần
                        Tỷ lệ thành công: 85-90%`
            }, {
                id: 'nhan-giong-bang-chia-cum', title: '3. Phương pháp chia cụm 🌺', content: `Áp dụng cho sen đá phát triển thành cụm lớn:

                        Bước 1: Chuẩn bị
                        1. Ngừng tưới nước 3-5 ngày trước khi chia
                        2. Chuẩn bị chậu mới và đất sạch
                        3. Khử trùng dụng cụ cắt

                        Bước 2: Lấy cây ra khỏi chậu
                        1. Lật úp chậu, nhẹ nhàng lấy cây ra
                        2. Giũ sạch đất cũ ở rễ
                        3. Quan sát hệ rễ và điểm chia

                        Bước 3: Chia cụm
                        1. Tách từng cây con có rễ riêng
                        2. Có thể dùng dao để cắt nếu cần thiết
                        3. Mỗi cây con cần có ít nhất 2-3 lá và một ít rễ

                        Bước 4: Trồng riêng
                        1. Trồng mỗi cây vào chậu riêng
                        2. Dùng đất mới, tơi xốp
                        3. Tưới nước nhẹ sau 2-3 ngày

                        Thời gian phục hồi: 1-2 tuần
                        Tỷ lệ thành công: 95-98%

                        Lưu ý quan trọng:
                        1. Thực hiện vào mùa xuân hoặc đầu mùa hè
                        2. Tránh chia cụm khi cây đang ra hoa
                        3. Theo dõi cây sát trong 2 tuần đầu`
            }, {
                id: 'luu-y-chung', title: '📋 Lưu ý chung cho tất cả phương pháp', content: `Môi trường lý tưởng:
                        1. Nhiệt độ: 18-25°C
                        2. Độ ẩm: 40-60%
                        3. Ánh sáng: Sáng nhưng không trực tiếp
                        4. Thông gió tốt

                        Đất trồng:
                        1. Đất cát pha với perlite (tỷ lệ 1:1)
                        2. Thêm một ít xỉ than hoặc vỏ trấu hun
                        3. pH từ 6.0-7.0
                        4. Thoát nước cực tốt

                        Chăm sóc sau nhân giống:
                        1. 2 tuần đầu: Tưới rất ít, chỉ phun sương nhẹ
                        2. Tuần 3-4: Bắt đầu tưới nước bình thường
                        3. Tháng đầu: Không bón phân
                        4. Sau 1 tháng: Có thể bón phân loãng

                        Thời điểm tốt nhất:
                        1. Mùa xuân (tháng 3-5): Lý tưởng nhất
                        2. Đầu mùa hè (tháng 6): Cũng tốt
                        3. Tránh mùa đông và giữa mùa hè

                        Dấu hiệu thành công:
                        1. Lá xanh tươi, căng mọng
                        2. Xuất hiện lá mới
                        3. Rễ phát triển tốt
                        4. Cây đứng vững`
            }]
        }
    }, {
        id: 'mua-mua-cham-soc',
        title: 'Mùa mưa chăm sóc sen đá thế nào?',
        author: 'Nguyễn Thanh Tòng',
        date: 'Thứ 4, 12 Tháng 11, 2025',
        category: 'Chăm sóc theo mùa',
        readTime: '8 phút đọc',
        description: '☔ Mùa mưa là thử thách lớn đối với sen đá. Khám phá những bí quyết chuyên gia để bảo vệ cây khỏi úng rễ, thối thân và các bệnh do độ ẩm cao. Giữ sen đá luôn khỏe mạnh cả mùa mưa!',
        tags: ['Mùa mưa', 'Phòng bệnh', 'Chăm sóc đặc biệt'],
        difficulty: 'Trung bình',
        img: 'https://file.hstatic.net/1000187613/article/img_6097_copy_0958f7b8930a4224a83002a1f965e110_ffe532ad87024513811b08820f523d70.jpg',
        content: {
            intro: 'Mùa mưa với độ ẩm cao và ít ánh sáng là thử thách lớn cho sen đá. Tuy nhiên, với những biện pháp đúng đắn, bạn hoàn toàn có thể giữ cho sen đá khỏe mạnh và phát triển tốt ngay cả trong mùa khó khăn này.',
            videoUrl: 'https://youtu.be/yurv8gG9Dq4',
            sections: [{
                id: 'video-cham-soc-mua-mua', title: '🎥 Video hướng dẫn chăm sóc sen đá mùa mưa', content: `Xem video chi tiết về cách chăm sóc sen đá hiệu quả trong mùa mưa:

                        Nội dung video bao gồm:
                        1. Cách di chuyển sen đá tránh mưa trực tiếp
                        2. Kỹ thuật thoát nước và thông gió
                        3. Phòng ngừa nấm bệnh trong môi trường ẩm ướt
                        4. Điều chỉnh lịch tưới nước phù hợp

                        Video này sẽ giúp bạn nắm vững các kỹ thuật chăm sóc sen đá chuyên nghiệp trong mùa mưa.`
            }, {
                id: 'van-de-mua-mua', title: '⚠️ Những thách thức chính trong mùa mưa', content: `1. Độ ẩm cao (70-90%)
                        + Tạo điều kiện lý tưởng cho nấm phát triển
                        + Làm chậm quá trình bay hơi nước từ đất
                        + Tăng nguy cơ thối rễ và thối thân

                        2. Ít ánh sáng mặt trời
                        + Cây quang hợp kém, sức đề kháng giảm
                        + Lá có thể bị nhạt màu, mất độ căng mọng
                        + Cây phát triển chậm lại đáng kể

                        3. Nước mưa trực tiếp
                        + Có thể chứa tạp chất và vi khuẩn có hại
                        + Gây úng nước nếu hệ thống thoát nước kém
                        + Rửa trôi dinh dưỡng trong đất

                        4. Nhiệt độ thấp (18-22°C)
                        + Cây chuyển sang chế độ "ngủ đông"
                        + Giảm khả năng hấp thụ nước và dinh dưỡng
                        + Tăng thời gian hồi phục khi bị tổn thương

                        5. Thông gió kém
                        + Không khí ẩm ướt, ứ đọng
                        + Tạo môi trường ủ bệnh
                        + Làm chậm quá trình làm khô đất sau tưới`
            }, {
                id: 'bien-phap-phong-ngua', title: '🛡️ Biện pháp phòng ngừa và bảo vệ', content: `Di chuyển vị trí:
                        + Chuyển sen đá vào chỗ có mái che
                        + Tránh để cây ngoài trời khi mưa lớn
                        + Đặt ở ban công có mái hiên hoặc trong nhà

                        Cải thiện thoát nước:
                        + Kiểm tra lỗ thoát nước có bị tắc không
                        + Thêm lớp sỏi dăm dưới đáy chậu
                        + Nâng cao chậu khỏi mặt đất bằng gạch/đá

                        Tăng cường thông gió:
                        + Đặt quạt nhỏ để tạo luồng không khí
                        + Không đặt cây quá sát nhau
                        + Mở cửa sổ để tạo gió tự nhiên

                        Sử dụng đèn bổ sung:
                        + Đèn LED phổ đầy đủ 6-8 giờ/ngày
                        + Đặt cách cây 30-50cm
                        + Bật đèn vào buổi sáng và chiều

                        Kiểm soát độ ẩm:
                        + Sử dụng máy hút ẩm nếu cần thiết
                        + Đặt cây gần cửa sổ có nắng lọt
                        + Tránh phun sương trong mùa mưa`
            }, {
                id: 'dieu-chinh-cham-soc', title: '🔧 Điều chỉnh cách chăm sóc', content: `Giảm tần suất tưới nước:
                        + Từ 1-2 tuần/lần xuống 3-4 tuần/lần
                        + Chỉ tưới khi đất thật sự khô cong
                        + Tưới vào buổi sáng để có thời gian bay hơi

                        Thay đổi thành phần đất:
                        + Tăng tỷ lệ perlite và pumice (60-70%)
                        + Giảm thành phần đất hữu cơ
                        + Thêm than hoạt tính để chống nấm

                        Ngừng bón phân:
                        + Không bón phân trong mùa mưa
                        + Cây phát triển chậm, không cần nhiều dinh dưỡng
                        + Phân dư thừa có thể gây thối rễ

                        Quan sát và loại bỏ:
                        + Kiểm tra cây hàng ngày
                        + Loại bỏ lá úng, thối ngay lập tức
                        + Cắt bỏ phần bệnh bằng dao khử trùng

                        Xử lý khi phát hiện nấm:
                        + Phun fungicide hữu cơ (neem oil)
                        + Tăng thông gió và giảm độ ẩm
                        + Cách ly cây bị bệnh khỏi cây khỏe`
            }, {
                id: 'phuong-phap-nang-cao', title: '⚡ Phương pháp chăm sóc nâng cao', content: `Tạo môi trường micro:
                        + Dùng khay sỏi để tạo độ ẩm cục bộ
                        + Nhóm cây cùng loại lại với nhau
                        + Sử dụng màng phủ trong suốt nếu cần

                        Thay đổi chậu trồng:
                        + Chuyển sang chậu đất nung thay vì nhựa
                        + Chậu đất nung thoát ẩm tốt hơn
                        + Kích thước vừa phải, không quá lớn

                        Điều chỉnh pH đất:
                        + Kiểm tra pH duy trì ở mức 6.5-7.0
                        + Đất acid dễ sinh nấm hơn
                        + Thêm vôi nông nghiệp nếu đất quá acid

                        Sử dụng chất chống nấm tự nhiên:
                        + Rắc bột quế lên bề mặt đất
                        + Pha nước tỏi loãng để phun lá
                        + Dùng nước pha baking soda (1 tsp/1 lít)

                        Lập kế hoạch dài hạn:
                        + Chuẩn bị từ trước mùa mưa
                        + Tạo kho chứa cây trong nhà
                        + Đầu tư hệ thống đèn và quạt chuyên dụng`
            }, {
                id: 'dau-hieu-canh-bao', title: '🚨 Dấu hiệu cảnh báo cần xử lý ngay', content: `Dấu hiệu nguy hiểm:
                        Lá chuyển màu vàng, trong suốt
                        + Thân cây mềm nhũn khi chạm vào
                        + Xuất hiện đốm đen hoặc nâu trên lá
                        + Có mùi hôi thối phát ra từ đất hoặc cây

                        Biện pháp khẩn cấp:
                        + Ngừng tưới nước ngay lập tức
                        + Di chuyển cây đến nơi khô ráo, thoáng mát
                        + Cắt bỏ phần bệnh, để khô vết cắt
                        + Thay đất mới hoàn toàn nếu cần

                        Khi nào nên cầu cứu chuyên gia:
                        + Nhiều cây bị bệnh cùng lúc
                        + Đã thử nhiều cách nhưng không khỏi
                        + Cây quý hiếm, có giá trị cao
                        + Không chắc chắn về cách xử lý

                        Phòng ngừa tái phát:
                        + Khử trùng dụng cụ sau mỗi lần sử dụng
                        + Cách ly cây mới về ít nhất 2 tuần
                        + Không tái sử dụng đất cũ đã từng bị bệnh
                        + Ghi chép nhật ký chăm sóc để rút kinh nghiệm`
            }]
        }
    }, {
        id: '10-sai-lam',
        title: '10 Sai lầm ai cũng mắc khi chăm sóc sen đá',
        author: 'Vườn Sen Đá Việt Nam',
        date: 'Thứ 7, 09 Tháng 11, 2025',
        category: 'Kinh nghiệm thực tế',
        readTime: '12 phút đọc',
        description: '⚠️ Tổng hợp những sai lầm phổ biến nhất mà người mới bắt đầu thường mắc phải. Từ việc tưới nước sai cách đến chọn chậu không phù hợp. Kinh nghiệm thực tế từ vườn sen đá lâu năm tại Sài Gòn!',
        tags: ['Sai lầm thường gặp', 'Kinh nghiệm', 'Người mới'],
        difficulty: 'Dễ',
        img: 'http://file.hstatic.net/1000187613/article/img_39741.jpg',
        content: {
            intro: 'Vườn nhận được rất nhiều câu hỏi liên quan đến việc sen đá có dễ trồng hay không? Thường đối với câu hỏi này vườn rất ít trả lời "Có" hoặc "Không". Vì chăm sóc sen đá không hẳn dễ hoặc khó, mà quan trọng là bạn có chăm sóc đúng cách hay không. Với kinh nghiệm trồng sen đá lâu năm tại Sài Gòn, vườn xin chia sẻ những sai lầm phổ biến để giúp các bạn vừa tiếp xúc với sen đá.',
            sections: [{
                id: 'sai-lam-tuoi-it-nuoc', title: '1️⃣ Sai lầm: Tưới nước rất ít vì sợ cây úng', content: `Quan niệm sai lầm phổ biến:
                        Rất nhiều bạn nghĩ rằng sen đá là cây mọng nước do đó cần rất ít nước, hoặc thậm chí có bạn không tưới nước cho cây trong thời gian dài. Quan niệm này hoàn toàn sai!

                        Hậu quả của việc tưới ít nước:
                        + Cây hầu như sẽ không phát triển
                        + Dần dần vàng lá ở phía dưới và rụng dần
                        + Cây bắt đầu sử dụng lượng nước dự trữ trong cơ thể
                        + Lá sẽ teo tóp và rụng dần

                        Nguyên nhân cây bị úng khi tưới nước:
                        + Chưa chọn đúng đất trồng
                        + Chưa chọn đúng loại chậu
                        + Hỗn hợp đất không thoáng và thoát nước chậm

                        Giải pháp đúng:
                        + Trộn đất với perlite, pumice hoặc than tổ ong
                        + Tuyệt đối không dùng đất sạch bán ngoài thị trường
                        + Sử dụng chậu đất nung để giúp đất mau khô hơn
                        + Tưới đẫm nhưng đảm bảo thoát nước tốt`
            }, {
                id: 'sai-lam-chau-qua-to', title: '2️⃣ Sai lầm: Trồng cây nhỏ trong chậu rất to', content: `Tại sao không nên trồng cây nhỏ trong chậu quá to:
                        1. Chậu to → lượng đất nhiều → giữ lại rất nhiều nước
                        2. Cây nhỏ có nhu cầu nước ít
                        3. Nước dư thừa gây úng rễ cho cây

                        Nguyên lý chọn chậu:
                        Giống như quần áo mặc trên người, tùy theo từng giai đoạn mà thay chậu vừa vặn với cây thì cây sẽ phát triển tốt nhất.

                        Khi nào cần thay chậu lớn hơn:
                        + Theo dõi lỗ thoát nước phía dưới chậu
                        + Khi thấy rễ bắt đầu bò ra ngoài → thay chậu lớn hơn

                        Mẹo chọn chậu phù hợp:
                        + Chậu vừa với kích thước cây hiện tại
                        + Để dư 1-2cm mỗi bên so với đường kính cây
                        + Ưu tiên chậu đất nung thay vì nhựa`
            }, {
                id: 'sai-lam-khong-thay-dat', title: '3️⃣ Sai lầm: Không thay đất khi vừa mua về', content: `Tại sao cần thay đất khi mua về:
                        + Hầu hết sen đá được trồng và nhân giống tại Đà Lạt
                        + Khí hậu Đà Lạt lạnh khô → đất cần giữ nước cao
                        + Khí hậu Sài Gòn nóng ẩm → đất cần thoát nước nhanh

                        Phân biệt cây đã thay đất và chưa thay đất:
                        + Cây trong bịch nhựa/chậu nhựa: Chưa được thay đất
                        + Cây trong chậu đất nung: Đã thay đất phù hợp

                        Lời khuyên khi mua:
                        + Mua cây trong chậu đất nung nếu không muốn thay đất
                        + Mua cây trong bịch nhựa nếu muốn tự trồng theo ý thích
                        + Nhớ mua kèm đất trồng chuyên dụng

                        Cách thay đất đúng cách:
                        + Lấy cây ra khỏi chậu cũ
                        + Rũ sạch đất cũ ở rễ
                        + Trồng vào đất mới phù hợp với khí hậu địa phương`
            }, {
                id: 'sai-lam-trong-phong-may-lanh',
                title: '4️⃣ Sai lầm: Nghĩ sen đá không trồng được trong máy lạnh',
                content: `Quan niệm sai lầm:
                        Nhiều bạn nghĩ rằng để trong máy lạnh, lạnh quá nên cây không sống được. Điều này hoàn toàn sai!

                        Sự thật:
                        + Hầu hết cây trồng ở nơi có khí hậu lạnh đều phát triển rất tốt
                        + Sen đá thích môi trường mát mẻ hơn là nóng bức

                        Vấn đề thực sự:
                        + Không phải lúc bạn mở máy lạnh
                        + Mà là lúc bạn tắt máy lạnh và đóng cửa phòng
                        + Cuối ngày hoặc cuối tuần phòng rất ngợp và nóng
                        + Lúc đó cây mới bị ảnh hưởng

                        Giải pháp:
                        + Chuyển cây ra chỗ thông thoáng và mát mẻ khi đóng cửa phòng
                        + Đặt cây gần cửa sổ có gió tự nhiên
                        + Sử dụng quạt nhỏ để tạo luồng không khí
                        + Tránh để cây trong không gian kín, ngợp`
            }, {
                id: 'sai-lam-trong-bang-hat', title: '5️⃣ Sai lầm: Tin vào việc trồng sen đá bằng hạt giả', content: `Câu hỏi phổ biến: Sen đá có trồng được bằng hạt hay không?

                        Câu trả lời: CÓ, NHƯNG hạt sen đá cực kì khó kiếm!

                        Quy trình để có hạt sen đá thật:
                        + Chăm sóc cho sen đá ra hoa (rất khó)
                        + Biết cách thụ phấn cho hoa đậu thành trái
                        + Thu hoạch hạt từ trái (số lượng cực ít)
                        + Giai đoạn này rất khó và tỷ lệ thành công thấp

                        Cảnh báo về hạt giả:
                        + Hạt giống bán tràn lan trên mạng với số lượng lớn
                        + Giá thành rất rẻ
                        + Đa số là hạt giả
                        + Nếu không tin, có thể thử nhưng sẽ thất vọng

                        Cách nhân giống sen đá đúng:
                        + Nhân giống bằng lá
                        + Nhân giống bằng chồi bên
                        + Chia cụm sen đá lớn
                        + Đây là những cách hiệu quả và dễ thành công`
            }, {
                id: 'sai-lam-dung-dat-sach', title: '6️⃣ Sai lầm: Sử dụng đất sạch thương mại', content: `Vấn đề với đất sạch bán sẵn:
                        + Đất sạch giữ nước rất lâu
                        + Không phù hợp với sen đá cần thoát nước nhanh
                        + Dễ gây úng nước và thối rễ

                        Đất trồng sen đá lý tưởng:
                        + Thoáng và thoát nước nhanh
                        + Trộn với perlite, pumice, than tổ ong
                        + Tỷ lệ: 50% đất sạch + 50% vật liệu thoát nước

                        Cách kiểm tra đất tốt:
                        + Tưới nước và quan sát
                        + Nước phải chảy qua nhanh, không đọng lại
                        + Đất khô trong 2-3 ngày ở điều kiện bình thường

                        Mua đất ở đâu:
                        + Đất chuyên dụng cho sen đá
                        + Tự trộn theo hướng dẫn chuyên gia
                        + Tránh mua đất sạch thông thường`
            }, {
                id: 'sai-lam-khong-chau-thoat-nuoc', title: '7️⃣ Sai lầm: Dùng chậu không có lỗ thoát nước', content: `Tầm quan trọng của lỗ thoát nước:
                        + Điều kiện bắt buộc số 1 cho sen đá
                        + Không có lỗ thoát = cây chết chắc chắn
                        + Nước đọng sẽ làm thối rễ

                        Các loại chậu không nên dùng:
                        + Chậu thủy tinh không lỗ
                        + Chậu sứ trang trí kín đáy
                        + Chậu nhựa không khoan lỗ

                        Lựa chọn chậu tốt:
                        + Chậu đất nung (tốt nhất)
                        + Chậu xi măng có lỗ thoát
                        + Chậu nhựa có sẵn lỗ thoát

                        Cách tạo lỗ thoát nước:
                        + Dùng mũi khoan để tạo lỗ
                        + Đường kính lỗ 8-10mm
                        + Tạo 3-5 lỗ cho chậu trung bình`
            }, {
                id: 'sai-lam-dat-sai-vi-tri', title: '8️⃣ Sai lầm: Đặt sen đá ở vị trí sai', content: `Vị trí không phù hợp:
                        + Nơi quá tối, thiếu ánh sáng
                        + Dưới gầm bàn, trong góc tối
                        + Phòng tắm ẩm ướt
                        + Ngoài trời dưới mưa trực tiếp

                        Vị trí lý tưởng:
                        + Gần cửa sổ có ánh sáng gián tiếp
                        + Ban công có mái che
                        + Nơi thoáng mát, có gió nhẹ
                        + Tránh ánh nắng trực tiếp buổi trưa

                        Dấu hiệu vị trí không phù hợp:
                        + Cây bị vươn dài tìm ánh sáng
                        + Lá nhạt màu, mất độ căng mọng
                        + Cây phát triển chậm hoặc không phát triển
                        + Dễ bị nấm bệnh`
            }, {
                id: 'sai-lam-bon-phan-qua-nhieu', title: '9️⃣ Sai lầm: Bón phân quá nhiều hoặc sai cách', content: `Quan niệm sai lầm:
                        + Nghĩ sen đá cần nhiều phân để phát triển
                        + Bón phân thường xuyên như cây khác
                        + Dùng phân hóa học nồng độ cao

                        Sự thật về sen đá:
                        + Sen đá cần rất ít dinh dưỡng
                        + Quá nhiều phân sẽ làm cây "cháy" lá
                        + Có thể gây thối rễ

                        Cách bón phân đúng:
                        + Chỉ bón 2-3 lần/năm
                        + Dùng phân loãng (1/4 liều khuyến cáo)
                        + Bón vào mùa sinh trưởng (xuân-hè)
                        + Không bón khi cây ốm hoặc vừa chuyển đất

                        Loại phân phù hợp:
                        + Phân NPK cân bằng (10-10-10)
                        + Phân hữu cơ loãng
                        + Tránh phân đạm cao`
            }, {
                id: 'sai-lam-khong-quan-sat-cay', title: '🔟 Sai lầm: Không quan sát và chăm sóc kịp thời', content: `Dấu hiệu cảnh báo thường bị bỏ qua:
                        + Lá bắt đầu nhăn nheo
                        + Màu lá thay đổi bất thường
                        + Xuất hiện đốm lạ trên lá
                        + Cây mềm nhũn khi chạm vào

                        Thói quen quan sát tốt:
                        + Kiểm tra cây hàng ngày
                        + Chụp ảnh để so sánh sự thay đổi
                        + Ghi chép nhật ký chăm sóc
                        + Học cách nhận biết dấu hiệu sớm

                        Hành động kịp thời:
                        + Cách ly cây bệnh ngay lập tức
                        + Điều chỉnh cách chăm sóc khi cần
                        + Tìm hiểu nguyên nhân vấn đề
                        + Xin lời khuyên từ người có kinh nghiệm

                        Lời khuyên cuối:
                        Chăm sóc sen đá thành công phụ thuộc vào việc hiểu đúng bản chất của cây và môi trường sống. Hãy học hỏi từ kinh nghiệm của những người đi trước và không ngại thử nghiệm để tìm ra cách chăm sóc phù hợp nhất với điều kiện của bạn.`
            }]
        }
    }, {
        id: 'nhat-ky-30-ngay',
        title: 'Nhật ký chăm sóc sen đá trong vòng 30 ngày',
        author: 'Chuyên gia Sen Đá',
        date: 'Thứ 2, 18 Tháng 11, 2025',
        category: 'Thực hành',
        readTime: '15 phút đọc',
        description: '📝 Theo dõi chi tiết quá trình chăm sóc sen đá từng ngày trong 30 ngày với video thực tế. Từ cách thay chậu, trộn đất, tưới nước đến phơi nắng. Chứng kiến sự thay đổi tuyệt vời sau 1 tháng!',
        tags: ['Nhật ký', 'Theo dõi', '30 ngày', 'Thực hành', 'Video hướng dẫn'],
        difficulty: 'Trung bình',
        img: 'https://file.hstatic.net/1000187613/article/img_8217_copy_e25c8557449847fca84f3f2cb94408d9_62c695be8dd448bba0ac8841e2f3d4ac.jpg',
        content: {
            intro: 'Video này ghi lại quá trình chăm sóc sen đá trong vòng 1 tháng, mô tả chi tiết cách thay chậu, trộn đất, tưới nước và phơi nắng cho sen đá. Hãy cùng chứng kiến sự thay đổi tuyệt vời của sen đá sau 30 ngày chăm sóc đúng cách!',
            videoUrl: 'https://youtu.be/4gNUbeuWq1s',
            sections: [{
                id: 'video-huong-dan', title: '🎥 Video Hướng Dẫn Chi Tiết 30 Ngày', content: `Video thực tế ghi lại toàn bộ quá trình:
                        + So sánh sen đá trước và sau 30 ngày
                        + Hướng dẫn thay chậu từng bước
                        + Cách trộn đất chuyên nghiệp
                        + Kỹ thuật tưới nước đúng cách
                        + Phương pháp phơi nắng hiệu quả
                        + Theo dõi sự phát triển từng ngày

                        Kết quả đáng kinh ngạc:
                        Sau 30 ngày chăm sóc đúng cách, sen đá đã có những thay đổi tích cực rõ rệt về kích thước, màu sắc và sức khỏe tổng thể.`
            }, {
                id: 'tuan-1-lam-quen', title: 'Tuần 1: Làm quen và chuẩn bị (Ngày 1-7)', content: `Ngày 1: Đánh giá tình trạng ban đầu
                        + Chụp ảnh ghi lại tình trạng sen đá lúc đầu
                        + Đo kích thước và đếm số lá
                        + Kiểm tra tình trạng rễ (nếu có thể)
                        + Ghi chép: màu sắc, độ căng mọng, dấu hiệu bệnh

                        Ngày 2: Chuẩn bị môi trường
                        + Chọn vị trí đặt cây (ánh sáng gián tiếp)
                        + Kiểm tra nhiệt độ và độ ẩm môi trường
                        + Chuẩn bị dụng cụ chăm sóc

                        Ngày 3: Thay chậu và đất mới
                        + Lấy cây ra khỏi chậu cũ
                        + Làm sạch rễ, loại bỏ đất cũ
                        + Trộn đất mới: 50% đất sạch + 30% perlite + 20% pumice
                        + Trồng vào chậu mới có lỗ thoát nước

                        Ngày 4-7: Thích ứng
                        + Để cây thích ứng với môi trường mới
                        + Quan sát dấu hiệu stress (lá nhăn, đổi màu)
                        + KHÔNG tưới nước (để rễ khô và hồi phục)
                        + Ghi chép hàng ngày về sự thay đổi`
            }, {
                id: 'tuan-2-phat-trien', title: 'Tuần 2: Bắt đầu phát triển (Ngày 8-14)', content: `Ngày 8: Lần tưới nước đầu tiên
                        + Kiểm tra độ khô của đất (cắm ngón tay sâu 3cm)
                        + Tưới đẫm cho đến khi nước chảy ra lỗ thoát
                        + Để nước thoát hoàn toàn, không ngâm
                        + Ghi chép: lượng nước sử dụng, thời gian

                        Ngày 9-10: Quan sát phản ứng
                        + Theo dõi cây sau khi tưới nước
                        + Kiểm tra độ ẩm đất
                        + Quan sát lá có căng mọng hơn không

                        Ngày 11: Điều chỉnh ánh sáng
                        + Tăng dần thời gian phơi nắng gián tiếp
                        + Bắt đầu với 2-3 tiếng buổi sáng
                        + Tránh nắng trực tiếp buổi trưa

                        Ngày 12-14: Ổn định chế độ
                        + Thiết lập thói quen kiểm tra hàng ngày
                        + Ghi chép: thời tiết, độ ẩm không khí
                        + Đo kích thước và so sánh với tuần đầu`
            }, {
                id: 'tuan-3-tang-truong', title: 'Tuần 3: Tăng trưởng mạnh (Ngày 15-21)', content: `Ngày 15: Tưới nước lần thứ 2
                        + Kiểm tra đất đã khô hoàn toàn
                        + Tưới nước với lượng tương tự lần đầu
                        + Quan sát thời gian đất khô (khoảng 7 ngày)

                        Ngày 16-17: Phát hiện dấu hiệu phát triển
                        + Xuất hiện chồi mới ở gốc
                        + Lá cũ căng mọng hơn, màu sắc tươi sáng
                        + Rễ bắt đầu bám chắc vào đất mới

                        Ngày 18: Tăng thời gian phơi nắng
                        + Kéo dài thời gian ánh sáng lên 4-5 tiếng
                        + Đặt cây gần cửa sổ có ánh sáng nhiều hơn
                        + Vẫn tránh nắng trực tiếp

                        Ngày 19-21: Theo dõi tăng trưởng
                        + Đo chiều cao và đường kính cây
                        + Đếm số lá mới mọc
                        + Chụp ảnh so sánh với tuần trước
                        + Ghi chép sự thay đổi về màu sắc`
            }, {
                id: 'tuan-4-hoan-thien', title: 'Tuần 4: Hoàn thiện và đánh giá (Ngày 22-30)', content: `Ngày 22: Tưới nước lần thứ 3
                        + Chu kỳ tưới nước đã ổn định (7-8 ngày/lần)
                        + Cây đã thích ứng hoàn toàn
                        + Lượng nước hấp thụ tăng lên

                        Ngày 23-25: Đánh giá sức khỏe
                        + Kiểm tra dấu hiệu bệnh hoặc sâu hại
                        + Lá có màu xanh tươi, căng mọng
                        + Rễ phát triển tốt, bám chắc đất

                        Ngày 26: Bón phân nhẹ (tùy chọn)
                        + Nếu cây phát triển chậm, có thể bón phân loãng
                        + Sử dụng phân NPK 10-10-10 pha loãng 1/4
                        + Chỉ bón 1 lần trong tháng

                        Ngày 27-30: Tổng kết kết quả
                        + Chụp ảnh cuối cùng để so sánh
                        + Đo kích thước chính xác
                        + Đếm số lá mới và chồi non
                        + Đánh giá màu sắc và độ khỏe mạnh

                        Kết quả sau 30 ngày:
                        + Kích thước tăng 20-30%
                        + Số lá tăng 5-10 lá mới
                        + Màu sắc tươi sáng hơn
                        + Xuất hiện 2-3 chồi non ở gốc
                        + Cây khỏe mạnh, thích ứng tốt với môi trường mới`
            }, {
                id: 'bang-ghi-chep', title: '📊 Bảng Ghi Chép Hàng Ngày', content: `Thông tin cần ghi chép mỗi ngày:

                        Thông tin cơ bản:
                        +Ngày/tháng/năm
                        + Thời tiết (nắng/mưa/âm u)
                        + Nhiệt độ môi trường
                        + Độ ẩm không khí

                        Tình trạng cây:
                        + Màu sắc lá (xanh tươi/nhạt/vàng)
                        + Độ căng mọng (cứng/mềm/nhăn)
                        + Số lá mới/lá rụng
                        + Chiều cao và đường kính

                        Hoạt động chăm sóc:
                        + Có tưới nước không (lượng/thời gian)
                        + Thời gian phơi nắng
                        + Vị trí đặt cây
                        + Có thay đổi gì đặc biệt

                        Ghi chú quan trọng:
                        + Dấu hiệu bất thường
                        + Thay đổi tích cực
                        + Điều cần điều chỉnh
                        + Ảnh chụp (nếu có)`
            }, {
                id: 'meo-thanh-cong', title: '🏆 Bí Quyết Thành Công', content: `Những điều quan trọng nhất:
                        1. Kiên nhẫn và đều đặn
                        + Ghi chép hàng ngày không bỏ sót
                        + Không thay đổi chế độ chăm sóc đột ngột
                        + Cho cây thời gian thích ứng

                        2. Quan sát kỹ lưỡng
                        + Chú ý đến từng thay đổi nhỏ
                        + Chụp ảnh để so sánh
                        + Học cách "đọc" tín hiệu từ cây

                        3. Điều chỉnh linh hoạt
                        + Thay đổi theo thời tiết
                        + Điều chỉnh tần suất tưới nước
                        + Thích ứng với môi trường cụ thể

                        4. Không vội vàng
                        + Không tưới nước quá sớm
                        + Không di chuyển cây liên tục
                        + Không bón phân quá nhiều

                        Sau 30 ngày này, bạn sẽ:
                        + Hiểu rõ nhu cầu của sen đá
                        + Tự tin hơn trong việc chăm sóc
                        + Có kinh nghiệm quý báu để áp dụng
                        + Thấy được sự thay đổi tích cực rõ rệt

                        Hành trình 30 ngày này sẽ biến bạn từ người mới bắt đầu thành người có kinh nghiệm chăm sóc sen đá!`
            }]
        }
    }, {
        id: 'nhan-giong-nuoc-chai-nhua',
        title: 'Nhân giống sen đá bằng nước và chai nhựa',
        author: 'Chuyên gia Nhân giống',
        date: 'Thứ 4, 20 Tháng 11, 2025',
        category: 'Nhân giống',
        readTime: '8 phút đọc',
        description: '🧪 Phương pháp nhân giống sen đá hiện đại bằng nước và chai nhựa. Kỹ thuật đơn giản, hiệu quả cao, phù hợp cho người mới bắt đầu. Tỷ lệ thành công lên đến 90%!',
        tags: ['Nhân giống', 'Kỹ thuật mới', 'Hiệu quả cao', 'Dễ thực hiện'],
        difficulty: 'Dễ',
        img: 'https://file.hstatic.net/1000187613/article/img_4464_copy_copy_5783a493360f46419390eff6612eb9eb_47d7df78c7584409af7ed5d1f1be4b3e.jpg',
        content: {
            intro: 'Phương pháp nhân giống sen đá bằng nước và chai nhựa là kỹ thuật hiện đại, đơn giản và hiệu quả cao. Với tỷ lệ thành công lên đến 90%, đây là lựa chọn hoàn hảo cho người mới bắt đầu.',
            videoUrl: 'https://youtu.be/UUN6aqSmTf0',
            sections: [{
                id: 'video-huong-dan-nhan-giong', title: '🎥 Video Hướng Dẫn Chi Tiết', content: `Xem video để hiểu rõ từng bước:
                        + Cách chuẩn bị chai nhựa và dụng cụ
                        + Kỹ thuật lấy lá sen đá đúng cách
                        + Phương pháp ủ lá trong môi trường ẩm
                        + Theo dõi quá trình ra rễ và mầm
                        + Chuyển cây con vào chậu

                        Ưu điểm của phương pháp này:
                        + Tỷ lệ thành công cao (85-90%)
                        + Thời gian ra rễ nhanh (7-14 ngày)
                        + Tiết kiệm chi phí, dụng cụ đơn giản
                        + Kiểm soát được môi trường phát triển`
            }]
        }
    }, {
        id: 'khu-vuon-mini-sen-da',
        title: 'Hướng dẫn làm khu vườn mini từ sen đá',
        author: 'Nghệ nhân Trang trí',
        date: 'Thứ 5, 21 Tháng 11, 2025',
        category: 'Trang trí',
        readTime: '10 phút đọc',
        description: '🏡 Tạo khu vườn mini tuyệt đẹp từ sen đá trong nhà. Hướng dẫn chi tiết từ chọn chậu, bố trí cây đến trang trí phụ kiện. Biến không gian sống thành thiên đường xanh!',
        tags: ['Trang trí', 'Khu vườn mini', 'DIY', 'Không gian xanh'],
        difficulty: 'Trung bình',
        img: 'https://file.hstatic.net/1000187613/article/img_5247_copy_ffc726bfc1e34860a094a3817093c7e4_89a48de147584469a4f6f7b0dc22e7ef.jpg',
        content: {
            intro: 'Tạo một khu vườn mini từ sen đá là cách tuyệt vời để mang thiên nhiên vào không gian sống. Với hướng dẫn chi tiết này, bạn sẽ tạo được những góc xanh đẹp mắt và ý nghĩa.',
            videoUrl: 'https://youtu.be/r1pPXtbTekY',
            sections: [{
                id: 'video-huong-dan-lam-vuon', title: '🎥 Video Hướng Dẫn Tạo Khu Vườn Mini', content: `Xem video để học cách:
                        + Chọn container và vật liệu phù hợp
                        + Kỹ thuật bố trí cây theo tầng lớp
                        + Cách trang trí với đá, rêu, phụ kiện
                        + Tạo điểm nhấn và cân bằng màu sắc
                        + Chăm sóc khu vườn mini lâu dài`
            }]
        }
    }, {
        id: 'huong-dan-phoi-nang',
        title: 'PHƠI NẮNG SEN ĐÁ ĐÚNG CÁCH',
        author: 'Vườn Sen Đá Expert',
        date: 'Thứ 6, 22 Tháng 11, 2025',
        category: 'Chăm sóc cơ bản',
        readTime: '15 phút đọc',
        description: '☀️ Hướng dẫn phơi nắng đúng cách cho sen đá. Nắng là yếu tố quan trọng nhất quyết định cây đẹp hay xấu, khỏe hay bệnh. Phân biệt nắng trực tiếp và ánh sáng gián tiếp với hình ảnh minh họa chi tiết!',
        tags: ['Phơi nắng', 'Ánh sáng', 'Nắng trực tiếp', 'Chăm sóc cơ bản', 'Màu sắc sen đá'],
        difficulty: 'Trung bình',
        img: 'http://file.hstatic.net/1000187613/article/img_0014_copy.jpg',
        content: {
            intro: 'Theo kinh nghiệm của vườn, nắng là yếu tố quan trọng nhất trong việc chăm sóc sen đá. Nắng quyết định cây phát triển nhanh hay chậm, đẹp hay xấu, và cũng là yếu tố quyết định cây có khỏe hay dễ bệnh.',
            sections: [{
                id: 'tai-sao-nang-quan-trong-nhat', title: '☀️ Tại Sao Nắng Là Yếu Tố Quan Trọng Nhất?', content: `🌟 Nắng quyết định mọi thứ:
                        1. Tốc độ phát triển: Nắng đủ = phát triển nhanh, thiếu nắng = chậm lớn
                        2. Vẻ đẹp: Nắng đủ = màu sắc rực rỡ, thiếu nắng = xanh nhạt nhẽo
                        3. Sức khỏe: Nắng đủ = cây chắc khỏe, thiếu nắng = yếu ớt dễ bệnh
                        4. Hình dáng: Nắng đủ = cây cân đối, thiếu nắng = còng cong biến dạng

                        🔬 Cơ chế khoa học:
                        1. Quang hợp: Tạo ra glucose - "thức ăn" cho cây
                        2. Tổng hợp anthocyanin: Tạo màu đỏ, tím, cam đẹp mắt
                        3. Điều hòa hormone: Kiểm soát sinh trưởng và phát triển
                        4. Tăng cường miễn dịch: Sản xuất các hợp chất bảo vệ

                        ⚡ Tầm quan trọng của nắng:
                        Nắng không chỉ giúp cây sống, mà còn quyết định:
                        1. Khả năng kháng bệnh của cây
                        2. Tốc độ sinh trưởng và phát triển
                        3. Màu sắc và hình dáng cuối cùng
                        4. Tuổi thọ và sức sống lâu dài`
            }, {
                id: 'cay-du-nang-vs-thieu-nang', title: '🌈 So Sánh: Cây Đủ Nắng vs Thiếu Nắng', content: `✅ CÂY SEN ĐÁ ĐỦ NẮNG:
                        
                        ![Cây sen đá đủ nắng, màu sắc đẹp](https://file.hstatic.net/1000187613/file/img_0014_58e1d51f0b4642649d412a3567d9b9e0_grande.jpg)
                        
                        🎨 Đặc điểm nhận biết:
                        1. Màu sắc: Đẹp, rực rỡ, có nhiều sắc thái
                        2. Lá mới ở giữa: Cân đối, không kéo dài bất thường
                        3. Thân cây: Chắc khỏe, thẳng đứng, không còng
                        4. Tổng thể: Gọn gàng, cân đối, hấp dẫn
                        5. Độ căng mọng: Lá dày, cứng cáp, tươi tốt
                        6. Khả năng kháng bệnh: Cao, ít bị sâu bệnh
                        
                        ❌ CÂY SEN ĐÁ THIẾU NẮNG:
                        
                        ![Cây sen đá thiếu nắng, màu sắc nhạt](https://file.hstatic.net/1000187613/file/bf68bd564664fd9c3a69b6402ef79d12_copy_grande.jpg)
                        
                        🚨 Dấu hiệu cảnh báo:
                        1. Màu sắc: Nhạt, xanh lá cây đơn điệu, không đẹp
                        2. Lá thưa: Khoảng cách giữa các lá lớn bất thường
                        3. Thân cây: Kéo dài, còng cong, mất hình dáng
                        4. Tổng thể: Mất cân đối, xấu xí, không thu hút
                        5. Độ mềm: Lá mỏng, dễ gãy, thiếu sức sống
                        6. Dễ bệnh: Thường xuyên bị sâu bệnh tấn công

                        ⚠️ Hậu quả lâu dài của thiếu nắng:
                        1. Cây yếu ớt, dễ chết khi thay đổi môi trường
                        2. Mất hoàn toàn giá trị thẩm mỹ và trang trí
                        3. Khả năng sinh sản (ra con) rất kém
                        4. Rất dễ nhiễm sâu bệnh, nấm mốc
                        5. Gần như không thể phục hồi về dạng ban đầu

                        💡 Lưu ý quan trọng:
                        Một khi cây đã bị thiếu nắng và kéo dài, rất khó để phục hồi lại hình dáng ban đầu. "Phòng bệnh hơn chữa bệnh" - điều này đặc biệt đúng với sen đá!`
            }, {
                id: 'phan-biet-nang-truc-tiep-gian-tiep',
                title: '🔍 Phân Biệt: Nắng Trực Tiếp vs Ánh Sáng Gián Tiếp',
                content: `⭐ SAI LẦM PHỔ BIẾN NHẤT:
                        Rất nhiều người nhầm lẫn giữa "để cây ở chỗ có ánh sáng" và "phơi nắng trực tiếp". Đây là sai lầm nghiêm trọng khiến cây yếu dần và chết!

                        ✅ PHƠI NẮNG ĐÚNG CÁCH - NẮNG TRỰC TIẾP:
                        
                        ![Phơi nắng đúng cách - có nắng trực tiếp rọi vào cây](https://file.hstatic.net/1000187613/file/img_0020_copy_grande.jpg)
                        
                        🌞 Đặc điểm nắng trực tiếp:
                        1. Tia nắng chiếu thẳng: Ánh nắng mặt trời chiếu trực tiếp vào cây
                        2. Có thể qua kính: Nắng qua cửa sổ kính vẫn hiệu quả tốt
                        3. Tạo bóng rõ ràng: Cây tạo bóng đen, sắc nét trên mặt đất
                        4. Cảm nhận được nhiệt: Khi chạm vào lá cây, cảm thấy ấm
                        5. Thời gian tối thiểu: Cần ít nhất 4-6 giờ nắng trực tiếp/ngày

                        ❌ PHƠI NẮNG SAI CÁCH - CHỈ CÓ ÁNH SÁNG GIÁN TIẾP:
                        
                        ![Phơi nắng sai cách - nắng không trực tiếp rọi vào cây](https://file.hstatic.net/1000187613/file/img_0023_copy_grande.jpg)
                        
                        🌫️ Đặc điểm ánh sáng gián tiếp:
                        1. Chỉ có ánh sáng: Sáng nhưng không có tia nắng trực tiếp
                        2. Bóng mờ nhạt: Không tạo bóng rõ nét, chỉ có bóng mờ
                        3. Không ấm: Lá cây không cảm nhận được nhiệt độ
                        4. Ánh sáng tán xạ: Ánh sáng phản xạ từ tường, trần nhà
                        5. Hiệu quả thấp: Hoàn toàn không đủ cho sen đá phát triển khỏe

                        🔬 So sánh chi tiết khoa học:
                        
                        📊 Bảng so sánh nắng trực tiếp vs ánh sáng gián tiếp:
                        
                        1. Cường độ ánh sáng:
                          - Nắng trực tiếp ✅: 50,000+ lux
                          - Ánh sáng gián tiếp ❌: 1,000-5,000 lux
                        
                        2. Nhiệt độ trên lá:
                          - Nắng trực tiếp ✅: Ấm, cảm nhận rõ
                          - Ánh sáng gián tiếp ❌: Mát, không ấm
                        
                        3. Bóng của cây:
                          - Nắng trực tiếp ✅: Rõ nét, đen đậm
                          - Ánh sáng gián tiếp ❌: Mờ nhạt, không rõ
                        
                        4. Hiệu quả cho cây:
                          - Nắng trực tiếp ✅: Cao, cây khỏe đẹp
                          - Ánh sáng gián tiếp ❌: Thấp, cây yếu xấu
                        
                        5. Màu sắc cây:
                          - Nắng trực tiếp ✅: Đẹp, rực rỡ, đa dạng
                          - Ánh sáng gián tiếp ❌: Nhạt, xanh lá đơn điệu
                        
                        6. Tốc độ phát triển:
                          - Nắng trực tiếp ✅: Nhanh, đều đặn
                          - Ánh sáng gián tiếp ❌: Chậm, không đều

                        🏠 Đánh giá vị trí trong nhà:
                        1. Tốt nhất: Sát cửa sổ hướng Nam, Đông (có nắng trực tiếp)
                        2. Khá tốt: Gần cửa sổ hướng Tây (nắng chiều)
                        3. Trung bình: Gần cửa sổ hướng Bắc (ít nắng trực tiếp)
                        4. Rất kém: Giữa phòng, góc tối (chỉ có ánh sáng gián tiếp)
                        5. Tệ nhất: Phòng không cửa sổ hoặc đèn điện

                        💡 Cách kiểm tra đơn giản:
                        1. Test bóng: Đặt tay trên cây, nếu có bóng rõ = nắng trực tiếp
                        2. Test nhiệt: Chạm lá cây, nếu ấm = nắng trực tiếp  
                        3. Test thời gian: Quan sát cây 1 tuần, nếu màu đẹp lên = đúng
                        4. Test di chuyển: Chuyển vị trí và so sánh sự khác biệt`
            }]
        }
    }, {
        id: 'tri-rep-sap-sen-da',
        title: 'Hướng dẫn trị rệp sáp cho sen đá dễ nhất',
        author: 'Chuyên gia Bảo vệ thực vật',
        date: 'Chủ nhật, 24 Tháng 11, 2025',
        category: 'Bệnh hại',
        readTime: '6 phút đọc',
        description: '🐛 Phương pháp đơn giản và hiệu quả nhất để trị rệp sáp cho sen đá. Từ nhận biết dấu hiệu đến cách xử lý an toàn. Cứu cây yêu của bạn ngay hôm nay!',
        tags: ['Rệp sáp', 'Bệnh hại', 'Xử lý côn trùng', 'Chăm sóc cây'],
        difficulty: 'Dễ',
        img: 'https://file.hstatic.net/1000187613/article/een_shot_2019-08-31_at_6.46.16_pm_0e132282691440e7bce9336b4ba8bb2d_4555fbd4c68543cc9566310429743236.jpg',
        content: {
            intro: 'Rệp sáp là một trong những loại sâu bệnh phổ biến nhất gây hại cho sen đá. Với hướng dẫn đơn giản này, bạn sẽ học cách nhận biết và xử lý rệp sáp hiệu quả, an toàn cho cây và người.',
            videoUrl: 'https://youtu.be/l33sbycJkU0',
            sections: [{
                id: 'video-huong-dan-tri-rep', title: '🎥 Video Hướng Dẫn Trị Rệp Sáp', content: `Xem video để học cách:
                        1. Nhận biết rệp sáp trên sen đá
                        2. Phương pháp xử lý bằng tay an toàn
                        3. Sử dụng dung dịch xà phòng tự nhiên
                        4. Cách phun thuốc sinh học hiệu quả
                        5. Biện pháp phòng ngừa lâu dài

                        Những điều quan trọng trong video:
                        1. Cách cách ly cây bị nhiễm ngay lập tức
                        2. Kỹ thuật làm sạch từng kẽ lá
                        3. Thời điểm xử lý tốt nhất trong ngày
                        4. Tần suất kiểm tra và xử lý định kỳ`
            }, {
                id: 'nhan-biet-rep-sap', title: '🔍 Nhận Biết Rệp Sáp Trên Sen Đá', content: `Dấu hiệu nhận biết rệp sáp:

                        🐛 Hình dáng và màu sắc:
                        1. Màu trắng hoặc hơi vàng
                        2. Hình oval, dẹt, kích thước 2-5mm
                        3. Có lớp sáp trắng phủ bên ngoài
                        4. Di chuyển chậm chạp hoặc bám chặt

                        📍 Vị trí thường xuất hiện:
                        1. Mặt dưới của lá
                        2. Kẽ giữa các lá
                        3. Gốc cây, thân cây
                        4. Rễ trên mặt đất (ít gặp)

                        ⚠️ Dấu hiệu cây bị hại:
                        1. Lá vàng, héo, rụng bất thường
                        2. Xuất hiện chất nhầy trên lá
                        3. Cây phát triển chậm lại
                        4. Màu sắc lá nhạt đi, mất độ bóng

                        🕵️ Cách kiểm tra kỹ:
                        1. Kiểm tra mặt dưới mỗi chiếc lá
                        2. Dùng đèn pin chiếu để thấy rõ hơn
                        3. Chú ý các vết trắng nhỏ di chuyển
                        4. Tìm các đốm trắng bám chặt trên thân`
            }, {
                id: 'nguyen-nhan-gay-benh', title: '🌡️ Nguyên Nhân Gây Bệnh', content: `Môi trường thuận lợi cho rệp sáp:

                        🌡️ Điều kiện khí hậu:
                        1. Nhiệt độ 25-30°C (môi trường trong nhà)
                        2. Độ ẩm cao (60-80%)
                        3. Không khí ít lưu thông
                        4. Thiếu ánh sáng tự nhiên

                        🏠 Yếu tố môi trường:
                        1. Cây đặt trong nhà kín
                        2. Thiếu gió tự nhiên
                        3. Quá nhiều cây đặt gần nhau
                        4. Tưới nước quá nhiều tạo ẩm

                        🌱 Tình trạng cây:
                        1. Cây yếu, sức đề kháng kém
                        2. Bón phân quá nhiều đạm
                        3. Cây mới mua chưa qua kiểm dịch
                        4. Cây bị stress do thay đổi môi trường

                        🚪 Con đường lây nhiễm:
                        1. Cây mới mua đã bị nhiễm
                        2. Lây lan từ cây khác trong vườn
                        3. Côn trùng mang theo từ bên ngoài
                        4. Dụng cụ chăm sóc không sạch sẽ`
            }, {
                id: 'phuong-phap-xu-ly', title: '🛠️ Phương Pháp Xử Lý Hiệu Quả', content: `Bước 1: Cách ly ngay lập tức
                        1. Tách cây bị nhiễm ra khỏi các cây khác
                        2. Đặt ở nơi thoáng mát, có ánh sáng
                        3. Không tưới nước trong 2-3 ngày đầu
                        4. Chuẩn bị dụng cụ xử lý

                        Bước 2: Xử lý bằng tay (Cách đơn giản nhất)
                        1. Dùng tăm bông tẩm cồn 70%
                        2. Lau nhẹ từng con rệp trên lá
                        3. Kiểm tra kỹ mặt dưới của lá
                        4. Làm sạch hoàn toàn gốc và thân cây

                        Bước 3: Dung dịch xà phòng tự nhiên
                        Công thức:
                        1. 1 thìa café xà phòng rửa chén
                        2. 500ml nước ấm
                        3. 1/2 thìa café dầu oliu (tùy chọn)

                        Cách sử dụng:
                        1. Phun đều lên toàn bộ cây
                        2. Chú ý phun mặt dưới lá
                        3. Để 30 phút rồi xịt nước sạch
                        4. Lặp lại 2-3 ngày/lần

                        Bước 4: Thuốc sinh học (Nếu cần)
                        1. Dùng thuốc gốc neem oil
                        2. Pha theo hướng dẫn nhà sản xuất
                        3. Phun vào buổi chiều mát
                        4. Tránh phun dưới nắng gắt

                        Bước 5: Theo dõi và kiểm tra
                        1. Kiểm tra hàng ngày trong tuần đầu
                        2. Xử lý ngay khi phát hiện rệp mới
                        3. Tiếp tục cách ly 2-3 tuần
                        4. Chỉ đưa cây về khi hoàn toàn sạch`
            }, {
                id: 'cong-thuc-tu-nhien', title: '🌿 Công Thức Tự Nhiên An Toàn', content: `1. Dung dịch tỏi + nước
                        Nguyên liệu:
                        1. 3-4 tép tỏi tươi
                        2. 500ml nước
                        3. 1 thìa café xà phòng rửa chén

                        Cách pha:
                        1. Nghiền tỏi, ngâm nước 24h
                        2. Lọc lấy nước, thêm xà phòng
                        3. Phun 2 lần/tuần vào buổi chiều

                        2. Dung dịch dầu neem
                        Nguyên liệu:
                        1. 10ml dầu neem nguyên chất
                        2. 500ml nước ấm
                        3. 5ml xà phòng tự nhiên

                        Cách sử dụng:
                        1. Lắc đều trước khi dùng
                        2. Phun đều khắp cây
                        3. Sử dụng 1 lần/tuần

                        3. Dung dịch cồn + nước
                        Công thức:
                        1. 100ml cồn 70%
                        2. 400ml nước
                        3. Vài giọt nước rửa chén

                        Lưu ý:
                        - Chỉ lau trực tiếp bằng bông
                        - Không phun trực tiếp lên cây
                        - Test trên 1-2 lá trước

                        4. Dung dịch ớt + xà phòng
                        Nguyên liệu:
                        1. 2-3 quả ớt hiểm
                        2. 500ml nước sôi
                        3. 1 thìa café xà phòng

                        Cách làm:
                        1. Ngâm ớt trong nước nóng 2h
                        2. Lọc, thêm xà phòng
                        3. Phun nhẹ, tránh vào mắt`
            }, {
                id: 'phong-ngua-rep-sap', title: '🛡️ Biện Pháp Phòng Ngừa', content: `Chăm sóc môi trường:

                        🌬️ Cải thiện thông gió:
                        1. Đặt quạt nhỏ gần khu vực trồng cây
                        2. Mở cửa sổ cho không khí lưu thông
                        3. Không đặt quá nhiều cây gần nhau
                        4. Tạo khoảng cách 15-20cm giữa các chậu

                        ☀️ Đảm bảo ánh sáng:
                        1. Đặt cây gần cửa sổ có ánh sáng tự nhiên
                        2. Xoay chậu định kỳ để cây nhận ánh sáng đều
                        3. Sử dụng đèn LED grow light nếu cần
                        4. Tránh để cây trong góc tối

                        💧 Quản lý độ ẩm:
                        1. Tưới nước đúng cách, tránh úng
                        2. Sử dụng khay sỏi để tăng độ ẩm tự nhiên
                        3. Tránh phun nước lên lá thường xuyên
                        4. Đảm bảo thoát nước tốt

                        Kiểm tra định kỳ:

                        📅 Lịch kiểm tra:
                        1. Hàng tuần: Kiểm tra tổng quát
                        2. Hàng tháng: Kiểm tra kỹ từng cây
                        3. Mùa hè: Tăng tần suất kiểm tra
                        4. Sau mưa: Kiểm tra đặc biệt

                        🔍 Cách kiểm tra hiệu quả:
                        1. Dùng kính lúp kiểm tra kẽ lá
                        2. Chụp ảnh để so sánh theo thời gian
                        3. Ghi chép tình trạng từng cây
                        4. Đánh dấu cây đã kiểm tra

                        Tăng cường sức đề kháng:

                        🌱 Chăm sóc cây khỏe:
                        1. Bón phân cân bằng, không quá đạm
                        2. Đảm bảo cây có đủ ánh sáng
                        3. Tưới nước đúng lượng, đúng thời điểm
                        4. Thay đất định kỳ (1-2 năm/lần)

                        🧼 Vệ sinh dụng cụ:
                        1. Rửa sạch dụng cụ sau mỗi lần dùng
                        2. Khử trùng bằng cồn 70%
                        3. Không dùng chung dụng cụ giữa các cây
                        4. Rửa tay trước và sau khi chăm cây`
            }, {
                id: 'luu-y-quan-trong', title: '⚠️ Lưu Ý Quan Trọng', content: `An toàn khi xử lý:

                        👤 Bảo vệ bản thân:
                        1. Đeo găng tay khi xử lý
                        2. Tránh để dung dịch dính vào mắt
                        3. Rửa tay sạch sau khi xử lý
                        4. Làm việc ở nơi thoáng khí

                        🌱 Bảo vệ cây:
                        1. Test dung dịch trên 1-2 lá trước
                        2. Không xử lý dưới nắng gắt
                        3. Tránh xử lý khi cây đang khô nước
                        4. Cho cây nghỉ ngơi sau xử lý

                        Thời điểm xử lý tốt nhất:

                        🌅 Buổi sáng sớm (6-8h):
                        1. Cây đã hồi phục sau đêm
                        2. Nhiệt độ mát mẻ
                        3. Ít gió, dung dịch không bay mất

                        🌆 Buổi chiều mát (16-18h):
                        1. Tránh nắng gắt buổi trưa
                        2. Cây có thời gian hồi phục qua đêm
                        3. Độ ẩm không khí cao hơn

                        ❌ Tránh xử lý khi:
                        1. Trời nắng gắt (10-15h)
                        2. Mưa to gió lớn
                        3. Cây vừa tưới nước
                        4. Nhiệt độ quá cao (trên 35°C)

                        Dấu hiệu thành công:

                        ✅ Sau 1 tuần:
                        1. Không thấy rệp sáp mới
                        2. Lá bắt đầu tươi tóe hơn
                        3. Cây không còn chất nhầy

                        ✅ Sau 2-3 tuần:
                        1. Cây phát triển bình thường
                        2. Màu sắc lá trở lại tự nhiên
                        3. Không có dấu hiệu tái phát

                        🚨 Khi nào cần xử lý mạnh hơn:
                        1. Rệp sáp lan rộng >50% cây
                        2. Xử lý 2 tuần không hiệu quả
                        3. Cây quá yếu, gần chết
                        4. Lây lan sang nhiều cây khác

                        Lời khuyên cuối:
                        Kiên nhẫn và đều đặn là chìa khóa thành công. Rệp sáp rất dễ tái phát nếu không xử lý triệt để. Phòng bệnh luôn tốt hơn chữa bệnh!`
            }]
        }
    }, {
        id: 've-sinh-la-gia-nho-co',
        title: 'Vệ sinh lá già và nhổ cỏ cho sen đá',
        author: 'Chuyên gia Chăm sóc',
        date: 'Thứ 2, 25 Tháng 11, 2025',
        category: 'Chăm sóc cơ bản',
        readTime: '6 phút đọc',
        description: '🧹 Hướng dẫn vệ sinh lá già và nhổ cỏ dại cho sen đá. Kỹ thuật làm sạch an toàn, giữ cây khỏe mạnh và đẹp mắt. Ngăn ngừa sâu bệnh và cải thiện thẩm mỹ!',
        tags: ['Vệ sinh cây', 'Lá già', 'Nhổ cỏ', 'Bảo dưỡng', 'Phòng bệnh'],
        difficulty: 'Dễ',
        img: 'http://file.hstatic.net/1000187613/article/1_l__gi_.jpg',
        content: {
            intro: 'Sen đá sau khi trồng một thời gian sẽ có những lá già ở sát gốc. Việc vệ sinh lá già thường xuyên không chỉ giúp cây đẹp hơn mà còn ngăn ngừa sâu bệnh hiệu quả.',
            videoUrl: 'https://youtu.be/yEOihAe-ELE',
            sections: [{
                id: 'video-ve-sinh-chinh', title: '🎥 Video Hướng Dẫn Vệ Sinh Sen Đá', content: `Video chính hướng dẫn:
                        1. Nhận biết lá già cần loại bỏ
                        2. Kỹ thuật tháo lá an toàn không làm tổn thương cây
                        3. Cách nhổ cỏ dại mọc quanh gốc
                        4. Vệ sinh chậu và bề mặt đất
                        5. Sắp xếp lại cây sau khi vệ sinh`, videoEmbed: 'https://www.youtube.com/embed/yEOihAe-ELE'
            }, {
                id: 'video-bo-sung', title: '🎥 Video Bổ Sung: Kỹ Thuật Chuyên Sâu', content: `Video chi tiết về vệ sinh lá già:
                        1. Cách nhận biết lá già cần loại bỏ
                        2. Kỹ thuật bứt lá nhẹ nhàng không làm tổn thương
                        3. Thời điểm tốt nhất để vệ sinh
                        4. Dụng cụ hỗ trợ an toàn
                        5. Xử lý sau khi loại bỏ lá già
                        `, videoEmbed: 'https://www.youtube.com/embed/om9yZNcuwRs'
            }, {
                id: 'tai-sao-can-ve-sinh', title: '❓ Tại Sao Cần Vệ Sinh Lá Già?', content: `🦠 Ngăn ngừa sâu bệnh:
                        Lá già là nơi trú ẩn lý tưởng cho các loại sâu bệnh:
                        1. Rệp sáp thường ẩn náu dưới lá già
                        2. Nấm mốc phát triển trong môi trường ẩm ướt
                        3. Côn trùng nhỏ tìm chỗ trú ấn
                        4. Vi khuẩn có thể xâm nhập từ lá thối

                        🌸 Cải thiện thẩm mỹ:
                        1. Loại bỏ lá vàng, khô làm mất đẹp
                        2. Giúp cây trông gọn gàng, sạch sẽ
                        3. Tôn lên vẻ đẹp của lá mới
                        4. Tạo hình dáng cây đẹp hơn

                        💪 Tăng sức khỏe cây:
                        1. Cây tập trung dinh dưỡng cho lá mới
                        2. Cải thiện thông gió quanh gốc
                        3. Giảm nguy cơ nhiễm bệnh
                        4. Kích thích cây phát triển tốt hơn`
            }, {
                id: 'nhan-biet-la-gia', title: '🔍 Nhận Biết Lá Già Cần Loại Bỏ', content: `📍 Vị trí lá già:
                        1. Ở sát gốc cây, tầng lá dưới cùng
                        2. Thường bị che khuất bởi lá mới
                        3. Gần bề mặt đất
                        4. Ít tiếp xúc với ánh sáng

                        🎨 Dấu hiệu nhận biết:
                        1. Màu sắc: Vàng, nâu hoặc đã khô
                        2. Độ mềm: Mềm nhũn, không còn căng mọng
                        3. Kích thước: Co rúm, nhỏ hơn bình thường
                        4. Bề mặt: Có đốm, nhăn nheo hoặc thối

                        ⏰ Thời điểm xuất hiện:
                        1. Cây trưởng thành (trên 6 tháng tuổi)
                        2. Sau khi thay chậu hoặc thay đất
                        3. Mùa thay đổi thời tiết
                        4. Khi cây ra lá mới nhiều

                        ❌ Lá KHÔNG nên loại bỏ:
                        1. Lá còn xanh tươi
                        2. Lá hơi vàng nhẹ nhưng còn cứng
                        3. Lá đang trong quá trình chuyển màu tự nhiên
                        4. Lá chỉ bị bụi bẩn (có thể lau sạch)`
            }, {
                id: 'ky-thuat-but-la', title: '🤏 Kỹ Thuật Bứt Lá Đúng Cách', content: `🕐 Thời điểm tốt nhất:
                        + Buổi sáng sớm khi cây tươi mát
                        + Sau khi tưới nước 1-2 ngày (lá mềm hơn)
                        + Tránh buổi trưa nắng gắt
                        + Không bứt khi cây đang stress

                        👋 Cách bứt lá đúng:
                        + Bước 1: Cầm nhẹ lá ở gần gốc
                        + Bước 2: Xoay nhẹ theo chiều kim đồng hồ
                        + Bước 3: Kéo nhẹ ra ngoài, không giật mạnh
                        + Bước 4: Đảm bảo lấy cả cuống lá
                        + Bước 5: Kiểm tra không để sót phần lá trên thân

                        🛠️ Dụng cụ hỗ trợ:
                        + Nhíp nhỏ: Với lá khó tiếp cận
                        + Kéo cắt: Lá khô cứng, bám chặt
                        + Găng tay: Bảo vệ tay khỏi gai cây
                        + Khăn mềm: Lau sạch vết cắt

                        ⚠️ Lưu ý quan trọng:
                        + Không bứt quá nhiều lá cùng lúc
                        + Tránh làm tổn thương thân cây
                        + Nếu lá bám chặt, dùng kéo cắt
                        + Khử trùng dụng cụ trước khi dùng`
            }, {
                id: 'xu-ly-sau-but-la', title: '🧼 Xử Lý Sau Khi Bứt Lá', content: `🗑️ Vứt bỏ lá già:
                        + Không để lá già rơi vãi trong chậu
                        + Bỏ vào túi rác, tránh ôi thối
                        + Không dùng làm phân compost (có thể mang bệnh)
                        + Rửa tay sạch sau khi xử lý

                        🩹 Chăm sóc vết bứt:
                        + Để vết bứt khô tự nhiên
                        + Không tưới nước ngay vào vết thương
                        + Tránh nước mưa vào vết cắt
                        + Quan sát 2-3 ngày đầu

                        🧹 Vệ sinh khu vực:
                        + Lau sạch bề mặt đất trong chậu
                        + Loại bỏ lá rụng tích tụ
                        + Kiểm tra và nhổ cỏ dại
                        + Sắp xếp lại vị trí cây cho đẹp

                        👀 Theo dõi sau vệ sinh:
                        + Kiểm tra vết bứt có bị nhiễm trùng không
                        + Quan sát cây có phản ứng bất thường không
                        + Điều chỉnh tưới nước nếu cần
                        + Ghi chép thời gian vệ sinh để theo dõi`
            }, {
                id: 'nho-co-dai', title: '🌿 Nhổ Cỏ Dại Quanh Gốc', content: `🔍 Nhận biết cỏ dại:
                        1. Cây mọc tự nhiên trong chậu
                        2. Không phải sen đá (lá khác hẳn)
                        3. Thường có rễ chính sâu
                        4. Phát triển nhanh, cạnh tranh dinh dưỡng

                        🔧 Cách nhổ cỏ đúng:
                        1. Tưới ẩm đất trước khi nhổ
                        2. Cầm sát gốc cỏ, kéo thẳng lên
                        3. Nhổ cả rễ, không để sót
                        4. Dùng nhíp với cỏ nhỏ

                        ⏰ Thời điểm nhổ cỏ:
                        + Khi cỏ còn nhỏ (dễ nhổ hơn)
                        + Sau khi tưới nước (đất mềm)
                        + Thường xuyên kiểm tra hàng tuần
                        + Ngay khi phát hiện

                        🚫 Tác hại của cỏ dại:
                        + Cạnh tranh nước và dinh dưỡng
                        + Che khuất ánh sáng
                        + Tạo môi trường ẩm ướt (dễ nấm mốc)
                        + Làm mất thẩm mỹ chậu cây`
            }, {
                id: 'lich-ve-sinh-dinh-ky', title: '📅 Lịch Vệ Sinh Định Kỳ', content: `📆 Tần suất vệ sinh:
                        + Hàng tuần: Kiểm tra tổng quát
                        + 2 tuần/lần: Vệ sinh lá già rõ rệt
                        + Hàng tháng: Vệ sinh toàn diện
                        + Theo mùa: Vệ sinh đặc biệt

                        🌤️ Vệ sinh theo mùa:
                        Mùa xuân (tháng 2-4):
                        + Cây bắt đầu sinh trưởng mạnh
                        + Vệ sinh để chuẩn bị cho mùa phát triển
                        + Loại bỏ lá già từ mùa đông

                        Mùa hè (tháng 5-7):
                        + Kiểm tra thường xuyên hơn (2 lần/tuần)
                        + Chú ý lá bị cháy nắng
                        + Tăng cường nhổ cỏ dại

                        Mùa thu (tháng 8-10):
                        + Chuẩn bị cho mùa nghỉ
                        + Vệ sinh kỹ lưỡng
                        + Loại bỏ lá yếu

                        Mùa đông (tháng 11-1):
                        + Giảm tần suất vệ sinh
                        + Chỉ loại lá thật già, thối
                        + Tránh làm stress cây trong mùa lạnh

                        💡 Mẹo ghi nhớ:
                        + Đặt lịch nhắc trên điện thoại
                        + Kết hợp với lịch tưới nước
                        + Ghi chép nhật ký chăm sóc
                        + Chụp ảnh trước/sau để so sánh`
            }, {
                id: 'loi-ich-ve-sinh-dung-cach', title: '🏆 Lợi Ích Khi Vệ Sinh Đúng Cách', content: `🌱 Về sức khỏe cây:
                        + Giảm 80% nguy cơ nhiễm sâu bệnh
                        + Cây phát triển nhanh hơn 30%
                        + Tăng tuổi thọ cây
                        + Lá mới tươi đẹp hơn

                        🎨 Về thẩm mỹ:
                        + Cây luôn gọn gàng, đẹp mắt
                        + Tôn lên màu sắc tự nhiên
                        + Hình dáng cây cân đối
                        + Phù hợp trang trí nội thất

                        💰 Về kinh tế:
                        + Tiết kiệm chi phí thuốc trị bệnh
                        + Không phải thay cây chết
                        + Cây khỏe mạnh, ít chăm sóc đặc biệt
                        + Có thể nhân giống từ cây mẹ khỏe

                        🧠 Về trải nghiệm:
                        + Tạo thói quen chăm sóc tốt
                        + Hiểu rõ hơn về cây trồng
                        + Cảm giác thành tựu khi cây đẹp
                        + Thư giãn, giảm stress khi chăm cây

                        🌍 Lời khuyên cuối:
                        Vệ sinh lá già là việc đơn giản nhưng mang lại hiệu quả lớn. Hãy biến nó thành thói quen hàng tuần để có một vườn sen đá luôn khỏe mạnh và đẹp mắt!`
            }]
        }
    }, {
        id: 'nhan-giong-bang-nuoc-2',
        title: 'Nhân giống sen đá bằng nước (Phương pháp nâng cao)',
        author: 'Chuyên gia Nhân giống Pro',
        date: 'Thứ 3, 26 Tháng 11, 2025',
        category: 'Kỹ thuật nâng cao',
        readTime: '12 phút đọc',
        description: '💧 Phương pháp nhân giống sen đá bằng nước nâng cao với 2 video hướng dẫn chi tiết. Kỹ thuật chuyên nghiệp, tỷ lệ thành công cao, phù hợp cho người có kinh nghiệm!',
        tags: ['Nhân giống nâng cao', 'Thủy canh', 'Kỹ thuật pro', 'Hiệu quả cao'],
        difficulty: 'Khó',
        img: 'https://file.hstatic.net/1000187613/article/maxresdefault_7ca4637e0adb4e509e41f2a0f31d3839.jpg',
        content: {
            intro: 'Phương pháp nhân giống sen đá bằng nước nâng cao với hai kỹ thuật khác nhau. Dành cho những ai muốn thành thạo nghệ thuật nhân giống sen đá chuyên nghiệp.',
            videoUrl: 'https://youtu.be/5Iq2Acbm2PA',
            sections: [{
                id: 'video-nhan-giong-1', title: '🎥 Video 1: Kỹ Thuật Nhân Giống Cơ Bản', content: `Video đầu tiên hướng dẫn:
                        1. Chuẩn bị dụng cụ chuyên nghiệp
                        2. Chọn lá và cành phù hợp cho nhân giống
                        3. Thiết lập hệ thống nhân giống bằng nước
                        4. Theo dõi quá trình phát triển rễ từng ngày
                        5. Chuyển cây con sang môi trường đất`
            }]
        }
    }, {
        id: 'sen-da-thieu-nang',
        title: 'Biểu hiện sen đá thiếu nắng',
        author: 'Chuyên gia Ánh sáng',
        date: 'Thứ 4, 27 Tháng 11, 2025',
        category: 'Chăm sóc cơ bản',
        readTime: '7 phút đọc',
        description: '☀️ Nhận biết các dấu hiệu sen đá thiếu nắng qua hình ảnh so sánh rõ ràng. Học cách khắc phục và điều chỉnh ánh sáng cho cây phát triển tốt nhất!',
        tags: ['Thiếu nắng', 'Ánh sáng', 'Dấu hiệu bệnh', 'Khắc phục'],
        difficulty: 'Dễ',
        img: 'https://file.hstatic.net/1000187613/article/succulent_with_enough_light_vs._etiolated_2048x.progressive_7cf15f47fd264597b531b0142691dd36.jpg',
        content: {
            intro: 'So sánh trực quan giữa sen đá có đủ ánh sáng và sen đá thiếu nắng. Học cách nhận biết sớm và khắc phục kịp thời để cây phát triển khỏe mạnh.',
            videoUrl: 'https://youtu.be/NM8dnd9Livg',
            sections: [{
                id: 'video-thieu-nang', title: '🎥 Video Phân Tích Thiếu Nắng', content: `Video chi tiết về:
                        1. So sánh trực quan sen đá đủ nắng vs thiếu nắng
                        2. Giải thích hiện tượng etiolation (vươn dài tìm sáng)
                        3. Các dấu hiệu cảnh báo sớm
                        4. Cách đo lường cường độ ánh sáng
                        5. Phương pháp khắc phục hiệu quả`
            }]
        }
    }, {
        id: 'bau-cuu-vao-vuon-sen-da',
        title: 'Bạn cừu béo đi lạc vào vườn sen đá và cái kết',
        author: 'Storyteller Vườn',
        date: 'Thứ 5, 28 Tháng 11, 2025',
        category: 'Giải trí',
        readTime: '4 phút đọc',
        description: '🐑 Câu chuyện thú vị về chú cừu béo đi lạc vào vườn sen đá. Video hài hước và ý nghĩa về mối quan hệ giữa động vật và thực vật. Cười vui và học hỏi!',
        tags: ['Giải trí', 'Câu chuyện', 'Động vật', 'Hài hước'],
        difficulty: 'Dễ',
        img: 'https://file.hstatic.net/1000187613/article/img_5376_copy_453d1d7c28e74cf9a1767d0d15619e21_7ba40e16e93d42a49c57f318f09b2776.jpg',
        content: {
            intro: 'Một câu chuyện nhẹ nhàng và thú vị về cuộc phiêu lưu của chú cừu béo trong vườn sen đá. Đôi khi những điều bất ngờ lại mang đến niềm vui và bài học ý nghĩa.',
            videoUrl: 'https://youtu.be/VXjVEWayFfQ',
            sections: [{
                id: 'video-cuu-beo', title: '🎥 Video Câu Chuyện Cừu Béo', content: `Câu chuyện thú vị về:
                        1. Chú cừu béo đáng yêu đi lạc vào vườn
                        2. Cuộc gặp gỡ bất ngờ với các chậu sen đá
                        3. Những tình huống hài hước xảy ra
                        4. Cái kết bất ngờ và ý nghĩa
                        5. Bài học về sự hòa hợp trong tự nhiên`
            }]
        }
    }, {
        id: 're-con-moc-giua-than',
        title: 'RỄ CON MỌC GIỮA THÂN',
        author: 'Chuyên gia Sinh lý thực vật',
        date: 'Thứ 6, 29 Tháng 11, 2025',
        category: 'Kiến thức cơ bản',
        readTime: '12 phút đọc',
        description: '🌱 Hiện tượng rễ con mọc trên thân sen đá - Tín hiệu cảnh báo điều kiện sinh trưởng. 3 nguyên nhân phổ biến và cách xử lý chi tiết với hình ảnh minh họa thực tế!',
        tags: ['Rễ con', 'Rễ khí sinh', 'Sinh lý cây', 'Chẩn đoán', 'Thiếu nước', 'Thiếu nắng'],
        difficulty: 'Trung bình',
        img: 'http://file.hstatic.net/1000187613/article/he-little-white-strands-are-roots-now-i-know-why-my-succulent-has-them.jpg',
        content: {
            intro: 'Nếu bạn trồng sen đá đã lâu chắc hẳn đã từng thấy hiện tượng trên thân sen đá mọc ra khá nhiều rễ li ti. Hiện tượng này không quá đáng lo, tuy nhiên khi cây có biểu hiện như vậy, tức là có một điều kiện sinh trưởng không được đáp ứng. Để sen đá phát triển tốt nhất, chúng ta cần tìm hiểu rõ nguyên nhân và điều chỉnh kịp thời.',
            sections: [{
                id: 'hien-tuong-re-con-la-gi', title: '🔍 Hiện Tượng Rễ Con Mọc Trên Thân Là Gì?', content: `![Rễ con mọc trên thân sen đá](http://file.hstatic.net/1000187613/article/he-little-white-strands-are-roots-now-i-know-why-my-succulent-has-them.jpg)
                       
                         🌱 Định nghĩa khoa học:
                        Rễ con mọc trên thân còn gọi là "rễ khí sinh" (aerial roots) - đây là những rễ phụ phát triển từ thân cây, không phải từ hệ thống rễ chính dưới đất.

                        👁️ Đặc điểm nhận biết:
                        1. Màu sắc: Thường màu trắng, hồng nhạt khi mới mọc
                        2. Kích thước: Nhỏ li ti, dài 0.5-2cm
                        3. Vị trí: Mọc rải rác trên thân, đặc biệt ở các đốt lá
                        4. Số lượng: Từ vài rễ đến hàng chục rễ tùy mức độ

                        ⚖️ Đánh giá mức độ:
                        1. Bình thường: Vài rễ nhỏ, cây vẫn khỏe mạnh
                        2. Cảnh báo: Nhiều rễ xuất hiện đồng loạt
                        3. Nguy hiểm: Rễ con kèm theo lá vàng, cây yếu ớt

                        🔬 Tại sao cây lại mọc rễ con?
                        Đây là cơ chế tự bảo vệ của sen đá khi:
                        1. Hệ thống rễ chính không đáp ứng đủ nhu cầu
                        2. Cây cần tìm kiếm nguồn nước/dinh dưỡng bổ sung
                        3. Điều kiện môi trường không phù hợp
                        4. Cây chuẩn bị cho việc nhân giống tự nhiên`
            }, {
                id: 'nguyen-nhan-1-thieu-nuoc', title: '💧 Nguyên Nhân 1: Cây Bị Thiếu Nước', content: `![Sen đá thiếu nước mọc rễ con màu hồng](https://file.hstatic.net/1000187613/file/a-graptoveria-debbie-succulent-with-pink-aerial-roots_grande.jpg)

                        🔬 Cơ chế sinh lý chi tiết:
                        Khi sen đá bị thiếu nước lâu ngày, đất trồng khô cứng không cung cấp đủ độ ẩm cho rễ chính. Cây sẽ kích hoạt cơ chế sinh tồn bằng cách mọc rễ mới ở thân để "tìm nước" từ những nguồn khác, chủ yếu từ độ ẩm trong không khí.

                        📊 Dấu hiệu nhận biết cụ thể:
                        
                        🌱 Về cây:
                        1. Nhiều rễ li ti màu trắng/hồng nhạt trên thân
                        2. Lá bắt đầu nhăn nheo, mềm nhũn
                        3. Lá dưới cùng héo, khô trước
                        4. Cây có vẻ "khát nước", kém sức sống

                        🌍 Về đất:
                        1. Đất khô cứng, co rúm lại khỏi thành chậu
                        2. Bề mặt đất nứt nẻ, cứng như đá
                        3. Khi tưới, nước chảy xuống nhanh không thấm
                        4. Dùng tăm tre đâm xuống đất hoàn toàn khô

                        💧 Giải pháp xử lý chi tiết:
                        
                        Bước 1: Tưới nước cấp cứu
                        1. Tưới từ từ, nhiều lần nhỏ để đất thấm dần
                        2. Tưới đến khi nước chảy ra lỗ thoát nước
                        3. Đảm bảo toàn bộ khối đất được ướt đều

                        Bước 2: Điều chỉnh phương pháp tưới
                        1. Nguyên tắc: Tăng lượng nước mỗi lần, KHÔNG tăng tần suất
                        2. Cách kiểm tra: Dùng tăm tre đâm 3-5cm xuống đất
                        3. Thời điểm tưới: Khi đất khô 70-80%
                        4. Lượng nước: Tưới đến khi nước tràn ra đĩa lót

                        ![Sen đá cần được tưới nước nhiều hơn khi có rễ khí sinh](https://file.hstatic.net/1000187613/file/you-may-need-to-water-your-succulents-more-if-you-notice-aerial-roots_grande.jpg)

                        ⚠️ Lưu ý quan trọng:
                        Việc tưới nước đầy đủ không thể hiện ở số lần tưới trong tuần, mà thể hiện ở lượng nước mỗi lần tưới - mỗi khi tưới phải tưới ướt đẫm sao cho toàn bộ bộ rễ của cây nhận được nước.`
            }, {
                id: 'nguyen-nhan-2-thieu-nang', title: '☀️ Nguyên Nhân 2: Cây Bị Thiếu Nắng', content: `![Thân sen đá có nhiều rễ khí sinh do thiếu nắng](https://file.hstatic.net/1000187613/file/a-succulent-stem-with-lots-of-aerial-roots_grande.jpg)

                        🌱 Các loại sen đá dễ bị:
                        Trường hợp này thường gặp ở những loại cần nắng nhiều, điển hình là:
                        1. Chi Sedum: Sen hồng mập, kim tuyến
                        2. Chi Graptopetalum: Thạch ngọc mỹ, pha lê nâu
                        3. Các hybrid: Đá cam, đá đỏ, đá vàng
                        4. Loại khác: Các sen đá có màu đỏ, tím, cam

                        🔍 Hiện tượng kèm theo:
                        1. Etiolation: Thân cao và vươn dài bất thường
                        2. Rễ li ti: Xuất hiện nhiều trên thân kéo dài
                        3. Màu sắc: Lá nhạt màu, mất sắc thái đẹp
                        4. Khoảng cách lá: Xa nhau, không còn chặt chẽ
                        5. Hướng nghiêng: Cây nghiêng về phía có ánh sáng

                        ![Cây sen đá ra rễ trên không vì thiếu nắng](https://file.hstatic.net/1000187613/file/graptopetalum-paraguayense-with-aerial-roots_grande.jpg)
                        
                        ![Cây sen đá bị kéo dài thân do thiếu ánh sáng](https://file.hstatic.net/1000187613/file/graptoveria-fred-ives-with-air-roots_grande.jpg)

                        🌞 Cách xử lý chi tiết:
            
                        Bước 1: Đánh giá ánh sáng hiện tại
                        1. Kiểm tra cây nhận được bao nhiêu giờ nắng trực tiếp/ngày
                        2. Xác định có phải chỉ là ánh sáng gián tiếp không
                        3. Quan sát bóng cây có rõ nét không

                        Bước 2: Tăng thời gian phơi nắng
                        1. Di chuyển cây ra vị trí có nhiều nắng trực tiếp hơn
                        2. Tăng dần thời gian phơi nắng (mỗi tuần thêm 1-2 giờ)
                        3. Ưu tiên nắng sáng (6:00-10:00) an toàn nhất

                        Bước 3: Hỗ trợ bằng ánh sáng nhân tạo
                        1. Dùng đèn LED grow light nếu thiếu nắng tự nhiên
                        2. Đặt đèn cách cây 15-30cm
                        3. Chiếu 12-14 giờ/ngày để bù đắp

                        💡 Đánh giá mức độ nguy hiểm:
                        Đối với những trường hợp thiếu nắng, hiện tượng rễ con hầu như VÔ HẠI đối với sen đá. Chỉ cần điều chỉnh lại thời gian phơi nắng sẽ giúp cây đẹp hơn và rễ con sẽ tự nhiên biến mất.`
            }, {
                id: 'nguyen-nhan-3-hu-re-chinh', title: '🚨 Nguyên Nhân 3: Rễ Chính Bị Hư (NGUY HIỂM NHẤT)', content: `⚠️ Cảnh báo: Đây là nguyên nhân nguy hiểm nhất theo kinh nghiệm! Nếu không điều chỉnh kịp thời, sen đá sẽ chết.

                        🔍 Nguyên nhân gốc:
                        Khi trồng sen đá bằng hỗn hợp đất quá giữ nước mà không trộn thêm bất kỳ thành phần thoát nước nào (ví dụ điển hình: đất sạch Tribat thuần). Đặc điểm của những loại đất này:
                        + Dính chặt, không thoát nước
                        + Giữ ẩm quá lâu sau khi tưới
                        + Không có khoảng trống cho rễ thở
                        + Dễ bị nén chặt theo thời gian

                        ![Đất quá giữ nước gây hư rễ cho sen đá](https://file.hstatic.net/1000187613/file/home-design_grande.jpg)

                        🔬 Cơ chế phá hủy:
                        Sau khi trồng một thời gian → rễ chính bắt đầu hư dần do ngập úng → khi bộ rễ chính hầu như tổn thương → cây phản ứng bằng cách sinh ra rễ con li ti để "cứu cánh" → tuy nhiên rễ con không thể giúp cây sống lâu dài nếu rễ chính đã hư hoàn toàn.

                        🚨 Dấu hiệu nhận biết nguy hiểm:
                        
                        👁️ Quan sát cây:
                        + Rất nhiều rễ con mọc dày đặc trên thân
                        + Cây tổng thể yếu ớt, không còn sức sống
                        + Lá vàng rụng bất thường từ dưới lên
                        + Thân cây mềm nhũn, mất độ cứng cáp
                        + Cây nghiêng, không thể đứng thẳng

                        👃 Kiểm tra đất:
                        + Đất có mùi hôi, thối
                        + Khi lấy cây ra thấy rễ đen, nhão
                        + Đất dính chặt vào rễ, khó tách ra
                        + Nước tưới không thấm, đọng trên mặt

                        🆘 Phương pháp cứu chữa khẩn cấp:
                        
                        Bước 1: Lấy cây ra và đánh giá tổn thương
                        + Nhẹ nhàng lấy cây ra khỏi chậu
                        + Rũ sạch hoàn toàn đất cũ
                        + Kiểm tra tình trạng rễ chính

                        Bước 2: Cắt bỏ phần hư hỏng
                        + Dùng kéo sạch sẽ cắt bỏ toàn bộ rễ thối (màu đen, nhão)
                        + Cắt cả phần thân bị ảnh hưởng nếu có
                        + Để lại chỉ phần khỏe mạnh

                        Bước 3: Xử lý vết cắt
                        + Để cây phơi khô 2-3 ngày ở nơi thoáng mát
                        + Có thể dùng bột than hoạt tính bôi vết cắt
                        + Đảm bảo vết cắt khô hoàn toàn trước khi trồng lại

                        Bước 4: Chuẩn bị đất mới thoát nước tốt
                        + Pha trộn đất thoát nước tốt theo tỷ lệ khoa học
                        + Đảm bảo hỗn hợp tơi xốp, thoát nước nhanh

                        Bước 5: Trồng lại và chăm sóc
                        + Trồng cây vào đất mới
                        + QUAN TRỌNG: Không tưới nước trong 1 tuần đầu
                        + Đặt ở nơi sáng nhưng không nắng trực tiếp
                        + Sau 1 tuần, bắt đầu tưới nước nhẹ

                        ![Sen đá mọc rễ khí sinh khi thiếu nước](https://file.hstatic.net/1000187613/file/rotinctum-frequently-grows-air-roots-when-it-isnt-getting-enough-water_grande.jpg)

                        ⏰ Thời gian phục hồi:
                        + Tuần 1-2: Cây thích nghi, có thể hơi úa
                        + Tuần 3-4: Bắt đầu phục hồi, rễ mới mọc
                        + Tháng 2-3: Cây khỏe mạnh trở lại hoàn toàn

                        🌟 Lời khuyên từ kinh nghiệm:
                        Do vậy, khi cây rơi vào trường hợp này, các bạn nên kiểm tra ngay đất trồng và có phương pháp thay thế kịp thời để sen đá không bị chết. Đây là kinh nghiệm thực tế từ việc trồng sen đá lâu năm tại Sài Gòn.`
            }, {
                id: 'ket-luan-kinh-nghiem', title: '📝 Kết Luận Và Chia Sẻ Kinh Nghiệm', content: `🌍 Lời kết từ người có kinh nghiệm:

                        Trên đây là một vài kinh nghiệm mà mình đúc kết được sau thời gian dài trồng sen đá tại Sài Gòn. Vì đây là kinh nghiệm thực tế nên chắc chắn sẽ có những thiếu sót, và có thể sẽ khác khi các bạn trồng sen đá tại một nơi có điều kiện khí hậu khác với Sài Gòn.

                        🤝 Lời mong muốn:
                        Tuy nhiên mình cũng mong những chia sẻ này sẽ giúp ích được gì đó cho các bạn. Nếu thấy bổ ích, mọi người nhớ like hoặc share bài viết này để mình có thêm động lực làm thêm nhiều bài viết khác nhé.

                        🌱 Tóm tắt 3 nguyên nhân chính:
                        1. 💧 Thiếu nước: Dễ khắc phục, tưới đúng cách
                        2. ☀️ Thiếu nắng: Vô hại, chỉ cần tăng ánh sáng
                        3. 🚨 Rễ chính hư: Nguy hiểm nhất, cần xử lý gấp

                        💡 Nguyên tắc vàng:
                        Hiện tượng rễ con không quá đáng lo, nhưng đây là "lời nói" của cây. Hãy lắng nghe và đáp ứng đúng nhu cầu của chúng để có một vườn sen đá khỏe mạnh và đẹp mắt!

                        📞 Hỗ trợ cộng đồng:
                        Nếu bạn gặp trường hợp khác hoặc cần tư vấn thêm, đừng ngại chia sẻ trong cộng đồng yêu sen đá để cùng nhau học hỏi và phát triển! 🌵💚`
            }]
        }
    },]

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Dễ':
                return 'success'
            case 'Trung bình':
                return 'warning'
            case 'Nâng cao':
                return 'error'
            default:
                return 'primary'
        }
    }

    const getCategoryColor = (category) => {
        const colors = {
            'Hướng dẫn chăm sóc sen đá': 'primary',
            'Kiến thức cơ bản': 'secondary',
            'Kỹ thuật nâng cao': 'error',
            'Chăm sóc theo mùa': 'info',
            'Kinh nghiệm thực tế': 'warning',
            'Thực hành': 'success',
            'Nhân giống': 'success',
            'Trang trí': 'secondary',
            'Chăm sóc cơ bản': 'primary',
            'Bệnh hại': 'error',
            'Giải trí': 'info'
        }
        return colors[category] || 'default'
    }

    return (<Box
            component="section"
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 30%, #d1fae5 70%, #a7f3d0 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '200px',
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(16,185,129,0.05) 100%)',
                    borderRadius: '0 0 60px 60px',
                }
            }}
        >
            <Container maxWidth="xl"
                       sx={{position: 'relative', zIndex: 1, py: {xs: 6, md: 8}, px: {xs: 2, sm: 3, md: 4}}}>
                {/* Clean Header Section */}
                <Box sx={{textAlign: 'center', mb: {xs: 5, md: 6}}}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#059669',
                            fontWeight: 600,
                            letterSpacing: 1.5,
                            fontSize: '0.8rem',
                            mb: 2,
                            display: 'block'
                        }}
                    >
                        🌿 KIẾN THỨC CHĂM SÓC
                    </Typography>

                    <Typography
                        variant="h1"
                        component="h1"
                        sx={{
                            fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 700,
                            mb: 3,
                            fontSize: {xs: '2.2rem', md: '3rem', lg: '3.4rem'},
                            background: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            lineHeight: 1.15,
                            letterSpacing: '-0.02em'
                        }}
                    >
                        Góc chăm sóc sen đá
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            maxWidth: '600px',
                            mx: 'auto',
                            lineHeight: 1.6,
                            fontWeight: 400,
                            color: '#374151',
                            fontSize: {xs: '1rem', md: '1.1rem'},
                            mb: 4
                        }}
                    >
                        Khám phá bí quyết chăm sóc sen đá từ những chuyên gia.
                        Từ cơ bản đến nâng cao, tất cả đều ở đây.
                    </Typography>

                    {/* Simple Decorative Line */}
                    <Box sx={{
                        width: 60,
                        height: 3,
                        background: 'linear-gradient(90deg, #10b981, #34d399)',
                        borderRadius: 2,
                        mx: 'auto',
                        mb: 2
                    }}/>
                </Box>

                {/* Blog Grid */}
                <Grid
                    container
                    spacing={{xs: 2, sm: 3, md: 3, lg: 4}}
                    sx={{
                        mb: {xs: 4, md: 6}, justifyContent: 'center', alignItems: 'stretch'
                    }}
                >
                    {posts.slice(0, showAdditionalPosts ? posts.length : posts.length - 3).map((post) => (<Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            xl={3}
                            key={post.id}
                            sx={{
                                display: 'flex'
                            }}
                        >
                            <Card
                                sx={{
                                    width: '100%',
                                    maxWidth: 350,
                                    height: '100%',
                                    minHeight: 480,
                                    mx: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(16, 185, 129, 0.15)',
                                    borderRadius: 3,
                                    boxShadow: '0 4px 24px rgba(16, 185, 129, 0.08)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 16px 48px rgba(16, 185, 129, 0.18)',
                                        borderColor: 'rgba(16, 185, 129, 0.25)',
                                    }
                                }}
                            >
                                {/* Clean Card Image */}
                                <Box sx={{position: 'relative'}}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={post.img}
                                        alt={post.title}
                                        onError={(e) => {
                                            e.target.src = '/nen.jpg'
                                        }}
                                        sx={{
                                            transition: 'transform 0.3s ease', '.MuiCard-root:hover &': {
                                                transform: 'scale(1.03)',
                                            }
                                        }}
                                    />

                                    {/* Clean Category Chip */}
                                    <Chip
                                        label={post.category}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            left: 12,
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                            background: 'rgba(255,255,255,0.9)',
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(16,185,129,0.2)',
                                            color: '#059669',
                                            zIndex: 3,
                                        }}
                                    />

                                    {/* Clean Difficulty Chip */}
                                    <Chip
                                        label={post.difficulty}
                                        color={getDifficultyColor(post.difficulty)}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                            zIndex: 3,
                                        }}
                                    />
                                </Box>

                                <CardContent sx={{
                                    flexGrow: 1, p: 3, position: 'relative',
                                }}>
                                    {/* Clean Meta Information */}
                                    <Stack
                                        direction="row"
                                        spacing={1.5}
                                        sx={{
                                            mb: 2.5, color: '#6b7280', fontSize: '0.8rem'
                                        }}
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <CalendarIcon sx={{fontSize: 12, color: '#059669'}}/>
                                            <Typography variant="caption" fontWeight={500}>{post.date}</Typography>
                                        </Stack>
                                        <Box
                                            sx={{width: 3, height: 3, borderRadius: '50%', bgcolor: '#d1d5db'}}/>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <TimeIcon sx={{fontSize: 12, color: '#059669'}}/>
                                            <Typography variant="caption" fontWeight={500}>
                                                {post.readTime}
                                            </Typography>
                                        </Stack>
                                    </Stack>

                                    {/* Enhanced Title */}
                                    <Typography
                                        variant="h6"
                                        component="h3"
                                        sx={{
                                            fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto", sans-serif',
                                            fontWeight: 600,
                                            mb: 2,
                                            lineHeight: 1.4,
                                            fontSize: {xs: '1.1rem', md: '1.15rem'},
                                            color: '#1f2937',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            letterSpacing: '-0.005em',
                                            wordBreak: 'break-word',
                                            hyphens: 'auto'
                                        }}
                                    >
                                        {post.title}
                                    </Typography>

                                    {/* Enhanced Description */}
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mb: 2.5,
                                            lineHeight: 1.65,
                                            fontSize: '0.875rem',
                                            color: '#4b5563',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            fontWeight: 400,
                                            wordBreak: 'break-word',
                                            hyphens: 'auto'
                                        }}
                                    >
                                        {post.description}
                                    </Typography>

                                    {/* Clean Tags */}
                                    <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', gap: 0.5, mb: 2.5}}>
                                        {post.tags.slice(0, 3).map((tag, index) => (<Chip
                                                key={index}
                                                label={tag}
                                                size="small"
                                                sx={{
                                                    fontSize: '0.7rem',
                                                    height: 24,
                                                    fontWeight: 500,
                                                    background: 'rgba(16,185,129,0.1)',
                                                    border: '1px solid rgba(16,185,129,0.2)',
                                                    color: '#059669',
                                                    borderRadius: 2,
                                                }}
                                            />))}
                                    </Stack>
                                </CardContent>

                                <Divider sx={{opacity: 0.05}}/>

                                {/* Clean Card Actions */}
                                <CardActions sx={{
                                    p: 3, justifyContent: 'space-between', alignItems: 'center',
                                }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {post.author.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600} color="#1f2937"
                                                        fontSize="0.85rem">
                                                {post.author}
                                            </Typography>
                                            <Typography variant="caption" color="#6b7280" fontSize="0.7rem">
                                                Chuyên gia
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleOpenPost(post)}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            px: 2.5,
                                            py: 1,
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            boxShadow: '0 4px 16px rgba(16,185,129,0.2)',
                                            color: 'white',
                                            fontSize: '0.8rem',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                boxShadow: '0 6px 20px rgba(16,185,129,0.3)',
                                                transform: 'translateY(-1px)'
                                            }
                                        }}
                                    >
                                        Đọc ngay
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>))}
                </Grid>

                {/* Additional Posts Section */}
                {showAdditionalPosts && (<>
                        <Box sx={{textAlign: 'center', mb: 4, mt: 6}}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontFamily: '"Inter", "Segoe UI", sans-serif',
                                    fontWeight: 700,
                                    mb: 2,
                                    color: '#047857',
                                }}
                            >
                                🌟 Bài viết đặc biệt
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#6b7280', maxWidth: '600px', mx: 'auto'
                                }}
                            >
                                Những kỹ thuật và mẹo hay từ cộng đồng yêu sen đá
                            </Typography>
                        </Box>

                        <Grid
                            container
                            spacing={{xs: 2, sm: 3, md: 3, lg: 4}}
                            sx={{
                                mb: {xs: 4, md: 6}, justifyContent: 'center', alignItems: 'stretch'
                            }}
                        >
                            {posts.slice(-3).map((post) => (<Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    lg={3}
                                    xl={3}
                                    key={post.id}
                                    sx={{
                                        display: 'flex'
                                    }}
                                >
                                    <Card
                                        sx={{
                                            width: '100%',
                                            maxWidth: 350,
                                            height: '100%',
                                            minHeight: 480,
                                            mx: 'auto',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(12px)',
                                            border: '2px solid rgba(16, 185, 129, 0.2)',
                                            borderRadius: 3,
                                            boxShadow: '0 6px 32px rgba(16, 185, 129, 0.12)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            '&:hover': {
                                                transform: 'translateY(-8px) scale(1.02)',
                                                boxShadow: '0 12px 48px rgba(16, 185, 129, 0.2)',
                                                borderColor: 'rgba(16, 185, 129, 0.3)',
                                            },
                                            '&::before': {
                                                content: '"🔥"',
                                                position: 'absolute',
                                                top: 15,
                                                right: 15,
                                                fontSize: '1.2rem',
                                                zIndex: 2
                                            }
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={post.img}
                                            alt={post.title}
                                            sx={{
                                                objectFit: 'cover',
                                                borderRadius: '12px 12px 0 0',
                                                transition: 'transform 0.3s ease'
                                            }}
                                        />

                                        <CardContent sx={{flexGrow: 1, p: 3}}>
                                            <Stack spacing={2}>
                                                <Stack direction="row" spacing={1} sx={{mb: 1}}>
                                                    <Chip
                                                        label={post.category}
                                                        size="small"
                                                        color={getCategoryColor(post.category)}
                                                        sx={{
                                                            fontSize: '0.7rem', fontWeight: 600, borderRadius: 2
                                                        }}
                                                    />
                                                    <Chip
                                                        label={post.difficulty}
                                                        size="small"
                                                        color={getDifficultyColor(post.difficulty)}
                                                        variant="outlined"
                                                        sx={{
                                                            fontSize: '0.7rem', fontWeight: 500, borderRadius: 2
                                                        }}
                                                    />
                                                </Stack>

                                                <Typography
                                                    variant="h6"
                                                    component="h3"
                                                    sx={{
                                                        fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto", sans-serif',
                                                        fontWeight: 700,
                                                        fontSize: '1.1rem',
                                                        lineHeight: 1.4,
                                                        color: '#111827',
                                                        letterSpacing: '-0.01em',
                                                        wordBreak: 'break-word',
                                                        hyphens: 'auto',
                                                        mb: 1.5,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {post.title}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto", sans-serif',
                                                        color: '#6b7280',
                                                        lineHeight: 1.6,
                                                        fontWeight: 400,
                                                        fontSize: '0.875rem',
                                                        wordBreak: 'break-word',
                                                        hyphens: 'auto',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        mb: 2
                                                    }}
                                                >
                                                    {post.description}
                                                </Typography>

                                                <Stack direction="row" spacing={1} sx={{mb: 2}}>
                                                    {post.tags.slice(0, 3).map((tag, index) => (<Chip
                                                            key={index}
                                                            label={tag}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                fontSize: '0.65rem',
                                                                height: 24,
                                                                borderColor: 'rgba(16, 185, 129, 0.3)',
                                                                color: '#059669',
                                                                fontWeight: 500,
                                                                '&:hover': {
                                                                    borderColor: '#10b981',
                                                                    backgroundColor: 'rgba(16, 185, 129, 0.05)'
                                                                }
                                                            }}
                                                        />))}
                                                </Stack>

                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <Avatar sx={{
                                                            width: 24,
                                                            height: 24,
                                                            bgcolor: '#10b981',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            {post.author.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="caption"
                                                                    sx={{color: '#6b7280', fontWeight: 500}}>
                                                            {post.author}
                                                        </Typography>
                                                    </Stack>

                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <TimeIcon sx={{fontSize: '0.875rem', color: '#9ca3af'}}/>
                                                        <Typography variant="caption" sx={{color: '#6b7280'}}>
                                                            {post.readTime}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </Stack>
                                        </CardContent>

                                        <CardActions sx={{p: 3, pt: 0}}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={() => handleOpenPost(post)}
                                                endIcon={<ArrowForwardIcon/>}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    borderRadius: 2.5,
                                                    py: 1.2,
                                                    fontSize: '0.9rem',
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                        boxShadow: '0 6px 24px rgba(16, 185, 129, 0.4)',
                                                        transform: 'translateY(-1px)'
                                                    }
                                                }}
                                            >
                                                Đọc ngay
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>))}
                        </Grid>
                    </>)}

                {/* Clean Footer CTA */}
                <Box sx={{
                    textAlign: 'center',
                    mt: 5,
                    p: 5,
                    background: 'rgba(255,255,255,0.8)',
                    borderRadius: 4,
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(16,185,129,0.1)',
                    boxShadow: '0 8px 32px rgba(16,185,129,0.08)'
                }}>
                    <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{
                            mb: 2, color: '#059669', fontFamily: '"Inter", "Segoe UI", sans-serif',
                        }}
                    >
                        Muốn học thêm? 🌱
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            mb: 4, fontWeight: 400, color: '#6b7280', maxWidth: '500px', mx: 'auto'
                        }}
                    >
                        Khám phá thêm những bí quyết chăm sóc sen đá từ cộng đồng yêu cây
                    </Typography>

                    <Button
                        variant="contained"
                        size="medium"
                        onClick={() => setShowAdditionalPosts(!showAdditionalPosts)}
                        endIcon={<ArrowForwardIcon sx={{
                            transform: showAdditionalPosts ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease'
                        }}/>}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontSize: '0.95rem',
                            background: showAdditionalPosts ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: showAdditionalPosts ? '0 6px 24px rgba(220,38,38,0.25)' : '0 6px 24px rgba(16,185,129,0.25)',
                            '&:hover': {
                                background: showAdditionalPosts ? 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                boxShadow: showAdditionalPosts ? '0 8px 32px rgba(220,38,38,0.35)' : '0 8px 32px rgba(16,185,129,0.35)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        {showAdditionalPosts ? 'Ẩn bài viết đặc biệt' : 'Khám phá thêm bài viết'}
                    </Button>
                </Box>
            </Container>

            {/* Content Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleClosePost}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        maxHeight: '90vh',
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                    }
                }}
            >
                {selectedPost && (<>
                        <DialogTitle sx={{
                            p: 4,
                            background: 'linear-gradient(135deg, #0b3f31 0%, #1e6f57 100%)',
                            color: 'white',
                            position: 'relative'
                        }}>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                <Box sx={{flexGrow: 1}}>
                                    <Typography variant="h4" fontWeight={800} gutterBottom>
                                        {selectedPost.title}
                                    </Typography>
                                    <Stack direction="row" spacing={3} alignItems="center" sx={{mt: 2}}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Avatar sx={{width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)'}}>
                                                {selectedPost.author.charAt(0)}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={600}>
                                                {selectedPost.author}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <CalendarIcon sx={{fontSize: 16}}/>
                                            <Typography variant="body2">{selectedPost.date}</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <TimeIcon sx={{fontSize: 16}}/>
                                            <Typography variant="body2">{selectedPost.readTime}</Typography>
                                        </Stack>
                                    </Stack>
                                </Box>
                                <IconButton
                                    onClick={handleClosePost}
                                    sx={{
                                        color: 'white', '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.1)'
                                        }
                                    }}
                                >
                                    <CloseIcon/>
                                </IconButton>
                            </Stack>
                        </DialogTitle>

                        <DialogContent sx={{p: 4}}>
                            {/* Introduction */}
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 4,
                                    lineHeight: 1.7,
                                    color: 'text.secondary',
                                    fontStyle: 'italic',
                                    borderLeft: '4px solid',
                                    borderColor: 'primary.main',
                                    pl: 3,
                                    background: 'rgba(16,185,129,0.05)',
                                    p: 2,
                                    borderRadius: 2
                                }}
                            >
                                {selectedPost.content.intro}
                            </Typography>

                            {/* Video Player (if video exists) */}
                            {selectedPost.content.videoUrl && (<Box sx={{
                                    mb: 4,
                                    position: 'relative',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)',
                                    border: '2px solid rgba(16,185,129,0.2)',
                                    p: 3
                                }}>
                                    <Stack spacing={2} alignItems="center">
                                        <Typography variant="h6" fontWeight={700} color="primary.main"
                                                    textAlign="center">
                                            🎥 Video hướng dẫn chi tiết
                                        </Typography>
                                        <Box sx={{
                                            position: 'relative',
                                            width: '100%',
                                            paddingBottom: '56.25%', // 16:9 aspect ratio
                                            height: 0,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                                        }}>
                                            <iframe
                                                src={selectedPost.content.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/').replace('watch?v=', 'embed/')}
                                                title="Video hướng dẫn"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            💡 Xem video để hiểu rõ hơn về cách nhận biết và phân loại sen đá
                                        </Typography>
                                    </Stack>
                                </Box>)}

                            {/* Content Sections */}
                            <List sx={{width: '100%'}}>
                                {selectedPost.content.sections.map((section, index) => (<Box key={section.id}>
                                        <ListItem
                                            button
                                            onClick={() => toggleSection(section.id)}
                                            sx={{
                                                borderRadius: 2,
                                                mb: 1,
                                                background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.05) 100%)',
                                                border: '1px solid rgba(16,185,129,0.2)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%)',
                                                }
                                            }}
                                        >
                                            <ListItemText
                                                primary={<Typography variant="h6" fontWeight={700} color="primary.main">
                                                    {section.title}
                                                </Typography>}
                                            />
                                            {expandedSections[section.id] ? <ExpandLess/> : <ExpandMore/>}
                                        </ListItem>
                                        <Collapse in={expandedSections[section.id]} timeout="auto" unmountOnExit>
                                            <Box sx={{
                                                p: 3,
                                                ml: 2,
                                                background: 'rgba(255,255,255,0.7)',
                                                borderRadius: 2,
                                                border: '1px solid rgba(0,0,0,0.05)',
                                                mb: 2
                                            }}>
                                                <ContentRenderer content={section.content}/>
                                                {section.videoEmbed && (<Box sx={{
                                                        mt: 3,
                                                        borderRadius: 2,
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                                                    }}>
                                                        <iframe
                                                            src={section.videoEmbed}
                                                            title="Video hướng dẫn"
                                                            width="100%"
                                                            height="400"
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                            style={{
                                                                borderRadius: '8px'
                                                            }}
                                                        />
                                                    </Box>)}
                                            </Box>
                                        </Collapse>
                                    </Box>))}
                            </List>
                        </DialogContent>

                        <DialogActions sx={{
                            p: 4,
                            background: 'linear-gradient(145deg, rgba(248,250,252,0.8) 0%, rgba(255,255,255,0.9) 100%)',
                            borderTop: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            <Stack direction="row" spacing={2} sx={{width: '100%', justifyContent: 'space-between'}}>
                                <Stack direction="row" spacing={1}>
                                    {selectedPost.tags.map((tag, index) => (<Chip
                                            key={index}
                                            label={tag}
                                            size="small"
                                            sx={{
                                                background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.1) 100%)',
                                                border: '1px solid rgba(16,185,129,0.3)',
                                                color: 'success.main',
                                                fontWeight: 600
                                            }}
                                        />))}
                                </Stack>
                                <Button
                                    variant="outlined"
                                    onClick={handleClosePost}
                                    sx={{
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderWidth: 2,
                                        '&:hover': {
                                            borderWidth: 2
                                        }
                                    }}
                                >
                                    Đóng
                                </Button>
                            </Stack>
                        </DialogActions>
                    </>)}
            </Dialog>
        </Box>)
}


