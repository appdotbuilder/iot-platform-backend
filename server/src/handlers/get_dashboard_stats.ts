
import { db } from '../db';
import { tenantsTable, devicesTable } from '../db/schema';
import { type DashboardStats } from '../schema';
import { eq, count } from 'drizzle-orm';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Count total tenants
    const totalTenantsResult = await db.select({ count: count() })
      .from(tenantsTable)
      .execute();

    // Count active tenants
    const activeTenantsResult = await db.select({ count: count() })
      .from(tenantsTable)
      .where(eq(tenantsTable.status, 'Active'))
      .execute();

    // Count total devices
    const totalDevicesResult = await db.select({ count: count() })
      .from(devicesTable)
      .execute();

    // Count online devices
    const onlineDevicesResult = await db.select({ count: count() })
      .from(devicesTable)
      .where(eq(devicesTable.status, 'Online'))
      .execute();

    return {
      total_tenants: totalTenantsResult[0].count,
      active_tenants: activeTenantsResult[0].count,
      total_devices: totalDevicesResult[0].count,
      online_devices: onlineDevicesResult[0].count
    };
  } catch (error) {
    console.error('Dashboard stats retrieval failed:', error);
    throw error;
  }
}
