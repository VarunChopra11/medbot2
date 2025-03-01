"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../utils/i18n"; // Import your i18n utility
import LocationSelector from "../components/LocationSelector";

interface Option {
  value: string;
  label: string;
  hasTextInput?: boolean;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
}

interface FormAnswer {
  selectedOption: string;
  otherText?: string;
  location?: {
    country: string;
    state: string;
    city: string;
  };
}

interface FormAnswers {
  [key: number]: FormAnswer;
}

const questions: Question[] = [
  {
    id: 0,
    question: "What language do you want to proceed in?",
    options: [
      { value: "english", label: "English" },
      { value: "spanish", label: "Spanish" },
      { value: "french", label: "French" },
    ],
  },
  {
    id: 1,
    question: "How are you feeling today?",
    options: [
      { value: "Calm", label: "Calm" },
      { value: "Anxious", label: "Anxious" },
      { value: "Sad", label: "Sad" },
      { value: "Angry", label: "Angry" },
      { value: "Overwhelmed", label: "Overwhelmed" },
      { value: "other", label: "Other", hasTextInput: true },
    ],
  },
  {
    id: 2,
    question: "What brings you here today?",
    options: [
      { value: "Stress", label: "Stress" },
      { value: "Relationships", label: "Relationships" },
      { value: "Self-reflection", label: "Self-reflection" },
      { value: "Building confidence", label: "Building confidence" },
      { value: "Challenges", label: "Challenges" },
      { value: "other", label: "Other", hasTextInput: true },
    ],
  },
  {
    id: 3,
    question: "What's your biggest challenge right now?",
    options: [
      { value: "Work", label: "Work" },
      { value: "Relationships", label: "Relationships" },
      { value: "Motivation", label: "Motivation" },
      { value: "Managing emotions", label: "Managing emotions" },
      { value: "Confidence", label: "Confidence" },
      { value: "other", label: "Other", hasTextInput: true },
    ],
  },
  {
    id: 4,
    question: "How often do you feel overwhelmed?",
    options: [
      { value: "Daily", label: "Daily" },
      { value: "Weekly", label: "Weekly" },
      { value: "Monthly", label: "Monthly" },
      { value: "Rarely", label: "Rarely" },
      { value: "Never", label: "Never" },
    ],
  },
  {
    id: 5,
    question: "How's your energy level today?",
    options: [
      { value: "High", label: "High" },
      { value: "Moderate", label: "Moderate" },
      { value: "Low", label: "Low" },
      { value: "Very low", label: "Very low" },
    ],
  },
  {
    id: 6,
    question: "How do you usually handle difficult moments?",
    options: [
      { value: "Talking", label: "Talking" },
      { value: "Exercise", label: "Exercise" },
      { value: "Self-care", label: "Self-care" },
      { value: "Hobbies", label: "Hobbies" },
      { value: "Avoidance", label: "Avoidance" },
      { value: "other", label: "Other", hasTextInput: true },
    ],
  },
  {
    id: 7,
    question: "What does your typical day look like?",
    options: [
      { value: "Productive", label: "Productive" },
      { value: "Busy", label: "Busy" },
      { value: "Unstructured", label: "Unstructured" },
      { value: "Relaxed", label: "Relaxed" },
      { value: "other", label: "Other", hasTextInput: true },
    ],
  },
  {
    id: 8,
    question: "How do you feel about sharing your emotions?",
    options: [
      { value: "Very comfortable", label: "Very comfortable" },
      { value: "Somewhat comfortable", label: "Somewhat comfortable" },
      { value: "Not comfortable", label: "Not comfortable" },
      { value: "Uncomfortable", label: "Uncomfortable" },
    ],
  },
  {
    id: 9,
    question: "What is your location?",
    options: [],
  },
];

