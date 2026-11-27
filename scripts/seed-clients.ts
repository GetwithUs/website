import "./load-env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/server/db/schema";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(sql, { schema });

async function main() {
  // ---- Sharma Retail Group ----
  const [sharma] = await db
    .insert(schema.clients)
    .values({
      slug: "sharma-retail-group",
      name: "Sharma Retail Group",
      industry: "Retail & E-commerce",
      tagline: "India's fastest-growing family retail chain, now fully online",
      projectBrief: `## The challenge\n\nSharma Retail Group operated 14 stores across Rajasthan with zero online presence. Orders came via phone calls and WhatsApp messages handled manually — the team was drowning in coordination overhead.\n\n## What we built\n\nWe delivered a full e-commerce platform: product catalog, inventory sync, order management, and a customer-facing WhatsApp bot that handles order status, FAQs, and repeat purchases. The admin dashboard lets the team manage all 14 store inventories from one screen.\n\n## The result\n\nWithin 90 days of launch, 60% of orders were placed through the new platform. The operations team went from 8 manual staff to 3, while handling 2× the order volume.`,
      servicesDelivered: ["Web Development", "WhatsApp Bot", "E-commerce Platform", "Admin Dashboard"],
      techStack: ["Next.js", "PostgreSQL", "Vercel", "WhatsApp Business API", "Stripe"],
      projectUrl: "https://sharmaretail.example.com",
      linkType: "website",
      resultHighlights: [
        "60% of orders moved online in 90 days",
        "2× order volume with 62% fewer operations staff",
        "WhatsApp bot handles 400+ queries/day automatically",
      ],
      testimonialText:
        "GetwithUs understood our business inside out. They didn't just build a website — they redesigned how we work. Our busiest Diwali season ran smoother than ever.",
      testimonialAuthor: "Ramesh Sharma, Managing Director, Sharma Retail Group",
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-09-15"),
      isFeatured: true,
      displayOrder: 1,
      status: "published",
    })
    .onConflictDoNothing()
    .returning();

  if (sharma) {
    await db
      .insert(schema.clientMilestones)
      .values([
        {
          clientId: sharma.id,
          title: "Discovery",
          description: "Mapped all 14 store workflows and existing WhatsApp order processes.",
          milestoneDate: new Date("2025-06-05"),
          sortOrder: 0,
        },
        {
          clientId: sharma.id,
          title: "Design & Architecture",
          description: "Designed the multi-store inventory model and customer-facing flows.",
          milestoneDate: new Date("2025-06-20"),
          sortOrder: 1,
        },
        {
          clientId: sharma.id,
          title: "Development & Integration",
          description: "Built the platform, WhatsApp bot, and inventory sync in parallel sprints.",
          milestoneDate: new Date("2025-08-10"),
          sortOrder: 2,
        },
        {
          clientId: sharma.id,
          title: "Launch",
          description: "Soft-launched with 3 stores; full 14-store rollout two weeks later.",
          milestoneDate: new Date("2025-09-15"),
          sortOrder: 3,
        },
      ])
      .onConflictDoNothing();
  }

  // ---- HealthBridge Clinics ----
  const [healthbridge] = await db
    .insert(schema.clients)
    .values({
      slug: "healthbridge-clinics",
      name: "HealthBridge Clinics",
      industry: "Healthcare",
      tagline: "Connecting patients to specialists across 6 cities",
      projectBrief: `## The challenge\n\nHealthBridge ran 12 clinics in 6 cities with no central booking system. Patients called individual clinics, doctors had no shared calendar, and referrals were done on paper.\n\n## What we built\n\nA unified clinic management platform: patient portal with online booking, doctor scheduling, digital prescriptions, and a WhatsApp reminder bot. All 12 clinics share one real-time calendar.\n\n## The outcome\n\nNo-show rates dropped by 38%. Referrals between clinics now take under 5 minutes instead of 2 days. Patients can book, reschedule, and get prescriptions from their phone.`,
      servicesDelivered: ["Web Application", "Patient Portal", "WhatsApp Bot", "Scheduling System"],
      techStack: ["Next.js", "Node.js", "PostgreSQL", "Twilio", "Vercel"],
      projectUrl: "https://healthbridge.example.com",
      linkType: "website",
      resultHighlights: [
        "38% reduction in appointment no-shows",
        "Cross-clinic referrals down from 2 days to 5 minutes",
        "1,200+ patients booked online in first month",
      ],
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-07-30"),
      isFeatured: true,
      displayOrder: 2,
      status: "published",
    })
    .onConflictDoNothing()
    .returning();

  if (healthbridge) {
    await db
      .insert(schema.clientMilestones)
      .values([
        {
          clientId: healthbridge.id,
          title: "Discovery",
          description: "Audited existing booking methods across all 12 clinics.",
          milestoneDate: new Date("2025-03-10"),
          sortOrder: 0,
        },
        {
          clientId: healthbridge.id,
          title: "Design",
          description: "Designed patient and doctor flows; validated with 3 doctors and 10 patients.",
          milestoneDate: new Date("2025-04-01"),
          sortOrder: 1,
        },
        {
          clientId: healthbridge.id,
          title: "Development",
          description: "Built core booking and scheduling; integrated WhatsApp reminders.",
          milestoneDate: new Date("2025-06-15"),
          sortOrder: 2,
        },
        {
          clientId: healthbridge.id,
          title: "Launch",
          description: "Rolled out to all 12 clinics with training for front-desk staff.",
          milestoneDate: new Date("2025-07-30"),
          sortOrder: 3,
        },
      ])
      .onConflictDoNothing();
  }

  // ---- GreenLeaf Farms ----
  const [greenleaf] = await db
    .insert(schema.clients)
    .values({
      slug: "greenleaf-farms",
      name: "GreenLeaf Farms",
      industry: "Agriculture & Agritech",
      tagline: "Direct farm-to-consumer vegetables, delivered fresh",
      projectBrief: `## The challenge\n\nGreenLeaf Farms sold produce to wholesalers at thin margins. They wanted to sell directly to households in Pune but had no digital channel and no logistics system.\n\n## What we built\n\nA subscription e-commerce app (web + Android) where households pick a weekly vegetable basket, pay upfront, and receive deliveries. A logistics dashboard shows drivers their routes, with real-time status updates to customers via WhatsApp.\n\n## The result\n\nIn the first season, GreenLeaf served 800 households with zero missed deliveries. Revenue per kg doubled compared to wholesale, and the customer repeat rate is 78%.`,
      servicesDelivered: ["Mobile App Development", "Web Development", "Logistics Dashboard", "WhatsApp Notifications"],
      techStack: ["React Native", "Next.js", "PostgreSQL", "Google Maps API", "Vercel"],
      projectUrl: "https://play.google.com/store/apps/details?id=com.greenleaf.example",
      linkType: "android",
      resultHighlights: [
        "800 households served in first season",
        "Revenue per kg doubled vs wholesale",
        "78% customer repeat rate after first order",
      ],
      startDate: new Date("2025-01-10"),
      endDate: new Date("2025-05-20"),
      isFeatured: true,
      displayOrder: 3,
      status: "published",
    })
    .onConflictDoNothing()
    .returning();

  if (greenleaf) {
    await db
      .insert(schema.clientMilestones)
      .values([
        {
          clientId: greenleaf.id,
          title: "Discovery",
          description: "Mapped the farm-to-door supply chain and pricing model.",
          milestoneDate: new Date("2025-01-15"),
          sortOrder: 0,
        },
        {
          clientId: greenleaf.id,
          title: "Design",
          description: "Designed subscription flows, basket builder, and driver app.",
          milestoneDate: new Date("2025-02-01"),
          sortOrder: 1,
        },
        {
          clientId: greenleaf.id,
          title: "Development",
          description: "Built Android app, web portal, and logistics dashboard in parallel.",
          milestoneDate: new Date("2025-04-20"),
          sortOrder: 2,
        },
        {
          clientId: greenleaf.id,
          title: "Launch",
          description: "Launched subscriptions with 50 pilot households, then opened fully.",
          milestoneDate: new Date("2025-05-20"),
          sortOrder: 3,
        },
      ])
      .onConflictDoNothing();
  }

  // ---- UrbanNest Realty ----
  const [urbannest] = await db
    .insert(schema.clients)
    .values({
      slug: "urbannest-realty",
      name: "UrbanNest Realty",
      industry: "Real Estate",
      tagline: "Modern property discovery for Hyderabad home buyers",
      projectBrief: `## The challenge\n\nUrbanNest listed properties on third-party portals and paid high commissions. They had no website of their own, no lead capture system, and no way to follow up with prospects systematically.\n\n## What we built\n\nA branded property discovery website with an AI-powered search (filter by budget, BHK, locality, amenities), a lead capture form, and a CRM-lite dashboard for the sales team. A WhatsApp bot qualifies leads automatically before they reach a salesperson.\n\n## The outcome\n\nPortal commissions dropped by 70%. The sales team now handles only qualified leads, and time-to-visit booking dropped from 4 days to same-day.`,
      servicesDelivered: ["Web Development", "CRM Dashboard", "WhatsApp Bot", "Lead Capture System"],
      techStack: ["Next.js", "PostgreSQL", "Vercel", "WhatsApp Business API"],
      projectUrl: "https://urbannest.example.com",
      linkType: "website",
      resultHighlights: [
        "70% reduction in portal commission costs",
        "Lead qualification time cut by 80%",
        "Same-day visit booking for qualified leads",
      ],
      startDate: new Date("2025-08-01"),
      endDate: new Date("2025-11-10"),
      isFeatured: false,
      displayOrder: 4,
      status: "published",
    })
    .onConflictDoNothing()
    .returning();

  if (urbannest) {
    await db
      .insert(schema.clientMilestones)
      .values([
        {
          clientId: urbannest.id,
          title: "Discovery",
          description: "Mapped the sales funnel and lead qualification criteria.",
          milestoneDate: new Date("2025-08-07"),
          sortOrder: 0,
        },
        {
          clientId: urbannest.id,
          title: "Development",
          description: "Built property search, lead forms, CRM dashboard, and WhatsApp bot.",
          milestoneDate: new Date("2025-10-15"),
          sortOrder: 1,
        },
        {
          clientId: urbannest.id,
          title: "Launch",
          description: "Went live with full property catalog and sales team training.",
          milestoneDate: new Date("2025-11-10"),
          sortOrder: 2,
        },
      ])
      .onConflictDoNothing();
  }

  // ---- QuickBite Delivery ----
  const [quickbite] = await db
    .insert(schema.clients)
    .values({
      slug: "quickbite-delivery",
      name: "QuickBite Delivery",
      industry: "Food & Beverage",
      tagline: "30-minute cloud kitchen delivery, built to scale",
      projectBrief: `## The challenge\n\nQuickBite ran 4 cloud kitchens in Bengaluru and took orders via Zomato and Swiggy, paying 25–30% commission on every order. They needed their own ordering channel and delivery tracking.\n\n## What we built\n\nA branded web ordering experience, a native iOS app, real-time delivery tracking, and a kitchen display system. Orders flow from customer to kitchen to driver without a single phone call.\n\n## The result\n\nDirect orders now account for 45% of revenue at zero commission. Average delivery time improved from 42 minutes to 28 minutes, and driver disputes dropped to near zero.`,
      servicesDelivered: ["iOS App Development", "Web Development", "Kitchen Display System", "Real-time Tracking"],
      techStack: ["Swift", "Next.js", "PostgreSQL", "WebSockets", "Vercel"],
      projectUrl: "https://apps.apple.com/app/quickbite-example",
      linkType: "ios",
      resultHighlights: [
        "45% of revenue now from direct, zero-commission orders",
        "Average delivery time improved from 42 to 28 minutes",
        "Driver dispute rate reduced by 94%",
      ],
      startDate: new Date("2025-04-01"),
      endDate: new Date("2025-08-20"),
      isFeatured: false,
      displayOrder: 5,
      status: "published",
    })
    .onConflictDoNothing()
    .returning();

  if (quickbite) {
    await db
      .insert(schema.clientMilestones)
      .values([
        {
          clientId: quickbite.id,
          title: "Discovery",
          description: "Mapped kitchen workflows and driver coordination pain points.",
          milestoneDate: new Date("2025-04-07"),
          sortOrder: 0,
        },
        {
          clientId: quickbite.id,
          title: "Design",
          description: "Designed iOS app, web ordering, and kitchen display in one sprint.",
          milestoneDate: new Date("2025-04-28"),
          sortOrder: 1,
        },
        {
          clientId: quickbite.id,
          title: "Development",
          description: "Built all three surfaces with real-time order state shared via WebSockets.",
          milestoneDate: new Date("2025-07-30"),
          sortOrder: 2,
        },
        {
          clientId: quickbite.id,
          title: "Launch",
          description: "Soft-launched with one kitchen, expanded to all four over two weeks.",
          milestoneDate: new Date("2025-08-20"),
          sortOrder: 3,
        },
      ])
      .onConflictDoNothing();
  }

  // ---- EduSpark Academy ----
  const [eduspark] = await db
    .insert(schema.clients)
    .values({
      slug: "eduspark-academy",
      name: "EduSpark Academy",
      industry: "Education Technology",
      tagline: "Live online coaching for JEE and NEET, done right",
      projectBrief: `## The challenge\n\nEduSpark ran live coaching classes on Zoom and sold courses via Google Forms and PhonePe links shared on WhatsApp. There was no student portal, no recorded lecture library, and no progress tracking for teachers.\n\n## What we built\n\nA full LMS: student enrollment portal, live class scheduler, recorded lecture library, assignment submission, and a teacher dashboard with attendance and progress analytics. Parents get automated weekly reports via WhatsApp.\n\n## The result\n\nDropout rate fell from 22% to 7%. Teachers spend 3 fewer hours per week on admin. Student satisfaction scores went from 3.6 to 4.5 out of 5.`,
      servicesDelivered: ["LMS Development", "Web Application", "WhatsApp Automation", "Analytics Dashboard"],
      techStack: ["Next.js", "PostgreSQL", "AWS S3", "WhatsApp Business API", "Vercel"],
      resultHighlights: [
        "Dropout rate fell from 22% to 7%",
        "Student satisfaction improved from 3.6 to 4.5/5",
        "Teachers save 3+ hours per week on admin",
      ],
      startDate: new Date("2024-11-01"),
      endDate: new Date("2025-03-31"),
      isFeatured: false,
      displayOrder: 6,
      status: "published",
    })
    .onConflictDoNothing()
    .returning();

  if (eduspark) {
    await db
      .insert(schema.clientMilestones)
      .values([
        {
          clientId: eduspark.id,
          title: "Discovery",
          description: "Interviewed teachers, students, and parents to map the learning lifecycle.",
          milestoneDate: new Date("2024-11-08"),
          sortOrder: 0,
        },
        {
          clientId: eduspark.id,
          title: "Design",
          description: "Designed student portal, teacher dashboard, and parent report flows.",
          milestoneDate: new Date("2024-12-01"),
          sortOrder: 1,
        },
        {
          clientId: eduspark.id,
          title: "Development",
          description: "Built the LMS with live class integration, lecture library, and assignments.",
          milestoneDate: new Date("2025-02-28"),
          sortOrder: 2,
        },
        {
          clientId: eduspark.id,
          title: "Launch",
          description: "Onboarded all 1,200 active students with zero data loss from old system.",
          milestoneDate: new Date("2025-03-31"),
          sortOrder: 3,
        },
      ])
      .onConflictDoNothing();
  }

  console.log("6 demo clients seeded.");
  await sql.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
