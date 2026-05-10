"use client";

import React, { useMemo, useState } from "react";
import { Download, Layers, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type LayerPattern = "rings" | "radial" | "wave";

interface LayerShape {
  id: string;
  color: string;
  cutPaths: string[];
}

const BOARD_COLORS = ["#111827", "#7c2d12", "#14532d", "#0f766e", "#581c87", "#7f1d1d"];

const createSeededRandom = (seed: string) => {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
};

const gcodeHeader = `; Multi-layer decorative panel\nG21 ; millimeters\nG90 ; absolute\nG0 Z5\n`;
const gcodeFooter = "G0 Z5\nM5\nG0 X0 Y0\nM2\n";

const LaserCuttingService = () => {
  const [panelWidth, setPanelWidth] = useState(600);
  const [panelHeight, setPanelHeight] = useState(400);
  const [layers, setLayers] = useState(4);
  const [safeMargin, setSafeMargin] = useState(12);
  const [pattern, setPattern] = useState<LayerPattern>("rings");
  const [seed, setSeed] = useState("forest-panel");
  const [feedRate, setFeedRate] = useState(900);

  const layerData = useMemo(() => {
    const rand = createSeededRandom(seed);
    const cx = panelWidth / 2;
    const cy = panelHeight / 2;
    const usableW = panelWidth - safeMargin * 2;
    const usableH = panelHeight - safeMargin * 2;

    return Array.from({ length: layers }, (_, idx): LayerShape => {
      const ratio = (idx + 1) / (layers + 1);
      const cutPaths: string[] = [];

      if (pattern === "rings") {
        const rings = 3 + idx;
        for (let r = 1; r <= rings; r += 1) {
          const rx = (usableW * ratio * r) / (rings * 2);
          const ry = (usableH * ratio * r) / (rings * 2);
          cutPaths.push(`M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`);
        }
      }

      if (pattern === "radial") {
        const lines = 8 + idx * 4;
        for (let l = 0; l < lines; l += 1) {
          const angle = (Math.PI * 2 * l) / lines;
          const start = 40 + rand() * 40;
          const end = Math.min(usableW, usableH) / 2;
          const x1 = cx + Math.cos(angle) * start;
          const y1 = cy + Math.sin(angle) * start;
          const x2 = cx + Math.cos(angle) * end;
          const y2 = cy + Math.sin(angle) * end;
          cutPaths.push(`M ${x1} ${y1} L ${x2} ${y2}`);
        }
      }

      if (pattern === "wave") {
        const rows = 4 + idx;
        for (let row = 0; row < rows; row += 1) {
          const yBase = safeMargin + (usableH / (rows + 1)) * (row + 1);
          const amp = 12 + idx * 4;
          let d = `M ${safeMargin} ${yBase}`;
          const steps = 16;
          for (let s = 1; s <= steps; s += 1) {
            const x = safeMargin + (usableW / steps) * s;
            const y = yBase + Math.sin((s / steps) * Math.PI * (2 + idx * 0.4)) * amp;
            d += ` L ${x} ${y}`;
          }
          cutPaths.push(d);
        }
      }

      return {
        id: `Layer-${idx + 1}`,
        color: BOARD_COLORS[idx % BOARD_COLORS.length],
        cutPaths,
      };
    });
  }, [layers, panelWidth, panelHeight, safeMargin, pattern, seed]);

  const generateGcode = () => {
    let lines = gcodeHeader;
    lines += `; Size ${panelWidth}x${panelHeight}mm, layers=${layers}\n`;

    layerData.forEach((layer, i) => {
      lines += `\n; ${layer.id}\n`;
      layer.cutPaths.forEach((path, pathIndex) => {
        const points = path
          .replace(/[MLA]/g, " ")
          .trim()
          .split(/\s+/)
          .map(Number)
          .filter((n) => !Number.isNaN(n));

        if (points.length < 4) return;

        lines += `; path ${pathIndex + 1}\n`;
        lines += `G0 X${points[0].toFixed(2)} Y${points[1].toFixed(2)}\n`;
        lines += "M3 S1000\n";
        lines += "G1 Z-2.8 F250\n";

        for (let p = 2; p < points.length; p += 2) {
          if (points[p + 1] !== undefined) {
            lines += `G1 X${points[p].toFixed(2)} Y${points[p + 1].toFixed(2)} F${feedRate}\n`;
          }
        }

        lines += "G1 Z2 F400\nM5\n";
      });
      lines += `; End ${layer.id} (${i + 1}/${layers})\n`;
    });

    lines += gcodeFooter;

    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wall-panel-${pattern}-${layers}layers.gcode`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("G-code exported successfully.");
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-6 w-6" /> Multi-layer Wood Panel Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Panel width (mm)</Label>
              <Input type="number" value={panelWidth} min={200} max={1200} onChange={(e) => setPanelWidth(Number(e.target.value) || 600)} />
            </div>
            <div>
              <Label>Panel height (mm)</Label>
              <Input type="number" value={panelHeight} min={200} max={1200} onChange={(e) => setPanelHeight(Number(e.target.value) || 400)} />
            </div>
            <div>
              <Label>Pattern style</Label>
              <Select value={pattern} onValueChange={(v) => setPattern(v as LayerPattern)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rings">Organic Rings</SelectItem>
                  <SelectItem value="radial">Radial Burst</SelectItem>
                  <SelectItem value="wave">Contour Waves</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Layer count: {layers}</Label>
              <Slider value={[layers]} min={2} max={8} step={1} onValueChange={(v) => setLayers(v[0])} />
              <Label>Safe margin (mm): {safeMargin}</Label>
              <Slider value={[safeMargin]} min={5} max={30} step={1} onValueChange={(v) => setSafeMargin(v[0])} />
              <Label>Feed rate (mm/min)</Label>
              <Input type="number" value={feedRate} onChange={(e) => setFeedRate(Number(e.target.value) || 900)} />
              <Label>Seed</Label>
              <Input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="type any seed" />
            </div>

            <div className="rounded-lg border bg-white p-2">
              <svg viewBox={`0 0 ${panelWidth} ${panelHeight}`} className="w-full h-[320px] bg-amber-50">
                <rect x={0} y={0} width={panelWidth} height={panelHeight} fill="#fffbeb" stroke="#92400e" strokeWidth={2} />
                {layerData.map((layer, i) => (
                  <g key={layer.id} opacity={0.22 + i * 0.08}>
                    {layer.cutPaths.map((d, idx) => (
                      <path key={`${layer.id}-${idx}`} d={d} stroke={layer.color} strokeWidth={2} fill="none" />
                    ))}
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => toast.success("Pattern regenerated with current parameters.")} className="gap-2">
              <Wand2 className="h-4 w-4" /> Regenerate
            </Button>
            <Button variant="default" onClick={generateGcode} className="gap-2">
              <Download className="h-4 w-4" /> Export .gcode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LaserCuttingService;
