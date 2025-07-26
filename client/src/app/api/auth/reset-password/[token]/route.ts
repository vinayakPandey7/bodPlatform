import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const body = await req.json();
    const { token } = await params;

    // Forward request to backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const response = await fetch(
      `${backendUrl}/api/auth/reset-password/${token}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Reset password API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
