import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { NextResponse } from "next/server";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required and must be an array" },
        { status: 400 }
      );
    }

    // Format messages for OpenAI API
    const formattedMessages: ChatCompletionMessageParam[] = messages.map(
      (msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })
    );

    // Add system message at the beginning
    formattedMessages.unshift({
      role: "system",
      content:
        "당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 간결하고 정확한 답변을 제공해주세요.",
    });

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: formattedMessages,
      temperature: 0.0,
      max_tokens: 200,
    });

    // Extract the bot's message
    const botMessage = response.choices[0].message.content;

    return NextResponse.json({ message: botMessage });
  } catch (error: any) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json(
      { error: error.message || "Error calling OpenAI API" },
      { status: 500 }
    );
  }
}
