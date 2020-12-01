# Installation

```
npm install notificationapi-node-server-sdk
```

Warning:

Please note that this package is only intended for the server-side node.js framework.

# Usage

### 1. Import or require

```
import notificationapi from 'notificationapi-node-server-sdk'
```

or:

```
const notificationapi = require('notificationapi-node-server-sdk').default
```

### 2. Initialize

```
notificationapi.init(CLIENT_ID, CLIENT_SECRET)
```

You can get the clientId and clientSecret from the "API Keys" section of the dashboard.

### 3. Send a notification

##### Basic usage

```
notificationapi.send({
    notificationId: 'welcome-notification',
    user: {id: USER_ID, email: USER_EMAIL}
})
```

##### Merge Tags

If you are using {{mergeTags}} in your notifications, be sure to pass the actual values using the 3rd parameter. The example below replaces the `{{firstName}}` merge tag.

```
notificationapi.send({
    notificationId: 'welcome-notification'
    user: {id: USER_ID, email: USER_EMAIL},
    mergeTags: { firstName: 'Jane' }
})
```

##### Options

You can dynamically modify certain notification behavior by passing in options. Example:

```
notificationapi.send({
    notificationId: 'welcome-notification'
    user: {id: USER_ID, email: USER_EMAIL},
    options: {
        email: {
            replyToAddresses: ['replyto@test.com']
        }
    }
})
```

Available options:

- options.email.replyToAddresses: An array of email addresses to be used in the reply-to field of emails notifications.
- options.email.ccAddresses: An array of emails to be CC'ed on the email notifications.
- options.email.bccAddresses: An array of emails to be BCC'ed on the email notifications.
