import { useCallback, useState } from "react";
import { Link } from "wouter";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { components } from "@/openapi-client/types/api/v1";
import { $api } from "@/openapi-client/context";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { ArrowLeft, Send, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInVariants } from "@/lib/animations";

type AdminCic = components["schemas"]["AdminCic"];
type CommandType = components["schemas"]["CommandType"];

// All command types from OpenAPI schema
const COMMAND_TYPES: CommandType[] = [
  "syncConfiguration",
  "startLiveView",
  "stopLiveView",
  "startCommissioning",
  "cancelCommissioning",
  "completeCommissioning",
  "reboot",
  "setCommissioningModeIdentification",
  "stopCurrentCommissioningMode",
  "setCommissioningModeTestDeaeration",
  "setCommissioningModeTestFlowRate",
  "setCommissioningModeTestFlowRateHp1",
  "setCommissioningModeTestFlowRateHp2",
  "setCommissioningModeTestFlowRateAll",
  "setCommissioningModeTestPowerAllOutdoorUnits",
  "setCommissioningModeTestBoiler",
  "setCommissioningModeTestFlowRateHeatcharger",
  "setCommissioningModeTestFlowRateAllOutdoorUnitsAndHeatcharger",
  "setCommissioningModeTestDeaerationDomesticHotWaterHeatcharger",
  "setCommissioningModeTestChargingHeatcharger",
  "setCommissioningModeTestChargingBoostHeatcharger",
  "setCommissioningModeTestChargingBoostEHeatcharger",
  "setCommissioningModeTestDischargingHeatcharger",
  "setCommissioningModeTestPowerHeatcharger",
];

// Human-readable labels for command types
const COMMAND_LABELS: Record<CommandType, string> = {
  syncConfiguration: "Sync Configuration",
  startLiveView: "Start Live View",
  stopLiveView: "Stop Live View",
  startCommissioning: "Start Commissioning",
  cancelCommissioning: "Cancel Commissioning",
  completeCommissioning: "Complete Commissioning",
  reboot: "Reboot",
  setCommissioningModeIdentification: "Set Commissioning Mode: Identification",
  stopCurrentCommissioningMode: "Stop Current Commissioning Mode",
  setCommissioningModeTestDeaeration: "Set Commissioning Mode: Test Deaeration",
  setCommissioningModeTestFlowRate: "Set Commissioning Mode: Test Flow Rate",
  setCommissioningModeTestFlowRateHp1:
    "Set Commissioning Mode: Test Flow Rate HP1",
  setCommissioningModeTestFlowRateHp2:
    "Set Commissioning Mode: Test Flow Rate HP2",
  setCommissioningModeTestFlowRateAll:
    "Set Commissioning Mode: Test Flow Rate All",
  setCommissioningModeTestPowerAllOutdoorUnits:
    "Set Commissioning Mode: Test Power All Outdoor Units",
  setCommissioningModeTestBoiler: "Set Commissioning Mode: Test Boiler",
  setCommissioningModeTestFlowRateHeatcharger:
    "Set Commissioning Mode: Test Flow Rate Heatcharger",
  setCommissioningModeTestFlowRateAllOutdoorUnitsAndHeatcharger:
    "Set Commissioning Mode: Test Flow Rate All + Heatcharger",
  setCommissioningModeTestDeaerationDomesticHotWaterHeatcharger:
    "Set Commissioning Mode: Test Deaeration DHW Heatcharger",
  setCommissioningModeTestChargingHeatcharger:
    "Set Commissioning Mode: Test Charging Heatcharger",
  setCommissioningModeTestChargingBoostHeatcharger:
    "Set Commissioning Mode: Test Charging Boost Heatcharger",
  setCommissioningModeTestChargingBoostEHeatcharger:
    "Set Commissioning Mode: Test Charging Boost E Heatcharger",
  setCommissioningModeTestDischargingHeatcharger:
    "Set Commissioning Mode: Test Discharging Heatcharger",
  setCommissioningModeTestPowerHeatcharger:
    "Set Commissioning Mode: Test Power Heatcharger",
};

interface CICDebugPageProps {
  data: AdminCic;
}

interface FormData {
  type: CommandType;
}

const schema = z.object({
  type: z.enum(COMMAND_TYPES as [CommandType, ...CommandType[]], {
    message: "Command type is required",
  }),
});

/**
 * CIC Debug Page
 * Allows sending commands to a CIC for debugging purposes
 */
export function CICDebugPage({ data: { id } }: CICDebugPageProps) {
  const [lastSentCommand, setLastSentCommand] = useState<CommandType | null>(
    null,
  );

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "syncConfiguration",
    },
  });

  const sendCommandMutation = $api.useMutation(
    "post",
    "/admin/cic/{cicId}/command",
  );

  const onSubmit = useCallback(
    async (formData: FormData) => {
      try {
        await sendCommandMutation.mutateAsync({
          params: {
            path: { cicId: id },
          },
          body: {
            type: formData.type,
          },
        });
        setLastSentCommand(formData.type);
        toast.success(
          `Command "${COMMAND_LABELS[formData.type]}" sent successfully`,
        );
      } catch (error) {
        toast.error("Failed to send command");
      }
    },
    [id, sendCommandMutation],
  );

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950"
    >
      <div className="mx-auto max-w-2xl">
        {/* Back Link */}
        <Link
          to={`/cics/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to CIC Details
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            <Terminal className="h-6 w-6" />
            CIC Debug Console
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            CIC ID: <span className="font-mono">{id}</span>
          </p>
        </div>

        {/* Command Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send Command</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Command Type
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a command" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMAND_TYPES.map((commandType) => (
                          <SelectItem key={commandType} value={commandType}>
                            {COMMAND_LABELS[commandType]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {lastSentCommand && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
                  Last command sent: {COMMAND_LABELS[lastSentCommand]}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || sendCommandMutation.isPending}
                className="w-full"
              >
                {isSubmitting || sendCommandMutation.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Command
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Warning Notice */}
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Warning:</strong> Commands sent from this page directly
            affect the CIC. Use with caution and ensure you understand the
            implications of each command.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
