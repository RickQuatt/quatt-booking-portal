import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import type { components } from "@/openapi-client/types/api/v1";

type DeviceType = components["schemas"]["DeviceType"];
type DeviceStatus = components["schemas"]["DeviceStatus"];
type DongleRole = components["schemas"]["DongleRole"];
type HeatBatterySize = components["schemas"]["HeatBatterySize"];

export interface DeviceFilters {
  type?: DeviceType;
  deviceUuid?: string;
  installationUuid?: string;
  cicId?: string;
  serialNumber?: string;
  name?: string;
  status?: DeviceStatus;
  eui64?: string;
  minCreatedAt?: Date;
  maxCreatedAt?: Date;
  minUpdatedAt?: Date;
  maxUpdatedAt?: Date;
  // Conditional filters
  role?: DongleRole;
  pcbHwVersion?: string;
  heatBatterySize?: HeatBatterySize;
}

interface DeviceFiltersProps {
  filters: DeviceFilters;
  onFiltersChange: (filters: DeviceFilters) => void;
}

const DEVICE_TYPES: DeviceType[] = [
  "DONGLE",
  "HEAT_BATTERY",
  "BOILER",
  "CHILL",
  "FLOW_TEMPERATURE_SENSOR",
  "HEAT_CHARGER",
  "HOME_BATTERY",
  "OUTDOOR_UNIT",
  "THERMOSTAT",
];

const DEVICE_STATUSES: DeviceStatus[] = [
  "ACTIVE",
  "UNINSTALLED",
  "PENDING_COMMISSIONING",
  "FACTORY",
  "IN_ERROR",
];

const DONGLE_ROLES: DongleRole[] = ["EXTENDER", "RCP"];

const HEAT_BATTERY_SIZES: HeatBatterySize[] = [
  "medium",
  "large",
  "extra_large",
];

