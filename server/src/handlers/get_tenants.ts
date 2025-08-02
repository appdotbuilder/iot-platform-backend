
import { db } from '../db';
import { tenantsTable } from '../db/schema';
import { type Tenant } from '../schema';

export const getTenants = async (): Promise<Tenant[]> => {
  try {
    const results = await db.select()
      .from(tenantsTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch tenants:', error);
    throw error;
  }
};
