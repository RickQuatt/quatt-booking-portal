import React from 'react'

import { SupportDashboardApi } from "./apis/SupportDashboardApi";
import { Configuration } from './runtime';
import { useContextWithCheck } from '../utils/useContextWithCheck';

const ApiClientContext = React.createContext<SupportDashboardApi | undefined>(undefined)

type ProviderProps = React.PropsWithChildren<{ token: string }>

export const ApiClientProvider = ({ children, token }: ProviderProps) => {
  const [apiClient] = React.useState(() => {
    return new SupportDashboardApi(
      new Configuration({
        basePath: "http://localhost:3500/api/v1",
        accessToken: token
      })
    )
  })

  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  )
}

export const useApiClient = () => {
  return useContextWithCheck(ApiClientContext)
}