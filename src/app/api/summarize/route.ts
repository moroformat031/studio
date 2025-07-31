import { summarizeMedicalAppointment } from "@/ai/flows/summarize-medical-appointment";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { transcription } = await req.json();

    if (!transcription) {
      return NextResponse.json(
        { error: "Transcription is required" },
        { status: 400 }
      );
    }

    const result = await summarizeMedicalAppointment({ transcription });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while summarizing the appointment" },
      { status: 500 }
    );
  }
}
