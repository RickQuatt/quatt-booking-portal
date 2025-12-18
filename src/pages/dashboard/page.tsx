import { motion } from "framer-motion";
import { Loader } from "@/components/shared/Loader";
import { ErrorText } from "@/components/shared/ErrorText";
import { fadeInVariants } from "@/lib/animations";
import { useDashboardData } from "./hooks/useDashboardData";
import { OverallHealthChart } from "./components/OverallHealthChart";
import { CategoryHealthChart } from "./components/CategoryHealthChart";
import { KpiHealthChart } from "./components/KpiHealthChart";
import { VersionsTable } from "./components/VersionsTable";

/**
 * CIC Dashboard Page
 * Displays aggregated CIC health metrics, version distribution, and KPI breakdowns
 */
export function DashboardPage() {
  const { data, error, isPending, refetch } = useDashboardData();

  if (isPending) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorText
        text="Failed to fetch CIC dashboard data."
        retry={() => refetch()}
      />
    );
  }

  const dashboardData = data?.result;

  if (!dashboardData) {
    return <ErrorText text="No CIC dashboard data found" />;
  }

  return (
    <div className="min-h-screen p-6">
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="container mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            CIC Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Aggregated health metrics and version distribution
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Overall Health - Top Left */}
          <div className="lg:col-span-1">
            <OverallHealthChart data={dashboardData.aggregate} />
          </div>

          {/* CIC Versions - Top Middle-Left */}
          <div className="lg:col-span-1">
            <VersionsTable data={dashboardData.aggregateByVersion} />
          </div>

          {/* Health by Category - Top Right (spans 2 columns) */}
          <div className="lg:col-span-2">
            <CategoryHealthChart data={dashboardData.aggregateByCategory} />
          </div>

          {/* Health by KPI - Bottom (spans all 4 columns) */}
          <div className="lg:col-span-4">
            <KpiHealthChart data={dashboardData.aggregateByKpi} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
