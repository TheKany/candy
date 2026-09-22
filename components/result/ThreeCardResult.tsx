"use client";
import PersonalReadingResult from "./PersonalReadingResult";
export default function ThreeCardResult({ onHome, mode = "three" }: { onHome: () => void; mode?: "three" | "five" }) {
  return <PersonalReadingResult mode={mode} onHome={onHome} />;
}
