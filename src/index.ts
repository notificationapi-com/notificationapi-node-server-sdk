import { User } from './interfaces';
import axios from 'axios';

const init = (
  apiKey: string
): {
  send: (
    notificationId: string,
    user: User,
    mergeTags?: Record<string, string>
  ) => Promise<string>;
} => {
  if (!apiKey) {
    throw 'Bad API Key';
  }

  // TODO: Create client wrapper
  const send = (
    notificationId: string,
    user: User,
    mergeTags?: Record<string, string>
  ): Promise<string> => {
    return axios.post(
      'https://s4quar2657.execute-api.us-east-1.amazonaws.com/dev/wgKN4YQFFW0k8rxQx5vZ08nvZlm8NmB1/sender',
      {
        notificationId: notificationId,
        user,
        mergeTags
      },
      {
        headers: {
          Authorization: 'Basic ' + apiKey
        }
      }
    );
  };

  return {
    send
  };
};

export default {
  init
};
