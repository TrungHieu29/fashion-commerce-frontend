import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { addWishlistProduct, getWishlist, removeWishlistProduct } from '../api/wishlist.api';

const wishlistKeys = {
    list: (userId?: number) => ['wishlist', userId] as const,
};

export const useWishlist = () => {
    const user = useAuthStore(state => state.user);

    return useQuery({
        queryKey: wishlistKeys.list(user?.id),
        queryFn: () => getWishlist(user!.id),
        enabled: !!user?.id,
        staleTime: 1000 * 60,
        retry: false,
    });
};

export const useIsWishlisted = (productId: number) => {
    const { data: wishlist = [] } = useWishlist();

    return wishlist.some(item => {
        const itemProductId = item.productId ?? item.product?.id;
        return Number(itemProductId) === Number(productId);
    });
};

export const useToggleWishlist = (productId: number) => {
    const user = useAuthStore(state => state.user);
    const queryClient = useQueryClient();
    const isWishlisted = useIsWishlisted(productId);

    return useMutation({
        mutationFn: async () => {
            if (!user?.id) {
                throw new Error('AUTH_REQUIRED');
            }

            if (isWishlisted) {
                await removeWishlistProduct(user.id, productId);
            } else {
                await addWishlistProduct(user.id, productId);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: wishlistKeys.list(user?.id) });
            window.dispatchEvent(new CustomEvent('wishlist-updated', {
                detail: { action: isWishlisted ? 'removed' : 'added', productId },
            }));
        },
        onError: () => undefined,
    });
};
