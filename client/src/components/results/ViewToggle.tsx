import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Expand, Minimize2 } from 'lucide-react';

interface ViewToggleProps {
  isCompact: boolean;
  onToggle: () => void;
}

export function ViewToggle({ isCompact, onToggle }: ViewToggleProps) {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
        <Button
          variant={!isCompact ? "default" : "ghost"}
          size="sm"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <Expand className="h-4 w-4" />
          Wide View
        </Button>
        <Button
          variant={isCompact ? "default" : "ghost"}
          size="sm"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <Minimize2 className="h-4 w-4" />
          Compact View
        </Button>
      </div>
    </div>
  );
}
