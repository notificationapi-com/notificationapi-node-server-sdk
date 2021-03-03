import { SendRequest } from './interfaces';
import axios, { AxiosResponse } from 'axios';

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
    try {
      const res = await axios.post(
        `https://api.notificationapi.com/${this.clientId}/sender`,
        sendRequest,
        {
          headers: {
            Authorization:
              'Basic ' +
              Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
                'base64'
              )
          }
        }
      );
      if (res.status === 202) {
        console.log('NotificationAPI request ignored.', {
          request: sendRequest,
          response: res.data
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
