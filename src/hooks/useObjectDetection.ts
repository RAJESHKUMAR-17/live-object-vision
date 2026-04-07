import { useState, useRef, useCallback, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

export function useObjectDetection() {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [fps, setFps] = useState(0);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const detectingRef = useRef(false);

  const loadModel = useCallback(async () => {
    if (modelRef.current) {
      setIsModelReady(true);
      return;
    }
    setIsModelLoading(true);
    try {
      const model = await cocoSsd.load({ base: "lite_mobilenet_v2" });
      modelRef.current = model;
      setIsModelReady(true);
    } catch (err) {
      console.error("Failed to load model:", err);
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  const startDetection = useCallback(
    (video: HTMLVideoElement) => {
      if (!modelRef.current || detectingRef.current) return;
      detectingRef.current = true;
      setIsDetecting(true);
      lastTimeRef.current = performance.now();
      frameCountRef.current = 0;

      const detect = async () => {
        if (!detectingRef.current || !modelRef.current) return;
        if (video.readyState >= 2) {
          try {
            const results = await modelRef.current.detect(video);
            setDetections(results as Detection[]);
          } catch {
            // skip frame
          }
          frameCountRef.current++;
          const now = performance.now();
          const elapsed = now - lastTimeRef.current;
          if (elapsed >= 1000) {
            setFps(Math.round((frameCountRef.current * 1000) / elapsed));
            frameCountRef.current = 0;
            lastTimeRef.current = now;
          }
        }
        rafRef.current = requestAnimationFrame(detect);
      };

      rafRef.current = requestAnimationFrame(detect);
    },
    []
  );

  const stopDetection = useCallback(() => {
    detectingRef.current = false;
    setIsDetecting(false);
    cancelAnimationFrame(rafRef.current);
    setDetections([]);
    setFps(0);
  }, []);

  useEffect(() => {
    return () => {
      detectingRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    isModelLoading,
    isModelReady,
    isDetecting,
    detections,
    fps,
    loadModel,
    startDetection,
    stopDetection,
  };
}
