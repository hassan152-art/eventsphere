/**
 * Seeds EventSphere with realistic demo data: departments, categories,
 * an admin/organizer/student account set, a handful of real-feeling
 * events across categories, registrations, attendance, feedback and
 * notifications.
 *
 * Usage:
 *   npm run seed            # populate
 *   npm run seed:destroy    # wipe all collections
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Department = require('../models/Department');
const Category = require('../models/Category');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');

const slugify = (str) => str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

const DEPARTMENTS = [
  { name: 'Computer Science & Engineering', code: 'CSE' },
  { name: 'Electronics & Communication', code: 'ECE' },
  { name: 'Mechanical Engineering', code: 'ME' },
  { name: 'Business Administration', code: 'MBA' },
  { name: 'Design & Fine Arts', code: 'DFA' },
];

const CATEGORIES = [
  { name: 'Technical', icon: 'cpu' },
  { name: 'Cultural', icon: 'music' },
  { name: 'Sports', icon: 'trophy' },
  { name: 'Workshops', icon: 'wrench' },
  { name: 'Seminars', icon: 'presentation' },
  { name: 'Competitions', icon: 'medal' },
  { name: 'Annual Day', icon: 'party-popper' },
  { name: 'Intercollegiate Events', icon: 'globe' },
];

async function run() {
  await connectDB();
  const destroy = process.argv.includes('--destroy');

  if (destroy) {
    await Promise.all([
      User.deleteMany(), Department.deleteMany(), Category.deleteMany(), Event.deleteMany(),
      Registration.deleteMany(), Attendance.deleteMany(), Feedback.deleteMany(),
      Certificate.deleteMany(), Notification.deleteMany(), Announcement.deleteMany(),
    ]);
    console.log('All collections wiped.');
    process.exit(0);
  }

  console.log('Seeding EventSphere...');

  const departments = await Department.insertMany(
    DEPARTMENTS.map((d) => ({ ...d, description: `Department of ${d.name}` }))
  );
  const categories = await Category.insertMany(
    CATEGORIES.map((c) => ({ ...c, slug: slugify(c.name), description: `${c.name} events on campus` }))
  );

  const cse = departments.find((d) => d.code === 'CSE')._id;
  const ece = departments.find((d) => d.code === 'ECE')._id;
  const dfa = departments.find((d) => d.code === 'DFA')._id;
  const mba = departments.find((d) => d.code === 'MBA')._id;

  const catByName = Object.fromEntries(categories.map((c) => [c.name, c._id]));

  const admin = await User.create({
    fullName: 'Admin User', email: 'admin@eventsphere.com', password: 'Admin@12345',
    contactNumber: '9800000001', department: cse, enrollmentNumber: 'ADMIN-0001',
    role: 'admin', isEmailVerified: true,
  });

  const organizer1 = await User.create({
    fullName: 'Priya Sharma', email: 'organizer@eventsphere.com', password: 'Organizer@12345',
    contactNumber: '9800000002', department: cse, enrollmentNumber: 'ORG-CSE-001',
    role: 'organizer', isEmailVerified: true, bio: 'Coordinator, CSE Technical Society',
  });

  const organizer2 = await User.create({
    fullName: 'Rahul Verma', email: 'rahul.organizer@eventsphere.com', password: 'Organizer@12345',
    contactNumber: '9800000003', department: dfa, enrollmentNumber: 'ORG-DFA-001',
    role: 'organizer', isEmailVerified: true, bio: 'Cultural Committee Lead',
  });

  const student = await User.create({
    fullName: 'Ananya Iyer', email: 'student@eventsphere.com', password: 'Student@12345',
    contactNumber: '9800000004', department: cse, enrollmentNumber: '21CSE1042',
    role: 'participant', isEmailVerified: true,
  });

  const extraStudents = await User.insertMany([
    { fullName: 'Karan Mehta', email: 'karan.mehta@eventsphere.com', password: 'Student@12345', contactNumber: '9800000005', department: ece, enrollmentNumber: '21ECE1010', role: 'participant' },
    { fullName: 'Sneha Kapoor', email: 'sneha.kapoor@eventsphere.com', password: 'Student@12345', contactNumber: '9800000006', department: mba, enrollmentNumber: '22MBA1021', role: 'participant' },
    { fullName: 'Aditya Rao', email: 'aditya.rao@eventsphere.com', password: 'Student@12345', contactNumber: '9800000007', department: dfa, enrollmentNumber: '20DFA1005', role: 'participant' },
  ]);

  const now = new Date();
  const daysFromNow = (n) => new Date(now.getTime() + n * 86400000);

  const eventDefs = [
    {
      title: 'CodeStorm 2026 - 24hr Hackathon', eventType: 'Technical', category: catByName.Technical, department: cse,
      description: 'A 24-hour team hackathon where students build working prototypes around this year\'s theme: "Campus Life, Reimagined." Mentorship rounds, free food, and prizes worth ₹1,00,000.',
      rules: 'Teams of 2-4. Bring your own laptops. Use of open-source libraries is allowed; plagiarized submissions will be disqualified.',
      venue: 'CSE Block - Innovation Lab', capacity: 120, maxParticipants: 120,
      date: daysFromNow(18), startTime: '09:00', endTime: '09:00 (+1 day)', registrationDeadline: daysFromNow(14),
      organizer: organizer1._id, status: 'Approved', waitlistEnabled: true,
    },
    {
      title: 'Rhythms - Annual Cultural Night', eventType: 'Cultural', category: catByName.Cultural, department: dfa,
      description: 'The flagship cultural night featuring student bands, dance crews, and a headline performance. Open to all departments.',
      rules: 'Entry via registered pass only. No outside food or drinks in the auditorium.',
      venue: 'Main Auditorium', capacity: 800, maxParticipants: 800,
      date: daysFromNow(30), startTime: '18:00', endTime: '22:00', registrationDeadline: daysFromNow(27),
      organizer: organizer2._id, status: 'Approved', waitlistEnabled: true,
    },
    {
      title: 'Inter-Department Football Championship', eventType: 'Sports', category: catByName.Sports, department: mba,
      description: 'A knockout football tournament between department teams, held over one weekend at the main sports ground.',
      rules: '7-a-side. Registered team captains must attend the toss meeting.', venue: 'Main Sports Ground', capacity: 200, maxParticipants: 200,
      date: daysFromNow(10), startTime: '08:00', endTime: '18:00', registrationDeadline: daysFromNow(7),
      organizer: organizer2._id, status: 'Approved', waitlistEnabled: false,
    },
    {
      title: 'Intro to Machine Learning - Hands-on Workshop', eventType: 'Workshop', category: catByName.Workshops, department: cse,
      description: 'A beginner-friendly, hands-on workshop covering Python, pandas, and building your first classifier with scikit-learn.',
      rules: 'Bring a laptop with Python 3.10+ installed. No prior ML experience required.', venue: 'CSE Seminar Hall 2', capacity: 60, maxParticipants: 60,
      date: daysFromNow(6), startTime: '10:00', endTime: '13:00', registrationDeadline: daysFromNow(4),
      organizer: organizer1._id, status: 'Approved', waitlistEnabled: true,
    },
    {
      title: 'Careers in Product Management - Industry Seminar', eventType: 'Seminar', category: catByName.Seminars, department: mba,
      description: 'A panel of alumni product managers from top tech companies discuss how to break into and grow in PM roles.',
      rules: 'Open to all final-year and pre-final-year students.', venue: 'MBA Block Auditorium', capacity: 150, maxParticipants: 150,
      date: daysFromNow(22), startTime: '15:00', endTime: '17:00', registrationDeadline: daysFromNow(19),
      organizer: organizer2._id, status: 'Approved', waitlistEnabled: true,
    },
    {
      title: 'Design Sprint Challenge', eventType: 'Competition', category: catByName.Competitions, department: dfa,
      description: 'Teams get a real campus problem statement and 6 hours to design and pitch a solution to a panel of judges.',
      rules: 'Teams of up to 3. Figma or physical prototypes both accepted.', venue: 'Design Studio', capacity: 45, maxParticipants: 45,
      date: daysFromNow(3), startTime: '10:00', endTime: '17:00', registrationDeadline: daysFromNow(2),
      organizer: organizer2._id, status: 'Approved', waitlistEnabled: true,
    },
    {
      title: 'RoboWars - Robotics Combat League', eventType: 'Technical', category: catByName.Technical, department: ece,
      description: 'Build and battle combat robots in the campus RoboWars arena. Weight classes and safety rules strictly enforced.',
      rules: 'Robots must pass a safety inspection before entering the arena.', venue: 'ECE Robotics Lab', capacity: 80, maxParticipants: 80,
      date: daysFromNow(40), startTime: '11:00', endTime: '18:00', registrationDeadline: daysFromNow(35),
      organizer: organizer1._id, status: 'Pending Approval', waitlistEnabled: true,
    },
    {
      title: 'Founders' + "'" + ' Circle - Startup Pitch Night', eventType: 'Intercollegiate', category: catByName['Intercollegiate Events'], department: mba,
      description: 'Student founders from partner colleges pitch to a panel of investors and alumni. Open networking session follows.',
      rules: 'Pitches capped at 5 minutes + 3 minutes Q&A.', venue: 'MBA Block Auditorium', capacity: 250, maxParticipants: 250,
      date: daysFromNow(-5), startTime: '17:00', endTime: '20:00', registrationDeadline: daysFromNow(-8),
      organizer: organizer2._id, status: 'Approved', waitlistEnabled: false,
    },
  ];

  const events = [];
  for (const def of eventDefs) {
    const event = await Event.create({
      ...def,
      slug: `${slugify(def.title)}-${Math.random().toString(36).slice(2, 7)}`,
      seatsRemaining: def.maxParticipants,
      images: [],
    });
    event.recomputeStatus();
    await event.save();
    events.push(event);
  }

  // Registrations + attendance + feedback + certificates for the past event
  const pastEvent = events.find((e) => e.title.startsWith("Founders"));
  const allStudents = [student, ...extraStudents];

  for (const s of allStudents) {
    const reg = await Registration.create({ event: pastEvent._id, student: s._id, status: 'Confirmed' });
    await Event.updateOne({ _id: pastEvent._id }, { $inc: { registrationCount: 1, seatsRemaining: -1 } });
    const attendance = await Attendance.create({ event: pastEvent._id, student: s._id, registration: reg._id, scannedBy: organizer2._id });
    await Feedback.create({
      event: pastEvent._id, student: s._id, overallRating: 4 + Math.round(Math.random()),
      venueRating: 4, coordinationRating: 5, technicalArrangementRating: 4, hospitalityRating: 4,
      comment: 'Great turnout and well-organized pitches!',
    });
    await Certificate.create({
      event: pastEvent._id, student: s._id, issuedBy: organizer2._id,
      certificateUrl: 'https://res.cloudinary.com/demo/raw/upload/eventsphere/sample-certificate.pdf',
      certificateNumber: `ES-CERT-${s._id.toString().slice(-6).toUpperCase()}`,
      type: 'Participation',
    });
  }
  await Event.findByIdAndUpdate(pastEvent._id, { averageRating: 4.5, ratingCount: allStudents.length });

  // A couple of registrations on an upcoming event for the primary demo student
  const hackathon = events.find((e) => e.title.startsWith('CodeStorm'));
  await Registration.create({ event: hackathon._id, student: student._id, status: 'Confirmed' });
  await Event.updateOne({ _id: hackathon._id }, { $inc: { registrationCount: 1, seatsRemaining: -1 } });

  await Notification.create({
    recipient: student._id, type: 'New Event', title: 'New event: CodeStorm 2026',
    message: 'A new hackathon has just been announced - check it out!', relatedEvent: hackathon._id,
  });

  await Announcement.create({
    title: 'Welcome to EventSphere 2026',
    message: 'All department events for this semester are now live on the platform. Explore, register, and get involved!',
    audience: 'Global', createdBy: admin._id,
  });

  console.log('\nSeed complete. Demo credentials:');
  console.log('  Admin:     admin@eventsphere.com     / Admin@12345');
  console.log('  Organizer: organizer@eventsphere.com / Organizer@12345');
  console.log('  Student:   student@eventsphere.com   / Student@12345\n');

  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
