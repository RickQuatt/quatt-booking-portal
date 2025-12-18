import { useState, useEffect, useRef, useCallback } from "react";
import { auth } from "@/firebase";

export interface MqttDebugMessage {
  id: string;
  direction: "to_cloud" | "from_cloud";
  cicId: string;
  topic: string;
  payload: unknown;
  timestamp: string;
  isError?: boolean;
  errorDetails?: string;
  messageSize?: number;
}

export interface SSEMessage {
  type: "connection" | "mqtt-debug" | "heartbeat" | "error";
  message?: string;
  timestamp: string;
  data?: {
    direction: "to_cloud" | "from_cloud";
    cicId: string;
    topic: string;
    payload: unknown;
    timestamp: string;
    isError?: boolean;
    errorDetails?: string;
    messageSize?: number;
  };
}

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

interface UseMqttDebugStreamOptions {
  cicId: string;
  enabled?: boolean;
}

interface UseMqttDebugStreamReturn {
  messages: MqttDebugMessage[];
  connectionStatus: ConnectionStatus;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  clearMessages: () => void;
}

const MAX_MESSAGES = 1000;

export function useMqttDebugStream({
  cicId,
  enabled = false,
}: UseMqttDebugStreamOptions): UseMqttDebugStreamReturn {
  const [messages, setMessages] = useState<MqttDebugMessage[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<{ close: () => void | Promise<void> } | null>(
    null,
  );
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageIdCounter = useRef(0);
  const isStreamActiveRef = useRef(false);

  const addMessage = useCallback((message: MqttDebugMessage) => {
    setMessages((prev) => {
      const newMessages = [message, ...prev];
      return newMessages.slice(0, MAX_MESSAGES);
    });
  }, []);

  const connect = useCallback(async () => {
    if (eventSourceRef.current || !cicId) return;

    try {
      setConnectionStatus("connecting");
      setError(null);

      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const baseUrl = import.meta.env.VITE_API_BASE_PATH as string;
      const url = `${baseUrl}/admin/mqtt-debug/stream?cicId=${encodeURIComponent(cicId)}`;

      // Use fetch with ReadableStream for SSE with authentication
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      setConnectionStatus("connected");
      setError(null);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      isStreamActiveRef.current = true;

      eventSourceRef.current = {
        close: () => {
          isStreamActiveRef.current = false;
          return reader.cancel();
        },
      };

      let buffer = "";

      const readStream = async () => {
        try {
          while (isStreamActiveRef.current) {
            let readResult;
            try {
              readResult = await reader.read();
            } catch (readError) {
              if (!isStreamActiveRef.current) {
                break;
              }
              throw readError;
            }

            const { done, value } = readResult;
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = line.slice(6);
                  if (data.trim() === "") continue;

                  const sseMessage: SSEMessage = JSON.parse(data);

                  if (sseMessage.type === "mqtt-debug" && sseMessage.data) {
                    const message: MqttDebugMessage = {
                      id: `${++messageIdCounter.current}`,
                      direction: sseMessage.data.direction,
                      cicId: sseMessage.data.cicId,
                      topic: sseMessage.data.topic,
                      payload: sseMessage.data.payload,
                      timestamp: sseMessage.data.timestamp,
                      isError: sseMessage.data.isError,
                      errorDetails: sseMessage.data.errorDetails,
                      messageSize: sseMessage.data.messageSize,
                    };
                    addMessage(message);
                  } else if (sseMessage.type === "error") {
                    setError(sseMessage.message || "Unknown error occurred");
                  }
                } catch (parseError) {
                  console.error("Failed to parse SSE message:", parseError);
                }
              }
            }
          }
        } catch (streamError) {
          if (!isStreamActiveRef.current) return;

          console.error("Stream reading error:", streamError);

          let errorMessage = "Connection lost. Retrying...";
          if (
            streamError instanceof TypeError &&
            streamError.message.includes("Load failed")
          ) {
            errorMessage = "Network connection failed. Retrying...";
          } else if (
            streamError instanceof DOMException &&
            streamError.name === "AbortError"
          ) {
            errorMessage = "Connection aborted. Retrying...";
          }

          setConnectionStatus("error");
          setError(errorMessage);

          if (eventSourceRef.current) {
            try {
              await eventSourceRef.current.close();
            } catch (closeError) {
              console.debug("Error closing stream:", closeError);
            }
            eventSourceRef.current = null;
          }

          if (enabled && isStreamActiveRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, 3000);
          }
        }
      };

      readStream();
    } catch (err) {
      setConnectionStatus("error");

      let errorMessage = "Failed to connect";
      if (err instanceof TypeError && err.message.includes("Load failed")) {
        errorMessage = "Network error - please check your connection";
      } else if (err instanceof DOMException && err.name === "AbortError") {
        errorMessage = "Connection timeout - server may be unavailable";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      eventSourceRef.current = null;
    }
  }, [cicId, enabled, addMessage]);

  const disconnect = useCallback(async () => {
    isStreamActiveRef.current = false;

    if (eventSourceRef.current) {
      try {
        await eventSourceRef.current.close();
      } catch (closeError) {
        console.debug("Stream close error (ignored):", closeError);
      }
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setConnectionStatus("disconnected");
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    if (enabled && connectionStatus === "disconnected") {
      connect();
    } else if (!enabled && connectionStatus !== "disconnected") {
      disconnect();
    }
  }, [enabled, connect, disconnect, connectionStatus]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    messages,
    connectionStatus,
    error,
    connect,
    disconnect,
    clearMessages,
  };
}
