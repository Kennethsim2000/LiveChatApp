import { HelpRequest } from "@prisma/client";
import { RtmChannel, RtmMessage } from "agora-rtm-sdk";
import type { NextPage } from "next";
import Head from "next/head";
import { setUncaughtExceptionCaptureCallback } from "process";
import { useEffect, useRef, useState } from "react";
import { ChatPanel } from "../components/ChatPanel";
import { TMessage } from "../components/HelpWidget";
import { api as trpc } from "../utils/api";

const AdminPage: NextPage = () => {
  const helpRequestsQuery = trpc.helpRequest.getHelpRequests.useQuery();
  const channelRef = useRef<RtmChannel | null>(null);
  const [messages, setMessages] = useState<TMessage[]>([]);
  /*Keep track of the text being sent to client  */
  const [text, setText] = useState("");

  /*Each time the id is clicked, this method will be called */
  const handleHelpRequestClicked = async (helpRequest: HelpRequest) => {
    setMessages([]);
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
    await channel.join();
    channel.on("ChannelMessage", (message: RtmMessage) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: message.text ?? "",
          id: Math.random().toString() + "",
          sender: "1",
        },
      ]);
    });
  };

  function handleSendMessage(e: React.FormEvent<HTMLFormElement>): void {
    handleSendMessageAsync(e).catch((error) => {
      console.log(error);
    });
  }
  /*Handle sending of the message */
  const handleSendMessageAsync = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const channel = channelRef.current;
    await channel?.sendMessage({ text });
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        message: text,
        id: Math.random().toString() + "",
        sender: "0",
      },
    ]);
    console.log(messages);
    setText("");
  };

  return (
    <>
      <Head>
        <title>Admin Page</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex min-h-screen flex-col p-4">
        <h1 className="text-xl">Admin Page</h1>

        <section className="flex gap-8">
          <div className="mb-2 rounded bg-white p-4">
            <h2 className="mb-2 text-xl text-blue-800">Help Request Ids</h2>
            <div className="flex flex-col gap-2">
              {helpRequestsQuery.data?.map((helpRequest) => (
                <button
                  className="hover:text-blue-400"
                  //onClick={() => handleHelpRequestClicked(helpRequest)}
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
            messages={messages}
            handleSendMessage={handleSendMessage}
          />
        </section>
      </main>
    </>
  );
};

export default AdminPage;
