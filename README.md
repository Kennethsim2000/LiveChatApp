## Main Page

### Helpwidget

Contains [`HelpPanel`]() and [`Box`]()

#### Opening Widget: `handleOpenSupportWidget`

- Establish connection to AgoraRTM channel.
- Execute Post Request to simulate admin sending message over.
- Listen on channel for incoming messages.

#### Sending Message: `handleSendMessage`

- Sends a message via the channel.
- Execute Post Request of message to database.

#### Closing Widget: `handleCloseWidget`

- Leave channel.
- Delete HelpRequest.

### HelpPanel

Ui of the Chat Panel.

### Box

Ui of the buttons to connect.

## Admin Page

Page that allows admin to handle client Help Requests

#### Clicking Help Request: `handleHelpRequestClicked`

- Establish connection to AgoraRTM channel.
- Listen on channel for incoming messages.

#### Sending Message: `handleSendMessage`

- Sends a message via the channel.
- Execute Post Request of message to database.

## **Database**

### **HelpRequest**

Used to indicate that a user has opened the chat Widget

### **Message**

Messages sent between Client and Admin.
