// @ts-nocheck
"use client";
import { VoiceProvider } from "@humeai/voice-react";
import { ComponentRef, useRef, useEffect, useState } from "react";
import Messages from "./Messages";
import Controls from "./Controls";
import StartCall from "./StartCall";

export default function ClientComponent({
  accessToken,
}: {
  accessToken: string;
}) {
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);
  const [answers, setAnswers] = useState<{
    [key: number]: { selectedOption: string; otherText?: string };
  }>({});

  const getAssessments = (): AssessmentResponse[] => {
    const data = localStorage.getItem("mentalHealthAssessments");
    return data ? JSON.parse(data) : [];
  };

  const getLatestAssessment = (): AssessmentResponse | null => {
    const assessments = getAssessments();
    return assessments.length > 0 ? assessments[assessments.length - 1] : null;
  };

  useEffect(() => {
    const latestAssessment = getLatestAssessment();
    if (latestAssessment) {
      setAnswers(latestAssessment.answers);
    }
  }, []);

  return (
    <div className=" bg-gradient-to-r from-violet-400/90 via-purple-400/80 to-orange-500/90">
      <div className="relative h-screen w-full max-w-3xl mx-auto overflow-hidden flex flex-col rounded-xl ">
        {/* Header */}
        <div className="bg-[#FFB280] text-white p-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Chat with us</h1>
          <button className="text-white">•••</button>
        </div>

        {/* Chat container */}
        <VoiceProvider
          auth={{ type: "accessToken", value: accessToken }}
          configId="0fe5d4fe-0eaa-49a5-899e-b8f055e3a8d4"
          sessionSettings={{
            systemPrompt: `We have collected some survey from the current user treat him according to his conditions mentioned in survey Q1: How are you feeling today? Ans 1: ${answers[1]?.selectedOption}
          Q2: How are you feeling today? Ans 2: ${answers[2]?.selectedOption}
          Q3: How are you feeling today? Ans 3: ${answers[3]?.selectedOption}
          Q4: How are you feeling today? Ans 4: ${answers[4]?.selectedOption}
          Q5: How are you feeling today? Ans 5: ${answers[5]?.selectedOption}
          Q6: How are you feeling today? Ans 6: ${answers[6]?.selectedOption}
          Q7: How are you feeling today? Ans 7: ${answers[7]?.selectedOption}
          Q8: How are you feeling today? Ans 8: ${answers[8]?.selectedOption}
          Greet in starting give small responses of REMEMBER THIS maximum 10 words don't try to give more than 1 liner response  .
          `,
            type: "session_settings",
          }}
          onMessage={() => {
            if (timeout.current) {
              window.clearTimeout(timeout.current);
            }

            timeout.current = window.setTimeout(() => {
              if (ref.current) {
                const scrollHeight = ref.current.scrollHeight;
                ref.current.scrollTo({
                  top: scrollHeight,
                  behavior: "smooth",
                });
              }
            }, 200);
          }}
        >
          <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
            <div className="flex-1 overflow-y-auto" ref={ref}>
              <Messages ref={ref} />
              <Controls />
            </div>

            {/* Message input and controls */}

            <div className="max-w-4xl mx-auto">
              <StartCall />
            </div>
          </div>
        </VoiceProvider>
      </div>
    </div>
  );
}
