import { ConnectionStatus as ConnectionStatusType } from "../hooks/useMqttDebugStream";
import { Badge } from "@/components/ui/Badge";

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  error?: string | null;
}

export function ConnectionStatus({ status, error }: ConnectionStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "connected":
        return {
          variant: "success" as const,
          text: "Connected",
          icon: "🟢",
        };
      case "connecting":
        return {
          variant: "default" as const,
          text: "Connecting...",
          icon: "🟡",
        };
      case "error":
        return {
          variant: "destructive" as const,
          text: "Error",
          icon: "🔴",
        };
      case "disconnected":
      default:
        return {
          variant: "secondary" as const,
          text: "Disconnected",
          icon: "⚪",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex items-center gap-3">
      <Badge variant={statusInfo.variant} className="gap-1.5">
        <span>{statusInfo.icon}</span>
        <span>{statusInfo.text}</span>
      </Badge>
      {error && status === "error" && (
        <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
      )}
    </div>
  );
}
