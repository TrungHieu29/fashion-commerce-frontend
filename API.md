FASHION COMMERCE API SPECIFICATION (OPTIMIZED FOR AI)
OAS Version: 3.0

Base URL: http://localhost:8080

I. DANH SÁCH MODULES & ENDPOINTS
1. Authentication & Roles (auth-controller, role-controller)
POST /api/auth/register (Body: UserRequestDto) -> AuthResponse

POST /api/auth/authenticate (Body: AuthRequestDto) -> AuthResponse

GET /api/roles -> List<RoleResponseDto>

GET /api/roles/{id} -> RoleResponseDto

GET /api/roles/name/{name} -> RoleResponseDto

2. User & Address (user-controller, shipping-address-controller)
GET /api/users -> List<UserResponseDto>

GET /api/users/{id} -> UserResponseDto

GET /api/users/username/{username} -> UserResponseDto

PUT /api/users/{id} (Body: UserUpdateRequestDto) -> UserResponseDto

DELETE /api/users/{id} -> void

GET /api/shipping-addresses -> List<ShippingAddressResponseDto>

GET /api/shipping-addresses/{id} -> ShippingAddressResponseDto

GET /api/shipping-addresses/user/{userId} -> List<ShippingAddressResponseDto>

POST /api/shipping-addresses (Body: ShippingAddressRequestDto) -> ShippingAddressResponseDto

PUT /api/shipping-addresses/{id} (Body: ShippingAddressRequestDto) -> ShippingAddressResponseDto

PUT /api/shipping-addresses/{id}/set-default -> ShippingAddressResponseDto

DELETE /api/shipping-addresses/{id} -> void

3. Shop Module (shop-controller, order-shop-controller)
GET /api/shops -> List<ShopResponseDto>

GET /api/shops/{id} -> ShopResponseDto

GET /api/shops/owner/{ownerId} -> ShopResponseDto

POST /api/shops (Body: ShopRequestDto) -> ShopResponseDto

PUT /api/shops/{id} (Body: ShopRequestDto) -> ShopResponseDto

DELETE /api/shops/{id} -> void

GET /api/order-shops/{id} -> OrderShopResponseDto

GET /api/order-shops/shop/{shopId} -> PageOrderShopResponseDto

GET /api/order-shops/order/{orderId} -> List<OrderShopResponseDto>

4. Product & Category & Brand (product-, product-variant-, product-brand-, product-image-, category-)
GET /api/products (Params: page, size) -> PageProductResponseDto

GET /api/products/{id} -> ProductResponseDto

GET /api/products/search (Params: keyword, page, size) -> PageProductResponseDto

GET /api/products/shop/{shopId} -> PageProductResponseDto

GET /api/products/category/{categoryId} -> PageProductResponseDto

GET /api/products/brand/{brandId} -> PageProductResponseDto

POST /api/products (Body: ProductRequestDto) -> ProductResponseDto

PUT /api/products/{id} (Body: ProductRequestDto) -> ProductResponseDto

DELETE /api/products/{id} -> void

GET /api/product-variants -> List<ProductVariantResponseDto>

GET /api/product-variants/{id} -> ProductVariantResponseDto

GET /api/product-variants/product/{productId} -> List<ProductVariantResponseDto>

POST /api/product-variants (Body: ProductVariantRequestDto) -> ProductVariantResponseDto

PUT /api/product-variants/{id} (Body: ProductVariantRequestDto) -> ProductVariantResponseDto

DELETE /api/product-variants/{id} -> void

GET /api/product-brands -> List<ProductBrandResponseDto>

GET /api/product-brands/{id} -> ProductBrandResponseDto

POST /api/product-brands (Body: ProductBrandRequestDto) -> ProductBrandResponseDto

PUT /api/product-brands/{id} (Body: ProductBrandRequestDto) -> ProductBrandResponseDto

DELETE /api/product-brands/{id} -> void

GET /api/categories -> List<CategoryResponseDto>

GET /api/categories/{id} -> CategoryResponseDto

POST /api/categories (Body: CategoryRequestDto) -> CategoryResponseDto

PUT /api/categories/{id} (Body: CategoryRequestDto) -> CategoryResponseDto

