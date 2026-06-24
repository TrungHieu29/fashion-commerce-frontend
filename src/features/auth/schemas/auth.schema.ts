import { z } from 'zod';

const gmailRegex = /^[A-Z0-9._%+-]+@gmail\.com$/i;
const phoneRegex = /^(0|\+84)[0-9]{9}$/;

export const registerSchema = z
    .object({
        username: z
            .string()
            .trim()
            .min(4, 'Tên đăng nhập phải từ 4 đến 50 ký tự.')
            .max(50, 'Tên đăng nhập phải từ 4 đến 50 ký tự.'),
        fullName: z.string().trim().min(1, 'Vui lòng nhập họ tên.'),
        email: z
            .string()
            .trim()
            .min(1, 'Vui lòng nhập email.')
            .regex(gmailRegex, 'Email phải có định dạng ...@gmail.com.'),
        phone: z
            .string()
            .trim()
            .optional()
            .or(z.literal(''))
            .refine((value) => !value || phoneRegex.test(value), 'Số điện thoại không hợp lệ.'),
        password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu.'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp.',
        path: ['confirmPassword'],
    });

export type RegisterSchemaType = z.infer<typeof registerSchema>;
