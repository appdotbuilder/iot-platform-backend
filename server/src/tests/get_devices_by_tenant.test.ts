
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tenantsTable, devicesTable } from '../db/schema';
import { type IdParam } from '../schema';
import { getDevicesByTenant } from '../handlers/get_devices_by_tenant';

describe('getDevicesByTenant', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return devices for a specific tenant', async () => {
    // Create tenant first
    const tenantResult = await db.insert(tenantsTable)
      .values({
        name: 'Test Tenant',
        contact_person: 'John Doe',
        contact_email: 'john@test.com',
        status: 'Active'
      })
      .returning()
      .execute();

    const tenantId = tenantResult[0].id;

    // Create devices for this tenant
    await db.insert(devicesTable)
      .values([
        {
          name: 'Device 1',
          device_type: 'Sensor',
          serial_number: 'SN001',
          status: 'Online',
          tenant_id: tenantId
        },
        {
          name: 'Device 2',
          device_type: 'Camera',
          serial_number: 'SN002',
          status: 'Offline',
          tenant_id: tenantId
        }
      ])
      .execute();

    const input: IdParam = { id: tenantId };
    const result = await getDevicesByTenant(input);

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('Device 1');
    expect(result[0].device_type).toEqual('Sensor');
    expect(result[0].tenant_id).toEqual(tenantId);
    expect(result[1].name).toEqual('Device 2');
    expect(result[1].device_type).toEqual('Camera');
    expect(result[1].tenant_id).toEqual(tenantId);
  });

  it('should return empty array for tenant with no devices', async () => {
    // Create tenant without devices
    const tenantResult = await db.insert(tenantsTable)
      .values({
        name: 'Empty Tenant',
        contact_person: 'Jane Doe',
        contact_email: 'jane@test.com',
        status: 'Active'
      })
      .returning()
      .execute();

    const input: IdParam = { id: tenantResult[0].id };
    const result = await getDevicesByTenant(input);

    expect(result).toHaveLength(0);
  });

  it('should only return devices for the specified tenant', async () => {
    // Create two tenants
    const tenant1Result = await db.insert(tenantsTable)
      .values({
        name: 'Tenant 1',
        contact_person: 'John Doe',
        contact_email: 'john@test.com',
        status: 'Active'
      })
      .returning()
      .execute();

    const tenant2Result = await db.insert(tenantsTable)
      .values({
        name: 'Tenant 2',
        contact_person: 'Jane Doe',
        contact_email: 'jane@test.com',
        status: 'Active'
      })
      .returning()
      .execute();

    const tenant1Id = tenant1Result[0].id;
    const tenant2Id = tenant2Result[0].id;

    // Create devices for both tenants
    await db.insert(devicesTable)
      .values([
        {
          name: 'Tenant 1 Device',
          device_type: 'Sensor',
          serial_number: 'SN001',
          status: 'Online',
          tenant_id: tenant1Id
        },
        {
          name: 'Tenant 2 Device',
          device_type: 'Camera',
          serial_number: 'SN002',
          status: 'Offline',
          tenant_id: tenant2Id
        }
      ])
      .execute();

    const input: IdParam = { id: tenant1Id };
    const result = await getDevicesByTenant(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Tenant 1 Device');
    expect(result[0].tenant_id).toEqual(tenant1Id);
  });
});
