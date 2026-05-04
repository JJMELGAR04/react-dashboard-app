import { queryClient } from '@/lib/queryClient'
import BaseEntity from '@/models/api/core/_BaseEntity'
import AbstractService from '@/models/api/core/AbstractService'
import PaginationResponse from '@/models/api/core/PaginationResponse'
import {
  useInfiniteQuery,
  InfiniteData,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query'

import { useCallback, useMemo } from 'react'

type QueryData<Entity extends BaseEntity> = PaginationResponse<Entity>

type QueryKey = readonly unknown[]

type InfiniteOpts<
  Entity extends BaseEntity,
  Selected = InfiniteData<QueryData<Entity>>,
> = UseInfiniteQueryOptions<QueryData<Entity>, Error, Selected, QueryKey>

interface UseInfiniteListOptions<
  Entity extends BaseEntity,
  Selected = InfiniteData<QueryData<Entity>>,
> extends Omit<
  InfiniteOpts<Entity, Selected>,
  'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
> {
  service: AbstractService<Entity>
  endpoint?: string
  queryKey: string | string[]
  queryParams?: Record<string, unknown>
  getNextPageParam: InfiniteOpts<Entity, Selected>['getNextPageParam']
  initialPageParam?: InfiniteOpts<Entity, Selected>['initialPageParam']
}

export type InfiniteFindAllResult<Entity extends BaseEntity> = InfiniteData<
  QueryData<Entity>
>

const useInfiniteFindAll = <
  Entity extends BaseEntity,
  Selected = InfiniteData<QueryData<Entity>>,
>({
  service,
  endpoint,
  queryKey,
  queryParams = {},
  getNextPageParam,
  initialPageParam,
  ...options
}: UseInfiniteListOptions<Entity, Selected>) => {
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

  const hook = useInfiniteQuery<QueryData<Entity>, Error, Selected, QueryKey>({
    queryKey: finalQueryKey,
    queryFn: ({ pageParam }) =>
      service.findAll({
        endpoint,
        config: {
          params: {
            ...queryParams,
            ...(pageParam ?? {}),
          },
        },
      }),
    getNextPageParam,
    initialPageParam,
    ...options,
  })

  const getSafeCache = useCallback((old?: InfiniteFindAllResult<Entity>) => {
    return (
      old ?? {
        pages: [],
        pageParams: [],
      }
    )
  }, [])

  const addItemInCache = (item: Entity) => {
    queryClient.setQueryData<InfiniteFindAllResult<Entity>>(
      finalQueryKey,
      (old) => {
        const base = getSafeCache(old)
        const firstPage = base.pages[0]
        const exists = firstPage?.data.some((i) => i.id === item.id)

        if (exists) return base

        return {
          ...base,
          pages: base.pages.map((page, index) =>
            index === 0
              ? {
                  ...page,
                  data: [item, ...page.data],
                }
              : page
          ),
        }
      }
    )
  }

  const updateItemInCache = (
    id: string | number,
    updater: (item: Entity) => Entity
  ) => {
    queryClient.setQueryData<InfiniteFindAllResult<Entity>>(
      finalQueryKey,
      (old) => {
        if (!old) return old

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((item) =>
              item.id === id ? updater(item) : item
            ),
          })),
        }
      }
    )
  }

  const removeItemInCache = (id: string | number) => {
    queryClient.setQueryData<InfiniteFindAllResult<Entity>>(
      finalQueryKey,
      (old) => {
        if (!old) return old

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((item) => item.id !== id),
          })),
        }
      }
    )
  }

  const emptyCache = () => {
    queryClient.setQueryData(finalQueryKey, {
      pages: [],
      pageParams: [],
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

export default useInfiniteFindAll
