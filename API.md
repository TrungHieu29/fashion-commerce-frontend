/v3/api-docs
Explore
Fashion Commerce API
 1.0 
OAS 3.0
/v3/api-docs
Tài liệu API cho hệ thống thương mại điện tử thời trang.

Servers

http://localhost:8080 - Generated server url

Authorize
user-controller


GET
/api/users/{id}



PUT
/api/users/{id}



DELETE
/api/users/{id}



GET
/api/users



GET
/api/users/username/{username}


shop-controller


GET
/api/shops/{id}



PUT
/api/shops/{id}



DELETE
/api/shops/{id}



GET
/api/shops



POST
/api/shops



GET
/api/shops/owner/{ownerId}


shipping-address-controller


GET
/api/shipping-addresses/{id}



PUT
/api/shipping-addresses/{id}



DELETE
/api/shipping-addresses/{id}



PUT
/api/shipping-addresses/{id}/set-default



GET
/api/shipping-addresses



POST
/api/shipping-addresses



GET
/api/shipping-addresses/user/{userId}


review-controller


GET
/api/reviews/{id}



PUT
/api/reviews/{id}



DELETE
/api/reviews/{id}



POST
/api/reviews



GET
/api/reviews/users/{userId}



GET
/api/reviews/products/{productId}


product-controller


GET
/api/products/{id}



PUT
/api/products/{id}



DELETE
/api/products/{id}



GET
/api/products



POST
/api/products



GET
/api/products/shop/{shopId}



GET
/api/products/search



GET
/api/products/category/{categoryId}



GET
/api/products/brand/{brandId}


product-variant-controller


GET
/api/product-variants/{id}



PUT
/api/product-variants/{id}



DELETE
/api/product-variants/{id}



GET
/api/product-variants



POST
/api/product-variants



GET
/api/product-variants/product/{productId}


product-brand-controller


GET
/api/product-brands/{id}



PUT
/api/product-brands/{id}



DELETE
/api/product-brands/{id}



GET
/api/product-brands



POST
/api/product-brands


payment-controller


PUT
/api/payments/{paymentId}/process-online-result



PUT
/api/payments/{id}/status



GET
/api/payments/orders/{orderId}



POST
/api/payments/orders/{orderId}



GET
/api/payments/{id}


order-shop-controller


PUT
/api/order-shops/{orderShopId}/request-return



PUT
/api/order-shops/{orderShopId}/confirm-order



PUT
/api/order-shops/{orderShopId}/confirm-delivery



PUT
/api/order-shops/{orderShopId}/cancel



GET
/api/order-shops/{id}



GET
/api/order-shops/shop/{shopId}



GET
/api/order-shops/order/{orderId}


order-shipping-controller


GET
/api/order-shippings/{id}



PUT
/api/order-shippings/{id}



GET
/api/order-shippings/order-shop/{orderShopId}



POST
/api/order-shippings/order-shop/{orderShopId}


message-controller


PUT
/api/messages/conversations/{conversationId}/read



POST
/api/messages



GET
/api/messages/conversations/{conversationId}


discount-controller


GET
/api/discounts/{id}



PUT
/api/discounts/{id}



DELETE
/api/discounts/{id}



POST
/api/discounts



POST
/api/discounts/apply-voucher



GET
/api/discounts/shops/{shopId}



GET
/api/discounts/shops/{shopId}/active


category-controller


GET
/api/categories/{id}



PUT
/api/categories/{id}



DELETE
/api/categories/{id}



GET
/api/categories



POST
/api/categories


cart-controller


PUT
/api/carts/user/{userId}/items/{cartItemId}



DELETE
/api/carts/user/{userId}/items/{cartItemId}



PUT
/api/carts/user/{userId}/items/{cartItemId}/variant



POST
/api/carts/user/{userId}/items



GET
/api/carts/user/{userId}



DELETE
/api/carts/user/{userId}


product-image-controller


POST
/api/product-images/upload



GET
/api/product-images/product/{productId}



DELETE
/api/product-images/{id}


order-controller


POST
/api/orders



GET
/api/orders/{id}



GET
/api/orders/user/{userId}



DELETE
/api/orders/{orderId}


conversation-controller


GET
/api/conversations



POST
/api/conversations



GET
/api/conversations/{id}



GET
/api/conversations/users/{userId}



GET
/api/conversations/shops/{shopId}


auth-controller


POST
/api/auth/register



POST
/api/auth/authenticate


