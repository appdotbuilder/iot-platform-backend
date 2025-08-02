
import { db } from '../db';
import { tenantsTable } from '../db/schema';
import { type CreateTenantInput, type Tenant } from '../schema';

export const createTenant = async (input: CreateTenantInput): Promise<Tenant> => {
  try {
    // Insert tenant record
    const result = await db.insert(tenantsTable)
      .values({
        name: input.name,
        contact_person: input.contact_person,
        contact_email: input.contact_email,
        status: input.status
      })
      .returning()
      .execute();

    // Return the created tenant
    const tenant = result[0];
    return tenant;
  } catch (error) {
    console.error('Tenant creation failed:', error);
    throw error;
  }
};
