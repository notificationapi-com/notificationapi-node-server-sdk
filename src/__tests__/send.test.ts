import { send } from '../index';

test('Basic test', () => {
  const notificationId = '123';
  const user = {
    id: '123',
    email: 'test+node_server_sdk@notificationapi.com'
  };
  expect(send(notificationId, user)).toEqual({ notificationId, user });
});
