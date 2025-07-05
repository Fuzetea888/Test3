'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '@/lib/trpc';
import { SessionProvider } from 'next-auth/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ModalProvider } from '@/components/ui/modal-provider';
import { CommandProvider } from '@/components/ui/command-provider';
import { HotkeysProvider } from '@/hooks/use-hotkeys';
import { WebSocketProvider } from '@/hooks/use-websocket';
import { NotificationProvider } from '@/hooks/use-notifications';
import { ComplianceProvider } from '@/hooks/use-compliance';
import { ErrorBoundary } from '@/components/error-boundary';
import { getBaseUrl } from '@/lib/utils';
import superjson from 'superjson';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              if (error && 'status' in error && typeof error.status === 'number') {
                if (error.status >= 400 && error.status < 500) {
                  return false;
                }
              }
              return failureCount < 3;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            return {
              'x-trpc-source': 'client',
            };
          },
        }),
      ],
    })
  );

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <HotkeysProvider>
              <WebSocketProvider>
                <NotificationProvider>
                  <ComplianceProvider>
                    <TooltipProvider>
                      <ModalProvider>
                        <CommandProvider>
                          {children}
                        </CommandProvider>
                      </ModalProvider>
                    </TooltipProvider>
                  </ComplianceProvider>
                </NotificationProvider>
              </WebSocketProvider>
            </HotkeysProvider>
          </SessionProvider>
          
          {/* Dev tools */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}