import { Outlet } from 'react-router-dom';
import { LayoutDashboard, CalendarPlus, ListChecks, Users, QrCode, Award, BarChart3 } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const LINKS = [
  { to: '/organizer', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/organizer/events', label: 'My Events', icon: ListChecks },
  { to: '/organizer/create', label: 'Create Event', icon: CalendarPlus },
  { to: '/organizer/registrations', label: 'Registrations', icon: Users },
  { to: '/organizer/attendance', label: 'Attendance', icon: QrCode },
  { to: '/organizer/certificates', label: 'Certificates', icon: Award },
  { to: '/organizer/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function OrganizerLayout() {
  return <DashboardLayout title="Organizer Dashboard" links={LINKS}><Outlet /></DashboardLayout>;
}
