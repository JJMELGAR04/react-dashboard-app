import BaseEntity from '@/models/api/core/_BaseEntity'
import AbstractService from '@/models/api/core/AbstractService'
import PaginationResponse from '@/models/api/core/PaginationResponse'
import {
  useQuery,
  UseQueryResult,
  UseQueryOptions,
  useQueryClient,
} from '@tanstack/react-query'

import { useCallback, useMemo } from 'react'

type QueryData<Entity extends BaseEntity> = PaginationResponse<Entity>

type QueryOpts<Entity extends BaseEntity> = UseQueryOptions<
  QueryData<Entity>,
  Error,
  QueryData<Entity>,
  readonly unknown[]
>

interface UseListOptions<Entity extends BaseEntity> extends Omit<
  QueryOpts<Entity>,
  'queryKey' | 'queryFn'
> {
  service: AbstractService<Entity>
  endpoint?: string
  queryParams?: Record<string, unknown>
  queryKey: string | string[]
}

export type FindAllResult<Entity extends BaseEntity> = UseQueryResult<
  QueryData<Entity>,
  Error
>

export const useFindAll = <Entity extends BaseEntity>({
  service,
  endpoint,
  queryParams = {},
  queryKey,
  ...options
}: UseListOptions<Entity>) => {
  const queryClient = useQueryClient()

  const normalizedQueryKey = useMemo(
    () => (Array.isArray(queryKey) ? queryKey : [queryKey]),
    [queryKey]
  )

  const stableQueryParams = useMemo(
    () => JSON.stringify(queryParams),
    [queryParams]
  )

  const finalQueryKey = useMemo(
    () => [...normalizedQueryKey, endpoint, stableQueryParams],
    [normalizedQueryKey, endpoint, stableQueryParams]
  )

  const hook = useQuery<QueryData<Entity>, Error>({
    queryKey: finalQueryKey,
    queryFn: () =>
      service.findAll({
        endpoint,
        config: { params: queryParams },
      }),
    ...options,
  })

  const getSafeCache = useCallback(
    (old?: QueryData<Entity>): QueryData<Entity> => {
      return (
        old ?? {
          data: [],
          pagination: {
            total: 0,
            page: 1,
            pageSize: 0,
            nextCursor: '',
            pageCount: 0,
          },
        }
      )
    },
    []
  )

  const addItemInCache = (item: Entity) => {
    queryClient.setQueryData<QueryData<Entity>>(finalQueryKey, (old) => {
      const base = getSafeCache(old)

      const exists = base.data.some((i) => i.id === item.id)
      if (exists) return base

      return {
        ...base,
        data: [item, ...base.data],
      }
    })
  }

  const updateItemInCache = (
    id: string | number,
    updater: (item: Entity) => Entity
  ) => {
    queryClient.setQueryData<QueryData<Entity>>(finalQueryKey, (old) => {
      const base = getSafeCache(old)
      return {
        ...base,
        data: base.data.map((item) => (item.id === id ? updater(item) : item)),
      }
    })
  }

  const removeItemInCache = (id: string | number) => {
    queryClient.setQueryData<QueryData<Entity>>(finalQueryKey, (old) => {
      const base = getSafeCache(old)
      return {
        ...base,
        data: base.data.filter((item) => item.id !== id),
      }
    })
  }

  const emptyCache = () => {
    queryClient.setQueryData(finalQueryKey, {
      data: [],
      pagination: undefined,
    })
  }

  return {
    ...hook,
    finalQueryKey,
    addItemInCache,
    updateItemInCache,
    removeItemInCache,
    emptyCache,
  }
}
