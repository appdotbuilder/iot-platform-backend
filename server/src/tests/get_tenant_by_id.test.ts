
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tenantsTable } from '../db/schema';
import { type CreateTenantInput, type IdParam } from '../schema';
import { getTenantById } from '../handlers/get_tenant_by_id';

// Test input for creating a tenant
const testTenantInput: CreateTenantInput = {
  name: 'Test Tenant',
  contact_person: 'John Doe',
  contact_email: 'john.doe@example.com',
  status: 'Active'
};

describe('getTenantById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a tenant when found', async () => {
    // Create a tenant first
    const insertResult = await db.insert(tenantsTable)
      .values(testTenantInput)
      .returning()
      .execute();

    const createdTenant = insertResult[0];

    // Test the handler
    const result = await getTenantById({ id: createdTenant.id });

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdTenant.id);
    expect(result!.name).toEqual('Test Tenant');
    expect(result!.contact_person).toEqual('John Doe');
    expect(result!.contact_email).toEqual('john.doe@example.com');
    expect(result!.status).toEqual('Active');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when tenant not found', async () => {
    const result = await getTenantById({ id: 999 });

    expect(result).toBeNull();
  });

  it('should fetch the correct tenant when multiple exist', async () => {
    // Create multiple tenants
    const tenant1Input = {
      ...testTenantInput,
      name: 'Tenant One',
      contact_email: 'tenant1@example.com'
    };
    
    const tenant2Input = {
      ...testTenantInput,
      name: 'Tenant Two',
      contact_email: 'tenant2@example.com'
    };

    const insertResults = await db.insert(tenantsTable)
      .values([tenant1Input, tenant2Input])
      .returning()
      .execute();

    const tenant1 = insertResults[0];
    const tenant2 = insertResults[1];

    // Test fetching first tenant
    const result1 = await getTenantById({ id: tenant1.id });
    expect(result1).not.toBeNull();
    expect(result1!.name).toEqual('Tenant One');
    expect(result1!.contact_email).toEqual('tenant1@example.com');

    // Test fetching second tenant
    const result2 = await getTenantById({ id: tenant2.id });
    expect(result2).not.toBeNull();
    expect(result2!.name).toEqual('Tenant Two');
    expect(result2!.contact_email).toEqual('tenant2@example.com');
  });
});
