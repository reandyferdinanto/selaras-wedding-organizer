import { NextResponse } from "next/server";
import { updatePlannerNotesStorage } from "@/lib/supabase/actions";
import { serializeBudgetV2State, type BudgetV2State } from "@/lib/budget-v2";

export async function POST(request: Request) {
  try {
    const data = await request.json() as BudgetV2State;

    // Serialize dengan format v2 yang sesuai, supaya saat dibaca kembali
    // `buildBudgetV2State` bisa mendeteksi version === 2 dan restore data dengan benar
    const serializedPlan = serializeBudgetV2State(data);

    const result = await updatePlannerNotesStorage({
      budgetPlan: serializedPlan,
    });

    return NextResponse.json(
      {
        ok: result.ok,
        message: result.message,
        snapshot: result.snapshot,
      },
      { status: result.ok ? 200 : 400 }
    );
  } catch (error: any) {
    console.error("Budget Save Error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Terjadi kesalahan sistem saat menyimpan anggaran.",
      },
      { status: 500 }
    );
  }
}
