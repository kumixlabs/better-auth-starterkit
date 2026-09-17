import { createAuthPlugin } from "@better-auth-ui/core";
import {
  deviceAuthorizationPlugin as coreDeviceAuthorizationPlugin,
  type DeviceAuthorizationPluginOptions,
} from "@better-auth-ui/core/plugins/device-authorization";

import { DeviceAuthorization } from "../device-authorization/device-authorization";

export const deviceAuthorizationPlugin = createAuthPlugin(
  coreDeviceAuthorizationPlugin.id,
  (options: DeviceAuthorizationPluginOptions = {}) => ({
    ...coreDeviceAuthorizationPlugin(options),
    views: {
      auth: {
        deviceAuthorization: DeviceAuthorization,
      },
    },
  }),
);
