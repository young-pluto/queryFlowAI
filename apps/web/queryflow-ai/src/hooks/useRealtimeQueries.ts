import { useEffect } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabaseClient'
import { fetchQueries } from '@/services/queries'
import type { Query } from '@/shared/types/query'

export function useRealtimeQueries(limit = 100) {
  const queryClient = useQueryClient()

  const query = useQuery<Query[]>({
    queryKey: ['queries', { limit }],
    queryFn: () => fetchQueries(limit),
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    const channel = supabase
      .channel('public:queries')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queries' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['queries', { limit }] })
        },
      )
      .subscribe()

    return () => {
      void channel.unsubscribe()
    }
  }, [limit, queryClient])

  return query
}

