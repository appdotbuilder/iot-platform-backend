
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tenantsTable, devicesTable } from '../db/schema';
import { type CreateTenantInput, type CreateDeviceInput } from '../schema';
import { getDevices } from '../handlers/get_devices';

describe('getDevices', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no devices exist', async () => {
    const result = await getDevices();

    expect(result).toEqual([]);
  });

  it('should return all devices', async () => {
    // Create a test tenant first (required for foreign key)
    const tenantResult = await db.insert(tenantsTable)
      .values({
        name: 'Test Tenant',
        contact_person: 'John Doe',
        contact_email: 'john@example.com',
        status: 'Active'
      })
      .returning()
      .execute();

    const tenantId = tenantResult[0].id;

    // Create test devices
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
          device_type: 'Controller',
          serial_number: 'SN002',
          status: 'Offline',
          tenant_id: tenantId
        }
      ])
      .execute();

    const result = await getDevices();

    expect(result).toHaveLength(2);
    
    // Verify first device
    expect(result[0].name).toEqual('Device 1');
    expect(result[0].device_type).toEqual('Sensor');
    expect(result[0].serial_number).toEqual('SN001');
    expect(result[0].status).toEqual('Online');
    expect(result[0].tenant_id).toEqual(tenantId);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Verify second device
    expect(result[1].name).toEqual('Device 2');
    expect(result[1].device_type).toEqual('Controller');
    expect(result[1].serial_number).toEqual('SN002');
    expect(result[1].status).toEqual('Offline');
    expect(result[1].tenant_id).toEqual(tenantId);
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[1].updated_at).toBeInstanceOf(Date);
  });

  it('should return devices from multiple tenants', async () => {
    // Create two test tenants
    const tenant1Result = await db.insert(tenantsTable)
      .values({
        name: 'Tenant 1',
        contact_person: 'John Doe',
        contact_email: 'john@example.com',
        status: 'Active'
      })
      .returning()
      .execute();

    const tenant2Result = await db.insert(tenantsTable)
      .values({
        name: 'Tenant 2',
        contact_person: 'Jane Smith',
        contact_email: 'jane@example.com',
        status: 'Inactive'
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
          serial_number: 'T1SN001',
          status: 'Online',
          tenant_id: tenant1Id
        },
        {
          name: 'Tenant 2 Device',
          device_type: 'Controller',
          serial_number: 'T2SN001',
          status: 'Error',
          tenant_id: tenant2Id
        }
      ])
      .execute();

    const result = await getDevices();

    expect(result).toHaveLength(2);
    
    // Find devices by tenant_id since order is not guaranteed
    const tenant1Device = result.find(d => d.tenant_id === tenant1Id);
    const tenant2Device = result.find(d => d.tenant_id === tenant2Id);

    expect(tenant1Device).toBeDefined();
    expect(tenant1Device!.name).toEqual('Tenant 1 Device');
    expect(tenant1Device!.serial_number).toEqual('T1SN001');

    expect(tenant2Device).toBeDefined();
    expect(tenant2Device!.name).toEqual('Tenant 2 Device');
    expect(tenant2Device!.serial_number).toEqual('T2SN001');
  });
});
