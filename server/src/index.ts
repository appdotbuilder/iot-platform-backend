
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  createTenantInputSchema, 
  updateTenantInputSchema, 
  createDeviceInputSchema, 
  updateDeviceInputSchema,
  idParamSchema 
} from './schema';

import { createTenant } from './handlers/create_tenant';
import { getTenants } from './handlers/get_tenants';
import { getTenantById } from './handlers/get_tenant_by_id';
import { updateTenant } from './handlers/update_tenant';
import { deleteTenant } from './handlers/delete_tenant';

import { createDevice } from './handlers/create_device';
import { getDevices } from './handlers/get_devices';
import { getDeviceById } from './handlers/get_device_by_id';
import { getDevicesByTenant } from './handlers/get_devices_by_tenant';
import { updateDevice } from './handlers/update_device';
import { deleteDevice } from './handlers/delete_device';

import { getDashboardStats } from './handlers/get_dashboard_stats';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Tenant endpoints
  createTenant: publicProcedure
    .input(createTenantInputSchema)
    .mutation(({ input }) => createTenant(input)),

  getTenants: publicProcedure
    .query(() => getTenants()),

  getTenantById: publicProcedure
    .input(idParamSchema)
    .query(({ input }) => getTenantById(input)),

  updateTenant: publicProcedure
    .input(updateTenantInputSchema)
    .mutation(({ input }) => updateTenant(input)),

  deleteTenant: publicProcedure
    .input(idParamSchema)
    .mutation(({ input }) => deleteTenant(input)),

  // Device endpoints
  createDevice: publicProcedure
    .input(createDeviceInputSchema)
    .mutation(({ input }) => createDevice(input)),

  getDevices: publicProcedure
    .query(() => getDevices()),

  getDeviceById: publicProcedure
    .input(idParamSchema)
    .query(({ input }) => getDeviceById(input)),

  getDevicesByTenant: publicProcedure
    .input(idParamSchema)
    .query(({ input }) => getDevicesByTenant(input)),

  updateDevice: publicProcedure
    .input(updateDeviceInputSchema)
    .mutation(({ input }) => updateDevice(input)),

  deleteDevice: publicProcedure
    .input(idParamSchema)
    .mutation(({ input }) => deleteDevice(input)),

  // Dashboard endpoint
  getDashboardStats: publicProcedure
    .query(() => getDashboardStats()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
