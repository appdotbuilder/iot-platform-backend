
import { db } from '../db';
import { devicesTable, tenantsTable } from '../db/schema';
import { type CreateDeviceInput, type Device } from '../schema';
import { eq } from 'drizzle-orm';

export async function createDevice(input: CreateDeviceInput): Promise<Device> {
  try {
    // First, verify that the tenant exists
    const tenant = await db.select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, input.tenant_id))
      .execute();

    if (tenant.length === 0) {
      throw new Error(`Tenant with ID ${input.tenant_id} does not exist`);
    }

    // Insert device record
    const result = await db.insert(devicesTable)
      .values({
        name: input.name,
        device_type: input.device_type,
        serial_number: input.serial_number,
        status: input.status,
        tenant_id: input.tenant_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Device creation failed:', error);
    throw error;
  }
}
