
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tenantsTable, devicesTable } from '../db/schema';
import { type CreateTenantInput, type CreateDeviceInput, type IdParam } from '../schema';
import { deleteTenant } from '../handlers/delete_tenant';
import { eq } from 'drizzle-orm';

describe('deleteTenant', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing tenant', async () => {
    // Create test tenant
    const tenantData: CreateTenantInput = {
      name: 'Test Tenant',
      contact_person: 'John Doe',
      contact_email: 'john@example.com',
      status: 'Active'
    };

    const tenantResult = await db.insert(tenantsTable)
      .values(tenantData)
      .returning()
      .execute();

    const tenantId = tenantResult[0].id;
    const input: IdParam = { id: tenantId };

    // Delete the tenant
    const result = await deleteTenant(input);

    expect(result.success).toBe(true);

    // Verify tenant was deleted
    const deletedTenant = await db.select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, tenantId))
      .execute();

    expect(deletedTenant).toHaveLength(0);
  });

  it('should cascade delete associated devices', async () => {
    // Create test tenant
    const tenantData: CreateTenantInput = {
      name: 'Test Tenant',
      contact_person: 'John Doe',
      contact_email: 'john@example.com',
      status: 'Active'
    };

    const tenantResult = await db.insert(tenantsTable)
      .values(tenantData)
      .returning()
      .execute();

    const tenantId = tenantResult[0].id;

    // Create test device associated with tenant
    const deviceData: CreateDeviceInput = {
      name: 'Test Device',
      device_type: 'Sensor',
      serial_number: 'SN123456',
      status: 'Online',
      tenant_id: tenantId
    };

    const deviceResult = await db.insert(devicesTable)
      .values(deviceData)
      .returning()
      .execute();

    const deviceId = deviceResult[0].id;
    const input: IdParam = { id: tenantId };

    // Delete the tenant
    const result = await deleteTenant(input);

    expect(result.success).toBe(true);

    // Verify tenant was deleted
    const deletedTenant = await db.select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, tenantId))
      .execute();

    expect(deletedTenant).toHaveLength(0);

    // Verify associated device was also deleted (cascade)
    const deletedDevice = await db.select()
      .from(devicesTable)
      .where(eq(devicesTable.id, deviceId))
      .execute();

    expect(deletedDevice).toHaveLength(0);
  });

  it('should throw error when tenant does not exist', async () => {
    const input: IdParam = { id: 99999 };

    await expect(deleteTenant(input)).rejects.toThrow(/tenant with id 99999 not found/i);
  });

  it('should handle deletion of tenant with no devices', async () => {
    // Create test tenant without any devices
    const tenantData: CreateTenantInput = {
      name: 'Tenant Without Devices',
      contact_person: 'Jane Smith',
      contact_email: 'jane@example.com',
      status: 'Inactive'
    };

    const tenantResult = await db.insert(tenantsTable)
      .values(tenantData)
      .returning()
      .execute();

    const tenantId = tenantResult[0].id;
    const input: IdParam = { id: tenantId };

    // Delete the tenant
    const result = await deleteTenant(input);

    expect(result.success).toBe(true);

    // Verify tenant was deleted
    const deletedTenant = await db.select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, tenantId))
      .execute();

    expect(deletedTenant).toHaveLength(0);
  });
});
