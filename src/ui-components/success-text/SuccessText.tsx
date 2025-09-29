import classes from "./SuccessText.module.css";

interface SuccessTextProps {
  text: string;
  onDismiss?: () => void;
}

function SuccessText({ text, onDismiss }: SuccessTextProps) {
  return (
    <div className={classes["success-text-container"]}>
      <p>{text}</p>
      {onDismiss && (
        <button className={classes["success-close"]} onClick={onDismiss}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default SuccessText;
