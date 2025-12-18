import { useState, useEffect } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { cicColumns } from "./components/CicTableColumns";
import { CICFiltersComponent, CICFilters } from "./components/CICFilters";
import { motion } from "framer-motion";
import { fadeInVariants } from "@/lib/animations";
import { $api } from "@/openapi-client/context";
import { PageHeader } from "@/components/shared/PageHeader";
import { ListPageLoadingState } from "@/components/shared/ListPageLoadingState";
import { ListPageErrorState } from "@/components/shared/ListPageErrorState";
import { ListPageEmptyState } from "@/components/shared/ListPageEmptyState";
import { PaginationControls } from "@/components/shared/PaginationControls";

export function CICListPage() {
  const [filters, setFilters] = useState<CICFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
  });

  const {
    data: results,
    isLoading,
    isError,
    error,
    refetch,
  } = $api.useQuery(
    "get",
    "/admin/cic/list",
    {
      params: {
        query: {
          cicId: filters.id || undefined,
          orderNumber: filters.orderNumber || undefined,
          page: pagination.page,
          pageSize: pagination.pageSize,
          createdAtEnd: filters.maxCreatedAt || undefined,
          createdAtStart: filters.minCreatedAt || undefined,
        },
      },
    },
    { refetchOnWindowFocus: false },
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [filters]);

  const cics = results?.result?.cics || [];
  const total = results?.result?.total || 0;
  const totalPages = results?.result?.totalPages || 1;
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

  const handleFiltersChange = (newFilters: CICFilters) => {
    setFilters(newFilters);
  };

  if (isError) {
    return (
      <ListPageErrorState
        entityName="CICs"
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="container mx-auto space-y-6 p-6"
    >
      <PageHeader
        title="CIC List"
        subtitle={`${total} CICs found`}
        isLoading={isLoading}
      />

      <CICFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {isLoading ? (
        <ListPageLoadingState entityName="CICs" />
      ) : (
        <>
          <DataTable columns={cicColumns} data={cics} />

          {cics.length === 0 && (
            <ListPageEmptyState entityName="CICs" hasFilters={hasFilters} />
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
