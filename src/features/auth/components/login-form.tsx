import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import {
    loginSchema,
    type LoginSchemaType,
} from '../schemas/login.schema';

import { useLogin } from '../hooks/use-login';

export const LoginForm = () => {
    const { mutate } = useLogin();

    const {
        register,
        handleSubmit,
    } = useForm<LoginSchemaType>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginSchemaType) => {
        mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <input
                    type="text"
                    placeholder="Username"
                    {...register('username')}
                />
            </div>

            <div>
                <input
                    type="password"
                    placeholder="Password"
                    {...register('password')}
                />
            </div>

            <button type="submit">
                Login
            </button>
        </form>
    );
};