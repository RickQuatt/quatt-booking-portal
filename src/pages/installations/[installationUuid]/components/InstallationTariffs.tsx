import { useState } from "react";
import type { components } from "@/openapi-client/types/api/v1";
import { $api } from "@/openapi-client/context";
import { ErrorText } from "@/components/shared/ErrorText";
import { CardContainer } from "@/components/shared/DetailPage";
import { formatDate } from "@/utils/formatDate";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/Form";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

type Tariff = components["schemas"]["Tariff"];

// Zod schema with conditional validation
const tariffFormSchema = z
  .object({
    validFrom: z.string().min(1, "Valid from date is required"),
    electricityType: z.enum(["single", "double", "dynamic"]),
    electricityPrice: z.coerce.number().positive().optional().nullable(),
    dayElectricityPrice: z.coerce.number().positive().optional().nullable(),
    nightElectricityPrice: z.coerce.number().positive().optional().nullable(),
    gasType: z.enum(["single", "dynamic"]),
    gasPrice: z.coerce.number().positive().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.electricityType === "single" && !data.electricityPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Electricity price is required for single tariff",
        path: ["electricityPrice"],
      });
    }
    if (data.electricityType === "double") {
      if (!data.dayElectricityPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Day price is required for double tariff",
          path: ["dayElectricityPrice"],
        });
      }
      if (!data.nightElectricityPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Night price is required for double tariff",
          path: ["nightElectricityPrice"],
        });
      }
    }
    if (data.gasType === "single" && !data.gasPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Gas price is required for single tariff",
        path: ["gasPrice"],
      });
    }
  });

type TariffFormData = z.infer<typeof tariffFormSchema>;

export interface InstallationTariffsProps {
  installationId: string;
}

/**
 * Installation Tariffs Component
 * Displays current, upcoming, and past energy tariffs
 */
