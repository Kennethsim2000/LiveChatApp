# Code documentation

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

# Pricing of WebSockets

## Agora

Information is retrieved from [here](https://www.agora.io/en/pricing/chat/)

|                             | Free        | Starter                                                       | Pro                                                           | Enterprise                                                                             |     |
| --------------------------- | ----------- | ------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --- |
| Pricing                     | Free        | Starting from $349, with additional $0.05/MAU beyond 5K MAU   | Starting from $699, with additional $0.05/MAU beyond 10K MAU  | Custom                                                                                 |
| Monthly Active users        | Up to 500   | Up to 50K                                                     | Up to 100K                                                    | Custom                                                                                 |
| Peak concurrent connections | 50 included | 10% of MAU included. $5/additional peak concurrent connection | 10% of MAU included. $5/additional peak concurrent connection | Customizable. 10% of MAU included by default. $5/additional peak concurrent connection |

## Pusher

Information is retrieved from [here](https://pusher.com/channels/pricing)

|                     | Messages per day | Concurrent connections |
| ------------------- | ---------------- | ---------------------- |
| SandboxFree         | 200k             | 100                    |
| Startup $49/month   | 1 million        | 500                    |
| Pro $99/month       | 4 million        | 2,000                  |
| Business $299/month | 10 million       | 5,000                  |
| Premium $499/month  | 20 million       | 10,000                 |
| Growth $699/month   | 40 million       | 15,000                 |

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?
