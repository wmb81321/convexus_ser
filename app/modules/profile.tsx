"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Smartphone,
  Globe,
  Building2,
  Plus,
  Edit3,
  Trash2,
  Save,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BankAccount {
  id: string;
  bankName: string;
  country: string;
  currency: string;
  accountNumber: string;
  accountType: string;
  swift: string;
}

export default function Profile() {
  const { user, logout } = usePrivy();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<BankAccount, 'id'>>({     
    bankName: '',
    country: '',
    currency: '',
    accountNumber: '',
    accountType: '',
    swift: ''
  });

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              Please connect your wallet to view profile
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock verification status - this will be integrated with Veriff
  const verificationStatus = {
    isVerified: false,
    status: "pending", // "pending", "verified", "rejected"
    requestedAt: null,
    verifiedAt: null
  };

  const getVerificationBadge = () => {
    switch (verificationStatus.status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Verified</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Not Verified</Badge>;
    }
  };

  const getVerificationIcon = () => {
    switch (verificationStatus.status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleVerificationRequest = () => {
    // TODO: Integrate with Veriff API
    console.log("Requesting verification with Veriff...");
    alert("Verification request will be integrated with Veriff API");
  };

  // Bank Account CRUD functions
  const handleAddAccount = () => {
    if (!formData.bankName || !formData.country || !formData.currency || 
        !formData.accountNumber || !formData.accountType || !formData.swift) {
      alert('Please fill in all fields');
      return;
    }

    const newAccount: BankAccount = {
      id: Date.now().toString(),
      ...formData
    };

    setBankAccounts([...bankAccounts, newAccount]);
    setFormData({
      bankName: '',
      country: '',
      currency: '',
      accountNumber: '',
      accountType: '',
      swift: ''
    });
    setIsAddingAccount(false);
  };

  const handleEditAccount = (account: BankAccount) => {
    setFormData({
      bankName: account.bankName,
      country: account.country,
      currency: account.currency,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      swift: account.swift
    });
    setEditingAccountId(account.id);
  };

  const handleUpdateAccount = () => {
    if (!formData.bankName || !formData.country || !formData.currency || 
        !formData.accountNumber || !formData.accountType || !formData.swift) {
      alert('Please fill in all fields');
      return;
    }

    setBankAccounts(accounts => 
      accounts.map(account => 
        account.id === editingAccountId 
          ? { ...account, ...formData }
          : account
      )
    );
    setFormData({
      bankName: '',
      country: '',
      currency: '',
      accountNumber: '',
      accountType: '',
      swift: ''
    });
    setEditingAccountId(null);
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('Are you sure you want to delete this bank account?')) {
      setBankAccounts(accounts => accounts.filter(account => account.id !== id));
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      bankName: '',
      country: '',
      currency: '',
      accountNumber: '',
      accountType: '',
      swift: ''
    });
    setIsAddingAccount(false);
    setEditingAccountId(null);
  };

  const handleInputChange = (field: keyof Omit<BankAccount, 'id'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.email?.address?.split('@')[0] || 'User'}</h3>
              <p className="text-gray-600 dark:text-gray-300">{user.email?.address}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Email</p>
                                 <p className="text-sm text-gray-600 dark:text-gray-300">{user.email?.address}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Globe className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Wallet Type</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Smart Wallet</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              {getVerificationIcon()}
              <div>
                <p className="font-medium">Identity Verification</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {verificationStatus.status === "verified" 
                    ? "Your identity has been verified" 
                    : verificationStatus.status === "pending"
                    ? "Verification is being processed"
                    : verificationStatus.status === "rejected"
                    ? "Verification was rejected"
                    : "Complete verification to unlock all features"
                  }
                </p>
              </div>
            </div>
            {getVerificationBadge()}
          </div>

          {verificationStatus.status === "not_verified" && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Why verify your identity?
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Higher transaction limits</li>
                <li>• Access to advanced DeFi features</li>
                <li>• Enhanced security and compliance</li>
                <li>• Priority customer support</li>
              </ul>
            </div>
          )}

          {verificationStatus.status === "pending" && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-900 dark:text-yellow-100">
                  Verification in Progress
                </span>
              </div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Your verification request is being reviewed. This usually takes 1-2 business days.
              </p>
            </div>
          )}

          {verificationStatus.status === "rejected" && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-900 dark:text-red-100">
                  Verification Rejected
                </span>
              </div>
              <p className="text-sm text-red-800 dark:text-red-200">
                Your verification was not approved. Please ensure all documents are clear and valid.
              </p>
            </div>
          )}

          {verificationStatus.status !== "verified" && (
            <Button 
              onClick={handleVerificationRequest}
              className="w-full"
              disabled={verificationStatus.status === "pending"}
            >
              {verificationStatus.status === "pending" 
                ? "Verification in Progress..." 
                : verificationStatus.status === "rejected"
                ? "Request New Verification"
                : "Request Verification"
              }
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Bank Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Bank Accounts
            </div>
            <Button
              onClick={() => setIsAddingAccount(true)}
              size="sm"
              className="flex items-center gap-2"
              disabled={isAddingAccount || editingAccountId !== null}
            >
              <Plus className="w-4 h-4" />
              Add Account
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Privacy Message */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>🔒 Privacy Notice</strong>
              <div className="text-xs mt-1">
                These bank accounts are private and can only be used by you. Your banking information is securely stored and never shared.
              </div>
            </div>
          </div>

          {/* Add/Edit Form */}
          {(isAddingAccount || editingAccountId) && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
              <h4 className="font-medium">
                {isAddingAccount ? 'Add New Bank Account' : 'Edit Bank Account'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="Enter bank name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Enter country"
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    placeholder="USD, EUR, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="accountType">Account Type</Label>
                  <Input
                    id="accountType"
                    value={formData.accountType}
                    onChange={(e) => handleInputChange('accountType', e.target.value)}
                    placeholder="Checking, Savings, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    type="password"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    placeholder="Enter account number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="swift">SWIFT Code</Label>
                  <Input
                    id="swift"
                    value={formData.swift}
                    onChange={(e) => handleInputChange('swift', e.target.value)}
                    placeholder="Enter SWIFT code"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={isAddingAccount ? handleAddAccount : handleUpdateAccount}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isAddingAccount ? 'Add Account' : 'Update Account'}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Existing Bank Accounts */}
          {bankAccounts.length === 0 && !isAddingAccount ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bank Accounts</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Add your bank accounts to enable faster fiat transactions
              </p>
              <Button
                onClick={() => setIsAddingAccount(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Your First Account
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{account.bankName}</span>
                        <Badge variant="outline" className="text-xs">
                          {account.currency}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {account.country} • {account.accountType}
                      </div>
                      <div className="text-sm font-mono text-gray-500">
                        ****{account.accountNumber.slice(-4)} • {account.swift}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditAccount(account)}
                        variant="ghost"
                        size="sm"
                        disabled={isAddingAccount || editingAccountId !== null}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteAccount(account.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={isAddingAccount || editingAccountId !== null}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={logout} 
            variant="outline" 
            className="w-full"
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 