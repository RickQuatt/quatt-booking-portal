import { $api } from "@/openapi-client/context";

export function useGetInstallationDetails(installationUuid: string) {
  const {
    data: installationDetailsData,
    error: installationDetailsError,
    isPending: isLoadingInstallationDetails,
    refetch: refetchInstallationDetails,
  } = $api.useQuery("get", "/admin/installation/{installationUuid}", {
    params: {
      path: { installationUuid },
    },
  });

  return {
    installationDetails: installationDetailsData?.result,
    installationDetailsError,
    isLoadingInstallationDetails,
    refetchInstallationDetails,
  };
}
