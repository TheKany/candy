"use client";
import PersonalReadingResult from "./PersonalReadingResult";
export default function OneCardResult({ onHome }: { onHome: () => void }) {
  return <PersonalReadingResult mode="one" onHome={onHome} />;
}
