import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useLogsContext } from '../logs-context';
import { assetUrl } from '../assets';

const LogPage: React.FC = () => {
  const { logs } = useLogsContext();
  const navigate = useNavigate();

  const sortedLogs = useMemo(() => [...logs].sort((a, b) => b.timestamp - a.timestamp), [logs]);

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Log</h1>
        <Button
          variant="pill"
          onClick={() => navigate('/')}
        >
          Close
        </Button>
      </div>

      <p className="text-base text-slate-600">Entries are stored on this device and ordered by most recent first.</p>

      {sortedLogs.length === 0 ? (
        <p className="text-slate-600">No trips yet. Log your first train car!</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="min-w-full table-auto text-left">
            <thead className="bg-slate-200">
              <tr>
                { ["Date", "Car", "Line"].map(header => (
                  <th className="px-3 py-2 md:px-6 md:py-4 text-base font-semibold text-slate-600">{header}</th>
                )) }
              </tr>
            </thead>
            <tbody>
              {sortedLogs.map((entry) => {
                const rowClasses = "px-3 py-2 md:px-6 md:py-4 text-base text-slate-700";
                return (
                  <tr key={`${entry.timestamp}-${entry.car}-${entry.line}`} className="even:bg-slate-50">
                    <td className={rowClasses}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className={rowClasses}>{entry.car}</td>
                    <td className={rowClasses}><img className="w-8 aspect-square" src={assetUrl(`/img/${entry.line}.svg`)}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LogPage;
