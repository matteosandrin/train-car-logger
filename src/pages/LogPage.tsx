import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useLogsContext } from '../logs-context';

const LogPage: React.FC = () => {
  const { logs } = useLogsContext();
  const navigate = useNavigate();

  const sortedLogs = useMemo(() => [...logs].sort((a, b) => b.timestamp - a.timestamp), [logs]);

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-4 pb-12 pt-6 md:px-6 md:pb-16 md:pt-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trip Log</h1>
        <Button
          variant="secondary"
          className="py-3"
          onClick={() => navigate('/')}
        >
          Close
        </Button>
      </div>

      <p className="text-base text-slate-300">Entries are stored on this device and ordered by most recent first.</p>

      {sortedLogs.length === 0 ? (
        <p className="text-center text-slate-300">No trips yet. Log your first train car!</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-slate-900/80 ring-1 ring-slate-400/20">
          <table className="min-w-full table-auto text-left">
            <thead className="bg-blue-900/35">
              <tr>
                <th className="px-6 py-4 text-base font-semibold text-slate-100">Timestamp</th>
                <th className="px-6 py-4 text-base font-semibold text-slate-100">Car</th>
                <th className="px-6 py-4 text-base font-semibold text-slate-100">Line</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.map((entry) => (
                <tr key={`${entry.timestamp}-${entry.car}-${entry.line}`} className="even:bg-slate-600/20">
                  <td className="px-6 py-4 text-base text-slate-100">
                    {new Date(entry.timestamp * 1000).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-base text-slate-100">{entry.car}</td>
                  <td className="px-6 py-4 text-base text-slate-100">{entry.line}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LogPage;
