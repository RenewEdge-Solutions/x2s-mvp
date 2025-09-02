import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import { useModule } from '../context/ModuleContext';
import { Calendar as CalendarIcon, Plus, X, RefreshCw, Edit, Trash2, ChevronDown, Loader2 } from 'lucide-react';
import { computeEventsForCannabis, eventColor } from '../lib/calendar';
import { mockOperators } from '../lib/mockOperators';
import { api } from '../lib/api';

export default function Calendar() {
  const { activeModule } = useModule();
  const [searchParams, setSearchParams] = useSearchParams();
  const [plants, setPlants] = useState<any[]>([]);
  const [harvests, setHarvests] = useState<any[]>([]);
  const [cursor, setCursor] = useState(new Date());
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customEvents, setCustomEvents] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [wheelHour, setWheelHour] = useState(9);
  const [wheelMinute, setWheelMinute] = useState(0);
  const [wheelPeriod, setWheelPeriod] = useState<'AM' | 'PM'>('AM');
  const [operators, setOperators] = useState<string[]>([]);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    operator: ''
  });

  // Load minimal data for event computation plus regulator events
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (activeModule !== 'cannabis') {
        setPlants([]);
        setHarvests([]);
        setCustomEvents([]);
        setOperators([]);
        return;
      }
      const [pl, hv, ev] = await Promise.all([
        api.getPlants(),
        api.getHarvests(),
        api.getEvents(),
      ]);
      if (cancelled) return;
      setPlants(pl);
      setHarvests(hv);
      // Map API events to customEvents format for clickable details
      setCustomEvents(
        ev.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: new Date(e.startDate),
          label: e.title,
          isCustom: true,
          description: e.location ? `Location: ${e.location}` : undefined,
          operator: e.metadata?.operator || '',
        }))
      );
      // Use shared mock operators list for consistency
      setOperators(mockOperators);
    }
    load();
    return () => { cancelled = true; };
  }, [activeModule]);

  // Handle opening specific event from URL parameter
  useEffect(() => {
    const eventId = searchParams.get('eventId');
    if (eventId && customEvents.length > 0) {
      const event = customEvents.find(e => e.id === parseInt(eventId));
      if (event) {
        handleEventClick(event);
        // Remove the eventId parameter from URL after opening
        setSearchParams(params => {
          const newParams = new URLSearchParams(params);
          newParams.delete('eventId');
          return newParams;
        });
      }
    }
  }, [customEvents, searchParams, setSearchParams]);

  // Removed database-backed loadEvents for regulator view

  // Close time picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTimePicker) {
        const target = event.target as HTMLElement;
        if (!target.closest('.time-picker-container')) {
          setShowTimePicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTimePicker]);

  // Combine system-computed cultivation events with regulator scheduled items
  const events = useMemo(() => {
    // Exclude farmer-facing cultivation events from regulator calendar
    const computed = computeEventsForCannabis(plants, harvests).filter((e: any) => !['harvest', 'transplant', 'drying-check'].includes(String(e?.type)));
    return [
      ...computed,
      ...customEvents,
    ] as any[];
  }, [cursor, plants, harvests, customEvents]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.operator) return; // require assignment
    // Mock add: push into local customEvents only
    const newId = Math.max(0, ...customEvents.map((c: any) => Number(c.id) || 0)) + 1;
    const dateVal = eventForm.date ? new Date(eventForm.date) : new Date();
    const newEv = {
      id: newId,
      title: eventForm.title,
      date: dateVal,
      label: eventForm.title,
      isCustom: true,
      description: eventForm.description,
      operator: eventForm.operator,
    };
    setCustomEvents((prev) => [...prev, newEv]);
    resetModal();
  };

  const handleFormChange = (field: string, value: string) => {
    setEventForm({ ...eventForm, [field]: value });
  };

  const handleSyncCalendar = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    
    try {
      // Mockup sync process - simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful sync
      setSyncStatus('Calendar successfully synced to your devices!');
      
      // Clear status after 3 seconds
      setTimeout(() => setSyncStatus(null), 3000);
      
    } catch (error) {
      setSyncStatus('Sync failed. Please try again.');
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const resetModal = () => {
    setShowAddEventModal(false);
    setShowEventDetailModal(false);
    setShowTimePicker(false);
    setIsEditing(false);
    setSelectedEvent(null);
    setShowDeleteConfirm(false);
    setEventForm({
      title: '',
      date: '',
      time: '',
  description: '',
  operator: ''
    });
  };

  const handleEventClick = (event: any) => {
    // Check if it's a custom event (either has isCustom flag or has an id property)
    if ((event.isCustom && event.id) || (event.id && !event.isCustom)) {
      setSelectedEvent(event);
      setEventForm({
        title: event.title,
        date: event.date instanceof Date ? event.date.toISOString().split('T')[0] : event.date,
        time: event.time || '',
  description: event.description || '',
  operator: event.operator || ''
      });
      setShowEventDetailModal(true);
    }
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock edit: update local list
    if (!selectedEvent) return;
  setCustomEvents((prev) => prev.map((ev) => (ev.id === selectedEvent.id ? { ...ev, title: eventForm.title, description: eventForm.description, date: new Date(eventForm.date), operator: eventForm.operator } : ev)));
    setIsEditing(false);
    resetModal();
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    // Mock delete
    setCustomEvents((prev) => prev.filter((ev) => ev.id !== selectedEvent.id));
    resetModal();
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeString: string) => {
    if (!timeString) return { hour: 9, minute: 0 }; // Default to 9:00 AM
    const [hour, minute] = timeString.split(':').map(Number);
    return { hour: hour || 9, minute: minute || 0 };
  };

  const handleTimeSelect = (hour: number, minute: number) => {
    const timeString = formatTime(hour, minute);
    setEventForm({ ...eventForm, time: timeString });
    setShowTimePicker(false);
  };

  const generateTimeOptions = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i);
    const minutes = [0, 15, 30, 45]; // 15-minute steps
    return { hours, minutes };
  };

  const formatTimeDisplay = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const handleWheelScroll = (event: React.WheelEvent, type: 'hour' | 'minute' | 'period') => {
    // Removed wheel scroll functionality
  };

  const applyTimeSelection = () => {
    // Convert wheel values to 24-hour format
    let hour24 = wheelHour;
    if (wheelPeriod === 'PM' && wheelHour !== 12) {
      hour24 = wheelHour + 12;
    } else if (wheelPeriod === 'AM' && wheelHour === 12) {
      hour24 = 0;
    }
    
    const timeString = formatTime(hour24, wheelMinute);
    setEventForm({ ...eventForm, time: timeString });
    setShowTimePicker(false);
  };

  // Initialize wheel values when picker opens
  const openTimePicker = () => {
    if (eventForm.time) {
      const parsed = parseTime(eventForm.time);
      const displayHour = parsed.hour === 0 ? 12 : parsed.hour > 12 ? parsed.hour - 12 : parsed.hour;
      const period = parsed.hour >= 12 ? 'PM' : 'AM';
      // Round minute to nearest 15-minute step
      const minuteSteps = [0, 15, 30, 45];
      const roundedMinute = minuteSteps.reduce((prev, curr) => 
        Math.abs(curr - parsed.minute) < Math.abs(prev - parsed.minute) ? curr : prev
      );
      setWheelHour(displayHour);
      setWheelMinute(roundedMinute);
      setWheelPeriod(period);
    } else {
      setWheelHour(9);
      setWheelMinute(0);
      setWheelPeriod('AM');
    }
    setShowTimePicker(true);
  };

  const { hours, minutes } = generateTimeOptions();
  const currentTime = parseTime(eventForm.time);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2">
          <CalendarIcon className="h-6 w-6" aria-hidden /> Calendar
        </h1>
    <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={handleSyncCalendar}
              disabled={isSyncing}
      className="inline-flex items-center gap-1 px-2 py-1 border rounded-md text-sm text-gray-800 hover:bg-gray-50 disabled:opacity-60"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden />
              )}
              {isSyncing ? 'Syncing…' : 'Sync'}
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => setAddOpen((o) => !o)}
      className="inline-flex items-center gap-1 px-2 py-1 border rounded-md text-sm text-gray-800 hover:bg-gray-50"
              aria-haspopup="menu"
              aria-expanded={addOpen}
            >
              <Plus className="h-4 w-4" aria-hidden /> New <ChevronDown className={`h-4 w-4 transition-transform ${addOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {addOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-50">
                {[
                  { label: 'Routine inspection', hint: 'Scheduled facility/site inspection' },
                  { label: 'For-cause inspection', hint: 'Triggered by complaint or anomaly' },
                  { label: 'Desk audit', hint: 'Remote review of records and controls' },
                  { label: 'Compliance audit', hint: 'On-site process and records audit' },
                  { label: 'Sampling event', hint: 'Random or targeted sample collection' },
                  { label: 'COA due', hint: 'Certificate of analysis deadline' },
                  { label: 'CAPA follow-up', hint: 'Review corrective actions and evidence' },
                  { label: 'Chain-of-custody audit', hint: 'Trace custody records for batches' },
                  { label: 'Enforcement action', hint: 'Notice, sanction, or seizure' },
                  { label: 'Recall follow-up', hint: 'Verify effectiveness post-recall' },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setAddOpen(false);
                      setEventForm({
                        title: opt.label,
                        date: new Date().toISOString().slice(0, 10),
                        time: '',
                        description: opt.hint,
                        operator: '',
                      });
                      setShowAddEventModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-[11px] text-gray-500">{opt.hint}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 border rounded-md text-sm hover:bg-gray-50"
              onClick={() => setCursor(new Date())}
              aria-label="Today"
            >
              Today
            </button>
            <button
              className="px-2 py-1 border rounded-md text-sm hover:bg-gray-50"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              aria-label="Previous month"
            >
              ‹
            </button>
            <div className="text-sm text-gray-700 w-32 text-center">
              {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </div>
            <button
              className="px-2 py-1 border rounded-md text-sm hover:bg-gray-50"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Sync Status Message */}
      {syncStatus && (
        <div className={`p-4 rounded-lg ${syncStatus.includes('successfully') 
          ? 'bg-green-50 border border-green-200 text-green-800' 
          : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {syncStatus.includes('successfully') ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{syncStatus}</span>
          </div>
        </div>
      )}

      {activeModule !== 'cannabis' ? (
        <Card>
          <p className="text-sm text-gray-600">Calendar for {activeModule} is not yet implemented in this MVP.</p>
        </Card>
      ) : (
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
                      className={`min-h-[88px] border rounded-md p-1 ${isToday ? 'border-primary ring-1 ring-primary/20' : 'border-gray-200'} bg-white`}
                    >
                      <div className="text-xs text-gray-500 mb-1">{d ? d.getDate() : ''}</div>
                      <div className="space-y-1">
                        {dayEvents.map((ev, idx) => {
                          const anyEv = ev as any;
                          const isCustomEvent = !!(anyEv && anyEv.isCustom);
                          const eventStyle = isCustomEvent
                            ? 'bg-purple-500 border-2 border-purple-300'
                            : eventColor(ev.type as 'harvest' | 'transplant' | 'drying-check');

                          return (
                            <div
                              key={idx}
                              onClick={() => handleEventClick(ev)}
                              className={`group relative text-[11px] text-white px-1 py-0.5 rounded ${eventStyle} ${isCustomEvent ? 'cursor-pointer hover:bg-purple-600' : ''}`}
                            >
                              <span className="truncate block">{ev.label}</span>
                <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-gray-900 text-white text-[11px] px-2 py-1 rounded shadow-lg z-10 max-w-[200px]">
                                {ev.label}
                                {anyEv?.description ? (
                  <div className="text-gray-300 mt-1">{String(anyEv.description)}</div>
                                ) : null}
                                {isCustomEvent ? (
                  <div className="text-emerald-300 mt-1 text-[10px]">Click to view/edit</div>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </Card>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Event</h2>
              <button
                onClick={resetModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="text-xs text-gray-500">These events are local to this browser in the MVP.</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Team Meeting, Harvest Check, Compliance Review"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <div className="relative time-picker-container">
                    <button
                      type="button"
                      onClick={openTimePicker}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-left bg-white hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className={eventForm.time ? 'text-gray-900' : 'text-gray-500'}>
                        {eventForm.time ? formatTimeDisplay(parseTime(eventForm.time).hour, parseTime(eventForm.time).minute) : 'Select time'}
                      </span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    
                    {showTimePicker && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-50 p-4 w-80 min-w-[320px]">
                        <div className="grid grid-cols-3 gap-4">
                          {/* Hours Dropdown */}
                          <div className="flex flex-col items-center">
                            <label className="text-xs font-medium text-gray-700 mb-1">Hour</label>
                            <select
                              value={wheelHour}
                              onChange={(e) => setWheelHour(Number(e.target.value))}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-center text-sm font-medium bg-white text-gray-800 appearance-none cursor-pointer"
                              style={{
                                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                                backgroundSize: '14px'
                              }}
                            >
                              {hours.map((hour) => (
                                <option key={hour} value={hour} className="text-gray-800 bg-white">
                                  {hour}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Minutes Dropdown */}
                          <div className="flex flex-col items-center">
                            <label className="text-xs font-medium text-gray-700 mb-1">Minute</label>
                            <select
                              value={wheelMinute}
                              onChange={(e) => setWheelMinute(Number(e.target.value))}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-center text-sm font-medium bg-white text-gray-800 appearance-none cursor-pointer"
                              style={{
                                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                                backgroundSize: '14px'
                              }}
                            >
                              {minutes.map((minute) => (
                                <option key={minute} value={minute} className="text-gray-800 bg-white">
                                  {minute.toString().padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Period Dropdown */}
                          <div className="flex flex-col items-center">
                            <label className="text-xs font-medium text-gray-700 mb-1">Period</label>
                            <select
                              value={wheelPeriod}
                              onChange={(e) => setWheelPeriod(e.target.value as 'AM' | 'PM')}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-center text-sm font-medium bg-white text-gray-800 appearance-none cursor-pointer"
                              style={{
                                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                                backgroundSize: '14px'
                              }}
                            >
                              <option value="AM" className="text-gray-800 bg-white">AM</option>
                              <option value="PM" className="text-gray-800 bg-white">PM</option>
                            </select>
                          </div>
                        </div>
                        
                        {/* Preview Display */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                          <span className="text-sm font-medium text-gray-800">
                            Selected Time: {wheelHour}:{wheelMinute.toString().padStart(2, '0')} {wheelPeriod}
                          </span>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setShowTimePicker(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={applyTimeSelection}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Operator *
                </label>
                <select
                  required
                  value={eventForm.operator}
                  onChange={(e) => handleFormChange('operator', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="" disabled>Select operator…</option>
                  {operators.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Additional details about the event..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetModal}
                  className="flex-1 px-4 py-2 text-gray-800 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Event' : 'Event Details'}
              </h2>
              <button
                onClick={resetModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {showDeleteConfirm ? (
              <div className="text-center py-4">
                <div className="mb-4">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Event</h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "{selectedEvent.title}"? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteEvent}
                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : isEditing ? (
              <form onSubmit={handleEditEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <div className="relative time-picker-container">
                      <button
                        type="button"
                        onClick={openTimePicker}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-left bg-white hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span className={eventForm.time ? 'text-gray-900' : 'text-gray-500'}>
                          {eventForm.time ? formatTimeDisplay(parseTime(eventForm.time).hour, parseTime(eventForm.time).minute) : 'Select time'}
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      
                      {showTimePicker && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-50 p-4 w-80 min-w-[320px]">
                          <div className="grid grid-cols-3 gap-4">
                            {/* Hours Dropdown */}
                            <div className="flex flex-col items-center">
                              <label className="text-xs font-medium text-gray-700 mb-1">Hour</label>
                              <select
                                value={wheelHour}
                                onChange={(e) => setWheelHour(Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-center text-sm font-medium bg-white text-gray-800 appearance-none cursor-pointer"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'right 8px center',
                                  backgroundSize: '14px'
                                }}
                              >
                                {generateTimeOptions().hours.map((hour) => (
                                  <option key={hour} value={hour} className="text-gray-800 bg-white">
                                    {hour}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Minutes Dropdown */}
                            <div className="flex flex-col items-center">
                              <label className="text-xs font-medium text-gray-700 mb-1">Minute</label>
                              <select
                                value={wheelMinute}
                                onChange={(e) => setWheelMinute(Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-center text-sm font-medium bg-white text-gray-800 appearance-none cursor-pointer"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'right 8px center',
                                  backgroundSize: '14px'
                                }}
                              >
                                {generateTimeOptions().minutes.map((minute) => (
                                  <option key={minute} value={minute} className="text-gray-800 bg-white">
                                    {minute.toString().padStart(2, '0')}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Period Dropdown */}
                            <div className="flex flex-col items-center">
                              <label className="text-xs font-medium text-gray-700 mb-1">Period</label>
                              <select
                                value={wheelPeriod}
                                onChange={(e) => setWheelPeriod(e.target.value as 'AM' | 'PM')}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-center text-sm font-medium bg-white text-gray-800 appearance-none cursor-pointer"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'right 8px center',
                                  backgroundSize: '14px'
                                }}
                              >
                                <option value="AM" className="text-gray-800 bg-white">AM</option>
                                <option value="PM" className="text-gray-800 bg-white">PM</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Preview Display */}
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                            <span className="text-sm font-medium text-gray-800">
                              Selected Time: {wheelHour}:{wheelMinute.toString().padStart(2, '0')} {wheelPeriod}
                            </span>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => setShowTimePicker(false)}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={applyTimeSelection}
                              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to Operator *
                  </label>
                  <select
                    required
                    value={eventForm.operator}
                    onChange={(e) => handleFormChange('operator', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="" disabled>Select operator…</option>
                    {operators.map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 text-gray-800 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedEvent.title}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
                    {selectedEvent.time && (
                      <p><strong>Time:</strong> {formatTimeDisplay(parseTime(selectedEvent.time).hour, parseTime(selectedEvent.time).minute)}</p>
                    )}
                    {selectedEvent.description && (
                      <div>
                        <strong>Description:</strong>
                        <p className="mt-1 text-gray-700">{selectedEvent.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
