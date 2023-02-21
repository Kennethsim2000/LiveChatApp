import { HelpRequest } from "@prisma/client";
import { RtmChannel, RtmMessage } from "agora-rtm-sdk";
import { useRef, useState } from "react";
import { api as trpc } from "../utils/api";

/*Sender is used to distinguish between client and server*/
export type TMessage = {
  message: string;
  id: string;
  sender: string;
};

export const HelpWidget = () => {
  const createHelpRequestMutation =
    trpc.helpRequest.createHelpRequest.useMutation();
  const deleteHelpRequestMutation =
    trpc.helpRequest.deleteHelpRequest.useMutation();
  const [isChatPanelDisplayed, setIsChatPanelDisplayed] = useState(false);
  const [senderId, setSenderId] = useState("0"); //setting the default senderId to 0 for clients
  const [text, setText] = useState(""); //this text is used to track the message to send to the server
  const [messages, setMessages] = useState<TMessage[]>([
    {
      message: "Hello, how can we help you today?",
      id: "fsdfdsf23",
      sender: "1",
    },
  ]);
  const channelRef = useRef<RtmChannel | null>(null); //We are using useRef because we want to keep track of this RtmChannel but we do not want to use state to prevent rerendering
  const helpRequestRef = useRef<HelpRequest | null>(null);

  /*This function handles the opening of the chatroom. */
  function handleOpenSupportWidget(): void {
    handleOpenSupportWidgetAsync().catch((error) => {
      console.log(error);
    });
  }

  /*This will help to create an agora instance. Create a channel, and listen to channel messages  */
  const handleOpenSupportWidgetAsync = async () => {
    setIsChatPanelDisplayed(true);
    const helpRequest = await createHelpRequestMutation.mutateAsync();
    const { default: AgoraRTM } = await import("agora-rtm-sdk");
    const client = AgoraRTM.createInstance(process.env.NEXT_PUBLIC_AGORA_ID!);
    await client.login({
      //login does not require a token for authentication
      uid: `${Math.floor(Math.random() * 250)}`,
      token: undefined,
    });
    helpRequestRef.current = helpRequest;
    const channel = client.createChannel(helpRequest.id);
    channelRef.current = channel;
    await channel.join();
    channel.on("ChannelMessage", (message: RtmMessage) => {
      /*We are listening to messages and everytime there is a message, we append to the state */
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: message.text ?? "",
          id: Math.random().toString() + "",
          sender: "1", //everytime we get a message coming in, we know it is from the admin
        },
      ]);
    });
  };

  // function handleSendMessage(e: React.FormEvent<HTMLFormElement>): void {
  //   handleSendMessageAsync(e).catch((error) => {
  //     console.log(error);
  //   });
  // }
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const channel = channelRef.current;
    await channel?.sendMessage({ text });
    setMessages((prevMessages) => [
      //we not gonna get a message back for the message we just send, so we need to append it manually
      ...prevMessages,
      {
        message: text,
        id: Math.random().toString() + "",
        sender: senderId,
      },
    ]);
    setText("");
  };

  const handleCloseWidget = async () => {
    setIsChatPanelDisplayed(false);
    await channelRef.current?.leave();
    channelRef.current = null;
    if (!helpRequestRef.current) return;
    await deleteHelpRequestMutation.mutateAsync({
      id: helpRequestRef.current?.id,
    });
    helpRequestRef.current = null;
  };

  return isChatPanelDisplayed ? (
    <div
      className="fixed bottom-10 right-10 
    flex h-96 w-72 flex-col justify-between bg-white p-6"
    >
      <button
        className="absolute top-2 right-2 hover:text-red-400 "
        onClick={handleCloseWidget}
      >
        X
      </button>

      <ul className="h-[400px] overflow-auto">
        {messages.map(({ message, id, sender }) => (
          <li
            className={`mb-2 rounded p-1 ${
              sender === senderId ? "bg-blue-200" : "bg-gray-200"
            }`}
            key={id}
          >
            {message}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSendMessage} className="flex">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-600 p-1 px-2"
        ></input>
        <button
          onClick={() => setIsChatPanelDisplayed(true)}
          className="cursor-pointer bg-blue-400 p-2 px-4 text-white hover:bg-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  ) : (
    <button
      onClick={handleOpenSupportWidgetAsync}
      className="fixed bottom-10 right-10 cursor-pointer bg-blue-400 p-2 px-4 text-white hover:bg-blue-500"
    >
      Speak to our Support Team.
    </button>
  );
};
