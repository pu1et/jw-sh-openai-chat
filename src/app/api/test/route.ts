import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// API 키 확인을 위한 헬퍼 함수
function getApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY;
}

// 서버 시작시 한 번만 경고 출력
if (!getApiKey()) {
  console.error(
    "WARNING: OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment."
  );
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

    // 요청 본문 파싱
    const requestBody = await request.json();
    const userMessage = requestBody.message || "테스트 해줘";

    // OpenAI 인스턴스 생성
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log("Creating a new thread for test");

    try {
      // 새 스레드 생성
      const thread = await openai.beta.threads.create();
      console.log("Test thread created:", thread.id);

      // 테스트 메시지 추가
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: userMessage,
      });

      // 지정된 assistant로 실행
      const assistantId = "asst_mt23yArZWcloRcf2p9sqpvUc";
      console.log("Running test with Assistant:", assistantId);

      // 실행 및 응답 대기
      let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: assistantId,
      });

      let testResult = "테스트 결과를 생성하지 못했습니다.";

      if (run.status === "completed") {
        const threadMessages = await openai.beta.threads.messages.list(
          run.thread_id
        );

        // assistant 응답 메시지 찾기 (가장 최근에 추가된 assistant 메시지)
        for (const message of threadMessages.data) {
          if (
            message.role === "assistant" &&
            message.content[0].type === "text"
          ) {
            testResult = message.content[0].text.value;
            break;
          }
        }
      } else {
        console.log("Run status:", run.status);
        return NextResponse.json(
          { message: `테스트 실행 상태: ${run.status}`, error: true },
          { status: 500 }
        );
      }

      console.log("Test result:", testResult);
      return NextResponse.json({ message: testResult });
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
