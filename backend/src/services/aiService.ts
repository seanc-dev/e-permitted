import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze permit application data with AI
 * @param applicationId - The ID of the application to analyze
 * @param data - The application data to analyze
 * @returns Promise<void>
 */
export const analyzeWithAI = async (
  applicationId: string,
  data: Record<string, any>
): Promise<void> => {
  try {
    // Get application details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
        council: true,
        permitType: true,
      },
    });

    if (!application) {
      console.error("Application not found for AI analysis:", applicationId);
      return;
    }

    // Prepare prompt for AI analysis
    const prompt = `
      Analyze this permit application for ${application.permitType.name} with ${application.council.name}:
      
      Applicant: ${application.user.firstName} ${application.user.lastName}
      Permit Type: ${application.permitType.name}
      Council: ${application.council.name}
      
      Application Data:
      ${JSON.stringify(data, null, 2)}
      
      Please provide:
      1. Completeness assessment (missing required fields)
      2. Potential issues or concerns
      3. Recommendations for improvement
      4. Estimated processing time
      5. Risk level (low/medium/high)
    `;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in local government permitting. Analyze permit applications thoroughly and provide actionable insights.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const analysis = completion.choices[0]?.message?.content;

    if (analysis) {
      // Update application with AI analysis
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          aiAnalysis: {
            analysis,
            analyzedAt: new Date().toISOString(),
            model: "gpt-4",
          },
        },
      });

      console.log("AI analysis completed for application:", applicationId);
    }
  } catch (error) {
    console.error("Error in AI analysis:", error);

    // Update application with error information
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        aiAnalysis: {
          error: error instanceof Error ? error.message : "Unknown error",
          analyzedAt: new Date().toISOString(),
        },
      },
    });
  }
};
