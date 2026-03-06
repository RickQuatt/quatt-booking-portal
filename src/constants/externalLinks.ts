/**
 * External link generation utilities for various services
 * (Grafana, Mender, HubSpot, Zuper, Retool)
 */

export function getMenderLink(id: string) {
  return `https://hosted.mender.io/ui/devices/accepted?sort=system:updated_ts:desc&id=${id}`;
}

export const getEnvironment = (): {
  isLocal: boolean;
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
} => {
  const url = window.location.href;
  return {
    isLocal: url.includes("localhost"),
    isDevelopment:
      url.includes("internal-support-develop") ||
      url.includes("quatt-support-dashboard.pages.dev"),
    isStaging: url.includes("internal-support-staging"),
    isProduction:
      !url.includes("localhost") &&
      !url.includes("internal-support-develop") &&
      !url.includes("internal-support-staging") &&
      !url.includes("quatt-support-dashboard.pages.dev"),
  };
};

function buildFallbackGrafanaUrl(
  dashboardPath: string,
  params: string,
): string {
  const env = getEnvironment();
  const baseUrl =
    env.isLocal || env.isDevelopment
      ? "https://g-d4ebd27178.grafana-workspace.eu-west-1.amazonaws.com"
      : env.isStaging
        ? "https://g-2048f245a4.grafana-workspace.eu-west-1.amazonaws.com"
        : "https://g-736ff2fef7.grafana-workspace.eu-west-1.amazonaws.com";
  return `${baseUrl}/d/${dashboardPath}?${params}`;
}

function buildPrimaryGrafanaUrl(dashboardPath: string, params: string): string {
  const env = getEnvironment();
  const baseUrl =
    env.isLocal || env.isDevelopment
      ? "https://grafana.eu-west-1.develop.aws-grafana-observability.quatt.dev"
      : env.isStaging
        ? "https://grafana.eu-west-1.staging.aws-grafana-observability.quatt.dev"
        : "https://grafana.eu-west-1.production.aws-grafana-observability.quatt.dev";
  return `${baseUrl}/d/${dashboardPath}?${params}`;
}

// Primary Grafana links (new observability platform)
export function getPrimaryGrafanaDataPerCICLink(id: string) {
  return buildPrimaryGrafanaUrl(
    "data-per-cic_sf/data-per-cic",
    `var-cic_uuid=${id}&from=now-6h&to=now&orgId=1&refresh=30s`,
  );
}

export function getPrimaryGrafanaAllEDashboardLink(id: string) {
  return buildPrimaryGrafanaUrl(
    "all-e-dashboard_sf/all-e-dashboard",
    `var-cic_uuid=${id}&from=now-6h&to=now&orgId=1&refresh=30s`,
  );
}

export function getPrimaryGrafanaDiagnosticsLink(id: string) {
  return buildPrimaryGrafanaUrl(
    "diagnostics_sf/diagnostics",
    `var-cic_uuid=${id}&from=now-6h&to=now&orgId=1&refresh=30s`,
  );
}

export function getPrimaryGrafanaChillStatsDashboardLink(
  cicId: string,
  serialNumber: string,
  eui64: string,
) {
  return buildPrimaryGrafanaUrl(
    "chill-stats-dashboard_sf/chill-stats-dashboard",
    `orgId=1&refresh=30s&var-cic_uuid=${cicId}&var-serialNumber=${serialNumber}&var-eui64=${eui64}`,
  );
}

export function getPrimaryGrafanaThreadDeviceDashboardLink(id: string) {
  return buildPrimaryGrafanaUrl(
    "thread-device-dashboard_sf/thread-device-dashboard",
    `var-cic_uuid=${id}&from=now-6h&to=now&orgId=1&refresh=30s`,
  );
}

// Fallback Grafana links (legacy AWS Managed Grafana)
export function getFallbackGrafanaDataPerCICLink(id: string) {
  return buildFallbackGrafanaUrl(
    "clickhouse-data-per-cic/clickhouse-data-per-cic",
    `var-cic_uuid=${id}&from=now-6h&to=now&orgId=1&refresh=30s`,
  );
}

export function getFallbackGrafanaAllEDashboardLink(id: string) {
  return buildFallbackGrafanaUrl(
    "all-e-dashboard/all-e-dashboard",
    `var-cic_uuid=${id}&from=now-6h&to=now&orgId=1&refresh=30s`,
  );
}

export function getFallbackGrafanaDiagnosticsLink(id: string) {
  return buildFallbackGrafanaUrl(
    "clickhouse-diagnostics/clickhouse-diagnostics",
    `var-cic_uuid=${id}&from=now-6h&to=now&orgId=1&refresh=30s`,
  );
}

export function getHubspotSearchOrderLink(orderNumber: string) {
  const env = getEnvironment();

  if (env.isLocal || env.isDevelopment || env.isStaging) {
    return `https://app.hubspot.com/contacts/139510613/objects/0-3/views/all/list?query="${orderNumber}"`;
  }
  return `https://app-eu1.hubspot.com/contacts/25848718/objects/0-3/views/all/list?query="${orderNumber}"`;
}

export function getHubspotDealLink(
  hubspotDealId: string | null,
  houseId: string | null,
) {
  const env = getEnvironment();

  if (env.isLocal || env.isDevelopment || env.isStaging) {
    if (houseId) {
      return `https://app-eu1.hubspot.com/contacts/139510613/record/2-138964309/${houseId}`;
    }
    return hubspotDealId
      ? `https://app-eu1.hubspot.com/contacts/139510613/record/0-3/${hubspotDealId}`
      : undefined;
  }
  if (houseId) {
    return `https://app-eu1.hubspot.com/contacts/25848718/record/2-138343985/${houseId}`;
  }
  return hubspotDealId
    ? `https://app-eu1.hubspot.com/contacts/25848718/record/0-3/${hubspotDealId}`
    : undefined;
}

export function getZuperJobLink(jobUid: string) {
  return `https://app.zuperpro.com/jobs/${jobUid}/details`;
}

export function getFallbackGrafanaChillStatsDashboardLink(
  cicId: string,
  serialNumber: string,
  eui64: string,
) {
  return buildFallbackGrafanaUrl(
    "chill-stats-dashboard/chill-stats-dashboard",
    `orgId=1&refresh=30s&var-cic_uuid=${cicId}&var-serialNumber=${serialNumber}&var-eui64=${eui64}`,
  );
}

export function getRetoolBatteryDashboardLink(batterySn: string) {
  return `https://quatt.retool.com/app/battery-dashboard?_environment=production&battery_sn=${batterySn}`;
}
