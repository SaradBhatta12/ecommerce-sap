"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getStoreInfo,
  updateStoreDomain,
  updateStoreInfo,
} from "@/_actions/_admin";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getPaymentDetails, updatePaymentDetails } from "@/_actions/_payment";

export default function AdminSettings() {
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [storeInfo, setStoreInfo] = useState<any>({});
  const [domain, setDomain] = useState("");
  const [fullDomain, setFullDomain] = useState("");
  const [activeTab, setActiveTab] = useState("accounts");

  // Payment states
  const [esewaMerchantCode, setEsewaMerchantCode] = useState("");
  const [esewaSecretKey, setEsewaSecretKey] = useState("");
  const [khaltiPublicKey, setKhaltiPublicKey] = useState("");
  const [khaltiSecretKey, setKhaltiSecretKey] = useState("");
  const [khaltiSuccessCallbackUrl, setKhaltiSuccessCallbackUrl] = useState("");
  const [khaltiFailureCallbackUrl, setKhaltiFailureCallbackUrl] = useState("");

  const getPaymentMethods = async () => {
    try {
      const res = await getPaymentDetails();
      if (res.success) {
        setEsewaMerchantCode(res.esewa?.merchantId || "");
        setEsewaSecretKey(res.esewa?.secretKey || "");
        setKhaltiPublicKey(res.khalti?.publicKey || "");
        setKhaltiSecretKey(res.khalti?.secretKey || "");
        setKhaltiSuccessCallbackUrl(res.khalti?.returnUrl || "");
        setKhaltiFailureCallbackUrl(res.khalti?.callbackUrl || "");
      } else {
        toast.error(res.message || "Failed to fetch payment details");
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
      toast.error("Something went wrong while fetching payment details");
    }
  };

  const getStoreInformations = async () => {
    try {
      const response = await getStoreInfo();
      if (response.success) {
        const store = JSON.parse(response.store as string);
        setStoreInfo(store);
        setDomain(store.domain || "");
        setFullDomain(store.fullDomain || "");
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

  const updateEsewaSettings = async () => {
    try {
      const response = await updatePaymentDetails({
        provider: "esewa",
        merchantId: esewaMerchantCode,
        secretKey: esewaSecretKey,
      });
      if (response.success) {
        toast.success("eSewa settings updated successfully");
      } else {
        toast.error(response.message || "Failed to update eSewa settings");
      }
    } catch (error) {
      console.error("Error updating eSewa settings:", error);
      toast.error("Something went wrong while updating eSewa settings");
    }
  };

  const updateKhaltiSettings = async () => {
    try {
      const response = await updatePaymentDetails(
        {
          publicKey: khaltiPublicKey,
          secretKey: khaltiSecretKey,
          returnUrl: khaltiSuccessCallbackUrl,
          callbackUrl: khaltiFailureCallbackUrl,
        },
        {
          publicKey: khaltiPublicKey,
          secretKey: khaltiSecretKey,
          returnUrl: khaltiSuccessCallbackUrl,
          callbackUrl: khaltiFailureCallbackUrl,
        }
      );
      if (response.success) {
        toast.success("Khalti settings updated successfully");
      } else {
        toast.error(response.message || "Failed to update Khalti settings");
      }
    } catch (error) {
      console.error("Error updating Khalti settings:", error);
      toast.error("Something went wrong while updating Khalti settings");
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    getStoreInformations();
  }, []);

  // Fetch payment data when payment tab is active
  useEffect(() => {
    if (activeTab === "payment") {
      getPaymentMethods();
    }
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Fetch relevant data based on the active tab
    switch (value) {
      case "accounts":
        getStoreInformations();
        break;
      case "domains":
        getStoreInformations();
        break;
      case "payment":
        getPaymentMethods();
        break;
      default:
        break;
    }
  };

  return (
    <div className="mx-auto p-4 sm:p-6 md:p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="flex flex-wrap gap-2 justify-start w-fit">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
          <TabsTrigger value="domains">Domain Settings</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Admin Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={storeInfo?.vendorProfile?.logo}
                    alt="Admin Avatar"
                  />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar-upload">Upload Store Logo</Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] as File)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="store-description">Store Description</Label>
                <Input
                  id="store-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter store description"
                />
              </div>

              <div>
                <Label htmlFor="store-name">Store Name</Label>
                <Input
                  id="store-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter store name"
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

              <Button
                onClick={async () => {
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
                }}
              >
                Update Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Management */}
        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Approval & Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Approve new vendors, manage existing ones, and toggle access.
              </div>
              <Button variant="outline">Go to Vendor Dashboard</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain Settings */}
        <TabsContent value="domains">
          <Card>
            <CardHeader>
              <CardTitle>Custom Domain Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="base-domain">Base Domain</Label>
                <Input
                  id="base-domain"
                  type="text"
                  placeholder="e.g. emart"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vendor-domain">Vendor Domain Format</Label>
                <Input
                  id="vendor-domain"
                  type="text"
                  placeholder="e.g. {{storeName}}.emart.com"
                  value={fullDomain}
                  onChange={(e) => setFullDomain(e.target.value)}
                />
              </div>
              <Button
                onClick={async () => {
                  try {
                    const response = await updateStoreDomain(
                      domain,
                      fullDomain
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
                }}
              >
                Save Domain
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Bank & Payment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="esewa" className="w-full space-y-4">
                <TabsList className="justify-start w-fit">
                  <TabsTrigger value="esewa">eSewa</TabsTrigger>
                  <TabsTrigger value="khalti">Khalti</TabsTrigger>
                </TabsList>

                {/* eSewa Settings */}
                <TabsContent value="esewa">
                  <Card>
                    <CardHeader>
                      <CardTitle>eSewa Payment Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="esewa-merchant">
                          Merchant Code (scd)
                        </Label>
                        <Input
                          id="esewa-merchant"
                          type="text"
                          value={esewaMerchantCode}
                          placeholder="e.g. EPAYTEST"
                          onChange={(e) => setEsewaMerchantCode(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="esewa-secret">Secret Key</Label>
                        <Input
                          id="esewa-secret"
                          type="text"
                          value={esewaSecretKey}
                          placeholder="e.g. your-secret-key"
                          onChange={(e) => setEsewaSecretKey(e.target.value)}
                        />
                      </div>

                      <Button onClick={updateEsewaSettings}>
                        Update eSewa Info
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Khalti Settings */}
                <TabsContent value="khalti">
                  <Card>
                    <CardHeader>
                      <CardTitle>Khalti Payment Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="khalti-public">Public Key</Label>
                        <Input
                          id="khalti-public"
                          type="text"
                          value={khaltiPublicKey}
                          placeholder="e.g. test_public_key_dc74bd8a9..."
                          onChange={(e) => setKhaltiPublicKey(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="khalti-secret">Secret Key</Label>
                        <Input
                          id="khalti-secret"
                          type="text"
                          value={khaltiSecretKey}
                          placeholder="e.g. test_secret_key_64f239..."
                          onChange={(e) => setKhaltiSecretKey(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="khalti-success">
                          Success Callback URL
                        </Label>
                        <Input
                          id="khalti-success"
                          type="url"
                          value={khaltiSuccessCallbackUrl}
                          placeholder="https://yourstore.com/payment/success"
                          onChange={(e) =>
                            setKhaltiSuccessCallbackUrl(e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="khalti-failure">
                          Failure Callback URL
                        </Label>
                        <Input
                          id="khalti-failure"
                          type="url"
                          value={khaltiFailureCallbackUrl}
                          onChange={(e) =>
                            setKhaltiFailureCallbackUrl(e.target.value)
                          }
                          placeholder="https://yourstore.com/payment/failure"
                        />
                      </div>
                      <Button onClick={updateKhaltiSettings}>
                        Update Khalti Info
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
