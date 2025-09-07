export type ScheduledEvent = {
  date: Date;
  label: string;
  type:
    | 'harvest'
    | 'transplant'
    | 'drying-check'
    | 'audit'
    | 'inspection'
    | 'compliance-review'
    | 'license-renewal'
    | 'report-deadline'
    | 'follow-up'
    | 'cap-deadline'
    | 'custom';
  href?: string;
  description?: string;
};

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function computeEventsForCannabis(plants: any[], harvests: any[]): ScheduledEvent[] {
  const events: ScheduledEvent[] = [];
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

// Auditor-focused mock events
export function computeEventsForAuditor(reference: Date = new Date()): ScheduledEvent[] {
  const base = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const add = (days: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  };
  return [
    { date: add(1), label: 'On-site Audit – Sunrise Fields', type: 'audit', href: '/users', description: 'Scope: cultivation practices, pesticide logs, inventory reconciliation.' },
    { date: add(3), label: 'Inspection – Green Valley (Surprise)', type: 'inspection', description: 'Verify plant tagging and camera coverage.' },
    { date: add(5), label: 'Compliance Review – Hempstead', type: 'compliance-review', description: 'Training records, waste logs, transport manifests.' },
    { date: add(7), label: 'Report Deadline – Q3 Audit Summary', type: 'report-deadline', description: 'Submit quarterly report to regulator portal.' },
    { date: add(9), label: 'Follow-up – Sunrise CAP Verification', type: 'follow-up', description: 'Verify corrective actions on storage access controls.' },
    { date: add(12), label: 'License Renewal – Riverbend', type: 'license-renewal', description: 'Renew cultivation license; check fees and docs.' },
    { date: add(14), label: 'CAP Deadline – Riverbend', type: 'cap-deadline', description: 'CAP items due (integration & CCTV uptime).'},
    { date: add(17), label: 'Inspection – Processing Facility', type: 'inspection', description: 'Sanitation and batch traceability spot check.' },
    { date: add(21), label: 'Compliance Review – Green Valley', type: 'compliance-review', description: 'Disposal manifests and transport chain-of-custody.' },
    { date: add(25), label: 'On-site Audit – Riverbend', type: 'audit', description: 'Full audit with sampling and variance analysis.' },
    { date: add(28), label: 'Report Deadline – Enforcement Actions', type: 'report-deadline', description: 'Submit enforcement and CAP status.' }
  ];
}

export function groupEventsByDate(events: ScheduledEvent[]) {
  const byDate: Record<string, ScheduledEvent[]> = {};
  for (const ev of events) {
    const key = ev.date.toISOString().slice(0, 10);
    (byDate[key] ??= []).push(ev);
  }
  return byDate;
}

export function nextNDays(events: ScheduledEvent[], n: number) {
  const now = new Date();
  const end = addDays(now, n - 1);
  const byDate = groupEventsByDate(events);
  const out: Array<{ date: Date; items: ScheduledEvent[] }> = [];
  for (let d = new Date(now.getFullYear(), now.getMonth(), now.getDate()); d <= end; d = addDays(d, 1)) {
    const key = d.toISOString().slice(0, 10);
    out.push({ date: new Date(d), items: byDate[key] ?? [] });
  }
  return out;
}

export const eventColor = (type: ScheduledEvent['type']) => {
  switch (type) {
    case 'harvest':
      return 'bg-emerald-600';
    case 'transplant':
      return 'bg-blue-500';
    case 'drying-check':
      return 'bg-amber-500';
    case 'audit':
      return 'bg-indigo-600';
    case 'inspection':
      return 'bg-blue-600';
    case 'compliance-review':
      return 'bg-green-600';
    case 'license-renewal':
      return 'bg-yellow-600';
    case 'report-deadline':
      return 'bg-rose-600';
    case 'follow-up':
      return 'bg-violet-600';
    case 'cap-deadline':
      return 'bg-red-600';
    case 'custom':
      return 'bg-purple-600';
    default:
      return 'bg-gray-500';
  }
};
