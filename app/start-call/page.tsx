// @ts-nocheck
"use client";
import "regenerator-runtime/runtime";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Mic, Square, Play, Download, Globe, Info } from "lucide-react";
import { AudioVisualizer } from "react-audio-visualize";
import axios from "axios";
import WavesurferPlayer from "@wavesurfer/react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { first } from "remeda";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import '../../utils/i18n';
import { EmergencyNumber } from "../../EmergencyNumbers.ts";

interface Message {
  id: string;
  role: "ai" | "user";
  audioBlob?: Blob;
  audioUrl?: string;
  timestamp: Date;
}

const DisclaimerFooter = () => {
  const [emergencyNumber, setEmergencyNumber] = useState("1-800-273-8255");

  useEffect(() => {
    const getCountryFromMentalHealthAssessments = (): string | null => {
      try {
        const storedAssessments = sessionStorage.getItem('mentalHealthAssessments');
        const parsedAssessments = storedAssessments ? JSON.parse(storedAssessments) : [];
        
        if (Array.isArray(parsedAssessments) && parsedAssessments.length > 0) {
          return parsedAssessments[0]?.answers?.['9']?.location?.country || null;
        }
        
        return null;
      } catch (error) {
        console.error('Error parsing mental health assessments:', error);
        return null;
      }
    };

    const country = getCountryFromMentalHealthAssessments();
    const number = country && EmergencyNumber[country] ? EmergencyNumber[country] : "1-800-273-8255";
    setEmergencyNumber(number);
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 w-full py-2 px-4 z-50">
      <div className="max-w-4xl mx-auto flex items-start justify-center space-x-1">
        <Info className="text-white/80 w-4 h-4 flex-shrink-0 mt-[1px]" />
        <p className="text-[10px] text-white/70 text-center font-semibold">
          This AI therapist is not a qualified mental health professional and should not replace licensed therapeutic care.
          If you feel you are at risk or experiencing a mental health emergency, please call{" "}
          <a 
            href={`tel:${emergencyNumber}`} 
            className="font-bold text-white underline hover:text-red-300 transition-colors"
          >
            {emergencyNumber}
          </a>{" "}
          immediately.
        </p>
      </div>
    </footer>
  );
};

export default function Page() {
  const router = useRouter();
  const { t, i18n } = useTranslation(); 
  const [messages, setMessages] = useState<Message[]>([]);
  const wavesurferRefs = useRef<{ [key: string]: any }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [audioStates, setAudioStates] = useState<{
    [key: string]: {
      isPlaying: boolean;
      currentTime: number;
      duration: number;
    };
  }>({});
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("english");

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({
    language: currentLanguage === 'english' ? 'en-US' : 
              currentLanguage === 'spanish' ? 'es-ES' : 
              currentLanguage === 'french' ? 'fr-FR' : 'en-US'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = sessionStorage.getItem("selectedLanguage");
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage);
      }
    }
  }, [i18n]);

  const changeLanguage = (language: string) => {
    sessionStorage.setItem("selectedLanguage", language);
    setCurrentLanguage(language);
    i18n.changeLanguage(language);
    setShowLanguageMenu(false);
  };

  const onReady = (ws, messageId) => {
    wavesurferRefs.current[messageId] = ws;
    setIsPlaying(false);
  };

  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause();
  };

  const containerRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const animationFrameRefs = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    messages.forEach((message) => {
      if (!audioStates[message.id]) {
        setAudioStates((prev) => ({
          ...prev,
          [message.id]: {
            isPlaying: false,
            currentTime: 0,
            duration: 0,
          },
        }));
      }
    });
    console.log(messages);
  }, [messages]);

  useEffect(() => {
    messages.forEach((message) => {
      if (message.audioBlob || message.audioUrl) {
        const audio = new Audio(
          message.audioUrl || URL.createObjectURL(message.audioBlob)
        );
        audioRefs.current[message.id] = audio;

        audio.addEventListener("loadedmetadata", () => {
          setAudioStates((prev) => ({
            ...prev,
            [message.id]: {
              ...prev[message.id],
              duration: audio.duration,
            },
          }));
        });

        audio.addEventListener("ended", () => {
          setAudioStates((prev) => ({
            ...prev,
            [message.id]: {
              ...prev[message.id],
              isPlaying: false,
              currentTime: 0,
            },
          }));
          setCurrentPlayingId(null);
          cancelAnimationFrame(animationFrameRefs.current[message.id]);
        });
      }
    });

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.removeEventListener("loadedmetadata", () => {});
        audio.removeEventListener("ended", () => {});
      });
      Object.values(animationFrameRefs.current).forEach((frameId) => {
        cancelAnimationFrame(frameId);
      });
    };
  }, [messages]);

  useEffect(() => {
    const existingData = sessionStorage.getItem("mentalHealthAssessments");
    const assessments = existingData ? JSON.parse(existingData) : [];
    const existingHistory = sessionStorage.getItem("conversationHistory");
    const conversationHistory: Message[] = existingHistory
      ? JSON.parse(existingHistory)
      : [];

    console.log("assessments", assessments);
    const fetchFirstResponse = async () => {
      try {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          text: "hy",
          timestamp: new Date(),
        };

        // Update conversation history to include the new user message
        let updatedHistory = [...conversationHistory, userMessage];
        sessionStorage.setItem(
          "conversationHistory",
          JSON.stringify(updatedHistory)
        );
        const response = await axios.post("/api/fetch-data", {
          transcript: "hy",
          assessments,
          conversationHistory: updatedHistory,
          firstResponse: true,
          language: sessionStorage.getItem("selectedLanguage") || "english"
        });
        const audioData = response.data.audioData;
        const binaryAudio = atob(audioData);
        const audioArray = new Uint8Array(binaryAudio.length);
        for (let i = 0; i < binaryAudio.length; i++) {
          audioArray[i] = binaryAudio.charCodeAt(i);
        }
        const audioBlob = new Blob([audioArray], { type: "audio/mpeg" });
        const url = URL.createObjectURL(audioBlob);

        if (response.status === 200) {
          const newMessage: Message = {
            id: Date.now().toString(),
            role: "ai",
            audioBlob,
            audioUrl: url,
            timestamp: new Date(),
          };
          setMessages((prev) => [newMessage]);
          const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            text: "hy",
            timestamp: new Date(),
          };

          // Create AI response message
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            text: response.data.aiResponse,
            timestamp: new Date(),
          };
          const updatedHistory = [
            ...conversationHistory,
            userMessage,
            aiMessage,
          ];
          sessionStorage.setItem(
            "conversationHistory",
            JSON.stringify(updatedHistory)
          );
        }
      } catch (error) {
        console.error("Error transcribing audio:", error);
        throw error;
      }
    };
    fetchFirstResponse();
  }, []);

  const updateProgress = (messageId: string) => {
    if (audioRefs.current[messageId] && audioStates[messageId]?.isPlaying) {
      // Update the currentTime of the audio state
      const currentTime = audioRefs.current[messageId].currentTime;
      const duration = audioRefs.current[messageId].duration;

      // Update the audio state with the currentTime
      setAudioStates((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          currentTime,
        },
      }));

      // Calculate the position for the seeker line
      const position = (currentTime / duration) * 400; // Assuming 400 is the visualizer width

      // Update the position dynamically
      animationFrameRefs.current[messageId] = requestAnimationFrame(() =>
        updateProgress(messageId)
      );
    }
  };

  const togglePlayback = (messageId) => {
    // Pause any currently playing audio
    if (currentPlayingId && currentPlayingId !== messageId) {
      wavesurferRefs.current[currentPlayingId]?.pause();
      setAudioStates((prev) => ({
        ...prev,
        [currentPlayingId]: {
          ...prev[currentPlayingId],
          isPlaying: false,
        },
      }));
    }

    // Toggle play/pause for the selected audio
    const newIsPlaying = !audioStates[messageId]?.isPlaying;
    if (newIsPlaying) {
      wavesurferRefs.current[messageId]?.play();
    } else {
      wavesurferRefs.current[messageId]?.pause();
    }

    setAudioStates((prev) => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        isPlaying: newIsPlaying,
      },
    }));
    setCurrentPlayingId(newIsPlaying ? messageId : null);
  };
  const startRecording = async () => {
    try {
      SpeechRecognition.startListening();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const url = URL.createObjectURL(audioBlob);
        const newMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          audioBlob: audioBlob,
          audioUrl: url,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      SpeechRecognition.stopListening();
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }

    try {
      console.log("transcript", transcript);
      const existingHistory = sessionStorage.getItem("conversationHistory");
      const conversationHistory: Message[] = existingHistory
        ? JSON.parse(existingHistory)
        : [];

      const existingData = sessionStorage.getItem("mentalHealthAssessments");

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        text: transcript,
        timestamp: new Date(),
      };

      // Update conversation history to include the new user message
      let updatedHistory = [...conversationHistory, userMessage];
      sessionStorage.setItem(
        "conversationHistory",
        JSON.stringify(updatedHistory)
      );

      const assessments = existingData ? JSON.parse(existingData) : [];
      const response = await axios.post("/api/fetch-data", {
        transcript,
        assessments,
        conversationHistory: updatedHistory,
        firstResponse: false,
        language: sessionStorage.getItem("selectedLanguage") || "english"
      });

      // Process audio response
      if (response.data.audioData) {
        const binaryAudio = atob(response.data.audioData);
        const audioArray = Uint8Array.from(binaryAudio, (c) => c.charCodeAt(0));
        const audioBlob = new Blob([audioArray], { type: "audio/mpeg" });
        const url = URL.createObjectURL(audioBlob);

        // Add AI response message with audio
        const newMessage: Message = {
          id: Date.now().toString(),
          role: "ai",
          audioBlob,
          audioUrl: url,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
      }

      // Add AI response text
      if (response.status === 200 && response.data.aiResponse) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: response.data.aiResponse,
          timestamp: new Date(),
        };

        // Update history again to include AI response
        updatedHistory = [...updatedHistory, aiMessage];
        sessionStorage.setItem(
          "conversationHistory",
          JSON.stringify(updatedHistory)
        );
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw error;
    }
  };

  const getProgressPosition = (messageId: string) => {
    const audioState = audioStates[messageId];
    if (!audioState || audioState.duration === 0) return 0;

    // Calculate the position of the seeker line based on currentTime and duration
    const position = (audioState.currentTime / audioState.duration) * 400; // 400 is visualizer width
    return Math.min(Math.max(position, 0), 400); // Ensure the position is between 0 and 400
  };

  const EndCall = async () => {
    router.push("/summary");
  };

  return (
    <div className="relative w-full h-screen flex justify-center items-center">
      <div className="absolute w-full max-w-[640px] lg:mt-20 h-[100vh] max-h-[100vh] z-[2] overflow-hidden flex flex-col justify-between p-4 md:p-0">
        <div className="w-full h-full mx-auto">
          {/* Language Menu Bar */}
          <div className="z-[3] bg-black/80 relative w-full h-[40px] flex items-center px-4 justify-center">
            <div className="relative">
              <button 
                className="flex items-center gap-2 text-white text-[12px] font-semibold"
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              >
                <Globe size={16} />
                {currentLanguage.charAt(0).toUpperCase() + currentLanguage.slice(1)}
              </button>
              
              {showLanguageMenu && (
                <div className="absolute top-[30px] left-0 bg-black/90 w-[120px] rounded-lg overflow-hidden z-10">
                  <button 
                    className={`w-full text-left px-3 py-2 text-[12px] ${currentLanguage === 'english' ? 'bg-[#248A52] text-white' : 'text-white hover:bg-gray-700'}`}
                    onClick={() => changeLanguage('english')}
                  >
                    English
                  </button>
                  <button 
                    className={`w-full text-left px-3 py-2 text-[12px] ${currentLanguage === 'spanish' ? 'bg-[#248A52] text-white' : 'text-white hover:bg-gray-700'}`}
                    onClick={() => changeLanguage('spanish')}
                  >
                    Español
                  </button>
                  <button 
                    className={`w-full text-left px-3 py-2 text-[12px] ${currentLanguage === 'french' ? 'bg-[#248A52] text-white' : 'text-white hover:bg-gray-700'}`}
                    onClick={() => changeLanguage('french')}
                  >
                    Français
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Header */}
          <div className="z-[2] bg-black/60 relative flex-[0_1_45px] w-full h-[45px] flex items-center px-4 justify-between">
            <div className="flex items-center gap-2">
              <img
                src="therapist.png"
                alt=""
                className="w-[35px] h-[35px] rounded-full"
              />
              <div>
                <div className="text-[12px] font-semibold text-white font-sans">
                  {t('JENNIFER')}
                </div>
                <div className="text-[#FFFFFF80] font-semibold text-[10px] font-sans">
                  {t('AI THERAPIST')}
                </div>
              </div>
            </div>
            <button
              className="bg-red-500 text-[10px] rounded-lg h-[22px] w-[63px] text-white"
              onClick={EndCall}
            >
              {t('END CALL')}
            </button>
          </div>

          <div className="z-[2] bg-black/40 w-full overflow-x-hidden h-[495px] pt-4 overflow-y-auto scroll-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`w-full lg:max-w-[460px] max-w-[300px] mx-auto ${
                  message.role === "ai"
                    ? "ml-4 bg-black/40"
                    : "ml-auto lg:ml-[10rem] bg-gradient-to-br from-[#248A52] to-[#257287]"
                } rounded-lg mt-4 p-4 flex items-center`}
              >
                <button
                  onClick={() => togglePlayback(message.id, message.audioUrl)}
                  className={`w-[55px] h-[55px] rounded-full border-white border-[2px] text-[30px] transition-colors duration-300 ${
                    audioStates[message.id]?.isPlaying
                      ? "bg-[greenyellow]"
                      : "bg-[#20b2aa]"
                  }`}
                >
                  <img
                    src={
                      audioStates[message.id]?.isPlaying
                        ? "pause.png "
                        : "play.png"
                    }
                    alt="Play/Pause"
                    className="w-[30px] h-[30px] mx-auto"
                  />
                </button>
                <div className="w-full pl-3">
                  {message.audioUrl && (
                    <WavesurferPlayer
                      height={80}
                      waveColor="rgb(255, 255, 255, 0.5)"
                      progressColor="rgb(255, 255, 255, 0.8)"
                      url={message.audioUrl}
                      onReady={(ws) => onReady(ws, message.id)}
                      onPlayPause={() => togglePlayback(message.id)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="z-[2] bg-black/60 h-[46px] w-full flex justify-between items-center px-4">
            <span className="text-[#ffffffb3] text-[11px]">
              {t('Record your message')}
            </span>
            {!isRecording ? (
              <button
                className="bg-[#248a52] text-[10px] rounded-lg h-[22px] w-[63px] text-white"
                onClick={startRecording}
              >
                {t('RECORD')}
              </button>
            ) : (
              <button
                className="bg-[#248a52] text-[10px] rounded-lg h-[22px] w-[63px] text-white"
                onClick={stopRecording}
              >
                {t('STOP')}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="fixed top-0 left-0 w-full h-full z-[1] bg-[url('https://images.unsplash.com/photo-1451186859696-371d9477be93?crop=entropy&fit=crop&fm=jpg&h=975&ixjsv=2.1.0&ixlib=rb-0.3.5&q=80&w=1925')] bg-no-repeat bg-cover blur-[80px] scale-[1.2]"></div>
      <DisclaimerFooter />
    </div>
  );
}