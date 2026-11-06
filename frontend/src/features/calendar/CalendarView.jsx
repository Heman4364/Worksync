import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  optimisticReschedule,
} from '../../store/slices/calendarSlice';
import { selectCalendarEventsForFullCalendar } from '../../store/selectors/calendarSelectors';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { addToast } from '../../store/slices/uiSlice';
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';

export const CalendarView = () => {
  const dispatch = useDispatch();
  const calendarRef = useRef(null);
  const activeWorkspaceId = useSelector((state) => state.auth.activeWorkspaceId);
  const events = useSelector(selectCalendarEventsForFullCalendar);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('CUSTOM');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState('#6366f1');

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchCalendarEvents({ workspaceId: activeWorkspaceId }));
    }
  }, [dispatch, activeWorkspaceId]);

  const handleEventDrop = (info) => {
    const { event } = info;
    const eventId = Number(event.id);
    const newStart = event.start.toISOString().slice(0, 19);
    const newEnd = event.end ? event.end.toISOString().slice(0, 19) : null;

    // 1. Optimistic update in Redux
    dispatch(optimisticReschedule({ id: eventId, startTime: newStart, endTime: newEnd }));

    // 2. Persist to API
    dispatch(
      updateCalendarEvent({
        id: eventId,
        data: {
          title: event.title,
          startTime: newStart,
          endTime: newEnd,
          color: event.backgroundColor,
          allDay: event.allDay,
        },
      })
    )
      .unwrap()
      .then(() => {
        dispatch(addToast({ title: 'Rescheduled', message: 'Event date updated successfully', type: 'success' }));
      })
      .catch(() => {
        info.revert();
        dispatch(addToast({ title: 'Error', message: 'Failed to reschedule event', type: 'error' }));
      });
  };

  const handleDateSelect = (selectInfo) => {
    setStartTime(selectInfo.startStr.slice(0, 16));
    if (selectInfo.endStr) {
      setEndTime(selectInfo.endStr.slice(0, 16));
    }
    setCreateModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    const raw = clickInfo.event;
    setSelectedEvent({
      id: raw.id,
      title: raw.title,
      start: raw.startStr,
      end: raw.endStr,
      color: raw.backgroundColor,
      ...raw.extendedProps,
    });
    setDetailModalOpen(true);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title || !startTime) return;

    const res = await dispatch(
      createCalendarEvent({
        workspaceId: activeWorkspaceId,
        title,
        description,
        eventType,
        startTime: startTime.length === 16 ? startTime + ':00' : startTime,
        endTime: endTime ? (endTime.length === 16 ? endTime + ':00' : endTime) : null,
        color,
        allDay: false,
      })
    );

    if (!res.error) {
      dispatch(addToast({ title: 'Success', message: 'Calendar event created', type: 'success' }));
      setCreateModalOpen(false);
      setTitle('');
      setDescription('');
    }
  };

  const handleDeleteEvent = () => {
    if (selectedEvent && window.confirm('Delete this event?')) {
      dispatch(deleteCalendarEvent(Number(selectedEvent.id)));
      dispatch(addToast({ title: 'Deleted', message: 'Calendar event deleted', type: 'info' }));
      setDetailModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Interactive Calendar</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Drag-and-drop to reschedule project milestones, task deadlines, and social posts
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} size="sm" icon={Plus}>
          Add Event
        </Button>
      </div>

      {/* FullCalendar Card */}
      <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          eventDrop={handleEventDrop}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
        />
      </Card>

      {/* Create Event Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Calendar Event">
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Marketing Review"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value="CUSTOM">Custom Event</option>
                <option value="MEETING">Meeting</option>
                <option value="PROJECT_DEADLINE">Project Deadline</option>
                <option value="TASK_DEADLINE">Task Deadline</option>
                <option value="SOCIAL_POST">Social Post</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Color Tag</label>
              <div className="flex items-center gap-2 pt-1">
                {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      color === c ? 'scale-110 border-slate-900 dark:border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time *</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes or agenda..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save Event
            </Button>
          </div>
        </form>
      </Modal>

      {/* Event Details Modal */}
      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Event Details">
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedEvent.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedEvent.eventType?.replace('_', ' ')}</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>
                  {new Date(selectedEvent.start).toLocaleString()} -{' '}
                  {selectedEvent.end ? new Date(selectedEvent.end).toLocaleString() : 'All day'}
                </span>
              </div>
              {selectedEvent.description && (
                <p className="text-slate-600 dark:text-slate-400 pt-1">{selectedEvent.description}</p>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button size="sm" variant="danger" onClick={handleDeleteEvent}>
                Delete Event
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarView;
