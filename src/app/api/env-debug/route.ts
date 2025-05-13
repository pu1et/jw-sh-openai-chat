import { NextResponse } from "next/server";

export async function GET() {
  // 보안을 위해 실제 값은 반환하지 않고 존재 여부만 확인
  const envKeys = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
  };

  // 환경 변수 설정 여부만 확인 (실제 값 노출 없음)
  return NextResponse.json({
    message: "Environment variable status (values not shown for security)",
    env: envKeys,
  });
}

// 테스트용 POST 엔드포인트 추가
export async function POST(request: Request) {
  try {
    const body = await request.json();

    return NextResponse.json({
      message: "Test endpoint works! Received data.",
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      {
        error: "Error processing request",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
