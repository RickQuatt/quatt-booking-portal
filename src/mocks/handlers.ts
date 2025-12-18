import { http, HttpResponse } from "msw";

const API_BASE = import.meta.env.VITE_API_BASE_PATH || "/api/v1";

export const handlers = [
  // Dashboard endpoint
  http.get(`${API_BASE}/admin/cic/dashboard`, () => {
    return HttpResponse.json({
      result: {
        totalCics: 1234,
        healthyPercentage: 95.5,
        criticalIssues: 12,
        onlineCics: 1180,
        offlineCics: 54,
        versions: {
          "v2.15.0": 850,
          "v2.14.0": 320,
          "v2.13.0": 64,
        },
      },
    });
  }),

  // CIC detail endpoint
  http.get(`${API_BASE}/admin/cics/:cicId`, ({ params }) => {
    return HttpResponse.json({
      result: {
        id: params.cicId,
        status: "online",
        firmware: "v2.15.0",
        lastSeen: new Date().toISOString(),
        healthScore: 95,
      },
    });
  }),

  // More handlers will be added as needed
];