const TypeformMentalHealth = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [otherText, setOtherText] = useState("");
  const [loadingFormRead, setLoadingFormRead] = useState(true);

  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [locationSelected, setLocationSelected] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = sessionStorage.getItem("selectedLanguage");
      if (savedLanguage) {
        i18n.changeLanguage(savedLanguage);
      }
    }
  }, [i18n]);

  useEffect(() => {
    if (currentQuestion === questions.length - 1) {
      if (country) {
        const questionId = questions[currentQuestion].id;
        setAnswers((prev) => ({
          ...prev,
          [questionId]: {
            selectedOption: "location",
            location: {
              country,
              state,
              city
            }
          },
        }));
        setLocationSelected(true);
      }
    }
  }, [country, state, city, currentQuestion]);

  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleAnswer = (selectedOption: string, text?: string) => {
    const questionId = questions[currentQuestion].id;
  
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selectedOption,
        otherText: selectedOption === "other" ? text || "" : undefined,
      },
    }));
  
    if (questionId === 0) {
      sessionStorage.setItem("selectedLanguage", selectedOption);
      changeLanguage(selectedOption); 
    }
  };

  const handleOtherSubmit = () => {
    if (otherText.trim()) {
      handleAnswer("other", otherText);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      saveAssessment();
    }
  };

  const saveAssessment = () => {
    const newResponse = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      answers,
    };

    try {
      const existingData = sessionStorage.getItem("mentalHealthAssessments");
      const assessments = existingData ? JSON.parse(existingData) : [];
      assessments.push(newResponse);
      sessionStorage.setItem(
        "mentalHealthAssessments",
        JSON.stringify(assessments)
      );
      setLoadingFormRead(false);
      setTimeout(() => {
        router.push("/start-call");
      }, 5000);
    } catch (error) {
      console.error("Error saving assessment:", error);
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const currentAnswer = answers[currentQuestionData.id];
  const isOptionSelected = Boolean(currentAnswer?.selectedOption) || 
    (isLastQuestion && locationSelected);

  const translatedQuestion = t(currentQuestionData.question);
  const translatedOptions = currentQuestionData.options.map(option => ({
    ...option,
    label: t(option.label)
  }));

  return loadingFormRead ? (
    <div className="min-h-screen p-4 bg-gradient-to-r from-[#8a820b] via-[#24afcb] to-[#1e2652] flex items-center justify-center">
      <div className="w-full max-w-4xl p-6 sm:p-10 lg:p-20 bg-white rounded-lg shadow-lg lg:max-w-[80rem]">
        <h2 className="text-xl font-semibold mb-6 text-center font-sans">
          {translatedQuestion}
        </h2>

        <div className="flex flex-wrap gap-3 justify-center mb-6">
            {currentQuestionData.question === "What is your location?" ? (
                <LocationSelector 
                onSelectCountry={(value) => {
                  setCountry(value);
                  setLocationSelected(Boolean(value));
                }}
                onSelectState={setState}
                onSelectCity={setCity}
              />
              
            ) : (
            translatedOptions.map((option) => (
              <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className={`w-full sm:w-auto px-12 py-6 border-2 text-center transition-all duration-200 text-[12px] rounded-2xl font-sans
              ${
                currentAnswer?.selectedOption === option.value
                ? "bg-[#Adff2f] border-black"
                : "bg-white border-black"
              }`}
              >
              {option.label}
              </button>
            ))
            )}
        </div>

        {currentAnswer?.selectedOption === "other" && (
          <form className="w-full mt-4" onSubmit={handleOtherSubmit}>
            <textarea
              value={otherText}
              onChange={(e) => {
                setOtherText(e.target.value);
                handleAnswer("other", e.target.value);
              }}
              placeholder={t("Please specify...")}
              className="w-full p-3 border-2 border-black rounded-lg min-h-[80px] sm:min-h-[100px]"
              autoFocus
            />
          </form>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <button
            onClick={handleNext}
            disabled={!isOptionSelected}
            className={`w-full sm:w-auto text-center px-6 sm:px-10 py-3 sm:py-4 rounded-lg border-2 shadow-md 
              ${
                isOptionSelected
                  ? " border-2 border-black shadow-[6px_6px_6px] rounded-lg bg-gray-300"
                  : "bg-gray-300 border-gray-400 cursor-not-allowed text-gray-400"
              }`}
          >
            {isLastQuestion ? t("Connect to Therapist") : t("Next")}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen p-4 bg-gradient-to-r from-[#8a820b] via-[#24afcb] to-[#1e2652] flex items-center justify-center">
      <div className="w-full max-w-4xl p-6 sm:p-10 lg:p-20 bg-white rounded-lg shadow-lg">
        <h2 className="text-center text-lg sm:text-xl">
          {t("The therapist is reviewing your form...")}
        </h2>
      </div>
    </div>
  );
};

export default TypeformMentalHealth;