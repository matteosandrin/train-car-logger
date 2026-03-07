import type { SharedFriend } from "../api/client";

export interface PendingNotificationResult {
  animationQueue: { line: string; friendName: string }[];
  notificationsToSend: { friendUserId: number; loggedCarId: number }[];
}

export function processPendingNotifications(friends: SharedFriend[]): PendingNotificationResult {
  const animationQueue: { line: string; friendName: string }[] = [];
  const notificationsToSend: { friendUserId: number; loggedCarId: number }[] = [];

  for (const friend of friends) {
    for (const { id, line, notified } of friend.cars) {
      if (!notified) {
        animationQueue.push({ line, friendName: friend.username });
        notificationsToSend.push({ friendUserId: friend.id, loggedCarId: id });
      }
    }
  }

  return { animationQueue, notificationsToSend };
}
