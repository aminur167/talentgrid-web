import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// POST /api/jobs — Create a new job posting
export async function POST(request) {
  try {
    const body = await request.json();

    // Basic validation
    const { title, category, jobType, deadline } = body;
    if (!title || !category || !jobType || !deadline) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: title, category, jobType, deadline" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const jobsCollection = db.collection("jobs");

    const newJob = {
      ...body,
      minSalary: Number(body.minSalary) || 0,
      maxSalary: Number(body.maxSalary) || 0,
      isRemote: body.isRemote === true || body.isRemote === "true",
      status: "active",
      applications: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await jobsCollection.insertOne(newJob);

    return NextResponse.json(
      {
        success: true,
        message: "Job posted successfully!",
        jobId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

// GET /api/jobs — Fetch all active jobs
export async function GET() {
  try {
    const db = await getDb();
    const jobs = await db
      .collection("jobs")
      .find({ status: "active" })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, jobs }, { status: 200 });
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch jobs." },
      { status: 500 }
    );
  }
}
