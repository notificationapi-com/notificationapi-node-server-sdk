import mockConsole from 'jest-mock-console';
jest.unmock('axios');
import axios from 'axios';
import notificationapi from '../index';
import MockAdapter from 'axios-mock-adapter';

const axiosMock = new MockAdapter(axios);
const restoreConsole = mockConsole();

beforeEach(() => {
  axiosMock.reset();
});

afterAll(() => {
  axiosMock.restore();
  restoreConsole();
});

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
  const sendEndPointRegex = /.*\/sender/;
  const notificationId = 'notifId';
  const user = {
    id: 'userId',
    email: 'test+node_server_sdk@notificationapi.com'
  };
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';

  test('Returns a Promise<AxiosResponse>', async () => {
    axiosMock.onAny().reply(200);
    notificationapi.init(clientId, clientSecret);
    const promise = notificationapi.send({
      user,
      notificationId
    });
    expect(promise).toBeInstanceOf(Promise);
  });

  test('makes one POST API call', async () => {
    axiosMock.onAny().reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      user,
      notificationId
    });
    expect(axiosMock.history.post).toHaveLength(1);
  });

  test('makes API calls with basic authorization', async () => {
    const cred = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      user,
      notificationId
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].headers['Authorization']).toEqual(
      'Basic ' + cred
    );
  });

  test('makes API calls to the correct end-point', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      user,
      notificationId
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/sender`
    );
  });

  test('includes given notificationId and user in the request body', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      user,
      notificationId
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      notificationId,
      user
    });
  });

  test('includes mergetags in the request body', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    const mergeTags = { x: 'y' };
    await notificationapi.send({
      notificationId,
      user,
      mergeTags
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data).mergeTags).toEqual(
      mergeTags
    );
  });

  test('includes secondaryId the request body', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      notificationId,
      user,
      secondaryId: 'secondary'
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data).secondaryId).toEqual(
      'secondary'
    );
  });

  test('includes email options in the request body', async () => {
    const emailOptions = {
      email: {
        bccAddresses: ['test@test.com'],
        ccAddresses: ['test@test.com'],
        replyToAddresses: ['test@test.com']
      }
    };
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      notificationId,
      user,
      options: emailOptions
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data).options).toEqual(
      emailOptions
    );
  });

  test('given 202 http status, it logs', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(202, {
      message: "it's not 200"
    });
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      notificationId,
      user
    });
    expect(console.log).toHaveBeenCalled();
  });

  test('given 500 http status, it logs and throws', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(500, {
      message: 'big oof 500'
    });
    notificationapi.init(clientId, clientSecret);
    expect(
      notificationapi.send({
        notificationId,
        user
      })
    ).rejects.toEqual(new Error('Request failed with status code 500'));
    expect(console.log).toHaveBeenCalled();
  });
});
