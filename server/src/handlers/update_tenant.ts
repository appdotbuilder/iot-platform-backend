
import { db } from '../db';
import { tenantsTable } from '../db/schema';
import { type UpdateTenantInput, type Tenant } from '../schema';
import { eq } from 'drizzle-orm';

export const updateTenant = async (input: UpdateTenantInput): Promise<Tenant> => {
  try {
    // Check if tenant exists
    const existingTenant = await db.select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, input.id))
      .execute();

    if (existingTenant.length === 0) {
      throw new Error(`Tenant with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof input> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.contact_person !== undefined) updateData.contact_person = input.contact_person;
    if (input.contact_email !== undefined) updateData.contact_email = input.contact_email;
    if (input.status !== undefined) updateData.status = input.status;

    // Update tenant record with current timestamp
    const result = await db.update(tenantsTable)
      .set({
        ...updateData,
        updated_at: new Date()
      })
      .where(eq(tenantsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Tenant update failed:', error);
    throw error;
  }
};
