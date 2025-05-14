import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">환영합니다</h1>
          <p className="mt-2 text-sm text-gray-600">
            원하는 서비스를 선택하세요
          </p>
        </div>
        <div className="flex flex-col space-y-4">
          <Link
            href="/chat"
            className="inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            챗봇 서비스
          </Link>
          <Link
            href="/test"
            className="inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            테스트 페이지
          </Link>
        </div>
      </div>
    </div>
  );
}
