## Main Page

### Helpwidget

Contains [`HelpPanel`]() and [`Box`]()

#### Opening Widget: `handleOpenSupportWidget`

- Create an Agora instance.
- Establish connection to AgoraRTM channel(Default channel).
- Send a message across the channel to indicate the start of a new HelpRequest.
- Create a new Channel(HelpRequestId channel)
- Execute Post Request to simulate admin sending message over.
- Listen on channel for incoming messages.
- On receiving an incoming message from the admin, we update the local state of the messages that belong to the HelpRequest.

#### Sending Message: `handleSendMessage`

- Execute Post Request of message to database.
- Sends a message via the channel.

#### Closing Widget: `handleCloseWidget`

- Leave current channel.
- Delete HelpRequest.
- Create a GoodBye channel to send a Goodbye message.

### HelpPanel

Ui of the Chat Panel.

### Box

Ui of the buttons to connect.

## Admin Page

Page that allows admin to handle client Help Requests

#### On Page Render: `useEffect`

- Create an Agora instance.
- Establish connection to AgoraRTM channel(Default channel and GoodBye channel).
- Listen to the Default channel as well as the GoodBye channel in order to invalidate the HelpRequest after each creation/deletion of HelpRequest.

#### Clicking Help Request: `handleHelpRequestClicked`

- Leave any previous channel it was connected to.
- Establish connection to AgoraRTM channel(HelpRequestId).
- Listen on channel for incoming messages.
- Upon receiving an incoming Message, it will update its local state.

#### Sending Message: `handleSendMessage`

- Execute Post Request of message to database.
- Sends a message via the channel.

## **Database**

### **HelpRequest**

- One to Many relationship with Message(One HelpRequest can be linked to many Message)

### **Message**

- Message schema has a foreign key relation to HelpRequest(HelpRequestId references id of HelpRequest)
- isClient field to help identify the source of the Message.
