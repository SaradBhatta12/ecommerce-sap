"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CuboidIcon as Cube, Smartphone, Glasses, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { QRCode } from "@/components/ui/qr-code"

interface ARVRViewerProps {
  productId: string
  productName: string
}

export default function ARVRViewer({ productId, productName }: ARVRViewerProps) {
  const [activeTab, setActiveTab] = useState("3d")
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadModel = () => {
    setIsLoading(true)
    // Simulate loading a 3D model
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Cube className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Interactive Product Experience</h3>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>About AR/VR Features</DialogTitle>
                <DialogDescription>
                  Experience this product in 3D, Augmented Reality (AR), or Virtual Reality (VR). These features help
                  you visualize the product in your space before purchasing.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">3D View</h4>
                  <p className="text-sm text-muted-foreground">
                    Rotate, zoom, and explore the product in 3D directly in your browser.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">AR View</h4>
                  <p className="text-sm text-muted-foreground">
                    Place the product in your real environment using your smartphone or tablet camera.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">VR Experience</h4>
                  <p className="text-sm text-muted-foreground">
                    Use a VR headset to experience the product in an immersive virtual showroom.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="3d" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="3d">
              <Cube className="h-4 w-4 mr-2" />
              3D View
            </TabsTrigger>
            <TabsTrigger value="ar">
              <Smartphone className="h-4 w-4 mr-2" />
              AR View
            </TabsTrigger>
            <TabsTrigger value="vr">
              <Glasses className="h-4 w-4 mr-2" />
              VR Experience
            </TabsTrigger>
          </TabsList>

          <TabsContent value="3d" className="pt-4">
            <div className="aspect-video bg-muted/30 rounded-md flex items-center justify-center">
              {isLoading ? (
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading 3D model...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Cube className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">3D model preview</p>
                  <Button onClick={handleLoadModel} className="mt-4">
                    Load 3D Model
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Rotate, zoom, and explore the product in 3D. Click and drag to rotate.
            </p>
          </TabsContent>

          <TabsContent value="ar" className="pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="aspect-square bg-muted/30 rounded-md flex items-center justify-center">
                <QRCode value={`https://example.com/ar/${productId}`} size={200} />
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <h4 className="font-medium">View in Your Space</h4>
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your smartphone to view {productName} in your space using augmented reality.
                </p>
                <div className="space-y-2">
                  <Button className="w-full">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Open on This Device
                  </Button>
                  <Button variant="outline" className="w-full">
                    Send Link to Phone
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vr" className="pt-4">
            <div className="aspect-video bg-muted/30 rounded-md flex items-center justify-center">
              <div className="text-center">
                <Glasses className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Virtual showroom experience</p>
                <div className="flex flex-col sm:flex-row justify-center gap-2 mt-4">
                  <Button>Launch VR Experience</Button>
                  <Button variant="outline">Download for Headset</Button>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Experience this product in our virtual showroom. Compatible with Meta Quest, HTC Vive, and other VR
              headsets.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
