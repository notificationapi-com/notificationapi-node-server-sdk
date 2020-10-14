import { User } from './interfaces';

export const send = (
  notificationId: string,
  user: User,
  mergeTags?: Record<string, string>
): {
  notificationId: string;
  user: User;
  mergeTags?: Record<string, string>;
} => {
  return {
    notificationId,
    user,
    mergeTags
  };
};
