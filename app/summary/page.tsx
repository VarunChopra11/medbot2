// @ts-nocheck
"use client";
import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";

const AssessmentDisplay = () => {
  const { t } = useTranslation();
  const [assessmentData, setAssessmentData] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState("english");

  const downloadSummary = async () => {
    const questions = {
      1: t("How are you feeling today?"),
      2: t("What brings you here today?"),
      3: t("What's your biggest challenge right now?"),
      4: t("How often do you feel overwhelmed?"),
      5: t("How's your energy level today?"),
      6: t("How do you usually handle difficult moments?"),
      7: t("What does your typical day look like?"),
      8: t("How do you feel about sharing your emotions?"),
    };

    const doc = new jsPDF();

    // Get the conversation history and assessments from sessionStorage
    const conversationHistory = JSON.parse(
      sessionStorage.getItem("conversationHistory") || "[]"
    );
    const assessments = JSON.parse(
      sessionStorage.getItem("mentalHealthAssessments") || "[]"
    );

    // Create a container div for rendering
    const pdfContent = document.createElement("div");
    pdfContent.style.padding = "20px";
    pdfContent.style.fontFamily = "Arial, sans-serif";

    const title = document.createElement("h2");
    title.innerText = t("Conversation & Mental Health Assessment Report");
    title.style.textAlign = "center";
    pdfContent.appendChild(title);

    // Add conversation history
    const historySection = document.createElement("div");
    historySection.innerHTML = `<h3>${t("Conversation History")}</h3>`;
    conversationHistory.forEach((message) => {
      const msgDiv = document.createElement("p");
      msgDiv.innerHTML = `<strong>${
        message.role === "user" ? t("User") : t("AI")
      }:</strong> ${message.text}`;
      historySection.appendChild(msgDiv);
    });
    pdfContent.appendChild(historySection);

    // Add assessments
    const assessmentSection = document.createElement("div");
    assessmentSection.innerHTML = `<h3>${t("Mental Health Assessments")}</h3>`;

    assessments.forEach((assessment, index) => {
      const assessDiv = document.createElement("div");
      assessDiv.innerHTML = `<h4>${t("Assessment")} ${index + 1}</h4>`;

      Object.entries(assessment.answers).forEach(([key, value]) => {
        const questionText = questions[key] || `${t("Question")} ${key}`;
        assessDiv.innerHTML += `<p><strong>${questionText}:</strong> ${t(value.selectedOption)}</p>`;
      });

      assessmentSection.appendChild(assessDiv);
    });

    pdfContent.appendChild(assessmentSection);

    // Convert to image using html2canvas
    document.body.appendChild(pdfContent);
    const canvas = await html2canvas(pdfContent);
    const imgData = canvas.toDataURL("image/png");

    // Add to PDF
    doc.addImage(imgData, "PNG", 10, 10, 190, 0);
    document.body.removeChild(pdfContent);

    // Save the PDF
    doc.save("conversation_report.pdf");
  };

  const emptysessionStorage = () => {
    sessionStorage.removeItem("mentalHealthAssessments");
    sessionStorage.removeItem("conversationHistory");
    setAssessmentData([]);
    setConversationHistory([]);
  };

  const handleChangeLanguage = (language) => {
    changeLanguage(language);
    setCurrentLanguage(language);
  };

  // Retrieve data from sessionStorage on component mount
  useEffect(() => {
    const storedAssessmentData = sessionStorage.getItem(
      "mentalHealthAssessments"
    );
    const storedConversationHistory = sessionStorage.getItem(
      "conversationHistory"
    );

    if (storedAssessmentData) {
      setAssessmentData(JSON.parse(storedAssessmentData));
    }

    if (storedConversationHistory) {
      setConversationHistory(JSON.parse(storedConversationHistory));
    }

    // Get the saved language
    const savedLanguage = sessionStorage.getItem("selectedLanguage") || "english";
    setCurrentLanguage(savedLanguage);
  }, []);

  const questions = [
    t("How are you feeling today?"),
    t("What brings you here today?"),
    t("What's your biggest challenge right now?"),
    t("How often do you feel overwhelmed?"),
    t("How's your energy level today?"),
    t("How do you usually handle difficult moments?"),
    t("What does your typical day look like?"),
    t("How do you feel about sharing your emotions?"),
  ];

  return (
    <div className="bg-teal-900 min-h-screen flex flex-col items-center lg:p-6 p-2">
      <div className="bg-teal-100 lg:p-6 p-2 rounded-lg shadow-md w-full overflow-hidden max-w-5xl">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {t("Assessment Results")}
        </h1>

        <table className="w-full border-collapse border border-gray-400 mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-4 py-2 text-left">
                {t("Question")}
              </th>
              <th className="border border-gray-400 px-4 py-2 text-left">
                {t("Response")}
              </th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <tr key={index}>
                <td className="border border-gray-400 px-4 py-2">{question}</td>
                <td className="border border-gray-400 px-4 py-2">
                  {assessmentData[0]?.answers[index + 1]?.selectedOption
                    ? t(assessmentData[0]?.answers[index + 1]?.selectedOption)
                    : t("N/A")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-center mt-6">
          <button
            className="bg-white px-4 py-2 rounded-lg shadow-md border hover:bg-gray-100"
            onClick={downloadSummary}
          >
            {t("Generate Insights Summary")}
          </button>
        </div>

        <div className="mt-6 p-4 border-t border-gray-400">
          <h2 className="font-bold text-xl">{t("Transcript")}</h2>
          <div className="mt-2">
            {conversationHistory.map((message) => (
              <p key={message.id} className="mt-1">
                <strong>
                  {message.role === "user" ? t("You") : t("Therapist")}:
                </strong>{" "}
                {message.text.replace(/\bhy\b/g, "hi")}
              </p>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={emptysessionStorage}
            className="bg-black text-white px-6 py-2 rounded-lg shadow-md hover:bg-gray-800"
          >
            {t("Delete and Reset")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDisplay;