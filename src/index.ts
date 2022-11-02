import {
  CreateSubNotificationRequest,
  DeleteSubNotificationRequest,
  InitConfiguration,
  RetractRequest,
  SendRequest,
  SetUserPreferencesRequest
} from './interfaces';
import axios, { AxiosResponse, Method } from 'axios';

const DEFAULT_BASE_URL = 'https://api.notificationapi.com';

class NotificationAPI {
  clientId: null | string = null;
  clientSecret: null | string = null;
  baseURL = DEFAULT_BASE_URL;

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
    userId: string,
    userPreferences: SetUserPreferencesRequest[]
  ): Promise<AxiosResponse> => {
    return this.request('POST', `user_preferences/${userId}`, userPreferences);
  };
  /** Used to api requests */
  request = async (
    method: Method,
    uri: string,
    data?: unknown
  ): Promise<AxiosResponse> => {
    try {
      const res = await axios.request({
        method,
        url: `${this.baseURL}/${this.clientId}/${uri}`,
        data,
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
              'base64'
            )
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
