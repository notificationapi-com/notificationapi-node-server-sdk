import mockConsole from 'jest-mock-console';
jest.unmock('axios');
import axios from 'axios';
import notificationapi from '../notificationapi';
import MockAdapter from 'axios-mock-adapter';
import {
  Channels,
  CreateSubNotificationRequest,
  DeleteSubNotificationRequest,
  InAppNotificationPatchRequest,
  queryLogsPostBody,
  PushProviders,
  SendRequest,
  SetUserPreferencesRequest,
  User,
  Region
} from '../interfaces';
import { createHmac } from 'crypto';

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
    expect(axiosMock.history.post[0].headers?.['Authorization']).toEqual(
      'Basic ' + cred
    );
  });

  test.each([
    ['send', { notificationId, user }],
    ['retract', { notificationId, userId: user.id }]
  ])('given 202, %s logs', async (func, params) => {
    axiosMock.onPost().reply(202, {
      messages: ['some warning']
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
      to: user,
      type: notificationId
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/sender`
    );
  });

  test('given a custom api, uses the custom api', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret, {
      baseURL: 'https://www.test.com'
    });
    await notificationapi.send({
      to: user,
      type: notificationId
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].url).toEqual(
      `https://www.test.com/${clientId}/sender`
    );
  });

  test('includes given notificationId and user in the request body', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      to: user,
      type: notificationId
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      type: notificationId,
      to: user
    });
  });

  test('includes mergetags in the request body', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    const mergeTags = { x: 'y' };
    await notificationapi.send({
      to: user,
      type: notificationId,
      mergeTags
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data).mergeTags).toEqual(
      mergeTags
    );
  });

  test('includes replace in the request body', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    const replace = { x: 'y' };
    await notificationapi.send({
      to: user,
      type: notificationId,
      replace
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data).replace).toEqual(replace);
  });

  test('includes secondaryId in the request body', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      to: user,
      type: notificationId,
      secondaryId: 'secondary'
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data).secondaryId).toEqual(
      'secondary'
    );
  });

  test('includes templateId in the request body', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      to: user,
      type: notificationId,
      templateId: 'templateId'
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data).templateId).toEqual(
      'templateId'
    );
  });
  test('includes schedule in the request body', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    const schedule = new Date().toISOString();
    await notificationapi.send({
      to: user,
      type: notificationId,
      schedule
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data).schedule).toEqual(
      schedule
    );
  });
  test('includes subNotificationId in the request body', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      to: user,
      type: notificationId,
      subNotificationId: 'subNotificationId'
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(
      JSON.parse(axiosMock.history.post[0].data).subNotificationId
    ).toEqual('subNotificationId');
  });

  test('includes forceChannels in the request body', async () => {
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      to: user,
      type: notificationId,
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
            filename: 'Inapp_image_sample',
            url: 'https://notificationapi.com'
          }
        ]
      }
    };
    axiosMock.onPost(sendEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      to: user,
      type: notificationId,
      options: emailOptions
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data).options).toEqual(
      emailOptions
    );
  });
});
describe('queryLogs', () => {
  const queryLogsEndPointRegex = /.*\/logs\/query/;
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';

  test('makes API calls to the correct end-point, non custom', async () => {
    const nonCostumeQuery: queryLogsPostBody = {
      dateRangeFilter: { startTime: 1715904000000, endTime: 1718668799999 },
      notificationFilter: ['test'],
      channelFilter: [Channels.CALL],
      userFilter: ['test+node_server_sdk@notificationapi.com'],
      statusFilter: ['FAILURE'],
      trackingIds: ['e2d6987f-52c'],
      envIdFilter: [clientId]
    };
    axiosMock.onPost(queryLogsEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.queryLogs(nonCostumeQuery);
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/logs/query`
    );
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual(nonCostumeQuery);
  });
  test('makes API calls to the correct end-point, custom', async () => {
    const nonCostumeQuery: queryLogsPostBody = {
      dateRangeFilter: { startTime: 1715904000000, endTime: 1718668799999 },
      customFilter:
        'fields @message| filter @logStream like /NotificationsSummary/| sort @timestamp desc'
    };
    axiosMock.onPost(queryLogsEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.queryLogs(nonCostumeQuery);
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/logs/query`
    );
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual(nonCostumeQuery);
  });
});

