export interface User {
  /** The ID of the user in your system. Required.*/
  id: string;
  /** Required for sending email notifications, otherwise optional.*/
  email?: string;
  /** Required for SMS/CALL notifications, otherwise optional. Valid format: +15005550006. Unformatted US/Canada numbers are also accepted, e.g., (415) 555-1212, 415-555-1212, or 4155551212.*/
  number?: string;
  /**Tokens which are required to send mobile push notifications, a user can have multiple devices and a push token is required for each device*/
  pushTokens?: PushToken[];
  /**Tokens which are required to send web push notification, a user can have multiple devices and a web push token is required for each device */
  webPushTokens?: WebPushToken[];
}

export interface SendRequest {
  /** The ID of the notification in NotificationAPI. Required.*/
  notificationId: string;
  /** The user to send the notification to. Required.*/
  user: User;
  /** Used to pass in dynamic values into the notification design. Optional.*/
  mergeTags?: Record<string, unknown>;
  /** Similar to mergeTags, but more flexible. Like the programmatic string replace function, this parameter will replace any string in the notification templates with another string. This operation happens on the fly when sending the notification and does not actually modify the templates. This operation is case-sensitive and happens after mergeTags are injected. Optional.*/
  replace?: Record<string, string>;
  /** Used to override the channels which are used for the notification. Optional.*/
  forceChannels?: Channels[];
  /** It will be deprecated soon.*/
  secondaryId?: string; //It will be deprecated soon
  /**An ISO 8601 datetime string to schedule the notification for. For example, '2024-02-20T14:38:03.509Z' */
  schedule?: string;
  /** By default, notifications are sent using the default template of each channel. You can permanently change the default template from the dashboard. However, you can also use this parameter to force using a specific template. Optional.*/
  templateId?: string;
  /**  The subNotificationId is used to specify further subcategories within a notification. Optional.*/
  subNotificationId?: string;
  /** You can dynamically modify certain notification behavior by passing in options. Optional.*/
  options?: {
    /** Options related to the email channel. Optional.*/
    email?: {
      /** An array of email addresses to be used in the reply-to field of emails notifications. Optional.*/
      replyToAddresses?: string[];
      /** An array of emails to be CC'ed on the email notifications. Optional.*/
      ccAddresses?: string[];
      /** An array of emails to be BCC'ed on the email notifications. Optional.*/
      bccAddresses?: string[];
      /** An array of publicly accessible URLs and filenames pointing to files that you wish to include as attachments.
       * The URLs only need to be valid for a few minutes after calling the SDK method. After that, the public URLs can be disabled for privacy. The maximum email size (including the content and all attachments) is 10MB.
       * File extensions in the filename property are necessary for the file to show up nicely in the recipient's device. Optional.*/
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
  /** The ID of the notification in NotificationAPI. Required.*/
  notificationId: string;
  /** The ID of the user in your system. Required.*/
  userId: string;
  /** It will be deprecated soon.*/
  secondaryId?: string; //It will be deprecated soon
  /**  The subNotificationId is used to specify further subcategories within a notification. Optional.*/
  subNotificationId?: string;
}
export interface CreateSubNotificationRequest {
  /** The ID of the notification in NotificationAPI. Required.*/
  notificationId: string;
  /** The title of the subNotificationId. Required.*/
  title: string;
  /**  The subNotificationId is used to specify further subcategories within a notification. Required.*/
  subNotificationId: string;
}
export interface DeleteSubNotificationRequest {
  /** The ID of the notification in NotificationAPI. Required.*/
  notificationId: string;
  /**  The subNotificationId is used to specify further subcategories within a notification. Required.*/
  subNotificationId: string;
}
export interface SetUserPreferencesRequest {
  /** The ID of the notification in NotificationAPI. Required.*/
  notificationId: string;
  /** The channel related to the userPreferences. Required.*/
  channel: Channels;
  /** Determines the . Required.*/
  state: boolean;
  /**  The subNotificationId is used to specify further subcategories within a notification. Required.*/
  subNotificationId?: string;
}
/** Supporting notification Channels.*/
export enum Channels {
  EMAIL = 'EMAIL',
  INAPP_WEB = 'INAPP_WEB',
  SMS = 'SMS',
  CALL = 'CALL',
  PUSH = 'PUSH',
  WEB_PUSH = 'WEB_PUSH'
}
/** To configure the SDK*/
export interface InitConfiguration {
  /** To updated the based url. Optional.*/
  baseURL?: string;
}

export interface PushToken {
  /**[apn | fcm] The provider token is to be associated with. */
  type: PushProviders;
  /**The full token string. */
  token: string;
  /**Information about the device the token is associated with. */
  device: Device;
}

export enum PushProviders {
  /**firebase-fcm token provider */
  FCM = 'FCM',
  /**APN token provider */
  APN = 'APN'
}

export interface Device {
  /**Id of the application the token is used for */
  app_id?: string;
  /**Id of the advertising identifier */
  ad_id?: string;
  /**Id of the device the token is associated with */
  device_id: string;
  /**The device platform i.e. android, ios*/
  platform?: string;
  /**The device manufacturer */
  manufacturer?: string;
  /**The device model */
  model?: string;
}

/**
 * Configuration for a Push Subscription. This can be obtained on the frontend by calling
 * serviceWorkerRegistration.pushManager.subscribe().
 * The expected format is the same output as JSON.stringify'ing a PushSubscription in the browser.
 */
export interface PushSubscription {
  /**a string value containing the endpoint associated with the push subscription. */
  endpoint: string;
  keys: {
    /**An Elliptic curve Diffie–Hellman public key on the P-256 curve (that is, the NIST secp256r1 elliptic curve). The resulting key is an uncompressed point in ANSI X9.62 format. */
    p256dh: string;
    /**An authentication secret, as described in Message Encryption for Web Push. */
    auth: string;
  };
}
export interface WebPushToken {
  sub: PushSubscription;
}
