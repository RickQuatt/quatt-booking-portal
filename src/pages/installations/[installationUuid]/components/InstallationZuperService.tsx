import type { components } from "@/openapi-client/types/api/v1";
import { $api } from "@/openapi-client/context";
import { ErrorText } from "@/components/shared/ErrorText";
import { CardContainer } from "@/components/shared/DetailPage";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/utils/formatDate";
import { ExternalLink } from "lucide-react";

type ZuperService = components["schemas"]["ZuperService"];

export interface InstallationZuperServiceProps {
  installationId: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

/**
 * Installation Zuper Service Component
 * Displays Zuper service jobs with clickable cards
 */
export function InstallationZuperService({
  installationId,
  isEnabled,
  onToggle,
}: InstallationZuperServiceProps) {
  const {
    data: zuperData,
    error,
    isPending,
    refetch,
  } = $api.useQuery(
    "get",
    "/admin/installation/{installationId}/zuper/jobs",
    {
      params: {
        path: { installationId },
      },
    },
    { enabled: isEnabled },
  );

  const services = zuperData?.result?.services || [];

  const toggleButton = (
    <Button
      size="sm"
      variant="outline"
      onClick={(e) => {
        e.stopPropagation();
        onToggle(!isEnabled);
      }}
    >
      {isEnabled ? "Hide" : "Show"}
    </Button>
  );

  const renderContent = () => {
    if (!isEnabled) {
      return (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          Click "Show" to load Zuper services
        </div>
      );
    }

    if (isPending) {
      return (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          Loading Zuper services...
        </div>
      );
    }

    if (error) {
      return (
        <ErrorText
          text="Failed to fetch Zuper services for the installation."
          retry={() => refetch() as unknown as Promise<void>}
        />
      );
    }

    if (services.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          No services 👍
        </div>
      );
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((service) => (
          <a
            key={service.job_uid}
            href={`https://app.zuperpro.com/jobs/${service.job_uid}/details`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-orange-400 hover:shadow-md dark:border-gray-700 dark:bg-dark-foreground dark:hover:border-orange-500"
          >
            {/* External link icon */}
            <ExternalLink className="absolute right-3 top-3 h-4 w-4 text-gray-400 transition-colors group-hover:text-orange-500" />

            {/* Job title */}
            <h4 className="mb-3 pr-6 font-semibold text-gray-900 dark:text-gray-100">
              {service.job_title}
            </h4>

            {/* Job details */}
            <div className="space-y-1 text-sm">
              <div className="flex items-start justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Installer:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {service.installer || "N/A"}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Status:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {service.status_name}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Category:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {service.job_category_name}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Updated:
                </span>
                <span className="text-xs italic text-gray-500 dark:text-gray-400">
                  {formatDateTime(new Date(service.updated_at))}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    );
  };

  return (
    <CardContainer title="Zuper Services" headerAction={toggleButton}>
      {renderContent()}
    </CardContainer>
  );
}
