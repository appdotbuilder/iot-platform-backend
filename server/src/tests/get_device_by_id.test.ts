
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tenantsTable, devicesTable } from '../db/schema';
import { type CreateTenantInput, type CreateDeviceInput, type IdParam } from '../schema';
import { getDeviceById } from '../handlers/get_device_by_id';

// Test tenant data
const testTenant: CreateTenantInput = {
  name: 'Test Tenant',
  contact_person: 'John Doe',
  contact_email: 'john@test.com',
  status: 'Active'
};

// Test device data
const testDevice: CreateDeviceInput = {
  name: 'Test Device',
  device_type: 'Sensor',
  serial_number: 'SN123456',
  status: 'Online',
  tenant_id: 0 // Will be set after creating tenant
};

describe('getDeviceById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return device when found', async () => {
    // Create tenant first
    const tenantResult = await db.insert(tenantsTable)
      .values(testTenant)
      .returning()
      .execute();
    
    const tenantId = tenantResult[0].id;

    // Create device
    const deviceResult = await db.insert(devicesTable)
      .values({
        ...testDevice,
        tenant_id: tenantId
      })
      .returning()
      .execute();

    const deviceId = deviceResult[0].id;

    // Test the handler
    const input: IdParam = { id: deviceId };
    const result = await getDeviceById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(deviceId);
    expect(result!.name).toEqual('Test Device');
    expect(result!.device_type).toEqual('Sensor');
    expect(result!.serial_number).toEqual('SN123456');
    expect(result!.status).toEqual('Online');
    expect(result!.tenant_id).toEqual(tenantId);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when device not found', async () => {
    const input: IdParam = { id: 999 };
    const result = await getDeviceById(input);

    expect(result).toBeNull();
  });

  it('should return correct device when multiple devices exist', async () => {
    // Create tenant first
    const tenantResult = await db.insert(tenantsTable)
      .values(testTenant)
      .returning()
      .execute();
    
    const tenantId = tenantResult[0].id;

    // Create multiple devices
    const device1Result = await db.insert(devicesTable)
      .values({
        name: 'Device 1',
        device_type: 'Sensor',
        serial_number: 'SN001',
        status: 'Online',
        tenant_id: tenantId
      })
      .returning()
      .execute();

    const device2Result = await db.insert(devicesTable)
      .values({
        name: 'Device 2',
        device_type: 'Controller',
        serial_number: 'SN002',
        status: 'Offline',
        tenant_id: tenantId
      })
      .returning()
      .execute();

    // Test getting specific device
    const input: IdParam = { id: device2Result[0].id };
    const result = await getDeviceById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(device2Result[0].id);
    expect(result!.name).toEqual('Device 2');
    expect(result!.device_type).toEqual('Controller');
    expect(result!.serial_number).toEqual('SN002');
    expect(result!.status).toEqual('Offline');
  });
});
