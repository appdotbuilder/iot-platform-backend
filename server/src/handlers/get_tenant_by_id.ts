
import { db } from '../db';
import { tenantsTable } from '../db/schema';
import { type Tenant, type IdParam } from '../schema';
import { eq } from 'drizzle-orm';

export const getTenantById = async (input: IdParam): Promise<Tenant | null> => {
  try {
    const result = await db.select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, input.id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    // Return the first (and only) result
    return result[0];
  } catch (error) {
    console.error('Get tenant by ID failed:', error);
    throw error;
  }
};
