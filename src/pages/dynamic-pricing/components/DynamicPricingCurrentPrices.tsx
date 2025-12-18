import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Zap, Flame } from "lucide-react";

interface DynamicPricingCurrentPricesProps {
  electricityPrice: number | null;
  gasPrice: number | null;
}

export function DynamicPricingCurrentPrices({
  electricityPrice,
  gasPrice,
}: DynamicPricingCurrentPricesProps) {
  const formatPrice = (price: number | null, unit: string): string => {
    if (price === null || price === 0) return "N/A";
    return `€${price.toFixed(4)} ${unit}`;
  };

  const hasElectricityPrice = electricityPrice !== null && electricityPrice > 0;
  const hasGasPrice = gasPrice !== null && gasPrice > 0;

  if (!hasElectricityPrice && !hasGasPrice) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Electricity Price Card */}
      {hasElectricityPrice && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Current Electricity Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {formatPrice(electricityPrice, "/kWh")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Gas Price Card */}
      {hasGasPrice && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              Current Gas Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
              {formatPrice(gasPrice, "/m³")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
