'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  scrollClassName?: string;
  showArrows?: boolean;
}

export default function HorizontalScrollContainer({
  children,
  className = '',
  scrollClassName = '',
  showArrows = true,
}: HorizontalScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Drag coordinates & tracking
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasMovedRef = useRef(false);

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScrollability();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => checkScrollability());
      resizeObserver.observe(el);
      Array.from(el.children).forEach((child) => resizeObserver?.observe(child));
    }

    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
      resizeObserver?.disconnect();
    };
  }, [checkScrollability, children]);

  // Horizontal scroll on mouse wheel
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
      el.scrollLeft += e.deltaY;
      checkScrollability();
    }
  };

  // Hold & Scroll (Mouse Drag)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;

    setIsDragging(true);
    hasMovedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftStartRef.current = el.scrollLeft;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.pageX - el.offsetLeft;
      const walk = x - startXRef.current;

      if (Math.abs(walk) > 4) {
        hasMovedRef.current = true;
      }

      el.scrollLeft = scrollLeftStartRef.current - walk;
      checkScrollability();
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Prevent clicking child buttons if user was dragging
  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasMovedRef.current = false;
    }
  };

  const scrollByAmount = (amount: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScrollability, 300);
  };

  return (
    <div className={`relative flex items-center min-w-0 ${className}`}>
      {/* Left scroll indicator & arrow */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent pr-4 pl-0.5">
          {showArrows && (
            <button
              type="button"
              onClick={() => scrollByAmount(-140)}
              className="p-0.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 hover:text-cyan-100 hover:bg-slate-800 shadow-md transition-all animate-pulse"
              title="Scroll left"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Main scrollable content */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onClickCapture={handleClickCapture}
        className={`flex items-center gap-1 overflow-x-auto scrollbar-none select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${scrollClassName}`}
        style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
      >
        {children}
      </div>

      {/* Right scroll indicator & arrow */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-l from-slate-950 via-slate-950/90 to-transparent pl-4 pr-0.5">
          {showArrows && (
            <button
              type="button"
              onClick={() => scrollByAmount(140)}
              className="p-0.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 hover:text-cyan-100 hover:bg-slate-800 shadow-md transition-all animate-pulse"
              title="Scroll right (drag or click)"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
