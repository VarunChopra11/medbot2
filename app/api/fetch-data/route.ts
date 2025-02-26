// @ts-nocheck
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ElevenLabsClient } from "elevenlabs";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { createWriteStream } from "fs";

const VOICE_ID = "4cHjkgQnNiDfoHQieI9o";

function bufferToStream(buffer: Buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null); // Signals end of stream
  return stream;
}

const openai = new OpenAI({
  apiKey: process.env.openai_key,
});

const apiKey = process.env.eleven_labs_key;
const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;


export async function POST(request: Request) {
  try {
    const { transcript, assessments, conversationHistory, firstResponse } =
      await request.json();

      const systemPrompt = {
        role: "developer",
        content: `<role>
      You are Jennifer, a compassionate mental health support AI therapist designed to provide empathetic, non-judgmental support to users seeking emotional guidance. Your primary function is to offer a safe space for users to express their feelings, provide evidence-based coping strategies, and encourage professional help when necessary. You have a deep understanding of psychological principles and can maintain context over long conversations for personalized support.
      </role>
      <communication_style>
      Communicate with warmth, patience, and genuine care. Use a calm, reassuring tone while remaining professional and focused to the questions asked.
      </communication_style>
            
      Instructions:
      These are the survey responses collected from user
              Q1: How are you feeling today? Ans 1: ${
                assessments[assessments.length - 1]?.answers[1]?.selectedOption ===
                "other"
                  ? assessments[assessments.length - 1]?.answers[1]?.otherText
                  : assessments[assessments.length - 1]?.answers[1]?.selectedOption
              }
              Q2: What brings you here today? Ans 2: ${
                assessments[assessments.length - 1]?.answers[2]?.selectedOption ===
                "other"
                  ? assessments[assessments.length - 1]?.answers[2]?.otherText
                  : assessments[assessments.length - 1]?.answers[2]?.selectedOption
              }
              Q3: What's your biggest challenge right now? Ans 3: ${
                assessments[assessments.length - 1]?.answers[3]?.selectedOption ===
                "other"
                  ? assessments[assessments.length - 1]?.answers[3]?.otherText
                  : assessments[assessments.length - 1]?.answers[3]?.selectedOption
              }
              Q4:How often do you feel overwhelmed? Ans 4: ${
                assessments[assessments.length - 1]?.answers[4]?.selectedOption ===
                "other"
                  ? assessments[assessments.length - 1]?.answers[4]?.otherText
                  : assessments[assessments.length - 1]?.answers[4]?.selectedOption
              }
              Q5: How's your energy level today? Ans 5: ${
                assessments[assessments.length - 1]?.answers[5]?.selectedOption ===
                "other"
                  ? assessments[assessments.length - 1]?.answers[5]?.otherText
                  : assessments[assessments.length - 1]?.answers[5]?.selectedOption
              }
              Q6:How do you usually handle difficult moments? Ans 6: ${
                assessments[assessments.length - 1]?.answers[6]?.selectedOption ===
                "other"
                  ? assessments[assessments.length - 1]?.answers[6]?.otherText
                  : assessments[assessments.length - 1]?.answers[6]?.selectedOption
              }
              Q7: What does your typical day look like? Ans 7: ${
                assessments[assessments.length - 1]?.answers[7]?.selectedOption ===
                "other"
                  ? assessments[assessments.length - 1]?.answers[7]?.otherText
                  : assessments[assessments.length - 1]?.answers[7]?.selectedOption
              }
              Q8:How do you feel about sharing your emotions? Ans 8: ${
                assessments[assessments.length - 1]?.answers[8]?.selectedOption ===
                "other"
                  ? assessments[assessments.length - 1]?.answers[8]?.otherText
                  : assessments[assessments.length - 1]?.answers[8]?.selectedOption
              }
      
      Important: Remember your goal is to provide immediate relief and practical support. Focus on their immediate emotional needs or queries based on their assessment responses. `
      };

    const refinedHistory = conversationHistory.slice(-5);

    let messages = [systemPrompt];

    refinedHistory.forEach((message) => {
      if (message.role === "user") {
        messages.push({ role: "user", content: message.text });
      } else if (message.role === "ai") {
        messages.push({ role: "assistant", content: message.text });
      }
    });

    console.log("assessments", conversationHistory);
    // Generate AI response
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 1,
    });
    let data;
    if (firstResponse) {
      const ai_msg_correct = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "developer", content: "correct the given sentence" },
          {
            role: "user",
            content: `Hi, I am Jennifer your AI Therapist.  I see you're feeling ${
              assessments?.[assessments.length - 1]?.answers?.[1]
                ?.selectedOption === "other"
                ? assessments?.[assessments.length - 1]?.answers?.[1]
                    ?.otherText || "something else"
                : assessments?.[assessments.length - 1]?.answers?.[1]
                    ?.selectedOption || "unsure"
            }. Can you tell me more about that?`,
          },
        ],
      });

      data = {
        text: ai_msg_correct.choices[0].message.content,
        model_id: "eleven_multilingual_v2",
      };
    } else {
      data = {
        text: ` ${response.choices[0].message.content}`,
        model_id: "eleven_multilingual_v2",
      };
    }

    console.log("response from openai", response.choices[0].message.content);

    // Convert text to speech
    const speechDetails = await axios.post(url, data, {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer", // Ensures we get binary data
    });

    const audioBase64 = Buffer.from(speechDetails.data).toString("base64");

    return NextResponse.json({
      audioData: audioBase64,
      aiResponse: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Audio processing failed" },
      { status: 500 }
    );
  }
}
