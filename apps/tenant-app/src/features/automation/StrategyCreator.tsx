import React from 'react';

export function StrategyCreator() {
  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow h-[500px]">
      <h2 className="text-xl font-bold mb-4">Automation Builder</h2>
      <div className="flex gap-4 h-[400px]">
        <div className="w-1/4 border-r pr-4">
          <h3 className="font-semibold mb-2">Blocks</h3>
          <ul className="space-y-2">
            <li className="p-2 border rounded cursor-grab bg-muted">Condition</li>
            <li className="p-2 border rounded cursor-grab bg-muted">Action</li>
          </ul>
        </div>
        <div className="flex-1 p-4 bg-muted/50 rounded flex items-center justify-center border-dashed border-2">
          Drag blocks here to build strategy
        </div>
      </div>
    </div>
  );
}
