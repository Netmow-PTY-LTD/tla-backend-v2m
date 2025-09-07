// Usage:
//   MONGODB_URI="mongodb+srv://USER:PASS@CLUSTER/db" npx tsx scripts/generate-options-all.ts
//
// It will count all Questions (deletedAt:null) and generate that many Options.

import mongoose, { Model, Types } from "mongoose";
import Option from "../app/module/Option/option.model";
import ServiceWiseQuestion from "../app/module/Question/models/ServiceWiseQuestion.model";
import { faker } from "@faker-js/faker";

// ⬇️ Adjust these paths to your actual model files (no extension needed if TS)
// They should export already-initialized Mongoose models.


// Minimal lean types for the fields we use.
// If you already have types, you can replace these.
type QuestionLean = {
    _id: Types.ObjectId;
    countryId: Types.ObjectId;
    serviceId: Types.ObjectId;
    deletedAt?: Date | null;
};

type OptionLean = {
    name: string;
    slug: string;
    questionId: Types.ObjectId;
    deletedAt?: Date | null;
};

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function loadNameSlugPool(OptionModel: Model<any>): Promise<Array<{ name: string; slug: string }>> {
    // Unique (name, slug) pairs sampled from existing options (not deleted)
    const rows = await OptionModel.aggregate([
        { $match: { deletedAt: null } },
        { $sample: { size: 2000 } }, // mix things up on big collections
        { $group: { _id: { name: "$name", slug: "$slug" } } },
        { $project: { _id: 0, name: "$_id.name", slug: "$_id.slug" } },
    ]) as Array<{ name: string; slug: string }>;

    if (!rows.length) {
        throw new Error("No (name, slug) pairs found in Option collection.");
    }
    return rows;
}

async function generateOptionsEqualToQuestions(
    QuestionModel: Model<any>,
    OptionModel: Model<any>
): Promise<{ created: number; attempted: number; questions: number; message?: string }> {
    const [questionsRaw, pool] = await Promise.all([
        QuestionModel.find(
            { deletedAt: null },
            { _id: 1, countryId: 1, serviceId: 1 }
        ).lean<QuestionLean[]>(),
        loadNameSlugPool(OptionModel),
    ]);

    if (!questionsRaw.length) throw new Error("No Questions found.");

    const count = questionsRaw.length;
    const maxAttempts = count * 10;

    // Pre-build a Set of existing (name|slug|questionId)
    const existingRaw = await OptionModel.find(
        { deletedAt: null },
        { name: 1, slug: 1, questionId: 1 }
    ).lean<OptionLean[]>();

    const existingKeys = new Set(existingRaw.map(
        (o) => `${o.name}|${o.slug}|${o.questionId.toString()}`
    ));

    const docs: any[] = [];
    let attempts = 0;

    while (docs.length < count && attempts < maxAttempts) {
        attempts++;

        const q = pickRandom(questionsRaw);
        const pair = pickRandom(pool);

        const key = `${pair.name}|${pair.slug}|${q._id.toString()}`;
        if (existingKeys.has(key)) continue;

        docs.push({
            name: pair.name,           // unchanged
            slug: pair.slug,           // unchanged
            countryId: q.countryId,    // from question
            serviceId: q.serviceId,    // from question
            questionId: q._id,         // valid reference
            order: 0,
            selected_options: [],
            deletedAt: null,
        });
        existingKeys.add(key);
    }

    if (!docs.length) {
        return { created: 0, attempted: attempts, questions: count, message: "No new unique combos." };
    }

    const inserted = await OptionModel.insertMany(docs, { ordered: false });
    return { created: inserted.length, attempted: attempts, questions: count };
}

