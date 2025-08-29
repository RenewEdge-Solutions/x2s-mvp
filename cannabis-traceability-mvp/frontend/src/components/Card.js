import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function Card({ children, className = '', title, subtitle }) {
    return (_jsxs("div", { className: `bg-white rounded-xl border border-gray-200 shadow-sm p-4 ${className}`, children: [(title || subtitle) && (_jsxs("div", { className: "mb-3", children: [title && _jsx("h3", { className: "text-sm font-semibold text-gray-900", children: title }), subtitle && _jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: subtitle })] })), children] }));
}
