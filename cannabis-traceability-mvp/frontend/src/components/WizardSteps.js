import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sprout, Scissors, ChevronRight } from 'lucide-react';
export default function WizardSteps({ step }) {
    return (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsxs("span", { className: `px-2 py-1 rounded inline-flex items-center gap-1 ${step >= 1 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`, children: [_jsx(Sprout, { className: "h-4 w-4", "aria-hidden": true }), " Plant"] }), _jsx(ChevronRight, { className: "h-4 w-4 text-gray-300", "aria-hidden": true }), _jsxs("span", { className: `px-2 py-1 rounded inline-flex items-center gap-1 ${step >= 2 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`, children: [_jsx(Scissors, { className: "h-4 w-4", "aria-hidden": true }), " Harvest"] })] }));
}
