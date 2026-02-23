import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSharedCars, type SharedCar } from "../api/client";
import { useAuthContext } from "../auth/use-auth-context";
import { UserHeader } from "../components/ui/UserHeader";
import Button from "../components/ui/Button";

const FriendsPage: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [cars, setCars] = useState<SharedCar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    fetchSharedCars()
      .then((data) => setCars(data))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unknown error")
      )
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-lg">
        <UserHeader title="Friends" />
        <p className="text-slate-500">Sign in to see cars shared with friends.</p>
        <Button variant="primary" onClick={() => navigate("/login")}>
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg">
      <UserHeader title="Friends" />

      {loading && <p className="text-slate-500">Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && cars.length === 0 && (
        <p className="text-slate-500">No shared cars yet. Log more cars to find friends!</p>
      )}

      {!loading && !error && cars.length > 0 && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="min-w-full table-auto text-left">
              <thead className="bg-slate-100">
                <tr>
                  {["Car", "Shared with"].map((header) => (
                    <th
                      key={header}
                      className="px-3 py-2 text-base font-semibold text-slate-600"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cars.map((item) => (
                  <tr key={item.car} className="even:bg-slate-50">
                    <td className="px-3 py-2 text-xl text-slate-700 font-mono w-1/2">
                      {item.car}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {item.sharedWith.map((u) => (
                          <span
                            key={u.id}
                            className="text-xs font-medium bg-sky-100 text-sky-800 rounded-full px-2 py-0.5"
                          >
                            {u.username}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