DELETE /api/categories/{id} -> void

GET /api/product-images/product/{productId} -> List<ProductImageResponseDto>

POST /api/product-images/upload (Multipart) -> ProductImageResponseDto

DELETE /api/product-images/{id} -> void

5. Cart Module (cart-controller)
GET /api/carts/user/{userId} -> CartResponseDto

POST /api/carts/user/{userId}/items (Body: CartItemRequestDto) -> CartResponseDto

PUT /api/carts/user/{userId}/items/{cartItemId} (Body: UpdateCartItemQuantityRequestDto) -> CartResponseDto

PUT /api/carts/user/{userId}/items/{cartItemId}/variant (Body: UpdateCartItemVariantRequestDto) -> CartResponseDto

DELETE /api/carts/user/{userId}/items/{cartItemId} -> CartResponseDto

DELETE /api/carts/user/{userId} -> void

6. Order & Item & Shipping & Payment (order-, order-item-, order-shipping-, payment-)
GET /api/orders (Params: status, pageable) -> PageOrderResponseDto

GET /api/orders/{id} -> OrderResponseDto

GET /api/orders/user/{userId} -> PageOrderResponseDto

POST /api/orders (Body: OrderRequestDto) -> OrderResponseDto

PUT /api/orders/{orderId}/status (Params: status) -> OrderResponseDto

DELETE /api/orders/{orderId} -> void

GET /api/order-items/{id} -> OrderItemResponseDto

GET /api/order-items/product-variant/{productVariantId} -> PageOrderItemResponseDto

GET /api/order-items/order-shop/{orderShopId} -> List<OrderItemResponseDto>

GET /api/order-shippings/{id} -> OrderShippingResponseDto

GET /api/order-shippings/order-shop/{orderShopId} -> OrderShippingResponseDto

POST /api/order-shippings/order-shop/{orderShopId} (Body: OrderShippingRequestDto) -> OrderShippingResponseDto

PUT /api/order-shippings/{id} (Body: OrderShippingRequestDto) -> OrderShippingResponseDto

GET /api/payments/{id} -> PaymentResponseDto

GET /api/payments/orders/{orderId} -> PaymentResponseDto

POST /api/payments/orders/{orderId} (Body: PaymentRequestDto) -> PaymentResponseDto

PUT /api/payments/{id}/status (Params: status) -> PaymentResponseDto

7. Review & Discount & Chat (review-, discount-, message-, conversation-)
GET /api/reviews/{id} -> ReviewResponseDto

GET /api/reviews/users/{userId} -> PageReviewResponseDto

GET /api/reviews/products/{productId} -> PageReviewResponseDto

POST /api/reviews (Body: ReviewRequestDto) -> ReviewResponseDto

PUT /api/reviews/{id} (Body: ReviewRequestDto) -> ReviewResponseDto

DELETE /api/reviews/{id} -> void

GET /api/discounts/{id} -> DiscountResponseDto

GET /api/discounts/shops/{shopId} -> PageDiscountResponseDto

GET /api/discounts/shops/{shopId}/active -> List<DiscountResponseDto>

POST /api/discounts (Body: DiscountRequestDto) -> DiscountResponseDto

PUT /api/discounts/{id} (Body: DiscountRequestDto) -> DiscountResponseDto

DELETE /api/discounts/{id} -> void

GET /api/conversations -> PageConversationResponseDto

GET /api/conversations/{id} -> ConversationResponseDto

GET /api/conversations/users/{userId} -> List<ConversationResponseDto>

GET /api/conversations/shops/{shopId} -> List<ConversationResponseDto>

POST /api/conversations (Body: ConversationRequestDto) -> ConversationResponseDto

GET /api/messages/conversations/{conversationId} -> PageMessageResponseDto

POST /api/messages (Body: MessageRequestDto) -> MessageResponseDto

PUT /api/messages/conversations/{conversationId}/read -> void

