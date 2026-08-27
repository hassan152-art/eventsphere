const asyncHandler = require('../middleware/asyncHandler');
const { success } = require('../utils/apiResponse');

const { getAIResponse } = require('../services/aiService');

const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Certificate = require('../models/Certificate');
const Feedback = require('../models/Feedback');

/**
 * Build live database context for the logged-in user.
 */
async function buildContext(user) {
  const now = new Date();

  /**
   * ORGANIZER
   */
  if (user.role === 'organizer') {
    const events = await Event.find({
      organizer: user._id,
    })
      .sort('-date')
      .limit(10)
      .lean();

    return {
      role: 'organizer',

      events: events.map((event) => ({
        id: event._id,
        title: event.title,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        status: event.status,
        venue: event.venue,
        capacity: event.capacity,
        maxParticipants: event.maxParticipants,
        registrationCount: event.registrationCount || 0,
        seatsRemaining: event.seatsRemaining || 0,
        computedStatus: event.computedStatus,
      })),
    };
  }

  /**
   * ADMIN
   */
  if (user.role === 'admin') {
    const [pendingCount, totalEvents] = await Promise.all([
      Event.countDocuments({
        status: 'Pending Approval',
      }),

      Event.countDocuments(),
    ]);

    return {
      role: 'admin',
      pendingCount,
      totalEvents,
    };
  }

  /**
   * PARTICIPANT
   */
  const [
    upcomingEvents,
    myRegistrations,
    myCertificates,
  ] = await Promise.all([
    Event.find({
      status: 'Approved',
      date: {
        $gte: now,
      },
    })
      .sort('date')
      .limit(10)
      .lean(),

    Registration.find({
      student: user._id,
      status: {
        $ne: 'Cancelled',
      },
    })
      .populate('event')
      .limit(10)
      .lean(),

    Certificate.countDocuments({
      student: user._id,
    }),
  ]);

  return {
    role: 'participant',

    upcomingEvents: upcomingEvents.map((event) => ({
      id: event._id,
      title: event.title,
      description: event.description,
      category: event.category,
      eventType: event.eventType,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue,
      capacity: event.capacity,
      maxParticipants: event.maxParticipants,
      seatsRemaining: event.seatsRemaining || 0,
      status: event.status,
    })),

    myRegistrations: myRegistrations.map((registration) => ({
      id: registration._id,
      status: registration.status,

      event: registration.event
        ? {
            id: registration.event._id,
            title: registration.event.title,
            date: registration.event.date,
            startTime: registration.event.startTime,
            endTime: registration.event.endTime,
            venue: registration.event.venue,
          }
        : null,
    })),

    myCertificates,
  };
}


/**
 * System prompt
 */
function buildSystemPrompt(user, context) {
  return `
You are EventSphere Copilot, the AI assistant inside a college event management platform.

CURRENT USER:
Name: ${user.fullName}
Role: ${user.role}

IMPORTANT RULES:

1. Only use information contained in the CONTEXT below.
2. Never invent events.
3. Never invent dates.
4. Never invent registration counts.
5. Never invent seat availability.
6. Never invent certificates.
7. Never claim an action was performed if it was not performed.
8. If the requested information is not available in CONTEXT, clearly say that you do not have that information.
9. Tell the user where they can find it in EventSphere when appropriate.
10. Be friendly and helpful.
11. Give direct answers.
12. Keep normal answers between 2 and 6 sentences.
13. If the user asks for a list, use a clean bullet list.
14. Understand natural language such as:
   - "new events"
   - "upcoming events"
   - "events this month"
   - "show events"
   - "what events are available"
   - "my registrations"
   - "what did I register for"
   - "my certificates"
   - "how many seats"
   - "available seats"
   - "attendance"
   - "QR"
   - "participants"
   - "registrations"
15. Do not repeatedly give the same fallback response when the context contains relevant information.

CONTEXT:
${JSON.stringify(context, null, 2)}
`;
}


/**
 * Rule-based fallback.
 *
 * Used when Gemini is unavailable.
 */
