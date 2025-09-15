"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyBlock, dracula } from "react-code-blocks";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";

export default function ApiDocsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    auth: true,
    products: false,
    categories: false,
    orders: false,
  });

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopied(section);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className=" mx-auto py-10">
      <h1 className="text-4xl font-bold mb-2">API Documentation</h1>
      <p className="text-xl text-gray-500 mb-8">
        Complete API reference for mobile app integration
      </p>

      <Tabs defaultValue="rest" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="rest">REST API</TabsTrigger>
          <TabsTrigger value="graphql">GraphQL</TabsTrigger>
          <TabsTrigger value="sdk">Mobile SDK</TabsTrigger>
        </TabsList>

        <TabsContent value="rest" className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    <button
                      onClick={() => toggleSection("auth")}
                      className="mr-2 focus:outline-none"
                    >
                      {expandedSections["auth"] ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                    Authentication
                  </CardTitle>
                  <CardDescription>
                    Endpoints for user authentication and registration
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(
                      `
// Login
POST /api/auth/login
Body: { email, password }

// Register
POST /api/auth/register
Body: { name, email, password }

// Logout
POST /api/auth/logout

// Get current user
GET /api/auth/me
                  `,
                      "auth"
                    )
                  }
                >
                  {copied === "auth" ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedSections["auth"] && (
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Login</h3>
                    <CopyBlock
                      text={`POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user"
  }
}`}
                      language="javascript"
                      showLineNumbers={false}
                      theme={dracula}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Register</h3>
                    <CopyBlock
                      text={`POST /api/auth/register
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "user"
  }
}`}
                      language="javascript"
                      showLineNumbers={false}
                      theme={dracula}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    <button
                      onClick={() => toggleSection("products")}
                      className="mr-2 focus:outline-none"
                    >
                      {expandedSections["products"] ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                    Products
                  </CardTitle>
                  <CardDescription>
                    Endpoints for product management
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(
                      `
// Get products
GET /api/products?category=&brand=&minPrice=&maxPrice=&onSale=&sort=&page=&limit=&search=

// Get product by ID or slug
GET /api/products/:id

// Create product (admin only)
POST /api/products
Body: { name, description, price, ... }

// Update product (admin only)
PUT /api/products/:id
Body: { name, description, price, ... }

// Delete product (admin only)
DELETE /api/products/:id
                  `,
                      "products"
                    )
                  }
                >
                  {copied === "products" ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedSections["products"] && (
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Get Products</h3>
                    <CopyBlock
                      text={`GET /api/products?category=electronics&brand=apple&minPrice=100&maxPrice=1000&onSale=true&sort=price-asc&page=1&limit=10&search=iphone

Response:
{
  "success": true,
  "products": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}`}
                      language="javascript"
                      showLineNumbers={false}
                      theme={dracula}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    <button
                      onClick={() => toggleSection("categories")}
                      className="mr-2 focus:outline-none"
                    >
                      {expandedSections["categories"] ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                    Categories
                  </CardTitle>
                  <CardDescription>
                    Endpoints for category management
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(
                      `
// Get categories
GET /api/categories?page=&limit=&search=&parent=

// Get category by ID or slug
GET /api/categories/:id

// Create category (admin only)
POST /api/categories
Body: { name, description, ... }

// Update category (admin only)
PUT /api/categories/:id
Body: { name, description, ... }

// Delete category (admin only)
DELETE /api/categories/:id
                  `,
                      "categories"
                    )
                  }
                >
                  {copied === "categories" ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    <button
                      onClick={() => toggleSection("orders")}
                      className="mr-2 focus:outline-none"
                    >
                      {expandedSections["orders"] ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                    Orders
                  </CardTitle>
                  <CardDescription>
                    Endpoints for order management
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(
                      `
// Get user orders
GET /api/user/orders

// Get order by ID
GET /api/user/orders/:id

// Create order
POST /api/orders
Body: { items, shippingAddress, ... }

// Update order status (admin only)
PUT /api/admin/orders/:id/status
Body: { status, description }
                  `,
                      "orders"
                    )
                  }
                >
                  {copied === "orders" ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="graphql">
          <Card>
            <CardHeader>
              <CardTitle>GraphQL API</CardTitle>
              <CardDescription>
                Coming soon! Our GraphQL API is currently in development.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                The GraphQL API will provide a more flexible way to query our
                data, allowing you to request exactly what you need in a single
                request.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sdk">
          <Card>
            <CardHeader>
              <CardTitle>Mobile SDK</CardTitle>
              <CardDescription>Native SDKs for iOS and Android</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">iOS SDK</h3>
                  <CopyBlock
                    text={`// Install via CocoaPods
pod 'NepaliEcommerceSDK', '~> 1.0.0'

// Usage
import NepaliEcommerceSDK

// Initialize
NepaliEcommerceSDK.initialize(apiKey: "YOUR_API_KEY")

// Login
NepaliEcommerceSDK.auth.login(email: "user@example.com", password: "password") { result in
    switch result {
    case .success(let user):
        print("Logged in user: \(user.name)")
    case .failure(let error):
        print("Login error: \(error)")
    }
}`}
                    language="swift"
                    showLineNumbers={false}
                    theme={dracula}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Android SDK</h3>
                  <CopyBlock
                    text={`// Install via Gradle
implementation 'com.nepaliecommerce:sdk:1.0.0'

// Usage
import com.nepaliecommerce.sdk.NepaliEcommerceSDK;

// Initialize
NepaliEcommerceSDK.initialize(context, "YOUR_API_KEY");

// Login
NepaliEcommerceSDK.getAuth().login("user@example.com", "password", new AuthCallback() {
    @Override
    public void onSuccess(User user) {
        Log.d("SDK", "Logged in user: " + user.getName());
    }
    
    @Override
    public void onError(Exception e) {
        Log.e("SDK", "Login error: " + e.getMessage());
    }
});`}
                    language="java"
                    showLineNumbers={false}
                    theme={dracula}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