export function InstallationTariffs({
  installationId,
}: InstallationTariffsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: tariffsData,
    error,
    isPending,
    refetch,
  } = $api.useQuery("get", "/admin/installation/{installationId}/tariff", {
    params: {
      path: { installationId },
    },
  });

  const handleCreateTariff = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    handleCloseModal();
    refetch();
  };

  // Determine error state
  const isNotFound =
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "status" in error.response &&
    error.response.status === 404;
  const hasError = error || (!isPending && !tariffsData?.result);
  const errorText = isNotFound
    ? `No tariffs found for installation: ${installationId}`
    : `Failed to fetch installation tariffs for installation: ${installationId}.`;

  const { currentTariff, futureTariffs, pastTariffs } =
    tariffsData?.result || {};
  const hasFutureTariffs = futureTariffs && futureTariffs.length > 0;
  const hasPastTariffs = pastTariffs && pastTariffs.length > 0;

  const roundNumber = (
    num: number | null | undefined,
    decimals = 2,
  ): string => {
    if (num === null || num === undefined) return "n/a";
    return num.toFixed(decimals);
  };

  const getElectricityDisplay = (tariff: Tariff) => {
    if (tariff.electricityTariffType === "dynamic") {
      return "Dynamic";
    }
    return `€${tariff.electricityPrice ? roundNumber(tariff.electricityPrice) : "n/a"}`;
  };

  const getGasDisplay = (tariff: Tariff) => {
    if (tariff.gasTariffType === "dynamic") {
      return "Dynamic";
    }
    return `€${tariff.gasPrice ? roundNumber(tariff.gasPrice) : "n/a"}`;
  };

  const TariffCard = ({ tariff }: { tariff: Tariff }) => {
    const { dayElectricityPrice, nightElectricityPrice, validFrom } = tariff;

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-dark-foreground">
        <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          From: {formatDate(new Date(validFrom))}
        </div>
        <div className="grid gap-2">
          {dayElectricityPrice && nightElectricityPrice ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ⚡️☀️ Day
                </span>
                <span className="font-semibold">
                  €{roundNumber(dayElectricityPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ⚡️🌙 Night
                </span>
                <span className="font-semibold">
                  €{roundNumber(nightElectricityPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  🔥 Gas
                </span>
                <span className="font-semibold">{getGasDisplay(tariff)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ⚡️ Electricity
                </span>
                <span className="font-semibold">
                  {getElectricityDisplay(tariff)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  🔥 Gas
                </span>
                <span className="font-semibold">{getGasDisplay(tariff)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <CardContainer
        title="💰 Tariffs"
        headerAction={
          <Button
            size="sm"
            onClick={handleCreateTariff}
            className="h-8 w-8 p-0"
            variant="ghost"
          >
            <Plus className="h-4 w-4" />
          </Button>
        }
      >
        {isPending ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            Loading tariffs...
          </div>
        ) : hasError ? (
          <ErrorText
            text={errorText}
            retry={!isNotFound ? () => refetch() : undefined}
          />
        ) : (
          <div className="space-y-4">
            {currentTariff && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Current Tariff
                </h4>
                <TariffCard tariff={currentTariff} />
              </div>
            )}

            {hasFutureTariffs && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Upcoming Tariffs
                </h4>
                <div className="space-y-2">
                  {futureTariffs!.map((tariff, index) => (
                    <TariffCard key={index} tariff={tariff} />
                  ))}
                </div>
              </div>
            )}

            {hasPastTariffs && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Past Tariffs
                </h4>
                <div className="space-y-2">
                  {pastTariffs!.map((tariff, index) => (
                    <TariffCard key={index} tariff={tariff} />
                  ))}
                </div>
              </div>
            )}

            {currentTariff === null && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No tariffs set 😴
              </div>
            )}
          </div>
        )}
      </CardContainer>

      <AddTariffModal
        open={isModalOpen}
        onClose={handleCloseModal}
        installationId={installationId}
        onSuccess={handleSuccess}
      />
    </>
  );
}

// AddTariffModal Component
interface AddTariffModalProps {
  open: boolean;
  onClose: () => void;
  installationId: string;
  onSuccess: () => void;
}

function AddTariffModal({
  open,
  onClose,
  installationId,
  onSuccess,
}: AddTariffModalProps) {
  const form = useForm<TariffFormData>({
    resolver: zodResolver(tariffFormSchema),
    defaultValues: {
      validFrom: new Date().toISOString().split("T")[0],
      electricityType: "single",
      electricityPrice: undefined,
      dayElectricityPrice: undefined,
      nightElectricityPrice: undefined,
      gasType: "single",
      gasPrice: undefined,
    },
  });

  const electricityType = form.watch("electricityType");
  const gasType = form.watch("gasType");
  const validFrom = form.watch("validFrom");

  const createTariffMutation = $api.useMutation(
    "post",
    "/admin/installation/{installationId}/tariff",
    {
      onSuccess: () => {
        toast.success("Tariff added successfully");
        form.reset();
        onSuccess();
      },
      onError: () => {
        toast.error("Failed to add tariff");
      },
    },
  );

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: TariffFormData) => {
    // Build electricity tariff object
    let electricity:
      | { tariffType: "single"; price: number }
      | { tariffType: "double"; dayPrice: number; nightPrice: number }
      | { tariffType: "dynamic" };

    if (data.electricityType === "single" && data.electricityPrice) {
      electricity = { tariffType: "single", price: data.electricityPrice };
    } else if (
      data.electricityType === "double" &&
      data.dayElectricityPrice &&
      data.nightElectricityPrice
    ) {
      electricity = {
        tariffType: "double",
        dayPrice: data.dayElectricityPrice,
        nightPrice: data.nightElectricityPrice,
      };
    } else {
      electricity = { tariffType: "dynamic" };
    }

    // Build gas tariff object
    let gas:
      | { tariffType: "single"; price: number }
      | { tariffType: "dynamic" };

    if (data.gasType === "single" && data.gasPrice) {
      gas = { tariffType: "single", price: data.gasPrice };
    } else {
      gas = { tariffType: "dynamic" };
    }

    createTariffMutation.mutate({
      params: {
        path: { installationId },
      },
      body: {
        validFrom: data.validFrom,
        electricity,
        gas,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Add New Tariff</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Valid From Date Field */}
            <FormField
              control={form.control}
              name="validFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid From</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Electricity Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                ⚡️ Electricity
              </h4>

              <FormField
                control={form.control}
                name="electricityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tariff Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">
                          Double (Day/Night)
                        </SelectItem>
                        <SelectItem value="dynamic">Dynamic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {electricityType === "single" && (
                <FormField
                  control={form.control}
                  name="electricityPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (EUR/kWh)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="0.2412"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {electricityType === "double" && (
                <>
                  <FormField
                    control={form.control}
                    name="dayElectricityPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day Price (EUR/kWh)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.0001"
                            placeholder="0.2412"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nightElectricityPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Night Price (EUR/kWh)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.0001"
                            placeholder="0.2012"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {electricityType === "dynamic" && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dynamic pricing will be used (fetched from external provider)
                </p>
              )}
            </div>

            {/* Gas Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                🔥 Gas
              </h4>

              <FormField
                control={form.control}
                name="gasType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tariff Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="dynamic">Dynamic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {gasType === "single" && (
                <FormField
                  control={form.control}
                  name="gasPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (EUR/m³)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="1.50"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {gasType === "dynamic" && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dynamic pricing will be used (fetched from external provider)
                </p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTariffMutation.isPending || !validFrom}
              >
                {createTariffMutation.isPending ? "Adding..." : "Add Tariff"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
