import { apiOk, apiErr } from "@/lib/utils/api";
import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

const SETA_DATA = [
  { seta_name: "MICT SETA", sector: "ICT, Media, Telecommunications", programmes: ["Software Development", "Technical Support", "Digital Marketing", "Data Administration", "Cybersecurity"], nqf_range: "2-6" },
  { seta_name: "BankSETA", sector: "Banking, Microfinance", programmes: ["Banking Operations", "Compliance", "Financial Advisory", "Credit Analysis"], nqf_range: "3-6" },
  { seta_name: "Services SETA", sector: "Business Services, Labour, Cleaning", programmes: ["Business Administration", "Customer Service", "Project Management", "Human Resources"], nqf_range: "2-5" },
  { seta_name: "FASSET", sector: "Finance, Accounting, Management Consulting", programmes: ["Accounting Technician", "Tax Professional", "Internal Audit", "Financial Planning"], nqf_range: "3-7" },
  { seta_name: "merSETA", sector: "Manufacturing, Engineering, Related Services", programmes: ["Electrician", "Fitter & Turner", "Mechatronics", "Welding", "Millwright"], nqf_range: "2-6" },
  { seta_name: "HWSETA", sector: "Health, Social Development", programmes: ["Nursing Assistant", "Pharmacy Assistant", "Community Health Worker", "Social Auxiliary Worker"], nqf_range: "2-6" },
  { seta_name: "CETA", sector: "Construction", programmes: ["Bricklayer", "Plumber", "Carpenter", "Civil Engineering Technician", "Quantity Surveyor Assistant"], nqf_range: "2-6" },
  { seta_name: "TETA", sector: "Transport", programmes: ["Freight Handling", "Logistics Management", "Driving Instruction", "Aviation Ground Handling"], nqf_range: "2-5" },
  { seta_name: "W&RSETA", sector: "Wholesale & Retail", programmes: ["Retail Management", "Visual Merchandising", "Supply Chain", "E-Commerce"], nqf_range: "2-5" },
  { seta_name: "AgriSETA", sector: "Agriculture", programmes: ["Farm Management", "Animal Production", "Plant Production", "Agri-Processing"], nqf_range: "2-5" },
  { seta_name: "MQA", sector: "Mining, Minerals", programmes: ["Mining Operations", "Rock Engineering", "Mine Surveying", "Mineral Processing"], nqf_range: "2-6" },
  { seta_name: "ETDP SETA", sector: "Education, Training, Development", programmes: ["Early Childhood Development", "Teaching Assistant", "Training Facilitation", "Assessment"], nqf_range: "2-6" },
  { seta_name: "CATHSSETA", sector: "Culture, Arts, Tourism, Hospitality, Sport", programmes: ["Chef", "Tour Guide", "Events Management", "Hotel Reception", "Sports Administration"], nqf_range: "2-5" },
  { seta_name: "CHIETA", sector: "Chemical Industries", programmes: ["Chemical Operations", "Laboratory Assistance", "Pharmaceutical Manufacturing", "Plastics Manufacturing"], nqf_range: "2-5" },
  { seta_name: "EWSETA", sector: "Energy & Water", programmes: ["Solar Installation", "Electrical Engineering", "Water Treatment", "Energy Auditing"], nqf_range: "2-6" },
  { seta_name: "FP&M SETA", sector: "Fibre Processing & Manufacturing", programmes: ["Textile Production", "Printing", "Packaging", "Paper Manufacturing"], nqf_range: "2-5" },
  { seta_name: "INSETA", sector: "Insurance", programmes: ["Short-term Insurance", "Long-term Insurance", "Risk Management", "Claims Processing"], nqf_range: "3-6" },
  { seta_name: "LG SETA", sector: "Local Government", programmes: ["Municipal Finance", "Community Development", "Municipal Administration", "Water Services"], nqf_range: "2-6" },
  { seta_name: "PSETA", sector: "Public Service", programmes: ["Public Administration", "Government Communication", "Policy Development", "Supply Chain Management"], nqf_range: "3-6" },
  { seta_name: "SASSETA", sector: "Safety & Security", programmes: ["Security Operations", "Fire Technology", "Correctional Services", "Private Investigation"], nqf_range: "2-5" },
  { seta_name: "FoodBev SETA", sector: "Food & Beverages Manufacturing", programmes: ["Food Processing", "Quality Control", "Baking", "Beverage Manufacturing"], nqf_range: "2-5" },
];

export async function POST(request: Request) {
  let userId: string;
  try { userId = await requireAuth(); } catch { return apiErr("UNAUTHORIZED", "Please sign in", [], 401); }

  try {
    let count = 0;
    for (const seta of SETA_DATA) {
      for (const prog of seta.programmes) {
        await prisma.$executeRaw`
          INSERT INTO seta_learnerships (seta_name, programme, sector, nqf_level, requirements, duration, stipend)
          VALUES (${seta.seta_name}, ${prog}, ${seta.sector}, ${parseInt(seta.nqf_range.split("-")[0])}, 
            ${"Matric / NQF Level " + seta.nqf_range.split("-")[0]}, ${"12 months"}, ${"R3,500 - R5,000/month"})
          ON CONFLICT DO NOTHING
        `;
        count++;
      }
    }
    return apiOk({ seeded: count, setas: SETA_DATA.length });
  } catch (error: any) {
    console.error("[SETA Seed] Error:", error);
    return apiErr("SEED_ERROR", error.message, [], 500);
  }
}
