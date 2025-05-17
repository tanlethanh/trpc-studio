interface ResizableDividerProps {
  onMouseDown: () => void;
}

export function ResizableDivider({ onMouseDown }: ResizableDividerProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{ cursor: 'col-resize', width: 8, zIndex: 10 }}
      className="flex-shrink-0 flex flex-col justify-center items-center select-none hover:bg-primary/20 transition-colors rounded"
    >
      <div className="w-1 h-16 bg-border rounded-full" />
    </div>
  );
} 