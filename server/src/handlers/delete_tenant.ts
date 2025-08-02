
import { db } from '../db';
import { tenantsTable } from '../db/schema';
import { type IdParam } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteTenant = async (input: IdParam): Promise<{ success: boolean }> => {
  try {
    // Check if tenant exists before deletion
    const existingTenant = await db.select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, input.id))
      .execute();

    if (existingTenant.length === 0) {
      throw new Error(`Tenant with ID ${input.id} not found`);
    }

    // Delete the tenant (cascade will handle associated devices)
    await db.delete(tenantsTable)
      .where(eq(tenantsTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Tenant deletion failed:', error);
    throw error;
  }
};
