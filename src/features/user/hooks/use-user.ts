import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import * as userApi from '../api/user.api';
import { toast } from 'sonner';
import type { ShippingAddressRequest, UserUpdateRequest } from '../types/user.types';


export const useUserProfile = () => {
    const user = useAuthStore(state => state.user);
    return useQuery({
        queryKey: ['user-profile', user?.id],
        queryFn: () => userApi.getUserProfile(user!.id),
        enabled: !!user?.id
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore(state => state.user);
    return useMutation({
        mutationFn: (data: UserUpdateRequest) => userApi.updateUserProfile(user!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
            toast.success('Cập nhật thông tin thành công');
        }
    });
};

export const useAddresses = () => {
    const user = useAuthStore(state => state.user);
    return useQuery({
        queryKey: ['user-addresses', user?.id],
        queryFn: () => userApi.getAddresses(user!.id),
        enabled: !!user?.id
    });
};

export const useAddAddress = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore(state => state.user);
    return useMutation({
        mutationFn: (data: ShippingAddressRequest) => userApi.addAddress(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-addresses', user?.id] });
            toast.success('Thêm địa chỉ thành công');
        }
    });
};

export const useDeleteAddress = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore(state => state.user);
    return useMutation({
        mutationFn: (id: number) => userApi.deleteAddress(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-addresses', user?.id] });
            toast.success('Đã xóa địa chỉ');
        }
    });
};

export const useSetDefaultAddress = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore(state => state.user);
    return useMutation({
        mutationFn: (id: number) => userApi.setDefaultAddress(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-addresses', user?.id] });
            toast.success('Đã đặt làm địa chỉ mặc định');
        }
    });
};