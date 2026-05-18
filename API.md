Fashion Commerce API Documentation
Tổng quan

Hệ thống API cho nền tảng thương mại điện tử thời trang, được xây dựng theo kiến trúc RESTful API và tài liệu hóa bằng OpenAPI 3.0.

Base URL: http://localhost:8080
Swagger Docs: /v3/api-docs
API Format: JSON
Authentication: JWT Bearer Token
1. Authentication & User Module
Authentication APIs
Method  Endpoint    Mô tả
POST    /api/auth/register  Đăng ký tài khoản
POST    /api/auth/authenticate  Đăng nhập hệ thống
User APIs
Method  Endpoint    Mô tả
GET /api/users  Lấy danh sách người dùng
GET /api/users/{id} Lấy thông tin user theo ID
GET /api/users/username/{username}  Tìm user theo username
PUT /api/users/{id} Cập nhật thông tin user
DELETE  /api/users/{id} Xóa user
Role APIs
Method  Endpoint    Mô tả
GET /api/roles  Lấy danh sách role
GET /api/roles/{id} Lấy role theo ID
GET /api/roles/name/{name}  Tìm role theo tên
DTO Schemas
AuthRequestDto (Login)
Field   Type    Validation  Mô tả
username    String  @NotBlank   Tên đăng nhập
password    String  @NotBlank   Mật khẩu
RegisterRequestDto
Field   Type    Validation  Mô tả
username    String  @NotBlank   Tên đăng nhập
password    String  @NotBlank, @Size(min = 6)   Mật khẩu
email   String  @Email, @NotBlank   Email
fullName    String  Optional    Họ tên
AuthResponseDto
Field   Type    Mô tả
token   String  JWT Token
type    String  Bearer
username    String  Username
roles   List<String>    Danh sách role
UserRequestDto
Field   Type    Validation  Mô tả
fullName    String  Optional    Họ tên
phone   String  Optional    Số điện thoại
email   String  @Email  Email
gender  String  Optional    Giới tính
dateOfBirth LocalDate   Optional    Ngày sinh
avatar  String  Optional    URL avatar
UserResponseDto
Field   Type    Mô tả
id  Long    ID người dùng
username    String  Username
email   String  Email
fullName    String  Họ tên
phone   String  Số điện thoại
roleName    String  Tên role
2. Shop Module
Shop APIs
Method  Endpoint    Mô tả
GET /api/shops  Lấy danh sách shop
GET /api/shops/{id} Lấy thông tin shop
GET /api/shops/owner/{ownerId}  Lấy shop theo owner
POST    /api/shops  Tạo shop
PUT /api/shops/{id} Cập nhật shop
DELETE  /api/shops/{id} Xóa shop
DTO Schemas
ShopRequestDto
Field   Type    Validation  Mô tả
ownerId Long    @NotNull    ID chủ shop
shopName    String  @NotBlank   Tên shop
description String  Optional    Mô tả shop
ShopResponseDto
Field   Type    Mô tả
id  Long    ID shop
ownerId Long    ID chủ shop
shopName    String  Tên shop
description String  Mô tả
createdAt   LocalDateTime   Ngày tạo
3. Product & Variant Module
Product APIs
Method  Endpoint    Mô tả
GET /api/products   Lấy danh sách sản phẩm
GET /api/products/{id}  Lấy sản phẩm theo ID
GET /api/products/search    Tìm kiếm sản phẩm
GET /api/products/shop/{shopId} Lấy sản phẩm theo shop
GET /api/products/category/{categoryId} Lấy sản phẩm theo category
GET /api/products/brand/{brandId}   Lấy sản phẩm theo brand
POST    /api/products   Tạo sản phẩm
PUT /api/products/{id}  Cập nhật sản phẩm
DELETE  /api/products/{id}  Xóa sản phẩm
Product Variant APIs
Method  Endpoint    Mô tả
GET /api/product-variants   Lấy danh sách variant
GET /api/product-variants/{id}  Lấy variant theo ID
GET /api/product-variants/product/{productId}   Lấy variant theo product
POST    /api/product-variants   Tạo variant
PUT /api/product-variants/{id}  Cập nhật variant
DELETE  /api/product-variants/{id}  Xóa variant
DTO Schemas
ProductRequestDto
Field   Type    Validation  Mô tả
productName String  @NotBlank   Tên sản phẩm
productDetail   String  Optional    Mô tả
price   BigDecimal  @NotNull, @DecimalMin("0")  Giá
status  String  Optional    ACTIVE / INACTIVE
shopId  Long    @NotNull    ID shop
categoryId  Long    @NotNull    ID category
brandId Long    @NotNull    ID brand
ProductResponseDto
Field   Type    Mô tả
id  Long    ID sản phẩm
productName String  Tên sản phẩm
productDetail   String  Mô tả
price   BigDecimal  Giá
status  String  Trạng thái
rating  Double  Đánh giá trung bình
shopId  Long    ID shop
categoryId  Long    ID category
brandId Long    ID brand
createdAt   LocalDateTime   Ngày tạo
ProductVariantRequestDto
Field   Type    Validation  Mô tả
productId   Long    @NotNull    ID sản phẩm
sku String  @NotBlank   SKU
color   String  Optional    Màu sắc
size    String  Optional    Kích thước
stock   Integer @Min(0) Tồn kho
price   BigDecimal  Optional    Giá riêng
ProductVariantResponseDto
Field   Type    Mô tả
id  Long    ID variant
productId   Long    ID sản phẩm
sku String  SKU
color   String  Màu
size    String  Size
stock   Integer Tồn kho
price   BigDecimal  Giá
4. Cart Module
Cart APIs
Method  Endpoint    Mô tả
GET /api/carts/user/{userId}    Lấy giỏ hàng
POST    /api/carts/user/{userId}/items  Thêm sản phẩm
PUT /api/carts/user/{userId}/items/{cartItemId} Cập nhật item
DELETE  /api/carts/user/{userId}/items/{cartItemId} Xóa item
DELETE  /api/carts/user/{userId}    Xóa toàn bộ giỏ hàng
DTO Schemas
CartItemRequestDto
Field   Type    Validation  Mô tả
productVariantId    Long    @NotNull    ID variant
quantity    Integer @Min(1) Số lượng
CartItemResponseDto
Field   Type    Mô tả
id  Long    ID cart item
productVariantId    Long    ID variant
productName String  Tên sản phẩm
sku String  SKU
quantity    Integer Số lượng
price   BigDecimal  Giá
totalPrice  BigDecimal  Tổng tiền
CartResponseDto
Field   Type    Mô tả
id  Long    ID cart
userId  Long    ID user
items   List<CartItemResponseDto>   Danh sách sản phẩm
totalAmount BigDecimal  Tổng tiền
5. Shipping Module
Shipping Address APIs
Method  Endpoint    Mô tả
GET /api/shipping-addresses Lấy danh sách địa chỉ
GET /api/shipping-addresses/{id}    Lấy địa chỉ
GET /api/shipping-addresses/user/{userId}   Lấy địa chỉ theo user
POST    /api/shipping-addresses Tạo địa chỉ
PUT /api/shipping-addresses/{id}    Cập nhật địa chỉ
PUT /api/shipping-addresses/{id}/set-default    Đặt mặc định
DELETE  /api/shipping-addresses/{id}    Xóa địa chỉ
DTO Schemas
ShippingAddressRequestDto
Field   Type    Validation  Mô tả
userId  Long    @NotNull    ID user
receiverName    String  @NotBlank   Người nhận
phone   String  @NotBlank   Số điện thoại
addressLine String  @NotBlank   Địa chỉ
city    String  @NotBlank   Thành phố
district    String  @NotBlank   Quận/Huyện
isDefault   Boolean Optional    Địa chỉ mặc định
ShippingAddressResponseDto
Field   Type    Mô tả
id  Long    ID địa chỉ
userId  Long    ID user
receiverName    String  Người nhận
phone   String  SĐT
addressLine String  Địa chỉ
city    String  Thành phố
district    String  Quận/Huyện
isDefault   Boolean Mặc định
6. Order Module
Order APIs
Method  Endpoint    Mô tả
GET /api/orders Lấy danh sách đơn
GET /api/orders/{id}    Lấy đơn theo ID
GET /api/orders/user/{userId}   Lấy đơn theo user
POST    /api/orders Tạo đơn hàng
PUT /api/orders/{orderId}/status    Cập nhật trạng thái
DELETE  /api/orders/{orderId}   Hủy/Xóa đơn
DTO Schemas
OrderRequestDto
Field   Type    Validation  Mô tả
userId  Long    @NotNull    ID user
addressId   Long    Optional    Địa chỉ có sẵn
receiverName    String  Optional    Người nhận mới
phone   String  Optional    SĐT
addressLine String  Optional    Địa chỉ
city    String  Optional    Thành phố
district    String  Optional    Quận/Huyện
OrderResponseDto
Field   Type    Mô tả
id  Long    ID đơn
orderCode   String  Mã đơn
totalPrice  BigDecimal  Tổng tiền
finalPrice  BigDecimal  Giá cuối
status  String  Trạng thái
createdAt   LocalDateTime   Ngày tạo
items   List<OrderItemResponseDto>  Danh sách item
OrderItemResponseDto
Field   Type    Mô tả
id  Long    ID item
productVariantId    Long    ID variant
productName String  Tên sản phẩm
quantity    Integer Số lượng
price   BigDecimal  Giá
7. Category & Brand Module
Category APIs
Method  Endpoint    Mô tả
GET /api/categories Lấy danh sách category
GET /api/categories/{id}    Lấy category
POST    /api/categories Tạo category
PUT /api/categories/{id}    Cập nhật category
DELETE  /api/categories/{id}    Xóa category
Product Brand APIs
Method  Endpoint    Mô tả
GET /api/product-brands Lấy danh sách brand
GET /api/product-brands/{id}    Lấy brand
POST    /api/product-brands Tạo brand
PUT /api/product-brands/{id}    Cập nhật brand
DELETE  /api/product-brands/{id}    Xóa brand
DTO Schemas
CategoryRequestDto
Field   Type    Validation  Mô tả
name    String  @NotBlank   Tên category
description String  Optional    Mô tả
parentId    Long    Optional    Category cha
CategoryResponseDto
Field   Type    Mô tả
id  Long    ID category
name    String  Tên category
description String  Mô tả
parentId    Long    ID category cha
ProductBrandRequestDto
Field   Type    Validation  Mô tả
name    String  @NotBlank   Tên brand
description String  Optional    Mô tả
ProductBrandResponseDto
Field   Type    Mô tả
id  Long    ID brand
name    String  Tên brand
description String  Mô tả
8. Review Module
Review APIs
Method  Endpoint    Mô tả
GET /api/reviews/{id}   Lấy review
GET /api/reviews/users/{userId} Review theo user
GET /api/reviews/products/{productId}   Review theo sản phẩm
POST    /api/reviews    Tạo review
PUT /api/reviews/{id}   Cập nhật review
DELETE  /api/reviews/{id}   Xóa review
9. Payment Module
Payment APIs
Method  Endpoint    Mô tả
GET /api/payments/{id}  Lấy payment
GET /api/payments/orders/{orderId}  Payment theo order
POST    /api/payments/orders/{orderId}  Thanh toán
PUT /api/payments/{id}/status   Cập nhật trạng thái
10. Conversation & Message Module
Conversation APIs
Method  Endpoint    Mô tả
GET /api/conversations  Danh sách conversation
GET /api/conversations/{id} Chi tiết conversation
GET /api/conversations/users/{userId}   Conversation theo user
GET /api/conversations/shops/{shopId}   Conversation theo shop
POST    /api/conversations  Tạo conversation
Message APIs
Method  Endpoint    Mô tả
GET /api/messages/conversations/{conversationId}    Danh sách tin nhắn
POST    /api/messages   Gửi tin nhắn
PUT /api/messages/conversations/{conversationId}/read   Đánh dấu đã đọc
Validation Rules
Request Validation

Các trường sử dụng annotation validation như:

@NotNull
@NotBlank
@Size
@Email
@Min
@DecimalMin

đều yêu cầu dữ liệu hợp lệ trước khi request được xử lý tại Controller.

Validation được kích hoạt thông qua annotation @Valid.

Pagination Response

Một số API sử dụng phân trang với các schema:

Pageable
PageableObject
SortObject
PageProductResponseDto
PageOrderResponseDto
PageReviewResponseDto
PageConversationResponseDto
PageDiscountResponseDto
PageMessageResponseDto
Authentication

Các API yêu cầu xác thực sẽ sử dụng:

Authorization: Bearer <JWT_TOKEN>

JWT Token được trả về sau khi đăng nhập thành công thông qua API:

POST /api/auth/authenticate

