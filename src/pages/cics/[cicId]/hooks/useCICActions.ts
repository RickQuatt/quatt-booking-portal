import { useCallback } from "react";
import type { components } from "@/openapi-client/types/api/v1";
import { $api } from "@/openapi-client/context";
import { useRebootDevice } from "./useRebootDevice";
import { toast } from "@/lib/toast";

type AdminCic = components["schemas"]["AdminCic"];

/**
 * Hook providing all CIC action handlers
 * Includes reboot, WiFi, commissioning, and LiveView operations
 */
export function useCICActions(cicData: AdminCic) {
  const isAllE = cicData.allEStatus !== null;
  const installationId = cicData.installationId;

  const rebootCic = useRebootDevice(cicData.id, "cic");
  const rebootHeatCharger = useRebootDevice(cicData.id, "heatCharger");

  // Mutations
  const forgetWifiMutation = $api.useMutation(
    "post",
    "/admin/cic/{cicId}/forgetWifi",
  );

  const cancelCommissioningMutation = $api.useMutation(
    "post",
    "/admin/cic/{cicId}/cancelCommissioning",
  );

  const completeCommissioningMutation = $api.useMutation(
    "post",
    "/admin/cic/{cicId}/completeCommissioning",
  );

  const sendCommandMutation = $api.useMutation(
    "post",
    "/admin/cic/{cicId}/command",
  );

  const updateCommissioningMutation = $api.useMutation(
    "patch",
    "/admin/installation/{installationId}/commissioning/latest",
  );

  const handleRebootCIC = useCallback(async () => {
    await rebootCic();
  }, [rebootCic]);

  const handleRebootHeatCharger = useCallback(async () => {
    await rebootHeatCharger();
  }, [rebootHeatCharger]);

  const handleForgetWifi = useCallback(async () => {
    if (
      !window.confirm(
        "Are you sure you would like to forget the current WiFi network?",
      )
    ) {
      return;
    }

    try {
      await forgetWifiMutation.mutateAsync({
        params: {
          path: { cicId: cicData.id },
        },
        body: { ssid: cicData.wifiSSID as string },
      });
      toast.success("WiFi network forgotten successfully.");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to forget WiFi network.");
    }
  }, [cicData.id, cicData.wifiSSID, forgetWifiMutation]);

  const handleCancelAllECommissioning = useCallback(async () => {
    if (installationId === null) {
      toast.error("No installation ID found.");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you would like to cancel the All-E commissioning process?",
      )
    ) {
      return;
    }

    try {
      await updateCommissioningMutation.mutateAsync({
        params: {
          path: { installationId },
        },
        body: {
          status: "CANCELLED",
          forced: true,
        },
      });
      toast.success("All-E commissioning cancelled successfully.");
      window.location.reload();
    } catch (error) {
      toast.error("No All-E commissioning is ongoing or failed to cancel.");
    }
  }, [installationId, updateCommissioningMutation]);

  const handleCancelHybridCommissioning = useCallback(async () => {
    if (
      !window.confirm(
        "Are you sure you would like to cancel the Hybrid commissioning process?",
      )
    ) {
      return;
    }

    try {
      await cancelCommissioningMutation.mutateAsync({
        params: {
          path: { cicId: cicData.id },
        },
      });
      toast.success("Hybrid commissioning cancelled successfully.");
      window.location.reload();
    } catch (error) {
      toast.error("No Hybrid commissioning is ongoing or failed to cancel.");
    }
  }, [cicData.id, cancelCommissioningMutation]);

  const handleForceCommissioning = useCallback(async () => {
    if (installationId === null) {
      toast.error("No installation ID found.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you would like to complete the commissioning process?",
      )
    ) {
      return;
    }

    try {
      if (isAllE) {
        await updateCommissioningMutation.mutateAsync({
          params: {
            path: { installationId },
          },
          body: {
            status: "SUCCESS",
            forced: true,
          },
        });
      } else {
        await completeCommissioningMutation.mutateAsync({
          params: {
            path: { cicId: cicData.id },
          },
        });
      }
      toast.success("Commissioning process completed successfully.");
      window.location.reload();
    } catch (error) {
      toast.error("No commissioning is ongoing or failed to complete.");
    }
  }, [
    installationId,
    isAllE,
    cicData.id,
    completeCommissioningMutation,
    updateCommissioningMutation,
  ]);

  const handleStartLiveView = useCallback(async () => {
    try {
      await sendCommandMutation.mutateAsync({
        params: {
          path: { cicId: cicData.id },
        },
        body: {
          type: "startLiveView",
        },
      });
      toast.success("Live view command sent successfully (30 minutes)");
    } catch (error) {
      toast.error("Failed to start live view session.");
    }
  }, [cicData.id, sendCommandMutation]);

  return {
    handleRebootCIC,
    handleRebootHeatCharger,
    handleForgetWifi,
    handleCancelAllECommissioning,
    handleCancelHybridCommissioning,
    handleForceCommissioning,
    handleStartLiveView,
  };
}
