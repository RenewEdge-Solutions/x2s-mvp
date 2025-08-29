import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Login() {
    const { login, verify2FA, is2FARequired } = useAuth();
    const [username, setUsername] = useState('Daniel.Veselski');
    const [password, setPassword] = useState('pass123');
    const [code, setCode] = useState('');
    const navigate = useNavigate();
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!is2FARequired)
            await login(username, password);
    };
    const onVerify = async (e) => {
        e.preventDefault();
        await verify2FA(code);
        navigate('/dashboard');
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "w-full max-w-md bg-white p-6 rounded-xl border border-gray-200 shadow", children: [_jsx("h1", { className: "text-xl font-semibold text-gray-900 mb-4", children: "Sign in" }), !is2FARequired ? (_jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-600", children: "Username" }), _jsx("input", { value: username, onChange: (e) => setUsername(e.target.value), className: "mt-1 w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-600", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1 w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary" })] }), _jsx("button", { className: "w-full bg-primary text-white rounded-md py-2 font-medium", children: "Continue" })] })) : (_jsxs("form", { onSubmit: onVerify, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-600", children: "2FA Code" }), _jsx("input", { value: code, onChange: (e) => setCode(e.target.value), placeholder: "123456", className: "mt-1 w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary" })] }), _jsx("button", { className: "w-full bg-primary text-white rounded-md py-2 font-medium", children: "Verify" })] })), _jsx("p", { className: "text-xs text-gray-500 mt-4", children: "Use Daniel.Veselski / pass123. 2FA accepts any 6 digits." })] }) }));
}
