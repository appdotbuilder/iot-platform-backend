
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2Icon, MonitorIcon, BarChart3Icon } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { DashboardStats } from '../../server/src/schema';
import { TenantManagement } from '@/components/TenantManagement';
import { DeviceManagement } from '@/components/DeviceManagement';

function App() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_tenants: 0,
    active_tenants: 0,
    total_devices: 0,
    online_devices: 0
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  const loadDashboardStats = useCallback(async () => {
    try {
      const stats = await trpc.getDashboardStats.query();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  }, []);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  const refreshDashboard = useCallback(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏢 IoT Platform Management</h1>
          <p className="text-gray-600">Manage tenants, devices, and monitor your IoT infrastructure</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3Icon className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="tenants" className="flex items-center gap-2">
              <Building2Icon className="h-4 w-4" />
              Tenants
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <MonitorIcon className="h-4 w-4" />
              Devices
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Total Tenants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.total_tenants}</div>
                  <p className="text-xs opacity-75 mt-1">All registered tenants</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Active Tenants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.active_tenants}</div>
                  <p className="text-xs opacity-75 mt-1">Currently active tenants</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Total Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.total_devices}</div>
                  <p className="text-xs opacity-75 mt-1">All registered devices</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Online Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.online_devices}</div>
                  <p className="text-xs opacity-75 mt-1">Currently online devices</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 System Overview
                </CardTitle>
                <CardDescription>
                  Quick insights into your IoT platform performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tenant Activation Rate</span>
                      <span className="font-medium">
                        {dashboardStats.total_tenants > 0 
                          ? Math.round((dashboardStats.active_tenants / dashboardStats.total_tenants) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${dashboardStats.total_tenants > 0 
                            ? (dashboardStats.active_tenants / dashboardStats.total_tenants) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Device Online Rate</span>
                      <span className="font-medium">
                        {dashboardStats.total_devices > 0 
                          ? Math.round((dashboardStats.online_devices / dashboardStats.total_devices) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${dashboardStats.total_devices > 0 
                            ? (dashboardStats.online_devices / dashboardStats.total_devices) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={refreshDashboard} 
                  variant="outline" 
                  className="w-full mt-4"
                >
                  🔄 Refresh Dashboard
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tenants Tab */}
          <TabsContent value="tenants">
            <TenantManagement onDataChange={refreshDashboard} />
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices">
            <DeviceManagement onDataChange={refreshDashboard} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