describe('retract by secondaryId', () => {
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
describe('retract by subNotificationId', () => {
  const retractEndPointRegex = /.*\/sender\/retract/;
  const notificationId = 'notificationId';
  const userId = 'userId';
  const subNotificationId = 'subNotificationId';
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

  test('includes subNotificationId in the request body', async () => {
    axiosMock.onPost(retractEndPointRegex).reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.retract({
      notificationId,
      userId,
      subNotificationId
    });
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      notificationId,
      userId,
      subNotificationId
    });
  });
});
describe('createSubNotification by subNotificationId', () => {
  const retractEndPointRegex = /.*\/notifications\/.*\/subNotifications\/.*/;
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';
  const params: CreateSubNotificationRequest = {
    notificationId: 'notificationId',
    title: 'subNotificationTitle',
    subNotificationId: 'subNotificationId'
  };
  test('makes API calls to the correct end-point', async () => {
    axiosMock.onPut(retractEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.createSubNotification(params);
    expect(axiosMock.history.put).toHaveLength(1);
    expect(axiosMock.history.put[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/notifications/${params.notificationId}/subNotifications/${params.subNotificationId}`
    );
    expect(axiosMock.history.put[0].data).toEqual(
      JSON.stringify({
        title: params.title
      })
    );
  });
});
describe('deleteSubNotification by subNotificationId', () => {
  const retractEndPointRegex = /.*\/notifications\/.*\/subNotifications\/.*/;
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';
  const params: DeleteSubNotificationRequest = {
    notificationId: 'notificationId',
    subNotificationId: 'subNotificationId'
  };
  test('makes API calls to the correct end-point', async () => {
    axiosMock.onDelete(retractEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.deleteSubNotification(params);
    expect(axiosMock.history.delete).toHaveLength(1);
    expect(axiosMock.history.delete[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/notifications/${params.notificationId}/subNotifications/${params.subNotificationId}`
    );
  });
});
describe('updateSchedule by trackingId', () => {
  const updateScheduleEndPointRegex = /.*\/schedule/;
  const trackingId = 'trackingId';
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';
  const mergeTags = { x: 'y' };
  const sendRequest: Partial<SendRequest> = {
    mergeTags,
    schedule: '2024-02-20T14:38:03.509Z'
  };
  test('makes API calls to the correct end-point', async () => {
    axiosMock.onPatch(updateScheduleEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.updateSchedule(trackingId, sendRequest);
    expect(axiosMock.history.patch).toHaveLength(1);
    expect(axiosMock.history.patch[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/schedule/${trackingId}`
    );
    expect(axiosMock.history.patch[0].data).toEqual(
      JSON.stringify(sendRequest)
    );
  });
});
describe('deleteSchedule by trackingId', () => {
  const deleteScheduleEndPointRegex = /.*\/schedule/;
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';
  const trackingId = 'trackingId';
  test('makes API calls to the correct end-point', async () => {
    axiosMock.onDelete(deleteScheduleEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.deleteSchedule(trackingId);
    expect(axiosMock.history.delete).toHaveLength(1);
    expect(axiosMock.history.delete[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/schedule/${trackingId}`
    );
  });
});

describe('setUserPreferences with notificationId only', () => {
  const retractEndPointRegex = /.*\/user_preferences\/.*/;
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';
  const userId = 'testUserId';
  const userPreferences: SetUserPreferencesRequest[] = [
    {
      notificationId: 'notificationId'
    }
  ];
  test('makes API calls to the correct end-point', async () => {
    axiosMock.onPost(retractEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.setUserPreferences(userId, userPreferences);
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/user_preferences/${userId}`
    );
  });
  test('makes API calls with a correct request body', async () => {
    axiosMock.onPost(retractEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.setUserPreferences(userId, userPreferences);
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].data).toEqual(
      JSON.stringify(userPreferences)
    );
  });
});
describe('setUserPreferences with notificationId and delivery', () => {
  const retractEndPointRegex = /.*\/user_preferences\/.*/;
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';
  const userId = 'testUserId';
  const userPreferences: SetUserPreferencesRequest[] = [
    {
      notificationId: 'notificationId',
      delivery: 'weekly'
    }
  ];
  test('makes API calls to the correct end-point', async () => {
    axiosMock.onPost(retractEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.setUserPreferences(userId, userPreferences);
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/user_preferences/${userId}`
    );
  });
  test('makes API calls with a correct request body', async () => {
    axiosMock.onPost(retractEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.setUserPreferences(userId, userPreferences);
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].data).toEqual(
      JSON.stringify(userPreferences)
    );
  });
});
describe('setUserPreferences without subNotificationId', () => {
  const retractEndPointRegex = /.*\/user_preferences\/.*/;
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';
  const userId = 'testUserId';
  const userPreferences: SetUserPreferencesRequest[] = [
    {
      notificationId: 'notificationId',
      channel: Channels.EMAIL
    }
  ];
  test('makes API calls to the correct end-point', async () => {
    axiosMock.onPost(retractEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.setUserPreferences(userId, userPreferences);
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/user_preferences/${userId}`
    );
  });
  test('makes API calls with a correct request body', async () => {
    axiosMock.onPost(retractEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.setUserPreferences(userId, userPreferences);
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].data).toEqual(
      JSON.stringify(userPreferences)
    );
  });
});

describe('setUserPreferences with subNotificationId', () => {
  const retractEndPointRegex = /.*\/user_preferences\/.*/;
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';
  const userId = 'testUserId';
  const userPreferences: SetUserPreferencesRequest[] = [
    {
      notificationId: 'notificationId',
      channel: Channels.EMAIL,
      subNotificationId: 'subNotificationId'
    }
  ];
  test('makes API calls with a correct request body', async () => {
    axiosMock.onPost(retractEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.setUserPreferences(userId, userPreferences);
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].data).toEqual(
      JSON.stringify(userPreferences)
    );
  });
});

describe('deleteUserPreferences without subNotificationId', () => {
  const retractEndPointRegex = /.*\/users\/.*/;
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';
  const userId = 'testUserId';
  const notificationId = 'testNotificationId';
  const hashedUserId = `${createHmac('sha256', clientSecret)
    .update(userId)
    .digest('base64')}`;

  test('makes API calls to the correct end-point', async () => {
    axiosMock.onDelete(retractEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.deleteUserPreferences(userId, notificationId);
    expect(axiosMock.history.delete).toHaveLength(1);
    expect(axiosMock.history.delete[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/users/${userId}/preferences`
    );
    expect(axiosMock.history.delete[0].params).toEqual({ notificationId });
    expect(axiosMock.history.delete[0].headers?.Authorization).toEqual(
      'Basic ' +
        Buffer.from(`${clientId}:${userId}:${hashedUserId}`).toString('base64')
    );
  });
});
describe('deleteUserPreferences with subNotificationId', () => {
  const retractEndPointRegex = /.*\/users\/.*/;
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';
  const userId = 'testUserId';
  const notificationId = 'testNotificationId';
  const subNotificationId = 'testSubNotificationId';
  const hashedUserId = `${createHmac('sha256', clientSecret)
    .update(userId)
    .digest('base64')}`;

  test('makes API calls to the correct end-point', async () => {
    axiosMock.onDelete(retractEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.deleteUserPreferences(
      userId,
      notificationId,
      subNotificationId
    );
    expect(axiosMock.history.delete).toHaveLength(1);
    expect(axiosMock.history.delete[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/users/${userId}/preferences`
    );
    expect(axiosMock.history.delete[0].params).toEqual({
      notificationId,
      subNotificationId
    });
    expect(axiosMock.history.delete[0].headers?.Authorization).toEqual(
      'Basic ' +
        Buffer.from(`${clientId}:${userId}:${hashedUserId}`).toString('base64')
    );
  });
});
describe('updateInAppNotification without subNotificationId', () => {
  const retractEndPointRegex = /.*\/users\/.*/;
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';
  const userId = 'testUserId';
  const hashedUserId = `${createHmac('sha256', clientSecret)
    .update(userId)
    .digest('base64')}`;
  const params: Required<InAppNotificationPatchRequest> = {
    trackingIds: ['testTrackingId'],
    opened: '1970-01-01T00:00:00.000Z',
    clicked: '1970-01-01T00:00:00.000Z',
    archived: '1970-01-01T00:00:00.000Z',
    actioned1: '1970-01-01T00:00:00.000Z',
    actioned2: '1970-01-01T00:00:00.000Z',
    reply: { date: '1970-01-01T00:00:00.000Z', message: 'nice!' }
  };

  test('makes API calls to the correct end-point', async () => {
    axiosMock.onPatch(retractEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.updateInAppNotification(userId, params);
    expect(axiosMock.history.patch).toHaveLength(1);
    expect(axiosMock.history.patch[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/users/${userId}/notifications/INAPP_WEB`
    );
    expect(axiosMock.history.patch[0].params).toEqual(undefined);
    expect(axiosMock.history.patch[0].headers?.Authorization).toEqual(
      'Basic ' +
        Buffer.from(`${clientId}:${userId}:${hashedUserId}`).toString('base64')
    );
  });
});
describe('Identify user', () => {
  const userEndPointRegex = /.*\/users\/.*/;
  const clientId = 'testClientId_identify_user';
  const clientSecret = 'testClientSecret_identify_user';
  const userId = 'testUserId_identify_user';
  const user: User = {
    id: userId,
    email: 'test+node_server_sdk@notificationapi.com',
    number: '+15005550006',
    pushTokens: [
      {
        type: PushProviders.FCM,
        token: 'samplePushToken',
        device: {
          app_id: 'sample_app_id',
          ad_id: 'sample_ad_id',
          device_id: 'sample_device_id',
          platform: 'sample_platform',
          manufacturer: 'sample_manufacturer',
          model: 'sample_model'
        }
      }
    ],
    webPushTokens: [
      {
        sub: {
          endpoint: 'sample_endpoint',
          keys: {
            p256dh: 'sample_p256dh',
            auth: 'sample_auth'
          }
        }
      }
    ]
  };
  test('makes API calls with a correct request body', async () => {
    axiosMock.onPost(userEndPointRegex).reply(200);
    await notificationapi.init(clientId, clientSecret);
    await notificationapi.identifyUser(user);
    const { id, ...userData } = user;
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].data).toEqual(JSON.stringify(userData));
    expect(axiosMock.history.post[0].url).toEqual(
      `https://api.notificationapi.com/${clientId}/users/${id}`
    );
    expect(axiosMock.history.post[0].headers?.Authorization).toEqual(
      `Basic ${Buffer.from(
        `${clientId}:${userId}:${createHmac('sha256', clientSecret)
          .update(`${userId}`)
          .digest('base64')}`
      ).toString('base64')}`
    );
  });
});

describe('region configuration', () => {
  const clientId = 'testClientId';
  const clientSecret = 'testClientSecret';

  test('uses US region by default', async () => {
    axiosMock.onAny().reply(200);
    notificationapi.init(clientId, clientSecret);
    await notificationapi.send({
      to: { id: 'test' },
      type: 'test'
    });
    expect(axiosMock.history.post[0].url).toEqual(
      `${Region.US_REGION}/${clientId}/sender`
    );
  });

  test('uses EU region when specified', async () => {
    axiosMock.onAny().reply(200);
    notificationapi.init(clientId, clientSecret, { baseURL: Region.EU_REGION });
    await notificationapi.send({
      to: { id: 'test' },
      type: 'test'
    });
    expect(axiosMock.history.post[0].url).toEqual(
      `${Region.EU_REGION}/${clientId}/sender`
    );
  });

  test('uses CA region when specified', async () => {
    axiosMock.onAny().reply(200);
    notificationapi.init(clientId, clientSecret, { baseURL: Region.CA_REGION });
    await notificationapi.send({
      to: { id: 'test' },
      type: 'test'
    });
    expect(axiosMock.history.post[0].url).toEqual(
      `${Region.CA_REGION}/${clientId}/sender`
    );
  });

  test('uses custom URL when specified', async () => {
    const customUrl = 'https://custom.notificationapi.com';
    axiosMock.onAny().reply(200);
    notificationapi.init(clientId, clientSecret, { baseURL: customUrl });
    await notificationapi.send({
      to: { id: 'test' },
      type: 'test'
    });
    expect(axiosMock.history.post[0].url).toEqual(
      `${customUrl}/${clientId}/sender`
    );
  });
});
