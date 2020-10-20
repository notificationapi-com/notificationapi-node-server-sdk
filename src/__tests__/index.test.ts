import notificationapi from '../index';
import mockAxios from '../__mocks__/axios';

describe('init', () => {
  test('Init fails with empty string', () => {
    expect(() => notificationapi.init('')).toThrow('Bad API Key');
  });

  test('Init passes with valid string', () => {
    expect(() => notificationapi.init('123')).not.toThrow();
  });
});

describe('send', () => {
  const notificationId = 'notifId';
  const user = {
    id: 'userId',
    email: 'test+node_server_sdk@notificationapi.com'
  };
  const mergeTags = { x: 'y' };
  const apiKey = 'apiKey';

  mockAxios.post.mockImplementationOnce(() =>
    Promise.resolve({
      data: {}
    })
  );

  test('send makes valid API call without mergeTags', () => {
    const n = notificationapi.init(apiKey);
    n.send(notificationId, user);
    expect(mockAxios.post).toHaveBeenCalledWith(
      'https://s4quar2657.execute-api.us-east-1.amazonaws.com/dev/wgKN4YQFFW0k8rxQx5vZ08nvZlm8NmB1/sender',
      {
        notificationId,
        user
      },
      {
        headers: {
          Authorization: 'Basic ' + apiKey
        }
      }
    );
  });

  test('send makes valid API call with mergeTags', () => {
    const n = notificationapi.init(apiKey);
    n.send(notificationId, user, { x: 'y' });
    expect(mockAxios.post).toHaveBeenCalledWith(
      'https://s4quar2657.execute-api.us-east-1.amazonaws.com/dev/wgKN4YQFFW0k8rxQx5vZ08nvZlm8NmB1/sender',
      {
        notificationId,
        user,
        mergeTags
      },
      {
        headers: {
          Authorization: 'Basic ' + apiKey
        }
      }
    );
  });

  afterAll(() => {
    expect(mockAxios.post).toHaveBeenCalledTimes(2);
  });
});
