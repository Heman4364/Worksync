import { createSelector } from '@reduxjs/toolkit';
import { selectAllCalendarEvents } from '../slices/calendarSlice';

export const selectCalendarEventsForFullCalendar = createSelector([selectAllCalendarEvents], (events) => {
  return events.map((event) => ({
    id: String(event.id),
    title: event.title,
    start: event.startTime,
    end: event.endTime || event.startTime,
    backgroundColor: event.color || '#6366f1',
    borderColor: event.color || '#6366f1',
    allDay: event.allDay,
    extendedProps: {
      eventType: event.eventType,
      description: event.description,
      userName: event.userName,
    },
  }));
});
