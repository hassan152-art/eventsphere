import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Compass, ClipboardList, CalendarClock, QrCode,
  Award, Bookmark, Image, Bell, MessageSquare, User, Settings,
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const LINKS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/discover', label: 'Discover Events', icon: Compass },
  { to: '/dashboard/registrations', label: 'My Registrations', icon: ClipboardList },
  { to: '/dashboard/attendance', label: 'Attendance', icon: QrCode },
  { to: '/dashboard/certificates', label: 'Certificates', icon: Award },
  { to: '/dashboard/saved', label: 'Saved Events', icon: Bookmark },
  { to: '/dashboard/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function StudentLayout() {
  return (
    <DashboardLayout title="Student Dashboard" links={LINKS}>
      <Outlet />
    </DashboardLayout>
  );
}
