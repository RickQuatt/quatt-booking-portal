/**
 * TypeScript module augmentation for OpenAPI Generator enum bugs
 *
 * The OpenAPI generator has a bug where it creates enums with names like:
 * - AdminRebootDeviceOperationXClientPlatformEnum
 * - SendCommandToCICOperationXClientPlatformEnum
 *
 * But references them in interfaces with names like:
 * - AdminRebootDeviceXClientPlatformEnum (missing "Operation")
 * - SendCommandToCICXClientPlatformEnum (missing "Operation")
 *
 * This file uses module augmentation to add the missing enum declarations
 * to the generated module without modifying the generated file directly.
 */

import "./apis/SupportDashboardApi";

declare module "./apis/SupportDashboardApi" {
  // Add the missing enum constants that are referenced but not declared
  export const AdminRebootDeviceXClientPlatformEnum: typeof AdminRebootDeviceOperationXClientPlatformEnum;
  export const SendCommandToCICXClientPlatformEnum: typeof SendCommandToCICOperationXClientPlatformEnum;

  // Add the missing type aliases
  export type AdminRebootDeviceXClientPlatformEnum =
    AdminRebootDeviceOperationXClientPlatformEnum;
  export type SendCommandToCICXClientPlatformEnum =
    SendCommandToCICOperationXClientPlatformEnum;
}
