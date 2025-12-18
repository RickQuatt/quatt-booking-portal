import type { TourStep } from "@/hooks/useTour";

export const SIDEBAR_TOUR_ID = "sidebar";

export const sidebarTourSteps: TourStep[] = [
  {
    element: "body",
    title: "Welcome!",
    description:
      "Welcome to the NEW Quatt Support Dashboard! Let's take a quick tour!",
    side: "over",
    disableOverlay: true,
  },
  {
    element: '[data-tour="sidebar-toggle"]',
    title: "Expand/Collapse",
    description: "Click to expand or collapse the sidebar",
  },
  {
    element: '[data-tour="nav-cic-dashboard"]',
    title: "CIC Dashboard",
    description: "View health metrics and aggregated CIC data",
  },
  {
    element: '[data-tour="nav-cic-list"]',
    title: "CIC List",
    description: "Browse and search all CICs",
  },
  {
    element: '[data-tour="nav-installers"]',
    title: "Installers",
    description: "Manage installer accounts",
  },
  {
    element: '[data-tour="nav-installations"]',
    title: "Installations",
    description: "Track installation status and details",
  },
  {
    element: '[data-tour="nav-dynamic-pricing"]',
    title: "Dynamic Pricing",
    description: "View dynamic pricing information",
  },
  {
    element: '[data-tour="nav-devices"]',
    title: "Devices",
    description: "Browse device inventory",
  },
  {
    element: '[data-tour="nav-legacy"]',
    title: "Legacy Dashboard",
    description: "Access the previous dashboard version (opens in new tab)",
    side: "right",
  },
  {
    element: '[data-tour="theme-toggle"]',
    title: "Theme Toggle",
    description: "Switch between light and dark mode",
  },
  {
    element: '[data-tour="logout-btn"]',
    title: "Logout",
    description: "Sign out of your account",
  },
  {
    element: '[data-tour="tour-info"]',
    title: "Replay Tour",
    description: "Click here anytime to replay this tour",
  },
  {
    element: "body",
    title: "You're all set!",
    description:
      "That's everything! Start exploring the dashboard. If you need to see this tour again, click the info icon in the sidebar. Send any questions & feature requests to #support-dashboard on Slack.",
    side: "over",
    disableOverlay: true,
  },
];
