import { useState, useEffect } from 'react'
import { auth, signinWithGoogle } from './firebase';
import { User } from 'firebase/auth';
import { Route } from 'wouter'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'

import classes from './App.module.css'
import quattSvg from './assets/quatt.svg'
import { CICList } from './cic-list/CICList';
import { CICDetail } from './cic-detail/CICDetail';
import { ApiClientProvider, useApiClient } from './api-client/context';

const queryClient = new QueryClient()

function App() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    auth.onAuthStateChanged(async user => {
      if (user) {
        const token = await user.getIdToken()
        setUser(user);
        setToken(token)
      }
      setLoading(false)
    })
  }, [])

  if (loading) return null

  return (
    <QueryClientProvider client={queryClient}>
      {(!user || !token) ? (
        <button onClick={signinWithGoogle}>Authenticate</button>
      ) : (
        <ApiClientProvider token={token}>
          {/* <img
            src={quattSvg}
            alt="Quatt"
            className={classes['main-logo']}
          /> */}
          <Route path="/">
            <CICListRenderer />
          </Route>
          <Route path="/:cicId">
            {(params) => {
              return (
                <CICDetailRenderer cicId={params.cicId} />
              )
            }}
          </Route>
        </ApiClientProvider>
      )}
    </QueryClientProvider>
  )
}

const CICDetailRenderer = ({
  cicId
}: {
  cicId: string
}) => {
  const apiClient = useApiClient()
  const { data, status, error } = useQuery(["cicDetail", cicId], () => {
    return apiClient.adminGetCic({ cicId })
  });


  // TODO: Render a spinner and handle errors - 2023-06-19
  if (status !== 'success') return null

  return (
    <CICDetail cicId={cicId} data={data.result} />
  )
}

const CICListRenderer = () => {
  const apiClient = useApiClient()
  const { data, status, error } = useQuery("cicList", () => {
    return apiClient.adminListCics()
  });

  // TODO: Render a spinner and handle errors - 2023-06-19
  if (status !== 'success') return null

  return (
    <CICList data={data.result} />
  )
}

export default App
