Fashion Commerce API Documentation
Tổng quan

Tài liệu REST API cho hệ thống thương mại điện tử thời trang được xây dựng bằng Spring Boot và OpenAPI 3.0.

Base URL: http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui/index.html
OpenAPI JSON: http://localhost:8080/v3/api-docs
Authentication
Auth Controller
Đăng ký tài khoản
POST /api/auth/register
Đăng nhập
POST /api/auth/authenticate

Response:

{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
User Management
User Controller
Lấy danh sách người dùng
GET /api/users
Lấy người dùng theo ID
GET /api/users/{id}
Lấy người dùng theo username
GET /api/users/username/{username}
Cập nhật người dùng
PUT /api/users/{id}
Xóa người dùng
DELETE /api/users/{id}
Product Management
Product Controller
Lấy danh sách sản phẩm
GET /api/products
Tìm kiếm sản phẩm
GET /api/products/search
Lấy sản phẩm theo ID
GET /api/products/{id}
Lấy sản phẩm theo shop
GET /api/products/shop/{shopId}
Lấy sản phẩm theo danh mục
GET /api/products/category/{categoryId}
Lấy sản phẩm theo thương hiệu
GET /api/products/brand/{brandId}
Tạo sản phẩm
POST /api/products
Cập nhật sản phẩm
PUT /api/products/{id}
Xóa sản phẩm
DELETE /api/products/{id}
Product Variant Management
Product Variant Controller
Lấy danh sách biến thể
GET /api/product-variants
Lấy biến thể theo ID
GET /api/product-variants/{id}
Lấy biến thể theo sản phẩm
GET /api/product-variants/product/{productId}
Tạo biến thể
POST /api/product-variants
Cập nhật biến thể
PUT /api/product-variants/{id}
Xóa biến thể
DELETE /api/product-variants/{id}
Brand Management
Product Brand Controller
Lấy danh sách thương hiệu
GET /api/product-brands
Lấy thương hiệu theo ID
GET /api/product-brands/{id}
Tạo thương hiệu
POST /api/product-brands
Cập nhật thương hiệu
PUT /api/product-brands/{id}
Xóa thương hiệu
DELETE /api/product-brands/{id}
Category Management
Category Controller
Lấy danh sách danh mục
GET /api/categories
Lấy danh mục theo ID
GET /api/categories/{id}
Tạo danh mục
POST /api/categories
Cập nhật danh mục
PUT /api/categories/{id}
Xóa danh mục
DELETE /api/categories/{id}
Cart Management
Cart Controller
Lấy giỏ hàng của user
GET /api/carts/user/{userId}
Thêm sản phẩm vào giỏ hàng
POST /api/carts/user/{userId}/items

Body:

{
  "productVariantId": 1,
  "quantity": 2
}
Cập nhật số lượng sản phẩm
PUT /api/carts/user/{userId}/items/{cartItemId}

Body:

{
  "quantity": 3
}
Đổi variant sản phẩm
PUT /api/carts/user/{userId}/items/{cartItemId}/variant

Body:

{
  "productVariantId": 5
}
Xóa sản phẩm khỏi giỏ hàng
DELETE /api/carts/user/{userId}/items/{cartItemId}
Xóa toàn bộ giỏ hàng
DELETE /api/carts/user/{userId}
Order Management
Order Controller
Tạo đơn hàng
POST /api/orders
Lấy danh sách đơn hàng
GET /api/orders
Lấy đơn hàng theo ID
GET /api/orders/{id}
Lấy đơn hàng theo user
GET /api/orders/user/{userId}
Cập nhật trạng thái đơn hàng
PUT /api/orders/{orderId}/status
Xóa đơn hàng
DELETE /api/orders/{orderId}
Payment Management
Payment Controller
Thanh toán đơn hàng
POST /api/payments/orders/{orderId}
Lấy thanh toán theo đơn hàng
GET /api/payments/orders/{orderId}
Lấy thanh toán theo ID
GET /api/payments/{id}
Cập nhật trạng thái thanh toán
PUT /api/payments/{id}/status
Shipping Address Management
Shipping Address Controller
Lấy danh sách địa chỉ của user
GET /api/shipping-addresses/user/{userId}
Thêm địa chỉ giao hàng
POST /api/shipping-addresses
Cập nhật địa chỉ giao hàng
PUT /api/shipping-addresses/{id}
Đặt địa chỉ mặc định
PUT /api/shipping-addresses/{id}/set-default
Xóa địa chỉ giao hàng
DELETE /api/shipping-addresses/{id}
Shop Management
Shop Controller
Lấy danh sách shop
GET /api/shops
Lấy shop theo ID
GET /api/shops/{id}
Lấy shop theo owner
GET /api/shops/owner/{ownerId}
Tạo shop
POST /api/shops
Cập nhật shop
PUT /api/shops/{id}
Xóa shop
DELETE /api/shops/{id}
Review Management
Review Controller
Tạo đánh giá sản phẩm
POST /api/reviews
Lấy đánh giá theo sản phẩm
GET /api/reviews/products/{productId}
Lấy đánh giá theo user
GET /api/reviews/users/{userId}
Cập nhật đánh giá
PUT /api/reviews/{id}
Xóa đánh giá
DELETE /api/reviews/{id}
Conversation Management
Conversation Controller
Tạo cuộc trò chuyện
POST /api/conversations
Lấy danh sách cuộc trò chuyện
GET /api/conversations
Lấy cuộc trò chuyện theo ID
GET /api/conversations/{id}
Lấy cuộc trò chuyện theo user
GET /api/conversations/users/{userId}
Lấy cuộc trò chuyện theo shop
GET /api/conversations/shops/{shopId}
Message Management
Message Controller
Gửi tin nhắn
POST /api/messages
Lấy tin nhắn theo conversation
GET /api/messages/conversations/{conversationId}
Đánh dấu đã đọc
PUT /api/messages/conversations/{conversationId}/read
Discount Management
Discount Controller
Tạo mã giảm giá
POST /api/discounts
Lấy mã giảm giá theo shop
GET /api/discounts/shops/{shopId}
Lấy mã giảm giá đang hoạt động
GET /api/discounts/shops/{shopId}/active
Cập nhật mã giảm giá
PUT /api/discounts/{id}
Xóa mã giảm giá
DELETE /api/discounts/{id}
Role Management
Role Controller
Lấy tất cả role
GET /api/roles
Lấy role theo ID
GET /api/roles/{id}
Lấy role theo tên
GET /api/roles/name/{name}



DTO Models Documentation
User DTO
UserRequestDto
{
  "username": "trunghieu",
  "password": "123456",
  "fullName": "Nguyen Trung Hieu",
  "email": "hieu@gmail.com",
  "phone": "0123456789",
  "gender": "Male",
  "dateOfBirth": "2004-01-01",
  "avatar": "https://example.com/avatar.jpg"
}
Field	Type	Required	Description
username	String	Yes	Tên đăng nhập
password	String	Yes	Mật khẩu
fullName	String	Yes	Họ và tên
email	String	No	Email
phone	String	No	Số điện thoại
gender	String	No	Giới tính
dateOfBirth	LocalDate	No	Ngày sinh
avatar	String	No	URL ảnh đại diện
UserResponseDto
{
  "id": 1,
  "username": "trunghieu",
  "fullName": "Nguyen Trung Hieu",
  "phone": "0123456789",
  "status": "ACTIVE",
  "email": "hieu@gmail.com",
  "avatar": "https://example.com/avatar.jpg",
  "gender": "Male",
  "dateOfBirth": "2004-01-01",
  "createdAt": "2026-05-21T10:00:00",
  "roleName": "CUSTOMER"
}
Authentication DTO
AuthResponse
{
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": {
    "id": 1,
    "username": "trunghieu",
    "fullName": "Nguyen Trung Hieu"
  }
}
Field	Type	Description
accessToken	String	JWT access token
refreshToken	String	JWT refresh token
user	UserResponseDto	Thông tin người dùng
Shop DTO
ShopRequestDto
{
  "shopName": "Hieu Fashion",
  "logo": "https://example.com/logo.jpg",
  "phone": "0987654321",
  "address": "Ha Noi",
  "email": "shop@gmail.com",
  "ownerId": 1
}
ShopResponseDto
{
  "id": 1,
  "shopName": "Hieu Fashion",
  "logo": "https://example.com/logo.jpg",
  "phone": "0987654321",
  "status": "ACTIVE",
  "address": "Ha Noi",
  "email": "shop@gmail.com",
  "createdAt": "2026-05-21T10:00:00",
  "ownerId": 1,
  "ownerFullName": "Nguyen Trung Hieu"
}
Category DTO
CategoryRequestDto
{
  "name": "Áo Thun"
}
CategoryResponseDto
{
  "id": 1,
  "name": "Áo Thun"
}
Product Brand DTO
ProductBrandRequestDto
{
  "name": "Nike",
  "description": "Thương hiệu thời trang thể thao"
}
ProductBrandResponseDto
{
  "id": 1,
  "name": "Nike",
  "description": "Thương hiệu thời trang thể thao"
}
Product DTO
ProductRequestDto
{
  "productName": "Áo Hoodie",
  "productDetail": "Áo hoodie form rộng",
  "price": 350000,
  "shopId": 1,
  "brandId": 1,
  "categoryId": 1
}
Field	Type	Required	Description
productName	String	Yes	Tên sản phẩm
productDetail	String	No	Mô tả sản phẩm
price	BigDecimal	Yes	Giá sản phẩm
shopId	Long	Yes	ID shop
brandId	Long	Yes	ID thương hiệu
categoryId	Long	Yes	ID danh mục
ProductResponseDto
{
  "id": 1,
  "productName": "Áo Hoodie",
  "productDetail": "Áo hoodie form rộng",
  "rating": 4.8,
  "status": "ACTIVE",
  "price": 350000,
  "shopId": 1,
  "shopName": "Hieu Fashion",
  "brandId": 1,
  "brandName": "Nike",
  "categoryId": 1,
  "categoryName": "Áo"
}
Product Variant DTO
ProductVariantRequestDto
{
  "productId": 1,
  "size": "L",
  "color": "Black",
  "stock": 20
}
ProductVariantResponseDto
{
  "id": 1,
  "productId": 1,
  "size": "L",
  "color": "Black",
  "stock": 20
}
Cart DTO
CartItemRequestDto
{
  "productVariantId": 1,
  "quantity": 2
}
UpdateCartItemQuantityRequestDto
{
  "quantity": 5
}
UpdateCartItemVariantRequestDto
{
  "productVariantId": 3
}
CartItemResponseDto
{
  "id": 1,
  "productVariantId": 1,
  "productName": "Áo Hoodie",
  "size": "L",
  "color": "Black",
  "quantity": 2,
  "price": 350000,
  "imageUrl": "https://example.com/product.jpg",
  "subtotal": 700000
}
CartResponseDto
{
  "id": 1,
  "userId": 1,
  "updatedAt": "2026-05-21T10:00:00",
  "cartItems": [],
  "totalAmount": 700000
}
Shipping Address DTO
ShippingAddressRequestDto
{
  "userId": 1,
  "receiverName": "Nguyen Trung Hieu",
  "phone": "0123456789",
  "addressLine": "123 ABC",
  "city": "Ha Noi",
  "district": "Cau Giay",
  "isDefault": true
}
ShippingAddressResponseDto
{
  "id": 1,
  "userId": 1,
  "receiverName": "Nguyen Trung Hieu",
  "phone": "0123456789",
  "addressLine": "123 ABC",
  "city": "Ha Noi",
  "district": "Cau Giay",
  "isDefault": true
}
Order DTO
OrderRequestDto
{
  "userId": 1,
  "addressId": 1,
  "receiverName": "Nguyen Trung Hieu",
  "phone": "0123456789",
  "addressLine": "123 ABC",
  "city": "Ha Noi",
  "district": "Cau Giay"
}
OrderResponseDto
{
  "id": 1,
  "userId": 1,
  "userFullName": "Nguyen Trung Hieu",
  "totalPrice": 1000000,
  "finalPrice": 900000,
  "status": "PENDING",
  "addressSnapshot": "123 ABC, Cau Giay, Ha Noi",
  "createdAt": "2026-05-21T10:00:00",
  "updatedAt": "2026-05-21T10:00:00"
}
Payment DTO
PaymentRequestDto
{
  "method": "COD",
  "status": "PENDING",
  "transactionCode": "TRANS123456"
}
PaymentResponseDto
{
  "id": 1,
  "amount": 900000,
  "method": "COD",
  "status": "PENDING",
  "transactionCode": "TRANS123456",
  "createdAt": "2026-05-21T10:00:00"
}
Review DTO
ReviewRequestDto
{
  "userId": 1,
  "productId": 1,
  "orderItemId": 1,
  "rating": 5,
  "comment": "Sản phẩm rất đẹp"
}
ReviewResponseDto
{
  "id": 1,
  "userId": 1,
  "username": "trunghieu",
  "productId": 1,
  "productName": "Áo Hoodie",
  "orderItemId": 1,
  "rating": 5,
  "comment": "Sản phẩm rất đẹp",
  "createdAt": "2026-05-21T10:00:00"
}
Conversation DTO
ConversationRequestDto
{
  "userId": 1,
  "shopId": 1
}
ConversationResponseDto
{
  "id": 1,
  "userId": 1,
  "userName": "trunghieu",
  "userAvatar": "https://example.com/avatar.jpg",
  "shopId": 1,
  "shopName": "Hieu Fashion",
  "shopLogo": "https://example.com/logo.jpg",
  "createdAt": "2026-05-21T10:00:00"
}
Message DTO
MessageRequestDto
{
  "conversationId": 1,
  "senderId": 1,
  "content": "Xin chào shop"
}
MessageResponseDto
{
  "id": 1,
  "conversationId": 1,
  "senderId": 1,
  "senderName": "Nguyen Trung Hieu",
  "content": "Xin chào shop",
  "isRead": false,
  "createdAt": "2026-05-21T10:00:00"
}
Discount DTO
DiscountRequestDto
{
  "shopId": 1,
  "discountType": "PERCENT",
  "discountValue": 10,
  "startDate": "2026-05-01T00:00:00",
  "endDate": "2026-05-30T23:59:59",
  "status": "ACTIVE",
  "minOrderValue": 500000,
  "productIds": [1, 2, 3]
}
DiscountResponseDto
{
  "id": 1,
  "shopId": 1,
  "discountType": "PERCENT",
  "discountValue": 10,
  "startDate": "2026-05-01T00:00:00",
  "endDate": "2026-05-30T23:59:59",
  "status": "ACTIVE",
  "minOrderValue": 500000
}
Role DTO
RoleResponseDto
{
  "id": 1,
  "name": "ADMIN"
}
Order Item DTO
OrderItemResponseDto
{
  "id": 1,
  "productVariantId": 1,
  "productName": "Áo Hoodie",
  "productImage": "https://example.com/product.jpg",
  "size": "L",
  "color": "Black",
  "quantity": 2,
  "price": 350000
}
Order Shop DTO
OrderShopResponseDto
{
  "id": 1,
  "orderId": 1,
  "shopId": 1,
  "shopName": "Hieu Fashion",
  "totalPrice": 1000000,
  "finalPrice": 900000,
  "discountId": 1,
  "addressSnapshot": "123 ABC, Cau Giay, Ha Noi",
  "status": "PENDING",
  "orderItems": [],
  "shipping": {}
}
Order Shipping DTO
OrderShippingRequestDto
{
  "shippingStatus": "DELIVERING",
  "trackingCode": "GHN123456"
}
OrderShippingResponseDto
{
  "id": 1,
  "addressSnapshot": "123 ABC, Cau Giay, Ha Noi",
  "shippingStatus": "DELIVERING",
  "trackingCode": "GHN123456"
}