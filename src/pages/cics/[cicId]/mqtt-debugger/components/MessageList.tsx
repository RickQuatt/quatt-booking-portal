import { useState, useEffect, useRef } from "react";
import { MqttDebugMessage } from "../hooks/useMqttDebugStream";
import { MessageDetail } from "./MessageDetail";
import { formatBytes } from "@/utils/formatBytes";
import { Button } from "@/components/ui/Button";
import { ChevronDown, ChevronUp, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";

interface MessageListProps {
  messages: MqttDebugMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop } = containerRef.current;

    if (scrollTop > 100) {
      setAutoScroll(false);
    } else if (scrollTop === 0) {
      setAutoScroll(true);
    }
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessageId((prev) => (prev === messageId ? null : messageId));
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return timestamp;
    }
  };

  const getDirectionInfo = (direction: "to_cloud" | "from_cloud") => {
    return direction === "to_cloud"
      ? {
          icon: "⬆️",
          label: "To Cloud",
          className:
            "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
        }
      : {
          icon: "⬇️",
          label: "From Cloud",
          className:
            "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
        };
  };

  if (messages.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-dark-foreground">
        <p className="text-gray-500 dark:text-gray-400">
          No messages yet. Start streaming to see MQTT messages.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-dark-foreground">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Messages ({messages.length})
          </h3>
          {!autoScroll && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                setAutoScroll(true);
              }}
              className="gap-2"
            >
              <ArrowUp className="h-3 w-3" />
              Scroll to latest
            </Button>
          )}
        </div>

        {/* Direction Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
            <span>⬆️</span>
            <span>To Cloud</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
            <span>⬇️</span>
            <span>From Cloud</span>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div
        ref={containerRef}
        className="max-h-[600px] space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
        onScroll={handleScroll}
      >
        {messages.map((message) => {
          const directionInfo = getDirectionInfo(message.direction);
          const isExpanded = expandedMessageId === message.id;

          return (
            <div
              key={message.id}
              className={cn(
                "overflow-hidden rounded-lg border transition-all",
                directionInfo.className,
                message.isError &&
                  "border-red-300 bg-red-100 dark:border-red-700 dark:bg-red-950",
              )}
            >
              <button
                onClick={() => toggleMessageExpansion(message.id)}
                className="w-full p-3 text-left transition-colors hover:opacity-80"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-1 flex-wrap items-center gap-2 text-xs">
                    <span className="text-base">{directionInfo.icon}</span>
                    <span className="font-mono text-gray-600 dark:text-gray-400">
                      [{formatTimestamp(message.timestamp)}]
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {directionInfo.label}
                    </Badge>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatBytes(message.messageSize || 0)}
                    </span>
                    <span className="break-all font-mono text-xs text-gray-900 dark:text-gray-100">
                      {message.topic}
                    </span>
                    {message.isError && (
                      <Badge variant="destructive" className="text-xs">
                        ERROR
                      </Badge>
                    )}
                  </div>
                  <div className="shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && <MessageDetail message={message} />}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-dark-foreground">
        <Switch
          id="auto-scroll"
          checked={autoScroll}
          onCheckedChange={setAutoScroll}
        />
        <label
          htmlFor="auto-scroll"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          Auto-scroll to latest messages
        </label>
      </div>
    </div>
  );
}
