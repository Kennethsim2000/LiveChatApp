import type { Message } from "@prisma/client";
import React, { useEffect, useRef } from "react";

export const ChatPanel = ({
  handleSendMessage,
  text,
  setText,
  messages,
}: {
  handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  text: string;
  setText: (newText: string) => void;
  messages: Message[];
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("code comes to useEffect");
    console.log(messagesEndRef.current);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); //use messages

  return (
    <div className="w-100 h-screen flex-grow">
      <ul className="h-[80vh] overflow-auto scroll-smooth">
        {messages.map(({ message, id, isClient }) => (
          <li
            className={`mb-2 flex rounded p-1 ${
              isClient ? "flex-row" : "flex-row-reverse"
            }`}
            key={id}
          >
            <div
              className={`flex-none rounded-lg p-2 ${
                isClient ? "bg-gray-200" : "bg-blue-200"
              }`}
              ref={messagesEndRef}
            >
              {message}
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSendMessage} className="flex">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mr-1 w-full border border-gray-600 p-1 px-2"
        ></input>
        <button className="cursor-pointer bg-blue-400 p-2 px-4 text-white hover:bg-blue-500">
          Send
        </button>
      </form>
    </div>
  );
};
