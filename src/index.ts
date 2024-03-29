import {
  CreateSubNotificationRequest,
  DeleteSubNotificationRequest,
  InitConfiguration,
  RetractRequest,
  SendRequest,
  SetUserPreferencesRequest,
  User
} from './interfaces';
import axios, { AxiosResponse, Method } from 'axios';
import { createHmac } from 'crypto';

const DEFAULT_BASE_URL = 'https://api.notificationapi.com';

class NotificationAPI {
  clientId: null | string = null;
  clientSecret: null | string = null;
  baseURL = DEFAULT_BASE_URL;
  /** To configure and initialize the the SDK*/
  init = (
    clientId: string,
    clientSecret: string,
    config?: InitConfiguration
  ): void => {
    if (!clientId) {
      throw 'Bad clientId';
    }

    if (!clientSecret) {
      throw 'Bad clientSecret';
    }

    if (config?.baseURL) {
      this.baseURL = config.baseURL;
    } else {
      this.baseURL = DEFAULT_BASE_URL;
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
  };
  /** used to identify your user */
  identifyUser = async (user: User): Promise<AxiosResponse> => {
    const { id, ...userData } = user;
    const hashedUserId = `${createHmac('sha256', this.clientSecret as string)
      .update(id)
      .digest('base64')}`;

    const customAuthorization =
      'Basic ' +
      Buffer.from(`${this.clientId}:${id}:${hashedUserId}`).toString('base64');

    return this.request(
      'POST',
      `users/${encodeURIComponent(id)}`,
      userData,
      customAuthorization
    );
  };
  /** Used to send a notification to the specified user. */
  send = async (sendRequest: SendRequest): Promise<AxiosResponse> => {
    return this.request('POST', 'sender', sendRequest);
  };
  /** Un-sending or deleting notifications: Sometimes you need older notifications to be deleted for a certain user. For example when a notification is not valid anymore. The retract function helps you do this. */
  retract = async (retractRequest: RetractRequest): Promise<AxiosResponse> => {
    return this.request('POST', 'sender/retract', retractRequest);
  };
  /** Used to create a subNotification of a specified notification. */
  createSubNotification = async (
    params: CreateSubNotificationRequest
  ): Promise<AxiosResponse> => {
    return this.request(
      'PUT',
      `notifications/${params.notificationId}/subNotifications/${params.subNotificationId}`,
      { title: params.title }
    );
  };
  /** Used to delete a subNotification from a specified notification. */
  deleteSubNotification = async (
    params: DeleteSubNotificationRequest
  ): Promise<AxiosResponse> => {
    return this.request(
      'DELETE',
      `notifications/${params.notificationId}/subNotifications/${params.subNotificationId}`
    );
  };
  /** Used to set notification preferences from a specified user. */
  setUserPreferences = async (
    /** The ID of the user in your system. Required.*/
    userId: string,
    /** An array of preferences fo the user. Required.*/
    userPreferences: SetUserPreferencesRequest[]
  ): Promise<AxiosResponse> => {
    return this.request('POST', `user_preferences/${userId}`, userPreferences);
  };
  /** Used to to update a scheduled notification. */
  updateSchedule = async (
    trackingId: string,
    sendRequest: Partial<SendRequest>
  ) => {
    return this.request('PATCH', `schedule/${trackingId}`, sendRequest);
  };
  /** Used to to delete a scheduled notification. */
  deleteSchedule = async (trackingId: string) => {
    return this.request('DELETE', `schedule/${trackingId}`);
  };
  /** A generic function for sending any requests to NotificationAPI.*/
  request = async (
    method: Method,
    uri: string,
    data?: unknown,
    customAuthorization?: string
  ): Promise<AxiosResponse> => {
    const authorization: string =
      customAuthorization ??
      'Basic ' +
        Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    try {
      const res = await axios.request({
        method,
        url: `${this.baseURL}/${this.clientId}/${uri}`,
        data,
        headers: {
          Authorization: authorization
        }
      });
      if (res.status === 202) {
        console.log('NotificationAPI warning.', res.data);
      }
      return res;
    } catch (e) {
      console.error('NotificationAPI error.', e);
      throw e;
    }
  };
}

const notificationapi = new NotificationAPI();
export default notificationapi;
