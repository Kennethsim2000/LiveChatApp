import type { HelpRequest, Message } from "@prisma/client";
//import { Message } from "@prisma/client";
import type { RtmChannel, RtmMessage } from "agora-rtm-sdk";
import { useRef, useState } from "react";
import { api as trpc } from "../utils/api";
import { HelpPanel } from "./HelpPanel";
import Box from "./Box";

export const HelpWidget = () => {
  const utils = trpc.useContext();
  // const createHelpRequestMutation =
  //   trpc.helpRequest.createHelpRequest.useMutation();
  const deleteHelpRequestMutation =
    trpc.helpRequest.deleteHelpRequest.useMutation();

  const [isChatPanelDisplayed, setIsChatPanelDisplayed] = useState(false);
  const [text, setText] = useState(""); //this text is used to track the message to send to the server

  const channelRef = useRef<RtmChannel | null>(null); //We are using useRef because we want to keep track of this RtmChannel but we do not want to use state to prevent rerendering
  const helpRequestRef = useRef<HelpRequest | null>(null);

  /*On add, we automatically update the state */
  const { mutate: addMessage } = trpc.message.create.useMutation({
    onSuccess: async (data) => {
      utils.message.getMessagesByHelpRequestId.setData(
        helpRequestRef.current?.id || "",
        (oldData) => {
          console.log(oldData);
          return oldData?.concat(data);
        }
      );
      const channel = channelRef.current;
      const dataSent = JSON.stringify(data);
      console.log(dataSent);
      await channel?.sendMessage({ text: dataSent });
    },
  });

  const { mutate: createHelpRequest } =
    trpc.helpRequest.createHelpRequest.useMutation({
      onSuccess: (data) => {
        helpRequestRef.current = data;
        console.log(data);
      },
    });

  const { data: filteredData, refetch } =
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
    const helpRequest = createHelpRequest(); //here we obtain the helpRequest
    const { default: AgoraRTM } = await import("agora-rtm-sdk");
    const client = AgoraRTM.createInstance(process.env.NEXT_PUBLIC_AGORA_ID!);
    await client.login({
      //login does not require a token for authentication
      uid: `${Math.floor(Math.random() * 250)}`,
      token: undefined,
    });
    const channel2 = client.createChannel("default");
    await channel2.join();
    const str = "new Help Request";
    await channel2.sendMessage({ text: str }); //send message indicating new help Request
    console.log("code comes here");
    const channel = client.createChannel(
      helpRequestRef.current?.id || "default"
    );
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
    // await channel.sendMessage({ text: "new help request" });
    channel.on("ChannelMessage", (message: RtmMessage) => {
      //After receiving a message from the server, we need to refilter the messages
      console.log(message.text);
      let obj: Message;
      if (typeof message.text == "string") {
        obj = JSON.parse(message.text) as Message;
        console.log(obj);
      }
      if (helpRequestRef.current) {
        //setting state when it receives message
        const helpId = helpRequestRef.current.id;
        utils.message.getMessagesByHelpRequestId.setData(helpId, (oldData) => {
          if (oldData) {
            return [
              ...oldData,
              {
                id: obj.id,
                message: obj.message,
                isClient: false,
                helpRequestId: helpId,
              },
            ];
          }
        });
      }
    });
  };

  // function handleSendMessage(e: React.FormEvent<HTMLFormElement>): void {
  //   handleSendMessageAsync(e).catch((error) => {
  //     console.log(error);
  //   });
  // }
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // const channel = channelRef.current;
    // await channel?.sendMessage({ text });

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
      <Box handleOpenSupportWidget={handleOpenSupportWidget} />
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
    <>
      <Box handleOpenSupportWidget={handleOpenSupportWidget} />
    </>
  );
};