function ruleBasedFallback(message, context) {
  const m = message.toLowerCase().trim();

  /**
   * PARTICIPANT
   */
  if (context.role === 'participant') {

    /**
     * Upcoming events
     */
    if (
      m.includes('upcoming') ||
      m.includes('new event') ||
      m.includes('new events') ||
      m.includes('show events') ||
      m.includes('available events') ||
      m.includes('this month') ||
      m.includes('this week')
    ) {
      const events = context.upcomingEvents || [];

      if (!events.length) {
        return 'I don’t see any upcoming approved events right now.';
      }

      const list = events
        .slice(0, 5)
        .map((event) => {
          const date = event.date
            ? new Date(event.date).toDateString()
            : 'Date unavailable';

          return `• ${event.title} — ${date}`;
        })
        .join('\n');

      return `Here are the upcoming events:\n\n${list}`;
    }


    /**
     * Seats
     */
    if (
      m.includes('seat') ||
      m.includes('available')
    ) {
      const events = (context.upcomingEvents || [])
        .filter((event) => Number(event.seatsRemaining || 0) > 0)
        .slice(0, 5);

      if (!events.length) {
        return 'I don’t currently see any upcoming events with available seats.';
      }

      return (
        'Here are events with available seats:\n\n' +
        events
          .map(
            (event) =>
              `• ${event.title}: ${event.seatsRemaining} seat(s) available`
          )
          .join('\n')
      );
    }


    /**
     * Registrations
     */
    if (
      m.includes('my registration') ||
      m.includes('my registrations') ||
      m.includes('registered') ||
      m.includes('registration')
    ) {
      const registrations = context.myRegistrations || [];

      if (!registrations.length) {
        return "You haven't registered for any events yet.";
      }

      return (
        'Your registrations:\n\n' +
        registrations
          .map((registration) => {
            const title =
              registration.event?.title || 'Unknown event';

            return `• ${title} — ${registration.status}`;
          })
          .join('\n')
      );
    }


    /**
     * Certificates
     */
    if (
      m.includes('certificate') ||
      m.includes('certificates')
    ) {
      return `You currently have ${
        context.myCertificates || 0
      } certificate(s). You can view them from the Certificates section.`;
    }


    /**
     * QR / attendance
     */
    if (
      m.includes('qr') ||
      m.includes('attendance') ||
      m.includes('check in') ||
      m.includes('check-in')
    ) {
      return (
        'After your registration is confirmed, open My Registrations ' +
        'to view your QR pass. Show the QR code to the organizer at the venue.'
      );
    }


    /**
     * Register
     */
    if (
      m.includes('register') ||
      m.includes('registration process')
    ) {
      return (
        'Open an event from Event Discovery and select "Register Now". ' +
        'If the event is full and waitlisting is enabled, you may be added to the waitlist.'
      );
    }
  }


  /**
   * ORGANIZER
   */
  if (context.role === 'organizer') {

    if (
      m.includes('participant') ||
      m.includes('registration')
    ) {
      const events = context.events || [];

      if (!events.length) {
        return "You don't have any events yet.";
      }

      return (
        'Your event registrations:\n\n' +
        events
          .map(
            (event) =>
              `• ${event.title}: ${event.registrationCount || 0} registered`
          )
          .join('\n')
      );
    }


    if (
      m.includes('upcoming') ||
      m.includes('my events')
    ) {
      const events = (context.events || [])
        .filter(
          (event) =>
            event.computedStatus === 'Upcoming' ||
            event.status === 'Approved'
        );

      if (!events.length) {
        return "You don't have any upcoming events.";
      }

      return (
        'Your upcoming events:\n\n' +
        events
          .map(
            (event) =>
              `• ${event.title} — ${
                event.date
                  ? new Date(event.date).toDateString()
                  : 'Date unavailable'
              }`
          )
          .join('\n')
      );
    }


    if (
      m.includes('highest') ||
      m.includes('most registration')
    ) {
      const events = context.events || [];

      if (!events.length) {
        return 'No event data is available yet.';
      }

      const top = [...events].sort(
        (a, b) =>
          Number(b.registrationCount || 0) -
          Number(a.registrationCount || 0)
      )[0];

      return `"${top.title}" currently has the highest registrations with ${
        top.registrationCount || 0
      } registered participant(s).`;
    }
  }


  /**
   * ADMIN
   */
  if (context.role === 'admin') {

    if (
      m.includes('pending') ||
      m.includes('approval')
    ) {
      return `There are currently ${context.pendingCount} event(s) pending approval.`;
    }

    if (
      m.includes('platform') ||
      m.includes('summarize') ||
      m.includes('summary')
    ) {
      return (
        `EventSphere currently has ${context.totalEvents} total event(s). ` +
        `${context.pendingCount} event(s) are waiting for approval.`
      );
    }
  }


  /**
   * Better general fallback
   */
  return (
    'I can help you with upcoming events, available seats, ' +
    'registrations, attendance, certificates, and EventSphere information. ' +
    'Try asking something like "Show upcoming events" or "Show my registrations".'
  );
}


/**
 * POST /api/ai/chat
 */
const chat = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Message is required',
    });
  }

  const context = await buildContext(req.user);

  try {
    const reply = await getAIResponse({
      systemPrompt: buildSystemPrompt(req.user, context),

      messages: [
        ...history.slice(-10),
        {
          role: 'user',
          content: message,
        },
      ],
    });

    return success(
      res,
      200,
      'AI Copilot response',
      {
        reply,
        source: 'gemini',
      }
    );

  } catch (error) {

    console.error('AI Copilot error:', error.message);

    const reply = ruleBasedFallback(
      message,
      context
    );

    return success(
      res,
      200,
      'AI Copilot response',
      {
        reply,
        source: 'rule-based',
      }
    );
  }
});


module.exports = {
  chat,
};