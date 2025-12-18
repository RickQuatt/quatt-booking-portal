import { useState, useEffect } from "react";
import { DataTable } from "@/components/shared/DataTable";
import {
  DeviceFiltersComponent,
  deviceColumns,
  DeviceFilters,
} from "./components";
import { motion } from "framer-motion";
import { fadeInVariants } from "@/lib/animations";
import client from "@/openapi-client/client";
import { validateMinLength } from "@/utils/filterUtils";
import { PageHeader } from "@/components/shared/PageHeader";
import { ListPageLoadingState } from "@/components/shared/ListPageLoadingState";
import { ListPageErrorState } from "@/components/shared/ListPageErrorState";
import { ListPageEmptyState } from "@/components/shared/ListPageEmptyState";
import { PaginationControls } from "@/components/shared/PaginationControls";

export function DeviceListPage() {
  const [filters, setFilters] = useState<DeviceFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
  });

  // Build API query parameters with validation
  const queryParams = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    type: filters.type,
    // Apply minimum character requirements
    deviceUuid: validateMinLength(filters.deviceUuid, 3),
    installationUuid: validateMinLength(filters.installationUuid, 3),
    cicId: validateMinLength(filters.cicId, 3),
    serialNumber: validateMinLength(filters.serialNumber, 3),
    name: validateMinLength(filters.name, 2),
    status: filters.status,
    eui64: validateMinLength(filters.eui64, 3),
    createdAtStart:
      filters.minCreatedAt?.toISOString().split("T")[0] ?? undefined,
    createdAtEnd:
      filters.maxCreatedAt?.toISOString().split("T")[0] ?? undefined,
    updatedAtStart:
      filters.minUpdatedAt?.toISOString().split("T")[0] ?? undefined,
    updatedAtEnd:
      filters.maxUpdatedAt?.toISOString().split("T")[0] ?? undefined,
    // Conditional filters
    role: filters.role,
    pcbHwVersion: filters.pcbHwVersion,
    heatBatterySize: filters.heatBatterySize,
  };

  // Use openapi-react-query client
  const { data, isLoading, error, refetch } = client.useQuery(
    "get",
    "/admin/devices",
    {
      params: {
        query: queryParams,
      },
    },
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [filters]);

  const devices = data?.result?.devices || [];
  const total = data?.result?.total || 0;
  const totalPages = data?.result?.totalPages || 1;
  const currentPage = pagination.page;
  const hasFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== "",
  );

  const handlePreviousPage = () => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, prev.page - 1),
    }));
  };

  const handleNextPage = () => {
    setPagination((prev) => ({
      ...prev,
      page: Math.min(totalPages, prev.page + 1),
    }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleFiltersChange = (newFilters: DeviceFilters) => {
    setFilters(newFilters);
  };

  // Check for filter validation errors (400 errors)
  const isFilterError = error && "status" in error && error.status === 400;

  if (error && !isFilterError) {
    return (
      <ListPageErrorState
        entityName="Devices"
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  // Generate subtitle based on filter state
  const getSubtitle = () => {
    if (hasFilters) {
      return `${total} device${total !== 1 ? "s" : ""} found`;
    }
    return "Use filters to search for devices";
  };

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="container mx-auto space-y-6 p-6"
    >
      <PageHeader
        title="Devices"
        subtitle={getSubtitle()}
        isLoading={isLoading}
      />

      <DeviceFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Filter Validation Error */}
      {isFilterError && (
        <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Invalid filter combination. Please check your filters. Some filters
            are only available for specific device types.
          </p>
        </div>
      )}

      {isLoading ? (
        <ListPageLoadingState entityName="devices" />
      ) : (
        <>
          <DataTable columns={deviceColumns} data={devices} />

          {devices.length === 0 && !isFilterError && (
            <ListPageEmptyState entityName="devices" hasFilters={hasFilters} />
          )}

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            pageSize={pagination.pageSize}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </motion.div>
  );
}
