
import { db } from '../db';
import { devicesTable, tenantsTable } from '../db/schema';
import { type UpdateDeviceInput, type Device } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateDevice(input: UpdateDeviceInput): Promise<Device> {
  try {
    // Check if device exists
    const existingDevice = await db.select()
      .from(devicesTable)
      .where(eq(devicesTable.id, input.id))
      .execute();

    if (existingDevice.length === 0) {
      throw new Error(`Device with id ${input.id} not found`);
    }

    // If tenant_id is being updated, validate it exists
    if (input.tenant_id) {
      const tenant = await db.select()
        .from(tenantsTable)
        .where(eq(tenantsTable.id, input.tenant_id))
        .execute();

      if (tenant.length === 0) {
        throw new Error(`Tenant with id ${input.tenant_id} not found`);
      }
    }

    // Update device record
    const result = await db.update(devicesTable)
      .set({
        ...input,
        updated_at: new Date()
      })
      .where(eq(devicesTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Device update failed:', error);
    throw error;
  }
}
