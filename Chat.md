package com.trunghieu.fashioncommerce.fashion_commerce_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "conversation_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    @ToString.Exclude
    private Shop shop;

    @Column(name = "created_at") // Added @Column
    private LocalDateTime createdAt;

    @Column(name = "updated_at") // Added updatedAt field
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Message> messages;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now(); // Initialize updatedAt on creation
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(); // Update updatedAt on update
    }
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    @ToString.Exclude
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    @ToString.Exclude
    private User sender;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_read") // Added @Column
    private Boolean isRead;

    @Column(name = "created_at") // Added @Column
    private LocalDateTime createdAt;

    @Column(name = "updated_at") // Added updatedAt field
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now(); // Initialize updatedAt on creation
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(); // Update updatedAt on update
    }
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.mapper;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.Conversation;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request.ConversationRequestDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.ConversationResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ConversationMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "shop", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "messages", ignore = true)
    Conversation toEntity(ConversationRequestDto dto);

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.fullName", target = "userName")
    @Mapping(source = "user.avatar", target = "userAvatar")
    @Mapping(source = "shop.id", target = "shopId")
    @Mapping(source = "shop.shopName", target = "shopName")
    @Mapping(source = "shop.logo", target = "shopLogo")
    ConversationResponseDto toDto(Conversation entity);
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.repository;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Page<Conversation> findByUserId(Long userId, Pageable pageable);
    Page<Conversation> findByShopId(Long shopId, Pageable pageable);
    Optional<Conversation> findByUserIdAndShopId(Long userId, Long shopId);
}package com.trunghieu.fashioncommerce.fashion_commerce_backend.repository;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    Page<Message> findByConversationId(Long conversationId, Pageable pageable);
    List<Message> findByConversationIdAndIsReadFalse(Long conversationId);
    Page<Message> findBySenderId(Long senderId, Pageable pageable);
}package com.trunghieu.fashioncommerce.fashion_commerce_backend.service.impl;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request.ConversationRequestDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.ConversationResponseDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.Conversation;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.Shop;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.User;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.exception.ResourceNotFoundException;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.repository.ConversationRepository;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.repository.ShopRepository;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.repository.UserRepository;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;

    @Override
    @Transactional
    public ConversationResponseDto createConversation(ConversationRequestDto requestDto) {
        User user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + requestDto.getUserId()));

        Shop shop = shopRepository.findById(requestDto.getShopId())
                .orElseThrow(() -> new ResourceNotFoundException("Shop not found with id: " + requestDto.getShopId()));

        if (shop.getOwner() != null && shop.getOwner().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Shop owner cannot create a conversation with their own shop");
        }

        // Mỗi khách hàng có thể chat với nhiều shop, và mỗi shop có thể chat với nhiều khách hàng.
        if (conversationRepository.findByUserIdAndShopId(user.getId(), shop.getId()).isPresent()) {
            throw new IllegalArgumentException("Conversation already exists between user and shop");
        }

        Conversation conversation = Conversation.builder()
                .user(user)
                .shop(shop)
                .build();

        Conversation saved = conversationRepository.save(conversation);
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ConversationResponseDto getConversationById(Long id) {
        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + id));
        return toDto(conversation);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConversationResponseDto> getConversationsByUserId(Long userId, Pageable pageable) {
        return conversationRepository.findByUserId(userId, pageable)
                .map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConversationResponseDto> getConversationsByShopId(Long shopId, Pageable pageable) {
        return conversationRepository.findByShopId(shopId, pageable)
                .map(this::toDto);
    }

    @Override
    @Transactional
    public ConversationResponseDto getOrCreateConversation(Long userId, Long shopId) {
        return conversationRepository.findByUserIdAndShopId(userId, shopId)
                .map(this::toDto)
                .orElseGet(() -> createConversation(new ConversationRequestDto(userId, shopId)));
    }

    private ConversationResponseDto toDto(Conversation conversation) {
        return ConversationResponseDto.builder()
                .id(conversation.getId())
                .userId(conversation.getUser().getId())
                .userName(conversation.getUser().getFullName())
                .userAvatar(conversation.getUser().getAvatar())
                .shopId(conversation.getShop().getId())
                .shopName(conversation.getShop().getShopName())
                .shopLogo(conversation.getShop().getLogo())
                .createdAt(conversation.getCreatedAt())
                .build();
    }
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.service.impl;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request.MessageRequestDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.MessageReadResponseDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.MessageResponseDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.Conversation;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.Message;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.entity.User;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.exception.ResourceNotFoundException;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.repository.ConversationRepository;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.repository.MessageRepository;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.repository.UserRepository;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.security.SecurityUtils;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public MessageResponseDto sendMessage(MessageRequestDto requestDto, Long senderId) { // Thêm senderId
        // 1. Tìm cuộc hội thoại
        Conversation conversation = conversationRepository.findById(requestDto.getConversationId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        // 2. Tìm User từ ID được truyền vào (thay vì SecurityUtils)
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 3. Kiểm tra quyền
        if (!isValidSender(conversation, sender)) {
            throw new IllegalArgumentException("You are not a participant in this conversation");
        }

        // 4. Lưu tin nhắn
        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(requestDto.getContent())
                .isRead(false)
                .build();

        return toDto(messageRepository.save(message));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MessageResponseDto> getMessagesByConversationId(Long conversationId, Pageable pageable) {
        return messageRepository.findByConversationId(conversationId, pageable)
                .map(this::toDto);
    }

    @Override
    @Transactional
    public void markConversationMessagesAsRead(Long conversationId) {
        markConversationMessagesAsRead(conversationId, null);
    }

    @Override
    @Transactional
    public MessageReadResponseDto markConversationMessagesAsRead(Long conversationId, Long readerId) {
        int readCount = (int) messageRepository.findByConversationIdAndIsReadFalse(conversationId)
                .stream()
                .filter(message -> readerId == null || !message.getSender().getId().equals(readerId))
                .peek(message -> message.setIsRead(true))
                .count();

        return MessageReadResponseDto.builder()
                .conversationId(conversationId)
                .readerId(readerId)
                .messagesRead(readCount)
                .build();
    }

    private boolean isValidSender(Conversation conversation, User sender) {
        Long conversationUserId = conversation.getUser().getId();
        Long shopOwnerId = conversation.getShop().getOwner() != null ? conversation.getShop().getOwner().getId() : null;
        return sender.getId().equals(conversationUserId) || (shopOwnerId != null && sender.getId().equals(shopOwnerId));
    }

    private MessageResponseDto toDto(Message message) {
        return MessageResponseDto.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationResponseDto {
    private Long id;
    private Long userId;
    private String userName;
    private String userAvatar;
    private Long shopId;
    private String shopName;
    private String shopLogo;
    private LocalDateTime createdAt;
    // Có thể thêm LastMessageResponseDto để hiển thị tin nhắn cuối cùng trong danh sách
}package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponseDto {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageReadResponseDto {
    private Long conversationId;
    private Long readerId;
    private Integer messagesRead;
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRequestDto {
    @NotNull(message = "Conversation ID is required")
    private Long conversationId;

    // Bỏ qua senderId ở đây vì đã lấy từ Token
    private Long senderId;

    @NotBlank(message = "Message content cannot be blank")
    private String content;
}package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageReadRequestDto {
    @NotNull(message = "Conversation ID is required")
    private Long conversationId;
    private Long readerId;
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationRequestDto {
    @NotNull(message = "User ID is required")
    private Long userId;
    @NotNull(message = "Shop ID is required")
    private Long shopId;
}package com.trunghieu.fashioncommerce.fashion_commerce_backend.controller;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request.MessageReadRequestDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request.MessageRequestDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request.TypingIndicatorDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.MessageReadResponseDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.MessageResponseDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.security.CustomUserDetails;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(MessageRequestDto messageRequestDto, Principal principal) {
        Long senderId = extractUserId(principal);

        // Gọi service với 2 tham số
        MessageResponseDto savedMessage = messageService.sendMessage(messageRequestDto, senderId);

        String destination = "/topic/conversations/" + savedMessage.getConversationId();
        messagingTemplate.convertAndSend(destination, savedMessage);
    }
    @MessageMapping("/chat.typing")
    public void typing(TypingIndicatorDto typingIndicatorDto, Principal principal) {
        typingIndicatorDto.setSenderId(extractUserId(principal));
        String destination = "/topic/conversations/" + typingIndicatorDto.getConversationId() + "/typing";
        messagingTemplate.convertAndSend(destination, typingIndicatorDto);
    }

    @MessageMapping("/chat.markRead")
    public void markRead(MessageReadRequestDto readRequestDto, Principal principal) {
        Long readerId = extractUserId(principal);
        MessageReadResponseDto responseDto = messageService.markConversationMessagesAsRead(
                readRequestDto.getConversationId(), readerId);

        String destination = "/topic/conversations/" + responseDto.getConversationId() + "/read";
        messagingTemplate.convertAndSend(destination, responseDto);
    }

    private Long extractUserId(Principal principal) {
        if (principal instanceof Authentication authentication) {
            Object principalObj = authentication.getPrincipal();
            if (principalObj instanceof CustomUserDetails customUserDetails) {
                return customUserDetails.getId();
            }
        }
        throw new IllegalArgumentException("Unauthenticated WebSocket user");
    }
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.controller;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request.ConversationRequestDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.ConversationResponseDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or #requestDto.userId == authentication.principal.id")
    public ResponseEntity<ConversationResponseDto> createConversation(
            @Valid @RequestBody ConversationRequestDto requestDto) {
        return new ResponseEntity<>(conversationService.createConversation(requestDto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isConversationParticipant(#id)")
    public ResponseEntity<ConversationResponseDto> getConversationById(@PathVariable Long id) {
        return ResponseEntity.ok(conversationService.getConversationById(id));
    }

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<Page<ConversationResponseDto>> getConversationsByUserId(
            @PathVariable Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(conversationService.getConversationsByUserId(userId, pageable));
    }

    @GetMapping("/shops/{shopId}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isShopOwner(#shopId)")
    public ResponseEntity<Page<ConversationResponseDto>> getConversationsByShopId(
            @PathVariable Long shopId,
            Pageable pageable) {
        return ResponseEntity.ok(conversationService.getConversationsByShopId(shopId, pageable));
    }

    @GetMapping("/get-or-create")
    @PreAuthorize("hasRole('ADMIN') or #userId == principal.id or @securityUtils.isShopOwner(#shopId)")
    public ResponseEntity<ConversationResponseDto> getOrCreateConversation(
            @RequestParam Long userId,
            @RequestParam Long shopId) {
        return ResponseEntity.ok(conversationService.getOrCreateConversation(userId, shopId));
    }
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.controller;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.request.MessageRequestDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.dto.response.MessageResponseDto;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.security.SecurityUtils;
import com.trunghieu.fashioncommerce.fashion_commerce_backend.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    @PreAuthorize("@securityUtils.isConversationParticipant(#requestDto.conversationId)")
    public ResponseEntity<MessageResponseDto> sendMessage(@Valid @RequestBody MessageRequestDto requestDto) {
        // Lấy ID từ token ngay tại Controller rồi truyền vào service
        Long senderId = SecurityUtils.getCurrentUserId();
        return new ResponseEntity<>(messageService.sendMessage(requestDto, senderId), HttpStatus.CREATED);
    }

    @GetMapping("/conversations/{conversationId}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isConversationParticipant(#conversationId)")
    public ResponseEntity<Page<MessageResponseDto>> getMessagesByConversation(
            @PathVariable Long conversationId,
            Pageable pageable) {
        return ResponseEntity.ok(messageService.getMessagesByConversationId(conversationId, pageable));
    }

    @PutMapping("/conversations/{conversationId}/read")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isConversationParticipant(#conversationId)")
    public ResponseEntity<Void> markConversationRead(@PathVariable Long conversationId) {
        messageService.markConversationMessagesAsRead(conversationId);
        return ResponseEntity.noContent().build();
    }
}
package com.trunghieu.fashioncommerce.fashion_commerce_backend.config;

import com.trunghieu.fashioncommerce.fashion_commerce_backend.security.WebSocketAuthChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthChannelInterceptor webSocketAuthChannelInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(webSocketAuthChannelInterceptor);
    }
}
