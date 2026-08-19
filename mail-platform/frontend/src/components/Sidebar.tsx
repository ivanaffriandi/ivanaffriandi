'use client';

import React, { useState, useEffect } from 'react';
import {
  Inbox, Send, FileText, Archive, AlertOctagon, Trash2, Camera,
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Check,
  Clock, X, Feather, ChevronDown, ChevronUp, Repeat, GripVertical, LogOut,
  Newspaper
} from 'lucide-react';
import { Folder, AgendaItem } from '@/types/mail';
import { fetchAgendas, saveAgenda, toggleAgendaApi, deleteAgendaApi } from '@/lib/api';

interface SidebarProps {
  folders: Folder[];
  activeFolderId: string;
  onSelectFolder: (id: string) => void;
  onOpenCompose: (toEmail?: string) => void;
  onOpenSubscriptions?: () => void;
  userEmail: string;
  onSignOut?: () => void;
}

export const formatLocalDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const DEFAULT_AGENDAS: AgendaItem[] = [
  { id: '1', dateStr: '2026-08-03', title: "Ivan's Birthday Celebration", recurrence: 'monthly', completed: true },
  { id: '3', dateStr: formatLocalDateKey(new Date()), title: 'Architecture Review with Sarah', time: '15:00', recurrence: 'weekly', completed: false },
  { id: '4', dateStr: formatLocalDateKey(new Date()), title: 'Verify DKIM 2048-bit signing', time: '17:30', recurrence: 'daily', completed: false },
];

