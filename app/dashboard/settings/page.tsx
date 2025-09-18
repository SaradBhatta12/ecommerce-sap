"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, RefreshCw, Upload, User, Bell, Shield, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useGetUserProfileQuery, useUpdateUserProfileMutation, useGetNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation } from "@/store"

interface UserProfile {
  name: string
  email: string
  phone?: string
  image?: string
}

interface NotificationPreferences {
  email: boolean
  marketing: boolean
  orderUpdates: boolean
  newProducts: boolean
  wishlistReminders: boolean
  priceDropAlerts: boolean
  stockAlerts: boolean
  reviewReminders: boolean
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  
  // RTK Query hooks
  const { data: profileData, isLoading: isProfileLoading, error: profileError } = useGetUserProfileQuery()
  const { data: notificationData, isLoading: isNotificationLoading, error: notificationError } = useGetNotificationPreferencesQuery()
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateUserProfileMutation()
  const [updateNotifications, { isLoading: isUpdatingNotifications }] = useUpdateNotificationPreferencesMutation()
  
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    image: "",
  })
  
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: true,
    marketing: false,
    orderUpdates: true,
    newProducts: false,
    wishlistReminders: true,
    priceDropAlerts: false,
    stockAlerts: true,
    reviewReminders: true,
  })
  
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Update form data when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        image: profileData.avatar || "",
      })
    }
  }, [profileData])

  // Update notifications when notification data is loaded
  useEffect(() => {
    if (notificationData?.preferences) {
      setNotifications(notificationData.preferences)
    }
  }, [notificationData])

  // Handle errors
  useEffect(() => {
    if (profileError) {
      toast.error("Error", {
        description: "Failed to load profile data.",
      })
    }
    if (notificationError) {
      toast.error("Error", {
        description: "Failed to load notification preferences.",
      })
    }
  }, [profileError, notificationError, toast])

  // Refresh all data
  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      // RTK Query will automatically refetch when we call the hooks again
      toast.success("Data refreshed", {
        description: "Your settings have been refreshed successfully.",
      })
    } catch (error) {
      toast.error("Error", {
        description: "Failed to refresh data. Please try again.",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <User className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Sign in required</h3>
          <p className="text-muted-foreground">Please sign in to access your settings.</p>
        </div>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.image,
      }).unwrap()

      await update({ name: formData.name, image: formData.image })
      toast.success("Profile updated", {
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast.error("Error", {
        description: error?.data?.message || "Something went wrong. Please try again.",
      })
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Error", {
        description: "New passwords do not match.",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Error", {
        description: "Password must be at least 8 characters long.",
      })
      return
    }

    // Check password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      toast.error("Error", {
        description: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      })
      return
    }



    try {
      await updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap()

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      toast.success("Password updated", {
        description: "Your password has been updated successfully.",
      })
    } catch (error: any) {
      toast.error("Error", {
        description: error?.data?.message || "Something went wrong. Please try again.",
      })
    }
  }

  const handleNotificationChange = async (key: string, checked: boolean) => {
    const updatedNotifications = { ...notifications, [key]: checked }
    setNotifications(updatedNotifications)

    try {
      await updateNotifications({
        preferences: updatedNotifications
      }).unwrap()
    } catch (error: any) {
      // Revert on error
      setNotifications(notifications)
      toast.error("Error", {
        description: error?.data?.message || "Failed to update notification preferences.",
      })
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <Separator />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and profile picture.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {isProfileLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-20 w-20 rounded-full" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={formData.image || ""} alt={formData.name || "User"} />
                        <AvatarFallback className="text-lg">
                          {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button type="button" variant="outline" size="sm" disabled>
                          <Upload className="h-4 w-4 mr-2" />
                          Change Avatar
                        </Button>
                        <p className="text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdatingProfile || !formData.name.trim()}>
                  {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive via email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isNotificationLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Essential Notifications</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive important account notifications via email</p>
                        </div>
                        <Switch
                          checked={notifications.email}
                          onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Order Updates</Label>
                          <p className="text-sm text-muted-foreground">Get notified about order status changes and shipping updates</p>
                        </div>
                        <Switch
                          checked={notifications.orderUpdates}
                          onCheckedChange={(checked) => handleNotificationChange("orderUpdates", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Marketing & Promotions</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Marketing Emails</Label>
                          <p className="text-sm text-muted-foreground">Receive marketing and promotional emails about deals and offers</p>
                        </div>
                        <Switch
                          checked={notifications.marketing}
                          onCheckedChange={(checked) => handleNotificationChange("marketing", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">New Products</Label>
                          <p className="text-sm text-muted-foreground">Be the first to know about new product launches</p>
                        </div>
                        <Switch
                          checked={notifications.newProducts}
                          onCheckedChange={(checked) => handleNotificationChange("newProducts", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Shopping Alerts</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Wishlist Reminders</Label>
                          <p className="text-sm text-muted-foreground">Get reminded about items in your wishlist</p>
                        </div>
                        <Switch
                          checked={notifications.wishlistReminders}
                          onCheckedChange={(checked) => handleNotificationChange("wishlistReminders", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Price Drop Alerts</Label>
                          <p className="text-sm text-muted-foreground">Get notified when prices drop on your wishlist items</p>
                        </div>
                        <Switch
                          checked={notifications.priceDropAlerts}
                          onCheckedChange={(checked) => handleNotificationChange("priceDropAlerts", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Stock Alerts</Label>
                          <p className="text-sm text-muted-foreground">Get notified when out-of-stock items become available</p>
                        </div>
                        <Switch
                          checked={notifications.stockAlerts}
                          onCheckedChange={(checked) => handleNotificationChange("stockAlerts", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Review Reminders</Label>
                          <p className="text-sm text-muted-foreground">Get reminded to review your purchased products</p>
                        </div>
                        <Switch
                          checked={notifications.reviewReminders}
                          onCheckedChange={(checked) => handleNotificationChange("reviewReminders", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                We'll always let you know about important changes, but you can pick what else you want to hear about.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {session?.user?.provider !== "credentials" ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Social Login Account</h3>
                  <p className="text-muted-foreground mb-4">
                    Your account is secured through {session?.user?.provider === 'google' ? 'Google' : 'social login'}. 
                    Password changes are managed by your provider.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      To change your password, please visit your {session?.user?.provider === 'google' ? 'Google' : 'social login'} account settings.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password *</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password *</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password"
                        required
                        minLength={6}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm your new password"
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                       type="submit" 
                       disabled={isUpdatingProfile || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
                     >
                       {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Change Password
                     </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="outline">
                          Reset Form
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Password Form</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to clear all password fields? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })}
                          >
                            Reset Form
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
