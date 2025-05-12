"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "안녕하세요! OpenAI로 구동되는 챗봇입니다. 어떤 질문이든 입력해 주세요. 한국어와 영어 모두 가능합니다.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input after bot response
  useEffect(() => {
    if (
      !isLoading &&
      messages.length > 0 &&
      messages[messages.length - 1].sender === "bot"
    ) {
      inputRef.current?.focus();
    }
  }, [isLoading, messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call our API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message || "죄송합니다. 오류가 발생했습니다.",
        sender: "bot",
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error calling API:", error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "죄송합니다. 서버 오류가 발생했습니다. 나중에 다시 시도해주세요.",
        sender: "bot",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">OpenAI 챗봇</h1>

      <div className="flex-1 overflow-y-auto mb-4 border border-gray-200 rounded-lg p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block rounded-lg py-2 px-4 max-w-[80%] ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mb-4">
            <div className="inline-block bg-gray-200 rounded-lg py-2 px-4">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 p-2 border border-gray-300 rounded-lg"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading || !input.trim()}
        >
          전송
        </button>
      </form>
    </div>
  );
}
