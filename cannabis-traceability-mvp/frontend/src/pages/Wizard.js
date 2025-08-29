import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModule } from '../context/ModuleContext';
import { api } from '../lib/api';
import WizardSteps from '../components/WizardSteps';
import Card from '../components/Card';
export default function Wizard() {
    const { user } = useAuth();
    const { activeModule } = useModule();
    const [step, setStep] = useState(1);
    const [strain, setStrain] = useState('OG Kush');
    const [location, setLocation] = useState('Greenhouse A');
    const [plantHash, setPlantHash] = useState(null);
    const [plants, setPlants] = useState([]);
    const [plantId, setPlantId] = useState('');
    const [yieldGrams, setYieldGrams] = useState(100);
    const [status, setStatus] = useState('drying');
    const [harvestHash, setHarvestHash] = useState(null);
    const { search } = useLocation();
    const stepFromQuery = useMemo(() => new URLSearchParams(search).get('step'), [search]);
    useEffect(() => {
        if (stepFromQuery === '2')
            setStep(2);
        if (stepFromQuery === '1')
            setStep(1);
    }, [stepFromQuery]);
    useEffect(() => {
        api.getPlants().then((ps) => setPlants(ps));
    }, [step]);
    const submitPlant = async (e) => {
        e.preventDefault();
        const res = await api.createPlant({ strain, location, by: user?.username });
        setPlantHash(res.hash);
        setStep(2);
    };
    const submitHarvest = async (e) => {
        e.preventDefault();
        const res = await api.createHarvest({ plantId, yieldGrams, status, by: user?.username });
        setHarvestHash(res.hash);
    };
    if (activeModule !== 'cannabis') {
        return _jsx("div", { className: "text-sm text-gray-600", children: "Switch to the Cannabis module to access actions." });
    }
    if (user?.role !== 'Operator') {
        return _jsx("div", { className: "text-sm text-gray-600", children: "Only Operators can perform these actions." });
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(WizardSteps, { step: step }), _jsx(Card, { children: step === 1 ? (_jsxs("form", { onSubmit: submitPlant, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-600", children: "Strain" }), _jsx("input", { value: strain, onChange: (e) => setStrain(e.target.value), className: "mt-1 w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-600", children: "Location" }), _jsx("input", { value: location, onChange: (e) => setLocation(e.target.value), className: "mt-1 w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary" })] }), _jsx("button", { className: "bg-primary text-white rounded-md px-4 py-2", children: "Plant Seed" }), plantHash && (_jsxs("p", { className: "text-sm text-gray-600", children: ["Server Hash: ", _jsx("span", { className: "font-mono", children: plantHash })] }))] })) : (_jsxs("form", { onSubmit: submitHarvest, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-600", children: "Plant" }), _jsxs("select", { value: plantId, onChange: (e) => setPlantId(e.target.value), className: "mt-1 w-full border-gray-300 rounded-md", children: [_jsx("option", { value: "", children: "Select plant" }), plants.map((p) => (_jsxs("option", { value: p.id, children: [p.strain, " \u2014 ", p.location] }, p.id)))] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-600", children: "Yield (g)" }), _jsx("input", { type: "number", value: yieldGrams, onChange: (e) => setYieldGrams(Number(e.target.value)), className: "mt-1 w-full border-gray-300 rounded-md" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-600", children: "Status" }), _jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "mt-1 w-full border-gray-300 rounded-md", children: [_jsx("option", { value: "drying", children: "drying" }), _jsx("option", { value: "dried", children: "dried" })] })] })] }), _jsx("button", { className: "bg-primary text-white rounded-md px-4 py-2", children: "Create Harvest" }), harvestHash && (_jsxs("p", { className: "text-sm text-gray-600", children: ["Server Hash: ", _jsx("span", { className: "font-mono", children: harvestHash })] }))] })) })] }));
}
