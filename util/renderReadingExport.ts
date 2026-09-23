import { exportSections, wrapExportText, type ReadingExport } from "./readingExportLayout";

// Local assets and already-received text only; no reading request or upload.
export async function renderReadingExport(data: ReadingExport, includeQuestion: boolean, format: "png" | "jpeg" = "png"): Promise<Blob[]> {
  await document.fonts.load('24px "NotoSerifKR"');
  await document.fonts.ready;
  const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error("image")); image.src = src;
  });
  const logo = await loadImage("/banner.png");
  const output: Blob[] = [];
  const canvas = document.createElement("canvas"); canvas.width = 1240; canvas.height = 1754;
  const context = canvas.getContext("2d"); if (!context) throw new Error("canvas");
  let y = 0; let number = 0;
  const start = () => {
    number++; context.setTransform(2, 0, 0, 2, 0, 0);
    context.fillStyle = "#fff8e8"; context.fillRect(0, 0, 620, 877);
    context.fillStyle = "#123d30"; context.fillRect(0, 0, 620, 104);
    context.drawImage(logo, 32, 22, 60, 60);
    context.fillStyle = "#f4d78f"; context.font = '24px "NotoSerifKR"'; context.fillText("타로타르트", 110, 48);
    context.font = '14px "NotoSerifKR"'; context.fillStyle = "#fff8e8"; context.fillText(data.title, 110, 77);
    context.fillStyle = "#718376"; context.font = '12px "NotoSerifKR"';
    context.fillText(`타로타르트  ·  ${number}`, 40, 847);
    y = 142;
  };
  const flush = async () => {
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("encode")), `image/${format}`, 0.92));
    output.push(blob);
  };
  const space = async (height: number) => { if (y + height > 811) { await flush(); start(); } };
  const text = async (value: string, size: number, color: string, lineHeight: number) => {
    context.font = `${size}px "NotoSerifKR"`;
    const lines = wrapExportText(value, 540, line => context.measureText(line).width);
    for (const line of lines) {
      await space(lineHeight);
      context.font = `${size}px "NotoSerifKR"`; context.fillStyle = color;
      context.fillText(line, 40, y); y += lineHeight;
    }
  };
  start();
  for (const section of exportSections(data.sections, data.question, includeQuestion)) {
    await space(section.cardId === undefined ? 90 : 258);
    if (section.cardId !== undefined) {
      const card = await loadImage(`/cards/card${section.cardId}.webp`);
      context.drawImage(card, 262, y - 12, 96, 160); y += 174;
    }
    await text(section.title, 21, "#173f31", 32); y += 8;
    await text(section.text, 17, "#30473b", 30); y += 24;
  }
  await flush(); canvas.width = 0; canvas.height = 0;
  return output;
}

export async function createReadingPdf(images: Blob[]): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  for (let i = 0; i < images.length; i++) {
    if (i) pdf.addPage();
    pdf.addImage(new Uint8Array(await images[i].arrayBuffer()), images[i].type === "image/jpeg" ? "JPEG" : "PNG", 0, 0, 210, 297);
  }
  return pdf.output("blob");
}
