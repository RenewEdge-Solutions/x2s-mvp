import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import NavBar from './components/NavBar';
export default function App({ children }) {
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsx(NavBar, {}), _jsx("main", { className: "max-w-6xl mx-auto px-4 py-6", children: children })] }));
}
