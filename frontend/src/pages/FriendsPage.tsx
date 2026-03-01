import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSharedFriends, postNotifications, type SharedFriend } from "../api/client";
import { assetUrl } from "../assets";
import { useAuthContext } from "../auth/use-auth-context";
import { UserHeader } from "../components/ui/UserHeader";
import Button from "../components/ui/Button";
import CarExplosion from "../components/effects/CarExplosion";

const FriendsPage: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<SharedFriend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animationQueue, setAnimationQueue] = useState<{ line: string; friendName: string }[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    fetchSharedFriends()
      .then((data) => {
        setFriends(data);
        const pending = [];
        const notifications = [];
        for (const friend of data) {
          for (const { id, line, notified } of friend.cars) {
            if (!notified) {
              pending.push({ line, friendName: friend.username });
              notifications.push({ friendUserId: friend.id, loggedCarId: id });
            }
          }
        }
        if (pending.length > 0) setAnimationQueue(pending);
        if (notifications.length > 0) postNotifications(notifications);
      })
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

      {!loading && !error && friends.length === 0 && (
        <p className="text-slate-500">
          No shared cars yet. When friends log the same cars as you, they'll appear here.
        </p>
      )}

      {!loading && !error && friends.length > 0 && (
        <div className="flex flex-col gap-3">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-lg font-semibold shrink-0">
                  {friend.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{friend.username}</p>
                  <p className="text-sm text-slate-500">
                    {friend.cars.length} car{friend.cars.length !== 1 ? "s" : ""} in common
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {friend.cars.map(({ id, car, line }) => (
                  <span
                    key={id}
                    className="font-mono text-sm font-medium bg-slate-100 text-slate-700 rounded-lg px-2 py-1 flex items-center gap-1.5"
                  >
                    <img className="w-4 h-4" src={assetUrl(`/img/${line}.svg`)} />
                    {car}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {animationQueue.length > 0 && (
        <CarExplosion
          kind="shared"
          key={animationQueue[0].line + animationQueue[0].friendName}
          line={animationQueue[0].line}
          friendName={animationQueue[0].friendName}
          onComplete={() => setAnimationQueue((q) => q.slice(1))}
        />
      )}
    </div>
  );
};

export default FriendsPage;
