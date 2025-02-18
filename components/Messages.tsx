import { useVoice } from "@humeai/voice-react";
import { forwardRef } from "react";

const Messages = forwardRef(function Messages(_, ref) {
  const { messages } = useVoice();

  return (
    <div className="p-4 space-y-4">
      {messages.map((msg, index) => {
        if (msg.type === "user_message" || msg.type === "assistant_message") {
          const isUser = msg.type === "user_message";

          return (
            <div
              key={msg.type + index}
              className={`max-w-[80%] ${isUser ? "ml-auto" : ""}`}
            >
              <div
                className={`rounded-2xl px-4 py-2 ${
                  isUser
                    ? "bg-[#ff9080] text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.message.content}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
});

export default Messages;
