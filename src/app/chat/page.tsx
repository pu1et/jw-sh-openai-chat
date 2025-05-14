"use client";

import { useState, useRef, useEffect } from "react";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

// 일반 텍스트 컴포넌트 (사용자 메시지용)
function PlainText({ text }: { text: string }) {
  return (
    <div className="text-left">
      {text.split("\n").map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < text.split("\n").length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
}

// 마크다운 컴포넌트 (봇 메시지용)
function MarkdownText({ text }: { text: string }) {
  return (
    <div className="markdown-message text-left">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-4 mb-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 mb-2">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-1">{children}</li>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="border-collapse border border-gray-300 w-full">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-gray-300">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-2 py-1 text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-2 py-1">{children}</td>
          ),
          a: ({ node, href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
              {...props}
            >
              {children}
            </a>
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            return inline ? (
              <code className="bg-gray-100 px-1 rounded text-sm" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                <code className="text-sm" {...props}>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "안녕하세요! 자사몰 상품을 색깔 사이즈로 추천해줘요.",
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
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
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
              className={`inline-block rounded-lg py-2 px-4 max-w-[80%] chat-bubble ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              } ${message.sender === "bot" ? "w-full md:w-auto" : ""}`}
            >
              {message.sender === "bot" ? (
                <MarkdownText text={message.text} />
              ) : (
                <PlainText text={message.text} />
              )}
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
