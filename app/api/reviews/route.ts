import { NextResponse } from "next/server";

export async function GET() {
  console.log("Fetching reviews...");
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json({ error: "Missing API Key or Place ID" }, { status: 500 });
  }

  // Fetch reviews, rating, and total ratings count
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      return NextResponse.json({ error: data.error_message || "Failed to fetch reviews" }, { status: 400 });
    }

    console.log("Reviews fetched successfully:", data.result);
    return NextResponse.json(data.result);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}