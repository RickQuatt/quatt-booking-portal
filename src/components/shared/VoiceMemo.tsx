import { useState, useRef, useCallback } from "react";

interface VoiceMemoProps {
  companyId: string;
  partnerName: string;
  onComplete?: (audioBlob: Blob, duration: number) => void;
}

export function VoiceMemo({
  companyId,
  partnerName,
  onComplete,
}: VoiceMemoProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "recording" | "done" | "sending" | "sent"
  >("idle");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStatus("done");
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setStatus("recording");
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      setStatus("idle");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isRecording]);

  const sendMemo = useCallback(async () => {
    if (chunksRef.current.length === 0) return;
    setStatus("sending");

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });

    try {
      const formData = new FormData();
      formData.append("audio", blob, `memo-${companyId}-${Date.now()}.webm`);
      formData.append("companyId", companyId);
      formData.append("partnerName", partnerName);

      const res = await fetch("/api/voice-memo", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");

      setStatus("sent");
      onComplete?.(blob, duration);
    } catch {
      setStatus("done");
    }
  }, [companyId, partnerName, duration, onComplete]);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);
    setStatus("idle");
    chunksRef.current = [];
  }, [audioUrl]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="bg-white rounded-[14px] p-4 border border-quatt-border-light">
      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 tracking-[-0.04em]">
        <svg
          className="w-4 h-4 text-quatt-orange"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
          />
        </svg>
        Spraakmemo
      </h3>
      <p className="text-[10px] text-quatt-text-secondary mb-3">
        Spreek in wat je met {partnerName} hebt besproken. Wall-e verwerkt het
        automatisch.
      </p>

      {status === "idle" && (
        <button
          onClick={startRecording}
          className="w-full bg-quatt-orange text-white rounded-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 15.75a3 3 0 0 0 3-3V4.5a3 3 0 1 0-6 0v8.25a3 3 0 0 0 3 3Z" />
            <path d="M6.75 11.25a.75.75 0 0 0-1.5 0v1.5a6.751 6.751 0 0 0 6 6.709v2.291h-3a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-3v-2.291a6.751 6.751 0 0 0 6-6.709v-1.5a.75.75 0 0 0-1.5 0v1.5a5.25 5.25 0 1 1-10.5 0v-1.5Z" />
          </svg>
          Opnemen
        </button>
      )}

      {status === "recording" && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-3 h-3 bg-quatt-error-text rounded-full animate-pulse" />
            <span className="text-lg font-bold text-quatt-error-text">
              {formatTime(duration)}
            </span>
          </div>
          <button
            onClick={stopRecording}
            className="w-full bg-quatt-error-text text-white rounded-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z"
                clipRule="evenodd"
              />
            </svg>
            Stop ({formatTime(duration)})
          </button>
        </div>
      )}

      {status === "done" && audioUrl && (
        <div>
          <audio src={audioUrl} controls className="w-full mb-3 h-10" />
          <div className="flex gap-2">
            <button
              onClick={sendMemo}
              className="flex-1 bg-quatt-green text-white rounded-full py-2.5 text-sm font-semibold"
            >
              Verstuur naar Wall-e
            </button>
            <button
              onClick={reset}
              className="bg-quatt-grey text-quatt-text-secondary rounded-full py-2.5 px-4 text-sm font-medium"
            >
              Opnieuw
            </button>
          </div>
        </div>
      )}

      {status === "sending" && (
        <div className="text-center py-3">
          <div className="w-6 h-6 border-2 border-quatt-orange border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-quatt-text-secondary">
            Verstuurd naar Wall-e voor verwerking...
          </p>
        </div>
      )}

      {status === "sent" && (
        <div className="text-center py-3">
          <svg
            className="w-8 h-8 text-quatt-green mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <p className="text-sm font-semibold text-quatt-green">Verzonden!</p>
          <p className="text-[10px] text-quatt-text-secondary mt-1">
            Wall-e verwerkt je memo en updatet HubSpot automatisch.
          </p>
          <button
            onClick={reset}
            className="mt-2 text-xs text-quatt-text-secondary underline"
          >
            Nieuwe memo opnemen
          </button>
        </div>
      )}
    </div>
  );
}
