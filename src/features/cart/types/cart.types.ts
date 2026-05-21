export interface CartItemResponse {
    id: number;
    productVariantId: number;
    productId: number; // ID của sản phẩm gốc
    imageUrl?: string; // URL ảnh của sản phẩm/variant
    productName: string;
    color: string; // Màu sắc của variant
    size: string;  // Kích thước của variant
    quantity: number;
    price: number; // Giá của variant tại thời điểm thêm vào giỏ
    subtotal: number; // Tổng tiền cho item này (price * quantity)
}

export interface CartResponse {
    id: number;
    userId: number;
    cartItems: CartItemResponse[]; // Danh sách các sản phẩm trong giỏ
    totalAmount: number; // Tổng số tiền của toàn bộ giỏ hàng
}

export interface AddToCartRequest {
    productVariantId: number;
    quantity: number;
}

// DTO cho việc cập nhật số lượng của một Cart Item
export interface UpdateCartItemQuantityRequest {
    quantity: number;
}

// DTO mới cho việc cập nhật biến thể (Size/Color)
export interface UpdateCartItemVariantRequest {
    productVariantId: number;
}