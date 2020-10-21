import { User } from './interfaces';
import axios from 'axios';

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

  send = (
    notificationId: string,
    user: User,
    mergeTags?: Record<string, string>
  ): Promise<string> => {
    return axios.post(
      `https://s4quar2657.execute-api.us-east-1.amazonaws.com/dev/${this.clientId}/sender`,
      {
        notificationId: notificationId,
        user,
        mergeTags
      },
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
  };
}

const notificationapi = new NotificationAPI();
export default notificationapi;
