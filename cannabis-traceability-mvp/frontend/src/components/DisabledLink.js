import { jsx as _jsx } from "react/jsx-runtime";
export default function DisabledLink({ children }) {
    return (_jsx("span", { className: "text-gray-400 cursor-not-allowed", title: "Coming soon", children: children }));
}
