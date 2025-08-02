
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tenantsTable } from '../db/schema';
import { type CreateTenantInput, type UpdateTenantInput } from '../schema';
import { updateTenant } from '../handlers/update_tenant';
import { eq } from 'drizzle-orm';

// Test data
const testTenant: CreateTenantInput = {
  name: 'Original Tenant',
  contact_person: 'John Doe',
  contact_email: 'john@example.com',
  status: 'Active'
};

describe('updateTenant', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update tenant fields', async () => {
    // Create tenant first
    const createdTenant = await db.insert(tenantsTable)
      .values(testTenant)
      .returning()
      .execute();

    const tenantId = createdTenant[0].id;

    // Update tenant
    const updateInput: UpdateTenantInput = {
      id: tenantId,
      name: 'Updated Tenant Name',
      contact_email: 'updated@example.com',
      status: 'Inactive'
    };

    const result = await updateTenant(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(tenantId);
    expect(result.name).toEqual('Updated Tenant Name');
    expect(result.contact_person).toEqual('John Doe'); // Should remain unchanged
    expect(result.contact_email).toEqual('updated@example.com');
    expect(result.status).toEqual('Inactive');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    // Create tenant first
    const createdTenant = await db.insert(tenantsTable)
      .values(testTenant)
      .returning()
      .execute();

    const tenantId = createdTenant[0].id;

    // Update only name
    const updateInput: UpdateTenantInput = {
      id: tenantId,
      name: 'Partially Updated'
    };

    const result = await updateTenant(updateInput);

    // Verify only name was updated
    expect(result.name).toEqual('Partially Updated');
    expect(result.contact_person).toEqual('John Doe');
    expect(result.contact_email).toEqual('john@example.com');
    expect(result.status).toEqual('Active');
  });

  it('should save updated tenant to database', async () => {
    // Create tenant first
    const createdTenant = await db.insert(tenantsTable)
      .values(testTenant)
      .returning()
      .execute();

    const tenantId = createdTenant[0].id;

    // Update tenant
    const updateInput: UpdateTenantInput = {
      id: tenantId,
      name: 'Database Updated',
      status: 'Inactive'
    };

    await updateTenant(updateInput);

    // Verify changes persisted to database
    const dbTenant = await db.select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, tenantId))
      .execute();

    expect(dbTenant).toHaveLength(1);
    expect(dbTenant[0].name).toEqual('Database Updated');
    expect(dbTenant[0].status).toEqual('Inactive');
    expect(dbTenant[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update timestamp when tenant is updated', async () => {
    // Create tenant first
    const createdTenant = await db.insert(tenantsTable)
      .values(testTenant)
      .returning()
      .execute();

    const tenantId = createdTenant[0].id;
    const originalUpdatedAt = createdTenant[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update tenant
    const updateInput: UpdateTenantInput = {
      id: tenantId,
      name: 'Timestamp Test'
    };

    const result = await updateTenant(updateInput);

    // Verify updated_at timestamp changed
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error when tenant does not exist', async () => {
    const updateInput: UpdateTenantInput = {
      id: 999,
      name: 'Non-existent Tenant'
    };

    await expect(updateTenant(updateInput)).rejects.toThrow(/Tenant with id 999 not found/i);
  });
});