export function DeviceFiltersComponent({
  filters,
  onFiltersChange,
}: DeviceFiltersProps) {
  // Local state for debounced text inputs
  const [deviceUuidInput, setDeviceUuidInput] = useState(
    filters.deviceUuid || "",
  );
  const [installationUuidInput, setInstallationUuidInput] = useState(
    filters.installationUuid || "",
  );
  const [cicIdInput, setCicIdInput] = useState(filters.cicId || "");
  const [serialNumberInput, setSerialNumberInput] = useState(
    filters.serialNumber || "",
  );
  const [nameInput, setNameInput] = useState(filters.name || "");
  const [eui64Input, setEui64Input] = useState(filters.eui64 || "");
  const [pcbHwVersionInput, setPcbHwVersionInput] = useState(
    filters.pcbHwVersion || "",
  );

  // Debounce effect for Device UUID (min 3 chars)
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = deviceUuidInput.trim();
      if (value.length >= 3 || value.length === 0) {
        if (value !== filters.deviceUuid) {
          onFiltersChange({ ...filters, deviceUuid: value || undefined });
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [deviceUuidInput]);

  // Debounce effect for Installation UUID (min 3 chars)
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = installationUuidInput.trim();
      if (value.length >= 3 || value.length === 0) {
        if (value !== filters.installationUuid) {
          onFiltersChange({ ...filters, installationUuid: value || undefined });
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [installationUuidInput]);

  // Debounce effect for CIC ID (min 3 chars)
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = cicIdInput.trim();
      if (value.length >= 3 || value.length === 0) {
        if (value !== filters.cicId) {
          onFiltersChange({ ...filters, cicId: value || undefined });
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [cicIdInput]);

  // Debounce effect for Serial Number (min 3 chars)
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = serialNumberInput.trim();
      if (value.length >= 3 || value.length === 0) {
        if (value !== filters.serialNumber) {
          onFiltersChange({ ...filters, serialNumber: value || undefined });
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [serialNumberInput]);

  // Debounce effect for Name (min 2 chars)
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = nameInput.trim();
      if (value.length >= 2 || value.length === 0) {
        if (value !== filters.name) {
          onFiltersChange({ ...filters, name: value || undefined });
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [nameInput]);

  // Debounce effect for EUI64 (min 3 chars)
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = eui64Input.trim();
      if (value.length >= 3 || value.length === 0) {
        if (value !== filters.eui64) {
          onFiltersChange({ ...filters, eui64: value || undefined });
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [eui64Input]);

  // Debounce effect for PCB HW Version (min 3 chars)
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = pcbHwVersionInput.trim();
      if (value.length >= 3 || value.length === 0) {
        if (value !== filters.pcbHwVersion) {
          onFiltersChange({ ...filters, pcbHwVersion: value || undefined });
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [pcbHwVersionInput]);

  const handleDeviceTypeChange = (value: string) => {
    const newType = value === "all" ? undefined : (value as DeviceType);
    // Clear conditional filters when type changes
    onFiltersChange({
      ...filters,
      type: newType,
      role: undefined,
      pcbHwVersion: undefined,
      heatBatterySize: undefined,
    });
    setPcbHwVersionInput("");
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === "all" ? undefined : (value as DeviceStatus),
    });
  };

  const handleRoleChange = (value: string) => {
    onFiltersChange({
      ...filters,
      role: value === "all" ? undefined : (value as DongleRole),
    });
  };

  const handleHeatBatterySizeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      heatBatterySize: value === "all" ? undefined : (value as HeatBatterySize),
    });
  };

  const handleMinCreatedDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      minCreatedAt: value ? new Date(value) : undefined,
    });
  };

  const handleMaxCreatedDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      maxCreatedAt: value ? new Date(value) : undefined,
    });
  };

  const handleMinUpdatedDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      minUpdatedAt: value ? new Date(value) : undefined,
    });
  };

  const handleMaxUpdatedDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      maxUpdatedAt: value ? new Date(value) : undefined,
    });
  };

  const clearFilters = () => {
    setDeviceUuidInput("");
    setInstallationUuidInput("");
    setCicIdInput("");
    setSerialNumberInput("");
    setNameInput("");
    setEui64Input("");
    setPcbHwVersionInput("");
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;
  const showDongleFilters = filters.type === "DONGLE";
  const showHeatBatteryFilters = filters.type === "HEAT_BATTERY";

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-foreground p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8"
          >
            <X className="mr-1 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Device Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type-filter">Device Type</Label>
          <Select
            value={filters.type || "all"}
            onValueChange={handleDeviceTypeChange}
          >
            <SelectTrigger id="type-filter" className="h-9">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {DEVICE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Device UUID Filter */}
        <div className="space-y-2">
          <Label htmlFor="device-uuid-filter">Device UUID</Label>
          <Input
            id="device-uuid-filter"
            placeholder="Min 3 characters..."
            value={deviceUuidInput}
            onChange={(e) => setDeviceUuidInput(e.target.value)}
            className="h-9"
          />
        </div>

        {/* Name Filter */}
        <div className="space-y-2">
          <Label htmlFor="name-filter">Name</Label>
          <Input
            id="name-filter"
            placeholder="Min 2 characters..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="h-9"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger id="status-filter" className="h-9">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {DEVICE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Serial Number Filter */}
        <div className="space-y-2">
          <Label htmlFor="serial-filter">Serial Number</Label>
          <Input
            id="serial-filter"
            placeholder="Min 3 characters..."
            value={serialNumberInput}
            onChange={(e) => setSerialNumberInput(e.target.value)}
            className="h-9"
          />
        </div>

        {/* EUI64 Filter */}
        <div className="space-y-2">
          <Label htmlFor="eui64-filter">EUI64</Label>
          <Input
            id="eui64-filter"
            placeholder="Min 3 characters..."
            value={eui64Input}
            onChange={(e) => setEui64Input(e.target.value)}
            className="h-9"
          />
        </div>

        {/* Installation UUID Filter */}
        <div className="space-y-2">
          <Label htmlFor="installation-uuid-filter">Installation UUID</Label>
          <Input
            id="installation-uuid-filter"
            placeholder="Min 3 characters..."
            value={installationUuidInput}
            onChange={(e) => setInstallationUuidInput(e.target.value)}
            className="h-9"
          />
        </div>

        {/* CIC ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="cic-id-filter">CIC ID</Label>
          <Input
            id="cic-id-filter"
            placeholder="Min 3 characters..."
            value={cicIdInput}
            onChange={(e) => setCicIdInput(e.target.value)}
            className="h-9"
          />
        </div>

        {/* Created After Filter */}
        <div className="space-y-2">
          <Label htmlFor="created-min">Created After</Label>
          <Input
            id="created-min"
            type="datetime-local"
            value={
              filters.minCreatedAt
                ? new Date(filters.minCreatedAt).toISOString().slice(0, 16)
                : ""
            }
            onChange={handleMinCreatedDateChange}
            className="h-9"
          />
        </div>

        {/* Created Before Filter */}
        <div className="space-y-2">
          <Label htmlFor="created-max">Created Before</Label>
          <Input
            id="created-max"
            type="datetime-local"
            max={new Date().toISOString().slice(0, 16)}
            value={
              filters.maxCreatedAt
                ? new Date(filters.maxCreatedAt).toISOString().slice(0, 16)
                : ""
            }
            onChange={handleMaxCreatedDateChange}
            className="h-9"
          />
        </div>

        {/* Updated After Filter */}
        <div className="space-y-2">
          <Label htmlFor="updated-min">Updated After</Label>
          <Input
            id="updated-min"
            type="datetime-local"
            value={
              filters.minUpdatedAt
                ? new Date(filters.minUpdatedAt).toISOString().slice(0, 16)
                : ""
            }
            onChange={handleMinUpdatedDateChange}
            className="h-9"
          />
        </div>

        {/* Updated Before Filter */}
        <div className="space-y-2">
          <Label htmlFor="updated-max">Updated Before</Label>
          <Input
            id="updated-max"
            type="datetime-local"
            max={new Date().toISOString().slice(0, 16)}
            value={
              filters.maxUpdatedAt
                ? new Date(filters.maxUpdatedAt).toISOString().slice(0, 16)
                : ""
            }
            onChange={handleMaxUpdatedDateChange}
            className="h-9"
          />
        </div>
      </div>

      {/* Conditional Filters Section */}
      {(showDongleFilters || showHeatBatteryFilters) && (
        <div className="space-y-2 border-t-2 border-border pt-4">
          <h4 className="text-sm font-semibold text-muted-foreground">
            {showDongleFilters && "Dongle-Specific Filters"}
            {showHeatBatteryFilters && "Heat Battery-Specific Filters"}
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Dongle Role Filter */}
            {showDongleFilters && (
              <div className="space-y-2">
                <Label htmlFor="role-filter">Dongle Role</Label>
                <Select
                  value={filters.role || "all"}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger id="role-filter" className="h-9">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {DONGLE_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* PCB HW Version Filter (Dongle only) */}
            {showDongleFilters && (
              <div className="space-y-2">
                <Label htmlFor="pcb-filter">PCB HW Version</Label>
                <Input
                  id="pcb-filter"
                  placeholder="Min 3 characters..."
                  value={pcbHwVersionInput}
                  onChange={(e) => setPcbHwVersionInput(e.target.value)}
                  className="h-9"
                />
              </div>
            )}

            {/* Heat Battery Size Filter */}
            {showHeatBatteryFilters && (
              <div className="space-y-2">
                <Label htmlFor="battery-size-filter">Heat Battery Size</Label>
                <Select
                  value={filters.heatBatterySize || "all"}
                  onValueChange={handleHeatBatterySizeChange}
                >
                  <SelectTrigger id="battery-size-filter" className="h-9">
                    <SelectValue placeholder="All Sizes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    {HEAT_BATTERY_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
