import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fadeInVariants } from "@/lib/animations";
import {
  DynamicPricingDateSelector,
  DynamicPricingCurrentPrices,
  DynamicPricingChart,
} from "./components";
import { useDynamicPricingData } from "./hooks/useDynamicPricingData";

export function DynamicPricingPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [copySuccess, setCopySuccess] = useState(false);

  const { data, isLoading, error } = useDynamicPricingData(selectedDate);

  const handleCopyData = async () => {
    if (!data) return;

    const HEAT_FROM_M3_OF_GAS = 8.7925; // kWh/m³

    // Calculate COP values for each hour
    const copValues =
      data.currentGasPrice && data.currentGasPrice !== 0
        ? data.hourlyPrices.map((point) => ({
            hour: point.formattedValidFrom,
            copThreshold:
              (point.price * HEAT_FROM_M3_OF_GAS) / data.currentGasPrice,
          }))
        : null;

    const exportData = {
      date: selectedDate.toISOString().split("T")[0],
      currentPrices: {
        electricity: data.currentPrice || null,
        gas: data.currentGasPrice || null,
      },
      hourlyPrices: data.hourlyPrices.map((point) => ({
        time: `${point.formattedValidFrom} - ${point.formattedValidTo}`,
        electricityPrice: point.price,
        unit: "€/kWh",
      })),
      copAnalysis: copValues
        ? {
            gasPrice: data.currentGasPrice,
            gasUnit: "€/m³",
            calorificValue: HEAT_FROM_M3_OF_GAS,
            calorificUnit: "kWh/m³",
            hourlyThresholds: copValues,
            note: "Heat pump COP must exceed the threshold to be cheaper than gas at that hour",
          }
        : null,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy data:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-500">Loading pricing data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">
            Error Loading Pricing Data
          </h2>
          <p className="mt-2 text-gray-600">
            Failed to load pricing data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="container mx-auto space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dynamic Pricing</h1>
          <p className="text-sm text-gray-500">
            View hourly electricity prices and COP switching thresholds
          </p>
        </div>
        <Button
          onClick={handleCopyData}
          disabled={!data}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {copySuccess ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Data
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        <DynamicPricingDateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-6"
          >
            <DynamicPricingCurrentPrices
              electricityPrice={data.currentPrice}
              gasPrice={data.currentGasPrice}
            />

            <DynamicPricingChart
              data={data.hourlyPrices}
              selectedDate={selectedDate}
              currentGasPrice={data.currentGasPrice}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
