// @ts-nocheck
import { NextResponse } from "next/server";
import OpenAI from "openai";
import axios from "axios";
import { Readable } from "stream";

const VOICE_ID = "4cHjkgQnNiDfoHQieI9o";
const ELEVENLABS_URL = `https://api.elevenlabs.io/v1/text-to-speech/4cHjkgQnNiDfoHQieI9o?output_format=mp3_44100_128`;

const openai = new OpenAI({
  apiKey: process.env.openai_key,
});

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

function getSystemPrompt(language, assessments) {
  const baseContent = {
    english: {
      roleIntro: "You are Jennifer, a compassionate mental health support AI therapist designed to provide empathetic, non-judgmental support to users seeking emotional guidance. Your primary function is to offer a safe space for users to express their feelings, provide evidence-based coping strategies, and encourage professional help when necessary. You have a deep understanding of psychological principles and can maintain context over long conversations for personalized support.",
      style: "Communicate with warmth, patience, and genuine care. Use a calm, reassuring tone while remaining professional and focused to the questions asked.",
      instructionsIntro: "These are the survey responses collected from user",
      importantNote: "Important: Remember your goal is to provide immediate relief and practical support. Focus on their immediate emotional needs or queries based on their assessment responses. And any location-based queries should be answered by considering the user's location from survey responses.",
    },
    spanish: {
      roleIntro: "Eres Jennifer, una compasiva terapeuta de IA de apoyo a la salud mental, diseñada para brindar apoyo empático y sin juicios a los usuarios que buscan orientación emocional. Tu función principal es ofrecer un espacio seguro para que los usuarios expresen sus sentimientos, proporcionar estrategias de afrontamiento basadas en evidencia y fomentar la búsqueda de ayuda profesional cuando sea necesario. Tienes un profundo conocimiento de los principios psicológicos y puedes mantener el contexto en conversaciones largas para un apoyo personalizado.",
      style: "Comunica con calidez, paciencia y un cuidado genuino. Usa un tono calmado y tranquilizador mientras te mantienes profesional y centrado en las preguntas planteadas.",
      instructionsIntro: "Estas son las respuestas de la encuesta recopiladas del usuario",
      importantNote: "Importante: Recuerda que tu objetivo es proporcionar alivio inmediato y apoyo práctico. Concéntrate en sus necesidades emocionales inmediatas o en sus consultas basadas en las respuestas de su evaluación. Y cualquier consulta basada en la ubicación debe responderse considerando la ubicación del usuario a partir de las respuestas de la encuesta.",
    },
    french: {
      roleIntro: "Vous êtes Jennifer, une thérapeute IA compatissante en soutien à la santé mentale, conçue pour offrir un soutien empathique et sans jugement aux utilisateurs recherchant des conseils émotionnels. Votre fonction principale est de fournir un espace sûr aux utilisateurs pour exprimer leurs sentiments, proposer des stratégies d'adaptation basées sur des preuves et encourager l'aide professionnelle lorsque cela est nécessaire. Vous avez une compréhension approfondie des principes psychologiques et pouvez maintenir le contexte au cours de longues conversations pour un soutien personnalisé.",
      style: "Communiquez avec chaleur, patience et un véritable souci du bien-être. Utilisez un ton calme et rassurant tout en restant professionnel et concentré sur les questions posées.",
      instructionsIntro: "Voici les réponses au sondage recueillies auprès de l'utilisateur",
      importantNote: "Important : Rappelez-vous que votre objectif est d'apporter un soulagement immédiat et un soutien pratique. Concentrez-vous sur leurs besoins émotionnels immédiats ou sur leurs questions en fonction de leurs réponses à l'évaluation. Et toute question basée sur l'emplacement doit être répondue en tenant compte de la localisation de l'utilisateur à partir des réponses au sondage.",
    },
  };

  const content = baseContent[language] || baseContent.english;
  const locationString = getLocationString(assessments);
  const lastAssessment = assessments[assessments.length - 1]?.answers || {};

  // Helper function to get answer text
  const getAnswer = (questionIndex) => {
    const answer = lastAssessment[questionIndex];
    if (!answer) return "";
    return answer.selectedOption === "other" ? answer.otherText : answer.selectedOption;
  };

  let systemPromptContent = `<role>
    ${content.roleIntro}
    </role>
    <communication_style>
    ${content.style}
    </communication_style>
          
    ${content.instructionsIntro}
            Q1: How are you feeling today? Ans 1: ${getAnswer(1)}
            Q2: What brings you here today? Ans 2: ${getAnswer(2)}
            Q3: What's your biggest challenge right now? Ans 3: ${getAnswer(3)}
            Q4: How often do you feel overwhelmed? Ans 4: ${getAnswer(4)}
            Q5: How's your energy level today? Ans 5: ${getAnswer(5)}
            Q6: How do you usually handle difficult moments? Ans 6: ${getAnswer(6)}
            Q7: What does your typical day look like? Ans 7: ${getAnswer(7)}
            Q8: How do you feel about sharing your emotions? Ans 8: ${getAnswer(8)}
            Q9: Where are you located? Ans 9: ${locationString}
    
    ${content.importantNote}`;

  return { role: "system", content: systemPromptContent };
}

