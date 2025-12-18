import type { components } from "@/openapi-client/types/api/v1";
import { CardContainer } from "@/components/shared/DetailPage";
import { Button } from "@/components/ui/Button";
import { Settings } from "lucide-react";

type AdminCic = components["schemas"]["AdminCic"];

export interface CICSidebarActionsProps {
  cicData: AdminCic;
  onRebootCIC: () => void;
  onRebootHeatCharger: () => void;
  onForgetWifi: () => void;
  onCancelAllECommissioning: () => void;
  onCancelHybridCommissioning: () => void;
  onForceCommissioning: () => void;
  onStartLiveView: () => void;
  onOpenAdvancedSettings: () => void;
  isLoading?: boolean;
}

/**
 * Sidebar card with action buttons
 * All CIC control actions in one place
 */
export function CICSidebarActions({
  cicData,
  onRebootCIC,
  onRebootHeatCharger,
  onForgetWifi,
  onCancelAllECommissioning,
  onCancelHybridCommissioning,
  onForceCommissioning,
  onStartLiveView,
  onOpenAdvancedSettings,
  isLoading = false,
}: CICSidebarActionsProps) {
  const isAllE = cicData.allEStatus !== null;

  return (
    <CardContainer title="Quick Actions">
      <div className="space-y-3">
        <Button
          onClick={onOpenAdvancedSettings}
          variant="outline"
          disabled={isLoading}
          className="w-full"
        >
          <Settings className="h-4 w-4" />
          Advanced Settings
        </Button>

        {cicData.supportsRebootAndForget && (
          <Button
            onClick={onRebootCIC}
            variant="outline"
            disabled={isLoading}
            className="w-full"
          >
            Reboot CIC
          </Button>
        )}

        {isAllE && (
          <Button
            onClick={onRebootHeatCharger}
            variant="outline"
            disabled={isLoading}
            className="w-full"
          >
            Reboot HeatCharger
          </Button>
        )}

        {cicData.supportsForgetWifi && (
          <Button
            onClick={onForgetWifi}
            variant="outline"
            disabled={isLoading}
            className="w-full"
          >
            Forget WiFi Network
          </Button>
        )}

        <Button
          onClick={onStartLiveView}
          variant="outline"
          disabled={isLoading}
          className="w-full"
        >
          Start LiveView (30min)
        </Button>

        {cicData.supportsForceAndCancelCommissioning && (
          <>
            <Button
              onClick={onCancelAllECommissioning}
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
              Cancel All-E Commissioning
            </Button>

            <Button
              onClick={onCancelHybridCommissioning}
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
              Cancel Hybrid Commissioning
            </Button>

            <Button
              onClick={onForceCommissioning}
              variant="default"
              disabled={isLoading}
              className="w-full"
            >
              Force Commissioning
            </Button>
          </>
        )}
      </div>
    </CardContainer>
  );
}
