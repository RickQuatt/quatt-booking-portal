import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { components } from "@/openapi-client/types/api/v1";
import { CardContainer } from "@/components/shared/DetailPage/CardContainer";
import {
  correctBorderColor,
  correctColor,
  errorBorderColor,
  errorColor,
  notApplicableBorderColor,
  notApplicableColor,
  warningBorderColor,
  warningColor,
} from "@/lib/chart-colors";
import { useTheme } from "@/hooks/useTheme";

ChartJS.register(ArcElement, Tooltip, Legend);

type CicAggregate = components["schemas"]["CicAggregate"];

interface OverallHealthChartProps {
  data: CicAggregate;
}

/**
 * Overall CIC Health Chart (Doughnut)
 * Shows aggregate health status with interactive navigation
 */
export function OverallHealthChart({ data }: OverallHealthChartProps) {
  const chartRef = React.useRef();
  const { isDark } = useTheme();

  const textColor = isDark ? "#e5e7eb" : "#374151"; // gray-200 : gray-700

  const options = React.useMemo(
    () => ({
      plugins: {
        title: {
          display: false, // Title now in Card header
        },
        tooltip: {
          mode: "index" as const,
        },
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    }),
    [textColor],
  );

  const chartData = React.useMemo(() => {
    return {
      labels: ["Not applicable", "All good", "Warning", "Error"],
      datasets: [
        {
          data: [
            {
              status: "notApplicable" as const,
              value: data.notApplicable,
            },
            {
              status: "correct" as const,
              value: data.correct,
            },
            {
              status: "warning" as const,
              value: data.warning,
            },
            {
              status: "error" as const,
              value: data.error,
            },
          ],
          backgroundColor: [
            notApplicableColor,
            correctColor,
            warningColor,
            errorColor,
          ],
          borderColor: [
            notApplicableBorderColor,
            correctBorderColor,
            warningBorderColor,
            errorBorderColor,
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  return (
    <CardContainer title="CIC Health" className="h-full">
      <div className="h-[300px]">
        <Doughnut ref={chartRef} data={chartData} options={options} />
      </div>
    </CardContainer>
  );
}
