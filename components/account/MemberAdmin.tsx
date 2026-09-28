"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import type { AdminMemberList, MemberRole } from "@/types/adminTypes";
import { AdminPage } from "./AdminChrome";
const states = { unused: "미사용", active: "사용중", dormant: "휴면" };
export default function MemberAdmin() {
  const auth = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState({ search: "", offset: 0, revision: 0 });
  const [data, setData] = useState<AdminMemberList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<{ memberNumber: string; role: MemberRole } | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  useEffect(() => {
    if (!auth.account?.isAdmin) { setData(null); return; }
    const controller = new AbortController();
    setLoading(true); setError(""); setPending(null); setData(null);
    fetch(`/api/admin/members?${new URLSearchParams({ search: filter.search, offset: String(filter.offset) })}`, { cache: "no-store", signal: controller.signal })
      .then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.error); if (!controller.signal.aborted) setData(body); })
      .catch(error => { if (!controller.signal.aborted) setError(error.message || "회원 목록을 불러오지 못했어요."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [auth.account?.id, auth.account?.isAdmin, filter]);
  const save = async () => {
    if (!pending || savingRef.current) return;
    savingRef.current = true; setSaving(true); setError("");
    try {
      const response = await fetch(`/api/admin/members/${pending.memberNumber}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: pending.role }) });
      if (!response.ok) { const body = await response.json(); throw new Error(body.error); }
      setPending(null); setFilter(value => ({ ...value, revision: value.revision + 1 }));
      await auth.refreshAccount();
    } catch (error) { setError(error instanceof Error ? error.message : "등급을 변경하지 못했어요."); }
    finally { savingRef.current = false; setSaving(false); }
  };
  return <AdminPage><nav><Link href="/account">← 마이페이지</Link><span>회원 관리</span></nav>
    <p className="eyebrow">TAROTART · ADMIN</p><h1>가입 회원 관리</h1>
    {auth.status === "loading" ? <p>접근 권한을 확인하고 있어요.</p> : !auth.account?.isAdmin ? <p role="alert">관리자만 이용할 수 있어요.</p> : <>
      <p className="note">회원번호로 관리해요. 개인 질문과 해설은 표시하지 않아요.</p>
      <form onSubmit={event => { event.preventDefault(); if (!saving) setFilter({ search: query.trim().toUpperCase(), offset: 0, revision: filter.revision + 1 }); }}>
        <input aria-label="회원번호 검색" placeholder="회원번호 앞부분으로 검색" value={query} maxLength={35} onChange={event => setQuery(event.target.value)} />
        <button className="small-button" disabled={saving}>검색</button>
      </form>
      {error && <p className="error" role="alert">{error} <button className="plain" disabled={saving} onClick={() => setFilter(value => ({ ...value, revision: value.revision + 1 }))}>다시 확인</button></p>}
      {loading && <p role="status">회원 목록을 불러오고 있어요.</p>}
      {data && !data.items.length && <p className="empty">해당하는 회원이 없어요.</p>}
      <ul className="member-list">{data?.items.map(member => <li className="member" key={member.memberNumber}>
        <header><strong className="number">{member.memberNumber}</strong><span className="status-badge">{states[member.status]}</span></header>
        <div className="meta"><time dateTime={member.createdAt}>가입일 {new Date(member.createdAt).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</time>
          <label>등급 <select aria-label={`${member.memberNumber} 등급`} disabled={saving} value={pending?.memberNumber === member.memberNumber ? pending.role : member.role} onChange={event => setPending(event.target.value === member.role ? null : { memberNumber: member.memberNumber, role: event.target.value as MemberRole })}><option value="member">일반</option><option value="super">슈퍼</option></select></label>
          <Link className="detail" href={`/admin/members/${member.memberNumber}`}>상세 →</Link>
        </div>
        {pending?.memberNumber === member.memberNumber && <div className="confirm"><p>{pending.role === "super" ? "슈퍼 등급으로 변경할까요? 무료 이용이 가능해지고 마이페이지에 안내가 표시돼요." : "일반 등급으로 변경할까요? 슈퍼 무료 이용 혜택이 종료돼요."}</p><button className="small-button" disabled={saving} onClick={save}>{saving ? "저장 중…" : "변경하기"}</button><button className="plain" disabled={saving} onClick={() => setPending(null)}>취소</button></div>}
      </li>)}</ul>
      <div className="pager"><button className="plain" disabled={loading || saving || filter.offset === 0} onClick={() => setFilter(value => ({ ...value, offset: Math.max(0, value.offset - 20) }))}>이전</button><span>{filter.offset / 20 + 1} 페이지</span><button className="plain" disabled={loading || saving || !data?.hasMore} onClick={() => setFilter(value => ({ ...value, offset: value.offset + 20 }))}>다음</button></div>
    </>}
  </AdminPage>;
}
