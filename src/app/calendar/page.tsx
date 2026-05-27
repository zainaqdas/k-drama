import { getCalendar } from '@/lib/server-data';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Release Schedule — WaveDrama',
  description: 'Check the upcoming release schedule for Asian dramas on WaveDrama.',
};

function formatDate(dateStr: string): string {
  // Try to parse and format nicely
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
  return dateStr;
}

function getWeekDay(dateStr: string): string {
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }
  return dateStr;
}

export default async function CalendarPage() {
  let calendarData: Awaited<ReturnType<typeof getCalendar>> = [];
  let error = false;

  try {
    calendarData = await getCalendar();
  } catch {
    error = true;
  }

  // Group by date
  const grouped: Record<string, typeof calendarData> = {};
  for (const item of calendarData) {
    const key = item.date || 'Upcoming';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  // Sort dates
  const sortedDates = Object.keys(grouped).sort((a, b) => {
    const da = new Date(a);
    const db = new Date(b);
    if (!isNaN(da.getTime()) && !isNaN(db.getTime())) return da.getTime() - db.getTime();
    return a.localeCompare(b);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-emerald-400 text-xs font-medium mb-4">
          <Calendar className="w-3.5 h-3.5" />
          Schedule
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
          Release Schedule
        </h1>
        <p className="text-gray-400 text-sm">
          Upcoming episode releases and schedule
        </p>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Could not load schedule.</p>
          <Link href="/" className="btn-primary inline-block mt-4">Go Home</Link>
        </div>
      ) : calendarData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No schedule data available.</div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date) => {
            const items = grouped[date];
            const weekDay = date && !isNaN(new Date(date).getTime())
              ? new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
              : '';

            return (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{formatDate(date)}</h2>
                    {weekDay && (
                      <p className="text-xs text-gray-500">{weekDay}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {items.map((item, i) => {
                    const slug = item.url.match(/\/drama-detail\/([^/]+)/)?.[1];
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-white/5 hover:border-emerald-500/20 transition-all card-hover"
                      >
                        <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                        {slug ? (
                          <Link
                            href={`/drama/${slug}`}
                            className="text-sm text-gray-300 hover:text-emerald-400 transition-colors line-clamp-1"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-300 line-clamp-1">
                            {item.title}
                          </span>
                        )}
                        <span className="ml-auto text-xs text-gray-500 shrink-0">{date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
