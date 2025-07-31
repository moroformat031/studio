import { transcribeMedicalAppointment } from "@/ai/flows/transcribe-medical-appointment";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { audioDataUri } = await req.json();

    if (!audioDataUri) {
      return NextResponse.json(
        { error: "Audio data is required" },
        { status: 400 }
      );
    }

    const result = await transcribeMedicalAppointment({ audioDataUri });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while transcribing the appointment" },
      { status: 500 }
    );
  }
}
