import { TMessage } from "./HelpWidget";

export const ChatPanel = ({
  handleSendMessage,
  text,
  setText,
  messages,
}: {
  handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  text: string;
  setText: (newText: string) => void;
  messages: TMessage[];
}) => {
  return (
    <div className="w-100 flex-grow">
      <ul className="h-[520px] overflow-auto">
        {messages.map(({ message, id, sender }) => (
          <li
            className={`mb-2 flex rounded p-1 ${
              sender === "1" ? "flex-row" : "flex-row-reverse"
            }`}
            key={id}
          >
            <div
              className={`flex-none rounded-lg p-2 ${
                sender === "1" ? "bg-gray-200" : "bg-blue-200"
              }`}
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
