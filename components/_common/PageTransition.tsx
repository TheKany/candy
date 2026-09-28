"use client";
import { useEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { animate, useReducedMotion } from 'framer-motion';

export default function PageTransition({children}:{children:ReactNode}) {
  const pathname=usePathname();
  const frame=useRef<HTMLDivElement>(null);
  const previous=useRef(pathname);
  const reduced=useReducedMotion();
  useEffect(()=>{
    if(previous.current===pathname)return;
    previous.current=pathname;
    const element=frame.current;
    if(!element)return;
    element.scrollTop=0;
    if(reduced)return;
    const animation=animate(element,{opacity:[0,1]},{duration:1,ease:'easeOut'});
    return ()=>{animation.stop();element.style.opacity='1';};
  },[pathname,reduced]);
  useEffect(()=>{
    const viewport=window.visualViewport;
    const resize=()=>document.documentElement.style.setProperty('--app-height',`${viewport?.height??window.innerHeight}px`);
    resize();viewport?.addEventListener('resize',resize);window.addEventListener('resize',resize);
    return ()=>{viewport?.removeEventListener('resize',resize);window.removeEventListener('resize',resize);document.documentElement.style.removeProperty('--app-height');};
  },[]);
  return <div ref={frame} className="app-page-frame">{children}</div>;
}
