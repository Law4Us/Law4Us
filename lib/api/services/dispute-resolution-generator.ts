import fs from "fs";
import path from "path";
import { createCanvas, loadImage, registerFont, type CanvasRenderingContext2D } from "canvas";
import {
  AlignmentType,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  SectionType,
  convertInchesToTwip,
} from "docx";
import { PDFDocument } from "pdf-lib";
import type { BasicInfo, FormData } from "@/lib/api/types";
import { ensureHebrewFontPath } from "./font-utils";
import { generatePowerOfAttorney } from "./shared-document-generators";

interface DisputeResolutionGenerationData {
  basicInfo: BasicInfo;
  formData: FormData;
  signature?: string | Buffer;
  lawyerSignature?: string | Buffer;
}

interface DisputeResolutionAnswers {
  courtType?: "familyCourt" | "rabbinicalCourt";
  courtCity?: string;
  relationshipToRespondent?: "spouse" | "parentOfChild" | "child" | "father" | "mother";
  noPendingApplication?: "yes" | "no";
}

const COURT_LABELS: Record<NonNullable<DisputeResolutionAnswers["courtType"]>, string> = {
  familyCourt: "משפחה",
  rabbinicalCourt: "רבני אזורי",
};

const RELATIONSHIP_LABELS: Record<
  NonNullable<DisputeResolutionAnswers["relationshipToRespondent"]>,
  string
> = {
  spouse: "בן/בת זוג",
  parentOfChild: "הורה של ילדי",
  child: "ילדי",
  father: "אבי",
  mother: "אמי",
};

const SIGNATURE_PLACEMENT = {
  x: 73,
  y: 706,
  width: 130,
  height: 40,
};

let canvasFontReady = false;

async function registerHebrewFont() {
  if (canvasFontReady) {
    return;
  }

  registerFont(await ensureHebrewFontPath(), { family: "Noto Sans Hebrew" });
  canvasFontReady = true;
}

function formatNumericDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function getImageBuffer(value?: string | Buffer): Buffer | null {
  if (!value) {
    return null;
  }

  if (Buffer.isBuffer(value)) {
    return value;
  }

  const payload = value.includes(",") ? value.split(",")[1] : value;
  return Buffer.from(payload || "", "base64");
}

function getRequiredAnswers(data: DisputeResolutionGenerationData) {
  const answers = (data.formData.disputeResolution || {}) as DisputeResolutionAnswers;

  if (answers.noPendingApplication !== "yes") {
    throw new Error("Cannot generate a dispute resolution request while another request may be pending");
  }

  if (!answers.courtType || !answers.courtCity || !answers.relationshipToRespondent) {
    throw new Error("Missing required dispute resolution form answers");
  }

  return answers as Required<DisputeResolutionAnswers>;
}

function getRelationshipLabel(
  data: DisputeResolutionGenerationData,
  relationship: NonNullable<DisputeResolutionAnswers["relationshipToRespondent"]>
): string {
  if (relationship === "spouse") {
    if (data.basicInfo.gender2 === "female") {
      return "בת זוג";
    }

    if (data.basicInfo.gender2 === "male") {
      return "בן זוג";
    }
  }

  return RELATIONSHIP_LABELS[relationship];
}

function drawRequestFields(
  context: CanvasRenderingContext2D,
  scale: number,
  data: DisputeResolutionGenerationData,
  answers: Required<DisputeResolutionAnswers>
) {
  context.fillStyle = "#111111";

  const drawRtl = (text: string | undefined, x: number, y: number, fontSize = 9, maxWidth?: number) => {
    if (!text) return;
    context.save();
    context.font = `${fontSize * scale}px "Noto Sans Hebrew"`;
    context.textAlign = "right";
    context.direction = "rtl";
    context.fillText(text, x * scale, y * scale, maxWidth ? maxWidth * scale : undefined);
    context.restore();
  };

  const drawMark = (x: number, y: number, text = "X", fontSize = 10) => {
    context.save();
    context.font = `bold ${fontSize * scale}px Arial`;
    context.textAlign = "left";
    context.direction = "ltr";
    context.fillText(text, x * scale, y * scale);
    context.restore();
  };

  // Header and applicant details.
  drawRtl(COURT_LABELS[answers.courtType], 412, 72, 10, 65);
  drawRtl(answers.courtCity, 319, 72, 10, 120);
  drawRtl(formatNumericDate(new Date()), 132, 105, 10, 82);
  drawRtl(data.basicInfo.fullName, 510, 246, 10, 150);
  drawRtl(data.basicInfo.idNumber, 347, 246, 10, 108);
  drawRtl(data.basicInfo.address, 226, 246, 9, 145);
  drawRtl(data.basicInfo.phone, 510, 294, 9, 150);
  drawRtl(data.basicInfo.email, 226, 294, 8, 145);

  // Representing lawyer details, as required by this paid service flow.
  drawRtl('עו"ד אריאל דרור', 510, 379, 9, 155);
  drawRtl("ברקוביץ 4, מגדל המוזיאון, תל אביב", 349, 379, 8, 190);
  drawRtl("03-6951408", 178, 379, 9, 100);
  drawRtl("arieldrorlaw@gmail.com", 348, 426, 8, 272);

  // Respondent details.
  drawRtl(data.basicInfo.fullName2, 510, 505, 10, 150);
  drawRtl(data.basicInfo.idNumber2, 347, 505, 10, 108);
  drawRtl(data.basicInfo.address2, 226, 505, 9, 145);
  drawRtl(data.basicInfo.phone2, 510, 552, 9, 150);
  drawRtl(data.basicInfo.email2, 226, 552, 8, 145);

  drawRtl(data.basicInfo.fullName2, 370, 602, 9, 115);

  // This official form prints several relationship choices with "delete the
  // unnecessary". Cover those static words and render only the chosen value.
  context.save();
  context.fillStyle = "#ffffff";
  context.fillRect(65 * scale, 584 * scale, 208 * scale, 27 * scale);
  context.fillRect(435 * scale, 605 * scale, 96 * scale, 26 * scale);
  context.restore();
  drawRtl(getRelationshipLabel(data, answers.relationshipToRespondent), 262, 602, 9, 190);

  drawMark(517, 683, "X", 11);
}

