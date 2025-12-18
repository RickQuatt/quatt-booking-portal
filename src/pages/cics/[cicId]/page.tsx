import { useState } from "react";
import type { components } from "@/openapi-client/types/api/v1";
import { motion } from "framer-motion";
import { fadeInVariants } from "@/lib/animations";
import { useResponsiveLayout } from "@/hooks/detail-page";
import {
  CICHeader,
  CICHealthCard,
  CICDeviceInfoCard,
  CICNetworkCard,
  CICCommissioningCard,
  CICSettingsCard,
  CICSidebarActions,
  CICSidebarHistory,
  CICJsonCard,
  CICAvoidNighttimeChargingCard,
  CICEmergencyBackupCard,
  AdvancedSettingsModal,
} from "./components";
import { useCICActions } from "./hooks/useCICActions";

type AdminCic = components["schemas"]["AdminCic"];

export interface CICDetailPageProps {
  cicData: AdminCic;
  isLoading?: boolean;
}

/**
 * CIC Detail Page - Redesigned
 * Two-column responsive layout with sticky header
 * Primary content (70%) | Sidebar (30%)
 */
export function CICDetailPage({
  cicData,
  isLoading = false,
}: CICDetailPageProps) {
  const layoutMode = useResponsiveLayout();
  const isMobile = layoutMode !== "desktop";
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);

  const {
    handleRebootCIC,
    handleRebootHeatCharger,
    handleForgetWifi,
    handleCancelAllECommissioning,
    handleCancelHybridCommissioning,
    handleForceCommissioning,
    handleStartLiveView,
  } = useCICActions(cicData);

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <CICHeader cicData={cicData} isLoading={isLoading} />

      {/* Main Content */}
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-6"
      >
        {/* Mobile: Quick Actions First */}
        {isMobile && (
          <div className="mb-6">
            <CICSidebarActions
              cicData={cicData}
              onRebootCIC={handleRebootCIC}
              onRebootHeatCharger={handleRebootHeatCharger}
              onForgetWifi={handleForgetWifi}
              onCancelAllECommissioning={handleCancelAllECommissioning}
              onCancelHybridCommissioning={handleCancelHybridCommissioning}
              onForceCommissioning={handleForceCommissioning}
              onStartLiveView={handleStartLiveView}
              onOpenAdvancedSettings={() => setIsAdvancedSettingsOpen(true)}
              isLoading={isLoading}
            />
          </div>
        )}

        <div
          className={`grid gap-6 ${
            isMobile ? "grid-cols-1" : "lg:grid-cols-[1fr_400px]"
          }`}
        >
          {/* Primary Content Column */}
          <div className="space-y-6">
            {/* Health Overview - Always Expanded */}
            <CICHealthCard cicData={cicData} />

            {/* Device Information */}
            <CICDeviceInfoCard cicData={cicData} />

            {/* Network & Connectivity */}
            <CICNetworkCard cicData={cicData} />

            {/* Settings & Configuration */}
            <CICSettingsCard cicData={cicData} />

            {/* Avoid Nighttime Charging - Only for All-E with this feature */}
            {cicData.avoidNighttimeCharging && (
              <CICAvoidNighttimeChargingCard cicData={cicData} />
            )}

            {/* Emergency Backup Heating - Only for All-E installations */}
            {cicData.allEStatus && <CICEmergencyBackupCard cicData={cicData} />}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Desktop: Quick Actions */}
            {!isMobile && (
              <CICSidebarActions
                cicData={cicData}
                onRebootCIC={handleRebootCIC}
                onRebootHeatCharger={handleRebootHeatCharger}
                onForgetWifi={handleForgetWifi}
                onCancelAllECommissioning={handleCancelAllECommissioning}
                onCancelHybridCommissioning={handleCancelHybridCommissioning}
                onForceCommissioning={handleForceCommissioning}
                onStartLiveView={handleStartLiveView}
                onOpenAdvancedSettings={() => setIsAdvancedSettingsOpen(true)}
                isLoading={isLoading}
              />
            )}

            {/* Commissioning */}
            <CICCommissioningCard cicData={cicData} />

            {/* State History */}
            <CICSidebarHistory cicData={cicData} />

            {/* Complete JSON Data */}
            <CICJsonCard cicData={cicData} />
          </div>
        </div>
      </motion.div>

      {/* Advanced Settings Modal */}
      <AdvancedSettingsModal
        open={isAdvancedSettingsOpen}
        onOpenChange={setIsAdvancedSettingsOpen}
        cicId={cicData.id}
        cicData={cicData}
      />
    </div>
  );
}
