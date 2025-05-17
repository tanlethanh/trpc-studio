import { useState } from 'react';

export function usePanelResize() {
  const [leftWidth, setLeftWidth] = useState(60);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const container = document.getElementById('main-panels');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let percent = ((e.clientX - rect.left) / rect.width) * 100;
    percent = Math.max(20, Math.min(80, percent));
    setLeftWidth(percent);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
  };

  return {
    leftWidth,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
} 