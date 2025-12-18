import { createContext, useContext, type ReactNode } from "react";
import client from "./client";

const OpenApiClientContext = createContext(client);

export interface OpenApiClientProviderProps {
  children: ReactNode;
}

export const OpenApiClientProvider = ({
  children,
}: OpenApiClientProviderProps) => {
  return (
    <OpenApiClientContext.Provider value={client}>
      {children}
    </OpenApiClientContext.Provider>
  );
};

export const useOpenApiClient = () => {
  const context = useContext(OpenApiClientContext);
  if (!context) {
    throw new Error(
      "useOpenApiClient must be used within OpenApiClientProvider",
    );
  }
  return context;
};

// Export the client directly for convenience
export { client as $api };
