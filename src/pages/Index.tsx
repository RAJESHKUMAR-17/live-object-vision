import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, CameraOff, Eye, EyeOff, Loader2, SwitchCamera, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetectionOverlay } from "@/components/DetectionOverlay";
import { StatsBar } from "@/components/StatsBar";
import { useCamera } from "@/hooks/useCamera";
import { useObjectDetection } from "@/hooks/useObjectDetection";

const Index = () => {
  const {
    videoRef,
    isStreaming,
    error: cameraError,
    devices,
    activeDeviceId,
    startCamera,
    stopCamera,
    switchCamera,
  } = useCamera();

  const {
    isModelLoading,
    isModelReady,
    isDetecting,
    detections,
    fps,
    loadModel,
    startDetection,
    stopDetection,
  } = useObjectDetection();

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [videoNativeSize, setVideoNativeSize] = useState({ width: 0, height: 0 });

  // Load model on mount
  useEffect(() => {
    loadModel();
  }, [loadModel]);

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Get native video dimensions
  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      setVideoNativeSize({ width: v.videoWidth, height: v.videoHeight });
    }
  }, [videoRef]);

  const handleStart = async () => {
    await startCamera();
  };

  const handleStop = () => {
    stopDetection();
    stopCamera();
  };

  const toggleDetection = () => {
    if (isDetecting) {
      stopDetection();
    } else if (videoRef.current) {
      startDetection(videoRef.current);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scan className="w-7 h-7 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">
            Object<span className="text-primary">Detect</span>
          </h1>
        </div>
        {isStreaming && (
          <StatsBar fps={fps} objectCount={detections.length} isDetecting={isDetecting} />
        )}
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        {/* Video container */}
        <div
          ref={containerRef}
          className="relative w-full max-w-3xl aspect-video bg-card rounded-xl border border-border overflow-hidden"
        >
          <video
            ref={videoRef}
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {isDetecting && (
            <DetectionOverlay
              detections={detections}
              videoWidth={videoNativeSize.width}
              videoHeight={videoNativeSize.height}
              containerWidth={containerSize.width}
              containerHeight={containerSize.height}
            />
          )}

          {/* Overlay states */}
          {!isStreaming && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <Camera className="w-16 h-16 opacity-30" />
              <p className="text-sm">Click "Start Camera" to begin</p>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <CameraOff className="w-12 h-12 text-destructive" />
              <p className="text-sm text-destructive">{cameraError}</p>
            </div>
          )}

          {isModelLoading && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-card/90 backdrop-blur px-3 py-1.5 rounded-md border border-border text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              Loading detection model…
            </div>
          )}

          {isDetecting && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-primary/20 backdrop-blur px-2.5 py-1 rounded-full text-xs text-primary font-mono">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              LIVE
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {!isStreaming ? (
            <Button onClick={handleStart} disabled={isModelLoading} className="gap-2">
              <Camera className="w-4 h-4" />
              Start Camera
            </Button>
          ) : (
            <Button onClick={handleStop} variant="destructive" className="gap-2">
              <CameraOff className="w-4 h-4" />
              Stop Camera
            </Button>
          )}

          {isStreaming && isModelReady && (
            <Button
              onClick={toggleDetection}
              variant={isDetecting ? "secondary" : "default"}
              className="gap-2"
            >
              {isDetecting ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Pause Detection
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Start Detection
                </>
              )}
            </Button>
          )}

          {isStreaming && devices.length > 1 && (
            <div className="flex items-center gap-2">
              {devices.map((d) => (
                <Button
                  key={d.deviceId}
                  size="sm"
                  variant={d.deviceId === activeDeviceId ? "default" : "outline"}
                  onClick={() => switchCamera(d.deviceId)}
                  className="gap-1.5 text-xs"
                >
                  <SwitchCamera className="w-3.5 h-3.5" />
                  {d.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
