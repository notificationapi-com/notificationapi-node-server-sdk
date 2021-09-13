import mockConsole from 'jest-mock-console';
jest.unmock('axios');
import axios from 'axios';
import notificationapi from '../index';
import MockAdapter from 'axios-mock-adapter';
import { Channels, SendRequest, User } from '../interfaces';

const axiosMock = new MockAdapter(axios);
const restoreConsole = mockConsole();

beforeEach(() => {
  axiosMock.reset();
  mockConsole();
});

afterEach(() => {
  restoreConsole();
});

afterAll(() => {
  axiosMock.restore();
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

describe('common API behavior', () => {
  const notificationId = 'notifId';
  const user: User = {
    id: 'userId',
    email: 'test+node_server_sdk@notificationapi.com',
    number: '08310000'
  };
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';

  test.each([
    ['send', { notificationId, user }],
    ['retract', { notificationId, userId: user.id }]
  ])('%s returns a Promise<AxiosResponse>', async (func, params) => {
    axiosMock.onAny().reply(200);
    notificationapi.init(clientId, clientSecret);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const promise = notificationapi[func](params);
    expect(promise).toBeInstanceOf(Promise);
  });

  test.each([
    ['send', { notificationId, user }],
    ['retract', { notificationId, userId: user.id }]
  ])('%s makes one POST API call', async (func, params) => {
    axiosMock.onAny().reply(200);
    notificationapi.init(clientId, clientSecret);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await notificationapi[func](params);
    expect(axiosMock.history.post).toHaveLength(1);
  });

  test.each([
    ['send', { notificationId, user }],
    ['retract', { notificationId, userId: user.id }]
  ])('%s makes API calls with basic authorization', async (func, params) => {
    const cred = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    axiosMock.onPost().reply(200);
    notificationapi.init(clientId, clientSecret);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await notificationapi[func](params);
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].headers['Authorization']).toEqual(
      'Basic ' + cred
    );
  });

  test.each([
    ['send', { notificationId, user }],
    ['retract', { notificationId, userId: user.id }]
  ])('given 202 http status, %s logs', async (func, params) => {
    axiosMock.onPost().reply(202, {
      message: "it's not 200"
    });
    notificationapi.init(clientId, clientSecret);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await notificationapi[func](params);
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['send', { notificationId, user }],
    ['retract', { notificationId, userId: user.id }]
  ])('given 500 http status, %s logs', (func, params) => {
    axiosMock.onPost().reply(500, {
      message: 'big oof 500'
    });
    notificationapi.init(clientId, clientSecret);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return notificationapi[func](params).catch(() => {
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  test.each([
    ['send', { notificationId, user }],
    ['retract', { notificationId, userId: user.id }]
  ])('given 500 http status, %s throws', async (func, params) => {
    axiosMock.onPost().reply(500, {
      message: 'big oof 500'
    });
    notificationapi.init(clientId, clientSecret);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(notificationapi[func](params)).rejects.toEqual(
      new Error('Request failed with status code 500')
    );
  });
});

describe('send', () => {
  const sendEndPointRegex = /.*\/sender/;
  const notificationId = 'notifId';
  const user: User = {
    id: 'userId',
    email: 'test+node_server_sdk@notificationapi.com',
    number: '08310000'
  };
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';

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

  test('includes secondaryId in the request body', async () => {
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
  test('includes forceChannels in the request body', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      notificationId,
      user,
      forceChannels: [Channels.EMAIL]
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data).forceChannels).toEqual([
      Channels.EMAIL
    ]);
  });
  test('includes email options in the request body', async () => {
    const emailOptions: SendRequest['options'] = {
      email: {
        bccAddresses: ['test@test.com'],
        ccAddresses: ['test@test.com'],
        replyToAddresses: ['test@test.com'],
        attachments: [
          {
            name: 'Inapp_image_sample',
            url: 'https://notificationapi.com'
          }
        ]
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
});

describe('retract', () => {
  const retractEndPointRegex = /.*\/sender\/retract/;
  const notificationId = 'notificationId';
  const userId = 'userId';
  const secondaryId = 'secondaryId';
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';

  test('makes API calls to the correct end-point', async () => {
    axiosMock.onPost(retractEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.retract({
      userId,
      notificationId
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/sender/retract`
    );
  });

  test('includes given notificationId and userId in the request body', async () => {
    axiosMock.onPost(retractEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.retract({
      userId,
      notificationId
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      notificationId,
      userId
    });
  });

  test('includes secondaryId in the request body', async () => {
    axiosMock.onPost(retractEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.retract({
      notificationId,
      userId,
      secondaryId
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      notificationId,
      userId,
      secondaryId
    });
  });
});
