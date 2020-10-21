import notificationapi from '../index';
import mockAxios from '../__mocks__/axios';

describe('init', () => {
  test('Init fails with empty clientId', () => {
    expect(() => notificationapi.init('', '123')).toThrow('Bad clientId');
  });

  test('Init fails with empty clientSecret', () => {
    expect(() => notificationapi.init('123', '')).toThrow('Bad clientSecret');
  });

  test('Init passes with non-empty client creds', () => {
    expect(() => notificationapi.init('123', '456')).not.toThrow();
  });
});

describe('send', () => {
  const notificationId = 'notifId';
  const user = {
    id: 'userId',
    email: 'test+node_server_sdk@notificationapi.com'
  };
  const mergeTags = { x: 'y' };
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';
  const cred = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  mockAxios.post.mockImplementationOnce(() =>
    Promise.resolve({
      data: {}
    })
  );

  test('send makes valid API call without mergeTags', () => {
    notificationapi.init(clientId, clientSecret);
    notificationapi.send(notificationId, user);
    expect(mockAxios.post).toHaveBeenCalledWith(
      `https://s4quar2657.execute-api.us-east-1.amazonaws.com/dev/${clientId}/sender`,
      {
        notificationId,
        user
      },
      {
        headers: {
          Authorization: 'Basic ' + cred
        }
      }
    );
  });

  test('send makes valid API call with mergeTags', () => {
    notificationapi.init(clientId, clientSecret);
    notificationapi.send(notificationId, user, { x: 'y' });
    expect(mockAxios.post).toHaveBeenCalledWith(
      `https://s4quar2657.execute-api.us-east-1.amazonaws.com/dev/${clientId}/sender`,
      {
        notificationId,
        user,
        mergeTags
      },
      {
        headers: {
          Authorization: 'Basic ' + cred
        }
      }
    );
  });

  afterAll(() => {
    expect(mockAxios.post).toHaveBeenCalledTimes(2);
  });
});
