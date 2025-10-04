import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get("zipCode");

    if (!zipCode) {
      return NextResponse.json(
        { success: false, message: "Zip code is required" },
        { status: 400 }
      );
    }

    // Validate zip code format
    if (!/^\d{5}$/.test(zipCode)) {
      return NextResponse.json(
        { success: false, message: "Invalid zip code format. Must be 5 digits." },
        { status: 400 }
      );
    }

    // Forward request to backend location validation API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://theciero.com/api";
    const response = await fetch(
      `${backendUrl}/location/validate?zipCode=${zipCode}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Location validation failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Location validation API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error during location validation" },
      { status: 500 }
    );
  }
}
