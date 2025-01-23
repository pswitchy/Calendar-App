import { PushSubscription } from 'web-push';

export class NotificationService {
  static async requestPermission() {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async subscribeToPush() {
    if (!('serviceWorker' in navigator)) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }
}