import ReactDOM from 'react-dom/client';

import { RouterProvider } from 'react-router-dom';

import {
  QueryClientProvider,
} from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { router } from './app/router';

import { queryClient } from './lib/query-client';

import './index.css';

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <Toaster position="top-right" richColors />
  </QueryClientProvider>
);
