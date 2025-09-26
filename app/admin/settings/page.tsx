"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import {
  getStoreInfo,
  updateStoreInfo,
} from "@/_actions/_admin";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCurrency, Currency } from "@/contexts/CurrencyContext";

export default function AdminSettings() {
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [storeInfo, setStoreInfo] = useState<any>({});

  // Currency management states
  const { currencies, currentCurrency, setCurrency, refreshCurrencies } = useCurrency();
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [currencyForm, setCurrencyForm] = useState({
    name: "",
    code: "",
    symbol: "",
    exchangeRate: "",
    isActive: true,
    isDefault: false,
  });

  const getStoreInformations = async () => {
    try {
      const response = await getStoreInfo();
      if (response.success) {
        const store = JSON.parse(response.store as string);
        setStoreInfo(store);
        setName(store.vendorProfile?.storeName || "");
        setDescription(store.vendorProfile?.storeDescription || "");
        setBusinessType(store.vendorProfile?.businessType || "");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    getStoreInformations();
  }, []);

  const handleUpdateAccount = async () => {
    try {
      const response = await updateStoreInfo(
        image as File,
        description,
        name,
        businessType
      );
      if (response.success) {
        toast.success(response.message);
        getStoreInformations();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // Currency management functions
  const resetCurrencyForm = () => {
    setCurrencyForm({
      name: "",
      code: "",
      symbol: "",
      exchangeRate: "",
      isActive: true,
      isDefault: false,
    });
    setEditingCurrency(null);
    setShowAddCurrency(false);
  };

  const handleEditCurrency = (currency: Currency) => {
    setCurrencyForm({
      name: currency.name,
      code: currency.code,
      symbol: currency.symbol,
      exchangeRate: currency.exchangeRate.toString(),
      isActive: currency.isActive,
      isDefault: currency.isDefault,
    });
    setEditingCurrency(currency);
    setShowAddCurrency(true);
  };

  const handleSaveCurrency = async () => {
    try {
      // Validate form data
      if (!currencyForm.name.trim()) {
        toast.error('Currency name is required');
        return;
      }
      
      if (!currencyForm.code.trim() || currencyForm.code.length !== 3) {
        toast.error('Currency code must be exactly 3 characters');
        return;
      }
      
      if (!currencyForm.symbol.trim()) {
        toast.error('Currency symbol is required');
        return;
      }
      
      if (!currencyForm.exchangeRate || parseFloat(currencyForm.exchangeRate) <= 0) {
        toast.error('Exchange rate must be a positive number');
        return;
      }

      const url = editingCurrency 
        ? '/api/admin/currencies' 
        : '/api/admin/currencies';
      
      const method = editingCurrency ? 'PUT' : 'POST';
      
      const payload = editingCurrency 
        ? { id: editingCurrency._id, ...currencyForm, exchangeRate: parseFloat(currencyForm.exchangeRate) }
        : { ...currencyForm, exchangeRate: parseFloat(currencyForm.exchangeRate) };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        await refreshCurrencies();
        resetCurrencyForm();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error saving currency:', error);
      toast.error('Failed to save currency');
    }
  };

  const handleDeleteCurrency = async (currencyId: string) => {
    if (!confirm('Are you sure you want to delete this currency?')) return;

    try {
      const response = await fetch(`/api/admin/currencies?id=${currencyId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        await refreshCurrencies();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error deleting currency:', error);
      toast.error('Failed to delete currency');
    }
  };

  const handleSetDefaultCurrency = async (currency: Currency) => {
    try {
      const response = await fetch('/api/admin/currencies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currency._id,
          isDefault: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Default currency updated');
        await refreshCurrencies();
        setCurrency(currency);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error setting default currency:', error);
      toast.error('Failed to set default currency');
    }
  };

  const seedCurrencies = async () => {
    try {
      const response = await fetch('/api/admin/currencies/seed', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        await refreshCurrencies();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error seeding currencies:', error);
      toast.error('Failed to seed currencies');
    }
  };

  return (
    <div className="mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="currency">Currency Management</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={storeInfo?.vendorProfile?.logo}
                    alt="Profile Picture"
                  />
                  <AvatarFallback>
                    {name ? name.charAt(0).toUpperCase() : "AD"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar-upload">Upload Profile Picture</Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] as File)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="store-name">Name</Label>
                <Input
                  id="store-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <Label htmlFor="store-description">Description</Label>
                <Input
                  id="store-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a brief description"
                />
              </div>

              <div>
                <Label htmlFor="business-type">Business Type</Label>
                <Input
                  id="business-type"
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="Enter business type"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={storeInfo?.email || ""}
                  readOnly
                  disabled
                />
              </div>

              <Button onClick={handleUpdateAccount} className="w-full">
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Currency Management
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage currencies for your store. Current: {currentCurrency?.name} ({currentCurrency?.symbol})
                </p>
              </div>
              <div className="flex gap-2">
                {currencies.length === 0 && (
                  <Button onClick={seedCurrencies} variant="outline">
                    Seed Default Currencies
                  </Button>
                )}
                <Button onClick={() => setShowAddCurrency(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Currency
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currencies.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No currencies configured</p>
                  <p className="text-sm text-muted-foreground">Add currencies to enable multi-currency support</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currencies.map((currency) => (
                    <div
                      key={currency._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold">{currency.symbol}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{currency.name}</h3>
                            <Badge variant="outline">{currency.code}</Badge>
                            {currency.isDefault && (
                              <Badge variant="default">Default</Badge>
                            )}
                            {!currency.isActive && (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Exchange Rate: {currency.exchangeRate} (from NPR)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!currency.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefaultCurrency(currency)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCurrency(currency)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!currency.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCurrency(currency._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add/Edit Currency Form */}
          {showAddCurrency && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingCurrency ? 'Edit Currency' : 'Add New Currency'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency-name">Currency Name</Label>
                    <Input
                      id="currency-name"
                      value={currencyForm.name}
                      onChange={(e) => setCurrencyForm({ ...currencyForm, name: e.target.value })}
                      placeholder="e.g., US Dollar"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency-code">Currency Code (3 characters)</Label>
                    <Input
                      id="currency-code"
                      value={currencyForm.code}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        if (value.length <= 3) {
                          setCurrencyForm({ ...currencyForm, code: value });
                        }
                      }}
                      placeholder="e.g., USD"
                      maxLength={3}
                      minLength={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Must be exactly 3 characters (e.g., USD, EUR, NPR)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency-symbol">Symbol</Label>
                    <Input
                      id="currency-symbol"
                      value={currencyForm.symbol}
                      onChange={(e) => setCurrencyForm({ ...currencyForm, symbol: e.target.value })}
                      placeholder="e.g., $"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exchange-rate">Exchange Rate (from NPR)</Label>
                    <Input
                      id="exchange-rate"
                      type="number"
                      step="0.000001"
                      value={currencyForm.exchangeRate}
                      onChange={(e) => setCurrencyForm({ ...currencyForm, exchangeRate: e.target.value })}
                      placeholder="e.g., 0.0075"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-active"
                      checked={currencyForm.isActive}
                      onCheckedChange={(checked) => setCurrencyForm({ ...currencyForm, isActive: checked })}
                    />
                    <Label htmlFor="is-active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-default"
                      checked={currencyForm.isDefault}
                      onCheckedChange={(checked) => setCurrencyForm({ ...currencyForm, isDefault: checked })}
                    />
                    <Label htmlFor="is-default">Set as Default</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveCurrency}>
                    {editingCurrency ? 'Update Currency' : 'Add Currency'}
                  </Button>
                  <Button variant="outline" onClick={resetCurrencyForm}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
