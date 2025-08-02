
import { db } from '../db';
import { devicesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type Device, type IdParam } from '../schema';

export const getDeviceById = async (input: IdParam): Promise<Device | null> => {
  try {
    const results = await db.select()
      .from(devicesTable)
      .where(eq(devicesTable.id, input.id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get device by ID:', error);
    throw error;
  }
};
