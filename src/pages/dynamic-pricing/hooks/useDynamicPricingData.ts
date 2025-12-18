import client from "@/openapi-client/client";
import type { components } from "@/openapi-client/types/api/v1";

type PricingItem = components["schemas"]["PricingItem"];

// Create formatters at module scope for performance optimization
const hourFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Amsterdam",
  hour: "numeric",
  hour12: false,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Amsterdam",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export interface PricingDataPoint {
  hour: number;
  price: number;
  timestamp: string;
  validFrom: string;
  validTo: string;
  formattedValidFrom: string;
  formattedValidTo: string;
}

export interface TransformedPricingData {
  currentPrice: number;
  currentGasPrice: number;
  hourlyPrices: PricingDataPoint[];
}

const formatDateForApi = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const transformApiResponse = (
  apiResponse: components["schemas"]["AdminDynamicPrices"],
): TransformedPricingData => {
  const electricityPrices = apiResponse.prices.electricity;
  const currentElectricityPrice = apiResponse.currentPrice.electricity ?? 0;
  const currentGasPrice = apiResponse.currentPrice.gas ?? 0;

  const hourlyPrices: PricingDataPoint[] = electricityPrices.map(
    (item: PricingItem) => {
      const validFromDate = new Date(item.validFrom);

      // Convert to Amsterdam timezone for consistent display
      const amsterdamHour = parseInt(hourFormatter.format(validFromDate), 10);

      return {
        hour: amsterdamHour,
        price: item.price,
        timestamp: item.validFrom,
        validFrom: item.validFrom,
        validTo: item.validTo,
        formattedValidFrom: timeFormatter.format(new Date(item.validFrom)),
        formattedValidTo: timeFormatter.format(new Date(item.validTo)),
      };
    },
  );

  // Sort by hour to ensure correct chart display
  hourlyPrices.sort((a, b) => a.hour - b.hour);

  return {
    currentPrice: currentElectricityPrice,
    currentGasPrice: currentGasPrice,
    hourlyPrices,
  };
};

export function useDynamicPricingData(selectedDate: Date) {
  const formattedDate = formatDateForApi(selectedDate);

  const queryResult = client.useQuery("get", "/admin/energy/dynamicPrices", {
    params: {
      query: {
        date: formattedDate,
      },
    },
  });

  // Transform the data if successful
  const transformedData = queryResult.data?.result
    ? transformApiResponse(queryResult.data.result)
    : undefined;

  return {
    ...queryResult,
    data: transformedData,
  };
}
