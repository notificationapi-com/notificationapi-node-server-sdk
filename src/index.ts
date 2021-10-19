import {
  CreateSubNotification,
  RetractRequest,
  SendRequest
} from './interfaces';
import axios, { AxiosResponse, Method } from 'axios';

class NotificationAPI {
  clientId: null | string = null;
  clientSecret: null | string = null;
  init = (clientId: string, clientSecret: string): void => {
    if (!clientId) {
      throw 'Bad clientId';
    }

    if (!clientSecret) {
      throw 'Bad clientSecret';
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
  };

  send = async (sendRequest: SendRequest): Promise<AxiosResponse> => {
    return this.request('POST', 'sender', sendRequest);
  };

  retract = async (retractRequest: RetractRequest): Promise<AxiosResponse> => {
    return this.request('POST', 'sender/retract', retractRequest);
  };
  createSubNotification = async (
    params: CreateSubNotification
  ): Promise<AxiosResponse> => {
    return this.request(
      'PUT',
      `notifications/${params.notificationId}/subNotifications/${params.subNotificationId}`,
      { title: params.title }
    );
  };

  request = async (
    method: Method,
    uri: string,
    data: unknown
  ): Promise<AxiosResponse> => {
    try {
      const res = await axios.request({
        method,
        url: `https://api.notificationapi.com/${this.clientId}/${uri}`,
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
