import type { Detection } from "@/hooks/useObjectDetection";

const COLORS = [
  "hsl(160, 80%, 45%)",
  "hsl(185, 85%, 55%)",
  "hsl(38, 92%, 55%)",
  "hsl(350, 80%, 60%)",
  "hsl(270, 70%, 60%)",
  "hsl(45, 90%, 50%)",
];

function getColor(index: number) {
  return COLORS[index % COLORS.length];
}

interface Props {
  detections: Detection[];
  videoWidth: number;
  videoHeight: number;
  containerWidth: number;
  containerHeight: number;
}

export function DetectionOverlay({
  detections,
  videoWidth,
  videoHeight,
  containerWidth,
  containerHeight,
}: Props) {
  if (!videoWidth || !videoHeight) return null;

  const scaleX = containerWidth / videoWidth;
  const scaleY = containerHeight / videoHeight;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={containerWidth}
      height={containerHeight}
      viewBox={`0 0 ${containerWidth} ${containerHeight}`}
    >
      {detections.map((det, i) => {
        const [x, y, w, h] = det.bbox;
        const sx = x * scaleX;
        const sy = y * scaleY;
        const sw = w * scaleX;
        const sh = h * scaleY;
        const color = getColor(i);
        const confidence = Math.round(det.score * 100);

        return (
          <g key={`${det.class}-${i}`}>
            <rect
              x={sx}
              y={sy}
              width={sw}
              height={sh}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              rx={4}
            />
            <rect
              x={sx}
              y={sy - 22}
              width={Math.max(det.class.length * 8 + 45, 70)}
              height={22}
              fill={color}
              rx={4}
              ry={4}
            />
            <text
              x={sx + 5}
              y={sy - 6}
              fill="hsl(220, 20%, 7%)"
              fontSize={12}
              fontWeight={700}
              fontFamily="monospace"
            >
              {det.class} {confidence}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
