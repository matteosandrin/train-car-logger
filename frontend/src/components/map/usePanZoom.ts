import { useEffect, useRef } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 16;

interface Transform {
  x: number;
  y: number;
  scale: number;
}

// pan/zoom for an SVG with a fixed viewBox: one pointer pans,
// two pointers pinch, wheel zooms. The transform is applied
// directly to the inner <g> to avoid re-renders.
export function usePanZoom(viewWidth: number, viewHeight: number) {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const transformRef = useRef<Transform>({ x: 0, y: 0, scale: MIN_SCALE });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());

  useEffect(() => {
    const svg = svgRef.current;
    const group = groupRef.current;
    if (!svg || !group) return;

    const apply = () => {
      const t = transformRef.current;
      group.setAttribute(
        "transform",
        `translate(${t.x} ${t.y}) scale(${t.scale})`,
      );
    };

    // convert a client point to viewBox coordinates
    const toViewBox = (clientX: number, clientY: number) => {
      const rect = svg.getBoundingClientRect();
      const fit = Math.min(rect.width / viewWidth, rect.height / viewHeight);
      const offsetX = (rect.width - viewWidth * fit) / 2;
      const offsetY = (rect.height - viewHeight * fit) / 2;
      return {
        x: (clientX - rect.left - offsetX) / fit,
        y: (clientY - rect.top - offsetY) / fit,
        fit,
      };
    };

    const clamp = (t: Transform): Transform => {
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale));
      return {
        scale,
        x: Math.min(0, Math.max(viewWidth * (1 - scale), t.x)),
        y: Math.min(0, Math.max(viewHeight * (1 - scale), t.y)),
      };
    };

    // zoom by factor about a viewBox point
    const zoomAt = (px: number, py: number, factor: number) => {
      const t = transformRef.current;
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale * factor));
      const ratio = scale / t.scale;
      transformRef.current = clamp({
        scale,
        x: px - (px - t.x) * ratio,
        y: py - (py - t.y) * ratio,
      });
      apply();
    };

    const pinchState = () => {
      const pts = [...pointersRef.current.values()];
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      return {
        dist: Math.hypot(dx, dy),
        midX: (pts[0].x + pts[1].x) / 2,
        midY: (pts[0].y + pts[1].y) / 2,
      };
    };

    let lastPinchDist = 0;

    const onPointerDown = (e: PointerEvent) => {
      svg.setPointerCapture(e.pointerId);
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointersRef.current.size === 2) {
        lastPinchDist = pinchState().dist;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const prev = pointersRef.current.get(e.pointerId);
      if (!prev) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointersRef.current.size === 1) {
        const { fit } = toViewBox(e.clientX, e.clientY);
        const t = transformRef.current;
        transformRef.current = clamp({
          ...t,
          x: t.x + (e.clientX - prev.x) / fit,
          y: t.y + (e.clientY - prev.y) / fit,
        });
        apply();
      } else if (pointersRef.current.size === 2) {
        const pinch = pinchState();
        if (lastPinchDist > 0) {
          const mid = toViewBox(pinch.midX, pinch.midY);
          zoomAt(mid.x, mid.y, pinch.dist / lastPinchDist);
        }
        lastPinchDist = pinch.dist;
      }
    };

    const onPointerEnd = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      lastPinchDist = 0;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = toViewBox(e.clientX, e.clientY);
      zoomAt(p.x, p.y, Math.exp(-e.deltaY * 0.002));
    };

    apply();
    svg.addEventListener("pointerdown", onPointerDown);
    svg.addEventListener("pointermove", onPointerMove);
    svg.addEventListener("pointerup", onPointerEnd);
    svg.addEventListener("pointercancel", onPointerEnd);
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      svg.removeEventListener("pointerdown", onPointerDown);
      svg.removeEventListener("pointermove", onPointerMove);
      svg.removeEventListener("pointerup", onPointerEnd);
      svg.removeEventListener("pointercancel", onPointerEnd);
      svg.removeEventListener("wheel", onWheel);
    };
  }, [viewWidth, viewHeight]);

  return { svgRef, groupRef };
}
