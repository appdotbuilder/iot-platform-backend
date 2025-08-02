
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusIcon, PencilIcon, TrashIcon, MonitorIcon, HashIcon, TagIcon, BuildingIcon } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Device, Tenant, CreateDeviceInput, UpdateDeviceInput } from '../../../server/src/schema';

interface DeviceManagementProps {
  onDataChange: () => void;
}

export function DeviceManagement({ onDataChange }: DeviceManagementProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const [createFormData, setCreateFormData] = useState<CreateDeviceInput>({
    name: '',
    device_type: '',
    serial_number: '',
    status: 'Online',
    tenant_id: 0
  });

  const [editFormData, setEditFormData] = useState<Partial<UpdateDeviceInput>>({});

  const loadDevices = useCallback(async () => {
    try {
      const result = await trpc.getDevices.query();
      setDevices(result);
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  }, []);

  const loadTenants = useCallback(async () => {
    try {
      const result = await trpc.getTenants.query();
      setTenants(result);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  }, []);

  useEffect(() => {
    loadDevices();
    loadTenants();
  }, [loadDevices, loadTenants]);

  const getTenantName = (tenantId: number): string => {
    const tenant = tenants.find((t: Tenant) => t.id === tenantId);
    return tenant ? tenant.name : `Tenant ${tenantId}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Online':
        return 'default';
      case 'Offline':
        return 'secondary';
      case 'Error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Online':
        return '🟢';
      case 'Offline':
        return '⚫';
      case 'Error':
        return '🔴';
      default:
        return '⚫';
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createDevice.mutate(createFormData);
      setDevices((prev: Device[]) => [...prev, response]);
      setCreateFormData({
        name: '',
        device_type: '',
        serial_number: '',
        status: 'Online',
        tenant_id: 0
      });
      setIsCreateDialogOpen(false);
      onDataChange();
    } catch (error) {
      console.error('Failed to create device:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;
    
    setIsLoading(true);
    try {
      const updateData = { id: editingDevice.id, ...editFormData };
      const response = await trpc.updateDevice.mutate(updateData);
      setDevices((prev: Device[]) => 
        prev.map((device: Device) => device.id === editingDevice.id ? response : device)
      );
      setEditingDevice(null);
      setEditFormData({});
      onDataChange();
    } catch (error) {
      console.error('Failed to update device:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (deviceId: number) => {
    try {
      await trpc.deleteDevice.mutate({ id: deviceId });
      setDevices((prev: Device[]) => prev.filter((device: Device) => device.id !== deviceId));
      onDataChange();
    } catch (error) {
      console.error('Failed to delete device:', error);
    }
  };

  const startEdit = (device: Device) => {
    setEditingDevice(device);
    setEditFormData({
      name: device.name,
      device_type: device.device_type,
      serial_number: device.serial_number,
      status: device.status,
      tenant_id: device.tenant_id
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📱 Device Management</h2>
          <p className="text-gray-600">Manage IoT devices and their assignments</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Device</DialogTitle>
              <DialogDescription>
                Add a new device to your IoT platform. Fill in all required information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Device Name</Label>
                  <Input
                    id="name"
                    value={createFormData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateFormData((prev: CreateDeviceInput) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter device name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device_type">Device Type</Label>
                  <Input
                    id="device_type"
                    value={createFormData.device_type}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateFormData((prev: CreateDeviceInput) => ({ ...prev, device_type: e.target.value }))
                    }
                    placeholder="e.g., Sensor, Gateway, Controller"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input
                    id="serial_number"
                    value={createFormData.serial_number}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateFormData((prev: CreateDeviceInput) => ({ ...prev, serial_number: e.target.value }))
                    }
                    placeholder="Enter serial number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={createFormData.status}
                    onValueChange={(value: 'Online' | 'Offline' | 'Error') =>
                      setCreateFormData((prev: CreateDeviceInput) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online">🟢 Online</SelectItem>
                      <SelectItem value="Offline">⚫ Offline</SelectItem>
                      <SelectItem value="Error">🔴 Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant_id">Assigned Tenant</Label>
                  <Select
                    value={createFormData.tenant_id > 0 ? createFormData.tenant_id.toString() : ''}
                    onValueChange={(value) =>
                      setCreateFormData((prev: CreateDeviceInput) => ({ 
                        ...prev, 
                        tenant_id: parseInt(value) || 0 
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant: Tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id.toString()}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading || createFormData.tenant_id === 0}>
                  {isLoading ? 'Creating...' : 'Create Device'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Devices Grid */}
      {devices.length === 0 ? (
        <Card className="p-8 text-center">
          <MonitorIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No devices yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first device.</p>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={tenants.length === 0}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {tenants.length === 0 ? 'Create tenants first' : 'Add First Device'}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((device: Device) => (
            <Card key={device.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MonitorIcon className="h-5 w-5 text-purple-500" />
                      {device.name}
                    </CardTitle>
                    <CardDescription>ID: {device.id}</CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(device.status)}>
                    {getStatusIcon(device.status)} {device.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TagIcon className="h-4 w-4" />
                  {device.device_type}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HashIcon className="h-4 w-4" />
                  {device.serial_number}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BuildingIcon className="h-4 w-4" />
                  {getTenantName(device.tenant_id)}
                </div>
                <div className="text-xs text-gray-400">
                  Created: {device.created_at.toLocaleDateString()}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(device)}
                    className="flex-1"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Device</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{device.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(device.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingDevice} onOpenChange={(open) => !open && setEditingDevice(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
            <DialogDescription>
              Update device information. Leave fields empty to keep current values.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Device Name</Label>
                <Input
                  id="edit_name"
                  value={editFormData.name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter device name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_device_type">Device Type</Label>
                <Input
                  id="edit_device_type"
                  value={editFormData.device_type || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev) => ({ ...prev, device_type: e.target.value }))
                  }
                  placeholder="e.g., Sensor, Gateway, Controller"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_serial_number">Serial Number</Label>
                <Input
                  id="edit_serial_number"
                  value={editFormData.serial_number || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev) => ({ ...prev, serial_number: e.target.value }))
                  }
                  placeholder="Enter serial number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={editFormData.status || (editingDevice?.status || 'Online')}
                  onValueChange={(value: 'Online' | 'Offline' | 'Error') =>
                    setEditFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">🟢 Online</SelectItem>
                    <SelectItem value="Offline">⚫ Offline</SelectItem>
                    <SelectItem value="Error">🔴 Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_tenant_id">Assigned Tenant</Label>
                <Select
                  value={editFormData.tenant_id ? editFormData.tenant_id.toString() : (editingDevice?.tenant_id?.toString() || (tenants.length > 0 ? tenants[0].id.toString() : ''))}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({ 
                      ...prev, 
                      tenant_id: parseInt(value) || 0 
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant: Tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id.toString()}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Device'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
