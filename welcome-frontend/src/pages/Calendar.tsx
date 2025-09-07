import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import { Calendar as CalendarIcon, Plus, RefreshCw, X } from 'lucide-react';
import { computeEventsForAuditor, eventColor, type ScheduledEvent } from '../lib/calendar';

export default function Calendar() {
  const [cursor, setCursor] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [additionalEvents, setAdditionalEvents] = useState<ScheduledEvent[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Event form state (mock)
  const [newLabel, setNewLabel] = useState('');
  const [newDate, setNewDate] = useState(() => formatDateInput(new Date()));
  const [newType, setNewType] = useState<ScheduledEvent['type']>('custom');

  // Compute calendar weeks for current cursor month
  const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startDay = firstOfMonth.getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const weeks: Array<Array<Date | null>> = [];
  let week: Array<Date | null> = new Array(startDay).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push([...week, ...new Array(7 - week.length).fill(null)]);

  const todayKey = new Date().toISOString().slice(0, 10);

  // Hard-coded, auditor-focused events relative to the visible month
  const baseEvents = useMemo(() => {
    const ref = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    return computeEventsForAuditor(ref);
  }, [cursor]);

  // Merge base events with locally added (mock) events
  const events = useMemo(() => {
    return [...baseEvents, ...additionalEvents];
  }, [baseEvents, additionalEvents]);

  function formatDateInput(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  }

  function handleSaveEvent() {
    const d = new Date(newDate);
    if (isNaN(d.getTime()) || !newLabel.trim()) {
      showToast('error', 'Please provide a valid date and label.');
      return;
    }
    const ev: ScheduledEvent = { date: d, label: newLabel.trim(), type: newType };
    setAdditionalEvents((arr) => [...arr, ev]);
    setShowAddModal(false);
    setNewLabel('');
    setNewDate(formatDateInput(new Date()));
    setNewType('custom');
    showToast('success', 'Mock: Event added locally (not saved).');
  }

  function handleSync() {
    if (syncing) return;
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      showToast('success', 'Mock: Synced calendar with 2 devices.');
    }, 1500);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2">
          <CalendarIcon className="h-6 w-6" aria-hidden /> Auditor Calendar
        </h1>
        <div className="flex items-center gap-4">
          {/* Add Event (mock) */}
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" /> Add Event
          </button>
          {/* Sync (mock) */}
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors inline-flex items-center gap-2"
            onClick={handleSync}
            disabled={syncing}
            aria-busy={syncing}
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} /> {syncing ? 'Syncing…' : 'Sync'}
          </button>
          <button
            className="px-2 py-1 border rounded-md text-sm"
            onClick={() => setCursor(new Date())}
            aria-label="Today"
          >
            Today
          </button>
          <button
            className="px-2 py-1 border rounded-md text-sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            aria-label="Previous month"
          >
            ‹
          </button>
          <div className="text-sm text-gray-700 w-32 text-center">
            {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <button
            className="px-2 py-1 border rounded-md text-sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`rounded-md p-3 text-sm ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {toast.message}
        </div>
      )}

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 text-xs text-gray-700">
        {[
          { label: 'Audit', cls: 'bg-indigo-600' },
          { label: 'Inspection', cls: 'bg-blue-600' },
          { label: 'Compliance Review', cls: 'bg-green-600' },
          { label: 'License Renewal', cls: 'bg-yellow-600' },
          { label: 'Report Deadline', cls: 'bg-rose-600' },
          { label: 'CAP Deadline', cls: 'bg-red-600' },
          { label: 'Custom', cls: 'bg-purple-600' },
        ].map((i) => (
          <div key={i.label} className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded ${i.cls}`} />
            <span>{i.label}</span>
          </div>
        ))}
      </div>

      <Card>
        <div className="grid grid-cols-7 text-xs text-gray-500 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="px-2 py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeks.map((w, i) => (
            <React.Fragment key={i}>
              {w.map((d, j) => {
                const key = d ? d.toISOString().slice(0, 10) : `${i}-${j}-empty`;
                const dayEvents = d
                  ? events.filter((e) => {
                      if (!e || !e.date) return false;
                      const eventDate = e.date instanceof Date ? e.date : new Date(e.date);
                      if (isNaN(eventDate.getTime())) return false;
                      return eventDate.toISOString().slice(0, 10) === key;
                    })
                  : [];
                const isToday = d && key === todayKey;
                return (
                  <div
                    key={key}
                    className={`min-h-[88px] border rounded-md p-1 ${isToday ? 'border-primary' : 'border-gray-200'} bg-white`}
                  >
                    <div className="text-xs text-gray-500 mb-1">{d ? d.getDate() : ''}</div>
                    <div className="space-y-1">
                      {dayEvents.map((ev, idx) => (
                        <div
                          key={idx}
                          className={`text-[11px] text-white px-1 py-0.5 rounded ${eventColor(ev.type)}`}
                        >
                          <span className="truncate block">{ev.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Add Event Modal (mock) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Add Event (Mock)</h2>
              <button className="p-1 rounded hover:bg-gray-100" onClick={() => setShowAddModal(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  className="w-full border rounded-md px-2 py-1 text-sm"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g., Site Inspection – West Farm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full border rounded-md px-2 py-1 text-sm"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Type</label>
                  <select
                    className="w-full border rounded-md px-2 py-1 text-sm"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ScheduledEvent['type'])}
                  >
                    <option value="audit">Audit</option>
                    <option value="inspection">Inspection</option>
                    <option value="compliance-review">Compliance Review</option>
                    <option value="license-renewal">License Renewal</option>
                    <option value="report-deadline">Report Deadline</option>
                    <option value="cap-deadline">CAP Deadline</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="px-3 py-1.5 rounded-md text-sm border" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="px-3 py-1.5 rounded-md text-sm bg-primary text-white hover:bg-emerald-600" onClick={handleSaveEvent}>Save</button>
            </div>
            <p className="mt-3 text-xs text-gray-500">Note: This is a mock. Events are stored only in local state.</p>
          </div>
        </div>
      )}
    </div>
  );
}
