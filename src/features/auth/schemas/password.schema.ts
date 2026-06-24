import { z } from 'zod';

export const forgotPasswordSchema = z.object({
    email: z.string().trim().min(1, 'Vui lòng nhập email.').email('Email không đúng định dạng.'),
});

export const resetPasswordSchema = z
    .object({
        email: z.string().trim().min(1, 'Vui lòng nhập email.').email('Email không đúng định dạng.'),
        otp: z.string().trim().regex(/^\d{6}$/, 'OTP phải gồm 6 ký tự.'),
        newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự.'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu.'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Xác nhận mật khẩu không khớp.',
        path: ['confirmPassword'],
    });

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại.'),
        newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự.'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu.'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Xác nhận mật khẩu không khớp.',
        path: ['confirmPassword'],
    });

export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
