
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { devicesTable, tenantsTable } from '../db/schema';
import { type CreateDeviceInput, type CreateTenantInput } from '../schema';
import { createDevice } from '../handlers/create_device';
import { eq } from 'drizzle-orm';

// Test tenant to reference
const testTenant: CreateTenantInput = {
  name: 'Test Tenant',
  contact_person: 'John Doe',
  contact_email: 'john@example.com',
  status: 'Active'
};

// Test device input
const testDeviceInput: CreateDeviceInput = {
  name: 'Test Device',
  device_type: 'Sensor',
  serial_number: 'SN123456',
  status: 'Online',
  tenant_id: 1 // Will be updated with actual tenant ID
};

describe('createDevice', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a device', async () => {
    // Create tenant first
    const tenantResult = await db.insert(tenantsTable)
      .values(testTenant)
      .returning()
      .execute();
    
    const tenantId = tenantResult[0].id;
    
    // Create device with valid tenant_id
    const deviceInput = { ...testDeviceInput, tenant_id: tenantId };
    const result = await createDevice(deviceInput);

    // Basic field validation
    expect(result.name).toEqual('Test Device');
    expect(result.device_type).toEqual('Sensor');
    expect(result.serial_number).toEqual('SN123456');
    expect(result.status).toEqual('Online');
    expect(result.tenant_id).toEqual(tenantId);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save device to database', async () => {
    // Create tenant first
    const tenantResult = await db.insert(tenantsTable)
      .values(testTenant)
      .returning()
      .execute();
    
    const tenantId = tenantResult[0].id;
    
    // Create device
    const deviceInput = { ...testDeviceInput, tenant_id: tenantId };
    const result = await createDevice(deviceInput);

    // Query database to verify device was saved
    const devices = await db.select()
      .from(devicesTable)
      .where(eq(devicesTable.id, result.id))
      .execute();

    expect(devices).toHaveLength(1);
    expect(devices[0].name).toEqual('Test Device');
    expect(devices[0].device_type).toEqual('Sensor');
    expect(devices[0].serial_number).toEqual('SN123456');
    expect(devices[0].status).toEqual('Online');
    expect(devices[0].tenant_id).toEqual(tenantId);
    expect(devices[0].created_at).toBeInstanceOf(Date);
    expect(devices[0].updated_at).toBeInstanceOf(Date);
  });

  it('should reject device creation with non-existent tenant_id', async () => {
    // Try to create device with non-existent tenant_id
    const deviceInput = { ...testDeviceInput, tenant_id: 999 };
    
    await expect(createDevice(deviceInput)).rejects.toThrow(/tenant with id 999 does not exist/i);
  });

  it('should create multiple devices for the same tenant', async () => {
    // Create tenant first
    const tenantResult = await db.insert(tenantsTable)
      .values(testTenant)
      .returning()
      .execute();
    
    const tenantId = tenantResult[0].id;
    
    // Create first device
    const device1Input = { ...testDeviceInput, tenant_id: tenantId, serial_number: 'SN111' };
    const result1 = await createDevice(device1Input);
    
    // Create second device
    const device2Input = { ...testDeviceInput, tenant_id: tenantId, serial_number: 'SN222', name: 'Device 2' };
    const result2 = await createDevice(device2Input);

    // Verify both devices exist
    const devices = await db.select()
      .from(devicesTable)
      .where(eq(devicesTable.tenant_id, tenantId))
      .execute();

    expect(devices).toHaveLength(2);
    expect(devices.map(d => d.serial_number)).toContain('SN111');
    expect(devices.map(d => d.serial_number)).toContain('SN222');
    expect(result1.id).not.toEqual(result2.id);
  });
});
