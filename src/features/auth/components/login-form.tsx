import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import {
    loginSchema,
    type LoginSchemaType,
} from '../schemas/login.schema';

import { useLogin } from '../hooks/use-login';

export const LoginForm = () => {
    const { mutate, isPending, error: serverError } = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchemaType>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginSchemaType) => {
        mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {serverError && <p style={{ color: 'red' }}>Đăng nhập thất bại!</p>}
            <div>
                <input
                    type="text"
                    placeholder="Username"
                    {...register('username')}
                />
                {errors.username && <p>{errors.username.message}</p>}
            </div>

            <div>
                <input
                    type="password"
                    placeholder="Password"
                    {...register('password')}
                />
                {errors.password && <p>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isPending}>
                {isPending ? 'Loading...' : 'Login'}
            </button>
        </form>
    );
};