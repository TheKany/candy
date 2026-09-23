import Image from "next/image";
import type { ReadingFailureCode } from "@/util/readingFailure";

export default function TartFailureIllustration({ code }: { code: ReadingFailureCode }) {
  return <Image src={`/images/bakery/${code}.webp`} alt="" width={640} height={640} unoptimized priority />;
}
