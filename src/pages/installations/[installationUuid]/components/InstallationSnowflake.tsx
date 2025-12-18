import { Link } from "wouter";
import type { components } from "@/openapi-client/types/api/v1";
import { $api } from "@/openapi-client/context";
import { ErrorText } from "@/components/shared/ErrorText";
import { CardContainer } from "@/components/shared/DetailPage";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/Table";

type SnowflakeInfo = components["schemas"]["SnowflakeInfo"];
type SnowflakeValue = string | number | boolean | object | null;

export interface InstallationSnowflakeProps {
  installationUuid: string;
}

/**
 * Installation Snowflake Component
 * Displays Snowflake health checks, info, and connection status
 */
export function InstallationSnowflake({
  installationUuid,
}: InstallationSnowflakeProps) {
  const {
    data: snowflakeData,
    error,
    isPending,
    refetch,
  } = $api.useQuery(
    "get",
    "/admin/installation/{installationUuid}/snowflakeinfo",
    {
      params: {
        path: { installationUuid },
      },
    },
  );

  if (isPending) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        Loading Snowflake data...
      </div>
    );
  }

  if (error || !snowflakeData?.result) {
    return (
      <ErrorText
        text="Failed to fetch Snowflake data for the installation."
        retry={() => refetch() as any}
      />
    );
  }

  const { health, info, connections } = snowflakeData.result;

  const formatKeyLabel = (key: string): string => {
    return key
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatValue = (value: SnowflakeValue): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const isCicIdField = (key: string, value: SnowflakeValue): boolean => {
    return (
      (key === "CIC_ID" || key.includes("CIC")) &&
      typeof value === "string" &&
      value.startsWith("CIC-")
    );
  };

  const isObjectValue = (value: SnowflakeValue): boolean => {
    return value !== null && typeof value === "object";
  };

  const getConnectionColor = (
    value: SnowflakeValue,
  ): "green" | "red" | null => {
    if (typeof value === "boolean") {
      return value ? "green" : "red";
    }
    if (typeof value === "string") {
      const lowerValue = value.toLowerCase();
      if (lowerValue === "connected" || lowerValue === "true") return "green";
      if (lowerValue === "disconnected" || lowerValue === "false") return "red";
    }
    return null;
  };

  const renderTableRow = (item: SnowflakeInfo) => {
    const label = formatKeyLabel(item.key);
    const value = item.value as SnowflakeValue;
    const displayValue = formatValue(value);

    // Special handling for CIC ID - make it clickable
    if (isCicIdField(item.key, value)) {
      return (
        <TableRow key={item.key}>
          <TableCell className="font-medium">{label}</TableCell>
          <TableCell>
            <Link
              href={`/cics/${value}`}
              className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400"
            >
              {String(value)}
            </Link>
          </TableCell>
        </TableRow>
      );
    }

    // Handle nested objects with code block formatting
    if (isObjectValue(value)) {
      return (
        <TableRow key={item.key}>
          <TableCell className="font-medium">{label}</TableCell>
          <TableCell>
            <pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-dark-foreground">
              {displayValue}
            </pre>
          </TableCell>
        </TableRow>
      );
    }

    // Default row rendering
    return (
      <TableRow key={item.key}>
        <TableCell className="font-medium">{label}</TableCell>
        <TableCell>{String(displayValue)}</TableCell>
      </TableRow>
    );
  };

  const renderConnectionRow = (item: SnowflakeInfo) => {
    const label = formatKeyLabel(item.key);
    const value = item.value as SnowflakeValue;
    const displayValue = formatValue(value);
    const color = getConnectionColor(value);

    return (
      <TableRow key={item.key}>
        <TableCell className="font-medium">{label}</TableCell>
        <TableCell>
          {color ? (
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  color === "green" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {displayValue}
            </div>
          ) : (
            displayValue
          )}
        </TableCell>
      </TableRow>
    );
  };

  const filteredHealth = health.filter((item) => item.key !== "RELATED_IDS");
  const filteredInfo = info.filter((item) => item.key !== "RELATED_IDS");
  const filteredConnections = connections.filter(
    (item) => item.key !== "RELATED_IDS",
  );

  return (
    <div className="space-y-6">
      {/* Snowflake Health Checks Section */}
      <CardContainer title="🏥 Snowflake Health Checks">
        {filteredHealth.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            No information received from Snowflake
          </div>
        ) : (
          <Table>
            <TableBody>{filteredHealth.map(renderTableRow)}</TableBody>
          </Table>
        )}
      </CardContainer>

      {/* Snowflake Info Section */}
      <CardContainer title="🔍 Snowflake Info">
        {filteredInfo.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            No information received from Snowflake
          </div>
        ) : (
          <Table>
            <TableBody>{filteredInfo.map(renderTableRow)}</TableBody>
          </Table>
        )}
      </CardContainer>

      {/* Snowflake Connections Section */}
      <CardContainer title="🔗 Snowflake Connections">
        {filteredConnections.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            No information received from Snowflake
          </div>
        ) : (
          <Table>
            <TableBody>
              {filteredConnections.map(renderConnectionRow)}
            </TableBody>
          </Table>
        )}
      </CardContainer>
    </div>
  );
}
