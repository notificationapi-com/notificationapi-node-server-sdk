import { RetractRequest, SendRequest } from './interfaces';
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
        console.log('NotificationAPI request ignored.', {
          request: {
            method,
            uri,
            data
          },
          response: {
            status: res.status,
            data: res.data
          }
        });
      }
      return res;
    } catch (e) {
      console.error('NotificationAPI request error: ', e);
      throw e;
    }
  };
}

const notificationapi = new NotificationAPI();
export default notificationapi;
