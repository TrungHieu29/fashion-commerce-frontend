import ReactDOM from 'react-dom/client';

import { RouterProvider } from 'react-router-dom';

import {
  QueryClientProvider,
} from '@tanstack/react-query';

import { router } from './app/router';

import { queryClient } from './lib/query-client';

import './index.css';

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);