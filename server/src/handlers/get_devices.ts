
import { db } from '../db';
import { devicesTable } from '../db/schema';
import { type Device } from '../schema';

export const getDevices = async (): Promise<Device[]> => {
  try {
    const results = await db.select()
      .from(devicesTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Get devices failed:', error);
    throw error;
  }
};
