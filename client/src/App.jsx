import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CopilotWidget from './components/copilot/CopilotWidget';
import ProtectedRoute from './routes/ProtectedRoute';

import Landing from './pages/public/Landing';
import EventDiscovery from './pages/public/EventDiscovery';
import EventDetails from './pages/public/EventDetails';
import Gallery from './pages/public/Gallery';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import FAQ from './pages/public/FAQ';
import NotFound from './pages/public/NotFound';
import Unauthorized from './pages/public/Unauthorized';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import StudentLayout from './pages/student/StudentLayout';
import StudentOverview from './pages/student/Overview';
import MyRegistrations from './pages/student/MyRegistrations';
import Attendance from './pages/student/Attendance';
import Certificates from './pages/student/Certificates';
import SavedEvents from './pages/student/SavedEvents';
import StudentFeedback from './pages/student/Feedback';
import Profile from './pages/student/Profile';

import OrganizerLayout from './pages/organizer/OrganizerLayout';
import OrganizerOverview from './pages/organizer/Overview';
import MyEvents from './pages/organizer/MyEvents';
import CreateEvent from './pages/organizer/CreateEvent';
import OrganizerRegistrations from './pages/organizer/Registrations';
import AttendanceScan from './pages/organizer/AttendanceScan';
import CertificateIssue from './pages/organizer/CertificateIssue';
import OrganizerAnalytics from './pages/organizer/Analytics';

import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/Overview';
import AdminUsers from './pages/admin/Users';
import PendingApprovals from './pages/admin/PendingApprovals';
import AllEvents from './pages/admin/AllEvents';
import GalleryModeration from './pages/admin/GalleryModeration';
import FeedbackModeration from './pages/admin/FeedbackModeration';
import Announcements from './pages/admin/Announcements';
import Reports from './pages/admin/Reports';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/events" element={<EventDiscovery />} />
          <Route path="/events/:slug" element={<EventDetails />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Student dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute roles={['participant', 'organizer', 'admin']}><StudentLayout /></ProtectedRoute>}>
            <Route index element={<StudentOverview />} />
            <Route path="discover" element={<EventDiscovery />} />
            <Route path="registrations" element={<MyRegistrations />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="saved" element={<SavedEvents />} />
            <Route path="feedback" element={<StudentFeedback />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Organizer dashboard */}
          <Route path="/organizer" element={<ProtectedRoute roles={['organizer', 'admin']}><OrganizerLayout /></ProtectedRoute>}>
            <Route index element={<OrganizerOverview />} />
            <Route path="events" element={<MyEvents />} />
            <Route path="create" element={<CreateEvent />} />
            <Route path="registrations" element={<OrganizerRegistrations />} />
            <Route path="attendance" element={<AttendanceScan />} />
            <Route path="certificates" element={<CertificateIssue />} />
            <Route path="analytics" element={<OrganizerAnalytics />} />
          </Route>

          {/* Admin dashboard */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="pending" element={<PendingApprovals />} />
            <Route path="events" element={<AllEvents />} />
            <Route path="gallery" element={<GalleryModeration />} />
            <Route path="feedback" element={<FeedbackModeration />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CopilotWidget />
    </div>
  );
}
