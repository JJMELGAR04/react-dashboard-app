import { appSettings } from '@/AppSettings'
import { queryClient } from '@/lib/queryClient'
import errorResponse from '@/utils/errorResponse'
import axios, { type AxiosInstance } from 'axios'

export const axiosInstance = ({
  origin,
  initPath,
}: {
  origin: string
  initPath: string
}): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${origin}/${initPath}`,
    timeout: 100000,
  })

  instance.interceptors.request.use((config) => {
    const token = appSettings.token

    if (token) config.headers.Authorization = `Bearer ${token}`

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status

      if (status === 401) {
        appSettings.removeToken()
        queryClient.setQueryData(['session'], null)
        // queryClient.clear()
        window.location.href = '/login'
      }

      errorResponse({ error })

      return Promise.reject(error)
    }
  )

  return instance
}
