import { $api } from "@/openapi-client/context";
import { toast } from "sonner";
import type { paths } from "@/openapi-client/types/api/v1";

type RebootBody =
  paths["/admin/cic/{cicId}/reboot"]["post"]["requestBody"]["content"]["application/json"];
export type RebootTarget = RebootBody["target"];

/**
 * Hook for rebooting CIC or HeatCharger devices
 * Returns a function that triggers the reboot with confirmation
 */
export function useRebootDevice(cicId: string, device: RebootTarget) {
  const rebootMutation = $api.useMutation("post", "/admin/cic/{cicId}/reboot");

  const rebootDevice = async () => {
    let deviceInText = "CIC";
    if (device === "heatCharger") {
      deviceInText = "HeatCharger";
    }

    if (
      !window.confirm(
        `Are you sure you would like to reboot the ${deviceInText}?`,
      )
    ) {
      return;
    }

    try {
      await rebootMutation.mutateAsync({
        params: {
          path: { cicId },
        },
        body: { target: device },
      });
      toast.success("Reboot request sent successfully.");
    } catch {
      toast.error("Failed to send reboot request.");
    }
  };

  return rebootDevice;
}

export default useRebootDevice;
