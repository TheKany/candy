import Link from "next/link";
export default function AuthError() {
  return <main style={{ padding: 28, color: "#fff7df", lineHeight: 1.8 }}><h1>로그인을 마치지 못했어요</h1><p>로그인이 취소됐거나 연결 시간이 지났어요. 홈에서 다시 시도해주세요.</p><Link href="/">홈으로 돌아가기</Link></main>;
}
