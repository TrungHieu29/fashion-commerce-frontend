import { z } from 'zod';

export const profileSchema = z.object({
    fullName: z.string().min(1, 'Họ và tên không được để trống'),
    phone: z
        .string()
        .regex(
            /^(0|\+84)[0-9]{9}$/,
            'Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 hoặc +84 và có 10 chữ số.'
        ),
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
});

export const addressSchema = z.object({
    receiverName: z.string().min(1, 'Tên người nhận không được để trống'),
    phone: z
        .string()
        .regex(
            /^(0|\+84)[0-9]{9}$/,
            'Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 hoặc +84 và có 10 chữ số.'
        ),
    addressLine: z.string().min(1, 'Địa chỉ không được để trống'),
    district: z.string().min(1, 'Vui lòng nhập Quận/Huyện'),
    city: z.string().min(1, 'Vui lòng nhập Tỉnh/Thành phố'),
    isDefault: z.boolean().default(false),
});