import type { HelpRequest } from "@prisma/client";
//import { Message } from "@prisma/client";
import type { RtmChannel, RtmMessage } from "agora-rtm-sdk";
import { useRef, useState } from "react";
import { api as trpc } from "../utils/api";
import { AiOutlineClose } from "react-icons/ai";
import { FiSend } from "react-icons/fi";
import { HelpPanel } from "./HelpPanel";

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
    <>
      <div className="flex-start">
        <h1 className="text-">Start a live chat</h1>
        <div> </div>
        <h1>Proceed to admin page</h1>
      </div>

      <HelpPanel
        text={text}
        setText={setText}
        filteredData={filteredData || []}
        handleSendMessage={handleSendMessage}
        setIsChatPanelDisplayed={setIsChatPanelDisplayed}
        handleCloseWidget={handleCloseWidget}
      />
    </>
  ) : (
    <button
      onClick={handleOpenSupportWidget}
      className="fixed bottom-10 right-10 cursor-pointer bg-blue-400 p-2 px-4 text-white hover:bg-blue-500"
    >
      Speak to our Support Team.
    </button>
  );
};
