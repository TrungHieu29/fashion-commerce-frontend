# Fashion Commerce Frontend

Frontend cho hệ thống thương mại điện tử thời trang, xây dựng bằng React, TypeScript và Vite. Ứng dụng hỗ trợ luồng mua hàng, wishlist, giỏ hàng, đơn hàng, shop seller, quản trị viên, chat realtime và dashboard bán hàng.

## Công nghệ

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Zustand
- React Hook Form
- Zod
- Lucide React
- Recharts
- Sonner
- Tailwind CSS
- STOMP/SockJS cho realtime chat

## Chức năng chính

- Người dùng:
  - Đăng ký, đăng nhập, xác thực tài khoản
  - Xem danh sách sản phẩm, tìm kiếm, lọc theo danh mục, thương hiệu, giá
  - Xem chi tiết sản phẩm, chọn size/màu, thêm vào giỏ hàng
  - Wishlist với badge số lượng trên navbar
  - Thanh toán, xem lịch sử đơn hàng, đánh giá sản phẩm
  - Chat với shop

- Seller:
  - Đăng ký shop
  - Quản lý sản phẩm, biến thể, ảnh theo màu
  - Cập nhật trạng thái sản phẩm: `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`, `DRAFT`
  - Không hard delete sản phẩm ở màn seller để tránh ảnh hưởng order/history/invoice
  - Quản lý đơn hàng, giao hàng, mã giảm giá, dashboard và analytics

- Admin:
  - Quản lý users, shops, products, categories, brands, reviews, orders
  - Cập nhật trạng thái user/shop
  - Dashboard tổng quan hệ thống

## Yêu cầu môi trường

- Node.js phiên bản phù hợp với Vite/React hiện tại
- npm
- Backend Fashion Commerce đang chạy và expose API base URL

## Cài đặt

```bash
npm install
```

Tạo file `.env` ở thư mục root:

```env
VITE_API_URL=http://localhost:8080
```

Nếu dùng backend deploy, thay `VITE_API_URL` bằng URL backend tương ứng.

## Chạy development

```bash
npm run dev
```

Mặc định Vite chạy ở:

```text
http://localhost:5173
```

## Build production

```bash
npm run build
```

Preview bản build:

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Lưu ý tích hợp backend

### Product thumbnail

Backend `ProductResponseDto` cần trả field:

```json
{
  "imageUrl": "https://..."
}
```

`imageUrl` là ảnh đại diện dùng cho product card ở trang chủ, danh sách sản phẩm, shop detail, wishlist và search/filter. Frontend không gọi API lấy toàn bộ ảnh cho từng product trong danh sách nữa để tránh N+1 requests.

Trang detail sản phẩm và màn seller edit vẫn gọi API ảnh riêng để lấy đầy đủ ảnh theo màu:

```http
GET /api/product-images/product/{productId}
```

### Product status

Frontend public chỉ hiển thị sản phẩm có:

```text
status = ACTIVE
```

Các trạng thái khác như `INACTIVE`, `OUT_OF_STOCK`, `DRAFT` không hiển thị ở trang khách hàng, wishlist, shop detail và trang detail trực tiếp. Màn seller vẫn hiển thị mọi trạng thái để chủ shop có thể quản lý và chỉnh sửa.

### Không hard delete product ở seller

Seller không xóa cứng sản phẩm từ giao diện quản lý. Khi muốn ngừng bán, seller cập nhật trạng thái sản phẩm sang `INACTIVE`, `OUT_OF_STOCK` hoặc `DRAFT`.

Lý do: sản phẩm có thể đã nằm trong order, lịch sử mua hàng, hóa đơn, hoàn tiền và báo cáo doanh thu. Hard delete sẽ làm mất dữ liệu liên kết.

## Cấu trúc thư mục chính

```text
src/
  app/                 Router chính
  assets/              Ảnh tĩnh
  components/          Component dùng chung
  features/            Module theo nghiệp vụ
    admin/
    auth/
    cart/
    chat/
    discount/
    notification/
    order/
    product/
    product-variant/
    review/
    shop/
    user/
    wishlist/
  layouts/             Layout admin/seller/main/auth
  lib/                 Axios, query client, utils
  routes/              Route guards
  stores/              Zustand stores
```

## Deploy

Frontend có thể deploy lên Vercel hoặc các nền tảng static hosting khác.

Khi deploy cần cấu hình environment variable:

```env
VITE_API_URL=https://your-backend-domain.com
```

Sau khi thay đổi biến môi trường trên Vercel, cần redeploy để Vite bake lại biến vào bundle.

## Ghi chú hiệu năng

- Product card dùng `product.imageUrl` từ response list để tránh gọi thêm ảnh theo từng product.
- List product không nên trả toàn bộ images/variants để payload nhẹ.
- Detail product vẫn lấy images/variants riêng khi cần.
- Nếu API chậm trên Render, kiểm tra cold start và thời gian TTFB ở Network tab.
- Nếu search/filter chậm ở backend, kiểm tra index database cho các field thường query/sort.
