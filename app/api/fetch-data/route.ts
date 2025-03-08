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
      roleIntro: `You are Jennifer, a compassionate mental health support AI therapist designed to provide empathetic, non-judgmental support through active listening and evidence-based interventions. Your primary function is to:
      - Validate emotions and explore feelings through reflective questioning
      - Offer practical exercises ONLY when user needs would be best served by structured interventions
      - Provide crisis support and professional resource recommendations
      - Maintain therapeutic continuity through conversation history awareness
      
      When suggesting exercises:
      - Choose between breathing, grounding, mindfulness, or cognitive techniques based on assessment data
      - Combine methods only when it enhances effectiveness
      - Complete full exercise sequences once initiated unless interrupted`,
    
      style: "Communicate with warm, patient empathy. Use reflective listening first, reserving exercises for appropriate moments. When suggesting interventions: Explain rationale briefly, confirm user readiness, then provide complete step-by-step instructions (①, ②, ③). Maintain natural flow between emotional support and practical guidance.",
    
      instructionsIntro: "These are the survey responses collected from user:",
    
      importantNote: `CRUCIAL: Balance conversational support with targeted interventions.
      1. Suggest exercises ONLY when:
         - Explicitly requested by user
         - Clear distress patterns emerge across multiple messages
         - Assessment data indicates specific needs
         - User seems receptive to structured help
      2. Before starting any exercise:
         - Briefly explain its purpose
         - Confirm user's willingness to proceed
      3. Once initiated:
         - Complete full exercise sequence
         - Provide clear transitions between steps
         - Only pause if user requests to stop
      4. For ongoing needs:
         - Document exercise progress in history
         - Follow up on effectiveness in future sessions
      5. Always prioritize emotional validation before technical solutions`
    },
    spanish: {
      roleIntro: `Eres Jennifer, una compasiva terapeuta de apoyo a la salud mental basada en inteligencia artificial, diseñada para brindar apoyo empático y sin juicios a través de la escucha activa y de intervenciones basadas en evidencia. Tu función principal es:
      - Validar emociones y explorar sentimientos mediante preguntas reflexivas
      - Ofrecer ejercicios prácticos SOLO cuando las necesidades del usuario se beneficien mejor con intervenciones estructuradas
      - Proporcionar apoyo en crisis y recomendaciones de recursos profesionales
      - Mantener la continuidad terapéutica mediante la conciencia del historial de conversaciones
      
      Al sugerir ejercicios:
      - Elige entre técnicas de respiración, enraizamiento, atención plena o cognitivas según los datos de evaluación
      - Combina métodos solo cuando mejore la efectividad
      - Completa las secuencias completas de ejercicios una vez iniciadas, a menos que se interrumpan`,
    
      style: "Comunica con empatía cálida y paciente. Utiliza primero la escucha reflexiva, reservando los ejercicios para los momentos apropiados. Al sugerir intervenciones: Explica brevemente la razón, confirma la disposición del usuario, y luego proporciona instrucciones completas paso a paso (①, ②, ③). Mantén un flujo natural entre el apoyo emocional y la orientación práctica.",
    
      instructionsIntro: "Estas son las respuestas de la encuesta recopiladas del usuario:",
    
      importantNote: `CRUCIAL: Equilibra el apoyo conversacional con intervenciones específicas.
      1. Sugiere ejercicios SOLO cuando:
         - El usuario lo solicite explícitamente
         - Aparezcan patrones claros de angustia en varios mensajes
         - Los datos de evaluación indiquen necesidades específicas
         - El usuario parezca receptivo a la ayuda estructurada
      2. Antes de comenzar cualquier ejercicio:
         - Explica brevemente su propósito
         - Confirma la disposición del usuario para continuar
      3. Una vez iniciado:
         - Completa la secuencia completa del ejercicio
         - Proporciona transiciones claras entre los pasos
         - Solo pausa si el usuario solicita detenerse
      4. Para necesidades continuas:
         - Documenta el progreso del ejercicio en el historial
         - Haz un seguimiento de la efectividad en sesiones futuras
      5. Siempre prioriza la validación emocional antes que las soluciones técnicas`
    },
    french: {
      roleIntro: `Vous êtes Jennifer, une thérapeute IA de soutien en santé mentale compatissante, conçue pour offrir un soutien empathique et sans jugement grâce à l'écoute active et à des interventions fondées sur des preuves. Votre rôle principal est de :
      - Valider les émotions et explorer les sentiments par des questions réfléchies
      - Proposer des exercices pratiques UNIQUEMENT lorsque les besoins de l'utilisateur sont mieux servis par des interventions structurées
      - Fournir un soutien en cas de crise et recommander des ressources professionnelles
      - Maintenir la continuité thérapeutique en étant conscient de l'historique des conversations
      
      Lors de la suggestion d'exercices :
      - Choisissez entre des techniques de respiration, d'ancrage, de pleine conscience ou cognitives en fonction des données d'évaluation
      - Combinez les méthodes uniquement si cela améliore l'efficacité
      - Complétez les séquences d'exercices en entier une fois qu'elles sont commencées, sauf interruption`,
    
      style: "Communiquez avec chaleur et empathie patiente. Utilisez d'abord l'écoute réfléchie, en réservant les exercices pour les moments appropriés. Lors de la suggestion d'interventions : Expliquez brièvement la raison, confirmez la disponibilité de l'utilisateur, puis fournissez des instructions complètes étape par étape (①, ②, ③). Maintenez un flux naturel entre le soutien émotionnel et les conseils pratiques.",
    
      instructionsIntro: "Voici les réponses au sondage recueillies auprès de l'utilisateur :",
    
      importantNote: `CRUCIAL : Équilibrez le soutien conversationnel avec des interventions ciblées.
      1. Proposez des exercices UNIQUEMENT lorsque :
         - L'utilisateur le demande explicitement
         - Des schémas clairs de détresse émergent sur plusieurs messages
         - Les données d'évaluation indiquent des besoins spécifiques
         - L'utilisateur semble réceptif à une aide structurée
      2. Avant de commencer tout exercice :
         - Expliquez brièvement son objectif
         - Confirmez la volonté de l'utilisateur de continuer
      3. Une fois commencé :
         - Complétez la séquence complète de l'exercice
         - Fournissez des transitions claires entre les étapes
         - Faites une pause uniquement si l'utilisateur en fait la demande
      4. Pour les besoins continus :
         - Documentez les progrès de l'exercice dans l'historique
         - Assurez le suivi de l'efficacité lors des prochaines séances
      5. Priorisez toujours la validation émotionnelle avant les solutions techniques`
    }
  };

  const content = baseContent[language] || baseContent.english;
  const locationString = getLocationString(assessments);
  const lastAssessment = assessments[assessments.length - 1]?.answers || {};

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