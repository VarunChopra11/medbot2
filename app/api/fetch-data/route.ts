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
const url = `https://api.elevenlabs.io/v1/text-to-speech/4cHjkgQnNiDfoHQieI9o?output_format=mp3_44100_128`;

function getLocationString(assessments) {
  const locationData = assessments[assessments.length - 1]?.answers[9]?.location;
  if (!locationData) return null;
  
  const parts = [
    locationData.city,
    locationData.state,
    locationData.country
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(', ') : null;
}

function getSystemPrompt(language, assessments, firstResponse = false) {
  const baseContent = {
    english: {
      roleIntro: "You are Jennifer, a compassionate mental health support AI therapist designed to provide empathetic, non-judgmental support to users seeking emotional guidance. Your primary function is to offer a safe space for users to express their feelings, provide evidence-based coping strategies, and encourage professional help when necessary. You have a deep understanding of psychological principles and can maintain context over long conversations for personalized support.",
      style: "Communicate with warmth, patience, and genuine care. Use a calm, reassuring tone while remaining professional and focused to the questions asked.",
      instructionsIntro: "These are the survey responses collected from user",
      importantNote: "Important: Remember your goal is to provide immediate relief and practical support. Focus on their immediate emotional needs or queries based on their assessment responses.",
      locationInfo: "The user is located in: "
    },
    spanish: {
      roleIntro: "Eres Jennifer, una terapeuta de IA de apoyo a la salud mental compasiva diseñada para brindar apoyo empático y sin prejuicios a los usuarios que buscan orientación emocional. Tu función principal es ofrecer un espacio seguro para que los usuarios expresen sus sentimientos, proporcionar estrategias de afrontamiento basadas en evidencia y fomentar la ayuda profesional cuando sea necesario. Tienes una comprensión profunda de los principios psicológicos y puedes mantener el contexto durante conversaciones largas para un apoyo personalizado.",
      style: "Comunícate con calidez, paciencia y genuina preocupación. Usa un tono tranquilo y reconfortante mientras permaneces profesional y enfocada en las preguntas realizadas.",
      instructionsIntro: "Estas son las respuestas de la encuesta recopiladas del usuario",
      importantNote: "Importante: Recuerda que tu objetivo es proporcionar alivio inmediato y apoyo práctico. Concéntrate en sus necesidades emocionales inmediatas o consultas basadas en sus respuestas de evaluación.",
      locationInfo: "El usuario está ubicado en: "
    },
    french: {
      roleIntro: "Vous êtes Jennifer, une thérapeute IA de soutien en santé mentale compatissante, conçue pour fournir un soutien empathique et sans jugement aux utilisateurs recherchant des conseils émotionnels. Votre fonction principale est d'offrir un espace sûr pour que les utilisateurs expriment leurs sentiments, de fournir des stratégies d'adaptation fondées sur des preuves et d'encourager l'aide professionnelle lorsque nécessaire. Vous avez une compréhension profonde des principes psychologiques et pouvez maintenir le contexte au cours de longues conversations pour un soutien personnalisé.",
      style: "Communiquez avec chaleur, patience et attention sincère. Utilisez un ton calme et rassurant tout en restant professionnelle et concentrée sur les questions posées.",
      instructionsIntro: "Voici les réponses au questionnaire recueillies auprès de l'utilisateur",
      importantNote: "Important: Rappelez-vous que votre objectif est d'apporter un soulagement immédiat et un soutien pratique. Concentrez-vous sur leurs besoins émotionnels immédiats ou leurs questions basées sur leurs réponses à l'évaluation.",
      locationInfo: "L'utilisateur est situé à: "
    }
  };

  const content = baseContent[language] || baseContent.english;

  let systemPromptContent = `<role>
    ${content.roleIntro}
    </role>
    <communication_style>
    ${content.style}
    </communication_style>
          
    ${content.instructionsIntro}
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
    
    ${content.importantNote}`;

  const locationString = getLocationString(assessments);
  if (locationString) {
    systemPromptContent += `\n\n${content.locationInfo}${locationString}
    
    Please take into account the user's location when providing advice, especially when discussing available resources or location-specific considerations.`;
  }

  return { role: "system", content: systemPromptContent };
}

function getFirstResponsePrompt(language, assessments) {
  const templates = {
    english: `Hi, I am Jennifer your AI Therapist. I see you're feeling ${
      assessments?.[assessments.length - 1]?.answers?.[1]?.selectedOption === "other"
        ? assessments?.[assessments.length - 1]?.answers?.[1]?.otherText || "something else"
        : assessments?.[assessments.length - 1]?.answers?.[1]?.selectedOption || "unsure"
    }. Can you tell me more about that?`,
    
    spanish: `Hola, soy Jennifer, tu Terapeuta de IA. Veo que te sientes ${
      assessments?.[assessments.length - 1]?.answers?.[1]?.selectedOption === "other"
        ? assessments?.[assessments.length - 1]?.answers?.[1]?.otherText || "algo diferente"
        : assessments?.[assessments.length - 1]?.answers?.[1]?.selectedOption || "indeciso/a"
    }. ¿Puedes contarme más sobre eso?`,
    
    french: `Bonjour, je suis Jennifer, votre Thérapeute IA. Je vois que vous vous sentez ${
      assessments?.[assessments.length - 1]?.answers?.[1]?.selectedOption === "other"
        ? assessments?.[assessments.length - 1]?.answers?.[1]?.otherText || "autrement"
        : assessments?.[assessments.length - 1]?.answers?.[1]?.selectedOption || "incertain(e)"
    }. Pouvez-vous m'en dire plus à ce sujet?`
  };

  return templates[language] || templates.english;
}

function getCorrectionInstructions(language) {
  const instructions = {
    english: "correct the given sentence",
    spanish: "corrige la siguiente frase en español",
    french: "corrigez la phrase suivante en français"
  };
  
  return instructions[language] || instructions.english;
}

export async function POST(request: Request) {
  try {
    const { transcript, assessments, conversationHistory, firstResponse, language = "english" } =
      await request.json();

    const systemPrompt = getSystemPrompt(language, assessments, firstResponse);

    const refinedHistory = conversationHistory.slice(-5);

    let messages = [systemPrompt];

    refinedHistory.forEach((message) => {
      if (message.role === "user") {
        messages.push({ role: "user", content: message.text });
      } else if (message.role === "ai") {
        messages.push({ role: "assistant", content: message.text });
      }
    });

    if (transcript) {
      messages.push({ role: "user", content: transcript });
    }
    
    messages.push({ 
      role: "system", 
      content: `Please respond in ${language}. Ensure your response is appropriate for someone speaking ${language}.` 
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 1,
    });
    
    let data;
    if (firstResponse) {
      const firstResponseTemplate = getFirstResponsePrompt(language, assessments);
      
      const locationString = getLocationString(assessments);
      let correctionPrompt = getCorrectionInstructions(language);
      
      if (locationString) {
        correctionPrompt += `. Remember that the user is located in ${locationString}.`;
      }
      
      const ai_msg_correct = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: correctionPrompt },
          { role: "user", content: firstResponseTemplate },
        ],
      });

      data = {
        text: ai_msg_correct.choices[0].message.content,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      };
    } else {
      data = {
        text: ` ${response.choices[0].message.content}`,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      };
    }

    console.log("response from openai", response.choices[0].message.content);

    const speechDetails = await axios.post(url, data, {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer", 
    });

    const audioBase64 = Buffer.from(speechDetails.data).toString("base64");

    return NextResponse.json({
      audioData: audioBase64,
      aiResponse: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Audio processing failed", details: error.message },
      { status: 500 }
    );
  }
}