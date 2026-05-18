import { useQueries } from '@tanstack/react-query';
import { fetchProductBaseDetail, fetchProductVariants } from '../api/variant.api';
import type { ProductDetailResponse } from '../types/variant.types';


export const useProductDetail = (id: string | number | undefined) => {
    const results = useQueries({
        queries: [
            {
                queryKey: ['product-base-detail', id],
                queryFn: () => fetchProductBaseDetail(id!),
                enabled: !!id,
            },
            {
                queryKey: ['product-variants', id],
                queryFn: () => fetchProductVariants(id!),
                enabled: !!id,
            },
        ],
    });

    const productBaseDetailQuery = results[0];
    const productVariantsQuery = results[1];

    const isLoading = productBaseDetailQuery.isLoading || productVariantsQuery.isLoading;
    const isError = productBaseDetailQuery.isError || productVariantsQuery.isError;
    const error = productBaseDetailQuery.error || productVariantsQuery.error;

    const product: ProductDetailResponse | undefined =
        productBaseDetailQuery.data && productVariantsQuery.data
            ? { ...productBaseDetailQuery.data, variants: productVariantsQuery.data }
            : undefined;

    return { data: product, isLoading, isError, error };
};