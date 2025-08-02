
import { z } from 'zod';

// Enums
export const tenantStatusEnum = z.enum(['Active', 'Inactive']);
export const deviceStatusEnum = z.enum(['Online', 'Offline', 'Error']);

// Tenant schemas
export const tenantSchema = z.object({
  id: z.number(),
  name: z.string(),
  contact_person: z.string(),
  contact_email: z.string().email(),
  status: tenantStatusEnum,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Tenant = z.infer<typeof tenantSchema>;

export const createTenantInputSchema = z.object({
  name: z.string().min(1, 'Tenant name is required'),
  contact_person: z.string().min(1, 'Contact person is required'),
  contact_email: z.string().email('Valid email is required'),
  status: tenantStatusEnum
});

export type CreateTenantInput = z.infer<typeof createTenantInputSchema>;

export const updateTenantInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Tenant name is required').optional(),
  contact_person: z.string().min(1, 'Contact person is required').optional(),
  contact_email: z.string().email('Valid email is required').optional(),
  status: tenantStatusEnum.optional()
});

export type UpdateTenantInput = z.infer<typeof updateTenantInputSchema>;

// Device schemas
export const deviceSchema = z.object({
  id: z.number(),
  name: z.string(),
  device_type: z.string(),
  serial_number: z.string(),
  status: deviceStatusEnum,
  tenant_id: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Device = z.infer<typeof deviceSchema>;

export const createDeviceInputSchema = z.object({
  name: z.string().min(1, 'Device name is required'),
  device_type: z.string().min(1, 'Device type is required'),
  serial_number: z.string().min(1, 'Serial number is required'),
  status: deviceStatusEnum,
  tenant_id: z.number().positive('Valid tenant ID is required')
});

export type CreateDeviceInput = z.infer<typeof createDeviceInputSchema>;

export const updateDeviceInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Device name is required').optional(),
  device_type: z.string().min(1, 'Device type is required').optional(),
  serial_number: z.string().min(1, 'Serial number is required').optional(),
  status: deviceStatusEnum.optional(),
  tenant_id: z.number().positive('Valid tenant ID is required').optional()
});

export type UpdateDeviceInput = z.infer<typeof updateDeviceInputSchema>;

// Dashboard schema
export const dashboardStatsSchema = z.object({
  total_tenants: z.number().int().nonnegative(),
  active_tenants: z.number().int().nonnegative(),
  total_devices: z.number().int().nonnegative(),
  online_devices: z.number().int().nonnegative()
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// ID parameter schema for delete/get operations
export const idParamSchema = z.object({
  id: z.number().positive('Valid ID is required')
});

export type IdParam = z.infer<typeof idParamSchema>;
