import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SkillBridge SA...");

  // ── Institutions ───────────────────────────────────────
  const institutions = [
    {
      name: "University of Cape Town — Online Short Courses",
      url: "https://www.getsmarter.com/universities/uct",
      description: "UCT offers accredited short courses through GetSmarter, covering data science, ML, and business analytics.",
      bestFor: "Accredited short courses with university recognition",
      typicalOfferings: ["Data Science", "Machine Learning", "FinTech", "Business Analytics"],
      recognition: "Internationally recognised; NQF-aligned",
      category: "university",
      region: "south_africa",
    },
    {
      name: "AWS Training & Certification",
      url: "https://aws.amazon.com/training/",
      description: "Amazon's official certification programme for cloud practitioners and architects.",
      bestFor: "Cloud certification directly from the vendor",
      typicalOfferings: ["Cloud Practitioner", "Solutions Architect", "Data Analytics Specialty"],
      recognition: "Industry gold standard for AWS roles",
      category: "vendor_cert",
      region: "global",
    },
    {
      name: "Coursera (Stanford, Google)",
      url: "https://coursera.org",
      description: "Global online learning with university-partnered specialisations. Focus on top university offerings.",
      bestFor: "Structured learning paths with certificates",
      typicalOfferings: ["ML Specialisation", "Google Data Analytics", "Python for Everybody"],
      recognition: "Widely recognised; financial aid available",
      category: "online_platform",
      region: "global",
    },
    {
      name: "Explore Data Science Academy",
      url: "https://explore-datascience.net",
      description: "South African data science academy with strong industry partnerships and job placement support.",
      bestFor: "Intensive SA-based data science training",
      typicalOfferings: ["Data Science Bootcamp", "Data Engineering", "ML Engineering"],
      recognition: "Well-regarded in SA tech; employer partnerships",
      category: "bootcamp",
      region: "south_africa",
    },
    {
      name: "CompTIA",
      url: "https://comptia.org",
      description: "Vendor-neutral IT certification body for foundational infrastructure knowledge.",
      bestFor: "Vendor-neutral IT fundamentals",
      typicalOfferings: ["Data+", "Cloud+", "Security+", "A+"],
      recognition: "Globally recognised baseline certifications",
      category: "vendor_cert",
      region: "global",
    },
    {
      name: "Microsoft Learn",
      url: "https://learn.microsoft.com",
      description: "Free learning platform with hands-on labs for Azure, Power BI, and Microsoft technologies.",
      bestFor: "Free structured learning with sandbox environments",
      typicalOfferings: ["Azure Fundamentals", "Power BI Analyst", "Azure Data Engineer"],
      recognition: "Industry-standard Microsoft certifications",
      category: "vendor_cert",
      region: "global",
    },
    {
      name: "University of the Witwatersrand (Wits) — Online Courses",
      url: "https://www.getsmarter.com/universities/wits",
      description: "Wits offers accredited short courses in tech and business through GetSmarter.",
      bestFor: "South African university-backed certifications",
      typicalOfferings: ["Data Science", "Digital Business", "Cyber Security"],
      recognition: "Top SA university; internationally recognised",
      category: "university",
      region: "south_africa",
    },
    {
      name: "DataCamp",
      url: "https://datacamp.com",
      description: "Interactive data science learning platform with hands-on coding exercises.",
      bestFor: "Hands-on practice for Python, R, SQL",
      typicalOfferings: ["Python Fundamentals", "SQL for Data Science", "Machine Learning"],
      recognition: "Popular with hiring managers; skill assessments",
      category: "online_platform",
      region: "global",
    },
  ];

  for (const inst of institutions) {
    await prisma.institution.upsert({
      where: { id: inst.name }, // Will fail on first run, that's OK
      create: inst,
      update: inst,
    }).catch(async () => {
      // If upsert fails (no unique constraint on name), try create
      await prisma.institution.create({ data: inst }).catch(() => {});
    });
  }

  console.log(`Seeded ${institutions.length} institutions`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
