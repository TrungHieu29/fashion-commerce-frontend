import { z } from 'zod';

export const shopSchema = z.object({
    shopName: z.string().trim().min(1, 'Tên shop không được để trống'),
    phone: z
        .string()
        .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 hoặc +84 và có 10 chữ số.')
        .optional()
        .or(z.literal('')),
    address: z.string().trim().min(1, 'Địa chỉ không được để trống'),
    email: z.string().trim().email('Email không hợp lệ').optional().or(z.literal('')),
    logo: z.string().trim().url('URL logo không hợp lệ').optional().or(z.literal('')),
});
