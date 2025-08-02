
import { serial, text, pgTable, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const tenantStatusEnum = pgEnum('tenant_status', ['Active', 'Inactive']);
export const deviceStatusEnum = pgEnum('device_status', ['Online', 'Offline', 'Error']);

// Tenants table
export const tenantsTable = pgTable('tenants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  contact_person: text('contact_person').notNull(),
  contact_email: text('contact_email').notNull(),
  status: tenantStatusEnum('status').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Devices table
export const devicesTable = pgTable('devices', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  device_type: text('device_type').notNull(),
  serial_number: text('serial_number').notNull(),
  status: deviceStatusEnum('status').notNull(),
  tenant_id: integer('tenant_id').notNull().references(() => tenantsTable.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const tenantsRelations = relations(tenantsTable, ({ many }) => ({
  devices: many(devicesTable),
}));

export const devicesRelations = relations(devicesTable, ({ one }) => ({
  tenant: one(tenantsTable, {
    fields: [devicesTable.tenant_id],
    references: [tenantsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Tenant = typeof tenantsTable.$inferSelect;
export type NewTenant = typeof tenantsTable.$inferInsert;
export type Device = typeof devicesTable.$inferSelect;
export type NewDevice = typeof devicesTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  tenants: tenantsTable, 
  devices: devicesTable 
};
