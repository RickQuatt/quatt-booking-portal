import { useCallback, useState } from "react";
import { formatDateTime } from "../utils/formatDate";
import classes from "./InstallationDetail.module.css";
import { Loader } from "../ui-components/loader/Loader";
import { FormField, FormSection } from "../ui-components/form/Form";
import { DetailSectionHeader } from "../cic-detail/CICDetailSectionHeader";
import ErrorText from "../ui-components/error-text/ErrorText";
import { useGetInstallationEvents } from "./hooks/useGetInstallationEvents";
import { getEventTypeEmoji } from "./utils/eventTypeMapping";

interface InstallationDetailEventsProps {
  installationUuid: string;
}

const TRUNCATE_THRESHOLD = 150; // characters

export function InstallationDetailEvents({
  installationUuid,
}: InstallationDetailEventsProps) {
  const { events, eventsError, isLoadingEvents, refetchEvents } =
    useGetInstallationEvents(installationUuid);
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(
    new Set(),
  );

  const handleEventClick = useCallback((url: string | null | undefined) => {
    if (url && (url.startsWith("https://") || url.startsWith("http://"))) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  const toggleExpand = useCallback((eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedEventIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  }, []);

  if (eventsError) {
    return (
      <ErrorText
        text="Failed to fetch events for the installation."
        retry={refetchEvents}
      />
    );
  }

  return (
    <div className={classes["detail-section"]}>
      <DetailSectionHeader title="📋 Events" />
      <FormSection>
        <FormField>
          <div className={classes["detail-section-api-cards"]}>
            {isLoadingEvents ? (
              <Loader />
            ) : (
              <>
                {events &&
                  events.map((event) => {
                    const isExpanded = expandedEventIds.has(event.eventId);
                    const shouldTruncate =
                      event.text.length > TRUNCATE_THRESHOLD;

                    return (
                      <div
                        style={{
                          cursor: event.url ? "pointer" : "default",
                        }}
                        className={classes["event-card"]}
                        key={event.eventId}
                        onClick={() => handleEventClick(event.url)}
                      >
                        <div className={classes["detail-section-bold"]}>
                          {getEventTypeEmoji(event.eventType)} {event.title}
                        </div>
                        <div
                          className={classes["event-date"]}
                        >{`Created: ${formatDateTime(event.createTime)}`}</div>
                        {event.closeTime && (
                          <div
                            className={classes["event-date"]}
                          >{`Closed: ${formatDateTime(event.closeTime)}`}</div>
                        )}
                        <div
                          className={`${classes["event-text"]} ${
                            shouldTruncate && !isExpanded
                              ? classes["event-text-truncated"]
                              : classes["event-text-expanded"]
                          }`}
                        >
                          {event.text}
                        </div>
                        {shouldTruncate && (
                          <button
                            className={classes["event-expand-button"]}
                            onClick={(e) => toggleExpand(event.eventId, e)}
                          >
                            {isExpanded ? "Show less" : "Show more"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                {events && events.length === 0 && (
                  <div className={classes["empty-state"]}>No events 👍</div>
                )}
              </>
            )}
          </div>
        </FormField>
      </FormSection>
    </div>
  );
}
