import Link from "next/link";
export default function PrivacyPage() {
  return <main style={{ padding: "28px 20px", color: "#fff7df", lineHeight: 1.9 }}><Link href="/">← 홈으로</Link><h1>회원 개인정보 안내</h1>
    <h2>로그인 정보</h2><p>카카오 로그인과 Supabase 인증으로 계정을 식별하고 로그인 상태를 유지합니다. 카카오 비밀번호는 타로타르트에서 받거나 저장하지 않습니다. 계정 식별 정보, 회원 권한, 슈퍼 안내 확인 여부를 보관합니다.</p>
    <h2>내가 선택한 상담만 저장</h2><p>일반 회원이 ‘내 기록에 저장’을 누르면 질문·뽑은 카드·해설이 계정에 저장됩니다. 내 타로 기록에서 조회하고 삭제할 수 있습니다. 서버에 저장된 기록은 운영자가 기술적으로 접근할 수 있으며, 운영자도 볼 수 없는 종단간 암호화 서비스는 아닙니다.</p>
    <h2>비회원과 슈퍼 계정</h2><p>질문과 해설을 계정 기록에 저장하지 않습니다. 상담을 이어가는 동안 브라우저 메모리에 임시로 유지하고, 상담 종료 시 지웁니다. 사용자가 직접 내려받은 PDF·이미지는 기기에 남습니다.</p>
    <h2>AI 해설</h2><p>해설 생성을 위해 질문과 뽑은 카드, 필요한 이전 상담 맥락을 Google Gemini에 전달합니다. 공급자의 데이터 처리·보관 정책은 해당 서비스 정책에 따릅니다. 서비스 로그와 분석 이벤트에는 질문·해설 원문을 기록하지 않습니다.</p>
    <h2>운영자 및 문의</h2><p>운영자: Kaan<br />개인정보 및 서비스 문의: <a href="mailto:supremer12@gmail.com">supremer12@gmail.com</a></p>
    <p>서비스 피드백: <a href="https://open.kakao.com/o/sIZKvBPi" target="_blank" rel="noopener noreferrer">카카오톡 오픈채팅으로 의견 보내기</a></p>
  </main>;
}
