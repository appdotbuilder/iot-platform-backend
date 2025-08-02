
import { db } from '../db';
import { devicesTable } from '../db/schema';
import { type IdParam } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteDevice = async (input: IdParam): Promise<{ success: boolean }> => {
  try {
    // Delete device by ID
    const result = await db.delete(devicesTable)
      .where(eq(devicesTable.id, input.id))
      .returning()
      .execute();

    // Check if device was found and deleted
    if (result.length === 0) {
      throw new Error(`Device with ID ${input.id} not found`);
    }

    return { success: true };
  } catch (error) {
    console.error('Device deletion failed:', error);
    throw error;
  }
};
