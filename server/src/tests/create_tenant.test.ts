
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tenantsTable } from '../db/schema';
import { type CreateTenantInput } from '../schema';
import { createTenant } from '../handlers/create_tenant';
import { eq } from 'drizzle-orm';

// Test input
const testInput: CreateTenantInput = {
  name: 'Test Tenant Corp',
  contact_person: 'John Doe',
  contact_email: 'john.doe@testcorp.com',
  status: 'Active'
};

describe('createTenant', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a tenant', async () => {
    const result = await createTenant(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Tenant Corp');
    expect(result.contact_person).toEqual('John Doe');
    expect(result.contact_email).toEqual('john.doe@testcorp.com');
    expect(result.status).toEqual('Active');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save tenant to database', async () => {
    const result = await createTenant(testInput);

    // Query using proper drizzle syntax
    const tenants = await db.select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, result.id))
      .execute();

    expect(tenants).toHaveLength(1);
    expect(tenants[0].name).toEqual('Test Tenant Corp');
    expect(tenants[0].contact_person).toEqual('John Doe');
    expect(tenants[0].contact_email).toEqual('john.doe@testcorp.com');
    expect(tenants[0].status).toEqual('Active');
    expect(tenants[0].created_at).toBeInstanceOf(Date);
    expect(tenants[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create tenant with Inactive status', async () => {
    const inactiveInput: CreateTenantInput = {
      name: 'Inactive Tenant',
      contact_person: 'Jane Smith',
      contact_email: 'jane.smith@inactive.com',
      status: 'Inactive'
    };

    const result = await createTenant(inactiveInput);

    expect(result.status).toEqual('Inactive');
    expect(result.name).toEqual('Inactive Tenant');
    expect(result.contact_person).toEqual('Jane Smith');
    expect(result.contact_email).toEqual('jane.smith@inactive.com');
  });

  it('should generate unique IDs for multiple tenants', async () => {
    const tenant1 = await createTenant(testInput);
    
    const secondInput: CreateTenantInput = {
      name: 'Second Tenant',
      contact_person: 'Bob Wilson',
      contact_email: 'bob@second.com',
      status: 'Active'
    };
    
    const tenant2 = await createTenant(secondInput);

    expect(tenant1.id).not.toEqual(tenant2.id);
    expect(tenant1.name).toEqual('Test Tenant Corp');
    expect(tenant2.name).toEqual('Second Tenant');
  });
});
