export type ReadingFailureCode = "busy" | "quota" | "daily_quota" | "configuration" | "timeout" | "network" | "incomplete" | "blocked" | "unknown";

export const READING_FAILURES: Record<ReadingFailureCode, { title: string; description: string; sign: string; retry: boolean }> = {
  busy: { title: "오븐이 잠시 말썽이에요", description: "해설 서버가 일시적으로 응답하지 못했어요. 잠시 후 같은 카드로 다시 구워주세요.", sign: "잠시 쉬는 중", retry: true },
  quota: { title: "지금은 추가 주문을 받기 어려워요", description: "AI 요청 한도에 도달했어요. 잠시 후 다시 시도해주세요. 하루 한도라면 초기화된 뒤 이용할 수 있어요.", sign: "주문 잠시 마감", retry: true },
  daily_quota: { title: "오늘 준비한 타르트가 모두 소진됐어요", description: "AI의 일일 사용 한도에 도달했어요. 한도가 초기화되면 다시 이용할 수 있어요.", sign: "오늘 굽기 마감", retry: false },
  configuration: { title: "오븐을 점검하고 있어요", description: "서비스 연결 설정에 문제가 있어요. 운영자의 확인이 필요해 지금은 해설을 준비할 수 없어요.", sign: "오븐 점검 중", retry: false },
  timeout: { title: "타르트가 예상보다 오래 걸리고 있어요", description: "이번 해설을 제한 시간 안에 완성하지 못했어요. 고른 카드로 다시 시도할 수 있어요.", sign: "타이머 멈춤", retry: true },
  network: { title: "주문을 전달하는 길이 잠시 끊겼어요", description: "네트워크 연결에 문제가 생겼어요. 연결 상태를 확인한 뒤 다시 시도해주세요.", sign: "연결 확인 중", retry: true },
  incomplete: { title: "아직 이야기가 덜 구워졌어요", description: "해설을 끝까지 완성하지 못했어요. 같은 카드로 이야기를 다시 준비할 수 있어요.", sign: "다시 준비하기", retry: true },
  blocked: { title: "주문 내용을 조금 바꿔볼까요?", description: "이 질문은 AI 응답 정책으로 해설을 제공하지 못했어요. 질문의 표현을 바꿔 다시 시작해주세요.", sign: "주문 확인", retry: false },
  unknown: { title: "타르트를 완성하지 못했어요", description: "해설 준비 중 문제가 생겼어요. 잠시 후 같은 카드로 다시 시도해주세요.", sign: "잠시 대기", retry: true },
};

export function isReadingFailureCode(code: unknown): code is ReadingFailureCode {
  return typeof code === "string" && Object.prototype.hasOwnProperty.call(READING_FAILURES, code);
}

export class ReadingRequestError extends Error {
  code: ReadingFailureCode;
  constructor(code: ReadingFailureCode) { super(READING_FAILURES[code].description); this.code = code; }
}
