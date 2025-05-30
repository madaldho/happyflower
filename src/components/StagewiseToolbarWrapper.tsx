
import React from 'react';
import { Crop, Move, RotateCw, Maximize, Download, Palette, Layers, Type, Zap } from 'lucide-react';

interface Tool {
  icon: React.ComponentType<any>;
  label: string;
  action: () => void;
}

interface StagewiseToolbarWrapperProps {
  tools: Tool[];
  onToolSelect: (tool: Tool) => void;
}

export function StagewiseToolbarWrapper({ tools, onToolSelect }: StagewiseToolbarWrapperProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white border-b border-gray-200">
      {tools.map((tool, index) => (
        <button
          key={index}
          onClick={() => onToolSelect(tool)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          aria-label={tool.label}
        >
          <tool.icon className="w-4 h-4" />
          <span>{tool.label}</span>
        </button>
      ))}
    </div>
  );
}
