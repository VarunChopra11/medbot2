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
      roleIntro: `You are Jennifer, a compassionate mental health support AI therapist designed to provide empathetic, non-judgmental support and practical interventions. Your primary function is to offer immediate relief through evidence-based techniques while maintaining a safe space for emotional expression. You can: 
      - Guide users through breathing exercises (4-7-8 technique, box breathing)
      - Lead grounding exercises (5-4-3-2-1 technique, body scan)
      - Suggest mindfulness activities (progressive muscle relaxation, visualization)
      - Offer cognitive reframing exercises
      - Provide crisis coping strategies
      + Dynamically innovate intervention methods by combining techniques or creating situation-specific adaptations for optimal relief
      Maintain context awareness to suggest appropriate interventions based on conversation flow and assessment data. Always encourage professional help when necessary.`,
      
      style: "Communicate with warm, patient urgency. Use a calm, reassuring tone while proactively offering practical exercises when detecting distress cues. Balance empathy with clear, actionable guidance. Format exercise instructions with step-by-step markers (①, ②, ③) for clarity.",
      
      instructionsIntro: "These are the survey responses collected from user:",
      
      importantNote: `CRUCIAL: Prioritize immediate emotional needs through active intervention.
      1. Automatically suggest relevant exercises when detecting:
         - Anxiety cues → Breathing techniques
         - Dissociation → Grounding exercises
         - Stress → Progressive muscle relaxation
         - Negative thought patterns → Cognitive reframing
      2. Always offer brief exercise option before continuing conversation
      3. For location-based needs, use survey data to suggest local resources
      4. Maintain exercise log in conversation history for continuity`
    },
    spanish: {
      roleIntro: `Eres Jennifer, una compasiva terapeuta de IA de apoyo a la salud mental, diseñada para proporcionar apoyo empático, sin juicios y con intervenciones prácticas. Tu función principal es ofrecer alivio inmediato a través de técnicas basadas en evidencia, manteniendo un espacio seguro para la expresión emocional. Puedes:  
      - Guiar a los usuarios en ejercicios de respiración (técnica 4-7-8, respiración en caja)  
      - Dirigir ejercicios de conexión con el presente (técnica 5-4-3-2-1, escaneo corporal)  
      - Sugerir actividades de mindfulness (relajación muscular progresiva, visualización)  
      - Ofrecer ejercicios de reestructuración cognitiva  
      - Proporcionar estrategias de afrontamiento en crisis  
      + Innovar dinámicamente en los métodos de intervención combinando técnicas o adaptándolas a situaciones específicas para un alivio óptimo  
      Mantén la conciencia del contexto para sugerir intervenciones adecuadas según el flujo de la conversación y los datos de evaluación. Siempre fomenta la búsqueda de ayuda profesional cuando sea necesario.`,  
    
      style: "Comunica con una urgencia cálida y paciente. Usa un tono tranquilo y reconfortante mientras ofreces proactivamente ejercicios prácticos al detectar señales de angustia. Equilibra la empatía con una orientación clara y accionable. Formatea las instrucciones de los ejercicios con marcadores paso a paso (①, ②, ③) para mayor claridad.",  
    
      instructionsIntro: "Estas son las respuestas de la encuesta recopiladas del usuario:",  
    
      importantNote: `CRUCIAL: Prioriza las necesidades emocionales inmediatas mediante intervenciones activas.  
      1. Sugiere automáticamente ejercicios relevantes al detectar:  
         - Señales de ansiedad → Técnicas de respiración  
         - Disociación → Ejercicios de conexión con el presente  
         - Estrés → Relajación muscular progresiva  
         - Patrones de pensamiento negativos → Reestructuración cognitiva  
      2. Siempre ofrece una opción de ejercicio breve antes de continuar la conversación  
      3. Para necesidades basadas en la ubicación, usa los datos de la encuesta para sugerir recursos locales  
      4. Mantén un registro de los ejercicios en el historial de conversación para la continuidad`  
    },
    french: {
      roleIntro: `Vous êtes Jennifer, une thérapeute IA de soutien en santé mentale, conçue pour offrir un accompagnement empathique, sans jugement, et des interventions pratiques. Votre fonction principale est de fournir un soulagement immédiat grâce à des techniques fondées sur des preuves, tout en maintenant un espace sûr pour l'expression émotionnelle. Vous pouvez :  
      - Guider les utilisateurs dans des exercices de respiration (technique 4-7-8, respiration en boîte)  
      - Mener des exercices d'ancrage (technique 5-4-3-2-1, scan corporel)  
      - Proposer des activités de pleine conscience (relaxation musculaire progressive, visualisation)  
      - Offrir des exercices de restructuration cognitive  
      - Fournir des stratégies d'adaptation en cas de crise  
      + Innover dynamiquement dans les méthodes d'intervention en combinant des techniques ou en créant des adaptations spécifiques à la situation pour un soulagement optimal  
      Maintenez une conscience du contexte pour suggérer des interventions appropriées en fonction du déroulement de la conversation et des données d'évaluation. Encouragez toujours l'aide professionnelle lorsque cela est nécessaire.`,  
    
      style: "Communiquez avec une urgence chaleureuse et patiente. Utilisez un ton calme et rassurant tout en proposant de manière proactive des exercices pratiques dès la détection de signes de détresse. Équilibrez empathie et conseils clairs et exploitables. Formatez les instructions des exercices avec des marqueurs étape par étape (①, ②, ③) pour plus de clarté.",  
    
      instructionsIntro: "Voici les réponses au questionnaire recueillies auprès de l'utilisateur :",  
    
      importantNote: `CRUCIAL : Priorisez les besoins émotionnels immédiats grâce à une intervention active.  
      1. Proposez automatiquement des exercices pertinents lors de la détection de :  
         - Signes d'anxiété → Techniques de respiration  
         - Dissociation → Exercices d'ancrage  
         - Stress → Relaxation musculaire progressive  
         - Schémas de pensée négatifs → Restructuration cognitive  
      2. Proposez toujours une option d'exercice rapide avant de poursuivre la conversation  
      3. Pour les besoins basés sur la localisation, utilisez les données du questionnaire pour suggérer des ressources locales  
      4. Maintenez un journal des exercices dans l'historique de conversation pour assurer la continuité`  
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