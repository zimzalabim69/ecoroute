"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SnapPoint = "peek" | "half" | "full";

const SNAP_HEIGHTS: Record<SnapPoint, number> = {
  peek: 180,
  half: 360,
  full: -1, // full height minus header
};

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialSnap?: SnapPoint;
  title?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  initialSnap = "peek",
  title,
}: BottomSheetProps) {
  const [snap, setSnap] = useState<SnapPoint>(initialSnap);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startTopRef = useRef(0);
  const dragStartTime = useRef(0);

  useEffect(() => {
    const update = () => setContainerHeight(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getSnapPx = useCallback(
    (point: SnapPoint) => {
      if (point === "full") {
        return Math.max(0, containerHeight - 56);
      }
      return SNAP_HEIGHTS[point];
    },
    [containerHeight]
  );

  const translateY = useCallback(
    (point: SnapPoint, offset = 0) => {
      const h = getSnapPx(point);
      return containerHeight - h + offset;
    },
    [getSnapPx, containerHeight]
  );

  const wasOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setSnap(initialSnap);
      setDragY(0);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialSnap]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!sheetRef.current) return;
      setIsDragging(true);
      startYRef.current = e.clientY;
      startTopRef.current = translateY(snap);
      dragStartTime.current = Date.now();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [snap, translateY]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const delta = e.clientY - startYRef.current;
      const newY = startTopRef.current + delta;
      // clamp so it can't go above top
      setDragY(Math.max(0, newY - translateY(snap, 0)));
    },
    [isDragging, snap, translateY]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      const delta = e.clientY - startYRef.current;
      const velocity = delta / Math.max(1, Date.now() - dragStartTime.current);
      const currentY = translateY(snap) + dragY;

      // Swipe down fast or dragged past threshold => close
      if (velocity > 0.6 || currentY > containerHeight * 0.6) {
        onClose();
        setDragY(0);
        return;
      }

      // Snap to nearest point
      const snapValues: SnapPoint[] = ["peek", "half", "full"];
      let nearest: SnapPoint = snap;
      let minDist = Infinity;
      for (const s of snapValues) {
        const dist = Math.abs(currentY - translateY(s));
        if (dist < minDist) {
          minDist = dist;
          nearest = s;
        }
      }
      setSnap(nearest);
      setDragY(0);
    },
    [isDragging, snap, translateY, onClose, dragY, containerHeight]
  );

  const currentTranslate = translateY(snap) + (isDragging ? dragY : 0);

  if (!isOpen) return null;

  return (
    <div className="pointer-events-auto absolute inset-0 z-[2000] overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-x border-[#2a2a2a] bg-[#1E1E1E] shadow-[0_-4px_24px_rgba(0,0,0,0.6)] will-change-transform"
        style={{
          transform: `translateY(${currentTranslate}px)`,
          transition: isDragging ? "none" : "transform 300ms ease-out",
          boxShadow: "0 0 20px rgba(76,175,80,0.08), 0 -4px 24px rgba(0,0,0,0.6)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "bottom-sheet-title" : undefined}
      >
        {/* Drag handle */}
        <div
          className="flex cursor-grab items-center justify-center py-3 active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="Drag to resize sheet"
        >
          <div className="h-1.5 w-10 rounded-full bg-[#737373]/60" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-5 pb-3">
            <h2 id="bottom-sheet-title" className="text-lg font-semibold text-[#ededed]">
              {title}
            </h2>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-5 pb-8">{children}</div>
      </div>
    </div>
  );
}
