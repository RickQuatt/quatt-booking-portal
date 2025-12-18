import type { components } from "@/openapi-client/types/api/v1";
import { $api } from "@/openapi-client/context";
import { formatDateTime } from "@/utils/formatDate";
import { Loader } from "@/components/shared/Loader";
import { ErrorText } from "@/components/shared/ErrorText";
import { ExternalLink } from "lucide-react";

type Ticket = components["schemas"]["Ticket"];

export interface InstallationTicketsProps {
  installationId: string;
}

/**
 * Get formatted ticket owner name from hubspot_owner_id
 */
const getTicketOwner = (ticket: Ticket): string => {
  const ticketOwner = [
    ticket.hubspot_owner_id.firstname,
    ticket.hubspot_owner_id.lastname,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return ticketOwner || "Missing owner";
};

/**
 * Installation Tickets Component
 * Displays Hubspot tickets for the installation with click-through to Hubspot
 */
export function InstallationTickets({
  installationId,
}: InstallationTicketsProps) {
  const {
    data: hubspotData,
    error,
    isPending,
    refetch,
  } = $api.useQuery("get", "/admin/installation/{installationId}/hubspot", {
    params: {
      path: { installationId },
    },
  });

  const hubspotTickets = hubspotData?.result;

  if (error) {
    return (
      <ErrorText
        text="Failed to fetch Hubspot tickets for the installation."
        retry={() => refetch() as any}
      />
    );
  }

  if (isPending) {
    return <Loader />;
  }

  if (!hubspotTickets || hubspotTickets.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        No tickets 👍
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hubspotTickets.map((ticket) => (
        <div
          key={ticket.hs_object_id}
          className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-orange-400 hover:shadow-md dark:border-gray-700 dark:bg-dark-foreground dark:hover:border-orange-500"
          onClick={() =>
            window.open(
              `https://app-eu1.hubspot.com/contacts/25848718/record/0-5/${ticket.hs_object_id}`,
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {ticket.subject}
                </div>
                <ExternalLink className="mt-1 h-3 w-3 flex-shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">Owner:</span>{" "}
                  {getTicketOwner(ticket)}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  {ticket.hs_pipeline_stage.label || "Unknown"}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {formatDateTime(new Date(ticket.createdate))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
