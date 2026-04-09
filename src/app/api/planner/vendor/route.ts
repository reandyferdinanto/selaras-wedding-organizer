import { NextResponse } from "next/server";
import { updatePlannerNotesStorage } from "@/lib/supabase/actions";

export async function POST(request: Request) {
  try {
    // Terima payload berupa object, bukan string agar mudah di-debug
    const body = await request.json() as { vendorPlan?: Record<string, unknown> | string };

    const vendorPlanData = body.vendorPlan;

    if (!vendorPlanData || (typeof vendorPlanData === "object" && Object.keys(vendorPlanData).length === 0)) {
      return NextResponse.json(
        { ok: false, message: "Data vendor tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Ubah jadi string sebelum dikirim ke storage (database/cookie membutuhkan string)
    const vendorPlanString = typeof vendorPlanData === "string" 
      ? vendorPlanData 
      : JSON.stringify(vendorPlanData);

    const result = await updatePlannerNotesStorage({
      vendorPlan: vendorPlanString,
    });

    return NextResponse.json(
      {
        ok: result.ok,
        message: result.message,
        snapshot: result.snapshot,
        // Kembalikan ke client sebagai object lagi
        vendorPlan: typeof vendorPlanData === "string" ? JSON.parse(vendorPlanData) : vendorPlanData,
      },
      { status: result.ok ? 200 : 400 }
    );
  } catch (error: any) {
    console.error("Vendor Save Error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Terjadi kesalahan sistem saat menyimpan vendor.",
      },
      { status: 500 }
    );
  }
}
