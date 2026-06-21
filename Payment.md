package com.trunghieu.fashioncommerce.fashion_commerce_backend.controller;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request.OrderRequestDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.OrderResponseDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.OrderStatus;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List; // Import List

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or #requestDto.userId == authentication.principal.id")
    public ResponseEntity<OrderResponseDto> createOrder(@Valid @RequestBody OrderRequestDto requestDto) {
        return new ResponseEntity<>(orderService.createOrder(requestDto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isOrderOwner(#id)")
    public ResponseEntity<OrderResponseDto> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<Page<OrderResponseDto>> getOrdersByUserId(
            @PathVariable Long userId,
            @RequestParam(required = false) List<OrderStatus> shopStatuses, // ThÃªm tham sá»‘ shopStatuses
            Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId, shopStatuses, pageable));
    }

    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.controller;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request.OrderItemRequestDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.OrderItemResponseDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.service.OrderItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/order-items")
@RequiredArgsConstructor
public class OrderItemController {

    private final OrderItemService orderItemService;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isOrderItemOwner(#id)")
    public ResponseEntity<OrderItemResponseDto> getOrderItemById(@PathVariable Long id) {
        return ResponseEntity.ok(orderItemService.getOrderItemById(id));
    }

    @GetMapping("/order-shop/{orderShopId}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isOrderShopOwner(#orderShopId)")
    public ResponseEntity<Page<OrderItemResponseDto>> getOrderItemsByOrderShopId(
            @PathVariable Long orderShopId,
            Pageable pageable) {
        return ResponseEntity.ok(orderItemService.getOrderItemsByOrderShopId(orderShopId, pageable));
    }

    @GetMapping("/product-variant/{productVariantId}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isProductVariantOwner(#productVariantId)")
    public ResponseEntity<Page<OrderItemResponseDto>> getOrderItemsByProductVariantId(
            @PathVariable Long productVariantId,
            Pageable pageable) {
        return ResponseEntity.ok(orderItemService.getOrderItemsByProductVariantId(productVariantId, pageable));
    }
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.controller;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request.OrderShopRequestDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.OrderShopResponseDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.OrderStatus; // Import OrderStatus
import com.trunghieu.fashioncommerce.fashion_commerce_backend.service.OrderShopService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/order-shops")
@RequiredArgsConstructor
public class OrderShopController {

    private final OrderShopService orderShopService;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isOrderShopOwner(#id)")
    public ResponseEntity<OrderShopResponseDto> getOrderShopById(@PathVariable Long id) {
        return ResponseEntity.ok(orderShopService.getOrderShopById(id));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isOrderOwner(#orderId)")
    public ResponseEntity<Page<OrderShopResponseDto>> getOrderShopsByOrderId(
            @PathVariable Long orderId,
            Pageable pageable) {
        return ResponseEntity.ok(orderShopService.getOrderShopsByOrderId(orderId, pageable));
    }

    @GetMapping("/shop/{shopId}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isShopOwner(#shopId)")
    public ResponseEntity<Page<OrderShopResponseDto>> getOrderShopsByShopId(
            @PathVariable Long shopId,
            @RequestParam(required = false) OrderStatus status, // ThÃªm tham sá»‘ status, khÃ´ng báº¯t buá»™c
            Pageable pageable) {
        return ResponseEntity.ok(orderShopService.getOrderShopsByShopId(shopId, status, pageable));
    }

    @PutMapping("/{orderShopId}/confirm-delivery")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isOrderShopOwner(#orderShopId)")
    public ResponseEntity<OrderShopResponseDto> confirmOrderShopDelivery(@PathVariable Long orderShopId) {
        return ResponseEntity.ok(orderShopService.confirmDelivery(orderShopId));
    }

    @PutMapping("/{orderShopId}/request-return")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isOrderShopOwner(#orderShopId)") // Admin hoáº·c chá»§ OrderShop cÃ³ thá»ƒ yÃªu cáº§u tráº£ hÃ ng
    public ResponseEntity<OrderShopResponseDto> requestOrderShopReturn(@PathVariable Long orderShopId) {
        return ResponseEntity.ok(orderShopService.requestReturn(orderShopId));
    }

    @PutMapping("/{orderShopId}/cancel")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isOrderShopOwner(#orderShopId)") // Admin hoáº·c chá»§ OrderShop cÃ³ thá»ƒ há»§y
    public ResponseEntity<OrderShopResponseDto> cancelOrderShop(@PathVariable Long orderShopId) {
        return ResponseEntity.ok(orderShopService.cancelOrderShop(orderShopId));
    }

    @PutMapping("/{orderShopId}/confirm-order")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isOrderShopOwner(#orderShopId)") // Admin hoáº·c chá»§ OrderShop cÃ³ thá»ƒ xÃ¡c nháº­n Ä‘Æ¡n hÃ ng
    public ResponseEntity<OrderShopResponseDto> confirmOrder(@PathVariable Long orderShopId) {
        return ResponseEntity.ok(orderShopService.confirmOrder(orderShopId));
    }
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.controller;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request.PaymentRequestDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.PaymentResponseDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.PaymentStatus;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/orders/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isOrderOwner(#orderId)")
    public ResponseEntity<PaymentResponseDto> createPayment(
            @PathVariable Long orderId,
            @Valid @RequestBody PaymentRequestDto requestDto) {
        return new ResponseEntity<>(paymentService.createPayment(orderId, requestDto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isPaymentOwner(#id)")
    public ResponseEntity<PaymentResponseDto> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/orders/{orderId}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isOrderOwner(#orderId)")
    public ResponseEntity<PaymentResponseDto> getPaymentByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentResponseDto> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam PaymentStatus status) {
        return ResponseEntity.ok(paymentService.updatePaymentStatus(id, status));
    }

    @PutMapping("/{paymentId}/process-online-result")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isPaymentOwner(#paymentId)") // Admin hoáº·c chá»§ Payment cÃ³ thá»ƒ gá»­i káº¿t quáº£
    public ResponseEntity<PaymentResponseDto> processOnlinePaymentResult(
            @PathVariable Long paymentId,
            @RequestParam PaymentStatus resultStatus) {
        return ResponseEntity.ok(paymentService.processOnlinePaymentResult(paymentId, resultStatus));
    }
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.PaymentMethod; // Import PaymentMethod enum
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.PaymentStatus; // Import PaymentStatus enum
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequestDto {
    //@NotNull(message = "Amount cannot be null")
    //@DecimalMin(value = "0.0", message = "Amount cannot be negative")
    //private BigDecimal amount;

    @NotNull(message = "Payment method cannot be blank") // ÄÃ£ thay Ä‘á»•i tá»« NotBlank sang NotNull vÃ¬ lÃ  enum
    private PaymentMethod method; // ÄÃ£ thay Ä‘á»•i tá»« String sang PaymentMethod enum

    private PaymentStatus status; // ÄÃ£ thay Ä‘á»•i tá»« String sang PaymentStatus enum
    private String transactionCode; // ThÆ°á»ng Ä‘Æ°á»£c nháº­n tá»« Gateway
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.PaymentMethod; // Import PaymentMethod
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequestDto {
    @NotNull(message = "User ID cannot be null")
    private Long userId;

    private String voucherCode; // User enters code at checkout

    @NotNull(message = "Payment method cannot be null") // ThÃªm validation
    private PaymentMethod paymentMethod; // ThÃªm trÆ°á»ng paymentMethod

    // Loáº¡i bá» totalPrice vÃ  finalPrice vÃ¬ sáº½ tÃ­nh tá»± Ä‘á»™ng tá»« cart

    private Long addressId; // ID Ä‘á»‹a chá»‰ cÃ³ sáºµn
    private String receiverName; // TÃªn ngÆ°á»i nháº­n (náº¿u nháº­p má»›i)
    private String phone; // SÄT ngÆ°á»i nháº­n (náº¿u nháº­p má»›i)
    private String addressLine; // Äá»‹a chá»‰ chi tiáº¿t (náº¿u nháº­p má»›i)
    private String city; // Tá»‰nh/ThÃ nh phá»‘ (náº¿u nháº­p má»›i)
    private String district; // Quáº­n/Huyá»‡n (náº¿u nháº­p má»›i)
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderShopRequestDto {
    @NotNull(message = "Shop ID cannot be null")
    private Long shopId;

    private Long discountId; // CÃ³ thá»ƒ null náº¿u khÃ´ng Ã¡p dá»¥ng discount

    @NotNull(message = "Order items cannot be null")
    private List<OrderItemRequestDto> orderItems;
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponseDto {
    private Long id;
    private Long productVariantId;
    private Long productId; // ThÃªm trÆ°á»ng productId
    private String productName;
    private String productImage;
    private String size;
    private String color;
    private Integer quantity;
    private BigDecimal price; // GiÃ¡ táº¡i thá»i Ä‘iá»ƒm mua
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.OrderStatus; // Import OrderStatus
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set; // Import Set

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDto {
    private Long id; // ÄÃ£ Ä‘á»•i tÃªn tá»« orderId thÃ nh id
    private Long userId;
    private String userFullName;
    private BigDecimal totalPrice;
    private BigDecimal finalPrice;
    // private OrderStatus status; // XÃ³a trÆ°á»ng status
    private String addressSnapshot;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<OrderShopResponseDto> orderShops; // ThÃªm trÆ°á»ng orderShops
    private PaymentResponseDto payment; // ThÃªm trÆ°á»ng payment
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.OrderStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderShopResponseDto {
    private Long id;
    private Long orderId;
    private Long shopId;
    private String shopName;
    private BigDecimal totalPrice;
    private BigDecimal finalPrice;
    private Long discountId;
    private String addressSnapshot;
    private OrderStatus status;
    private Set<OrderItemResponseDto> orderItems;
    private OrderShippingResponseDto shipping;
    private boolean stockDeducted; // Äá»•i tÃªn trÆ°á»ng thÃ nh stockDeducted
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.PaymentStatus; // Import PaymentStatus
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.PaymentMethod; // Import PaymentMethod enum
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDto {
    private Long id;
    private BigDecimal amount;
    private PaymentMethod method; // ÄÃ£ thay Ä‘á»•i tá»« String sang PaymentMethod enum
    private PaymentStatus status; // ÄÃ£ thay Ä‘á»•i tá»« String sang PaymentStatus
    private String transactionCode;
    private LocalDateTime createdAt;
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyVoucherRequestDto {
    @NotNull(message = "Shop ID cannot be null")
    private Long shopId;

    @NotBlank(message = "Voucher code cannot be blank")
    private String voucherCode;

    @NotNull(message = "Subtotal cannot be null")
    private BigDecimal subtotal;
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums;

public enum PaymentStatus {
    PENDING,
    COMPLETED,
    FAILED,
    REFUND_INITIATED, // ThÃªm tráº¡ng thÃ¡i REFUND_INITIATED
    REFUNDED
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums;

public enum PaymentMethod {
    COD,
    VNPAY,
    MOMO
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.service.impl;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request.OrderRequestDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.OrderResponseDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.OrderShopResponseDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.*;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.OrderStatus;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.DiscountTarget;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.DiscountType;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.PaymentMethod; // Import PaymentMethod
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.PaymentStatus; // Import PaymentStatus
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.ShippingStatus;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.exception.ResourceNotFoundException;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.mapper.OrderMapper;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.repository.*;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.service.DiscountService;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.service.OrderService;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.service.PaymentService; // Import PaymentService
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification; // Import Specification
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate; // Import Predicate
import jakarta.persistence.criteria.Subquery; // Import Subquery
import jakarta.persistence.criteria.Join; // Import Join

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

        private final OrderRepository orderRepository;
        private final UserRepository userRepository;
        private final CartRepository cartRepository;
        private final ShopRepository shopRepository;
        private final ProductRepository productRepository;
        private final ProductImageRepository productImageRepository;
        private final OrderShopRepository orderShopRepository; // Inject OrderShopRepository
        private final OrderItemRepository orderItemRepository;
        private final ShippingAddressRepository shippingAddressRepository;
        private final DiscountRepository discountRepository; // Váº«n giá»¯ Ä‘á»ƒ láº¥y Discount entity náº¿u cáº§n
        private final DiscountService discountService;
        private final OrderMapper orderMapper;
        private final ProductVariantRepository productVariantRepository; // Inject ProductVariantRepository
        private final PaymentService paymentService; // Inject PaymentService

        @Override
        @Transactional
        public OrderResponseDto createOrder(OrderRequestDto requestDto) {

                User user = userRepository.findById(requestDto.getUserId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with id: " + requestDto.getUserId()));

                // Láº¥y Cart cá»§a user
                Cart cart = cartRepository.findByUserId(requestDto.getUserId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Cart not found for user with id: " + requestDto.getUserId()));

                if (cart.getCartItems().isEmpty()) {
                        throw new IllegalArgumentException("Cart is empty, cannot create order");
                }

                // Gom nhÃ³m CartItems theo Shop
                Map<Long, List<CartItem>> itemsByShop = cart.getCartItems().stream()
                                .collect(Collectors.groupingBy(
                                                item -> item.getProductVariant().getProduct().getShop().getId()));

                // 1. XÃ¡c Ä‘á»‹nh Ä‘á»‹a chá»‰ giao hÃ ng vÃ  táº¡o snapshot
                String addressSnapshot = resolveAddressSnapshot(user, requestDto);

                // Táº¡o Order
                Order order = Order.builder()
                                .user(user)
                                .addressSnapshot(addressSnapshot)
                                .build();

                // Táº¡o Payment dá»±a trÃªn paymentMethod tá»« requestDto
                Payment payment = Payment.builder()
                        .method(requestDto.getPaymentMethod()) // Láº¥y phÆ°Æ¡ng thá»©c thanh toÃ¡n tá»« requestDto
                        .status(PaymentStatus.PENDING) // Tráº¡ng thÃ¡i ban Ä‘áº§u luÃ´n lÃ  PENDING
                        .order(order) // LiÃªn káº¿t Payment vá»›i Order
                        .build();
                order.setPayment(payment); // GÃ¡n Payment cho Order

                Set<OrderShop> orderShops = new HashSet<>();
                BigDecimal totalOrderPrice = BigDecimal.ZERO;
                LocalDateTime orderCreationTime = LocalDateTime.now(); // Chá»¥p thá»i Ä‘iá»ƒm hiá»‡n táº¡i má»™t láº§n

                // Táº¡o OrderShop cho má»—i shop
                for (Map.Entry<Long, List<CartItem>> entry : itemsByShop.entrySet()) {
                        Long shopId = entry.getKey();
                        List<CartItem> shopCartItems = entry.getValue();

                        Shop shop = shopRepository.findById(shopId)
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Shop not found with id: " + shopId));

                        OrderShop orderShop = OrderShop.builder()
                                        .order(order)
                                        .shop(shop)
                                        .addressSnapshot(addressSnapshot)
                                        .status(OrderStatus.PENDING)
                                        .build();

                    Set<OrderItem> orderItems = shopCartItems.stream().map(cartItem -> {

                        ProductVariant variant = cartItem.getProductVariant();

                        if (variant.getStock() < cartItem.getQuantity()) {
                            throw new IllegalArgumentException(
                                    "Sáº£n pháº©m "
                                            + variant.getProduct().getProductName()
                                            + " chá»‰ cÃ²n "
                                            + variant.getStock()
                                            + " sáº£n pháº©m trong kho");
                        }

                        OrderItem item = createOrderItemFromCartItem(cartItem, orderShop);

                        BigDecimal discount = discountService.calculateBestDiscount(
                                shopId,
                                item.getProductVariant().getProduct().getId(),
                                item.getPrice());

                        item.setPrice(item.getPrice().subtract(discount));

                        return item;

                    }).collect(Collectors.toSet());

                        orderShop.setOrderItems(orderItems);

                        // 2. TÃ­nh Subtotal (Sau khi Ä‘Ã£ giáº£m giÃ¡ tá»± Ä‘á»™ng tá»«ng mÃ³n)
                        BigDecimal subtotal = orderItems.stream()
                                        .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                        orderShop.setTotalPrice(subtotal);

                        // 3. Ãp dá»¥ng ORDER voucher (náº¿u cÃ³ nháº­p mÃ£)
                        BigDecimal shopFinalPrice = subtotal;
                        if (requestDto.getVoucherCode() != null && !requestDto.getVoucherCode().isBlank()) {
                                // Sá»­ dá»¥ng DiscountService Ä‘á»ƒ Ã¡p dá»¥ng voucher vá»›i thá»i Ä‘iá»ƒm Ä‘Ã£ chá»¥p
                                BigDecimal voucherDiscountAmount = discountService.applyOrderVoucher(
                                        shopId,
                                        requestDto.getVoucherCode(),
                                        subtotal,
                                        orderCreationTime // Sá»­ dá»¥ng thá»i Ä‘iá»ƒm Ä‘Ã£ chá»¥p
                                );
                                if (voucherDiscountAmount.compareTo(BigDecimal.ZERO) > 0) {
                                    // Láº¥y láº¡i Discount entity Ä‘á»ƒ gÃ¡n vÃ o OrderShop náº¿u voucher há»£p lá»‡
                                    Discount appliedVoucher = discountRepository
                                            .findByShopIdAndCodeAndStatus(shopId, requestDto.getVoucherCode(),
                                                    com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.DiscountStatus.ACTIVE)
                                            .filter(d -> d.getDiscountTarget() == DiscountTarget.ORDER)
                                            .filter(d -> d.getStartDate().isBefore(orderCreationTime) && d.getEndDate().isAfter(orderCreationTime)) // Sá»­ dá»¥ng thá»i Ä‘iá»ƒm Ä‘Ã£ chá»¥p
                                            .filter(d -> d.getMinOrderValue() == null || subtotal.compareTo(d.getMinOrderValue()) >= 0)
                                            .orElse(null);

                                    if (appliedVoucher != null) {
                                        orderShop.setDiscount(appliedVoucher);
                                        shopFinalPrice = subtotal.subtract(voucherDiscountAmount);
                                    }
                                }
                        }
                        orderShop.setFinalPrice(shopFinalPrice);

                        totalOrderPrice = totalOrderPrice.add(orderShop.getFinalPrice());

                        // 2. Táº¡o OrderShipping cho má»—i shop (LÆ°u snapshot Ä‘á»‹a chá»‰ ngay lÃºc nÃ y)
                        OrderShipping shipping = OrderShipping.builder()
                                        .orderShop(orderShop)
                                        .addressSnapshot(addressSnapshot)
                                        .shippingStatus(ShippingStatus.PENDING)
                                        .build();
                        orderShop.setShipping(shipping);

                        orderShops.add(orderShop); // Sá»­a lá»—i: ThÃªm orderShop vÃ o táº­p há»£p
                }

                order.setOrderShops(orderShops);
                order.setTotalPrice(totalOrderPrice);
                order.setFinalPrice(totalOrderPrice); // ChÆ°a Ã¡p dá»¥ng discount tá»•ng

                Order savedOrder = orderRepository.save(order);

                // XÃ³a CartItems sau khi táº¡o order thÃ nh cÃ´ng
                cart.getCartItems().clear();
                cartRepository.save(cart);

                return orderMapper.toDto(savedOrder);
        }

        private String resolveAddressSnapshot(User user, OrderRequestDto requestDto) {
                // TrÆ°á»ng há»£p 1: KhÃ¡ch chá»n má»™t Ä‘á»‹a chá»‰ ID cá»¥ thá»ƒ Ä‘Ã£ cÃ³ sáºµn
                if (requestDto.getAddressId() != null) {
                        ShippingAddress addr = shippingAddressRepository.findById(requestDto.getAddressId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Shipping address not found with id: "
                                                                        + requestDto.getAddressId()));
                        // Kiá»ƒm tra báº£o máº­t: Ä‘á»‹a chá»‰ pháº£i thuá»™c vá» user Ä‘ang Ä‘áº·t hÃ ng
                        if (!addr.getUser().getId().equals(user.getId())) {
                                throw new IllegalArgumentException("Shipping address does not belong to this user");
                        }
                        return formatAddressSnapshot(addr.getReceiverName(), addr.getPhone(), addr.getAddressLine(),
                                        addr.getDistrict(), addr.getCity());
                }

                // TrÆ°á»ng há»£p 2: KhÃ¡ch nháº­p thÃ´ng tin Ä‘á»‹a chá»‰ má»›i trá»±c tiáº¿p táº¡i form checkout
                if (isAddressInfoProvided(requestDto)) {
                        // Náº¿u user chÆ°a tá»«ng cÃ³ Ä‘á»‹a chá»‰ nÃ o trong há»‡ thá»‘ng, lÆ°u cÃ¡i nÃ y lÃ m Ä‘á»‹a chá»‰ máº·c
                        // Ä‘á»‹nh luÃ´n
                        if (shippingAddressRepository.findByUserId(user.getId()).isEmpty()) {
                                ShippingAddress newAddr = ShippingAddress.builder()
                                                .user(user)
                                                .receiverName(requestDto.getReceiverName())
                                                .phone(requestDto.getPhone())
                                                .addressLine(requestDto.getAddressLine())
                                                .city(requestDto.getCity())
                                                .district(requestDto.getDistrict())
                                                .isDefault(true)
                                                .build();
                                shippingAddressRepository.save(newAddr);
                        }
                        return formatAddressSnapshot(requestDto.getReceiverName(), requestDto.getPhone(),
                                        requestDto.getAddressLine(), requestDto.getDistrict(), requestDto.getCity());
                }

                // TrÆ°á»ng há»£p 3: KhÃ¡ch khÃ´ng truyá»n gÃ¬ cáº£, láº¥y Ä‘á»‹a chá»‰ máº·c Ä‘á»‹nh trong profile
                return shippingAddressRepository.findByUserId(user.getId()).stream()
                                .filter(ShippingAddress::getIsDefault)
                                .findFirst()
                                .map(addr -> formatAddressSnapshot(addr.getReceiverName(), addr.getPhone(),
                                                addr.getAddressLine(),
                                                addr.getDistrict(), addr.getCity()))
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "No shipping address found. Please provide address information."));
        }

        private boolean isAddressInfoProvided(OrderRequestDto dto) {
                return dto.getReceiverName() != null && !dto.getReceiverName().isBlank() &&
                                dto.getPhone() != null && !dto.getPhone().isBlank() &&
                                dto.getAddressLine() != null && !dto.getAddressLine().isBlank() &&
                                dto.getCity() != null && !dto.getCity().isBlank() &&
                                dto.getDistrict() != null && !dto.getDistrict().isBlank();
        }

        private String formatAddressSnapshot(String name, String phone, String line, String district, String city) {
                return String.format("%s | %s | %s, %s, %s", name, phone, line, district, city);
        }

        private OrderItem createOrderItemFromCartItem(CartItem cartItem, OrderShop orderShop) {
                ProductVariant variant = cartItem.getProductVariant();
                Product product = variant.getProduct();

                // Sá»¬A Äá»”I: Láº¥y hÃ¬nh áº£nh theo Ä‘Ãºng mÃ u sáº¯c cá»§a Variant
                String productImage = productImageRepository
                                .findByProductIdAndColor(product.getId(), variant.getColor())
                                .or(() -> productImageRepository.findByProductId(product.getId()).stream().findFirst()) // Fallback
                                                                                                                        // láº¥y
                                                                                                                        // Ä‘áº¡i
                                                                                                                        // 1
                                                                                                                        // cÃ¡i
                                                                                                                        // náº¿u
                                                                                                                        // mÃ u
                                                                                                                        // Ä‘Ã³
                                                                                                                        // chÆ°a
                                                                                                                        // cÃ³
                                                                                                                        // áº£nh
                                .map(ProductImage::getImageUrl)
                                .orElse(null);

                return OrderItem.builder()
                                .orderShop(orderShop)
                                .productVariant(variant)
                                .quantity(cartItem.getQuantity())
                                .price(product.getPrice()) // Freeze giÃ¡ táº¡i thá»i Ä‘iá»ƒm mua
                                .productName(product.getProductName()) // Freeze tÃªn
                                .productImage(productImage) // Freeze hÃ¬nh
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public OrderResponseDto getOrderById(Long id) {
                Order order = orderRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
                return orderMapper.toDto(order);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<OrderResponseDto> getOrdersByUserId(Long userId, List<OrderStatus> shopStatuses, Pageable pageable) {
            Specification<Order> spec = (root, query, criteriaBuilder) -> {
                List<Predicate> predicates = new ArrayList<>();
                predicates.add(criteriaBuilder.equal(root.get("user").get("id"), userId));

                if (shopStatuses != null && !shopStatuses.isEmpty()) {
                    // Táº¡o subquery Ä‘á»ƒ tÃ¬m OrderShop cÃ³ tráº¡ng thÃ¡i phÃ¹ há»£p
                    Subquery<Long> subquery = query.subquery(Long.class);
                    Root<OrderShop> orderShopRoot = subquery.from(OrderShop.class);
                    subquery.select(orderShopRoot.get("order").get("id"))
                            .where(orderShopRoot.get("status").in(shopStatuses));
                    predicates.add(criteriaBuilder.in(root.get("id")).value(subquery));
                }

                return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
            };

            // Láº¥y Page<Order> Ä‘Ã£ lá»c vÃ  sáº¯p xáº¿p tá»« database
            Page<Order> ordersPage = orderRepository.findAll(spec, pageable);

            // Xá»­ lÃ½ háº­u ká»³: Lá»c OrderShop con trong tá»«ng Order
            List<OrderResponseDto> pageContent = ordersPage.getContent().stream()
                    .map(order -> {
                        OrderResponseDto dto = orderMapper.toDto(order);
                        if (shopStatuses != null && !shopStatuses.isEmpty()) {
                            // Lá»c OrderShop con trong Order Ä‘Ã£ Ã¡nh xáº¡
                            Set<OrderShopResponseDto> filteredOrderShops = dto.getOrderShops().stream()
                                    .filter(orderShopDto -> shopStatuses.contains(orderShopDto.getStatus()))
                                    .collect(Collectors.toSet());
                            dto.setOrderShops(filteredOrderShops);
                        }
                        return dto;
                    })
                    .filter(dto -> !dto.getOrderShops().isEmpty()) // Loáº¡i bá» Order náº¿u khÃ´ng cÃ²n OrderShop nÃ o sau khi lá»c
                    .collect(Collectors.toList());

            // Táº¡o PageImpl má»›i vá»›i tá»•ng sá»‘ pháº§n tá»­ Ä‘Ã£ lá»c vÃ  sáº¯p xáº¿p
            // ordersPage.getTotalElements() Ä‘Ã£ lÃ  tá»•ng sá»‘ Order phÃ¹ há»£p vá»›i tiÃªu chÃ­ lá»c chÃ­nh
            return new PageImpl<>(pageContent, pageable, ordersPage.getTotalElements());
        }

        @Override
        @Transactional
        public void deleteOrder(Long orderId) {
                if (!orderRepository.existsById(orderId)) {
                        throw new ResourceNotFoundException("Order not found with id: " + orderId);
                }
                orderRepository.deleteById(orderId);
        }

        @Override
        public void replenishStock(OrderShop orderShop) { // Äá»•i thÃ nh public Ä‘á»ƒ OrderShopServiceImpl cÃ³ thá»ƒ gá»i
            if (orderShop.getOrderItems() == null)
                return;
            // Chá»‰ hoÃ n kho náº¿u stock Ä‘Ã£ bá»‹ trá»«
            if (orderShop.isStockDeducted()) {
                orderShop.getOrderItems().forEach(item -> {
                    var variant = item.getProductVariant();
                    if (variant != null) {
                        variant.setStock(variant.getStock() + item.getQuantity());
                        productVariantRepository.save(variant);
                    }
                });
                orderShop.setStockDeducted(false); // Äáº·t láº¡i cá» sau khi hoÃ n kho
                orderShopRepository.save(orderShop); // LÆ°u OrderShop Ä‘á»ƒ cáº­p nháº­t cá»
            }
        }

        @Override
        public void deductStock(OrderShop orderShop) {
            if (orderShop.getOrderItems() == null)
                return;
            // Chá»‰ trá»« kho náº¿u stock chÆ°a bá»‹ trá»«
            if (!orderShop.isStockDeducted()) {
                orderShop.getOrderItems().forEach(item -> {
                    var variant = item.getProductVariant();
                    if (variant != null) {
                        if (variant.getStock() < item.getQuantity()) {
                            throw new IllegalArgumentException("Sáº£n pháº©m " + variant.getProduct().getProductName() + " khÃ´ng Ä‘á»§ tá»“n kho");
                        }
                        variant.setStock(variant.getStock() - item.getQuantity());
                        productVariantRepository.save(variant);
                    }
                });
                orderShop.setStockDeducted(true); // Äáº·t cá» sau khi trá»« kho
                orderShopRepository.save(orderShop); // LÆ°u OrderShop Ä‘á»ƒ cáº­p nháº­t cá»
            }
        }
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.service.impl;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request.PaymentRequestDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.PaymentResponseDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.Order;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.OrderShop; // Import OrderShop
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.Payment;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.OrderStatus;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.PaymentMethod; // Import PaymentMethod
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.PaymentStatus;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.ShippingStatus; // Import ShippingStatus
import com.trunghieu.fashioncommerce.fashion_commerce_backend.exception.ResourceNotFoundException;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.mapper.PaymentMapper;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.repository.OrderRepository;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.repository.PaymentRepository;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.repository.ProductVariantRepository;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.service.OrderService; // Import OrderService
import com.trunghieu.fashioncommerce.fashion_commerce_backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    // private final OrderService orderService; // XÃ³a injection OrderService
    private final PaymentMapper paymentMapper;

    @Override
    @Transactional
    public PaymentResponseDto createPayment(Long orderId, PaymentRequestDto requestDto) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (paymentRepository.findByOrder_Id(orderId).isPresent()) {
            throw new IllegalArgumentException("Payment already exists for order id: " + orderId);
        }

        Payment payment = paymentMapper.toEntity(requestDto);
        payment.setOrder(order);
        payment.setAmount(order.getFinalPrice()); // Ã‰p sá»‘ tiá»n thanh toÃ¡n báº±ng Ä‘Ãºng Final Price cá»§a Order

        Payment savedPayment = paymentRepository.save(payment);

        // KhÃ´ng trá»« kho á»Ÿ Ä‘Ã¢y cho COD. Viá»‡c trá»« kho sáº½ xáº£y ra khi shop CONFIRM Ä‘Æ¡n hÃ ng.
        // Tráº¡ng thÃ¡i OrderShop váº«n lÃ  PENDING.

        return paymentMapper.toDto(savedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDto getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return paymentMapper.toDto(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDto getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrder_Id(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order id: " + orderId));
        return paymentMapper.toDto(payment);
    }

    @Override
    @Transactional
    public PaymentResponseDto updatePaymentStatus(Long paymentId, com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.PaymentStatus status) {
        // PhÆ°Æ¡ng thá»©c nÃ y sáº½ chá»‰ dÃ¹ng cho cÃ¡c trÆ°á»ng há»£p cáº­p nháº­t status ná»™i bá»™ khÃ¡c náº¿u cáº§n.
        // KhÃ´ng tá»± Ä‘á»™ng cáº­p nháº­t OrderShop vÃ  trá»« kho á»Ÿ Ä‘Ã¢y ná»¯a.
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));
        payment.setStatus(status);
        Payment savedPayment = paymentRepository.save(payment);

        return paymentMapper.toDto(savedPayment);
    }

    @Override
    @Transactional
    public PaymentResponseDto processOnlinePaymentResult(Long paymentId, PaymentStatus resultStatus) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        if (payment.getMethod() == PaymentMethod.COD) {
            throw new IllegalArgumentException("Cannot process online payment result for COD payment method.");
        }

        payment.setStatus(resultStatus);
        Payment savedPayment = paymentRepository.save(payment);

        Order order = savedPayment.getOrder();
        if (resultStatus == PaymentStatus.COMPLETED) {
            // Náº¿u thanh toÃ¡n online thÃ nh cÃ´ng, chuyá»ƒn táº¥t cáº£ OrderShop sang CONFIRMED
            // Viá»‡c trá»« kho sáº½ Ä‘Æ°á»£c kÃ­ch hoáº¡t khi OrderShopService.confirmOrder Ä‘Æ°á»£c gá»i
            order.getOrderShops().forEach(orderShop -> {
                if (orderShop.getStatus() == OrderStatus.PENDING) {
                    orderShop.setStatus(OrderStatus.CONFIRMED);
                    // KhÃ´ng gá»i orderService.deductStock(orderShop) trá»±c tiáº¿p tá»« Ä‘Ã¢y
                }
            });
        } else if (resultStatus == PaymentStatus.FAILED) {
            // Náº¿u thanh toÃ¡n online tháº¥t báº¡i, há»§y táº¥t cáº£ OrderShop
            order.getOrderShops().forEach(orderShop -> {
                orderShop.setStatus(OrderStatus.CANCELLED);
                if (orderShop.getShipping() != null) {
                    orderShop.getShipping().setShippingStatus(ShippingStatus.CANCELLED);
                }
                // KhÃ´ng hoÃ n kho vÃ¬ chÆ°a trá»« kho
            });
        }
        orderRepository.save(order); // LÆ°u Order Ä‘á»ƒ cáº­p nháº­t OrderShops

        return paymentMapper.toDto(savedPayment);
    }
}

---

## FRONTEND UPDATE 2026-06-21 - Cần sửa backend để khớp checkout mới

Frontend hiện đã đổi luồng checkout như sau:

- Cart cho phép chọn từng sản phẩm, chọn theo shop, chọn tất cả.
- Khi checkout, frontend gửi thêm `cartItemIds` để backend chỉ tạo đơn từ các cart item đã chọn.
- Voucher hiện chọn theo từng shop, frontend gửi thêm `shopVoucherCodes`.
- Thanh toán online chỉ mockup, dùng đúng enum backend đang có: `VNPAY` hoặc `MOMO`, không dùng `BANKING`.
- Sau khi tạo order online, frontend lấy `order.payment.id` rồi gọi:
  - Thành công: `PUT /api/payments/{paymentId}/process-online-result?resultStatus=COMPLETED`
  - Hủy/thất bại: `PUT /api/payments/{paymentId}/process-online-result?resultStatus=FAILED`

### 1. Sửa `OrderRequestDto.java`

Thêm 2 field mới, giữ `voucherCode` để tương thích code cũ:

```java
package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequestDto {
    @NotNull(message = "User ID cannot be null")
    private Long userId;

    // NEW: chỉ checkout các CartItem này. Nếu null/rỗng thì fallback checkout toàn bộ cart.
    private List<Long> cartItemIds;

    // OLD fallback: một voucher code dùng chung nếu frontend cũ gửi.
    private String voucherCode;

    // NEW: voucher theo từng shop. Key là shopId, value là voucher code.
    private Map<Long, String> shopVoucherCodes;

    @NotNull(message = "Payment method cannot be null")
    private PaymentMethod paymentMethod;

    private Long addressId;
    private String receiverName;
    private String phone;
    private String addressLine;
    private String city;
    private String district;
}
```

### 2. Sửa `OrderServiceImpl.createOrder`

Các lỗi hiện tại trong backend:

- Đang lấy toàn bộ `cart.getCartItems()`, nên frontend chọn một phần cart nhưng backend vẫn tạo đơn toàn bộ cart.
- Sau khi tạo order đang `cart.getCartItems().clear()`, làm mất cả sản phẩm không được chọn.
- `order.totalPrice` đang set bằng tổng sau giảm, nên trang chi tiết không phân biệt được tổng tiền hàng và giảm giá voucher.
- `Payment` tạo trong `createOrder` chưa set `amount`, trong khi frontend cần `order.payment.id` và payment amount chuẩn.
- `voucherCode` một chuỗi không đủ cho nhiều shop. Nên dùng `shopVoucherCodes`.

Thay phần đầu và phần tính tổng trong `createOrder` theo mẫu dưới đây. Các method/helper khác giữ nguyên.

```java
@Override
@Transactional
public OrderResponseDto createOrder(OrderRequestDto requestDto) {
    User user = userRepository.findById(requestDto.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException(
                    "User not found with id: " + requestDto.getUserId()));

    Cart cart = cartRepository.findByUserId(requestDto.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException(
                    "Cart not found for user with id: " + requestDto.getUserId()));

    if (cart.getCartItems().isEmpty()) {
        throw new IllegalArgumentException("Cart is empty, cannot create order");
    }

    List<CartItem> checkoutItems = new ArrayList<>(cart.getCartItems());

    if (requestDto.getCartItemIds() != null && !requestDto.getCartItemIds().isEmpty()) {
        Set<Long> selectedIds = new HashSet<>(requestDto.getCartItemIds());
        checkoutItems = checkoutItems.stream()
                .filter(item -> selectedIds.contains(item.getId()))
                .toList();
    }

    if (checkoutItems.isEmpty()) {
        throw new IllegalArgumentException("No selected cart items to checkout");
    }

    Map<Long, List<CartItem>> itemsByShop = checkoutItems.stream()
            .collect(Collectors.groupingBy(
                    item -> item.getProductVariant().getProduct().getShop().getId()));

    String addressSnapshot = resolveAddressSnapshot(user, requestDto);

    Order order = Order.builder()
            .user(user)
            .addressSnapshot(addressSnapshot)
            .build();

    Payment payment = Payment.builder()
            .method(requestDto.getPaymentMethod())
            .status(PaymentStatus.PENDING)
            .order(order)
            .build();
    order.setPayment(payment);

    Set<OrderShop> orderShops = new HashSet<>();
    BigDecimal totalBeforeVoucher = BigDecimal.ZERO;
    BigDecimal totalAfterVoucher = BigDecimal.ZERO;
    LocalDateTime orderCreationTime = LocalDateTime.now();

    for (Map.Entry<Long, List<CartItem>> entry : itemsByShop.entrySet()) {
        Long shopId = entry.getKey();
        List<CartItem> shopCartItems = entry.getValue();

        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found with id: " + shopId));

        OrderShop orderShop = OrderShop.builder()
                .order(order)
                .shop(shop)
                .addressSnapshot(addressSnapshot)
                .status(OrderStatus.PENDING)
                .build();

        Set<OrderItem> orderItems = shopCartItems.stream().map(cartItem -> {
            ProductVariant variant = cartItem.getProductVariant();

            if (variant.getStock() < cartItem.getQuantity()) {
                throw new IllegalArgumentException(
                        "Sản phẩm " + variant.getProduct().getProductName()
                                + " chỉ còn " + variant.getStock() + " sản phẩm trong kho");
            }

            OrderItem item = createOrderItemFromCartItem(cartItem, orderShop);

            BigDecimal discount = discountService.calculateBestDiscount(
                    shopId,
                    item.getProductVariant().getProduct().getId(),
                    item.getPrice());

            item.setPrice(item.getPrice().subtract(discount));
            return item;
        }).collect(Collectors.toSet());

        orderShop.setOrderItems(orderItems);

        BigDecimal subtotal = orderItems.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        orderShop.setTotalPrice(subtotal);

        BigDecimal shopFinalPrice = subtotal;

        String voucherCode = null;
        if (requestDto.getShopVoucherCodes() != null) {
            voucherCode = requestDto.getShopVoucherCodes().get(shopId);
        }
        if ((voucherCode == null || voucherCode.isBlank()) && requestDto.getVoucherCode() != null) {
            voucherCode = requestDto.getVoucherCode();
        }

        if (voucherCode != null && !voucherCode.isBlank()) {
            BigDecimal voucherDiscountAmount = discountService.applyOrderVoucher(
                    shopId,
                    voucherCode,
                    subtotal,
                    orderCreationTime
            );

            if (voucherDiscountAmount.compareTo(BigDecimal.ZERO) > 0) {
                Discount appliedVoucher = discountRepository
                        .findByShopIdAndCodeAndStatus(
                                shopId,
                                voucherCode,
                                com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.enums.DiscountStatus.ACTIVE)
                        .filter(d -> d.getDiscountTarget() == DiscountTarget.ORDER)
                        .filter(d -> d.getStartDate().isBefore(orderCreationTime)
                                && d.getEndDate().isAfter(orderCreationTime))
                        .filter(d -> d.getMinOrderValue() == null
                                || subtotal.compareTo(d.getMinOrderValue()) >= 0)
                        .orElse(null);

                if (appliedVoucher != null) {
                    orderShop.setDiscount(appliedVoucher);
                    shopFinalPrice = subtotal.subtract(voucherDiscountAmount);
                }
            }
        }

        orderShop.setFinalPrice(shopFinalPrice);

        totalBeforeVoucher = totalBeforeVoucher.add(orderShop.getTotalPrice());
        totalAfterVoucher = totalAfterVoucher.add(orderShop.getFinalPrice());

        OrderShipping shipping = OrderShipping.builder()
                .orderShop(orderShop)
                .addressSnapshot(addressSnapshot)
                .shippingStatus(ShippingStatus.PENDING)
                .build();
        orderShop.setShipping(shipping);

        orderShops.add(orderShop);
    }

    order.setOrderShops(orderShops);
    order.setTotalPrice(totalBeforeVoucher);
    order.setFinalPrice(totalAfterVoucher);
    payment.setAmount(totalAfterVoucher);

    Order savedOrder = orderRepository.save(order);

    // Chỉ xóa những CartItem đã checkout, giữ lại các sản phẩm không được tích.
    Set<Long> checkedOutIds = checkoutItems.stream()
            .map(CartItem::getId)
            .collect(Collectors.toSet());
    cart.getCartItems().removeIf(item -> checkedOutIds.contains(item.getId()));
    cartRepository.save(cart);

    return orderMapper.toDto(savedOrder);
}
```

Các import cần có trong `OrderServiceImpl.java` nếu chưa có:

```java
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
```

### 3. Kiểm tra entity mapping `Order` - `Payment`

Để `orderRepository.save(order)` lưu luôn payment và response trả về có `payment.id`, entity `Order` nên có cascade cho payment:

```java
@OneToOne(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
private Payment payment;
```

Entity `Payment`:

```java
@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "order_id", nullable = false, unique = true)
private Order order;
```

Nếu mapper chưa map `payment`, bổ sung trong `OrderMapper` để `OrderResponseDto.payment` có đủ `id`, `amount`, `method`, `status`, `transactionCode`, `createdAt`.

### 4. Sửa/giữ `PaymentServiceImpl.processOnlinePaymentResult`

Logic hiện tại cơ bản dùng được cho mockup:

- `COMPLETED`: set payment completed, chuyển các `OrderShop.PENDING` sang `CONFIRMED`.
- `FAILED`: set payment failed, chuyển các `OrderShop` sang `CANCELLED`.

Nên bổ sung chặn xử lý lại payment đã có kết quả cuối:

```java
@Override
@Transactional
public PaymentResponseDto processOnlinePaymentResult(Long paymentId, PaymentStatus resultStatus) {
    Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

    if (payment.getMethod() == PaymentMethod.COD) {
        throw new IllegalArgumentException("Cannot process online payment result for COD payment method.");
    }

    if (payment.getStatus() == PaymentStatus.COMPLETED || payment.getStatus() == PaymentStatus.FAILED) {
        return paymentMapper.toDto(payment);
    }

    payment.setStatus(resultStatus);
    Payment savedPayment = paymentRepository.save(payment);

    Order order = savedPayment.getOrder();

    if (resultStatus == PaymentStatus.COMPLETED) {
        order.getOrderShops().forEach(orderShop -> {
            if (orderShop.getStatus() == OrderStatus.PENDING) {
                orderShop.setStatus(OrderStatus.CONFIRMED);
            }
        });
    } else if (resultStatus == PaymentStatus.FAILED) {
        order.getOrderShops().forEach(orderShop -> {
            if (orderShop.getStatus() == OrderStatus.PENDING || orderShop.getStatus() == OrderStatus.CONFIRMED) {
                orderShop.setStatus(OrderStatus.CANCELLED);
            }
            if (orderShop.getShipping() != null) {
                orderShop.getShipping().setShippingStatus(ShippingStatus.CANCELLED);
            }
        });
    }

    orderRepository.save(order);
    return paymentMapper.toDto(savedPayment);
}
```

### 5. Ghi chú API frontend đang gọi

Tạo order:

```json
{
  "userId": 1,
  "cartItemIds": [10, 12],
  "shopVoucherCodes": {
    "2": "SALESHOP2",
    "3": "SALESHOP3"
  },
  "addressId": 5,
  "paymentMethod": "VNPAY"
}
```

Response cần có:

```json
{
  "id": 99,
  "totalPrice": 500000,
  "finalPrice": 450000,
  "payment": {
    "id": 77,
    "amount": 450000,
    "method": "VNPAY",
    "status": "PENDING"
  },
  "orderShops": []
}
```

Mock xác nhận thanh toán:

```http
PUT /api/payments/77/process-online-result?resultStatus=COMPLETED
```

Mock hủy thanh toán:

```http
PUT /api/payments/77/process-online-result?resultStatus=FAILED
```
