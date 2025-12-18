import { Loader } from "@/components/shared/Loader";
import { ErrorText } from "@/components/shared/ErrorText";
import { useGetInstallationDetails } from "./hooks/useGetInstallationDetails";
import { InstallationDetailPage } from "./page";

interface InstallationDetailWrapperProps {
  installationUuid: string;
}

/**
 * Wrapper component that handles data fetching for Installation detail page
 */
export function InstallationDetailWrapper({
  installationUuid,
}: InstallationDetailWrapperProps) {
  const {
    installationDetails,
    installationDetailsError,
    isLoadingInstallationDetails,
    refetchInstallationDetails,
  } = useGetInstallationDetails(installationUuid);

  if (isLoadingInstallationDetails) {
    return <Loader />;
  }

  if (!installationDetails || installationDetailsError) {
    const errorDescription = `Failed to fetch installation details for installationUuid ${installationUuid}.`;

    return (
      <ErrorText
        text={errorDescription}
        retry={() => refetchInstallationDetails()}
      />
    );
  }

  return (
    <InstallationDetailPage
      installation={installationDetails}
      installationUuid={installationUuid}
      isLoading={false}
    />
  );
}
