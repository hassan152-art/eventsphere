const { createEvent } = require('ics');

/**
 * Builds a downloadable .ics file buffer for a given EventSphere event
 * (SRS section 21 - Calendar Integration).
 */
function buildICS(event) {
  return new Promise((resolve, reject) => {
    const d = new Date(event.date);
    const [startH, startM] = (event.startTime || '09:00').split(':').map(Number);
    const [endH, endM] = (event.endTime || '10:00').split(':').map(Number);

    createEvent(
      {
        title: event.title,
        description: event.description,
        location: event.venue,
        start: [d.getFullYear(), d.getMonth() + 1, d.getDate(), startH, startM],
        end: [d.getFullYear(), d.getMonth() + 1, d.getDate(), endH, endM],
        alarms: [{ action: 'display', trigger: { hours: 1, before: true } }],
        productId: 'eventsphere/ics',
      },
      (error, value) => {
        if (error) return reject(error);
        resolve(value);
      }
    );
  });
}

module.exports = { buildICS };
