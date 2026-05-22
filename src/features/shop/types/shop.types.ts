export interface ShopResponse {
    id: number;
    shopName: string;
    logo?: string;
    phone?: string;
    address?: string;
    email?: string;
    status: string;
    createdAt: string;
    ownerId: number;
    ownerFullName: string;
}

export interface ShopRequest {
    shopName: string;
    logo?: string;
    phone?: string;
    address?: string;
    email?: string;
    ownerId: number; // Required for creation
}

export interface ShopUpdateRequest {
    // All fields are optional for update, as only changed fields are sent
    shopName?: string;
    logo?: string;
    phone?: string;
    address?: string;
    email?: string;
}