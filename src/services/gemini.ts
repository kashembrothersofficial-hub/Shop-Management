import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ExtractedItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export const extractBillData = async (imageBase64: string, mimeType: string): Promise<ExtractedItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64.split(',')[1], // Remove data:image/jpeg;base64,
              mimeType: mimeType,
            },
          },
          {
            text: "Extract the items from this handwritten cash memo or bill. The text is likely in Bengali or English. Extract the product name, quantity, unit price, and total price for each item. Return the result as a JSON array.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "The name of the product in Bengali.",
              },
              quantity: {
                type: Type.NUMBER,
                description: "The quantity of the product.",
              },
              price: {
                type: Type.NUMBER,
                description: "The unit price of the product.",
              },
              total: {
                type: Type.NUMBER,
                description: "The total price for this product line.",
              },
            },
            required: ["name", "quantity", "price", "total"],
          },
        },
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as ExtractedItem[];
    }
    return [];
  } catch (error) {
    console.error("Error extracting bill data:", error);
    throw new Error("বিল স্ক্যান করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
  }
};
