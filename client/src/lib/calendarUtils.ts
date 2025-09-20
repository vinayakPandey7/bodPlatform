/**
 * Generate ICS calendar file content for interview booking
 */
export function generateICSFile(interviewData: {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  organizer: {
    name: string;
    email: string;
  };
  attendee: {
    name: string;
    email: string;
  };
}) {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDate = new Date(interviewData.startDate);
  const endDate = new Date(interviewData.endDate);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BOD Platform//Interview Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@theciero.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${interviewData.title}`,
    `DESCRIPTION:${interviewData.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${interviewData.location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    `ORGANIZER;CN=${interviewData.organizer.name}:mailto:${interviewData.organizer.email}`,
    `ATTENDEE;CN=${interviewData.attendee.name};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:mailto:${interviewData.attendee.email}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Interview Reminder - 1 hour before',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Interview Reminder - 15 minutes before',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

/**
 * Download calendar file
 */
export function downloadCalendarFile(icsContent: string, filename: string) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Generate Google Calendar URL
 */
export function generateGoogleCalendarUrl(interviewData: {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
}) {
  const startDate = new Date(interviewData.startDate);
  const endDate = new Date(interviewData.endDate);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: interviewData.title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: interviewData.description,
    location: interviewData.location,
    ctz: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar URL
 */
export function generateOutlookCalendarUrl(interviewData: {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
}) {
  const startDate = new Date(interviewData.startDate);
  const endDate = new Date(interviewData.endDate);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: interviewData.title,
    startdt: formatDate(startDate),
    enddt: formatDate(endDate),
    body: interviewData.description,
    location: interviewData.location
  });

  return `https://outlook.live.com/calendar/0/${params.toString()}`;
}
