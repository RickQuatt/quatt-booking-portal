import { $api } from "@/openapi-client/context";
import type { components } from "@/openapi-client/types/api/v1";

type EventType = components["schemas"]["EventType"];

export function useInstallationEvents(
  installationUuid: string,
  eventType?: EventType,
) {
  const {
    data: eventsData,
    error: eventsError,
    isPending: isLoadingEvents,
    refetch,
  } = $api.useQuery("get", "/admin/installation/{installationUuid}/events", {
    params: {
      path: { installationUuid },
      query: eventType ? { eventType } : undefined,
    },
  });

  return {
    events: eventsData?.result,
    eventsError,
    isLoadingEvents,
    refetchEvents: () => refetch() as any,
  };
}
