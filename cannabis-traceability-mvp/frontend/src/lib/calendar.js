function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
export function computeEventsForCannabis(plants, harvests) {
    const events = [];
    plants.forEach((p) => {
        const plantedAt = new Date(p.plantedAt);
        if (!p.harvested) {
            // Expected harvest ~60 days after planted
            events.push({
                date: addDays(plantedAt, 60),
                label: `Harvest ${p.strain} at ${p.location}`,
                type: 'harvest',
                href: '/wizard?step=2',
            });
            // Transplant ~14 days after planted
            events.push({
                date: addDays(plantedAt, 14),
                label: `Transplant ${p.strain} (${p.location})`,
                type: 'transplant',
            });
        }
    });
    harvests.forEach((h) => {
        if (h.status === 'drying' && h.harvestedAt) {
            events.push({
                date: addDays(new Date(h.harvestedAt), 5),
                label: `Check drying lot ${h.id}`,
                type: 'drying-check',
                href: '/inventory',
            });
        }
    });
    return events;
}
export function groupEventsByDate(events) {
    const byDate = {};
    for (const ev of events) {
        const key = ev.date.toISOString().slice(0, 10);
        (byDate[key] ?? (byDate[key] = [])).push(ev);
    }
    return byDate;
}
export function nextNDays(events, n) {
    const now = new Date();
    const end = addDays(now, n - 1);
    const byDate = groupEventsByDate(events);
    const out = [];
    for (let d = new Date(now.getFullYear(), now.getMonth(), now.getDate()); d <= end; d = addDays(d, 1)) {
        const key = d.toISOString().slice(0, 10);
        out.push({ date: new Date(d), items: byDate[key] ?? [] });
    }
    return out;
}
export const eventColor = (type) => type === 'harvest' ? 'bg-emerald-600' : type === 'transplant' ? 'bg-blue-500' : 'bg-amber-500';
