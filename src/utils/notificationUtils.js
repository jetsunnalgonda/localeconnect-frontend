export function formatTime(createdAt) {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInSeconds = (now - notificationTime) / 1000;

    console.log('now', now);
    console.log('notificationTime', notificationTime);

    if (diffInSeconds < 5) return 'now';
    if (diffInSeconds < 60) return pluralize(Math.floor(diffInSeconds), 'second');
    if (diffInSeconds < 3600) return pluralize(Math.floor(diffInSeconds / 60), 'minute');
    if (diffInSeconds < 43200) return pluralize(Math.floor(diffInSeconds / 3600), 'hour');
    if (diffInSeconds < 86400) {
      return notificationTime.getDate() === now.getDate()
        ? pluralize(Math.floor(diffInSeconds / 3600), 'hour')
        : 'yesterday';
    }
    if (diffInSeconds < 604800) return pluralize(Math.floor(diffInSeconds / 86400), 'day');

    return notificationTime.toLocaleDateString();
  }

  function pluralize(value, unit) {
    return `${value} ${unit}${value !== 1 ? 's' : ''} ago`;
  }

  export function formatNotification(notification) {
    console.log('[formatNotification] Notification:', notification)
    switch (notification.type) {
      case 'LIKE':
        console.log('notification.extraInfo', notification.extraInfo)
        if (notification.extraInfo && notification.extraInfo.liker) {
          return `${notification.extraInfo.liker.name} liked your profile.`;
        } else {
          return `${notification.userName} liked your profile.`;
        }
      case 'UPDATE_LIKE_ID':
        console.log('Update Like ID message received')
        return `${notification.userName} liked your profile.`

      case 'message':
        if (notification.extraInfo && notification.extraInfo.sender) {
          return `You have a new message from ${notification.extraInfo.sender.name}.`;
        } else {
          return `You have a new message.`;
        }
      case 'follow':
        if (notification.extraInfo && notification.extraInfo.follower) {
          return `${notification.extraInfo.follower.name} started following you.`;
        } else {
          return `You have a new follower.`;
        }
      default:
        return `Notification: ${notification.referenceId}`;
    }
  }