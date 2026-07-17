import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Task } from '../types/task';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('Must use a physical device for push notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return finalStatus === 'granted';
}

// Two reminders per task with a due date: 1 day before, 1 hour before.
// Returns the scheduled notification IDs so they can be canceled later.
export async function scheduleTaskReminders(task: Task): Promise<string[]> {
  if (!task.dueDate) return [];

  const due = new Date(task.dueDate);
  const now = new Date();
  const ids: string[] = [];

  const oneDayBefore = new Date(due.getTime() - 24 * 60 * 60 * 1000);
  const oneHourBefore = new Date(due.getTime() - 60 * 60 * 1000);

  if (oneDayBefore > now) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task due tomorrow',
        body: task.title,
      },
      trigger:{
        type: SchedulableTriggerInputTypes.DATE,
        date: oneDayBefore,
      }
    });
    ids.push(id);
  }

  if (oneHourBefore > now) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task due in 1 hour',
        body: task.title,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: oneHourBefore,
      }
    });
    ids.push(id);
  }

  return ids;
}

export async function cancelTaskReminders(notificationIds: string[]): Promise<void> {
  await Promise.all(notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}