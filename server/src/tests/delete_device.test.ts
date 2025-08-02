
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tenantsTable, devicesTable } from '../db/schema';
import { type IdParam } from '../schema';
import { deleteDevice } from '../handlers/delete_device';
import { eq } from 'drizzle-orm';

describe('deleteDevice', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a device successfully', async () => {
    // Create prerequisite tenant
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

    // Create device to delete
    const deviceResult = await db.insert(devicesTable)
      .values({
        name: 'Test Device',
        device_type: 'Sensor',
        serial_number: 'SN123456',
        status: 'Online',
        tenant_id: tenantId
      })
      .returning()
      .execute();

    const deviceId = deviceResult[0].id;
    const input: IdParam = { id: deviceId };

    // Delete the device
    const result = await deleteDevice(input);

    // Verify response
    expect(result.success).toBe(true);

    // Verify device was actually deleted from database
    const devices = await db.select()
      .from(devicesTable)
      .where(eq(devicesTable.id, deviceId))
      .execute();

    expect(devices).toHaveLength(0);
  });

  it('should throw error when device does not exist', async () => {
    const input: IdParam = { id: 999 };

    // Attempt to delete non-existent device
    expect(deleteDevice(input)).rejects.toThrow(/Device with ID 999 not found/i);
  });

  it('should not affect other devices when deleting one', async () => {
    // Create prerequisite tenant
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

    // Create multiple devices
    const device1Result = await db.insert(devicesTable)
      .values({
        name: 'Device 1',
        device_type: 'Sensor',
        serial_number: 'SN111111',
        status: 'Online',
        tenant_id: tenantId
      })
      .returning()
      .execute();

    const device2Result = await db.insert(devicesTable)
      .values({
        name: 'Device 2',
        device_type: 'Controller',
        serial_number: 'SN222222',
        status: 'Offline',
        tenant_id: tenantId
      })
      .returning()
      .execute();

    const device1Id = device1Result[0].id;
    const device2Id = device2Result[0].id;

    // Delete first device
    const input: IdParam = { id: device1Id };
    const result = await deleteDevice(input);

    expect(result.success).toBe(true);

    // Verify first device is deleted
    const deletedDevices = await db.select()
      .from(devicesTable)
      .where(eq(devicesTable.id, device1Id))
      .execute();

    expect(deletedDevices).toHaveLength(0);

    // Verify second device still exists
    const remainingDevices = await db.select()
      .from(devicesTable)
      .where(eq(devicesTable.id, device2Id))
      .execute();

    expect(remainingDevices).toHaveLength(1);
    expect(remainingDevices[0].name).toBe('Device 2');
  });
});
