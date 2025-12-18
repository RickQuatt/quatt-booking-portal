import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  ChartDataset,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { CardContainer } from "@/components/shared/DetailPage/CardContainer";
import type { PricingDataPoint } from "../hooks/useDynamicPricingData";
import { useTheme } from "@/hooks/useTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface DynamicPricingChartProps {
  data: PricingDataPoint[];
  selectedDate: Date;
  currentGasPrice?: number;
}

export function DynamicPricingChart({
  data,
  selectedDate,
  currentGasPrice,
}: DynamicPricingChartProps) {
  const { isDark } = useTheme();

  // Theme-aware colors
  const textColor = isDark ? "#e5e7eb" : "#495057"; // gray-200 : gray-700
  const tickColor = isDark ? "#9ca3af" : "#6c757d"; // gray-400 : gray-500
  const gridColor = isDark ? "#374151" : "#e9ecef"; // gray-700 : gray-200
  // Gas calorific value in kWh/m³ (same as backend: 8.79 kWh/m³)
  const HEAT_FROM_M3_OF_GAS = 8.7925; // kWh/m³

  const chartData = React.useMemo(() => {
    const labels = data.map((point) => point.formattedValidFrom);
    const prices = data.map((point) => point.price);

    const datasets: ChartDataset<"line">[] = [
      {
        label: "Electricity Price (€/kWh)",
        data: prices,
        borderColor: "#28a745", // Green color matching the app design
        backgroundColor: "rgba(40, 167, 69, 0.1)",
        borderWidth: 2,
        fill: true,
        stepped: "before" as const, // Show stepped chart - price constant from start of each hour
        tension: 0, // No smoothing for stepped chart
        pointRadius: 0,
        pointHoverRadius: 0,
        yAxisID: "y",
      },
    ];

    // Add COP switching line if we have gas price
    // Only show COP line if gas price is defined and not zero (to prevent division by zero)
    if (currentGasPrice !== undefined && currentGasPrice !== 0) {
      // Calculate COP for switching at each time point
      // COP = electricityPrice_€/kWh / (gasPrice_€/m³ / heatFromM3OfGas_kWh/m³)
      // Simplified: COP = (electricityPrice_€/kWh × heatFromM3OfGas_kWh/m³) / gasPrice_€/m³
      // Note: Negative gas prices are theoretically possible (like negative electricity prices)
      const copValues = prices.map((electricityPrice) => {
        // Handle edge case: if electricity price is null/undefined, return null for that point
        if (electricityPrice === undefined || electricityPrice === null) {
          return null;
        }
        return (electricityPrice * HEAT_FROM_M3_OF_GAS) / currentGasPrice;
      });

      datasets.push({
        label: "COP Switching Point",
        data: copValues,
        borderColor: "#ff6b35", // Orange color for COP line
        backgroundColor: "transparent",
        borderWidth: 2,
        fill: false,
        stepped: "before" as const,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        yAxisID: "y1", // Use secondary y-axis for COP values
        spanGaps: true, // Connect line across null/missing values
      });
    }

    return {
      labels,
      datasets,
    };
  }, [data, currentGasPrice]);

  const options = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "nearest" as const,
        axis: "x" as const,
        intersect: false,
      },
      plugins: {
        legend: {
          display: currentGasPrice !== undefined && currentGasPrice !== 0,
          position: "top" as const,
          labels: {
            usePointStyle: true,
            padding: 15,
            color: textColor,
          },
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "#28a745",
          borderWidth: 1,
          callbacks: {
            label: (context: TooltipItem<"line">) => {
              if (context.datasetIndex === 0) {
                // Electricity price dataset
                const dataPoint = data[context.dataIndex];
                const price = context.parsed.y;
                if (price === null || price === undefined) {
                  return `${dataPoint.formattedValidFrom} - ${dataPoint.formattedValidTo}: No data`;
                }
                return `${dataPoint.formattedValidFrom} - ${dataPoint.formattedValidTo}: €${price.toFixed(3)} per kWh`;
              } else {
                // COP switching line - return array for multiple lines
                const copValue = context.parsed.y;
                if (copValue === null || copValue === undefined) {
                  return "COP: No data";
                }
                return [
                  `COP switching point: ${copValue.toFixed(2)}`,
                  `(heat pump COP must be > ${copValue.toFixed(2)} to be cheaper than gas)`,
                ];
              }
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Time (hours)",
            color: textColor,
            font: {
              size: 12,
              weight: 500,
            },
          },
          grid: {
            color: gridColor,
          },
          ticks: {
            color: tickColor,
            maxTicksLimit: 12,
          },
        },
        y: {
          type: "linear" as const,
          display: true,
          position: "left" as const,
          title: {
            display: true,
            text: "€/kWh",
            color: textColor,
            font: {
              size: 12,
              weight: 500,
            },
          },
          grid: {
            color: gridColor,
          },
          ticks: {
            color: tickColor,
            callback: function (value: string | number) {
              return `€${Number(value).toFixed(3)}`;
            },
          },
        },
        y1: {
          type: "linear" as const,
          display: currentGasPrice !== undefined && currentGasPrice !== 0,
          position: "right" as const,
          beginAtZero: true,
          title: {
            display: true,
            text: "COP",
            color: "#ff6b35",
            font: {
              size: 12,
              weight: 500,
            },
          },
          grid: {
            drawOnChartArea: false, // Don't draw grid lines for secondary axis
          },
          ticks: {
            color: "#ff6b35",
            callback: function (value: string | number) {
              return Number(value).toFixed(1);
            },
          },
        },
      },
    }),
    [data, currentGasPrice, textColor, tickColor, gridColor],
  );

  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-lg border-2 border-border bg-card p-8 sm:min-h-[350px]">
        <p className="text-center text-gray-500">
          No pricing data available for {selectedDate.toLocaleDateString()}.
        </p>
      </div>
    );
  }

  return (
    <CardContainer
      collapsible={false}
      title="Dynamic Electricity Pricing Chart"
      className="h-full"
    >
      <div className="h-92 w-full">
        <Line data={chartData} options={options} />
      </div>
    </CardContainer>
  );
}
