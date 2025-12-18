import type { components } from "@/openapi-client/types/api/v1";
import { useQueryClient } from "@tanstack/react-query";
import { CardContainer, DataRow } from "@/components/shared/DetailPage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { $api } from "@/openapi-client/context";
import { toast } from "@/lib/toast";

type AdminCic = components["schemas"]["AdminCic"];

export interface CICAvoidNighttimeChargingCardProps {
  cicData: AdminCic;
}

/**
 * Avoid Nighttime Charging card
 * Shows status and allows toggling the avoid nighttime charging setting
 * Only rendered for All-E installations with avoidNighttimeCharging data
 */
export function CICAvoidNighttimeChargingCard({
  cicData,
}: CICAvoidNighttimeChargingCardProps) {
  const { avoidNighttimeCharging } = cicData;
  const queryClient = useQueryClient();
  // Early return if no data (shouldn't happen if parent checks, but defensive)
  if (!avoidNighttimeCharging) {
    return null;
  }

  const isEnabled = avoidNighttimeCharging.allEAvoidNighttimeCharging;
  const nighttimeWindow = `${avoidNighttimeCharging.nighttimeChargingStartTime} - ${avoidNighttimeCharging.nighttimeChargingEndTime}`;

  // Mutation for updating CIC with query invalidation
  const updateCicMutation = $api.useMutation("put", "/admin/cic/{cicId}", {
    onSuccess: () => {
      toast.success(
        `Successfully ${!isEnabled ? "enabled" : "disabled"} avoid nighttime charging`,
      );
      queryClient.invalidateQueries({
        queryKey: ["get", "/admin/cic/{cicId}"],
      });
    },
    onError: () => {
      toast.error("Failed to update avoid nighttime charging setting");
    },
  });

  const handleToggle = () => {
    const newValue = !isEnabled;
    const actionText = newValue ? "enable" : "disable";

    if (
      !window.confirm(
        `Are you sure you want to ${actionText} avoid nighttime charging?`,
      )
    ) {
      return;
    }

    updateCicMutation.mutate({
      params: {
        path: { cicId: cicData.id },
      },
      body: {
        avoidNighttimeCharging: {
          allEAvoidNighttimeCharging: newValue,
        },
      },
    });
  };

  return (
    <CardContainer title="Avoid Nighttime Charging">
      <div className="space-y-1 mb-4">
        <DataRow
          label="Status"
          value={
            <Badge variant={isEnabled ? "success" : "destructive"}>
              {isEnabled ? "Enabled" : "Disabled"}
            </Badge>
          }
        />
        <DataRow label="Nighttime Window" value={nighttimeWindow} />
      </div>

      <Button
        variant={isEnabled ? "destructive" : "default"}
        onClick={handleToggle}
        disabled={updateCicMutation.isPending}
        className="w-full"
      >
        {updateCicMutation.isPending
          ? "Updating..."
          : isEnabled
            ? "Disable Avoid Nighttime Charging"
            : "Enable Avoid Nighttime Charging"}
      </Button>
    </CardContainer>
  );
}
