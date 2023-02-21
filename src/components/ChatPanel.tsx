import { TMessage } from "./HelpWidget";

export const ChatPanel = ({
  handleSendMessage,
  text,
  setText,
  messages,
}: {
  handleSendMessage: any;
  text: string;
  setText: (newText: string) => void;
  messages: TMessage[];
}) => {
  return (
    <div>
      <ul className="h-[400px] overflow-auto">
        {messages.map(({ message, id, sender }) => (
          <li
            className={`mb-2 rounded p-1 ${
              sender === "1" ? "bg-gray-50" : "bg-blue-200"
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
        <button className="cursor-pointer bg-blue-400 p-2 px-4 text-white hover:bg-blue-500">
          Send
        </button>
      </form>
    </div>
  );
};
