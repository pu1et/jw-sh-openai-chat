"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "next/navigation";

type TestData = {
  question: string;
  correct_answer: string;
  keywords: string[];
};

type TestResult = {
  question: string;
  ai_response: string;
  text_similarity: number;
  keyword_coverage: number;
  error?: boolean;
};

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

export default function TestPage() {
  const searchParams = useSearchParams();
  const autostart = searchParams.get("autostart");

  const [testData, setTestData] = useState<TestData[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  // Function to load test data
  const loadTestData = useCallback(async () => {
    try {
      const response = await fetch("/test_data.json");
      if (!response.ok) {
        throw new Error("Failed to load test data");
      }
      const data = await response.json();
      setTestData(data);
    } catch (error) {
      console.error("Error loading test data:", error);
    }
  }, []);

  // Load test data on component mount
  useEffect(() => {
    loadTestData();
  }, [loadTestData]);

  // Calculate text similarity between AI response and correct answer
  const calculateTextSimilarity = (
    aiResponse: string,
    correctAnswer: string
  ): number => {
    // Simple Jaccard similarity for words
    const aiWords = aiResponse
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 1);
    const correctWords = correctAnswer
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 1);

    const aiWordsSet = new Set(aiWords);
    const correctWordsSet = new Set(correctWords);

    const intersection = new Set(
      [...aiWordsSet].filter((word) => correctWordsSet.has(word))
    );
    const union = new Set([...aiWordsSet, ...correctWordsSet]);

    return Math.round((intersection.size / union.size) * 100);
  };

  // Calculate keyword coverage
  const calculateKeywordCoverage = (
    aiResponse: string,
    keywords: string[]
  ): number => {
    const lowerResponse = aiResponse.toLowerCase();
    let matchedKeywords = 0;

    keywords.forEach((keyword) => {
      if (lowerResponse.includes(keyword.toLowerCase())) {
        matchedKeywords++;
      }
    });

    return Math.round((matchedKeywords / keywords.length) * 100);
  };

  // Run a single test
  const runSingleTest = async (testItem: TestData): Promise<TestResult> => {
    try {
      // Call the chat API with the test question
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              id: Date.now().toString(),
              text: testItem.question,
              sender: "user",
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      const aiResponse = data.message;

      // Calculate metrics
      const textSimilarity = calculateTextSimilarity(
        aiResponse,
        testItem.correct_answer
      );
      const keywordCoverage = calculateKeywordCoverage(
        aiResponse,
        testItem.keywords
      );

      return {
        question: testItem.question,
        ai_response: aiResponse,
        text_similarity: textSimilarity,
        keyword_coverage: keywordCoverage,
      };
    } catch (error) {
      console.error("Error running test:", error);
      return {
        question: testItem.question,
        ai_response: "오류 발생",
        text_similarity: 0,
        keyword_coverage: 0,
        error: true,
      };
    }
  };

  // Run all tests
  const runAllTests = async () => {
    if (testData.length === 0) {
      alert("테스트 데이터를 불러올 수 없습니다.");
      return;
    }

    setIsTestStarted(true);
    setIsLoading(true);
    setTestResults([]);
    setCurrentTestIndex(0);

    const results: TestResult[] = [];

    for (let i = 0; i < testData.length; i++) {
      setCurrentTestIndex(i);
      const result = await runSingleTest(testData[i]);
      results.push(result);

      // Update results as they come in
      setTestResults([...results]);
    }

    setIsLoading(false);
  };

  // Auto-start the test if requested
  useEffect(() => {
    if (
      autostart === "true" &&
      !isTestStarted &&
      !isLoading &&
      testData.length > 0
    ) {
      runAllTests();
    }
  }, [autostart, isTestStarted, isLoading, testData]);

  return (
    <div className="flex flex-col min-h-screen max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">테스트 페이지</h1>

      {!isTestStarted ? (
        <div className="flex justify-center mt-10">
          <button
            onClick={runAllTests}
            disabled={testData.length === 0}
            className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 text-lg font-medium disabled:bg-gray-400"
          >
            {testData.length === 0 ? "테스트 데이터 로딩 중..." : "테스트 시작"}
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mb-4 border border-gray-200 rounded-lg p-4">
          {isLoading ? (
            <div className="text-center p-10">
              <div className="inline-block">
                <span className="animate-pulse text-lg">
                  테스트 실행 중... {currentTestIndex + 1}/{testData.length}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">테스트 결과</h2>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 table-fixed">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 border-b text-center w-1/4 align-middle">
                        Question
                      </th>
                      <th className="py-3 px-4 border-b text-center w-1/2 align-middle">
                        AI Response
                      </th>
                      <th className="py-3 px-4 border-b text-center w-1/8 align-middle">
                        Text Similarity
                      </th>
                      <th className="py-3 px-4 border-b text-center w-1/8 align-middle">
                        Keyword Coverage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((result, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="py-2 px-4 border-b text-sm text-center align-middle break-words">
                          {result.question}
                        </td>
                        <td className="py-2 px-4 border-b text-sm text-center align-middle">
                          <div className="max-h-60 overflow-y-auto mx-auto">
                            <div className="text-left inline-block markdown-message">
                              <ReactMarkdown>
                                {result.ai_response}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b text-center align-middle">
                          <span
                            className={
                              result.text_similarity >= 70
                                ? "text-green-600"
                                : result.text_similarity >= 40
                                ? "text-yellow-600"
                                : "text-red-600"
                            }
                          >
                            {result.text_similarity}%
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b text-center align-middle">
                          <span
                            className={
                              result.keyword_coverage >= 70
                                ? "text-green-600"
                                : result.keyword_coverage >= 40
                                ? "text-yellow-600"
                                : "text-red-600"
                            }
                          >
                            {result.keyword_coverage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 mr-4"
            >
              홈으로 돌아가기
            </Link>
            {!isLoading && isTestStarted && (
              <button
                onClick={runAllTests}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                테스트 다시 실행
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
