export interface User {
  id: string;
  email?: string;
  number?: string;
}

export interface SendRequest {
  /** The ID of the notification in NotificationAPI. */
  notificationId: string;
  /** The user to send the notification to. */
  user: User;
  /** Used to pass in dynamic values into the notification design.*/
  mergeTags?: Record<string, unknown>;
  /** Similar to mergeTags, but more flexible. Like the programmatic string replace function, this parameter will replace any string in the notification templates with another string. This operation happens on the fly when sending the notification and does not actually modify the templates. This operation is case-sensitive and happens after mergeTags are injected. */
  replace?: Record<string, string>;
  /** Used to override the channels which are used for the notification.*/
  forceChannels?: Channels[];
  /** Deprecated */
  secondaryId?: string; //It will be deprecated soon
  /** By default, notifications are sent using the default template of each channel. You can permanently change the default template from the dashboard. However, you can also use this parameter to force using a specific template.*/
  templateId?: string;
  /**  The subNotificationId is used to specify further subcategories within a notification.*/
  subNotificationId?: string;
  /** You can dynamically modify certain notification behavior by passing in options.*/
  options?: {
    /** Options related to the email channel*/
    email?: {
      /** An array of email addresses to be used in the reply-to field of emails notifications.*/
      replyToAddresses?: string[];
      /** An array of emails to be CC'ed on the email notifications.*/
      ccAddresses?: string[];
      /** An array of emails to be BCC'ed on the email notifications.*/
      bccAddresses?: string[];
      /** An array of publicly accessible URLs and filenames pointing to files that you wish to include as attachments.
       * The URLs only need to be valid for a few minutes after calling the SDK method. After that, the public URLs can be disabled for privacy. The maximum email size (including the content and all attachments) is 10MB.
       * File extensions in the filename property are necessary for the file to show up nicely in the recipient's device.*/
      attachments?: {
        /** File extensions in the filename property are necessary for the file to show up nicely in the recipient's device.*/
        filename: string;
        /** The URLs only need to be valid for a few minutes after calling the SDK method. After that, the public URLs can be disabled for privacy. The maximum email size (including the content and all attachments) is 10MB.*/
        url: string;
      }[];
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
export interface SetUserPreferencesRequest {
  notificationId: string;
  channel: Channels;
  state: boolean;
  subNotificationId?: string;
}
export enum Channels {
  EMAIL = 'EMAIL',
  INAPP_WEB = 'INAPP_WEB',
  SMS = 'SMS',
  CALL = 'CALL'
}

export interface InitConfiguration {
  baseURL?: string;
}