/**
 * Fill official Form 1. The source PDF has no AcroForm fields, so field
 * coordinates are kept together here and can be recalibrated when a new
 * published court form is supplied.
 */
export async function generateDisputeResolutionRequest(
  data: DisputeResolutionGenerationData
): Promise<Buffer> {
  const answers = getRequiredAnswers(data);

  const templatePath = path.join(process.cwd(), "templates", "יישוב סכסוך טופס.pdf");
  const pdfDocument = await PDFDocument.load(fs.readFileSync(templatePath));
  const page = pdfDocument.getPages()[0];
  const { width, height } = page.getSize();
  const scale = 3;

  await registerHebrewFont();

  const overlay = createCanvas(Math.round(width * scale), Math.round(height * scale));
  const context = overlay.getContext("2d");
  drawRequestFields(context, scale, data, answers);

  const overlayImage = await pdfDocument.embedPng(overlay.toBuffer("image/png"));
  page.drawImage(overlayImage, { x: 0, y: 0, width, height });

  const signatureBuffer = getImageBuffer(data.signature);
  if (signatureBuffer) {
    const signatureImage = await pdfDocument.embedPng(signatureBuffer);
    page.drawImage(signatureImage, {
      x: SIGNATURE_PLACEMENT.x,
      // Keep the opaque signature-pad image above the printed caption.
      y: height - SIGNATURE_PLACEMENT.y - SIGNATURE_PLACEMENT.height,
      width: SIGNATURE_PLACEMENT.width,
      height: SIGNATURE_PLACEMENT.height,
    });
  }

  return Buffer.from(await pdfDocument.save());
}

/**
 * Fill a pre-rendered Form 1 page image, following the existing Form 4
 * approach used by the other Word document generators.
 */
async function generateDisputeResolutionRequestPageImage(
  data: DisputeResolutionGenerationData
): Promise<Buffer> {
  const answers = getRequiredAnswers(data);
  const sourcePdfPath = path.join(process.cwd(), "templates", "יישוב סכסוך טופס.pdf");
  const templateImagePath = path.join(process.cwd(), "templates", "יישוב סכסוך טופס.png");
  const sourcePdf = await PDFDocument.load(fs.readFileSync(sourcePdfPath));
  const sourcePageWidth = sourcePdf.getPages()[0].getWidth();
  const templateImage = await loadImage(fs.readFileSync(templateImagePath));
  const scale = templateImage.width / sourcePageWidth;
  const canvas = createCanvas(templateImage.width, templateImage.height);
  const context = canvas.getContext("2d");

  await registerHebrewFont();
  context.drawImage(templateImage, 0, 0);
  drawRequestFields(context, scale, data, answers);

  const signatureBuffer = getImageBuffer(data.signature);
  if (signatureBuffer) {
    const signatureImage = await loadImage(signatureBuffer);
    context.drawImage(
      signatureImage,
      SIGNATURE_PLACEMENT.x * scale,
      SIGNATURE_PLACEMENT.y * scale,
      SIGNATURE_PLACEMENT.width * scale,
      SIGNATURE_PLACEMENT.height * scale
    );
  }

  return canvas.toBuffer("image/png");
}

/**
 * Generate one claim document, matching the output model of the other flows:
 * official Form 1 on the first page followed by the specialized POA.
 */
export async function generateDisputeResolutionDocument(
  data: DisputeResolutionGenerationData
): Promise<Buffer> {
  const requestPageImage = await generateDisputeResolutionRequestPageImage(data);
  const a4Size = {
    width: convertInchesToTwip(8.27),
    height: convertInchesToTwip(11.69),
  };

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            size: a4Size,
            margin: {
              top: convertInchesToTwip(0.15),
              right: convertInchesToTwip(0.15),
              bottom: convertInchesToTwip(0.15),
              left: convertInchesToTwip(0.15),
            },
          },
        },
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                type: "png",
                data: requestPageImage,
                transformation: {
                  width: 760,
                  height: 1075,
                },
              } as any),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
          }),
        ],
      },
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: a4Size,
            margin: {
              top: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
            },
          },
        },
        children: generatePowerOfAttorney(
          data.basicInfo,
          data.formData,
          data.signature,
          data.lawyerSignature,
          "יישוב סכסוך"
        ),
      },
    ],
  });

  return Packer.toBuffer(document);
}
