import { Button } from "../../ui-components/button/Button";
import classes from "./MqttControls.module.css";

interface MqttControlsProps {
  isStreaming: boolean;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  messageCount: number;
}

export function MqttControls({
  isStreaming,
  onStart,
  onStop,
  onClear,
  messageCount,
}: MqttControlsProps) {
  return (
    <div className={classes.controls}>
      <div className={classes.streamControls}>
        {!isStreaming ? (
          <Button onClick={onStart} className={classes.startButton}>
            ▶️ Start Streaming
          </Button>
        ) : (
          <Button onClick={onStop} className={classes.stopButton}>
            ⏹️ Stop Streaming
          </Button>
        )}
      </div>

      <div className={classes.messageActions}>
        <span className={classes.messageCount}>
          {messageCount} message{messageCount !== 1 ? "s" : ""}
        </span>
        {messageCount > 0 && (
          <Button
            onClick={onClear}
            className={classes.clearButton}
            color="danger"
          >
            🗑️ Clear Messages
          </Button>
        )}
      </div>
    </div>
  );
}
