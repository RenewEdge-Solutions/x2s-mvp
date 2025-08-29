const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
export const api = {
    async login(username, password) {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok)
            throw new Error('Login failed');
        return res.json();
    },
    async verify2FA(code) {
        const res = await fetch(`${API}/auth/verify-2fa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });
        if (!res.ok)
            throw new Error('2FA failed');
        return res.json();
    },
    getPlants() {
        return fetch(`${API}/plants`).then((r) => r.json());
    },
    createPlant(data) {
        return fetch(`${API}/plants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then((r) => r.json());
    },
    getHarvests() {
        return fetch(`${API}/harvests`).then((r) => r.json());
    },
    createHarvest(data) {
        return fetch(`${API}/harvests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then((r) => r.json());
    },
    getLifecycle() {
        return fetch(`${API}/lifecycle`).then((r) => r.json());
    },
    getIntegrity() {
        return fetch(`${API}/integrity`).then((r) => r.json());
    },
    // Reports
    getReportTypes() {
        return fetch(`${API}/reports/types`).then((r) => r.json());
    },
    listReports() {
        return fetch(`${API}/reports`).then((r) => r.json());
    },
    createReport(type) {
        return fetch(`${API}/reports/${type}`, { method: 'POST' }).then((r) => r.json());
    },
    downloadReportUrl(id) {
        return `${API}/reports/download/${id}`;
    },
    autoReportUrl(type) {
        return `${API}/reports/auto/${type}`;
    },
    // Locations (Geos/Facilities/Structures)
    getGeos() {
        return fetch(`${API}/locations/geos`).then((r) => r.json());
    },
    createGeo(data) {
        return fetch(`${API}/locations/geos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then((r) => r.json());
    },
    deleteGeo(id) {
        return fetch(`${API}/locations/geos/${id}`, { method: 'DELETE' });
    },
    getFacilities(geoId) {
        return fetch(`${API}/locations/facilities/${geoId}`).then((r) => r.json());
    },
    createFacility(data) {
        return fetch(`${API}/locations/facilities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then((r) => r.json());
    },
    getStructures(facilityId) {
        return fetch(`${API}/locations/structures/${facilityId}`).then((r) => r.json());
    },
    createStructure(data) {
        return fetch(`${API}/locations/structures`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then((r) => r.json());
    },
    resetLocations() {
        return fetch(`${API}/locations/reset`, { method: 'POST' });
    },
};
