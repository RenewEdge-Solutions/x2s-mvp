import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { computeEventsForAuditor, eventColor } from '../lib/calendar';

export default function Calendar() {
  const [cursor, setCursor] = useState(new Date());

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
  const events = useMemo(() => {
    const ref = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    return computeEventsForAuditor(ref);
  }, [cursor]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2">
          <CalendarIcon className="h-6 w-6" aria-hidden /> Auditor Calendar
        </h1>
        <div className="flex items-center gap-2">
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
    </div>
  );
}
