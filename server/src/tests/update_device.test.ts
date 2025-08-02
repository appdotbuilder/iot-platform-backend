
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tenantsTable, devicesTable } from '../db/schema';
import { type CreateTenantInput, type CreateDeviceInput, type UpdateDeviceInput } from '../schema';
import { updateDevice } from '../handlers/update_device';
import { eq } from 'drizzle-orm';

// Test data
const testTenant: CreateTenantInput = {
  name: 'Test Tenant',
  contact_person: 'John Doe',
  contact_email: 'john@test.com',
  status: 'Active'
};

const testDevice: CreateDeviceInput = {
  name: 'Test Device',
  device_type: 'Sensor',
  serial_number: 'SN123',
  status: 'Online',
  tenant_id: 1
};

describe('updateDevice', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update device successfully', async () => {
    // Create tenant and device
    await db.insert(tenantsTable).values(testTenant).execute();
    await db.insert(devicesTable).values(testDevice).execute();

    const updateInput: UpdateDeviceInput = {
      id: 1,
      name: 'Updated Device Name',
      device_type: 'Updated Type',
      status: 'Offline'
    };

    const result = await updateDevice(updateInput);

    expect(result.id).toEqual(1);
    expect(result.name).toEqual('Updated Device Name');
    expect(result.device_type).toEqual('Updated Type');
    expect(result.status).toEqual('Offline');
    expect(result.serial_number).toEqual('SN123'); // Unchanged
    expect(result.tenant_id).toEqual(1); // Unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update device in database', async () => {
    // Create tenant and device
    await db.insert(tenantsTable).values(testTenant).execute();
    await db.insert(devicesTable).values(testDevice).execute();

    const updateInput: UpdateDeviceInput = {
      id: 1,
      name: 'Updated Device Name'
    };

    await updateDevice(updateInput);

    // Verify update in database
    const devices = await db.select()
      .from(devicesTable)
      .where(eq(devicesTable.id, 1))
      .execute();

    expect(devices).toHaveLength(1);
    expect(devices[0].name).toEqual('Updated Device Name');
    expect(devices[0].device_type).toEqual('Sensor'); // Unchanged
  });

  it('should update tenant_id when provided', async () => {
    // Create two tenants and one device
    await db.insert(tenantsTable).values(testTenant).execute();
    await db.insert(tenantsTable).values({
      name: 'Second Tenant',
      contact_person: 'Jane Doe',
      contact_email: 'jane@test.com',
      status: 'Active'
    }).execute();
    await db.insert(devicesTable).values(testDevice).execute();

    const updateInput: UpdateDeviceInput = {
      id: 1,
      tenant_id: 2
    };

    const result = await updateDevice(updateInput);

    expect(result.tenant_id).toEqual(2);
  });

  it('should throw error when device not found', async () => {
    const updateInput: UpdateDeviceInput = {
      id: 999,
      name: 'Updated Name'
    };

    expect(updateDevice(updateInput)).rejects.toThrow(/device with id 999 not found/i);
  });

  it('should throw error when tenant_id does not exist', async () => {
    // Create tenant and device
    await db.insert(tenantsTable).values(testTenant).execute();
    await db.insert(devicesTable).values(testDevice).execute();

    const updateInput: UpdateDeviceInput = {
      id: 1,
      tenant_id: 999
    };

    expect(updateDevice(updateInput)).rejects.toThrow(/tenant with id 999 not found/i);
  });

  it('should update only provided fields', async () => {
    // Create tenant and device
    await db.insert(tenantsTable).values(testTenant).execute();
    await db.insert(devicesTable).values(testDevice).execute();

    const updateInput: UpdateDeviceInput = {
      id: 1,
      status: 'Error'
    };

    const result = await updateDevice(updateInput);

    // Only status should be updated
    expect(result.status).toEqual('Error');
    expect(result.name).toEqual('Test Device');
    expect(result.device_type).toEqual('Sensor');
    expect(result.serial_number).toEqual('SN123');
    expect(result.tenant_id).toEqual(1);
  });
});
