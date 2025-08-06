export async function registerPushNotifications() {
  if (!('Notification' in window)) {
    alert('This browser does not support notifications.');
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function sendTestNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  } else {
    alert('Notifications are not enabled.');
  }
}