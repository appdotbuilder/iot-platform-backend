
import { db } from '../db';
import { devicesTable } from '../db/schema';
import { type Device, type IdParam } from '../schema';
import { eq } from 'drizzle-orm';

export const getDevicesByTenant = async (input: IdParam): Promise<Device[]> => {
  try {
    const results = await db.select()
      .from(devicesTable)
      .where(eq(devicesTable.tenant_id, input.id))
      .execute();

    return results;
  } catch (error) {
    console.error('Get devices by tenant failed:', error);
    throw error;
  }
};
