"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Function to serialize car data
function serializeCarData(car) {
  return {
    ...car,
    price: car.price ? parseFloat(car.price.toString()) : 0,
    createdAt: car.createdAt.toISOString(),
    updatedAt: car.updatedAt.toISOString(),
  };
}

export async function getFeaturedCars(limit = 3) {
  try {
    const cars = await db.car.findMany({
      where: {
        featured: true,
        status: "AVAILABLE",
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return cars.map(serializecarData);
  } catch (error) {
    throw new Error("Error fetching featured cars: " + error.message);
  }
}

async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

export async function processImageSearch(file) {
  try {
    // Rate Limiting with Arcjet
    const req = await request();

    const descision = await aj.protect(req, {
      requested: 1, // specify how many tokens to consume
    });

    if (descision.isDenied()) {
      if (descision.reason.isRateLimit()) {
        const { remaining, reset } = descision.reason;

        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });
        throw new Error("Too many request. Please try again later");
      }
      throw new Error("Request blocked");
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini key is not configured");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const base64Image = await fileToBase64(file);

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };

    // Define the prompt for car detail extraction
    const prompt = `
    Analyze this car image and extract the following information for a search query:
    1. Make (manufacturer)
    2. Body type (SUV, Sedan, Hatchback, etc.)
    3. Color

    format your response as a clean JSON object with these fields:
    {
    "make":"",
    "bodyType":"",
    "color":"",
    "confidence":0.0
    }

    For confidence, provide a value between 0 and 1 representing hwo confidnet you are in your overall indentification. Only respond with the JSON object, nothing else.
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const carDetails = await JSON.parse(cleanedText);

      return {
        success: true,
        data: carDetails,
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return {
        success: false,
        error: "FAiled to parse AI response",
      };
    }
  } catch (error) {
    console.error("error is ", error.message);
    throw new Error("AI Search error: ", +error.message);
  }
}
