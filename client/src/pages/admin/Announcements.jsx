import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Megaphone,
  Trash2,
  RefreshCw,
  Send,
  Users,
  Globe,
  UserRound,
  CalendarDays,
} from 'lucide-react';

import { announcementService } from '../../services/userService';

const initialForm = {
  title: '',
  message: '',
  audience: 'Global',
  relatedEvent: '',
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);

      const response = await announcementService.list();

      setAnnouncements(response?.data?.announcements || []);
    } catch (error) {
      console.error('Failed to load announcements:', error);

      toast.error(
        error?.response?.data?.message ||
          'Could not load announcements'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Please enter an announcement title');
      return;
    }

    if (!form.message.trim()) {
      toast.error('Please enter an announcement message');
      return;
    }

    setSending(true);

    try {
      await announcementService.create({
        title: form.title.trim(),
        message: form.message.trim(),
        audience: form.audience,
        ...(form.relatedEvent.trim()
          ? { relatedEvent: form.relatedEvent.trim() }
          : {}),
      });

      toast.success('Announcement published successfully');

      setForm(initialForm);

      await loadAnnouncements();
    } catch (error) {
      console.error('Create announcement error:', error);

      toast.error(
        error?.response?.data?.message ||
          'Could not publish announcement'
      );
    } finally {
      setSending(false);
    }
  };

  const deactivate = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this announcement?'
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await announcementService.remove(id);

      toast.success('Announcement removed');

      await loadAnnouncements();
    } catch (error) {
      console.error('Remove announcement error:', error);

      toast.error(
        error?.response?.data?.message ||
          'Could not remove announcement'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getAudienceIcon = (audience) => {
    if (audience === 'Students') {
      return <UserRound size={16} />;
    }

    if (audience === 'Organizers') {
      return <Users size={16} />;
    }

    return <Globe size={16} />;
  };

  const getAudienceStyle = (audience) => {
    if (audience === 'Students') {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    }

    if (audience === 'Organizers') {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    }

    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">
            Announcements
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Publish important updates and notifications to users.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAnnouncements}
          disabled={loading}
          className="btn-secondary inline-flex items-center justify-center gap-2"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Create Announcement */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 grid place-items-center">
            <Megaphone size={19} />
          </div>

          <div>
            <h2 className="font-bold text-lg">
              Create Announcement
            </h2>

            <p className="text-xs text-slate-500">
              Send an announcement to the selected audience.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">

          {/* Title */}
          <div>
            <label className="label">
              Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter announcement title"
              className="input"
              maxLength={150}
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="label">
              Message
            </label>

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Write your announcement..."
              rows={5}
              className="input resize-none"
              maxLength={1000}
              required
            />

            <p className="text-xs text-slate-400 mt-1 text-right">
              {form.message.length}/1000
            </p>
          </div>

          {/* Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="label">
                Audience
              </label>

              <select
                name="audience"
                value={form.audience}
                onChange={handleChange}
                className="input"
              >
                <option value="Global">
                  Global - Everyone
                </option>

                <option value="Students">
                  Students
                </option>

                <option value="Organizers">
                  Organizers
                </option>
              </select>
            </div>

            {/* Related event */}
            <div>
              <label className="label">
                Related Event ID
                <span className="text-slate-400 font-normal">
                  {' '}
                  (optional)
                </span>
              </label>

              <input
                type="text"
                name="relatedEvent"
                value={form.relatedEvent}
                onChange={handleChange}
                placeholder="MongoDB Event ID"
                className="input"
              />
            </div>

          </div>

          {/* Selected audience preview */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-lg grid place-items-center ${getAudienceStyle(
                form.audience
              )}`}
            >
              {getAudienceIcon(form.audience)}
            </div>

            <div>
              <p className="text-sm font-semibold">
                {form.audience === 'Global'
                  ? 'All users'
                  : form.audience}
              </p>

              <p className="text-xs text-slate-500">
                {form.audience === 'Global'
                  ? 'Everyone will receive this announcement.'
                  : `${form.audience} will receive this announcement.`}
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={sending}
              className="btn-primary inline-flex items-center justify-center gap-2 min-w-[180px]"
            >
              {sending ? (
                <>
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                  Publishing...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Publish Announcement
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Announcement List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">
              Published Announcements
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              {announcements.length} announcement
              {announcements.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="card p-8 text-center">
            <RefreshCw
              size={24}
              className="animate-spin mx-auto text-brand-600"
            />

            <p className="text-sm text-slate-500 mt-3">
              Loading announcements...
            </p>
          </div>
        ) : announcements.length === 0 ? (
          /* Empty */
          <div className="card p-10 text-center">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-100 dark:bg-white/10 grid place-items-center text-slate-400">
              <Megaphone size={24} />
            </div>

            <h3 className="font-semibold mt-4">
              No announcements yet
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Create your first announcement using the form above.
            </p>
          </div>
        ) : (
          /* List */
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="card p-5"
              >
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div className="h-11 w-11 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 grid place-items-center shrink-0">
                    <Megaphone size={19} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                      <div>
                        <h3 className="font-bold text-base">
                          {announcement.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mt-2">

                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getAudienceStyle(
                              announcement.audience
                            )}`}
                          >
                            {getAudienceIcon(
                              announcement.audience
                            )}

                            {announcement.audience}
                          </span>

                          {announcement.createdAt && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                              <CalendarDays size={13} />

                              {new Date(
                                announcement.createdAt
                              ).toLocaleDateString()}
                            </span>
                          )}

                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() =>
                          deactivate(announcement._id)
                        }
                        disabled={
                          deletingId === announcement._id
                        }
                        className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 grid place-items-center transition"
                        title="Remove announcement"
                      >
                        {deletingId === announcement._id ? (
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>

                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 whitespace-pre-line leading-6">
                      {announcement.message}
                    </p>

                    {/* Related Event */}
                    {announcement.relatedEvent && (
                      <div className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/10">
                        <CalendarDays size={14} />

                        <span>
                          Related event:{' '}
                          <strong>
                            {announcement.relatedEvent.title ||
                              announcement.relatedEvent._id}
                          </strong>
                        </span>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}