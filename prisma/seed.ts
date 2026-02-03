import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data (reverse dependency order)
  await prisma.contactTag.deleteMany();
  await prisma.companyTag.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.tag.deleteMany();

  // Use existing user or create a placeholder userId
  // Better Auth manages user creation, so we use a fixed ID for seeding
  const userId = "seed-user-001";

  // Check if seed user exists, create via raw insert if not
  // (Better Auth manages User table, but we need a user for FK refs)
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: userId,
        name: "Demo User",
        email: "demo@minicrm.local",
        emailVerified: true,
      },
    });
  }

  // Note: E2E test user (test@example.com) is created by the test fixture
  // using Better Auth's signup API, which properly handles password hashing

  // --- Tags ---
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "VIP", color: "#EF4444", userId } }),
    prisma.tag.create({ data: { name: "Partner", color: "#3B82F6", userId } }),
    prisma.tag.create({ data: { name: "Lead", color: "#10B981", userId } }),
    prisma.tag.create({
      data: { name: "Enterprise", color: "#8B5CF6", userId },
    }),
    prisma.tag.create({
      data: { name: "Prospect", color: "#F59E0B", userId },
    }),
  ]);

  // --- Companies ---
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "Acme Corporation",
        industry: "Technology",
        size: "medium_51_200",
        website: "https://acme.example.com",
        phone: "+1-555-0100",
        email: "contact@acme.example.com",
        address: "123 Innovation Drive, San Francisco, CA",
        notes: "Key enterprise client, interested in annual contracts",
        userId,
      },
    }),
    prisma.company.create({
      data: {
        name: "Global Trade Co.",
        industry: "Import/Export",
        size: "large_201_500",
        website: "https://globaltrade.example.com",
        phone: "+1-555-0200",
        email: "info@globaltrade.example.com",
        address: "456 Commerce Blvd, New York, NY",
        notes: "International trading partner",
        userId,
      },
    }),
    prisma.company.create({
      data: {
        name: "Sunrise Consulting",
        industry: "Consulting",
        size: "small_11_50",
        website: "https://sunrise.example.com",
        phone: "+1-555-0300",
        email: "hello@sunrise.example.com",
        address: "789 Strategy Lane, Chicago, IL",
        userId,
      },
    }),
    prisma.company.create({
      data: {
        name: "Pacific Manufacturing",
        industry: "Manufacturing",
        size: "enterprise_500_plus",
        phone: "+1-555-0400",
        email: "sales@pacific.example.com",
        address: "321 Factory Row, Seattle, WA",
        notes: "Large-scale manufacturing contracts",
        userId,
      },
    }),
    prisma.company.create({
      data: {
        name: "NovaTech Solutions",
        industry: "Software",
        size: "tiny_1_10",
        website: "https://novatech.example.com",
        phone: "+1-555-0500",
        email: "team@novatech.example.com",
        address: "654 Startup Ave, Austin, TX",
        userId,
      },
    }),
  ]);

  // --- Company Tags ---
  await prisma.companyTag.createMany({
    data: [
      { companyId: companies[0].id, tagId: tags[0].id }, // Acme -> VIP
      { companyId: companies[0].id, tagId: tags[3].id }, // Acme -> Enterprise
      { companyId: companies[1].id, tagId: tags[1].id }, // Global -> Partner
      { companyId: companies[2].id, tagId: tags[2].id }, // Sunrise -> Lead
      { companyId: companies[3].id, tagId: tags[3].id }, // Pacific -> Enterprise
      { companyId: companies[4].id, tagId: tags[4].id }, // NovaTech -> Prospect
    ],
  });

  // --- Contacts (3 per company = 15 total) ---
  const contacts = await Promise.all([
    // Acme contacts
    prisma.contact.create({
      data: {
        name: "John Smith",
        email: "john@acme.example.com",
        phone: "+1-555-0101",
        jobTitle: "VP of Engineering",
        isDecisionMaker: true,
        authorityLevel: "primary",
        companyId: companies[0].id,
        userId,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Sarah Johnson",
        email: "sarah@acme.example.com",
        phone: "+1-555-0102",
        jobTitle: "Product Manager",
        isDecisionMaker: false,
        authorityLevel: "influencer",
        companyId: companies[0].id,
        userId,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Mike Chen",
        email: "mike@acme.example.com",
        jobTitle: "CTO",
        isDecisionMaker: true,
        authorityLevel: "primary",
        companyId: companies[0].id,
        userId,
      },
    }),
    // Global Trade contacts
    prisma.contact.create({
      data: {
        name: "Emily Davis",
        email: "emily@globaltrade.example.com",
        phone: "+1-555-0201",
        jobTitle: "Director of Operations",
        isDecisionMaker: true,
        authorityLevel: "primary",
        companyId: companies[1].id,
        userId,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Robert Wilson",
        email: "robert@globaltrade.example.com",
        jobTitle: "Procurement Manager",
        isDecisionMaker: false,
        authorityLevel: "secondary",
        companyId: companies[1].id,
        userId,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Lisa Brown",
        email: "lisa@globaltrade.example.com",
        jobTitle: "CFO",
        isDecisionMaker: true,
        authorityLevel: "primary",
        companyId: companies[1].id,
        userId,
      },
    }),
    // Sunrise Consulting contacts
    prisma.contact.create({
      data: {
        name: "David Martinez",
        email: "david@sunrise.example.com",
        phone: "+1-555-0301",
        jobTitle: "Managing Partner",
        isDecisionMaker: true,
        authorityLevel: "primary",
        companyId: companies[2].id,
        userId,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Anna Lee",
        email: "anna@sunrise.example.com",
        jobTitle: "Senior Consultant",
        isDecisionMaker: false,
        authorityLevel: "influencer",
        companyId: companies[2].id,
        userId,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Tom Garcia",
        email: "tom@sunrise.example.com",
        jobTitle: "Business Analyst",
        companyId: companies[2].id,
        userId,
      },
    }),
    // Pacific Manufacturing contacts
    prisma.contact.create({
      data: {
        name: "Jennifer Taylor",
        email: "jennifer@pacific.example.com",
        phone: "+1-555-0401",
        jobTitle: "Head of Procurement",
        isDecisionMaker: true,
        authorityLevel: "primary",
        companyId: companies[3].id,
        userId,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Chris Anderson",
        email: "chris@pacific.example.com",
        jobTitle: "Plant Manager",
        isDecisionMaker: false,
        authorityLevel: "secondary",
        companyId: companies[3].id,
        userId,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Karen White",
        email: "karen@pacific.example.com",
        jobTitle: "CEO",
        isDecisionMaker: true,
        authorityLevel: "primary",
        companyId: companies[3].id,
        userId,
      },
    }),
    // NovaTech contacts
    prisma.contact.create({
      data: {
        name: "Alex Thompson",
        email: "alex@novatech.example.com",
        phone: "+1-555-0501",
        jobTitle: "Founder & CEO",
        isDecisionMaker: true,
        authorityLevel: "primary",
        companyId: companies[4].id,
        userId,
      },
    }),
    prisma.contact.create({
      data: {
        name: "Rachel Kim",
        email: "rachel@novatech.example.com",
        jobTitle: "Lead Developer",
        isDecisionMaker: false,
        authorityLevel: "influencer",
        companyId: companies[4].id,
        userId,
      },
    }),
    prisma.contact.create({
      data: {
        name: "James Park",
        email: "james@novatech.example.com",
        jobTitle: "Sales Director",
        isDecisionMaker: true,
        authorityLevel: "secondary",
        companyId: companies[4].id,
        userId,
      },
    }),
  ]);

  // --- Contact Tags ---
  await prisma.contactTag.createMany({
    data: [
      { contactId: contacts[0].id, tagId: tags[0].id }, // John -> VIP
      { contactId: contacts[2].id, tagId: tags[0].id }, // Mike -> VIP
      { contactId: contacts[3].id, tagId: tags[1].id }, // Emily -> Partner
      { contactId: contacts[12].id, tagId: tags[4].id }, // Alex -> Prospect
    ],
  });

  // --- Deals (10 across stages) ---
  const now = new Date();
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        name: "Acme Enterprise License",
        value: 75000,
        stage: "negotiation",
        probability: 70,
        expectedCloseDate: new Date(now.getTime() + 14 * 86400000),
        notes: "Annual enterprise license renewal",
        companyId: companies[0].id,
        contactId: contacts[0].id,
        userId,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Acme Support Package",
        value: 15000,
        stage: "proposal",
        probability: 50,
        expectedCloseDate: new Date(now.getTime() + 30 * 86400000),
        companyId: companies[0].id,
        contactId: contacts[1].id,
        userId,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Global Trade Integration",
        value: 120000,
        stage: "qualification",
        probability: 30,
        expectedCloseDate: new Date(now.getTime() + 60 * 86400000),
        notes: "Custom integration project",
        companyId: companies[1].id,
        contactId: contacts[3].id,
        userId,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Sunrise Strategy Engagement",
        value: 45000,
        stage: "closed_won",
        probability: 100,
        expectedCloseDate: new Date(now.getTime() - 7 * 86400000),
        companyId: companies[2].id,
        contactId: contacts[6].id,
        userId,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Pacific Supply Chain Overhaul",
        value: 250000,
        stage: "prospecting",
        probability: 10,
        expectedCloseDate: new Date(now.getTime() + 90 * 86400000),
        companyId: companies[3].id,
        contactId: contacts[9].id,
        userId,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Pacific Equipment Upgrade",
        value: 80000,
        stage: "proposal",
        probability: 45,
        expectedCloseDate: new Date(now.getTime() + 21 * 86400000),
        companyId: companies[3].id,
        contactId: contacts[10].id,
        userId,
      },
    }),
    prisma.deal.create({
      data: {
        name: "NovaTech Pilot Program",
        value: 12000,
        stage: "negotiation",
        probability: 80,
        expectedCloseDate: new Date(now.getTime() + 7 * 86400000),
        companyId: companies[4].id,
        contactId: contacts[12].id,
        userId,
      },
    }),
    prisma.deal.create({
      data: {
        name: "NovaTech Full License",
        value: 35000,
        stage: "prospecting",
        probability: 15,
        expectedCloseDate: new Date(now.getTime() + 120 * 86400000),
        companyId: companies[4].id,
        contactId: contacts[14].id,
        userId,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Global Trade Expansion",
        value: 95000,
        stage: "closed_lost",
        probability: 0,
        expectedCloseDate: new Date(now.getTime() - 14 * 86400000),
        notes: "Lost to competitor",
        companyId: companies[1].id,
        contactId: contacts[5].id,
        userId,
      },
    }),
    prisma.deal.create({
      data: {
        name: "Sunrise Training Program",
        value: 28000,
        stage: "qualification",
        probability: 35,
        expectedCloseDate: new Date(now.getTime() + 45 * 86400000),
        companyId: companies[2].id,
        contactId: contacts[7].id,
        userId,
      },
    }),
  ]);

  // --- Activities (20 total) ---
  await Promise.all([
    prisma.activity.create({
      data: {
        type: "call",
        subject: "Initial discovery call with John",
        description: "Discussed requirements for enterprise license renewal",
        date: new Date(now.getTime() - 30 * 86400000),
        durationMinutes: 45,
        outcome: "Positive - interested in expanded package",
        nextSteps: "Send proposal by end of week",
        companyId: companies[0].id,
        contactId: contacts[0].id,
        dealId: deals[0].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "email",
        subject: "Proposal sent to Acme",
        description: "Sent enterprise license proposal with pricing tiers",
        date: new Date(now.getTime() - 25 * 86400000),
        companyId: companies[0].id,
        contactId: contacts[0].id,
        dealId: deals[0].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "meeting",
        subject: "Negotiation meeting with Acme team",
        description: "In-person meeting to discuss terms and timeline",
        date: new Date(now.getTime() - 10 * 86400000),
        durationMinutes: 90,
        outcome: "Agreed on terms, pending final approval",
        nextSteps: "Wait for legal review",
        companyId: companies[0].id,
        contactId: contacts[2].id,
        dealId: deals[0].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "note",
        subject: "Sarah mentioned new product launch",
        description: "Acme planning Q3 product launch, may need additional support",
        date: new Date(now.getTime() - 20 * 86400000),
        companyId: companies[0].id,
        contactId: contacts[1].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "call",
        subject: "Global Trade intro call",
        description: "Initial call with Emily about integration needs",
        date: new Date(now.getTime() - 45 * 86400000),
        durationMinutes: 30,
        outcome: "Interested in custom integration",
        companyId: companies[1].id,
        contactId: contacts[3].id,
        dealId: deals[2].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "email",
        subject: "Follow-up: integration requirements",
        date: new Date(now.getTime() - 40 * 86400000),
        companyId: companies[1].id,
        contactId: contacts[3].id,
        dealId: deals[2].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "meeting",
        subject: "Technical requirements workshop",
        description: "Deep-dive into integration architecture",
        date: new Date(now.getTime() - 28 * 86400000),
        durationMinutes: 120,
        companyId: companies[1].id,
        contactId: contacts[4].id,
        dealId: deals[2].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "call",
        subject: "Sunrise contract signing call",
        date: new Date(now.getTime() - 8 * 86400000),
        durationMinutes: 15,
        outcome: "Contract signed",
        companyId: companies[2].id,
        contactId: contacts[6].id,
        dealId: deals[3].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "note",
        subject: "Sunrise project kickoff notes",
        description: "Team alignment on deliverables and timeline",
        date: new Date(now.getTime() - 5 * 86400000),
        companyId: companies[2].id,
        contactId: contacts[6].id,
        dealId: deals[3].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "email",
        subject: "Training proposal to Anna",
        date: new Date(now.getTime() - 15 * 86400000),
        companyId: companies[2].id,
        contactId: contacts[7].id,
        dealId: deals[9].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "call",
        subject: "Pacific initial outreach",
        description: "Cold outreach to Jennifer about supply chain needs",
        date: new Date(now.getTime() - 60 * 86400000),
        durationMinutes: 20,
        outcome: "Interested but busy this quarter",
        nextSteps: "Follow up next month",
        companyId: companies[3].id,
        contactId: contacts[9].id,
        dealId: deals[4].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "meeting",
        subject: "Pacific equipment demo",
        description: "On-site demo of equipment upgrade options",
        date: new Date(now.getTime() - 18 * 86400000),
        durationMinutes: 60,
        outcome: "Positive feedback on Option B",
        companyId: companies[3].id,
        contactId: contacts[10].id,
        dealId: deals[5].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "email",
        subject: "Equipment pricing breakdown",
        date: new Date(now.getTime() - 12 * 86400000),
        companyId: companies[3].id,
        contactId: contacts[10].id,
        dealId: deals[5].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "note",
        subject: "Karen wants board approval first",
        description: "CEO Karen mentioned needing board approval for large purchases",
        date: new Date(now.getTime() - 3 * 86400000),
        companyId: companies[3].id,
        contactId: contacts[11].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "call",
        subject: "NovaTech pilot discussion",
        description: "Discussed pilot program scope and timeline with Alex",
        date: new Date(now.getTime() - 21 * 86400000),
        durationMinutes: 35,
        outcome: "Ready to start pilot",
        companyId: companies[4].id,
        contactId: contacts[12].id,
        dealId: deals[6].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "email",
        subject: "Pilot agreement sent",
        date: new Date(now.getTime() - 14 * 86400000),
        companyId: companies[4].id,
        contactId: contacts[12].id,
        dealId: deals[6].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "meeting",
        subject: "NovaTech pilot kickoff",
        description: "Virtual kickoff meeting with Alex and Rachel",
        date: new Date(now.getTime() - 7 * 86400000),
        durationMinutes: 45,
        companyId: companies[4].id,
        contactId: contacts[13].id,
        dealId: deals[6].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "call",
        subject: "James - license expansion interest",
        description: "James asked about full license pricing after pilot",
        date: new Date(now.getTime() - 2 * 86400000),
        durationMinutes: 25,
        outcome: "Will present to leadership team",
        nextSteps: "Send full license comparison",
        companyId: companies[4].id,
        contactId: contacts[14].id,
        dealId: deals[7].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "note",
        subject: "Competitor analysis note",
        description: "Global Trade mentioned evaluating competitor offerings",
        date: new Date(now.getTime() - 35 * 86400000),
        companyId: companies[1].id,
        contactId: contacts[5].id,
        dealId: deals[8].id,
        userId,
      },
    }),
    prisma.activity.create({
      data: {
        type: "email",
        subject: "Lost deal follow-up",
        description: "Sent follow-up email after losing Global Trade expansion deal",
        date: new Date(now.getTime() - 13 * 86400000),
        companyId: companies[1].id,
        contactId: contacts[5].id,
        dealId: deals[8].id,
        userId,
      },
    }),
  ]);

  console.log("Seed complete:");
  console.log(`  Tags: ${tags.length}`);
  console.log(`  Companies: ${companies.length}`);
  console.log(`  Contacts: ${contacts.length}`);
  console.log(`  Deals: ${deals.length}`);
  console.log(`  Activities: 20`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
