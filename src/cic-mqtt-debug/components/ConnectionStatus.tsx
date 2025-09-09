import { ConnectionStatus as ConnectionStatusType } from "../hooks/useMqttDebugStream";
import classes from "./ConnectionStatus.module.css";

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  error?: string | null;
}

export function ConnectionStatus({ status, error }: ConnectionStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "connected":
        return {
          className: classes.connected,
          text: "Connected",
          icon: "🟢",
        };
      case "connecting":
        return {
          className: classes.connecting,
          text: "Connecting...",
          icon: "🟡",
        };
      case "error":
        return {
          className: classes.error,
          text: "Error",
          icon: "🔴",
        };
      case "disconnected":
      default:
        return {
          className: classes.disconnected,
          text: "Disconnected",
          icon: "⚪",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`${classes.status} ${statusInfo.className}`}>
      <span className={classes.icon}>{statusInfo.icon}</span>
      <span className={classes.text}>{statusInfo.text}</span>
      {error && status === "error" && (
        <span className={classes.errorText}>{error}</span>
      )}
    </div>
  );
}
