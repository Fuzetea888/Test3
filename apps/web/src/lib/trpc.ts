import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { getSession } from 'next-auth/react';
import superjson from 'superjson';
import type { AppRouter } from '@complianceos/backend';

/**
 * Create tRPC React client
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get base URL for API calls
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative URL
    return '';
  }
  
  if (process.env.VERCEL_URL) {
    // SSR should use vercel URL
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    // SSR should use app URL
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // dev SSR should use localhost
  return 'http://localhost:3000';
}

/**
 * tRPC client configuration
 */
export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === 'development' ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      async headers() {
        const session = await getSession();
        return {
          authorization: session?.accessToken ? `Bearer ${session.accessToken}` : '',
          'x-trpc-source': 'client',
        };
      },
    }),
  ],
});

/**
 * Utility type for tRPC router
 */
export type RouterInputs = Parameters<AppRouter['_def']['_config']['$types']['ctx']>[0];
export type RouterOutputs = AppRouter['_def']['_config']['$types']['ctx'];

/**
 * Custom hook for tRPC queries with error handling
 */
export function useTRPCQuery<
  TPath extends keyof AppRouter['_def']['queries'],
  TInput = RouterInputs[TPath],
  TOutput = RouterOutputs[TPath]
>(
  path: TPath,
  input?: TInput,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchOnMount?: boolean;
    refetchOnReconnect?: boolean;
    retry?: boolean | number;
    retryDelay?: number;
    onSuccess?: (data: TOutput) => void;
    onError?: (error: Error) => void;
  }
) {
  return trpc.useQuery([path, input] as any, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
}

/**
 * Custom hook for tRPC mutations with error handling
 */
export function useTRPCMutation<
  TPath extends keyof AppRouter['_def']['mutations'],
  TInput = RouterInputs[TPath],
  TOutput = RouterOutputs[TPath]
>(
  path: TPath,
  options?: {
    onSuccess?: (data: TOutput, variables: TInput) => void;
    onError?: (error: Error, variables: TInput) => void;
    onSettled?: (data: TOutput | undefined, error: Error | null, variables: TInput) => void;
  }
) {
  return trpc.useMutation([path] as any, {
    retry: 1,
    ...options,
  });
}

/**
 * Custom hook for tRPC subscriptions
 */
export function useTRPCSubscription<
  TPath extends keyof AppRouter['_def']['subscriptions'],
  TInput = RouterInputs[TPath],
  TOutput = RouterOutputs[TPath]
>(
  path: TPath,
  input?: TInput,
  options?: {
    enabled?: boolean;
    onData?: (data: TOutput) => void;
    onError?: (error: Error) => void;
  }
) {
  return trpc.useSubscription([path, input] as any, {
    enabled: true,
    ...options,
  });
}

/**
 * Utility for invalidating queries
 */
export function useInvalidateQueries() {
  const utils = trpc.useContext();
  
  return {
    invalidateAll: () => utils.invalidateQueries(),
    invalidateQuery: (path: string) => utils.invalidateQueries([path]),
    refetchAll: () => utils.refetchQueries(),
    refetchQuery: (path: string) => utils.refetchQueries([path]),
  };
}

/**
 * Utility for prefetching queries
 */
export function usePrefetchQuery() {
  const utils = trpc.useContext();
  
  return {
    prefetchQuery: async <TPath extends keyof AppRouter['_def']['queries']>(
      path: TPath,
      input?: RouterInputs[TPath]
    ) => {
      await utils.prefetchQuery([path, input] as any);
    },
    prefetchInfiniteQuery: async <TPath extends keyof AppRouter['_def']['queries']>(
      path: TPath,
      input?: RouterInputs[TPath]
    ) => {
      await utils.prefetchInfiniteQuery([path, input] as any);
    },
  };
}

/**
 * Error handling utilities
 */
export function isTRPCError(error: unknown): error is Error {
  return error instanceof Error && error.message.includes('TRPC');
}

export function getTRPCErrorMessage(error: unknown): string {
  if (isTRPCError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

export function handleTRPCError(error: unknown, fallbackMessage?: string): void {
  const message = getTRPCErrorMessage(error);
  console.error('tRPC Error:', message);
  
  // You can add toast notifications here
  // toast.error(message || fallbackMessage || 'An error occurred');
}

/**
 * Optimistic update utilities
 */
export function useOptimisticUpdate() {
  const utils = trpc.useContext();
  
  return {
    setQueryData: <TPath extends keyof AppRouter['_def']['queries']>(
      path: TPath,
      input: RouterInputs[TPath],
      data: RouterOutputs[TPath]
    ) => {
      utils.setQueryData([path, input] as any, data);
    },
    
    updateQueryData: <TPath extends keyof AppRouter['_def']['queries']>(
      path: TPath,
      input: RouterInputs[TPath],
      updater: (oldData: RouterOutputs[TPath] | undefined) => RouterOutputs[TPath]
    ) => {
      utils.setQueryData([path, input] as any, updater);
    },
    
    cancelQuery: async <TPath extends keyof AppRouter['_def']['queries']>(
      path: TPath,
      input?: RouterInputs[TPath]
    ) => {
      await utils.cancelQuery([path, input] as any);
    },
  };
}

/**
 * Batch request utilities
 */
export function useBatchRequests() {
  const utils = trpc.useContext();
  
  return {
    fetchQueries: async <TPath extends keyof AppRouter['_def']['queries']>(
      queries: Array<{ path: TPath; input?: RouterInputs[TPath] }>
    ) => {
      const promises = queries.map(({ path, input }) =>
        utils.fetchQuery([path, input] as any)
      );
      
      return Promise.all(promises);
    },
    
    invalidateQueries: (paths: string[]) => {
      paths.forEach(path => utils.invalidateQueries([path]));
    },
  };
}

/**
 * Real-time data utilities
 */
export function useRealTimeData() {
  const utils = trpc.useContext();
  
  return {
    subscribeToUpdates: <TPath extends keyof AppRouter['_def']['subscriptions']>(
      path: TPath,
      input?: RouterInputs[TPath],
      onData?: (data: RouterOutputs[TPath]) => void
    ) => {
      return trpc.useSubscription([path, input] as any, {
        enabled: true,
        onData,
      });
    },
    
    refetchOnUpdate: (queryKeys: string[]) => {
      queryKeys.forEach(key => utils.refetchQueries([key]));
    },
  };
}

/**
 * Cache management utilities
 */
export function useCacheManagement() {
  const utils = trpc.useContext();
  
  return {
    clearCache: () => utils.clear(),
    
    removeQueries: (paths: string[]) => {
      paths.forEach(path => utils.removeQueries([path]));
    },
    
    getQueryData: <TPath extends keyof AppRouter['_def']['queries']>(
      path: TPath,
      input?: RouterInputs[TPath]
    ) => {
      return utils.getQueryData([path, input] as any);
    },
    
    setQueryData: <TPath extends keyof AppRouter['_def']['queries']>(
      path: TPath,
      input: RouterInputs[TPath],
      data: RouterOutputs[TPath]
    ) => {
      utils.setQueryData([path, input] as any, data);
    },
  };
}

/**
 * Development utilities
 */
export function useDevUtils() {
  const utils = trpc.useContext();
  
  return {
    logCache: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('tRPC Cache:', utils.getQueryCache());
      }
    },
    
    logQueries: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Active Queries:', utils.getQueryCache().getAll());
      }
    },
  };
}