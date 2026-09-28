"use client";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useReadingSessionStore } from "@/store/useReadingSessionStore";
import { safeActivityTopic } from "@/util/mypageRules";
export default function ActivityRecorder({kind}:{kind:string}){
  const {account}=useAuth();const history=useReadingSessionStore(s=>s.history);const consultationId=useReadingSessionStore(s=>s.consultationId);
  useEffect(()=>{if(!account||!consultationId||!history.length||!["one","three","five","monthly"].includes(kind))return;
    const controller=new AbortController();
    // No question, generated prose, or raw keywords leave this component.
    const body=JSON.stringify({consultationId,ordinal:history.length,kind,topic:safeActivityTopic(history[history.length-1].data.keywords)});
    void fetch("/api/account/activity",{method:"POST",headers:{"Content-Type":"application/json"},body,signal:controller.signal}).catch(()=>{});
    return()=>controller.abort();
  },[account?.id,consultationId,history,kind]);return null;
}
