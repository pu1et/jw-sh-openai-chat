This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Setup

This project uses the OpenAI API for the chatbot functionality. To set up your environment:

1. Create a `.env.local` file in the root of the project
2. Add your OpenAI API key to the file:

```
OPENAI_API_KEY=your_openai_api_key_here
```

3. Replace `your_openai_api_key_here` with your actual API key from [OpenAI](https://platform.openai.com/api-keys)

**중요 참고사항:**

- Next.js는 `.env.local` 파일을 자동으로 로드합니다
- 서버를 재시작해야 변경사항이 적용됩니다
- 환경 변수가 로드되지 않는 경우 다음 방법을 시도해보세요:
  ```bash
  # 터미널에서 직접 환경 변수 설정 후 실행
  OPENAI_API_KEY=your_key_here npm run dev
  ```

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

- OpenAI powered chatbot that responds to user messages
- Chat interface with message history
- Automatic input focus after receiving a response

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
