'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Check,
  Clock, X, ChevronDown, ChevronUp, Repeat, Trash2, CalendarDays,
  Sparkles
} from 'lucide-react';
import { AgendaItem } from '@/types/mail';
import { fetchAgendas, saveAgenda, toggleAgendaApi, deleteAgendaApi } from '@/lib/api';

export const formatLocalDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const CalendarAgendaWidget: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMonthExpanded, setIsMonthExpanded] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [agendas, setAgendas] = useState<AgendaItem[]>([]);
  const [showAddAgenda, setShowAddAgenda] = useState(false);
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaTime, setNewAgendaTime] = useState('09:00');
  const [newAgendaRecurrence, setNewAgendaRecurrence] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('once');

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mail_calendar_agenda');
      if (saved !== null) {
        try {
          setAgendas(JSON.parse(saved));
        } catch { /* ignore */ }
      }
    }
  }, []);

  useEffect(() => {
    const loadCloudAgendas = async () => {
      try {
        const cloudAgendas = await fetchAgendas();
        if (Array.isArray(cloudAgendas)) {
          setAgendas((prev) => {
            const prevStr = JSON.stringify(prev);
            const nextStr = JSON.stringify(cloudAgendas);
            if (prevStr !== nextStr) {
              if (typeof window !== 'undefined') {
                localStorage.setItem('mail_calendar_agenda', nextStr);
              }
              return cloudAgendas;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Failed to sync cloud agendas:', err);
      }
    };

    loadCloudAgendas();
    const interval = setInterval(loadCloudAgendas, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAgenda = (id: string) => {
    const target = agendas.find((a) => a.id === id);
    if (!target) return;
    const nextCompleted = !target.completed;
    setAgendas((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, completed: nextCompleted } : a));
      if (typeof window !== 'undefined') {
        localStorage.setItem('mail_calendar_agenda', JSON.stringify(updated));
      }
      return updated;
    });
    toggleAgendaApi(id, nextCompleted).catch((err) => console.error('Cloud toggle error:', err));
  };

  const handleDeleteAgenda = (id: string) => {
    setAgendas((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mail_calendar_agenda', JSON.stringify(updated));
      }
      return updated;
    });
    deleteAgendaApi(id).catch((err) => console.error('Cloud delete error:', err));
  };

  const handleCreateAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgendaTitle.trim()) return;

    const dateKey = formatLocalDateKey(selectedDate);
    const item: AgendaItem = {
      id: Date.now().toString(),
      dateStr: dateKey,
      title: newAgendaTitle.trim(),
      time: newAgendaTime,
      recurrence: newAgendaRecurrence,
      completed: false,
    };

    setAgendas((prev) => {
      const updated = [...prev, item];
      if (typeof window !== 'undefined') {
        localStorage.setItem('mail_calendar_agenda', JSON.stringify(updated));
      }
      return updated;
    });

    saveAgenda(item).catch((err) => console.error('Cloud save error:', err));
    setNewAgendaTitle('');
    setShowAddAgenda(false);
  };

  // Month navigation
  const prevPeriod = () => {
    if (isMonthExpanded) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 7);
      setSelectedDate(d);
      setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  };

  const nextPeriod = () => {
    if (isMonthExpanded) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 7);
      setSelectedDate(d);
      setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  };

  const jumpToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Days in month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Current week days
  const currentWeekDays = useMemo(() => {
    const curr = new Date(selectedDate);
    const day = curr.getDay();
    const sunday = new Date(curr);
    sunday.setDate(curr.getDate() - day);

    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const next = new Date(sunday);
      next.setDate(sunday.getDate() + i);
      week.push(next);
    }
    return week;
  }, [selectedDate]);

  // Agendas for selected day
  const selectedDayKey = formatLocalDateKey(selectedDate);
  const selectedDayAgendas = agendas.filter((a) => {
    if (a.dateStr === selectedDayKey) return true;
    if (a.recurrence === 'daily') return true;
    if (a.recurrence === 'weekly') {
      const itemDate = new Date(a.dateStr + 'T00:00:00');
      return itemDate.getDay() === selectedDate.getDay();
    }
    if (a.recurrence === 'monthly') {
      const itemDate = new Date(a.dateStr + 'T00:00:00');
      return itemDate.getDate() === selectedDate.getDate();
    }
    return false;
  });

  const isTodaySelected = selectedDate.toDateString() === new Date().toDateString();

  return (
    <aside className="w-full h-full bg-[var(--card-bg)] border border-black/10 dark:border-white/10 rounded-3xl p-4 shadow-xs flex flex-col min-h-0 overflow-hidden font-sans select-none shrink-0">
      
      {/* 1. TOP CALENDAR HEADER (Month Title + Quick Today + Prev/Next/Add Controls) */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMonthExpanded(!isMonthExpanded)}
            className="flex items-center gap-1 text-sm font-bold text-[var(--text-primary)] hover:text-blue-500 apple-transition cursor-pointer group"
            title={isMonthExpanded ? 'Collapse to Week View' : 'Expand to Full Month'}
          >
            <span suppressHydrationWarning>{currentMonth.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
            {isMonthExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-blue-500 transition-transform" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-blue-500 transition-transform" />
            )}
          </button>

          {!isTodaySelected && (
            <button
              onClick={jumpToToday}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 apple-transition cursor-pointer"
            >
              Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevPeriod}
            className="p-1.5 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] apple-transition cursor-pointer"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <button
            onClick={nextPeriod}
            className="p-1.5 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] apple-transition cursor-pointer"
            title="Next"
          >
            <ChevronRight className="w-4 h-4 stroke-[2]" />
          </button>
          <button
            onClick={() => setShowAddAgenda(!showAddAgenda)}
            className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-xs apple-transition ml-0.5 cursor-pointer"
            title="Add New Reminder / Event"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* 2. DAYS OF WEEK HEADER */}
      <div className="grid grid-cols-7 text-center text-[10px] font-medium text-[var(--text-muted)] pt-2 pb-1.5 shrink-0 tracking-wider">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className={i === 0 ? 'text-rose-500/80 font-medium' : ''}>
            {d}
          </div>
        ))}
      </div>

      {/* 3. CALENDAR INTERACTIVE GRID */}
      <div className="shrink-0 pb-2.5 border-b border-[var(--border-subtle)]">
        {isMonthExpanded ? (
          <div className="grid grid-cols-7 gap-y-1 text-center animate-fade-in">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const thisDate = new Date(year, month, dayNum);
              const isSelected = thisDate.toDateString() === selectedDate.toDateString();
              const isToday = thisDate.toDateString() === new Date().toDateString();
              const dKey = formatLocalDateKey(thisDate);
              const isSunday = thisDate.getDay() === 0;
              const hasAgendas = agendas.some((a) => a.dateStr === dKey || a.recurrence === 'daily');

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDate(thisDate)}
                  className={`h-7 w-7 mx-auto rounded-full text-xs flex flex-col items-center justify-center relative apple-transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-500/30 scale-105'
                      : isToday
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-medium ring-1 ring-blue-500/30'
                      : isSunday
                      ? 'text-rose-500/80 font-normal hover:bg-rose-500/10'
                      : 'text-[var(--text-secondary)] font-normal hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasAgendas && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-blue-500 absolute bottom-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-0.5 text-center py-1">
            {currentWeekDays.map((thisDate, i) => {
              const isSelected = thisDate.toDateString() === selectedDate.toDateString();
              const isToday = thisDate.toDateString() === new Date().toDateString();
              const dKey = formatLocalDateKey(thisDate);
              const isSunday = thisDate.getDay() === 0;
              const hasAgendas = agendas.some((a) => a.dateStr === dKey || a.recurrence === 'daily');

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(thisDate)}
                  className={`h-7 w-7 mx-auto rounded-full text-xs flex flex-col items-center justify-center relative apple-transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-500/30 scale-105'
                      : isToday
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-medium ring-1 ring-blue-500/30'
                      : isSunday
                      ? 'text-rose-500/80 font-normal hover:bg-rose-500/10'
                      : 'text-[var(--text-secondary)] font-normal hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{thisDate.getDate()}</span>
                  {hasAgendas && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-blue-500 absolute bottom-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. ADD AGENDA FORM MODAL/INLINE */}
      {showAddAgenda && (
        <form onSubmit={handleCreateAgenda} className="my-2.5 p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--card-border)] space-y-2.5 animate-toast shrink-0 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
            <span>New Reminder / Event</span>
            <button type="button" onClick={() => setShowAddAgenda(false)} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="text"
            placeholder="What's happening?"
            value={newAgendaTitle}
            onChange={(e) => setNewAgendaTitle(e.target.value)}
            autoFocus
            className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-normal"
          />
          <div className="flex items-center justify-between gap-2">
            <input
              type="time"
              value={newAgendaTime}
              onChange={(e) => setNewAgendaTime(e.target.value)}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-2.5 py-1 text-xs text-[var(--text-primary)] font-normal"
            />
            <button
              type="submit"
              className="px-3.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-xs apple-transition cursor-pointer"
            >
              Save
            </button>
          </div>
          <div className="flex items-center justify-between gap-1 bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--card-border)]">
            {(['once', 'daily', 'weekly', 'monthly'] as const).map((rec) => (
              <button
                key={rec}
                type="button"
                onClick={() => setNewAgendaRecurrence(rec)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-medium capitalize apple-transition cursor-pointer ${
                  newAgendaRecurrence === rec
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {rec}
              </button>
            ))}
          </div>
        </form>
      )}

      {/* 5. AGENDA STREAM & TASK LIST */}
      <div className="mt-3 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between pb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
            <span suppressHydrationWarning className="text-xs font-semibold text-[var(--text-primary)] tracking-normal">
              {isTodaySelected ? 'Today, ' : ''}{selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            {selectedDayAgendas.length} {selectedDayAgendas.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 pt-1">
          {selectedDayAgendas.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-muted)] flex items-center justify-center mb-2">
                <CalendarIcon className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-xs font-medium text-[var(--text-primary)]">No events scheduled</p>
              <p className="text-[11px] text-[var(--text-muted)] font-normal mt-0.5">Tap + to add a reminder</p>
            </div>
          ) : (
            selectedDayAgendas.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--card-border)]/40 border border-black/5 dark:border-white/5 apple-transition group shadow-2xs"
              >
                <button
                  onClick={() => handleToggleAgenda(item.id)}
                  className="flex items-center gap-2.5 min-w-0 text-left flex-1 cursor-pointer"
                >
                  {/* Custom Checkbox */}
                  <div className={`w-4 h-4 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                    item.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                      : 'border-[var(--card-border)] bg-[var(--card-bg)] group-hover:border-blue-500/50'
                  }`}>
                    {item.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className={`text-xs font-normal block truncate leading-tight ${
                      item.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                    }`}>
                      {item.title}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] mt-0.5">
                      {item.time && (
                        <span className="flex items-center gap-1 font-normal">
                          <Clock className="w-3 h-3 text-blue-500/80" />
                          {item.time}
                        </span>
                      )}
                      {item.recurrence && item.recurrence !== 'once' && (
                        <span className="flex items-center gap-0.5 capitalize text-blue-600 dark:text-blue-400 font-medium">
                          <Repeat className="w-3 h-3" />
                          {item.recurrence}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleDeleteAgenda(item.id)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 text-[var(--text-muted)] apple-transition shrink-0 cursor-pointer"
                  title="Delete event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

