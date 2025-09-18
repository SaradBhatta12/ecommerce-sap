"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import type * as THREE from "three"

interface ModelProps {
  modelPath: string
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}

function Model({ modelPath, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }: ModelProps) {
  const { scene } = useGLTF(modelPath)
  const modelRef = useRef<THREE.Group>(null)

  // Auto-rotate the model
  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.003
    }
  })

  return <primitive ref={modelRef} object={scene} scale={scale} position={position} rotation={rotation} />
}

interface ProductViewerProps {
  modelPath: string
  fallbackImage: string
}

export function ProductViewer3D({ modelPath, fallbackImage }: ProductViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [zoom, setZoom] = useState(1)
  const controlsRef = useRef<any>(null)

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5))
  }

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
    setZoom(1)
  }

  // Camera controls component
  function CameraController() {
    const { camera } = useThree()

    useEffect(() => {
      camera.zoom = zoom
      camera.updateProjectionMatrix()
    }, [zoom, camera])

    return <OrbitControls ref={controlsRef} enablePan={false} />
  }

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}

      {error ? (
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={fallbackImage || "/placeholder.svg"}
            alt="3D product view"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ) : (
        <>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            onCreated={() => setLoading(false)}
            onError={() => {
              setError(true)
              setLoading(false)
            }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              <Model modelPath={modelPath} scale={1.5} />
              <Environment preset="city" />
              <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2.5} far={4} />
              <CameraController />
            </Suspense>
          </Canvas>

          <div className="absolute bottom-4 right-4 flex space-x-2">
            <Button variant="secondary" size="icon" className="bg-black/50 hover:bg-black/70" onClick={handleZoomIn} aria-label="Zoom in">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="bg-black/50 hover:bg-black/70" onClick={handleZoomOut} aria-label="Zoom out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="bg-black/50 hover:bg-black/70" onClick={handleReset} aria-label="Reset view">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
