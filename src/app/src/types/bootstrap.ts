export type BootstrapResponse = {
  status: "ok";
  serviceName: string;
  version: string;
  serverTime: string;
  features: string[];
};
