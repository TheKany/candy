"use client";
import { useId } from "react";

export default function LuckClover({ value }: { value: number }) {
  const id = useId();
  return <svg width="140" height="150" viewBox="0 0 120 130" role="img" aria-label={`행운 지수 ${value}%`}>
    <defs><clipPath id={id}>
      <path d="M60 58 C15 45 29 5 48 14 Q60 19 60 31 Q60 19 72 14 C91 5 105 45 60 58 Z M60 58 C73 13 113 27 104 46 Q99 58 87 58 Q99 58 104 70 C113 89 73 103 60 58 Z M60 58 C105 71 91 111 72 102 Q60 97 60 85 Q60 97 48 102 C29 111 15 71 60 58 Z M60 58 C47 103 7 89 16 70 Q21 58 33 58 Q21 58 16 46 C7 27 47 13 60 58 Z" />
      <path d="M57 59 Q68 100 49 119 L55 123 Q76 99 63 58 Z" />
    </clipPath></defs>
    <g clipPath={`url(#${id})`}><rect width="120" height="130" fill="#68766f" />
      <rect y={130 * (1 - value / 100)} width="120" height={130 * value / 100} fill="#76bd83" /></g>
  </svg>;
}
