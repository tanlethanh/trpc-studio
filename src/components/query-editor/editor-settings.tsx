import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings2Icon, ZoomInIcon, ZoomOutIcon, TypeIcon } from 'lucide-react';

interface EditorSettingsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function EditorSettings({ 
  onZoomIn, 
  onZoomOut, 
  onResetZoom 
}: EditorSettingsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings2Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Editor Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="pl-2">Font Size</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={false}
          onCheckedChange={onZoomIn}
          className="flex items-center justify-start pl-2"
        >
          <ZoomInIcon className="mr-2 h-4 w-4" />
          Zoom In
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={false}
          onCheckedChange={onZoomOut}
          className="flex items-center justify-start pl-2"
        >
          <ZoomOutIcon className="mr-2 h-4 w-4" />
          Zoom Out
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={false}
          onCheckedChange={onResetZoom}
          className="flex items-center justify-start pl-2"
        >
          <TypeIcon className="mr-2 h-4 w-4" />
          Reset Zoom
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 