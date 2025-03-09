import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) 
{
    console.log("API route reached with filename:", params.filename);
  try {

    // Navigate to Backend/majors (Go one level up from Frontend)
    const backendPath = path.join(process.cwd(), "../Backend/majors", `${params.filename}.json`);
    console.log(`Trying to read file from: ${backendPath}`);
    // Read the JSON file from Backend/majors
    const fileContents = await fs.readFile(backendPath, "utf-8");

    return NextResponse.json(JSON.parse(fileContents));
  } catch (error) {
    console.error("Error reading file:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