async function main(): Promise<void> {
    // --- MongoDB Connection ---

    const MONGODB_URI =
        "mongodb+srv://tla-db:ucTzNJuV5jmerx2U@rh-dev.enoq8.mongodb.net/tlaDB?retryWrites=true&w=majority&appName=rh-dev";
  

    console.log("🔗 Connecting to MongoDB…");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected.");

    try {
        const result = await generateOptionsEqualToQuestions(ServiceWiseQuestion, Option);
        console.log("🎉 Done:", result);
    } catch (err: any) {
        console.error("❌ Error:", err?.message || err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

main().catch((e) => {
    console.error("❌ Fatal:", e?.message || e);
    process.exit(1);
});














//  with facker



// Usage:
//   MONGODB_URI="mongodb+srv://USER:PASS@CLUSTER/db" npx tsx scripts/generate-options-all.ts
//
// Creates ONE Option per Question (deletedAt:null), with:
//  - questionId/serviceId/countryId copied from the Question
//  - NEW name + slug generated per Question (faker-based, with safe slugification)
//  - De-dupe on (questionId, slug) to avoid collisions.






// // ---- Small helpers ----
// function slugify(input: string): string {
//   return input
//     .toLowerCase()
//     .normalize("NFKD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "")
//     .replace(/-{2,}/g, "-")
//     .slice(0, 80);
// }

// function randomNameSeed(q: QuestionLean): string {
//   // Use question text/slug if available, fallback to random words
//   const base =
//     (q.slug ?? q.question ?? "").toString().trim() ||
//     `${faker.word.adjective()} ${faker.word.noun()}`;
//   const flavor = faker.helpers.arrayElement([
//     "Choice",
//     "Selection",
//     "Variant",
//     "Option",
//     "Answer",
//     "Pick",
//   ]);
//   // Add a short hash fragment from IDs to keep names diversified across country/service/question
//   const short = `${q.countryId.toString().slice(-3)}${q.serviceId
//     .toString()
//     .slice(-3)}${q._id.toString().slice(-3)}`;
//   return `${base} ${flavor} ${short}`;
// }

// function generateNameAndSlug(q: QuestionLean): { name: string; slug: string } {
//   const name = randomNameSeed(q);
//   const slugBase = slugify(name);
//   // add a tiny random tail to reduce rare slug collisions
//   const tail = faker.string.alphanumeric(4).toLowerCase();
//   return { name, slug: `${slugBase}-${tail}` };
// }

// // ---- Core generator ----
// async function generateOptionsEqualToQuestions_(
//   QuestionModel: Model<any>,
//   OptionModel: Model<any>
// ): Promise<{ created: number; skippedExisting: number; questions: number }> {
//   const questions = await QuestionModel.find(
//     { deletedAt: null },
//     { _id: 1, countryId: 1, serviceId: 1, question: 1, slug: 1 }
//   ).lean<QuestionLean[]>();

//   if (!questions.length) throw new Error("No Questions found (deletedAt:null).");

//   // Load existing (questionId, slug) to prevent duplicates
//   const existing = await OptionModel.find(
//     { deletedAt: null },
//     { questionId: 1, slug: 1 }
//   ).lean<OptionLean[]>();

//   const existingKeys = new Set(
//     existing.map((o) => `${o.questionId.toString()}|${o.slug}`)
//   );

//   const docs: any[] = [];
//   let skippedExisting = 0;

//   for (const q of questions) {
//     // Try up to a few times to avoid rare slug collisions
//     let createdForThisQ = false;
//     for (let attempt = 0; attempt < 5 && !createdForThisQ; attempt++) {
//       const { name, slug } = generateNameAndSlug(q);
//       const key = `${q._id.toString()}|${slug}`;

//       if (existingKeys.has(key)) continue;

//       docs.push({
//         name,
//         slug,
//         countryId: q.countryId,
//         serviceId: q.serviceId,
//         questionId: q._id,
//         order: 0,
//         selected_options: [],
//         deletedAt: null,
//       });

//       existingKeys.add(key);
//       createdForThisQ = true;
//     }
//     if (!createdForThisQ) skippedExisting++;
//   }

//   let created = 0;
//   if (docs.length) {
//     const inserted = await OptionModel.insertMany(docs, { ordered: false });
//     created = inserted.length;
//   }

//   return { created, skippedExisting, questions: questions.length };
// }

// // ---- Main entry ----
// async function main_(): Promise<void> {
//   const MONGODB_URI =
//     process.env.MONGODB_URI ||
//     "mongodb://127.0.0.1:27017/tla"; // fallback if you prefer local dev

//   console.log("🔗 Connecting to MongoDB…");
//   await mongoose.connect(MONGODB_URI);
//   console.log("✅ Connected.");

//   try {
//     const result = await generateOptionsEqualToQuestions(
//       ServiceWiseQuestion,
//       Option
//     );
//     console.log("🎉 Done:", result);
//   } catch (err: any) {
//     console.error("❌ Error:", err?.message || err);
//     process.exitCode = 1;
//   } finally {
//     await mongoose.disconnect();
//   }
// }

// main().catch((e) => {
//   console.error("❌ Fatal:", e?.message || e);
//   process.exit(1);
// });
