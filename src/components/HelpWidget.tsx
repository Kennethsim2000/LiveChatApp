import type { HelpRequest } from "@prisma/client";
//import { Message } from "@prisma/client";
import type { RtmChannel, RtmMessage } from "agora-rtm-sdk";
import { useRef, useState } from "react";
import { api as trpc } from "../utils/api";

/*Sender is used to distinguish between client and server*/
export type TMessage = {
  message: string;
  id: string;
  sender: string;
};

export const HelpWidget = () => {
  const utils = trpc.useContext();
  const createHelpRequestMutation =
    trpc.helpRequest.createHelpRequest.useMutation();
  const deleteHelpRequestMutation =
    trpc.helpRequest.deleteHelpRequest.useMutation();

  const [isChatPanelDisplayed, setIsChatPanelDisplayed] = useState(false);
  const [text, setText] = useState(""); //this text is used to track the message to send to the server

  const channelRef = useRef<RtmChannel | null>(null); //We are using useRef because we want to keep track of this RtmChannel but we do not want to use state to prevent rerendering
  const helpRequestRef = useRef<HelpRequest | null>(null);

  /*On add, we automatically update the state */
  const { mutate: addMessage } = trpc.message.create.useMutation({
    onSuccess: (data) => {
      utils.message.getMessagesByHelpRequestId.setData(
        helpRequestRef.current?.id || "",
        (oldData) => {
          console.log(oldData);
          return oldData?.concat(data);
        }
      );
    },
  });

  // async function emulateFetch() {
  //   await refetch();
  //   return filteredData;
  // }

  // function emulateFetch() {
  //   // refetch().catch(() => console.log("1"));
  //   void refetch();
  // }

  const { data: filteredData } =
    trpc.message.getMessagesByHelpRequestId.useQuery(
      helpRequestRef.current?.id || "",
      {
        enabled: helpRequestRef.current?.id ? true : false, // set `enabled` to `false` initially
      }
    );

  /*This function handles the opening of the chatroom. */
  function handleOpenSupportWidget(): void {
    handleOpenSupportWidgetAsync().catch((error) => {
      console.log(error);
    });
  }

  /*This will help to create an agora instance. Create a channel, and listen to channel messages  */
  const handleOpenSupportWidgetAsync = async () => {
    setIsChatPanelDisplayed(true);
    const helpRequest = await createHelpRequestMutation.mutateAsync(); //here we obtain the helpRequest
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
    //Add the first message from the server to the database.
    if (helpRequestRef.current) {
      addMessage({
        id: helpRequestRef.current?.id,
        message: "Hello, how can we help you today?",
        isClient: false,
      });
    }
    channel.on("ChannelMessage", (message: RtmMessage) => {
      //After receiving a message from the server, we need to refilter the messages
      console.log(message);
    });
  };

  function handleSendMessage(e: React.FormEvent<HTMLFormElement>): void {
    handleSendMessageAsync(e).catch((error) => {
      console.log(error);
    });
  }
  const handleSendMessageAsync = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const channel = channelRef.current;
    await channel?.sendMessage({ text });

    if (helpRequestRef.current) {
      addMessage({
        //used to do a post request containing the message, helpRequest id, and boolean stating that it is from client.
        id: helpRequestRef.current?.id,
        message: text,
        isClient: true,
      });
    }

    setText("");
  };

  function handleCloseWidget(): void {
    handleCloseWidgetAsync().catch((error) => {
      console.log(error);
    });
  }
  const handleCloseWidgetAsync = async () => {
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
      className="h-120 fixed bottom-0 
    right-10 flex w-80 flex-col justify-between bg-white p-6"
    >
      <button
        className="absolute top-2 right-2 hover:text-red-400 "
        onClick={handleCloseWidget}
      >
        X
      </button>
      {/* here i only want to render those messages whose id matches with requestId */}
      <ul className="h-[400px] overflow-auto">
        {filteredData?.map((singleMessage) => (
          <li
            className={`mb-2 rounded p-1 ${
              singleMessage.isClient ? "bg-blue-200" : "bg-gray-200"
            }`}
            key={singleMessage.id}
          >
            {singleMessage.message}
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
      onClick={handleOpenSupportWidget}
      className="fixed bottom-10 right-10 cursor-pointer bg-blue-400 p-2 px-4 text-white hover:bg-blue-500"
    >
      Speak to our Support Team.
    </button>
  );
};
