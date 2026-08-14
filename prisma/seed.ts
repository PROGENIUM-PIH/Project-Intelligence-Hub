import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function d(dateStr: string) {
  return new Date(`${dateStr}T09:00:00.000Z`);
}

async function main() {
  console.log("Seeding database...");

  await prisma.activity.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.task.deleteMany();
  await prisma.marketInitiative.deleteMany();
  await prisma.initiative.deleteMany();
  await prisma.market.deleteMany();

  // ---------- Markets ----------
  const germany = await prisma.market.create({
    data: {
      name: "Germany",
      code: "DE",
      region: "Western Europe",
      lead: "Anna Hoffmann",
      status: "ON_TRACK",
    },
  });

  const france = await prisma.market.create({
    data: {
      name: "France",
      code: "FR",
      region: "Western Europe",
      lead: "Marc Dubois",
      status: "AT_RISK",
    },
  });

  const czechRepublic = await prisma.market.create({
    data: {
      name: "Czech Republic",
      code: "CZ",
      region: "Central Europe",
      lead: "Petra Novak",
      status: "ON_TRACK",
    },
  });

  // ---------- Initiatives ----------
  const id1 = await prisma.initiative.create({
    data: {
      code: "ID1",
      name: "Digital Retail Platform Rollout",
      description:
        "Deploy the unified digital retail and configurator platform across dealer networks, replacing legacy CRM tools with a connected sales experience.",
      owner: "Julia Bauer",
      status: "ON_TRACK",
      progress: 62,
      startDate: d("2026-01-12"),
      targetDate: d("2026-12-18"),
    },
  });

  const id2 = await prisma.initiative.create({
    data: {
      code: "ID2",
      name: "Sales Academy & Certification",
      description:
        "Roll out a standardized sales consultant certification program and digital learning academy across all markets.",
      owner: "Thomas Klein",
      status: "AT_RISK",
      progress: 41,
      startDate: d("2026-02-01"),
      targetDate: d("2026-11-30"),
    },
  });

  const id3 = await prisma.initiative.create({
    data: {
      code: "ID3",
      name: "Customer Data Unification",
      description:
        "Consolidate market-level customer and lead data into a single CDP to enable consistent lifecycle marketing and reporting.",
      owner: "Sofia Rossi",
      status: "ON_TRACK",
      progress: 55,
      startDate: d("2025-11-03"),
      targetDate: d("2026-09-15"),
    },
  });

  const id4 = await prisma.initiative.create({
    data: {
      code: "ID4",
      name: "Dealer Network Optimization",
      description:
        "Rationalize the dealer footprint and upgrade underperforming locations to the new premium retail format.",
      owner: "Erik Novotny",
      status: "CRITICAL",
      progress: 28,
      startDate: d("2026-03-01"),
      targetDate: d("2027-02-28"),
    },
  });

  // ---------- Market <-> Initiative links ----------
  await prisma.marketInitiative.createMany({
    data: [
      { marketId: germany.id, initiativeId: id1.id, localStatus: "ON_TRACK", localLead: "Julia Bauer" },
      { marketId: germany.id, initiativeId: id2.id, localStatus: "ON_TRACK", localLead: "Nina Weber" },
      { marketId: germany.id, initiativeId: id3.id, localStatus: "ON_TRACK", localLead: "Felix Schmidt" },
      { marketId: france.id, initiativeId: id1.id, localStatus: "AT_RISK", localLead: "Camille Laurent" },
      { marketId: france.id, initiativeId: id2.id, localStatus: "AT_RISK", localLead: "Marc Dubois" },
      { marketId: france.id, initiativeId: id4.id, localStatus: "CRITICAL", localLead: "Julien Petit" },
      { marketId: czechRepublic.id, initiativeId: id1.id, localStatus: "ON_TRACK", localLead: "Petra Novak" },
      { marketId: czechRepublic.id, initiativeId: id3.id, localStatus: "ON_TRACK", localLead: "Tomas Kral" },
      { marketId: czechRepublic.id, initiativeId: id4.id, localStatus: "AT_RISK", localLead: "Erik Novotny" },
    ],
  });

  // ---------- Tasks ----------
  const taskDefs = [
    { title: "Finalize configurator UAT sign-off", description: "Close remaining UAT defects and obtain business sign-off for the retail configurator.", status: "IN_PROGRESS", priority: "HIGH", assignee: "Julia Bauer", dueDate: d("2026-08-20"), initiativeId: id1.id },
    { title: "Migrate DE dealer accounts to new CRM", description: "Complete data migration and validation for all German dealer accounts.", status: "DONE", priority: "MEDIUM", assignee: "Felix Schmidt", dueDate: d("2026-07-30"), initiativeId: id1.id },
    { title: "FR pilot dealership go-live readiness check", description: "Confirm infrastructure, training, and support readiness for the French pilot dealership.", status: "IN_PROGRESS", priority: "HIGH", assignee: "Camille Laurent", dueDate: d("2026-08-25"), initiativeId: id1.id },
    { title: "Draft platform training materials v2", description: "Update dealer-facing training deck and quick-reference guides for the new platform.", status: "TODO", priority: "MEDIUM", assignee: "Nina Weber", dueDate: d("2026-09-05"), initiativeId: id1.id },
    { title: "Publish certification curriculum module 3", description: "Finalize and publish module 3 of the sales consultant certification curriculum.", status: "BLOCKED", priority: "HIGH", assignee: "Thomas Klein", dueDate: d("2026-08-18"), initiativeId: id2.id },
    { title: "Onboard FR trainers to academy LMS", description: "Provision accounts and run onboarding sessions for French trainers on the academy LMS.", status: "TODO", priority: "MEDIUM", assignee: "Marc Dubois", dueDate: d("2026-08-29"), initiativeId: id2.id },
    { title: "Schedule DE consultant assessment day", description: "Coordinate venue, assessors, and candidate list for the German assessment day.", status: "IN_PROGRESS", priority: "LOW", assignee: "Nina Weber", dueDate: d("2026-09-10"), initiativeId: id2.id },
    { title: "Localize academy content into Czech", description: "Translate and adapt certification learning content for the Czech market.", status: "TODO", priority: "MEDIUM", assignee: "Tomas Kral", dueDate: d("2026-09-20"), initiativeId: id2.id },
    { title: "Complete CZ customer data mapping", description: "Map Czech CRM and DMS customer fields to the unified CDP schema.", status: "IN_PROGRESS", priority: "HIGH", assignee: "Tomas Kral", dueDate: d("2026-08-22"), initiativeId: id3.id },
    { title: "Sign off DE data privacy assessment", description: "Legal and compliance sign-off on the German market data privacy assessment.", status: "DONE", priority: "HIGH", assignee: "Felix Schmidt", dueDate: d("2026-07-15"), initiativeId: id3.id },
    { title: "Integrate CDP with FR lead system", description: "Build and test the integration between the CDP and the French lead management system.", status: "TODO", priority: "MEDIUM", assignee: "Sofia Rossi", dueDate: d("2026-09-12"), initiativeId: id3.id },
    { title: "Run data quality audit across markets", description: "Audit customer record completeness and duplication rates across all three markets.", status: "IN_PROGRESS", priority: "MEDIUM", assignee: "Sofia Rossi", dueDate: d("2026-08-30"), initiativeId: id3.id },
    { title: "Complete FR underperforming site review", description: "Finish the performance review of underperforming French dealer sites.", status: "BLOCKED", priority: "HIGH", assignee: "Julien Petit", dueDate: d("2026-08-19"), initiativeId: id4.id },
    { title: "Finalize CZ retail format investment case", description: "Prepare the investment case for upgrading Czech sites to the new premium retail format.", status: "IN_PROGRESS", priority: "HIGH", assignee: "Erik Novotny", dueDate: d("2026-08-27"), initiativeId: id4.id },
  ] as const;

  const tasks = [];
  for (const t of taskDefs) {
    tasks.push(await prisma.task.create({ data: t }));
  }

  // ---------- Risks ----------
  const riskDefs = [
    { title: "Configurator integration delays with legacy DMS", description: "Legacy dealer management system integration is behind schedule, threatening the DE/CZ rollout dates.", severity: "HIGH", status: "OPEN", owner: "Julia Bauer", identifiedDate: d("2026-06-10"), initiativeId: id1.id },
    { title: "FR dealer change-readiness lagging schedule", description: "French dealers report insufficient change-management support ahead of pilot go-live.", severity: "MEDIUM", status: "OPEN", owner: "Camille Laurent", identifiedDate: d("2026-07-02"), initiativeId: id1.id },
    { title: "Certification content localization bottleneck", description: "Translation vendor capacity is constrained, delaying non-English curriculum modules.", severity: "MEDIUM", status: "MITIGATED", owner: "Thomas Klein", identifiedDate: d("2026-05-20"), initiativeId: id2.id },
    { title: "Low trainer capacity in France", description: "Insufficient certified trainers available in France to meet the academy rollout timeline.", severity: "HIGH", status: "OPEN", owner: "Marc Dubois", identifiedDate: d("2026-07-18"), initiativeId: id2.id },
    { title: "Data privacy compliance gap in CZ market", description: "Czech data processing agreements are not yet aligned with the unified CDP consent model.", severity: "CRITICAL", status: "OPEN", owner: "Tomas Kral", identifiedDate: d("2026-06-25"), initiativeId: id3.id },
    { title: "Dealer partner pushback on site closures", description: "Independent dealer partners are contesting proposed site closures in the French network.", severity: "CRITICAL", status: "OPEN", owner: "Erik Novotny", identifiedDate: d("2026-04-14"), initiativeId: id4.id },
    { title: "Budget shortfall for retail format upgrades", description: "Current capex budget covers only two of the four planned premium format upgrades this fiscal year.", severity: "HIGH", status: "OPEN", owner: "Erik Novotny", identifiedDate: d("2026-07-05"), initiativeId: id4.id },
  ] as const;

  const risks = [];
  for (const r of riskDefs) {
    risks.push(await prisma.risk.create({ data: r }));
  }

  // ---------- Meetings ----------
  const meetingDefs = [
    { title: "Digital Retail Platform Steering Committee", type: "STEERING_COMMITTEE", scope: "INITIATIVE", initiativeId: id1.id, date: d("2026-08-18"), notes: "Review UAT sign-off status and FR pilot readiness." },
    { title: "Germany Monthly Status Review", type: "STATUS_REVIEW", scope: "MARKET", marketId: germany.id, date: d("2026-08-21"), notes: "Track CRM migration completion and training materials rollout." },
    { title: "Sales Academy Content Workshop", type: "WORKSHOP", scope: "INITIATIVE", initiativeId: id2.id, date: d("2026-08-19"), notes: "Align on curriculum module 3 blockers and localization plan." },
    { title: "France Program Sync", type: "STATUS_REVIEW", scope: "MARKET", marketId: france.id, date: d("2026-08-26"), notes: "Discuss dealer readiness and trainer capacity risk mitigation." },
    { title: "Dealer Network Optimization Kickoff", type: "KICKOFF", scope: "INITIATIVE", initiativeId: id4.id, date: d("2026-07-10"), notes: "Kicked off the site rationalization workstream and investment case." },
    { title: "Czech Republic Quarterly Review", type: "STATUS_REVIEW", scope: "MARKET", marketId: czechRepublic.id, date: d("2026-08-28"), notes: "Review data mapping progress and the retail format investment case." },
    { title: "Customer Data Unification Steering Committee", type: "STEERING_COMMITTEE", scope: "INITIATIVE", initiativeId: id3.id, date: d("2026-07-22"), notes: "Approved the CZ data mapping approach; DE privacy sign-off confirmed complete." },
    { title: "Platform Training Materials Review", type: "WORKSHOP", scope: "INITIATIVE", initiativeId: id1.id, date: d("2026-09-03"), notes: "Walkthrough of the training materials v2 draft." },
    { title: "Germany Executive Update", type: "STEERING_COMMITTEE", scope: "MARKET", marketId: germany.id, date: d("2026-07-05"), notes: "Executive alignment on Germany rollout milestones." },
  ] as const;

  for (const m of meetingDefs) {
    await prisma.meeting.create({ data: m });
  }

  // ---------- Activity feed ----------
  await prisma.activity.createMany({
    data: [
      { type: "TASK_COMPLETED", description: `Completed task "${tasks[1].title}"`, entityType: "Task", entityId: tasks[1].id, actor: "Felix Schmidt", createdAt: d("2026-07-30") },
      { type: "TASK_COMPLETED", description: `Completed task "${tasks[9].title}"`, entityType: "Task", entityId: tasks[9].id, actor: "Felix Schmidt", createdAt: d("2026-07-15") },
      { type: "RISK_RAISED", description: `Raised risk "${risks[4].title}"`, entityType: "Risk", entityId: risks[4].id, actor: "Tomas Kral", createdAt: d("2026-06-25") },
      { type: "RISK_RAISED", description: `Raised risk "${risks[5].title}"`, entityType: "Risk", entityId: risks[5].id, actor: "Erik Novotny", createdAt: d("2026-04-14") },
      { type: "RISK_MITIGATED", description: `Marked risk "${risks[2].title}" as mitigated`, entityType: "Risk", entityId: risks[2].id, actor: "Thomas Klein", createdAt: d("2026-07-28") },
      { type: "TASK_BLOCKED", description: `Task "${tasks[4].title}" marked blocked`, entityType: "Task", entityId: tasks[4].id, actor: "Thomas Klein", createdAt: d("2026-08-01") },
      { type: "TASK_BLOCKED", description: `Task "${tasks[12].title}" marked blocked`, entityType: "Task", entityId: tasks[12].id, actor: "Julien Petit", createdAt: d("2026-08-02") },
      { type: "MEETING_HELD", description: `Held meeting "Dealer Network Optimization Kickoff"`, entityType: "Meeting", entityId: id4.id, actor: "Erik Novotny", createdAt: d("2026-07-10") },
      { type: "MEETING_HELD", description: `Held meeting "Customer Data Unification Steering Committee"`, entityType: "Meeting", entityId: id3.id, actor: "Sofia Rossi", createdAt: d("2026-07-22") },
      { type: "MEETING_HELD", description: `Held meeting "Germany Executive Update"`, entityType: "Meeting", entityId: germany.id, actor: "Anna Hoffmann", createdAt: d("2026-07-05") },
      { type: "INITIATIVE_STATUS_CHANGED", description: `Initiative "${id2.name}" status changed to At Risk`, entityType: "Initiative", entityId: id2.id, actor: "Thomas Klein", createdAt: d("2026-08-04") },
      { type: "INITIATIVE_STATUS_CHANGED", description: `Initiative "${id4.name}" status changed to Critical`, entityType: "Initiative", entityId: id4.id, actor: "Erik Novotny", createdAt: d("2026-08-06") },
      { type: "MARKET_STATUS_CHANGED", description: `Market "France" status changed to At Risk`, entityType: "Market", entityId: france.id, actor: "Marc Dubois", createdAt: d("2026-08-07") },
      { type: "TASK_CREATED", description: `Created task "${tasks[3].title}"`, entityType: "Task", entityId: tasks[3].id, actor: "Nina Weber", createdAt: d("2026-08-08") },
      { type: "TASK_CREATED", description: `Created task "${tasks[10].title}"`, entityType: "Task", entityId: tasks[10].id, actor: "Sofia Rossi", createdAt: d("2026-08-09") },
      { type: "RISK_RAISED", description: `Raised risk "${risks[6].title}"`, entityType: "Risk", entityId: risks[6].id, actor: "Erik Novotny", createdAt: d("2026-08-10") },
      { type: "TASK_STATUS_CHANGED", description: `Task "${tasks[0].title}" moved to In Progress`, entityType: "Task", entityId: tasks[0].id, actor: "Julia Bauer", createdAt: d("2026-08-11") },
      { type: "MEETING_SCHEDULED", description: `Scheduled meeting "France Program Sync"`, entityType: "Meeting", entityId: france.id, actor: "Marc Dubois", createdAt: d("2026-08-12") },
      { type: "TASK_STATUS_CHANGED", description: `Task "${tasks[8].title}" moved to In Progress`, entityType: "Task", entityId: tasks[8].id, actor: "Tomas Kral", createdAt: d("2026-08-13") },
      { type: "MEETING_SCHEDULED", description: `Scheduled meeting "Digital Retail Platform Steering Committee"`, entityType: "Meeting", entityId: id1.id, actor: "Julia Bauer", createdAt: d("2026-08-14") },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
