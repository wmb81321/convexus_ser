"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  FileText,
  Building,
  CreditCard,
  Wallet,
  Save,
  X
} from "lucide-react";
import { ClientSupplier, Invoice } from "@/app/types/modules";

export default function Clients() {
  const [clients, setClients] = useState<ClientSupplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'client' | 'supplier'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientSupplier | null>(null);
  const [formData, setFormData] = useState<Partial<ClientSupplier>>({});

  // Load clients from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('convexo-clients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setClients(parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        })));
      } catch (error) {
        console.error('Error loading clients:', error);
      }
    }
  }, []);

  // Save clients to localStorage
  const saveClients = (updatedClients: ClientSupplier[]) => {
    localStorage.setItem('convexo-clients', JSON.stringify(updatedClients));
    setClients(updatedClients);
  };

  // Filter clients based on search and type
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.taxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || client.type === filterType;
    return matchesSearch && matchesType;
  });

  const resetForm = () => {
    setFormData({});
    setEditingClient(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.taxId || !formData.country || !formData.type) {
      alert('Please fill in all required fields');
      return;
    }

    const now = new Date();
    
    if (editingClient) {
      // Update existing client
      const updatedClients = clients.map(c => 
        c.id === editingClient.id 
          ? { ...editingClient, ...formData, updatedAt: now }
          : c
      );
      saveClients(updatedClients);
    } else {
      // Add new client
      const newClient: ClientSupplier = {
        id: `client_${Date.now()}`,
        name: formData.name!,
        taxId: formData.taxId!,
        country: formData.country!,
        billingAddress: {
          street: formData.billingAddress?.street || '',
          city: formData.billingAddress?.city || '',
          state: formData.billingAddress?.state || '',
          postalCode: formData.billingAddress?.postalCode || '',
          country: formData.country!,
        },
        bankAccount: {
          accountName: formData.bankAccount?.accountName || '',
          accountNumber: formData.bankAccount?.accountNumber || '',
          bankName: formData.bankAccount?.bankName || '',
          routingNumber: formData.bankAccount?.routingNumber || '',
          swift: formData.bankAccount?.swift || '',
        },
        walletAddress: formData.walletAddress || '',
        type: formData.type!,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };
      
      saveClients([...clients, newClient]);
    }
    
    resetForm();
  };

  const handleEdit = (client: ClientSupplier) => {
    setEditingClient(client);
    setFormData(client);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this client/supplier?')) {
      const updatedClients = clients.filter(c => c.id !== id);
      saveClients(updatedClients);
    }
  };

  const handleCreateInvoice = (client: ClientSupplier) => {
    // For now, just show alert - you can implement full invoice creation later
    alert(`Create invoice for ${client.name} - Feature coming soon!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            Clients & Suppliers Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients and suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'client' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('client')}
              >
                Clients
              </Button>
              <Button
                variant={filterType === 'supplier' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('supplier')}
              >
                Suppliers
              </Button>
            </div>

            {/* Add Button */}
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add {filterType === 'all' ? 'Contact' : filterType === 'client' ? 'Client' : 'Supplier'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingClient ? 'Edit Contact' : 'Add New Contact'}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Company or person name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <select
                    id="type"
                    className="w-full p-2 border rounded-md"
                    value={formData.type || ''}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'client' | 'supplier'})}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="client">Client</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="taxId">Tax ID *</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId || ''}
                    onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                    placeholder="Tax identification number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    placeholder="Country"
                    required
                  />
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Billing Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={formData.billingAddress?.street || ''}
                      onChange={(e) => setFormData({
                        ...formData, 
                        billingAddress: {
                          street: e.target.value,
                          city: formData.billingAddress?.city || '',
                          state: formData.billingAddress?.state || '',
                          postalCode: formData.billingAddress?.postalCode || '',
                          country: formData.country || '',
                        }
                      })}
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.billingAddress?.city || ''}
                      onChange={(e) => setFormData({
                        ...formData, 
                        billingAddress: {
                          street: formData.billingAddress?.street || '',
                          city: e.target.value,
                          state: formData.billingAddress?.state || '',
                          postalCode: formData.billingAddress?.postalCode || '',
                          country: formData.country || '',
                        }
                      })}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={formData.billingAddress?.state || ''}
                      onChange={(e) => setFormData({
                        ...formData, 
                        billingAddress: {
                          street: formData.billingAddress?.street || '',
                          city: formData.billingAddress?.city || '',
                          state: e.target.value,
                          postalCode: formData.billingAddress?.postalCode || '',
                          country: formData.country || '',
                        }
                      })}
                      placeholder="State or province"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.billingAddress?.postalCode || ''}
                      onChange={(e) => setFormData({
                        ...formData, 
                        billingAddress: {
                          street: formData.billingAddress?.street || '',
                          city: formData.billingAddress?.city || '',
                          state: formData.billingAddress?.state || '',
                          postalCode: e.target.value,
                          country: formData.country || '',
                        }
                      })}
                      placeholder="Postal code"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Account */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Bank Account
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      value={formData.bankAccount?.accountName || ''}
                      onChange={(e) => setFormData({
                        ...formData, 
                        bankAccount: {
                          accountName: e.target.value,
                          accountNumber: formData.bankAccount?.accountNumber || '',
                          bankName: formData.bankAccount?.bankName || '',
                          routingNumber: formData.bankAccount?.routingNumber || '',
                          swift: formData.bankAccount?.swift || '',
                        }
                      })}
                      placeholder="Account holder name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={formData.bankAccount?.accountNumber || ''}
                      onChange={(e) => setFormData({
                        ...formData, 
                        bankAccount: {
                          accountName: formData.bankAccount?.accountName || '',
                          accountNumber: e.target.value,
                          bankName: formData.bankAccount?.bankName || '',
                          routingNumber: formData.bankAccount?.routingNumber || '',
                          swift: formData.bankAccount?.swift || '',
                        }
                      })}
                      placeholder="Account number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankAccount?.bankName || ''}
                      onChange={(e) => setFormData({
                        ...formData, 
                        bankAccount: {
                          accountName: formData.bankAccount?.accountName || '',
                          accountNumber: formData.bankAccount?.accountNumber || '',
                          bankName: e.target.value,
                          routingNumber: formData.bankAccount?.routingNumber || '',
                          swift: formData.bankAccount?.swift || '',
                        }
                      })}
                      placeholder="Bank name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="routingNumber">Routing Number / SWIFT</Label>
                    <Input
                      id="routingNumber"
                      value={formData.bankAccount?.routingNumber || ''}
                      onChange={(e) => setFormData({
                        ...formData, 
                        bankAccount: {
                          accountName: formData.bankAccount?.accountName || '',
                          accountNumber: formData.bankAccount?.accountNumber || '',
                          bankName: formData.bankAccount?.bankName || '',
                          routingNumber: e.target.value,
                          swift: formData.bankAccount?.swift || '',
                        }
                      })}
                      placeholder="Routing number or SWIFT code"
                    />
                  </div>
                </div>
              </div>

              {/* Wallet Address */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Crypto Wallet (Optional)
                </h3>
                <Input
                  value={formData.walletAddress || ''}
                  onChange={(e) => setFormData({...formData, walletAddress: e.target.value})}
                  placeholder="0x... wallet address"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-2">
                <Button type="submit" className="gap-2">
                  <Save className="w-4 h-4" />
                  {editingClient ? 'Update' : 'Save'} Contact
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Clients List */}
      <div className="grid gap-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No contacts match your search criteria.' : 'Start by adding your first client or supplier.'}
              </p>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{client.name}</h3>
                      <Badge variant={client.type === 'client' ? 'default' : 'secondary'}>
                        {client.type}
                      </Badge>
                      <Badge variant={client.status === 'active' ? 'default' : 'destructive'}>
                        {client.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Tax ID:</strong> {client.taxId}</p>
                      <p><strong>Country:</strong> {client.country}</p>
                      {client.billingAddress.city && (
                        <p><strong>City:</strong> {client.billingAddress.city}, {client.billingAddress.state}</p>
                      )}
                      {client.walletAddress && (
                        <p><strong>Wallet:</strong> {client.walletAddress.slice(0, 10)}...{client.walletAddress.slice(-8)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCreateInvoice(client)}
                      className="gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      Invoice
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(client)}
                      className="gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(client.id)}
                      className="gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      {clients.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{clients.filter(c => c.type === 'client').length}</div>
                <div className="text-sm text-gray-600">Total Clients</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{clients.filter(c => c.type === 'supplier').length}</div>
                <div className="text-sm text-gray-600">Total Suppliers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{clients.filter(c => c.walletAddress).length}</div>
                <div className="text-sm text-gray-600">With Crypto Wallets</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
