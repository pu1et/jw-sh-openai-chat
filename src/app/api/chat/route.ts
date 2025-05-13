import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// API 키 확인을 위한 헬퍼 함수
function getApiKey(): string | undefined {
  // 다양한 방법으로 API 키 확인
  return process.env.OPENAI_API_KEY;
}

// 서버 시작시 한 번만 경고 출력
if (!getApiKey()) {
  console.error(
    "WARNING: OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment."
  );
}

// 싱글톤 인스턴스 관리
let openaiInstance: OpenAI | null = null;
let assistantInstance: any = null;
let threadInstance: any = null;

// OpenAI 클라이언트와 스레드를 초기화하는 함수
async function initializeOpenAI(): Promise<{
  openai: OpenAI | null;
  assistant: any | null;
  thread: any | null;
}> {
  const apiKey = getApiKey();

  if (!openaiInstance && apiKey) {
    console.log("Creating new OpenAI instance with API key");
    try {
      // OpenAI 인스턴스 생성
      openaiInstance = new OpenAI({
        apiKey: apiKey,
      });

      // Assistant 가져오기
      assistantInstance = await openaiInstance.beta.assistants.retrieve(
        "asst_5MZj2DoqGcOaoam4FjRHdeoE"
      );

      // 스레드 생성
      console.log("Creating thread");
      threadInstance = await openaiInstance.beta.threads.create();
      console.log("Thread created:", threadInstance.id);
    } catch (error) {
      console.error("Error initializing OpenAI:", error);
      return { openai: null, assistant: null, thread: null };
    }
  }

  return {
    openai: openaiInstance,
    assistant: assistantInstance,
    thread: threadInstance,
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = getApiKey();

    // API 키가 없으면 에러 응답
    if (!apiKey) {
      console.error("API key is missing in request handler");
      return NextResponse.json(
        {
          error:
            "OpenAI API key is not configured. Please check your environment setup.",
        },
        { status: 500 }
      );
    }

    // OpenAI, Assistant, Thread 인스턴스 초기화
    const { openai, assistant, thread } = await initializeOpenAI();

    if (!openai || !assistant || !thread) {
      return NextResponse.json(
        { error: "Failed to initialize OpenAI resources" },
        { status: 500 }
      );
    }

    // 클라이언트에서 보낸 데이터 파싱
    const body = await request.json();
    console.log("Request body:", body);

    // messages 배열 확인
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required and must be an array" },
        { status: 400 }
      );
    }

    console.log("Using OpenAI Assistants API");

    try {
      // 마지막 사용자 메시지 추출 (마지막 메시지가 사용자 메시지라고 가정)
      const lastUserMessage = messages
        .filter((msg) => msg.sender === "user")
        .pop();

      if (!lastUserMessage) {
        throw new Error("No user message found");
      }

      console.log("Last user message:", lastUserMessage.text);

      // 사용자 메시지 추가 (기존 스레드 재사용)
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: lastUserMessage.text,
      });

      console.log("Using Assistant :", assistant.id);
      // 실행 및 응답 대기
      let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: assistant.id,
      });

      let botMessage = "응답을 생성하지 못했습니다.";

      if (run.status === "completed") {
        console.log("Run with instructions : " + run.instructions);
        const threadMessages = await openai.beta.threads.messages.list(
          run.thread_id
        );
        for (const message of threadMessages.data.reverse()) {
          console.log(`${message.role} > ${message.content[0]}`);
          if (message.content[0].type == "text") {
            botMessage = message.content[0].text.value;
          }
        }
      } else {
        console.log("Run status:", run.status);
      }

      console.log("Assistant response:", botMessage);

      return NextResponse.json({ message: botMessage });
    } catch (assistantError) {
      console.error("Error using Assistants API:", assistantError);
      return NextResponse.json(
        {
          message:
            "Assistant API 오류가 발생했습니다: " +
            (assistantError instanceof Error
              ? assistantError.message
              : String(assistantError)),
          error: true,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json(
      {
        message:
          "죄송합니다. 서버 오류가 발생했습니다: " +
          (error.message || "Error calling OpenAI API"),
        error: true,
      },
      { status: 500 }
    );
  }
}
