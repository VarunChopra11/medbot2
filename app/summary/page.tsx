// @ts-nocheck
"use client";
import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const AssessmentDisplay = () => {
  const [assessmentData, setAssessmentData] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);

  const downloadSummary = async () => {
    const questions = {
      1: "How are you feeling today?",
      2: "What brings you here today?",
      3: "What's your biggest challenge right now?",
      4: "How often do you feel overwhelmed?",
      5: "How's your energy level today?",
      6: "How do you usually handle difficult moments?",
      7: "What does your typical day look like?",
      8: "How do you feel about sharing your emotions?",
    };

    const doc = new jsPDF();

    // Get the conversation history and assessments from localStorage
    const conversationHistory = JSON.parse(
      localStorage.getItem("conversationHistory") || "[]"
    );
    const assessments = JSON.parse(
      localStorage.getItem("mentalHealthAssessments") || "[]"
    );

    // Create a container div for rendering
    const pdfContent = document.createElement("div");
    pdfContent.style.padding = "20px";
    pdfContent.style.fontFamily = "Arial, sans-serif";

    const title = document.createElement("h2");
    title.innerText = "Conversation & Mental Health Assessment Report";
    title.style.textAlign = "center";
    pdfContent.appendChild(title);

    // Add conversation history
    const historySection = document.createElement("div");
    historySection.innerHTML = "<h3>Conversation History</h3>";
    conversationHistory.forEach((message) => {
      const msgDiv = document.createElement("p");
      msgDiv.innerHTML = `<strong>${
        message.role === "user" ? "User" : "AI"
      }:</strong> ${message.text}`;
      historySection.appendChild(msgDiv);
    });
    pdfContent.appendChild(historySection);

    // Add assessments
    const assessmentSection = document.createElement("div");
    assessmentSection.innerHTML = "<h3>Mental Health Assessments</h3>";

    assessments.forEach((assessment, index) => {
      const assessDiv = document.createElement("div");
      assessDiv.innerHTML = `<h4>Assessment ${index + 1}</h4>`;

      Object.entries(assessment.answers).forEach(([key, value]) => {
        const questionText = questions[key] || `Question ${key}`;
        assessDiv.innerHTML += `<p><strong>${questionText}:</strong> ${value.selectedOption}</p>`;
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

  const emptyLocalStorage = () => {
    localStorage.removeItem("mentalHealthAssessments");
    localStorage.removeItem("conversationHistory");
    setAssessmentData([]);
    setConversationHistory([]);
  };
  // Retrieve data from localStorage on component mount
  useEffect(() => {
    const storedAssessmentData = localStorage.getItem(
      "mentalHealthAssessments"
    );
    const storedConversationHistory = localStorage.getItem(
      "conversationHistory"
    );

    if (storedAssessmentData) {
      setAssessmentData(JSON.parse(storedAssessmentData));
    }

    if (storedConversationHistory) {
      setConversationHistory(JSON.parse(storedConversationHistory));
    }
  }, []);

  const questions = [
    "How are you feeling today?",
    "What brings you here today?",
    "What's your biggest challenge right now?",
    "How often do you feel overwhelmed?",
    "How's your energy level today?",
    "How do you usually handle difficult moments?",
    "What does your typical day look like?",
    "How do you feel about sharing your emotions?",
  ];

  return (
    <div className="bg-teal-900 min-h-screen flex flex-col items-center lg:p-6 p-2">
      <div className="bg-teal-100 lg:p-6 p-2 rounded-lg shadow-md w-full overflow-hidden max-w-5xl">
        <table className="w-full border-collapse border border-gray-400 mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-4 py-2 text-left">
                Question
              </th>
              <th className="border border-gray-400 px-4 py-2 text-left">
                Response
              </th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <tr key={index}>
                <td className="border border-gray-400 px-4 py-2">{question}</td>
                <td className="border border-gray-400 px-4 py-2">
                  {assessmentData[0]?.answers[index + 1]?.selectedOption ||
                    "N/A"}
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
            Generate Insights Summary
          </button>
        </div>

        <div className="mt-6 p-4 border-t border-gray-400">
          <h2 className="font-bold text-xl">Transcript</h2>
          <div className="mt-2">
            {conversationHistory.map((message) => (
              <p key={message.id} className="mt-1">
                <strong>
                  {message.role === "user" ? "You" : "Therapist"}:
                </strong>{" "}
                {message.text}
              </p>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={emptyLocalStorage}
            className="bg-black text-white px-6 py-2 rounded-lg shadow-md hover:bg-gray-800"
          >
            Delete and Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDisplay;