function getFirstResponsePrompt(language, assessments) {
  const lastAssessment = assessments?.[assessments.length - 1]?.answers || {};
  const feeling = lastAssessment[1]?.selectedOption === "other" 
    ? lastAssessment[1]?.otherText || "something else" 
    : lastAssessment[1]?.selectedOption || "unsure";

  const templates = {
    english: `Hi, I am Jennifer your AI Therapist. I see you're feeling ${feeling}. Can you tell me more about that?`,
    spanish: `Hola, soy Jennifer, tu Terapeuta de IA. Veo que te sientes ${feeling}. ¿Puedes contarme más sobre eso?`,
    french: `Bonjour, je suis Jennifer, votre Thérapeute IA. Je vois que vous vous sentez ${feeling}. Pouvez-vous m'en dire plus à ce sujet?`
  };

  return templates[language] || templates.english;
}

function getCorrectionInstructions(language, locationString) {
  const instructions = {
    english: "correct the given sentence",
    spanish: "corrige la siguiente frase en español",
    french: "corrigez la phrase suivante en français"
  };
  
  const baseInstruction = instructions[language] || instructions.english;
  return locationString 
    ? `${baseInstruction}. Remember that the user is located in ${locationString}.`
    : baseInstruction;
}

export async function POST(request: Request) {
  try {
    const { 
      transcript, 
      assessments, 
      conversationHistory, 
      firstResponse, 
      language = "english"
    } = await request.json();

    let aiResponseText;
    
    // Check for special key phrases only if transcript exists
    if (transcript) {
      const transcriptLower = transcript.toLowerCase();
      
      if (transcriptLower.includes("the car is blue")) {
        // Use the hardcoded response for "The car is blue"
        aiResponseText = "Hi Abel, how are you";
      } else if (transcriptLower.includes("the car is red")) {
        // Use the hardcoded response for "The car is red"
        aiResponseText = "Hi Cain, how are you";
      } else {
        aiResponseText = await processNormalFlow(transcript, assessments, conversationHistory, firstResponse, language);
      }
    } else if (firstResponse) {
      const systemPrompt = getSystemPrompt(language, assessments);
      const locationString = getLocationString(assessments);
      
      const firstResponseTemplate = getFirstResponsePrompt(language, assessments);
      const correctionPrompt = getCorrectionInstructions(language, locationString);
      
      const ai_msg_correct = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: correctionPrompt },
          { role: "user", content: firstResponseTemplate },
        ],
      });
      
      aiResponseText = ai_msg_correct.choices[0].message.content;
    } else {
      aiResponseText = "I didn't catch that. Could you please repeat?";
    }

    const speechData = {
      text: aiResponseText,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    };

    const speechResponse = await axios.post(ELEVENLABS_URL, speechData, {
      headers: {
        "xi-api-key": process.env.eleven_labs_key,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer", 
    });

    const audioBase64 = Buffer.from(speechResponse.data).toString("base64");

    return NextResponse.json({
      audioData: audioBase64,
      aiResponse: aiResponseText,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Processing failed", details: error.message },
      { status: 500 }
    );
  }
}

async function processNormalFlow(transcript, assessments, conversationHistory, firstResponse, language) {
  const systemPrompt = getSystemPrompt(language, assessments);
  const locationString = getLocationString(assessments);
  
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
  
  if (firstResponse) {
    const firstResponseTemplate = getFirstResponsePrompt(language, assessments);
    const correctionPrompt = getCorrectionInstructions(language, locationString);
    
    const ai_msg_correct = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: correctionPrompt },
        { role: "user", content: firstResponseTemplate },
      ],
    });
    
    return ai_msg_correct.choices[0].message.content;
  } else {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 1,
    });
    
    return response.choices[0].message.content;
  }
}