import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Generate a unique reference number for permit applications
 * Format: KCDC-YYYY-XXXXX (Kapiti Coast District Council)
 * @returns Promise<string> - Unique reference number
 */
export const generateReference = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = "KCDC";

  // Get the latest reference for this year
  const latestRef = await prisma.application.findFirst({
    where: {
      reference: {
        startsWith: `${prefix}-${year}-`,
      },
    },
    orderBy: {
      reference: "desc",
    },
  });

  let sequence = 1;

  if (latestRef) {
    // Extract sequence number from latest reference
    const match = latestRef.reference.match(
      new RegExp(`${prefix}-${year}-(\\d+)`)
    );
    if (match && match[1]) {
      sequence = parseInt(match[1], 10) + 1;
    }
  }

  // Format: KCDC-2024-00001
  const reference = `${prefix}-${year}-${sequence.toString().padStart(5, "0")}`;

  return reference;
};
