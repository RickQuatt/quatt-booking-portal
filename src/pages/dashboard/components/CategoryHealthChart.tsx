import React from "react";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { components } from "@/openapi-client/types/api/v1";
import { CardContainer } from "@/components/shared/DetailPage/CardContainer";
import {
  correctColor,
  errorColor,
  notApplicableColor,
  warningColor,
} from "@/lib/chart-colors";
import { getKeys, getValues } from "@/utils/object";
import {
  categoryToLabel,
  labelToCategory,
  categoryToKpiLabels,
} from "@/constants";
import { useTheme } from "@/hooks/useTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

type CicAggregateByCategory = components["schemas"]["CicAggregateByCategory"];

interface CategoryHealthChartProps {
  data: CicAggregateByCategory;
}

/**
 * Health by Category Chart (Horizontal Bar)
 * Shows CIC health broken down by category with interactive navigation
 */
export function CategoryHealthChart({ data }: CategoryHealthChartProps) {
  const chartRef = React.useRef();
  const { isDark } = useTheme();

  const textColor = isDark ? "#e5e7eb" : "#374151"; // gray-200 : gray-700

  const options = React.useMemo(
    () => ({
      indexAxis: "y" as const,
      plugins: {
        title: {
          display: false, // Title now in Card header
        },
        tooltip: {
          callbacks: {
            beforeBody: (value: any) => {
              const category = labelToCategory[
                value[0].label
              ] as keyof CicAggregateByCategory;
              return `A health check combining the following KPIs: ${categoryToKpiLabels(
                category,
              )}`;
            },
          },
        },
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          ticks: { color: textColor },
          grid: { display: false },
        },
        y: {
          stacked: true,
          ticks: { color: textColor },
          grid: { display: false },
        },
      },
    }),
    [textColor],
  );

  const categories = React.useMemo(() => getKeys(data), [data]);

  const chartData = React.useMemo(() => {
    const labels = categories.map((category) => categoryToLabel[category]);
    const datasets = getValues(data).reduce(
      (acc, data) => {
        acc.correct.push(data.correct);
        acc.warning.push(data.warning);
        acc.error.push(data.error);
        acc.notApplicable.push(data.notApplicable);
        return acc;
      },
      {
        correct: [] as number[],
        warning: [] as number[],
        error: [] as number[],
        notApplicable: [] as number[],
      },
    );

    return {
      datasets: [
        {
          label: "Not applicable",
          status: "notApplicable" as const,
          data: datasets.notApplicable,
          backgroundColor: notApplicableColor,
        },
        {
          label: "All good",
          status: "correct" as const,
          data: datasets.correct,
          backgroundColor: correctColor,
        },
        {
          label: "Warning",
          status: "warning" as const,
          data: datasets.warning,
          backgroundColor: warningColor,
        },
        {
          label: "Error",
          status: "error" as const,
          data: datasets.error,
          backgroundColor: errorColor,
        },
      ],
      labels,
    };
  }, [data, categories]);

  return (
    <CardContainer title="CIC Health per Category" className="h-full">
      <div className="h-[400px]">
        <Bar ref={chartRef} options={options} data={chartData} />
      </div>
    </CardContainer>
  );
}
