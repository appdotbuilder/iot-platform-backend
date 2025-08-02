
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusIcon, PencilIcon, TrashIcon, BuildingIcon, UserIcon, MailIcon } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Tenant, CreateTenantInput, UpdateTenantInput } from '../../../server/src/schema';

interface TenantManagementProps {
  onDataChange: () => void;
}

export function TenantManagement({ onDataChange }: TenantManagementProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const [createFormData, setCreateFormData] = useState<CreateTenantInput>({
    name: '',
    contact_person: '',
    contact_email: '',
    status: 'Active'
  });

  const [editFormData, setEditFormData] = useState<Partial<UpdateTenantInput>>({});

  const loadTenants = useCallback(async () => {
    try {
      const result = await trpc.getTenants.query();
      setTenants(result);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createTenant.mutate(createFormData);
      setTenants((prev: Tenant[]) => [...prev, response]);
      setCreateFormData({
        name: '',
        contact_person: '',
        contact_email: '',
        status: 'Active'
      });
      setIsCreateDialogOpen(false);
      onDataChange();
    } catch (error) {
      console.error('Failed to create tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    
    setIsLoading(true);
    try {
      const updateData = { id: editingTenant.id, ...editFormData };
      const response = await trpc.updateTenant.mutate(updateData);
      setTenants((prev: Tenant[]) => 
        prev.map((tenant: Tenant) => tenant.id === editingTenant.id ? response : tenant)
      );
      setEditingTenant(null);
      setEditFormData({});
      onDataChange();
    } catch (error) {
      console.error('Failed to update tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tenantId: number) => {
    try {
      await trpc.deleteTenant.mutate({ id: tenantId });
      setTenants((prev: Tenant[]) => prev.filter((tenant: Tenant) => tenant.id !== tenantId));
      onDataChange();
    } catch (error) {
      console.error('Failed to delete tenant:', error);
    }
  };

  const startEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setEditFormData({
      name: tenant.name,
      contact_person: tenant.contact_person,
      contact_email: tenant.contact_email,
      status: tenant.status
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🏢 Tenant Management</h2>
          <p className="text-gray-600">Manage your tenants and their information</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>
                Add a new tenant to your IoT platform. Fill in all required information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tenant Name</Label>
                  <Input
                    id="name"
                    value={createFormData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateFormData((prev: CreateTenantInput) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter tenant name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={createFormData.contact_person}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateFormData((prev: CreateTenantInput) => ({ ...prev, contact_person: e.target.value }))
                    }
                    placeholder="Enter contact person name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={createFormData.contact_email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateFormData((prev: CreateTenantInput) => ({ ...prev, contact_email: e.target.value }))
                    }
                    placeholder="Enter contact email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={createFormData.status}
                    onValueChange={(value: 'Active' | 'Inactive') =>
                      setCreateFormData((prev: CreateTenantInput) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Tenant'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tenants Grid */}
      {tenants.length === 0 ? (
        <Card className="p-8 text-center">
          <BuildingIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first tenant.</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add First Tenant
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant: Tenant) => (
            <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BuildingIcon className="h-5 w-5 text-blue-500" />
                      {tenant.name}
                    </CardTitle>
                    <CardDescription>ID: {tenant.id}</CardDescription>
                  </div>
                  <Badge variant={tenant.status === 'Active' ? 'default' : 'secondary'}>
                    {tenant.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserIcon className="h-4 w-4" />
                  {tenant.contact_person}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MailIcon className="h-4 w-4" />
                  {tenant.contact_email}
                </div>
                <div className="text-xs text-gray-400">
                  Created: {tenant.created_at.toLocaleDateString()}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(tenant)}
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
                        <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{tenant.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(tenant.id)}
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
      <Dialog open={!!editingTenant} onOpenChange={(open) => !open && setEditingTenant(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant information. Leave fields empty to keep current values.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Tenant Name</Label>
                <Input
                  id="edit_name"
                  value={editFormData.name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter tenant name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_contact_person">Contact Person</Label>
                <Input
                  id="edit_contact_person"
                  value={editFormData.contact_person || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev) => ({ ...prev, contact_person: e.target.value }))
                  }
                  placeholder="Enter contact person name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_contact_email">Contact Email</Label>
                <Input
                  id="edit_contact_email"
                  type="email"
                  value={editFormData.contact_email || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev) => ({ ...prev, contact_email: e.target.value }))
                  }
                  placeholder="Enter contact email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={editFormData.status || (editingTenant?.status || 'Active')}
                  onValueChange={(value: 'Active' | 'Inactive') =>
                    setEditFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Tenant'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
