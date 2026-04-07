import { Activity, Eye, Layers } from "lucide-react";

interface Props {
  fps: number;
  objectCount: number;
  isDetecting: boolean;
}

export function StatsBar({ fps, objectCount, isDetecting }: Props) {
  return (
    <div className="flex items-center gap-6 px-4 py-2.5 bg-card rounded-lg border border-border text-sm font-mono">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Activity className="w-4 h-4 text-detect-green" />
        <span>
          FPS: <span className="text-foreground font-bold">{fps}</span>
        </span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Layers className="w-4 h-4 text-detect-cyan" />
        <span>
          Objects: <span className="text-foreground font-bold">{objectCount}</span>
        </span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Eye className="w-4 h-4 text-detect-amber" />
        <span>
          Status:{" "}
          <span className={isDetecting ? "text-detect-green" : "text-muted-foreground"}>
            {isDetecting ? "Active" : "Idle"}
          </span>
        </span>
      </div>
    </div>
  );
}
