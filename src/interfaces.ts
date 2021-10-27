export interface User {
  id: string;
  email?: string;
  number?: string;
}

export interface SendRequest {
  notificationId: string;
  user: User;
  mergeTags?: Record<string, unknown>;
  forceChannels?: Channels[];
  secondaryId?: string; //It will be deprecated soon
  subNotificationId?: string;
  options?: {
    email?: {
      replyToAddresses?: string[];
      ccAddresses?: string[];
      bccAddresses?: string[];
      attachments?: { filename: string; url: string }[];
    };
  };
}

export interface RetractRequest {
  notificationId: string;
  userId: string;
  secondaryId?: string; //It will be deprecated soon
  subNotificationId?: string;
}
export interface CreateSubNotificationRequest {
  notificationId: string;
  title: string;
  subNotificationId: string;
}
export interface DeleteSubNotificationRequest {
  notificationId: string;
  subNotificationId: string;
}
export enum Channels {
  EMAIL = 'EMAIL',
  INAPP_WEB = 'INAPP_WEB',
  SMS = 'SMS',
  CALL = 'CALL'
}
