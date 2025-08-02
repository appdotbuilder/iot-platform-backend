
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tenantsTable, devicesTable } from '../db/schema';
import { getDashboardStats } from '../handlers/get_dashboard_stats';

describe('getDashboardStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero stats for empty database', async () => {
    const result = await getDashboardStats();

    expect(result.total_tenants).toEqual(0);
    expect(result.active_tenants).toEqual(0);
    expect(result.total_devices).toEqual(0);
    expect(result.online_devices).toEqual(0);
  });

  it('should count tenants correctly', async () => {
    // Create test tenants
    await db.insert(tenantsTable).values([
      {
        name: 'Active Tenant 1',
        contact_person: 'John Doe',
        contact_email: 'john@example.com',
        status: 'Active'
      },
      {
        name: 'Inactive Tenant',
        contact_person: 'Jane Smith',
        contact_email: 'jane@example.com',
        status: 'Inactive'
      },
      {
        name: 'Active Tenant 2',
        contact_person: 'Bob Wilson',
        contact_email: 'bob@example.com',
        status: 'Active'
      }
    ]).execute();

    const result = await getDashboardStats();

    expect(result.total_tenants).toEqual(3);
    expect(result.active_tenants).toEqual(2);
  });

  it('should count devices correctly', async () => {
    // Create test tenant first
    const tenantResult = await db.insert(tenantsTable).values({
      name: 'Test Tenant',
      contact_person: 'Test Person',
      contact_email: 'test@example.com',
      status: 'Active'
    }).returning().execute();

    const tenantId = tenantResult[0].id;

    // Create test devices
    await db.insert(devicesTable).values([
      {
        name: 'Online Device 1',
        device_type: 'Sensor',
        serial_number: 'SN001',
        status: 'Online',
        tenant_id: tenantId
      },
      {
        name: 'Offline Device',
        device_type: 'Controller',
        serial_number: 'SN002',
        status: 'Offline',
        tenant_id: tenantId
      },
      {
        name: 'Error Device',
        device_type: 'Gateway',
        serial_number: 'SN003',
        status: 'Error',
        tenant_id: tenantId
      },
      {
        name: 'Online Device 2',
        device_type: 'Sensor',
        serial_number: 'SN004',
        status: 'Online',
        tenant_id: tenantId
      }
    ]).execute();

    const result = await getDashboardStats();

    expect(result.total_devices).toEqual(4);
    expect(result.online_devices).toEqual(2);
  });

  it('should return complete dashboard stats with mixed data', async () => {
    // Create tenants
    const tenantResults = await db.insert(tenantsTable).values([
      {
        name: 'Active Tenant',
        contact_person: 'Active Person',
        contact_email: 'active@example.com',
        status: 'Active'
      },
      {
        name: 'Inactive Tenant',
        contact_person: 'Inactive Person',
        contact_email: 'inactive@example.com',
        status: 'Inactive'
      }
    ]).returning().execute();

    const activeTenantId = tenantResults[0].id;
    const inactiveTenantId = tenantResults[1].id;

    // Create devices for both tenants
    await db.insert(devicesTable).values([
      {
        name: 'Device 1',
        device_type: 'Sensor',
        serial_number: 'SN001',
        status: 'Online',
        tenant_id: activeTenantId
      },
      {
        name: 'Device 2',
        device_type: 'Controller',
        serial_number: 'SN002',
        status: 'Offline',
        tenant_id: activeTenantId
      },
      {
        name: 'Device 3',
        device_type: 'Gateway',
        serial_number: 'SN003',
        status: 'Online',
        tenant_id: inactiveTenantId
      }
    ]).execute();

    const result = await getDashboardStats();

    expect(result.total_tenants).toEqual(2);
    expect(result.active_tenants).toEqual(1);
    expect(result.total_devices).toEqual(3);
    expect(result.online_devices).toEqual(2);
  });
});
