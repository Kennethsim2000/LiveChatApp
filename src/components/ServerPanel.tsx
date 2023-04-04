import type { Message } from "@prisma/client";
import React, { useEffect, useRef } from "react";
import { FiSend } from "react-icons/fi";

export const ServerPanel = ({
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
    <div className="w-100 bg-gray flex min-h-full flex-grow flex-col">
      <ul className="h-[80vh] overflow-auto scroll-smooth bg-gray-50 pt-4">
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

      <form onSubmit={handleSendMessage} className="relative flex">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="relative w-full bg-gray-200 p-3 px-2 focus:outline-none "
          placeholder="Enter your message..."
        ></input>
        <button className="absolute right-0 top-1 cursor-pointer p-2 px-4 text-white ">
          <FiSend className="h-6 w-6 text-gray-500" />
        </button>
      </form>
    </div>
  );
};
