import { Button } from "@/components/ui/Button";

export interface ErrorTextProps {
  text: string;
  retry?: () => void;
}

export function ErrorText({ text, retry }: ErrorTextProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-red-600 dark:text-red-400">{text}</p>
      {retry && (
        <Button variant="outline" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export default ErrorText;
