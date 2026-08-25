import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ListChecks, ClipboardCheck, Image, MessageSquare, Megaphone, BarChart3 } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const LINKS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/pending', label: 'Pending Approvals', icon: ClipboardCheck },
  { to: '/admin/events', label: 'Events', icon: ListChecks },
  { to: '/admin/gallery', label: 'Gallery Moderation', icon: Image },
  { to: '/admin/feedback', label: 'Feedback Moderation', icon: MessageSquare },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function AdminLayout() {
  return <DashboardLayout title="Admin Dashboard" links={LINKS}><Outlet /></DashboardLayout>;
}
