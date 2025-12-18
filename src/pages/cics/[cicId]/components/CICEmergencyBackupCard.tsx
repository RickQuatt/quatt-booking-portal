import { useEffect, useState, useCallback, useRef } from "react";
import type { components } from "@/openapi-client/types/api/v1";
import { useQueryClient } from "@tanstack/react-query";
import { CardContainer } from "@/components/shared/DetailPage";
import { Button } from "@/components/ui/Button";
import { $api } from "@/openapi-client/context";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type AdminCic = components["schemas"]["AdminCic"];

const TIMEOUT_DURATION = 30000; // 30 seconds
const POLL_INTERVAL = 2000; // 2 seconds

export interface CICEmergencyBackupCardProps {
  cicData: AdminCic;
}

/**
 * Emergency Backup Heating card with 3D flip safety cover animation
 * Only rendered for All-E installations
 */
export function CICEmergencyBackupCard({
  cicData,
}: CICEmergencyBackupCardProps) {
  const queryClient = useQueryClient();
  const cicDataRef = useRef(cicData);
  cicDataRef.current = cicData;
  const emergencyBackupHeaterEnabled =
    cicData.allEStatus?.emergencyBackupHeaterEnabled ?? false;

  const [isCoverOpen, setIsCoverOpen] = useState(emergencyBackupHeaterEnabled);
  const [isPressed, setIsPressed] = useState(emergencyBackupHeaterEnabled);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingMessage, setPollingMessage] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  // Sync state when external data changes
  useEffect(() => {
    setIsCoverOpen(emergencyBackupHeaterEnabled);
    setIsPressed(emergencyBackupHeaterEnabled);
  }, [emergencyBackupHeaterEnabled]);

  const updateCicMutation = $api.useMutation("put", "/admin/cic/{cicId}");

  const pollForStateChange = useCallback(
    async (expectedState: boolean) => {
      const startTime = Date.now();

      const checkStatus = async () => {
        if (Date.now() - startTime > TIMEOUT_DURATION) {
          toast.error(
            `Polling to verify ${expectedState ? "enabling" : "disabling"} of emergency backup heating timed out after 30 seconds`,
          );
          setIsPolling(false);
          setIsDisabled(false);
          // Reset visual state to match actual state
          setIsCoverOpen(emergencyBackupHeaterEnabled);
          setIsPressed(emergencyBackupHeaterEnabled);
          return;
        }

        // Invalidate and refetch the CIC data
        await queryClient.invalidateQueries({
          queryKey: ["get", "/admin/cic/{cicId}"],
        });

        const currentState =
          cicDataRef.current?.allEStatus?.emergencyBackupHeaterEnabled;
        console.log({ currentState });

        if (currentState === expectedState) {
          setIsPolling(false);
          setIsDisabled(false);
          setIsPressed(expectedState);
          setIsCoverOpen(expectedState);
          toast.success(
            `Emergency backup heating ${expectedState ? "enabled" : "disabled"} successfully`,
          );
        } else {
          // Continue polling
          setTimeout(checkStatus, POLL_INTERVAL);
        }
      };

      await checkStatus();
    },
    [cicData, emergencyBackupHeaterEnabled, queryClient],
  );

  const handleToggleCover = () => {
    if (!isPolling && !isDisabled) {
      setIsCoverOpen(!isCoverOpen);
      if (isPressed && !emergencyBackupHeaterEnabled) {
        setIsPressed(false);
      }
    }
  };

  const handleButtonPress = async () => {
    if (!isCoverOpen || isPressed || isDisabled || isPolling) return;

    setIsDisabled(true);
    setIsPolling(true);
    setPollingMessage("Waiting for emergency backup heating to enable...");
    setIsPressed(true);

    try {
      await updateCicMutation.mutateAsync({
        params: { path: { cicId: cicData.id } },
        body: { setAllEEmergencyBackupHeaterState: "on" },
      });

      // Start polling for confirmation
      await pollForStateChange(true);
    } catch {
      toast.error("Failed to enable emergency backup heating");
      setIsPolling(false);
      setIsDisabled(false);
      setIsPressed(false);
    }
  };

  const handleDisable = async () => {
    if (isDisabled || isPolling) return;

    setIsDisabled(true);
    setIsPolling(true);
    setPollingMessage("Waiting for emergency backup heating to disable...");

    try {
      await updateCicMutation.mutateAsync({
        params: { path: { cicId: cicData.id } },
        body: { setAllEEmergencyBackupHeaterState: "off" },
      });

      // Start polling for confirmation
      await pollForStateChange(false);
    } catch {
      toast.error("Failed to disable emergency backup heating");
      setIsPolling(false);
      setIsDisabled(false);
    }
  };

  const label = emergencyBackupHeaterEnabled
    ? "Emergency Backup Heating Enabled"
    : "Emergency Backup Heating Disabled";

  console.log({ status: cicData?.allEStatus?.emergencyBackupHeaterEnabled });
  return (
    <CardContainer title="Emergency Backup Heating">
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Header */}
        <h2 className="text-center text-2xl font-bold text-red-600 dark:text-red-500">
          {label}
        </h2>

        {/* 3D Button Container */}
        <div className="relative w-full max-w-64 h-64 flex items-center justify-center [perspective:500px]">
          {/* Base Platform */}
          <div className="absolute w-[90%] h-56 bg-gray-800 rounded-md shadow-lg -translate-y-2" />

          {/* Hazard Stripes Border */}
          <div
            className="absolute w-[80%] h-48 rounded-md shadow-xl flex items-center justify-center -translate-y-4"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #000 10px, #000 20px)",
            }}
          >
            {/* Emergency Button */}
            <button
              className={cn(
                "w-[90%] h-40 bg-red-600 rounded-md flex items-center justify-center",
                "text-white font-bold text-xl shadow-lg transition-all duration-100",
                "focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2",
                !isCoverOpen || isDisabled
                  ? "cursor-not-allowed opacity-90"
                  : "cursor-pointer active:translate-y-1 active:bg-red-800 active:shadow-inner",
                isPressed && "translate-y-2 bg-red-800 shadow-inner",
              )}
              onClick={handleButtonPress}
              disabled={!isCoverOpen || isDisabled}
              aria-label="Enable emergency backup heating"
            >
              <span className="text-center px-2">
                Enable Emergency Backup Heating
              </span>
            </button>
          </div>

          {/* Safety Cover */}
          <div
            className={cn(
              "absolute w-[82%] h-[200px] bg-transparent border-4 border-gray-400 rounded-md",
              "flex items-center justify-center z-10 -translate-y-3",
              "transition-transform duration-500 ease-in-out",
              "backdrop-blur-sm shadow-[0_0_10px_rgba(255,255,255,0.3)]",
              "[transform-origin:top_center] [transform-style:preserve-3d] [backface-visibility:visible]",
              isPolling || isDisabled ? "cursor-not-allowed" : "cursor-pointer",
              isCoverOpen && "[transform:rotateX(85deg)]",
            )}
            onClick={handleToggleCover}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggleCover();
              }
            }}
            aria-label={
              isCoverOpen ? "Close safety cover" : "Open safety cover"
            }
          >
            {/* Hinge mechanism */}
            <div className="absolute -top-2 left-[30px] right-[30px] h-3 bg-gray-500 rounded-t-md shadow-[0_-2px_4px_rgba(0,0,0,0.2)] z-[11] flex justify-around px-5">
              <div className="w-2.5 h-2.5 bg-gray-700 rounded-full border border-gray-400" />
              <div className="w-2.5 h-2.5 bg-gray-700 rounded-full border border-gray-400" />
              <div className="w-2.5 h-2.5 bg-gray-700 rounded-full border border-gray-400" />
              <div className="w-2.5 h-2.5 bg-gray-700 rounded-full border border-gray-400" />
            </div>

            {/* Cover Content */}
            <div className="text-center p-4 flex flex-col items-center justify-center">
              <span className="font-mono font-bold text-lg mb-2 text-white dark:text-gray-100">
                SAFETY COVER
              </span>
              <div className="bg-amber-500 text-black px-4 py-2 rounded font-bold">
                FLIP OPEN
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-4 text-center">
          {isPolling ? (
            <p className="text-amber-500 font-bold animate-pulse">
              {pollingMessage}
            </p>
          ) : isPressed && emergencyBackupHeaterEnabled ? (
            <p className="text-red-600 dark:text-red-500 font-bold animate-pulse">
              Emergency Backup Heating Enabled
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              {isCoverOpen
                ? "Safety disengaged. Ready to enable backup. Click cover to close."
                : "Safety cover engaged. Click to open."}
            </p>
          )}
        </div>

        {/* Disable Button - Only shown when enabled */}
        {emergencyBackupHeaterEnabled && (
          <Button
            variant="destructive"
            onClick={handleDisable}
            disabled={isPolling || isDisabled}
            className="w-full"
          >
            {isPolling
              ? "Waiting for confirmation..."
              : "Disable Emergency Backup Heating"}
          </Button>
        )}
      </div>
    </CardContainer>
  );
}
