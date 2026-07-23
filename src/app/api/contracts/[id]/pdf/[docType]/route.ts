import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getContract } from "@/lib/store/contracts";
import { getRestaurantSettings, getThemeSettings } from "@/lib/store/settings";
import { buildContractPdf } from "@/lib/pdf/contract-pdfs";
import { SLUG_TO_DOC_NAME } from "@/lib/docs";

type Params = { params: Promise<{ id: string; docType: string }> };

/**
 * GET /api/contracts/:id/pdf/:docType
 * Renders the requested document as a PDF, always from the latest
 * saved contract data (kitchen-sheet, banquet-event-order, contract,
 * invoice, menu, proposal).
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { id, docType } = await params;

  const docName = SLUG_TO_DOC_NAME[docType];
  if (!docName) {
    return NextResponse.json({ error: "Unknown document type" }, { status: 404 });
  }

  const [contract, settings, theme] = await Promise.all([
    getContract(id),
    getRestaurantSettings(),
    getThemeSettings(),
  ]);
  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const doc = buildContractPdf(docType, contract, settings, theme.primaryColor);
  if (!doc) {
    return NextResponse.json({ error: "Unknown document type" }, { status: 404 });
  }

  const buffer = await renderToBuffer(doc);
  const download = req.nextUrl.searchParams.get("download") === "1";
  const filename = `${docType}-${contract.orderNumber}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