II. ĐỊNH NGHĨA CHI TIẾT SCHEMAS (DTOs DATA STRUCT)
JSON
{
  "UserRequestDto": {
    "username": "string (Required)",
    "password": "string (Required)",
    "fullName": "string (Required)",
    "email": "string",
    "phone": "string",
    "gender": "string (MALE/FEMALE)",
    "dateOfBirth": "LocalDate (yyyy-MM-dd)",
    "avatar": "string"
  },
  "UserUpdateRequestDto": {
    "fullName": "string (Required)",
    "phone": "string",
    "gender": "string",
    "dateOfBirth": "LocalDate",
    "avatar": "string"
  },
  "UserResponseDto": {
    "id": "Long",
    "username": "string",
    "fullName": "string",
    "phone": "string",
    "status": "string (ACTIVE/INACTIVE)",
    "email": "string",
    "avatar": "string",
    "gender": "string",
    "dateOfBirth": "LocalDate",
    "createdAt": "LocalDateTime",
    "roleName": "string"
  },
  "ShopRequestDto": {
    "shopName": "string (Required)",
    "logo": "string",
    "phone": "string (Required)",
    "address": "string",
    "email": "string",
    "ownerId": "Long"
  },
  "ShopResponseDto": {
    "id": "Long",
    "shopName": "string",
    "logo": "string",
    "phone": "string",
    "status": "string",
    "address": "string",
    "email": "string",
    "createdAt": "LocalDateTime",
    "ownerId": "Long",
    "ownerFullName": "string"
  },
  "ShippingAddressRequestDto": {
    "userId": "Long (Required)",
    "receiverName": "string (Required)",
    "phone": "string",
    "addressLine": "string (Required)",
    "city": "string (Required)",
    "district": "string (Required)",
    "isDefault": "Boolean"
  },
  "ShippingAddressResponseDto": {
    "id": "Long",
    "userId": "Long",
    "receiverName": "string",
    "phone": "string",
    "addressLine": "string",
    "city": "string",
    "district": "string",
    "isDefault": "Boolean"
  },
  "ProductRequestDto": {
    "productName": "string (Required)",
    "productDetail": "string",
    "status": "string (Required, ACTIVE/...) ",
    "price": "Double/BigDecimal (Required)",
    "shopId": "Long (Required)",
    "brandId": "Long (Required)",
    "categoryId": "Long (Required)"
  },
  "ProductResponseDto": {
    "id": "Long",
    "productName": "string",
    "productDetail": "string",
    "rating": "Double",
    "status": "string",
    "originalPrice": "Double",
    "finalPrice": "Double",
    "discountAmount": "Double",
    "shopId": "Long",
    "shopName": "string",
    "brandId": "Long",
    "brandName": "string",
    "categoryId": "Long",
    "categoryName": "string"
  },
  "ProductVariantRequestDto": {
    "productId": "Long (Required)",
    "size": "string (Required)",
    "color": "string (Required)",
    "stock": "Integer (Required)"
  },
  "ProductVariantResponseDto": {
    "id": "Long",
    "productId": "Long",
    "size": "string",
    "color": "string",
    "stock": "Integer"
  },
  "ProductImageResponseDto": {
    "id": "Long",
    "productId": "Long",
    "color": "string",
    "imageUrl": "string"
  },
  "ProductBrandRequestDto": {
    "name": "string (Required)",
    "description": "string"
  },
  "ProductBrandResponseDto": {
    "id": "Long",
    "name": "string",
    "description": "string"
  },
  "CategoryRequestDto": {
    "name": "string (Required)"
  },
  "CategoryResponseDto": {
    "id": "Long",
    "name": "string"
  },
  "CartResponseDto": {
    "id": "Long",
    "userId": "Long",
    "updatedAt": "LocalDateTime",
    "cartItems": "List<CartItemResponseDto>",
    "totalAmount": "Double"
  },
  "CartItemRequestDto": {
    "productVariantId": "Long (Required)",
    "quantity": "Integer"
  },
  "CartItemResponseDto": {
    "id": "Long",
    "productVariantId": "Long",
    "productId": "Long",
    "productName": "string",
    "size": "string",
    "color": "string",
    "quantity": "Integer",
    "price": "Double",
    "imageUrl": "string",
    "subtotal": "Double"
  },
  "UpdateCartItemQuantityRequestDto": { "quantity": "Integer (Required)" },
  "UpdateCartItemVariantRequestDto": { "productVariantId": "Long (Required)" },
  "OrderRequestDto": {
    "userId": "Long (Required)",
    "voucherCode": "string",
    "addressId": "Long",
    "receiverName": "string",
    "phone": "string",
    "addressLine": "string",
    "city": "string",
    "district": "string"
  },
  "OrderResponseDto": {
    "id": "Long",
    "userId": "Long",
    "userFullName": "string",
    "totalPrice": "Double",
    "finalPrice": "Double",
    "status": "string (PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED/RETURNED)",
    "addressSnapshot": "string",
    "createdAt": "LocalDateTime",
    "updatedAt": "LocalDateTime"
  },
  "OrderShopResponseDto": {
    "id": "Long",
    "orderId": "Long",
    "shopId": "Long",
    "shopName": "string",
    "totalPrice": "Double",
    "finalPrice": "Double",
    "discountId": "Long",
    "addressSnapshot": "string",
    "status": "string",
    "orderItems": "List<OrderItemResponseDto>",
    "shipping": "OrderShippingResponseDto"
  },
  "OrderItemResponseDto": {
    "id": "Long",
    "productVariantId": "Long",
    "productName": "string",
    "productImage": "string",
    "size": "string",
    "color": "string",
    "quantity": "Integer",
    "price": "Double"
  },
  "OrderShippingRequestDto": {
    "shippingStatus": "string (PENDING/...) ",
    "trackingCode": "string"
  },
  "OrderShippingResponseDto": {
    "id": "Long",
    "addressSnapshot": "string",
    "shippingStatus": "string",
    "trackingCode": "string"
  },
  "PaymentRequestDto": {
    "method": "string (Required, COD/...)",
    "status": "string",
    "transactionCode": "string"
  },
  "PaymentResponseDto": {
    "id": "Long",
    "amount": "Double",
    "method": "string",
    "status": "string (PENDING/COMPLETED/FAILED/REFUNDED)",
    "transactionCode": "string",
    "createdAt": "LocalDateTime"
  },
  "ReviewRequestDto": {
    "userId": "Long (Required)",
    "productId": "Long (Required)",
    "orderItemId": "Long (Required)",
    "rating": "Integer (Required)",
    "comment": "string (Required)"
  },
  "ReviewResponseDto": {
    "id": "Long",
    "userId": "Long",
    "username": "string",
    "productId": "Long",
    "productName": "string",
    "orderItemId": "Long",
    "rating": "Integer",
    "comment": "string",
    "createdAt": "LocalDateTime"
  },
  "DiscountRequestDto": {
    "shopId": "Long (Required)",
    "discountTarget": "string (Required)",
    "discountType": "string (Required)",
    "discountValue": "Double (Required)",
    "code": "string",
    "startDate": "LocalDateTime (Required)",
    "endDate": "LocalDateTime (Required)",
    "status": "string (Required)",
    "minOrderValue": "Double",
    "productIds": "List<Long>"
  },
  "DiscountResponseDto": {
    "id": "Long",
    "shopId": "Long",
    "discountType": "string",
    "discountValue": "Double",
    "startDate": "LocalDateTime",
    "endDate": "LocalDateTime",
    "status": "string",
    "minOrderValue": "Double"
  },
  "ConversationRequestDto": { "userId": "Long (Required)", "shopId": "Long (Required)" },
  "ConversationResponseDto": {
    "id": "Long", "userId": "Long", "userName": "string", "userAvatar": "string",
    "shopId": "Long", "shopName": "string", "shopLogo": "string", "createdAt": "LocalDateTime"
  },
  "MessageRequestDto": { "conversationId": "Long (Required)", "senderId": "Long (Required)", "content": "string (Required)" },
  "MessageResponseDto": {
    "id": "Long", "conversationId": "Long", "senderId": "Long", "senderName": "string",
    "content": "string", "isRead": "Boolean", "createdAt": "LocalDateTime"
  },
  "AuthResponse": {
    "accessToken": "string",
    "refreshToken": "string",
    "user": "UserResponseDto"
  }
}