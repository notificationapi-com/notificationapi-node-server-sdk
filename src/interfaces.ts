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
  secondaryId?: string;
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
  secondaryId?: string;
}
export enum Channels {
  EMAIL = 'EMAIL',
  INAPP_WEB = 'INAPP_WEB',
  SMS = 'SMS',
  INAPP_MOBILE = 'INAPP_MOBILE',
  DESKTOP_BROWSER = 'DESKTOP_BROWSER',
  MOBILE_PUSH = 'MOBILE_PUSH',
  SLACK = 'SLACK'
}
