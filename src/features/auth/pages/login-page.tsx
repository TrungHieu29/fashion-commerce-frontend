import { useEffect } from 'react';

import { api } from '@/lib/axios';

import { LoginForm } from '../components/login-form';

const LoginPage = () => {

    return (
        <div>
            <h1>Login</h1>

            <LoginForm />
        </div>
    );
};

export default LoginPage;