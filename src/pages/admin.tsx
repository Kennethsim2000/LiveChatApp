import type { HelpRequest, Message } from "@prisma/client";
import type { RtmChannel, RtmMessage } from "agora-rtm-sdk";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { ChatPanel } from "../components/ChatPanel";
import { api as trpc } from "../utils/api";

const AdminPage: NextPage = () => {
  const utils = trpc.useContext();

  const { data: helpRequestQuery, isLoading } =
    trpc.helpRequest.getHelpRequests.useQuery();
  const channelRef = useRef<RtmChannel | null>(null);
  const [helpRequestRef, sethelpRequestRef] = useState<HelpRequest | null>(
    null
  );
  const helpRequestRef2 = useRef<HelpRequest | null>(null);
  const defaultChannel = useRef<RtmChannel | null>(null);
  // const helpRequestRef = useState<HelpRequest | null>(null);

  useEffect(() => {
    async function setupAgora() {
      const { default: AgoraRTM } = await import("agora-rtm-sdk");
      const client = AgoraRTM.createInstance(process.env.NEXT_PUBLIC_AGORA_ID!);
      await client.login({
        uid: `${Math.floor(Math.random() * 250)}`,
        token: undefined,
      });
      const channel2 = client.createChannel("default");
      await channel2.join();
      console.log("successfully joined");
      channel2.on("ChannelMessage", async (message: RtmMessage) => {
        console.log(message.text);
        await utils.helpRequest.getHelpRequests.invalidate();
        // helpRequestsQuery = trpc.helpRequest.getHelpRequests.useQuery();
        console.log("successfully updated");
      });
    }
    setupAgora().catch(() => {
      console.log("error");
    });
  }, []);

  /*Keep track of the text being sent to client  */
  const [text, setText] = useState("");

  const { data: filteredData } =
    trpc.message.getMessagesByHelpRequestId.useQuery(helpRequestRef?.id || "", {
      enabled: helpRequestRef?.id ? true : false, // set `enabled` to `false` initially
    });

  const { mutate: addMessage } = trpc.message.create.useMutation({
    onSuccess: async (data) => {
      utils.message.getMessagesByHelpRequestId.setData(
        helpRequestRef?.id || "",
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

  /*Each time the id is clicked, this method will be called */
  const handleHelpRequestClicked = async (helpRequest: HelpRequest) => {
    if (channelRef.current) {
      await channelRef.current.leave();
      channelRef.current = null;
    }
    const { default: AgoraRTM } = await import("agora-rtm-sdk");
    const client = AgoraRTM.createInstance(process.env.NEXT_PUBLIC_AGORA_ID!);
    await client.login({
      uid: `${Math.floor(Math.random() * 250)}`,
      token: undefined,
    });
    const channel = client.createChannel(helpRequest.id);
    channelRef.current = channel;
    sethelpRequestRef(helpRequest); //Whenever we click on the id, we set the new helpRequest
    helpRequestRef2.current = helpRequest;
    await channel.join();
    channel.on("ChannelMessage", (message: RtmMessage) => {
      //everytime a message comes in, do nothing, as the client would have made a post request
      console.log(message);
      let obj: Message;
      if (typeof message.text == "string") {
        obj = JSON.parse(message.text) as Message;
        console.log(obj);
      }
      console.log(helpRequestRef2);
      if (helpRequestRef2.current) {
        //setting state when it receives message
        const helpId = helpRequestRef2.current.id;
        utils.message.getMessagesByHelpRequestId.setData(helpId, (oldData) => {
          if (oldData) {
            return [
              ...oldData,
              {
                id: obj.id,
                message: obj.message,
                isClient: true,
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
  /*Handle sending of the message */
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (helpRequestRef) {
      //after message is posted to the database, message is sent over channel
      addMessage({
        //used to do a post request containing the message, helpRequest id, and boolean stating that it is from client.
        id: helpRequestRef?.id,
        message: text,
        isClient: false,
      });
      setText("");
    }
  };

  return (
    <>
      <Head>
        <title>Admin Page</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex  flex-col p-4">
        <h1 className="text-xl">Admin Page</h1>

        <section className="flex h-[90vh] gap-8 ">
          <div className="mb-2 rounded bg-white p-4">
            <h2 className="mb-2 text-xl text-blue-800">Help Request Ids</h2>
            <div className="flex flex-col gap-2">
              {helpRequestQuery?.map((helpRequest) => (
                <button
                  className="hover:text-blue-400"
                  onClick={() => {
                    handleHelpRequestClicked(helpRequest).catch((err) => {
                      console.log(err);
                    });
                  }}
                  key={helpRequest.id}
                >
                  {helpRequest.id}
                </button>
              ))}
            </div>
          </div>
          <ChatPanel
            text={text}
            setText={setText}
            messages={filteredData || []}
            handleSendMessage={handleSendMessage}
          />
        </section>
      </main>
    </>
  );
};

export default AdminPage;
