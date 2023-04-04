import type { Message } from "@prisma/client";
import { AiOutlineClose } from "react-icons/ai";
import { FiSend } from "react-icons/fi";
import React, { useEffect, useRef } from "react";

export const ClientPanel = ({
  handleSendMessage,
  text,
  setText,
  filteredData,
  setIsChatPanelDisplayed,
  handleCloseWidget,
}: {
  handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  text: string;
  setText: (newText: string) => void;
  filteredData: Message[];
  setIsChatPanelDisplayed: (bool: boolean) => void;
  handleCloseWidget: () => void;
}) => {
  const messagesEndRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    console.log("code comes to useEffect");
    console.log(messagesEndRef.current);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredData]); //use messages

  return (
    <div
      className="h-120 fixed bottom-0 
    right-10 flex w-80 flex-col justify-between rounded-lg bg-white px-6 pt-6 pb-2"
    >
      <AiOutlineClose
        className="absolute top-2 right-2 h-5 w-5 text-gray-700 hover:cursor-pointer hover:text-red-400"
        onClick={handleCloseWidget}
      />
      <ul className=" mt-2 h-[400px] overflow-auto">
        {filteredData?.map((singleMessage) => (
          <li
            className={`mb-2 rounded p-1 ${
              singleMessage.isClient ? "bg-blue-200" : "bg-gray-200"
            }`}
            key={singleMessage.id}
            ref={messagesEndRef}
          >
            {singleMessage.message}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSendMessage} className="mt-auto flex bg-gray-200">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full  bg-gray-200 p-1 px-2 focus:outline-none"
          placeholder="Enter your message..."
        ></input>
        <button
          onClick={() => setIsChatPanelDisplayed(true)}
          className="cursor-pointer  p-2 px-4 text-white"
        >
          <FiSend className="h-5 w-5 text-gray-500" />
        </button>
      </form>
    </div>
  );
};
