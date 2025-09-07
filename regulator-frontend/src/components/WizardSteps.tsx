import React from 'react';
import { Sprout, Scissors, ChevronRight } from 'lucide-react';

export default function WizardSteps({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`px-2 py-1 rounded inline-flex items-center gap-1 ${step >= 1 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
        <Sprout className="h-4 w-4" aria-hidden /> Plant
      </span>
      <ChevronRight className="h-4 w-4 text-gray-300" aria-hidden />
      <span className={`px-2 py-1 rounded inline-flex items-center gap-1 ${step >= 2 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
        <Scissors className="h-4 w-4" aria-hidden /> Harvest
      </span>
    </div>
  );
}
