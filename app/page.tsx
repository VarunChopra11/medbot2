"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TypeformMentalHealth from "@/components/mcq-form";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mentalHealthAssessments = localStorage.getItem(
        "mentalHealthAssessments"
      );
      if (mentalHealthAssessments) {
        router.push("/start-call");
      }
    }
  }, [router]);

  return (
    <div>
      <TypeformMentalHealth />
    </div>
  );
}
