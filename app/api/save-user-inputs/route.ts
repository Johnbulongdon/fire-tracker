// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
// app/api/save-user-inputs/route.ts
// Called automatically after login to sync localStorage data 鈫?Supabase.
// Uses the user's own access token 鈥?no service role key required.
// Only writes if backend row is empty to avoid overwriting real data.
// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { type UntilFireInputs } from "@/lib/local-inputs";

// Legacy budget snapshot sync only. Canonical onboarding FIRE state remains in fire_user_data.

function hasValidBudgetSnapshotShape(inputs: UntilFireInputs): boolean {
  const expenseKeys = ["housing", "food", "transport", "subscriptions", "healthcare", "entertainment", "other"] as const;
  return (
    typeof inputs.income === "number" &&
    typeof inputs.fireAge === "number" &&
    typeof inputs.k401 === "number" &&
    typeof inputs.rothIRA === "number" &&
    typeof inputs.taxable === "number" &&
    typeof inputs.totalDebt === "number" &&
    typeof inputs.mortgageBalance === "number" &&
    typeof inputs.mortgageMonthly === "number" &&
    typeof inputs.growthRate === "number" &&
    typeof inputs.withdrawalRate === "number" &&
    !!inputs.expenses &&
    expenseKeys.every((key) => typeof inputs.expenses[key] === "number")
  );
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate caller via Authorization header (Bearer <access_token>)
    const authHeader = req.headers.get("authorization") || "";
    const accessToken = authHeader.replace("Bearer ", "").trim();
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create a client scoped to the user's access token (respects RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: { persistSession: false },
      }
    );

    // Verify token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { inputs } = body as { inputs: UntilFireInputs };

    if (!inputs) {
      return NextResponse.json({ error: "Missing inputs" }, { status: 400 });
    }

    if (!hasValidBudgetSnapshotShape(inputs)) {
      return NextResponse.json({ error: "Invalid input shape" }, { status: 400 });
    }

    // Fetch current backend row for this user
    const { data: existing } = await supabase
      .from("user_budget")
      .select("income, expenses, fire_assets")
      .eq("user_id", user.id)
      .single();

    // Determine if backend already has real data (skip if so)
    const backendHasData =
      existing &&
      (
        (existing.income && existing.income > 0) ||
        (existing.fire_assets && existing.fire_assets > 0) ||
        (existing.expenses &&
          Object.keys(existing.expenses).filter(k => k !== "_fire_profile").length > 0)
      );

    if (backendHasData) {
      return NextResponse.json({ status: "skipped", reason: "backend_has_data" });
    }

    // Backend is empty 鈥?write local data to Supabase
    const fireProfile = {
      k401: inputs.k401,
      rothIRA: inputs.rothIRA,
      taxable: inputs.taxable,
      totalDebt: inputs.totalDebt,
      mortgageBalance: inputs.mortgageBalance,
      mortgageMonthly: inputs.mortgageMonthly,
      growthRate: inputs.growthRate,
      withdrawalRate: inputs.withdrawalRate,
    };

    const { error: upsertError } = await supabase
      .from("user_budget")
      .upsert(
        {
          user_id: user.id,
          income: inputs.income,
          expenses: { ...inputs.expenses, _fire_profile: fireProfile },
          fire_age: inputs.fireAge,
          fire_assets: inputs.k401,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("[save-user-inputs] upsert error:", upsertError);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ status: "synced" });
  } catch (err) {
    console.error("[save-user-inputs] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
