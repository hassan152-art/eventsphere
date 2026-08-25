const asyncHandler = require('../middleware/asyncHandler');
const { success } = require('../utils/apiResponse');
const { getAIResponse } = require('../services/aiService');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Certificate = require('../models/Certificate');
const Feedback = require('../models/Feedback');

/**
 * Gathers a small, role-appropriate snapshot of live DB data so the AI
 * (or the rule-based fallback) answers with real facts instead of
 * hallucinating. Kept intentionally small to control token usage.
 */
async function buildContext(user) {
  const now = new Date();

  if (user.role === 'organizer') {
    const events = await Event.find({ organizer: user._id }).sort('-date').limit(10);
    return { role: 'organizer', events };
  }

  if (user.role === 'admin') {
    const pendingCount = await Event.countDocuments({ status: 'Pending Approval' });
    const totalEvents = await Event.countDocuments();
    return { role: 'admin', pendingCount, totalEvents };
  }

  // participant
  const [upcomingEvents, myRegistrations, myCertificates] = await Promise.all([
    Event.find({ status: 'Approved', date: { $gte: now } }).sort('date').limit(10),
    Registration.find({ student: user._id, status: { $ne: 'Cancelled' } }).populate('event').limit(10),
    Certificate.countDocuments({ student: user._id }),
  ]);
  return { role: 'participant', upcomingEvents, myRegistrations, myCertificates };
}

function buildSystemPrompt(user, context) {
  return `You are "EventSphere Copilot", a friendly, concise assistant embedded in a college event management platform.
The current user is ${user.fullName} (role: ${user.role}).
Only answer using the CONTEXT JSON below - never invent events, dates, or seat counts that aren't present.
If the answer isn't in the context, say so plainly and suggest where in the app they can find it (e.g. "check My Registrations").
Keep answers short (2-5 sentences), warm, and practical.

CONTEXT:
${JSON.stringify(context, null, 2)}`;
}

/**
 * Safe, deterministic fallback used when no AI_API_KEY is configured
 * (SRS section 24: "If AI API is unavailable, use a safe rule-based
 * fallback."). Handles the example prompts listed in the SRS directly.
 */
function ruleBasedFallback(message, context) {
  const m = message.toLowerCase();

  if (context.role === 'participant') {
    if (m.includes('upcoming') || m.includes('this week') || m.includes('this month')) {
      const list = (context.upcomingEvents || []).slice(0, 5).map((e) => `- ${e.title} (${new Date(e.date).toDateString()})`).join('\n');
      return list ? `Here's what's coming up:\n${list}` : "I don't see any upcoming approved events right now.";
    }
    if (m.includes('seats available') || m.includes('available')) {
      const list = (context.upcomingEvents || []).filter((e) => e.seatsRemaining > 0).slice(0, 5)
        .map((e) => `- ${e.title}: ${e.seatsRemaining} seat(s) left`).join('\n');
      return list ? list : 'No events currently have open seats.';
    }
    if (m.includes('my registration') || m.includes('registered')) {
      const list = (context.myRegistrations || []).map((r) => `- ${r.event?.title} (${r.status})`).join('\n');
      return list ? `Your registrations:\n${list}` : "You haven't registered for any events yet.";
    }
    if (m.includes('next event')) {
      const next = (context.myRegistrations || [])[0];
      return next ? `Your next event is "${next.event?.title}" on ${new Date(next.event?.date).toDateString()}.` : "You don't have any upcoming registered events.";
    }
    if (m.includes('certificate')) {
      return `You currently have ${context.myCertificates || 0} certificate(s) available in the Certificates tab.`;
    }
    if (m.includes('qr') || m.includes('attendance')) {
      return 'Once your registration is confirmed, go to "My Registrations" to view your QR pass. Show it to the organizer at the venue to check in - it can only be scanned once per event.';
    }
    if (m.includes('register')) {
      return 'Open any event\'s details page and tap "Register Now". If it\'s full and waitlisting is enabled, you\'ll be added to the waitlist automatically.';
    }
  }

  if (context.role === 'organizer') {
    if (m.includes('how many participants') || m.includes('registrations')) {
      const withCounts = (context.events || []).map((e) => `- ${e.title}: ${e.registrationCount} registered`).join('\n');
      return withCounts || "You don't have any events yet.";
    }
    if (m.includes('upcoming events')) {
      const list = (context.events || []).filter((e) => e.computedStatus === 'Upcoming').map((e) => `- ${e.title} (${new Date(e.date).toDateString()})`).join('\n');
      return list || "You don't have any upcoming events.";
    }
    if (m.includes('highest registration')) {
      const top = [...(context.events || [])].sort((a, b) => b.registrationCount - a.registrationCount)[0];
      return top ? `"${top.title}" has the most registrations (${top.registrationCount}).` : 'No event data yet.';
    }
  }

  if (context.role === 'admin') {
    if (m.includes('pending')) return `There are currently ${context.pendingCount} event(s) pending approval.`;
    if (m.includes('platform') || m.includes('summarize')) return `The platform currently has ${context.totalEvents} total event(s), with ${context.pendingCount} awaiting approval.`;
  }

  return "I can help with event discovery, registrations, attendance, and certificates. Could you rephrase that, or check the relevant dashboard tab?";
}

// @route POST /api/ai/chat
const chat = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;
  const context = await buildContext(req.user);

  try {
    const reply = await getAIResponse({
      systemPrompt: buildSystemPrompt(req.user, context),
      messages: [...history, { role: 'user', content: message }],
    });
    return success(res, 200, 'AI Copilot response', { reply, source: 'ai' });
  } catch (err) {
    // Falls back safely whether AI is unconfigured or the provider call failed
    const reply = ruleBasedFallback(message, context);
    return success(res, 200, 'AI Copilot response (fallback)', { reply, source: 'rule-based' });
  }
});

module.exports = { chat };
