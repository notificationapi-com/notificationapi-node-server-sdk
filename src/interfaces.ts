import { KnownBlock } from '@slack/types';

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
  /** The user's timezone. Optional. */
  timezone?: string;
  /**
   * The destination channel of slack notifications sent to this user.
   * Can be either of the following:
   * - Channel name, e.g. "test"
   * - Channel name with # prefix, e.g. "#test"
   * - Channel ID, e.g. "C1234567890"
   * - User ID for DM, e.g. "U1234567890"
   * - Username with @ prefix, e.g. "@test"
   */
  slackChannel?: string;
  /** The user's Slack token (OAuth). Optional. */
  slackToken?: {
    access_token?: string;
    app_id?: string;
    authed_user?: {
      access_token?: string;
      expires_in?: number;
      id?: string;
      refresh_token?: string;
      scope?: string;
      token_type?: string;
    };
    bot_user_id?: string;
    enterprise?: {
      id?: string;
      name?: string;
    };
    error?: string;
    expires_in?: number;
    incoming_webhook?: {
      channel?: string;
      channel_id?: string;
      configuration_url?: string;
      url?: string;
    };
    is_enterprise_install?: boolean;
    needed?: string;
    ok?: boolean;
    provided?: string;
    refresh_token?: string;
    scope?: string;
    team?: {
      id?: string;
      name?: string;
    };
    token_type?: string;
    warning?: string;
  };
  /** The time the user was last updated. Optional. */
  updatedAt?: string;
  /** The time the user was created. Optional. */
  createdAt?: string;
}

export interface SendRequest {
  /**
   * @deprecated Use type instead
   */
  notificationId?: string;
  /**
   * @deprecated Use to instead
   */
  user?: User;
  /**
   * @deprecated Use parameters instead
   */
  mergeTags?: Record<string, unknown>;
  /**
   * @deprecated
   */
  replace?: Record<string, string>;

  /** The type of notification to send, previously NotificationId */
  type?: string;
  /** The recipient of the notification */
  to?: Partial<User>;
  /** Used to override the channels which are used for the notification. Optional.*/
  forceChannels?: Channels[];
  /** Parameters to be used in the notification template */
  parameters?: Record<string, unknown>;
  /**
   * @deprecated Use subNotificationId instead
   */
  secondaryId?: string;
  /** By default, notifications are sent using the default template of each channel. You can permanently change the default template from the dashboard. However, you can also use this parameter to force using a specific template. Optional.*/
  templateId?: string;
  /** The subNotificationId is used to specify further subcategories within a notification. Optional.*/
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
      /** A name that is displayed as the "from" field. Example: "Name <fromaddress>". Optional. */
      fromName?: string;
      /** An address that is displayed as the "from" field. Example: "Name <fromaddress>". Optional. */
      fromAddress?: string;
      /** An array of attachments that can be either URL-based or content-based.
       * URL-based: Publicly accessible URLs and filenames pointing to files. The URLs only need to be valid for a few minutes after calling the SDK method.  After that, the public URLs can be disabled for privacy. The maximum email size (including the content and all attachments) is 10MB.
       * Content-based: Direct content with filename and optional contentType.
       * File extensions in the filename property are necessary for the file to show up nicely in the recipient's device. Optional.*/
      attachments?: Array<
        | { filename: string; url: string }
        | { filename: string; content: string; contentType?: string }
      >;
      condition?: string;
    };
    apn?: {
      expiry?: number;
      priority?: number;
      collapseId?: string;
      threadId?: string;
      badge?: number;
      sound?: string;
      contentAvailable?: boolean;
    };
    fcm?: {
      android?: {
        collapseKey?: string;
        priority?: 'high' | 'normal';
        ttl?: number;
        restrictedPackageName?: string;
      };
    };
  };
  /** An ISO 8601 datetime string to schedule the notification for. For example, '2024-02-20T14:38:03.509Z' */
  schedule?: string;

  // Channel-specific options
  email?: {
    subject: string;
    html: string;
    previewText?: string;
    senderName?: string;
    senderEmail?: string;
  };
  inapp?: {
    title: string;
    url?: string;
    image?: string;
  };
  sms?: {
    message: string;
  };
  call?: {
    message: string;
  };
  web_push?: {
    title: string;
    message: string;
    icon?: string;
    url?: string;
  };
  mobile_push?: {
    title: string;
    message: string;
  };
  slack?: {
    text: string;
    blocks?: KnownBlock[];
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
  /** The ID of the notification in NotificationAPI. Required. */
  notificationId: string;
  /** The channel related to the userPreferences. Optional */
  channel?: string;
  /** The method for delivering the notification. Optional */
  delivery?: 'off' | 'instant' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  /** The subNotificationId is used to specify further subcategories within a notification. Optional */
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

/** Region enum defines the available API endpoints for different geographical regions:
 * - US_REGION: United States region endpoint (https://api.notificationapi.com)
 * - EU_REGION: European Union region endpoint (https://api.eu.notificationapi.com)
 * - CA_REGION: Canada region endpoint (https://api.ca.notificationapi.com)
 */
export enum Region {
  US_REGION = 'https://api.notificationapi.com',
  EU_REGION = 'https://api.eu.notificationapi.com',
  CA_REGION = 'https://api.ca.notificationapi.com'
}

/** To configure the SDK*/
export interface InitConfiguration {
  /** To update the base url. Optional. Can be a region constant or a custom URL string. */
  baseURL?: string | Region;
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
export interface InAppNotificationPatchRequest {
  trackingIds: string[];
  opened?: string;
  clicked?: string;
  archived?: string;
  actioned1?: string;
  actioned2?: string;
  reply?: {
    date: string;
    message: string;
  };
}
export interface queryLogsPostBody {
  /**
   * Filters logs by a specific date range. Optional.
   * The start and end times are represented as Unix timestamps.
   */
  dateRangeFilter?: {
    /**
     * The start time of the date range filter as a Unix timestamp. Optional.
     * Cannot be less than your log retention period.
     */
    startTime?: number;
    /** The end time of the date range filter as a Unix timestamp. Optional. */
    endTime?: number;
  };

  /**
   * Filters logs by specific notification IDs. Optional.
   * This allows you to retrieve logs for particular notifications.
   */
  notificationFilter?: string[];

  /**
   * Filters logs by specific channels. Optional.
   * This allows you to retrieve logs for certain channels like EMAIL, SMS, etc.
   */
  channelFilter?: Channels[];

  /**
   * Filters logs by specific user IDs. Optional.
   * This allows you to retrieve logs for particular users.
   */
  userFilter?: string[];

  /**
   * Filters logs by specific statuses. Optional.
   * This allows you to retrieve logs with particular statuses like sent, failed, etc.
   */
  statusFilter?: string[];

  /**
   * Filters logs by specific tracking IDs. Optional.
   * This allows you to retrieve logs for particular tracking events.
   */
  trackingIds?: string[];

  /**
   * Filters logs by specific body request of your send request. Optional.
   * This allows you to retrieve logs for particular requests.
   */
  requestFilter?: string[];

  /**
   * Filters logs by specific environment IDs. Optional.
   * This allows you to retrieve logs for particular environments.
   */
  envIdFilter?: string[];

  /**
   * A custom filter for querying logs. Optional.
   * This allows for more advanced and flexible querying of logs.
   * Note: custom filter overwrites all the filters.
   */
  customFilter?: string;
}