const DEFAULT_FOLDER_ORDER = ['inbox', 'sent', 'drafts', 'archive', 'spam', 'trash'];

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  activeFolderId,
  onSelectFolder,
  onOpenCompose,
  onOpenSubscriptions,
  userEmail,
  onSignOut,
}) => {
  const [salutation, setSalutation] = useState('Good morning,');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Folder ordering
  const [folderOrder, setFolderOrder] = useState<string[]>(DEFAULT_FOLDER_ORDER);
  const [draggedFolderIndex, setDraggedFolderIndex] = useState<number | null>(null);

  // Calendar State
  const [isMonthExpanded, setIsMonthExpanded] = useState(false); // Default: Weekly view
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [agendas, setAgendas] = useState<AgendaItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mail_calendar_agenda');
      if (saved !== null) {
        try {
          return JSON.parse(saved);
        } catch { /* ignore */ }
      }
    }
    return [];
  });
  const [showAddAgenda, setShowAddAgenda] = useState(false);
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaTime, setNewAgendaTime] = useState('09:00');
  const [newAgendaRecurrence, setNewAgendaRecurrence] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('once');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setSalutation('Good morning,');
    else if (hour >= 12 && hour < 18) setSalutation('Good afternoon,');
    else setSalutation('Good evening,');

    if (typeof window !== 'undefined') {
      const savedAvatar = localStorage.getItem('custom_avatar_url');
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      } else {
        const defaultAvatar = 'https://github.com/ivanaffriandi.png';
        setAvatarUrl(defaultAvatar);
        localStorage.setItem('custom_avatar_url', defaultAvatar);
      }

      const savedFolderOrder = localStorage.getItem('mail_folder_order');
      if (savedFolderOrder) {
        try {
          setFolderOrder(JSON.parse(savedFolderOrder));
        } catch { /* use default */ }
      }
    }

    // Live Cloud Agenda Fetch & Polling (Syncs real-time across Mac & Mobile without flickering)
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
    const interval = setInterval(loadCloudAgendas, 10000); // 10s live sync
    return () => clearInterval(interval);
  }, []);

  const handleToggleAgenda = (id: string) => {
    const target = agendas.find(a => a.id === id);
    if (!target) return;
    const nextCompleted = !target.completed;
    setAgendas((prev) => {
      const updated = prev.map(a => a.id === id ? { ...a, completed: nextCompleted } : a);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mail_calendar_agenda', JSON.stringify(updated));
      }
      return updated;
    });
    toggleAgendaApi(id, nextCompleted).catch(err => console.error('Cloud toggle error:', err));
  };

  const handleDeleteAgenda = (id: string) => {
    setAgendas((prev) => {
      const updated = prev.filter(a => a.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mail_calendar_agenda', JSON.stringify(updated));
      }
      return updated;
    });
    deleteAgendaApi(id).catch(err => console.error('Cloud delete error:', err));
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
      const updated = [item, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('mail_calendar_agenda', JSON.stringify(updated));
      }
      return updated;
    });
    setNewAgendaTitle('');
    setShowAddAgenda(false);
    saveAgenda(item).catch(err => console.error('Cloud save error:', err));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAvatarUrl(result);
        if (typeof window !== 'undefined') {
          localStorage.setItem('custom_avatar_url', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'inbox': return <Inbox className="w-4 h-4 stroke-[1.8]" />;
      case 'sent': return <Send className="w-4 h-4 stroke-[1.8]" />;
      case 'drafts': return <FileText className="w-4 h-4 stroke-[1.8]" />;
      case 'archive': return <Archive className="w-4 h-4 stroke-[1.8]" />;
      case 'spam': return <AlertOctagon className="w-4 h-4 stroke-[1.8]" />;
      case 'trash': return <Trash2 className="w-4 h-4 stroke-[1.8]" />;
      default: return <Inbox className="w-4 h-4 stroke-[1.8]" />;
    }
  };

  // Drag and Drop folder reordering
  const handleDragStart = (index: number) => {
    setDraggedFolderIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedFolderIndex === null || draggedFolderIndex === index) return;

    const reordered = [...orderedFolders];
    const [dragged] = reordered.splice(draggedFolderIndex, 1);
    reordered.splice(index, 0, dragged);

    const newOrderKeys = reordered.map(f => f.type.toLowerCase());
    setFolderOrder(newOrderKeys);
    setDraggedFolderIndex(index);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mail_folder_order', JSON.stringify(newOrderKeys));
    }
  };

  const orderedFolders = [...folders].sort((a, b) => {
    const idxA = folderOrder.indexOf(a.type.toLowerCase());
    const idxB = folderOrder.indexOf(b.type.toLowerCase());
    return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
  });

  // Calendar Helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const selectedDateKey = formatLocalDateKey(selectedDate);

  const selectedDayAgendas = agendas.filter(a => {
    if (a.dateStr === selectedDateKey) return true;
    if (a.recurrence === 'daily') return true;
    if (a.recurrence === 'weekly') {
      const aDate = new Date(a.dateStr);
      return aDate.getDay() === selectedDate.getDay();
    }
    if (a.recurrence === 'monthly') {
      const aDate = new Date(a.dateStr);
      return aDate.getDate() === selectedDate.getDate();
    }
    return false;
  });

  const prevPeriod = () => {
    if (isMonthExpanded) {
      setCurrentMonth(new Date(year, month - 1, 1));
    } else {
      const newD = new Date(selectedDate);
      newD.setDate(newD.getDate() - 7);
      setSelectedDate(newD);
      setCurrentMonth(newD);
    }
  };

  const nextPeriod = () => {
    if (isMonthExpanded) {
      setCurrentMonth(new Date(year, month + 1, 1));
    } else {
      const newD = new Date(selectedDate);
      newD.setDate(newD.getDate() + 7);
      setSelectedDate(newD);
      setCurrentMonth(newD);
    }
  };

  // Compute current week days (Sunday to Saturday around selectedDate)
  const currentWeekDays: Date[] = [];
  const currDayIndex = selectedDate.getDay();
  for (let i = 0; i < 7; i++) {
    const d = new Date(selectedDate);
    d.setDate(selectedDate.getDate() - currDayIndex + i);
    currentWeekDays.push(d);
  }

  return (
    <aside className="w-64 h-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-3.5 shadow-card flex flex-col gap-2.5 select-none shrink-0 z-20 apple-transition overflow-hidden font-sans">
      {/* 1. Personal Greeting Header */}
      <div className="flex items-center gap-3 pt-1 px-1 shrink-0">
        <div className="relative group shrink-0">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-blue-500/20">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Ivan" className="w-full h-full object-cover" />
            ) : (
              'IA'
            )}
          </div>
          <label
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center cursor-pointer apple-transition text-white"
            title="Change Avatar"
          >
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </label>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[11px] text-[var(--text-muted)] font-medium leading-none">
            {salutation}
          </span>
          <span className="text-sm font-extrabold text-[var(--text-primary)] truncate mt-1 leading-tight tracking-tight">
            Ivan Affriandi
          </span>
        </div>
      </div>

      {/* 2. System Mailboxes / Folders Card (Reorderable with Drag & Drop) */}
      <div className="bg-[var(--bg-color)] p-2 rounded-3xl border border-[var(--card-border)] shadow-2xs shrink-0">
        <nav className="flex flex-col gap-0.5">
          {orderedFolders.map((folder, idx) => {
            const isActive = activeFolderId === folder.id;
            return (
              <div
                key={folder.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={() => setDraggedFolderIndex(null)}
                className="group/folder relative"
              >
                <button
                  onClick={() => onSelectFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 ease-out apple-active-scale ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md scale-100'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-[var(--text-muted)]'}>
                      {getIcon(folder.type)}
                    </span>
                    <span className="capitalize">{folder.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {folder.unread_count > 0 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors duration-200 ${
                        isActive
                          ? 'bg-white/20 text-white font-extrabold'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                      }`}>
                        {folder.unread_count}
                      </span>
                    )}
                    <GripVertical className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover/folder:opacity-50 cursor-grab apple-transition" />
                  </div>
                </button>
              </div>
            );
          })}

          {/* Subscriptions / Newsletters Section Item */}
          <div className="pt-1.5 mt-1 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => onOpenSubscriptions?.()}
              className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)] border border-transparent transition-all duration-200 ease-out apple-active-scale cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[var(--text-muted)]">
                  <Newspaper className="w-4 h-4 stroke-[1.8]" />
                </span>
                <span>Subscriptions</span>
              </div>
            </button>
          </div>
        </nav>
      </div>

      {/* 3. Interactive Apple Calendar & Agenda Card */}
      <div className="flex-1 bg-[var(--bg-color)] p-3 rounded-3xl border border-[var(--card-border)] shadow-2xs flex flex-col min-h-0 overflow-hidden font-sans">
        {/* Calendar Month & Controls Header */}
        <div className="flex items-center justify-between pb-1.5 shrink-0">
          <button
            onClick={() => setIsMonthExpanded(!isMonthExpanded)}
            className="flex items-center gap-1 text-xs font-extrabold text-[var(--text-primary)] hover:text-blue-500 apple-transition"
            title={isMonthExpanded ? 'Switch to Week View' : 'Expand to Month View'}
          >
            <span>{currentMonth.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
            {isMonthExpanded ? <ChevronUp className="w-3 h-3 text-[var(--text-muted)]" /> : <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={prevPeriod}
              className="p-1 rounded-lg hover:bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] apple-transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextPeriod}
              className="p-1 rounded-lg hover:bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] apple-transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowAddAgenda(!showAddAgenda)}
              className="p-1 rounded-lg hover:bg-[var(--card-bg)] text-blue-600 apple-transition ml-0.5"
              title="Add Agenda"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[var(--text-muted)] pb-1 shrink-0">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className={i === 0 ? 'text-red-500/80 font-bold' : ''}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid: Week View OR Full Month View */}
        {isMonthExpanded ? (
          <div className="grid grid-cols-7 gap-y-1 text-center shrink-0 animate-fade-in">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-6" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const thisDate = new Date(year, month, dayNum);
              const isSelected = thisDate.toDateString() === selectedDate.toDateString();
              const isToday = thisDate.toDateString() === new Date().toDateString();
              const dKey = formatLocalDateKey(thisDate);
              const isSunday = thisDate.getDay() === 0;
              const hasAgendas = agendas.some(a => a.dateStr === dKey || a.recurrence === 'daily');

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDate(thisDate)}
                  className={`h-6 w-6 mx-auto rounded-full text-[11px] font-bold flex flex-col items-center justify-center relative transition-all duration-150 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs scale-105'
                      : isToday
                      ? 'bg-blue-500/15 text-blue-600'
                      : isSunday
                      ? 'text-red-500/80 font-bold hover:bg-red-500/10'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)]'
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
          /* Weekly View (1 Row) */
          <div className="grid grid-cols-7 gap-1 text-center shrink-0 animate-fade-in py-0.5">
            {currentWeekDays.map((thisDate, i) => {
              const isSelected = thisDate.toDateString() === selectedDate.toDateString();
              const isToday = thisDate.toDateString() === new Date().toDateString();
              const dKey = formatLocalDateKey(thisDate);
              const isSunday = thisDate.getDay() === 0;
              const hasAgendas = agendas.some(a => a.dateStr === dKey || a.recurrence === 'daily');

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(thisDate)}
                  className={`h-7 rounded-2xl text-[11px] font-bold flex flex-col items-center justify-center relative transition-all duration-150 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs scale-105'
                      : isToday
                      ? 'bg-blue-500/15 text-blue-600'
                      : isSunday
                      ? 'text-red-500/80 font-bold hover:bg-red-500/10'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{thisDate.getDate()}</span>
                  {hasAgendas && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-blue-500 absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Add Agenda Inline Form */}
        {showAddAgenda && (
          <form onSubmit={handleCreateAgenda} className="mt-2 p-2.5 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] space-y-2 animate-toast shrink-0">
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)]">
              <span>New Agenda</span>
              <button type="button" onClick={() => setShowAddAgenda(false)}>
                <X className="w-3 h-3" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Event title..."
              value={newAgendaTitle}
              onChange={(e) => setNewAgendaTitle(e.target.value)}
              autoFocus
              className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-2.5 py-1 text-[11px] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <input
                  type="time"
                  value={newAgendaTime}
                  onChange={(e) => setNewAgendaTime(e.target.value)}
                  className="bg-[var(--bg-color)] border border-[var(--card-border)] rounded-lg px-2 py-0.5 text-[10px] text-[var(--text-primary)] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] shadow-2xs hover:bg-blue-700 apple-transition"
                >
                  Add
                </button>
              </div>
              <div className="flex items-center justify-between gap-1 bg-[var(--bg-color)] p-0.5 rounded-lg border border-[var(--card-border)]">
                {(['once', 'daily', 'weekly', 'monthly'] as const).map((rec) => (
                  <button
                    key={rec}
                    type="button"
                    onClick={() => setNewAgendaRecurrence(rec)}
                    className={`flex-1 py-0.5 rounded-md text-[9px] font-bold capitalize apple-transition ${
                      newAgendaRecurrence === rec
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {rec}
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* Agenda Events for Selected Day */}
        <div className="mt-2 flex-1 flex flex-col min-h-0 overflow-hidden border-t border-[var(--border-subtle)] pt-1.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1 shrink-0 flex items-center justify-between">
            <span>{selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span className="text-blue-500">{selectedDayAgendas.length} items</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
            {selectedDayAgendas.length === 0 ? (
              <p className="text-[11px] text-[var(--text-muted)] py-2 text-center font-medium">
                No agenda for this date
              </p>
            ) : (
              selectedDayAgendas.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-1.5 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--border-subtle)] apple-transition group"
                >
                  <button
                    onClick={() => handleToggleAgenda(item.id)}
                    className="flex items-center gap-2 min-w-0 text-left flex-1"
                  >
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      item.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-[var(--card-border)] bg-[var(--bg-color)]'
                    }`}>
                      {item.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className={`text-[11px] font-semibold block truncate leading-tight ${
                        item.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                      }`}>
                        {item.title}
                      </span>
                      <div className="flex items-center gap-2 text-[9px] text-[var(--text-muted)]">
                        {item.time && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {item.time}
                          </span>
                        )}
                        {item.recurrence && item.recurrence !== 'once' && (
                          <span className="flex items-center gap-0.5 capitalize text-blue-500">
                            <Repeat className="w-2.5 h-2.5" />
                            {item.recurrence}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDeleteAgenda(item.id)}
                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:text-red-500 text-[var(--text-muted)] apple-transition shrink-0"
                    title="Delete item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Compose / Write Action Pillbar Button */}
      <div className="shrink-0 pt-1">
        <button
          onClick={() => onOpenCompose()}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg apple-transition apple-active-scale"
        >
          <Feather className="w-4 h-4 stroke-[2.2]" />
          <span>Write</span>
        </button>
      </div>
    </aside>
  );
};