role-controller


GET
/api/roles



GET
/api/roles/{id}



GET
/api/roles/name/{name}


order-item-controller


GET
/api/order-items/{id}



GET
/api/order-items/product-variant/{productVariantId}



GET
/api/order-items/order-shop/{orderShopId}



Schemas
UserUpdateRequestDto{
fullName*	[...]
phone	[...]
gender	[...]
dateOfBirth	[...]
avatar	[...]
}
UserResponseDto{
id	[...]
username	[...]
fullName	[...]
phone	[...]
status	[...]
email	[...]
avatar	[...]
gender	[...]
dateOfBirth	[...]
createdAt	[...]
roleName	[...]
}
ShopRequestDto{
shopName*	[...]
logo	[...]
phone*	[...]
address	[...]
email	[...]
ownerId	[...]
}
ShopResponseDto{
id	[...]
shopName	[...]
logo	[...]
phone	[...]
status	[...]
address	[...]
email	[...]
createdAt	[...]
ownerId	[...]
ownerFullName	[...]
}
ShippingAddressRequestDto{
userId*	[...]
receiverName*	[...]
phone	[...]
addressLine*	[...]
city*	[...]
district*	[...]
isDefault	[...]
}
ShippingAddressResponseDto{
id	[...]
userId	[...]
receiverName	[...]
phone	[...]
addressLine	[...]
city	[...]
district	[...]
isDefault	[...]
}
ReviewRequestDto{
userId*	[...]
productId*	[...]
orderItemId*	[...]
rating*	[...]
comment*	[...]
}
ReviewResponseDto{
id	[...]
userId	[...]
username	[...]
productId	[...]
productName	[...]
orderItemId	[...]
rating	[...]
comment	[...]
createdAt	[...]
}
ProductRequestDto{
productName*	[...]
productDetail	[...]
status*	[...]
price*	[...]
shopId*	[...]
brandId*	[...]
categoryId*	[...]
}
ProductResponseDto{
id	[...]
productName	[...]
productDetail	[...]
rating	[...]
status	[...]
originalPrice	[...]
finalPrice	[...]
discountAmount	[...]
shopId	[...]
shopName	[...]
brandId	[...]
brandName	[...]
categoryId	[...]
categoryName	[...]
}
ProductVariantRequestDto{
productId*	[...]
size*	[...]
color*	[...]
stock*	[...]
}
ProductVariantResponseDto{
id	[...]
productId	[...]
size	[...]
color	[...]
stock	[...]
}
ProductBrandRequestDto{
name*	[...]
description	[...]
}
ProductBrandResponseDto{
id	[...]
name	[...]
description	[...]
}
PaymentResponseDto{
id	[...]
amount	[...]
method	[...]
status	[...]
transactionCode	[...]
createdAt	[...]
}
OrderItemResponseDto{
id	[...]
productVariantId	[...]
productId	[...]
productName	[...]
productImage	[...]
size	[...]
color	[...]
quantity	[...]
price	[...]
}
OrderShippingResponseDto{
id	[...]
addressSnapshot	[...]
shippingStatus	[...]
trackingCode	[...]
}
OrderShopResponseDto{
id	[...]
orderId	[...]
shopId	[...]
shopName	[...]
totalPrice	[...]
finalPrice	[...]
discountId	[...]
addressSnapshot	[...]
status	[...]
orderItems	[...]
shipping	OrderShippingResponseDto{...}
stockDeducted	[...]
}
OrderShippingRequestDto{
shippingStatus	[...]
trackingCode	[...]
}
DiscountRequestDto{
shopId*	[...]
discountTarget*	[...]
discountType*	[...]
discountValue*	[...]
code	[...]
startDate*	[...]
endDate*	[...]
status*	[...]
minOrderValue	[...]
productIds	[...]
}
DiscountResponseDto{
id	[...]
shopId	[...]
code	[...]
discountTarget	[...]
discountType	[...]
discountValue	[...]
startDate	[...]
endDate	[...]
status	[...]
minOrderValue	[...]
productIds	[...]
}
CategoryRequestDto{
name*	[...]
}
CategoryResponseDto{
id	[...]
name	[...]
}
UpdateCartItemQuantityRequestDto{
quantity*	[...]
}
CartItemResponseDto{
id	[...]
productVariantId	[...]
productName	[...]
size	[...]
color	[...]
quantity	[...]
price	[...]
imageUrl	[...]
subtotal	[...]
productId	[...]
shopId	[...]
shopName	[...]
}
CartResponseDto{
id	[...]
userId	[...]
updatedAt	[...]
cartItems	[...]
totalAmount	[...]
}
UpdateCartItemVariantRequestDto{
productVariantId*	[...]
}
ProductImageResponseDto{
id	[...]
productId	[...]
color	[...]
imageUrl	[...]
}
PaymentRequestDto{
method*	[...]
status	[...]
transactionCode	[...]
}
OrderRequestDto{
userId*	[...]
voucherCode	[...]
paymentMethod*	[...]
addressId	[...]
receiverName	[...]
phone	[...]
addressLine	[...]
city	[...]
district	[...]
}
OrderResponseDto{
id	[...]
userId	[...]
userFullName	[...]
totalPrice	[...]
finalPrice	[...]
addressSnapshot	[...]
createdAt	[...]
updatedAt	[...]
orderShops	[...]
payment	PaymentResponseDto{...}
}
MessageRequestDto{
conversationId*	[...]
senderId*	[...]
content*	[...]
}
MessageResponseDto{
id	[...]
conversationId	[...]
senderId	[...]
senderName	[...]
content	[...]
isRead	[...]
createdAt	[...]
}
ApplyVoucherRequestDto{
shopId*	[...]
voucherCode*	[...]
subtotal*	[...]
}
ConversationRequestDto{
userId*	[...]
shopId*	[...]
}
ConversationResponseDto{
id	[...]
userId	[...]
userName	[...]
userAvatar	[...]
shopId	[...]
shopName	[...]
shopLogo	[...]
createdAt	[...]
}
CartItemRequestDto{
productVariantId*	[...]
quantity	[...]
}
UserRequestDto{
username*	[...]
password*	[...]
fullName*	[...]
email	[...]
phone	[...]
gender	[...]
dateOfBirth	[...]
avatar	[...]
}
AuthResponse{
accessToken	[...]
refreshToken	[...]
user	UserResponseDto{...}
}
RoleResponseDto{
id	[...]
name	[...]
}
Pageable{
page	[...]
size	[...]
sort	[...]
}
PageReviewResponseDto{
totalElements	[...]
totalPages	[...]
first	[...]
last	[...]
numberOfElements	[...]
size	[...]
content	[...]
number	[...]
sort	[...]
pageable	PageableObject{...}
empty	[...]
}
PageableObject{
offset	[...]
sort	[...]
pageNumber	[...]
pageSize	[...]
paged	[...]
unpaged	[...]
}
SortObject{
direction	[...]
nullHandling	[...]
ascending	[...]
property	[...]
ignoreCase	[...]
}
PageProductResponseDto{
totalElements	[...]
totalPages	[...]
first	[...]
last	[...]
numberOfElements	[...]
size	[...]
content	[...]
number	[...]
sort	[...]
pageable	PageableObject{...}
empty	[...]
}
PageOrderResponseDto{
totalElements	[...]
totalPages	[...]
first	[...]
last	[...]
numberOfElements	[...]
size	[...]
content	[...]
number	[...]
sort	[...]
pageable	PageableObject{...}
empty	[...]
}
PageOrderShopResponseDto{
totalElements	[...]
totalPages	[...]
first	[...]
last	[...]
numberOfElements	[...]
size	[...]
content	[...]
number	[...]
sort	[...]
pageable	PageableObject{...}
empty	[...]
}
PageOrderItemResponseDto{
totalElements	[...]
totalPages	[...]
first	[...]
last	[...]
numberOfElements	[...]
size	[...]
content	[...]
number	[...]
sort	[...]
pageable	PageableObject{...}
empty	[...]
}
PageMessageResponseDto{
totalElements	[...]
totalPages	[...]
first	[...]
last	[...]
numberOfElements	[...]
size	[...]
content	[...]
number	[...]
sort	[...]
pageable	PageableObject{...}
empty	[...]
}
PageDiscountResponseDto{
totalElements	[...]
totalPages	[...]
first	[...]
last	[...]
numberOfElements	[...]
size	[...]
content	[...]
number	[...]
sort	[...]
pageable	PageableObject{...}
empty	[...]
}
PageConversationResponseDto{
totalElements	[...]
totalPages	[...]
first	[...]
last	[...]
numberOfElements	[...]
size	[...]
content	[...]
number	[...]
sort	[...]
pageable	PageableObject{...}
empty	[...]
}