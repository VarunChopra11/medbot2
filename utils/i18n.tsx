import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  english: {
    translation: {
      // Questions
      "What language do you want to proceed in?": "What language do you want to proceed in?",
      "How are you feeling today?": "How are you feeling today?",
      "What brings you here today?": "What brings you here today?",
      "What's your biggest challenge right now?": "What's your biggest challenge right now?",
      "How often do you feel overwhelmed?": "How often do you feel overwhelmed?",
      "How's your energy level today?": "How's your energy level today?",
      "How do you usually handle difficult moments?": "How do you usually handle difficult moments?",
      "What does your typical day look like?": "What does your typical day look like?",
      "How do you feel about sharing your emotions?": "How do you feel about sharing your emotions?",
      
      // Common options
      "English": "English",
      "Spanish": "Spanish",
      "French": "French",
      
      // Feeling options
      "Calm": "Calm",
      "Anxious": "Anxious",
      "Sad": "Sad",
      "Angry": "Angry",
      "Overwhelmed": "Overwhelmed",
      "Other": "Other",
      
      // Reason options
      "Stress": "Stress",
      "Relationships": "Relationships", 
      "Self-reflection": "Self-reflection",
      "Building confidence": "Building confidence",
      "Challenges": "Challenges",
      
      // Challenge options
      "Work": "Work",
      "Motivation": "Motivation",
      "Managing emotions": "Managing emotions",
      "Confidence": "Confidence",
      
      // Frequency options
      "Daily": "Daily",
      "Weekly": "Weekly",
      "Monthly": "Monthly",
      "Rarely": "Rarely",
      "Never": "Never",
      
      // Energy options
      "High": "High",
      "Moderate": "Moderate",
      "Low": "Low",
      "Very low": "Very low",
      
      // Coping options
      "Talking": "Talking",
      "Exercise": "Exercise",
      "Self-care": "Self-care",
      "Hobbies": "Hobbies",
      "Avoidance": "Avoidance",
      
      // Day type options
      "Productive": "Productive",
      "Busy": "Busy",
      "Unstructured": "Unstructured",
      "Relaxed": "Relaxed",
      
      // Comfort options
      "Very comfortable": "Very comfortable",
      "Somewhat comfortable": "Somewhat comfortable",
      "Not comfortable": "Not comfortable",
      "Uncomfortable": "Uncomfortable",
      
      // UI elements
      "Please specify...": "Please specify...",
      "Next": "Next",
      "Connect to Therapist": "Connect to Therapist",
      "The therapist is reviewing your form...": "The therapist is reviewing your form...",
    
      "Assessment Results": "Assessment Results",
      "Question": "Question",
      "Response": "Response",
      "N/A": "N/A",
      "Generate Insights Summary": "Generate Insights Summary",
      "Transcript": "Transcript",
      "You": "You",
      "Therapist": "Therapist",
      "Delete and Reset": "Delete and Reset",
      "Conversation & Mental Health Assessment Report": "Conversation & Mental Health Assessment Report",
      "Conversation History": "Conversation History",
      "Mental Health Assessments": "Mental Health Assessments",
      "Assessment": "Assessment",
      "User": "User",
      "AI": "AI"
    
    }
  },
  spanish: {
    translation: {
      // Questions
      "What language do you want to proceed in?": "¿En qué idioma deseas continuar?",
      "How are you feeling today?": "¿Cómo te sientes hoy?",
      "What brings you here today?": "¿Qué te trae por aquí hoy?",
      "What's your biggest challenge right now?": "¿Cuál es tu mayor desafío en este momento?",
      "How often do you feel overwhelmed?": "¿Con qué frecuencia te sientes abrumado/a?",
      "How's your energy level today?": "¿Cómo está tu nivel de energía hoy?",
      "How do you usually handle difficult moments?": "¿Cómo sueles manejar los momentos difíciles?",
      "What does your typical day look like?": "¿Cómo es tu día típico?",
      "How do you feel about sharing your emotions?": "¿Cómo te sientes al compartir tus emociones?",
      
      // Common options
      "English": "Inglés",
      "Spanish": "Español",
      "French": "Francés",
      
      // Feeling options
      "Calm": "Tranquilo/a",
      "Anxious": "Ansioso/a",
      "Sad": "Triste",
      "Angry": "Enojado/a",
      "Overwhelmed": "Abrumado/a",
      "Other": "Otro",
      
      // Reason options
      "Stress": "Estrés",
      "Relationships": "Relaciones", 
      "Self-reflection": "Auto-reflexión",
      "Building confidence": "Construir confianza",
      "Challenges": "Desafíos",
      
      // Challenge options
      "Work": "Trabajo",
      "Motivation": "Motivación",
      "Managing emotions": "Manejar emociones",
      "Confidence": "Confianza",
      
      // Frequency options
      "Daily": "Diariamente",
      "Weekly": "Semanalmente",
      "Monthly": "Mensualmente",
      "Rarely": "Raramente",
      "Never": "Nunca",
      
      // Energy options
      "High": "Alta",
      "Moderate": "Moderada",
      "Low": "Baja",
      "Very low": "Muy baja",
      
      // Coping options
      "Talking": "Hablar",
      "Exercise": "Ejercicio",
      "Self-care": "Autocuidado",
      "Hobbies": "Pasatiempos",
      "Avoidance": "Evitación",
      
      // Day type options
      "Productive": "Productivo",
      "Busy": "Ocupado",
      "Unstructured": "Desestructurado",
      "Relaxed": "Relajado",
      
      // Comfort options
      "Very comfortable": "Muy cómodo/a",
      "Somewhat comfortable": "Algo cómodo/a",
      "Not comfortable": "No cómodo/a",
      "Uncomfortable": "Incómodo/a",
      
      // UI elements
      "Please specify...": "Por favor, especifica...",
      "Next": "Siguiente",
      "Connect to Therapist": "Conectar con el Terapeuta",
      "The therapist is reviewing your form...": "El terapeuta está revisando tu formulario...",
    
      "Assessment Results": "Resultados de la Evaluación",
      "Question": "Pregunta",
      "Response": "Respuesta",
      "N/A": "N/D",
      "Generate Insights Summary": "Generar Resumen de Perspectivas",
      "Transcript": "Transcripción",
      "You": "Tú",
      "Therapist": "Terapeuta",
      "Delete and Reset": "Eliminar y Reiniciar",
      "Conversation & Mental Health Assessment Report": "Informe de Conversación y Evaluación de Salud Mental",
      "Conversation History": "Historial de Conversación",
      "Mental Health Assessments": "Evaluaciones de Salud Mental",
      "Assessment": "Evaluación",
      "User": "Usuario",
      "AI": "IA"
    }
  },
  french: {
    translation: {
      // Questions
      "What language do you want to proceed in?": "Dans quelle langue souhaitez-vous continuer ?",
      "How are you feeling today?": "Comment vous sentez-vous aujourd'hui ?",
      "What brings you here today?": "Qu'est-ce qui vous amène ici aujourd'hui ?",
      "What's your biggest challenge right now?": "Quel est votre plus grand défi en ce moment ?",
      "How often do you feel overwhelmed?": "À quelle fréquence vous sentez-vous dépassé(e) ?",
      "How's your energy level today?": "Comment est votre niveau d'énergie aujourd'hui ?",
      "How do you usually handle difficult moments?": "Comment gérez-vous habituellement les moments difficiles ?",
      "What does your typical day look like?": "À quoi ressemble votre journée typique ?",
      "How do you feel about sharing your emotions?": "Comment vous sentez-vous à l'idée de partager vos émotions ?",
      
      // Common options
      "English": "Anglais",
      "Spanish": "Espagnol",
      "French": "Français",
      
      // Feeling options
      "Calm": "Calme",
      "Anxious": "Anxieux/se",
      "Sad": "Triste",
      "Angry": "En colère",
      "Overwhelmed": "Dépassé(e)",
      "Other": "Autre",
      
      // Reason options
      "Stress": "Stress",
      "Relationships": "Relations", 
      "Self-reflection": "Auto-réflexion",
      "Building confidence": "Renforcer la confiance",
      "Challenges": "Défis",
      
      // Challenge options
      "Work": "Travail",
      "Motivation": "Motivation",
      "Managing emotions": "Gérer les émotions",
      "Confidence": "Confiance",
      
      // Frequency options
      "Daily": "Quotidiennement",
      "Weekly": "Hebdomadairement",
      "Monthly": "Mensuellement",
      "Rarely": "Rarement",
      "Never": "Jamais",
      
      // Energy options
      "High": "Élevé",
      "Moderate": "Modéré",
      "Low": "Bas",
      "Very low": "Très bas",
      
      // Coping options
      "Talking": "Parler",
      "Exercise": "Exercice",
      "Self-care": "Prendre soin de soi",
      "Hobbies": "Loisirs",
      "Avoidance": "Évitement",
      
      // Day type options
      "Productive": "Productif",
      "Busy": "Occupé",
      "Unstructured": "Non structuré",
      "Relaxed": "Détendu",
      
      // Comfort options
      "Very comfortable": "Très à l'aise",
      "Somewhat comfortable": "Plutôt à l'aise",
      "Not comfortable": "Pas à l'aise",
      "Uncomfortable": "Mal à l'aise",
      
      // UI elements
      "Please specify...": "Veuillez préciser...",
      "Next": "Suivant",
      "Connect to Therapist": "Se connecter au thérapeute",
      "The therapist is reviewing your form...": "Le thérapeute examine votre formulaire...",
    
      "Assessment Results": "Résultats de l'Évaluation",
      "Question": "Question",
      "Response": "Réponse",
      "N/A": "N/D",
      "Generate Insights Summary": "Générer un Résumé des Analyses",
      "Transcript": "Transcription",
      "You": "Vous",
      "Therapist": "Thérapeute",
      "Delete and Reset": "Supprimer et Réinitialiser",
      "Conversation & Mental Health Assessment Report": "Rapport de Conversation et d'Évaluation de Santé Mentale",
      "Conversation History": "Historique de Conversation",
      "Mental Health Assessments": "Évaluations de Santé Mentale",
      "Assessment": "Évaluation",
      "User": "Utilisateur",
      "AI": "IA"
    
    }
  }
};

// Helper function to safely get language preference
const getSavedLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("selectedLanguage") || "english";
  }
  return "english"; // Default fallback for server-side rendering
};

const i18nConfig = {
  resources,
  lng: getSavedLanguage(),
  fallbackLng: "english",
  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: false // Helps prevent issues during rendering
  }
};

// Only initialize once
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init(i18nConfig);
}

// Function to change language programmatically
export const changeLanguage = (language: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem("selectedLanguage", language);
  }
  i18n.changeLanguage(language);
};

export default i18n;