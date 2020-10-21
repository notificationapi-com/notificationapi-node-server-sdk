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

### 3. Identify the user and send them a notification

```
notificationapi.send(
    NOTIFICATION_ID,
    {id: USER_ID, email: USER_EMAIL}
)
```

If you are using {{mergeTags}} in your notifications, be sure to pass the actual values using the 3rd parameter. The example below replaces the `{{firstName}}` merge tag.

```
notificationapi.send(
    NOTIFICATION_ID,
    {id: USER_ID, email: USER_EMAIL},
    { firstName: USER_FIRST_NAME }
)
```
