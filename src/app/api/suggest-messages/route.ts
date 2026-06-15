import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST() {
  try {
    const prompt =
      "Create three open-ended questions separated by ||.";

    const result = streamText({
      model: openai("gpt-4o-mini"),
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}