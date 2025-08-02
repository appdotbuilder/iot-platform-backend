
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tenantsTable } from '../db/schema';
import { getTenants } from '../handlers/get_tenants';

describe('getTenants', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no tenants exist', async () => {
    const result = await getTenants();

    expect(result).toEqual([]);
  });

  it('should return all tenants', async () => {
    // Create test tenants
    await db.insert(tenantsTable)
      .values([
        {
          name: 'Tenant One',
          contact_person: 'John Doe',
          contact_email: 'john@tenant1.com',
          status: 'Active'
        },
        {
          name: 'Tenant Two',
          contact_person: 'Jane Smith',
          contact_email: 'jane@tenant2.com',
          status: 'Inactive'
        }
      ])
      .execute();

    const result = await getTenants();

    expect(result).toHaveLength(2);
    
    // Validate first tenant
    expect(result[0].name).toEqual('Tenant One');
    expect(result[0].contact_person).toEqual('John Doe');
    expect(result[0].contact_email).toEqual('john@tenant1.com');
    expect(result[0].status).toEqual('Active');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Validate second tenant
    expect(result[1].name).toEqual('Tenant Two');
    expect(result[1].contact_person).toEqual('Jane Smith');
    expect(result[1].contact_email).toEqual('jane@tenant2.com');
    expect(result[1].status).toEqual('Inactive');
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[1].updated_at).toBeInstanceOf(Date);
  });

  it('should return tenants with different statuses', async () => {
    // Create tenants with both status types
    await db.insert(tenantsTable)
      .values([
        {
          name: 'Active Tenant',
          contact_person: 'Active Person',
          contact_email: 'active@tenant.com',
          status: 'Active'
        },
        {
          name: 'Inactive Tenant',
          contact_person: 'Inactive Person',
          contact_email: 'inactive@tenant.com',
          status: 'Inactive'
        }
      ])
      .execute();

    const result = await getTenants();

    expect(result).toHaveLength(2);
    
    const activeTenant = result.find(t => t.status === 'Active');
    const inactiveTenant = result.find(t => t.status === 'Inactive');

    expect(activeTenant).toBeDefined();
    expect(activeTenant?.name).toEqual('Active Tenant');
    
    expect(inactiveTenant).toBeDefined();
    expect(inactiveTenant?.name).toEqual('Inactive Tenant');
  });
});
