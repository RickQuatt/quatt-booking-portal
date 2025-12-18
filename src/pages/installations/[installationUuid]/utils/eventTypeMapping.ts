import type { components } from "@/openapi-client/types/api/v1";

type EventType = components["schemas"]["EventType"];

interface EventTypeConfig {
  value: EventType;
  emoji: string;
  label: string;
}

// Centralized configuration for event types with emojis and labels
export const EVENT_TYPE_CONFIG: EventTypeConfig[] = [
  { value: "EVENT_EMAIL", emoji: "📧", label: "Email" },
  { value: "EVENT_SETTING_CHANGE", emoji: "⚙️", label: "Setting Change" },
  { value: "EVENT_HUBSPOT_TICKET", emoji: "🎫", label: "Hubspot Ticket" },
  { value: "EVENT_NOTE", emoji: "📝", label: "Note" },
  { value: "EVENT_JOB", emoji: "🔧", label: "Job" },
  { value: "EVENT_SKEDULO", emoji: "📅", label: "Skedulo" },
  { value: "EVENT_ZENDESK_TICKET", emoji: "🎟️", label: "Zendesk Ticket" },
];

const eventTypeToEmoji = EVENT_TYPE_CONFIG.reduce(
  (acc, config) => {
    acc[config.value] = config.emoji;
    return acc;
  },
  {} as Record<EventType, string>,
);

/**
 * Utility function to map event types to corresponding emojis for events in the installation detail view.
 */
export const getEventTypeEmoji = (eventType: EventType): string => {
  return eventTypeToEmoji[eventType] ?? "📋";
};
