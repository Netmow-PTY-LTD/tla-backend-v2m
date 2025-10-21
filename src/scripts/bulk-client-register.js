// import fetch from "node-fetch";
// import { faker } from "@faker-js/faker";

// const API_URL =
//   process.env.BACKEND_API_URL ||
//   "https://api.thelawapp.com.au/api/v1/auth/register/client";
// const API_TOKEN = process.env.API_TOKEN || "YOUR_BEARER_TOKEN_HERE";
// const COUNTRY_ID = "682ecd01e6b730f229c8d3d3";

// const serviceIds=[
//     "682ecf51e6b730f229c8d41a", // Family Law
//     "682ecf56e6b730f229c8d41e", // Wills, Trusts & Estate
//     "682ecf5de6b730f229c8d422", // Bankruptcy and Taxation Law
//     "682ecf9de3ebe5d62bf3c996", // Property Law
//     "682ecfa2e3ebe5d62bf3c99a", // Criminal law
//     "682ecfaee3ebe5d62bf3c9a2", // Traffic offences
//     "682ecfb4e3ebe5d62bf3c9a6", // Personal Injury
//     "682ecfbae3ebe5d62bf3c9ae", // Administrative Law
//     "682ecfc1e3ebe5d62bf3c9b2", // Civil Law
//     "6853995b6c7b886d0b5a043b", // Competition Consumer Law
//     "68539a7a6c7b886d0b5a045c", // Sports & Entertainment Law
//     "68539a9d6c7b886d0b5a0460", // Commercial Law
//     "68539b156c7b886d0b5a0468", // Environmental / Planning Law
//     "68539b4e6c7b886d0b5a046c", // Immigration/ Human Rights/ International Law
//     "68539b816c7b886d0b5a0470", // Domestic Violence
//     "68539bb26c7b886d0b5a0474", // Contract Law
//     "68539bd96c7b886d0b5a0478", // Corporate & Partnership Law
//     "68539c1d6c7b886d0b5a047c", // Intelectual Property, Information Technology & Internet Law
//     "68539c386c7b886d0b5a0480", // Professional Negligence & Responsibility Law
//     "68539cc66c7b886d0b5a04a3"  // Workers Compensation & OHS law
// ]



// // ---------- Default Questions (your current block) ----------



// const family_Service_Questions = [
//   {
//     step: 0,
//     questionId: "68369a2ccb76142684ca45f9",
//     question: "What are you looking for help with today?",
//     order: 1,
//     checkedOptionsDetails: [
//       {
//         id: "68369ac9cb76142684ca460f",
//         name: "Binding financial agreement",
//         is_checked: true,
//         idExtraData: "",
//       },
//       {
//         id: "68369adfcb76142684ca461b",
//         name: "Visitation rights",
//         is_checked: true,
//         idExtraData: "",
//       },
//       {
//         id: "68369abdcb76142684ca4609",
//         name: "Divorce assistance",
//         is_checked: true,
//         idExtraData: "",
//       },
//       {
//         id: "68369acfcb76142684ca4612",
//         name: "Domestic abuse",
//         is_checked: true,
//         idExtraData: "",
//       },
//       {
//         id: "68369adacb76142684ca4618",
//         name: "Child support",
//         is_checked: true,
//         idExtraData: "",
//       },
//       {
//         id: "68369ab0cb76142684ca4606",
//         name: "Child custody",
//         is_checked: true,
//         idExtraData: "",
//       },
//       {
//         id: "68369ac5cb76142684ca460c",
//         name: "Property disputes",
//         is_checked: true,
//         idExtraData: "",
//       },
//       {
//         id: "68369ad5cb76142684ca4615",
//         name: "Mediation",
//         is_checked: true,
//         idExtraData: "",
//       },
//       {
//         id: "68be464d3e080afd9e2eb9b4",
//         name: "Other",
//         is_checked: true,
//         idExtraData: "",
//       },
//     ],
//   },
//   {
//     step: 1,
//     questionId: "68369a73cb76142684ca45fc",
//     question: "How would you like the service to be delivered?",
//     order: 2,
//     checkedOptionsDetails: [
//       {
//         id: "68369aeacb76142684ca461e",
//         name: "Online",
//         is_checked: true,
//         idExtraData: "",
//       },
//       {
//         id: "68369af4cb76142684ca4621",
//         name: "No preference",
//         is_checked: true,
//         idExtraData: "",
//       },
//       {
//         id: "68369b04cb76142684ca4626",
//         name: "In-person",
//         is_checked: true,
//         idExtraData: "",
//       },
//       {
//         id: "683ee06e3e10c3dea61dad12",
//         name: "Other",
//         is_checked: true,
//         idExtraData: "",
//       },
//     ],
//   },
// ];



// const WillsTrustsEstate_Service_Questions = [
//   {
//     step: 0,
//     questionId: "68369b7fcb76142684ca463c",
//     question: "What type of assistance do you need?",
//     order: 1,
//     checkedOptionsDetails: [
//       { id: "68369f2788cf4f62ff3df1d3", name: "Will creation", is_checked: false, idExtraData: "" },
//       { id: "68369f2c88cf4f62ff3df1d6", name: "Trust setup", is_checked: false, idExtraData: "" },
//       { id: "6853c65a84e3eb5dab308a5c", name: "Updating an existing will", is_checked: false, idExtraData: "" },
//       { id: "68369f3588cf4f62ff3df1dc", name: "Estate planning", is_checked: false, idExtraData: "" },
//       { id: "6853c66884e3eb5dab308a5f", name: "Contesting a will", is_checked: false, idExtraData: "" },
//       { id: "68369f3a88cf4f62ff3df1df", name: "Executor services", is_checked: false, idExtraData: "" },
//       { id: "68369f3e88cf4f62ff3df1e2", name: "Power of attorney", is_checked: false, idExtraData: "" },
//       { id: "68369f3088cf4f62ff3df1d9", name: "Probate process", is_checked: false, idExtraData: "" },
//       { id: "6853c67084e3eb5dab308a62", name: "Other", is_checked: false, idExtraData: "" }
//     ],
//   },
//   {
//     step: 1,
//     questionId: "68369b8ecb76142684ca463f",
//     question: "Who is this service for?",
//     order: 2,
//     checkedOptionsDetails: [
//       { id: "683832856b8a4c2b88af9342", name: "Myself", is_checked: false, idExtraData: "" },
//       { id: "683832a60d3e2d324bae4ba5", name: "A family member", is_checked: false, idExtraData: "" },
//       { id: "683832b20d3e2d324bae4ba7", name: "A client or third-party", is_checked: false, idExtraData: "" },
//       { id: "6853c6a384e3eb5dab308a6b", name: "Not sure", is_checked: false, idExtraData: "" }
//     ],
//   },
//   {
//     step: 2,
//     questionId: "68369b98cb76142684ca4642",
//     question: "How would you like the service to be delivered?",
//     order: 3,
//     checkedOptionsDetails: [
//       { id: "683832f90d3e2d324bae4bad", name: "Online", is_checked: false, idExtraData: "" },
//       { id: "683833036b8a4c2b88af9349", name: "In-person", is_checked: false, idExtraData: "" },
//       { id: "6853c6c984e3eb5dab308a80", name: "No preference", is_checked: false, idExtraData: "" }
//     ],
//   },
// ];



// const BankruptcyAndTaxation_Law_Service_Questions = [
//   {
//     step: 0,
//     questionId: "68369dd388cf4f62ff3df18a",
//     question: "What type of issue are you facing?",
//     order: 1,
//     checkedOptionsDetails: [
//       { id: "683833ab0d3e2d324bae4bc8", name: "Personal bankruptcy", is_checked: false, idExtraData: "" },
//       { id: "6853c9aa6cc9c59ece30fa92", name: "Tax return errors or audits", is_checked: false, idExtraData: "" },
//       { id: "6853c9be6cc9c59ece30fa98", name: "Late lodgement penalties", is_checked: false, idExtraData: "" },
//       { id: "683833c40d3e2d324bae4bce", name: "Business insolvency", is_checked: false, idExtraData: "" },
//       { id: "683833cd0d3e2d324bae4bd1", name: "Debt negotiation or settlement", is_checked: false, idExtraData: "" },
//       { id: "6853c94984e3eb5dab308ac0", name: "Tax debt with ATO", is_checked: false, idExtraData: "" },
//       { id: "6853c9b36cc9c59ece30fa95", name: "Superannuation tax issues", is_checked: false, idExtraData: "" },
//       { id: "6853c93e84e3eb5dab308ab2", name: "Creditor harassment", is_checked: false, idExtraData: "" },
//       { id: "68e4e3baffb3f397c005790e", name: "Other", is_checked: false, idExtraData: "" },
//     ],
//   },
//   {
//     step: 1,
//     questionId: "68369ddb88cf4f62ff3df194",
//     question: "Are you seeking help for yourself or on behalf of someone else?",
//     order: 2,
//     checkedOptionsDetails: [
//       { id: "68383791d142ad681d91ee65", name: "Myself", is_checked: false, idExtraData: "" },
//       { id: "6838379ed142ad681d91ee6b", name: "Family member or friend", is_checked: false, idExtraData: "" },
//       { id: "683837a8d142ad681d91ee6e", name: "Client or third-party", is_checked: false, idExtraData: "" },
//       { id: "683837b4d142ad681d91ee71", name: "Not sure", is_checked: false, idExtraData: "" },
//     ],
//   },
//   {
//     step: 2,
//     questionId: "68369de788cf4f62ff3df197",
//     question: "How would you prefer the service to be delivered?",
//     order: 3,
//     checkedOptionsDetails: [
//       { id: "6838342e6b8a4c2b88af9355", name: "Online", is_checked: false, idExtraData: "" },
//       { id: "6838343a0d3e2d324bae4be5", name: "In-person", is_checked: false, idExtraData: "" },
//       { id: "683834430d3e2d324bae4be8", name: "No preference", is_checked: false, idExtraData: "" },
//     ],
//   },
// ];



// const PROPERTY_LAW_SERVICE_QUESTIONS = [
//   {
//     step: 0,
//     questionId: "6853b15de8e7ee20d9eed8ac",
//     question: "What type of property matter do you need help with?",
//     order: 1,
//     checkedOptionsDetails: [
//       { id: "6853cb2984e3eb5dab308afa", name: "Building or construction disputes", is_checked: false, idExtraData: "" },
//       { id: "6853cad684e3eb5dab308ae5", name: "Buying or selling property", is_checked: false, idExtraData: "" },
//       { id: "6853cae084e3eb5dab308ae8", name: "Property disputes", is_checked: false, idExtraData: "" },
//       { id: "6853cb0e84e3eb5dab308af4", name: "Strata and body corporate issues", is_checked: false, idExtraData: "" },
//       { id: "6853cb0084e3eb5dab308af1", name: "Boundary disputes", is_checked: false, idExtraData: "" },
//       { id: "6853caea84e3eb5dab308aeb", name: "Lease or tenancy issues", is_checked: false, idExtraData: "" },
//       { id: "6853caf484e3eb5dab308aee", name: "Title transfers", is_checked: false, idExtraData: "" },
//       { id: "6853cb1c84e3eb5dab308af7", name: "Easements and covenants", is_checked: false, idExtraData: "" },
//       { id: "6853cb3284e3eb5dab308afd", name: "Other", is_checked: false, idExtraData: "" },
//     ],
//   },
//   {
//     step: 1,
//     questionId: "6853b16be8e7ee20d9eed8af",
//     question: "What type of property is involved?",
//     order: 2,
//     checkedOptionsDetails: [
//       { id: "6853cc096cc9c59ece30fac0", name: "Rural", is_checked: false, idExtraData: "" },
//       { id: "6853cbbd84e3eb5dab308b00", name: "Residential", is_checked: false, idExtraData: "" },
//       { id: "6853cc246cc9c59ece30fac3", name: "Agricultural", is_checked: false, idExtraData: "" },
//       { id: "6853cbce84e3eb5dab308b05", name: "Commercial", is_checked: false, idExtraData: "" },
//       { id: "6853cbd86cc9c59ece30fabd", name: "Industrial", is_checked: false, idExtraData: "" },
//       { id: "6853cc306cc9c59ece30fac6", name: "Not sure", is_checked: false, idExtraData: "" },
//     ],
//   },
//   {
//     step: 2,
//     questionId: "6853b17ae8e7ee20d9eed8b2",
//     question: "How would you like the service to be delivered?",
//     order: 3,
//     checkedOptionsDetails: [
//       { id: "6853cc456cc9c59ece30fac9", name: "Online", is_checked: false, idExtraData: "" },
//       { id: "6853cc4e6cc9c59ece30facc", name: "In-person", is_checked: false, idExtraData: "" },
//       { id: "6853cc566cc9c59ece30facf", name: "No preference", is_checked: false, idExtraData: "" },
//     ],
//   },
// ];


// const CRIMINAL_LAW_QUESTIONS = [
//   {
//     step: 0,
//     questionId: "6853b1ede8e7ee20d9eed8c5",
//     question: "What type of criminal matter do you need help with?",
//     order: 1,
//     checkedOptionsDetails: [
//       { id: "6853ccaa6cc9c59ece30fae2", name: "Court appearance", is_checked: false, idExtraData: "" },
//       { id: "6853ccb36cc9c59ece30fae5", name: "Police interview or questioning", is_checked: false, idExtraData: "" },
//       { id: "6853ccc46cc9c59ece30faeb", name: "Drug-related charges", is_checked: false, idExtraData: "" },
//       { id: "6853cccd6cc9c59ece30faee", name: "Theft or fraud", is_checked: false, idExtraData: "" },
//       { id: "6853cca06cc9c59ece30fadf", name: "Bail application", is_checked: false, idExtraData: "" },
//       { id: "6853ccbc6cc9c59ece30fae8", name: "Assault or violence charges", is_checked: false, idExtraData: "" },
//       { id: "6853ccda6cc9c59ece30faf1", name: "Traffic or DUI offences", is_checked: false, idExtraData: "" },
//       { id: "6853cce56cc9c59ece30faf4", name: "Appeals or convictions", is_checked: false, idExtraData: "" },
//       { id: "68e4e3ddffb3f397c0057917", name: "Other", is_checked: false, idExtraData: "" },
//     ],
//   },
//   {
//     step: 1,
//     questionId: "6853b20c8874429e1e67494b",
//     question: "What stage is your matter currently at?",
//     order: 2,
//     checkedOptionsDetails: [
//       { id: "6853ccfe6cc9c59ece30fafa", name: "Just received a charge", is_checked: false, idExtraData: "" },
//       { id: "6853cd086cc9c59ece30fafd", name: "Already attended court", is_checked: false, idExtraData: "" },
//       { id: "6853cd116cc9c59ece30fb00", name: "Investigation underway", is_checked: false, idExtraData: "" },
//       { id: "6853cd1a6cc9c59ece30fb03", name: "Awaiting appeal", is_checked: false, idExtraData: "" },
//       { id: "6853cd236cc9c59ece30fb06", name: "Not sure", is_checked: false, idExtraData: "" },
//     ],
//   },
//   {
//     step: 2,
//     questionId: "6853b2268874429e1e674953",
//     question: "How would you like the service to be delivered?",
//     order: 3,
//     checkedOptionsDetails: [
//       { id: "6853cd2d6cc9c59ece30fb09", name: "Online", is_checked: false, idExtraData: "" },
//       { id: "6853cd386cc9c59ece30fb0c", name: "In-person", is_checked: false, idExtraData: "" },
//       { id: "6853cd436cc9c59ece30fb0f", name: "No preference", is_checked: false, idExtraData: "" },
//     ],
//   },
//   {
//     step: 3,
//     questionId: "6853b23d8874429e1e674956",
//     question: "How soon do you need help?",
//     order: 4,
//     checkedOptionsDetails: [
//       { id: "6853cd586cc9c59ece30fb12", name: "Urgent", is_checked: false, idExtraData: "" },
//       { id: "6853cd626cc9c59ece30fb15", name: "Within a few days", is_checked: false, idExtraData: "" },
//       { id: "6853cd6a6cc9c59ece30fb18", name: "This month", is_checked: false, idExtraData: "" },
//       { id: "6853cd736cc9c59ece30fb1b", name: "Just seeking advice", is_checked: false, idExtraData: "" },
//     ],
//   },
// ];








// // ---------- Helpers ----------
// function uniqueEmail(index) {
//   const stamp = Date.now().toString(36);
//   return demo.client.${index}.${stamp}@gmail.com;
// }

// function auMobile() {
//   const eight = faker.number.int({ min: 10_000_000, max: 99_999_999 }).toString();
//   return 614${eight};
// }

// // Minimal slice of your NT address data (you can keep the full list)
// const NT_ADDRESSES = [
//   { zipcode: "Darwin NT 0800, Australia", postalCode: "0800", latitude: -12.46145, longitude: 130.84275 },
//   { zipcode: "Darwin NT 0801, Australia", postalCode: "0801", latitude: -12.4611,  longitude: 130.8418  },
//   { zipcode: "Wagait Beach NT 0803, Australia", postalCode: "0803", latitude: -12.4348,  longitude: 130.7443  },
//   { zipcode: "Parap NT 0804, Australia", postalCode: "0804", latitude: -12.4305,  longitude: 130.8414  },
//   { zipcode: "Moil NT 0810, Australia", postalCode: "0810", latitude: -12.3745812, longitude: 130.8751688 },
//   { zipcode: "Casuarina NT 0811, Australia", postalCode: "0811", latitude: -12.374,   longitude: 130.8822  },
//   { zipcode: "Anula NT 0812, Australia", postalCode: "0812", latitude: -12.3819636, longitude: 130.9006  },
//   { zipcode: "Karama NT 0813, Australia", postalCode: "0813", latitude: -12.4022,  longitude: 130.916   },
//   { zipcode: "Nightcliff NT 0814, Australia", postalCode: "0814", latitude: -12.383,   longitude: 130.8517  },
//   { zipcode: "Charles Darwin University NT 0815, Australia", postalCode: "0815", latitude: -12.3779,  longitude: 130.883   },
// ];

// function pickAddress(index, addresses = NT_ADDRESSES) {
//   if (!addresses?.length) throw new Error("No addresses provided");
//   return addresses[index % addresses.length];
// }

// function generateLeadPayload(index, questions = DEFAULT_QUESTIONS, addresses = NT_ADDRESSES) {
//   const fullName = faker.person.fullName();
//   const email = uniqueEmail(index);
//   const phone = auMobile();

//   const addr = pickAddress(index, addresses);
//   const fullAddress = addr.zipcode;

//   return {
//     countryId: COUNTRY_ID,
//     serviceId: SERVICE_ID,

//     email,
//     name: fullName,
//     phone,
//     zipCode: fullAddress,

//     addressInfo: {
//       countryId: COUNTRY_ID,
//       countryCode: "au",
//       latitude: String(addr.latitude),
//       longitude: String(addr.longitude),
//       postalCode: addr.postalCode,
//       zipcode: fullAddress,
//     },

//     leadDetails: {
//       leadPriority: "within_a_week",
//       additionalDetails: `this test case ${index}`,
//       budgetAmount: String(faker.number.int({ min: 100, max: 1000 })),
//       email,
//       name: fullName,
//       phone,
//     },

//     questions, // stays injectable — defaults to DEFAULT_QUESTIONS
//   };
// }

// async function createLeads(start, end, questions = DEFAULT_QUESTIONS) {
//   for (let i = start; i <= end; i++) {
//     const payload = generateLeadPayload(i, questions);

//     const res = await fetch(API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: Bearer ${API_TOKEN},
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!res.ok) {
//       const txt = await res.text();
//       console.error(
//         ❌ Failed to create lead ${i} (email: ${payload.email}): ${txt}
//       );
//     } else {
//       console.log(✅ Lead ${i} created successfully! (${payload.email}));
//     }
//   }
// }

// // ---------- Run ----------
// createLeads(50, 5000);




import fetch from "node-fetch";
import { faker } from "@faker-js/faker";

/**
 * Config
 */
const API_URL =
  process.env.BACKEND_API_URL ||
  "https://api.thelawapp.com.au/api/v1/auth/register/client";
const API_TOKEN = process.env.API_TOKEN || "YOUR_BEARER_TOKEN_HERE";
const COUNTRY_ID = "682ecd01e6b730f229c8d3d3"; // AU

// Service IDs provided
const SERVICE_IDS = [
  "682ecf51e6b730f229c8d41a", // Family Law
  "682ecf56e6b730f229c8d41e", // Wills, Trusts & Estate
  "682ecf5de6b730f229c8d422", // Bankruptcy and Taxation Law
  "682ecf9de3ebe5d62bf3c996", // Property Law
  "682ecfa2e3ebe5d62bf3c99a", // Criminal law
  "682ecfaee3ebe5d62bf3c9a2", // Traffic offences
  "682ecfb4e3ebe5d62bf3c9a6", // Personal Injury
  "682ecfbae3ebe5d62bf3c9ae", // Administrative Law
  "682ecfc1e3ebe5d62bf3c9b2", // Civil Law
  "6853995b6c7b886d0b5a043b", // Competition Consumer Law
  "68539a7a6c7b886d0b5a045c", // Sports & Entertainment Law
  "68539a9d6c7b886d0b5a0460", // Commercial Law
  "68539b156c7b886d0b5a0468", // Environmental / Planning Law
  "68539b4e6c7b886d0b5a046c", // Immigration/ Human Rights/ International Law
  "68539b816c7b886d0b5a0470", // Domestic Violence
  "68539bb26c7b886d0b5a0474", // Contract Law
  "68539bd96c7b886d0b5a0478", // Corporate & Partnership Law
  "68539c1d6c7b886d0b5a047c", // IP / IT / Internet Law
  "68539c386c7b886d0b5a0480", // Professional Negligence
  "68539cc66c7b886d0b5a04a3", // Workers Compensation & OHS
];

/**
 * Question banks (exactly as you provided)
 */

// Family Law
const family_Service_Questions = [
  {
    step: 0,
    questionId: "68369a2ccb76142684ca45f9",
    question: "What are you looking for help with today?",
    order: 1,
    checkedOptionsDetails: [
      { id: "68369ac9cb76142684ca460f", name: "Binding financial agreement", is_checked: true, idExtraData: "" },
      { id: "68369adfcb76142684ca461b", name: "Visitation rights", is_checked: true, idExtraData: "" },
      { id: "68369abdcb76142684ca4609", name: "Divorce assistance", is_checked: true, idExtraData: "" },
      { id: "68369acfcb76142684ca4612", name: "Domestic abuse", is_checked: true, idExtraData: "" },
      { id: "68369adacb76142684ca4618", name: "Child support", is_checked: true, idExtraData: "" },
      { id: "68369ab0cb76142684ca4606", name: "Child custody", is_checked: true, idExtraData: "" },
      { id: "68369ac5cb76142684ca460c", name: "Property disputes", is_checked: true, idExtraData: "" },
      { id: "68369ad5cb76142684ca4615", name: "Mediation", is_checked: true, idExtraData: "" },
      { id: "68be464d3e080afd9e2eb9b4", name: "Other", is_checked: true, idExtraData: "" },
    ],
  },
  {
    step: 1,
    questionId: "68369a73cb76142684ca45fc",
    question: "How would you like the service to be delivered?",
    order: 2,
    checkedOptionsDetails: [
      { id: "68369aeacb76142684ca461e", name: "Online", is_checked: true, idExtraData: "" },
      { id: "68369af4cb76142684ca4621", name: "No preference", is_checked: true, idExtraData: "" },
      { id: "68369b04cb76142684ca4626", name: "In-person", is_checked: true, idExtraData: "" },
      { id: "683ee06e3e10c3dea61dad12", name: "Other", is_checked: true, idExtraData: "" },
    ],
  },
];

// Wills / Trusts / Estate
const WillsTrustsEstate_Service_Questions = [
  {
    step: 0,
    questionId: "68369b7fcb76142684ca463c",
    question: "What type of assistance do you need?",
    order: 1,
    checkedOptionsDetails: [
      { id: "68369f2788cf4f62ff3df1d3", name: "Will creation", is_checked: false, idExtraData: "" },
      { id: "68369f2c88cf4f62ff3df1d6", name: "Trust setup", is_checked: false, idExtraData: "" },
      { id: "6853c65a84e3eb5dab308a5c", name: "Updating an existing will", is_checked: false, idExtraData: "" },
      { id: "68369f3588cf4f62ff3df1dc", name: "Estate planning", is_checked: false, idExtraData: "" },
      { id: "6853c66884e3eb5dab308a5f", name: "Contesting a will", is_checked: false, idExtraData: "" },
      { id: "68369f3a88cf4f62ff3df1df", name: "Executor services", is_checked: false, idExtraData: "" },
      { id: "68369f3e88cf4f62ff3df1e2", name: "Power of attorney", is_checked: false, idExtraData: "" },
      { id: "68369f3088cf4f62ff3df1d9", name: "Probate process", is_checked: false, idExtraData: "" },
      { id: "6853c67084e3eb5dab308a62", name: "Other", is_checked: false, idExtraData: "" },
    ],
  },
  {
    step: 1,
    questionId: "68369b8ecb76142684ca463f",
    question: "Who is this service for?",
    order: 2,
    checkedOptionsDetails: [
      { id: "683832856b8a4c2b88af9342", name: "Myself", is_checked: false, idExtraData: "" },
      { id: "683832a60d3e2d324bae4ba5", name: "A family member", is_checked: false, idExtraData: "" },
      { id: "683832b20d3e2d324bae4ba7", name: "A client or third-party", is_checked: false, idExtraData: "" },
      { id: "6853c6a384e3eb5dab308a6b", name: "Not sure", is_checked: false, idExtraData: "" },
    ],
  },
  {
    step: 2,
    questionId: "68369b98cb76142684ca4642",
    question: "How would you like the service to be delivered?",
    order: 3,
    checkedOptionsDetails: [
      { id: "683832f90d3e2d324bae4bad", name: "Online", is_checked: false, idExtraData: "" },
      { id: "683833036b8a4c2b88af9349", name: "In-person", is_checked: false, idExtraData: "" },
      { id: "6853c6c984e3eb5dab308a80", name: "No preference", is_checked: false, idExtraData: "" },
    ],
  },
];

// Bankruptcy & Taxation
const BankruptcyAndTaxation_Law_Service_Questions = [
  {
    step: 0,
    questionId: "68369dd388cf4f62ff3df18a",
    question: "What type of issue are you facing?",
    order: 1,
    checkedOptionsDetails: [
      { id: "683833ab0d3e2d324bae4bc8", name: "Personal bankruptcy", is_checked: false, idExtraData: "" },
      { id: "6853c9aa6cc9c59ece30fa92", name: "Tax return errors or audits", is_checked: false, idExtraData: "" },
      { id: "6853c9be6cc9c59ece30fa98", name: "Late lodgement penalties", is_checked: false, idExtraData: "" },
      { id: "683833c40d3e2d324bae4bce", name: "Business insolvency", is_checked: false, idExtraData: "" },
      { id: "683833cd0d3e2d324bae4bd1", name: "Debt negotiation or settlement", is_checked: false, idExtraData: "" },
      { id: "6853c94984e3eb5dab308ac0", name: "Tax debt with ATO", is_checked: false, idExtraData: "" },
      { id: "6853c9b36cc9c59ece30fa95", name: "Superannuation tax issues", is_checked: false, idExtraData: "" },
      { id: "6853c93e84e3eb5dab308ab2", name: "Creditor harassment", is_checked: false, idExtraData: "" },
      { id: "68e4e3baffb3f397c005790e", name: "Other", is_checked: false, idExtraData: "" },
    ],
  },
  {
    step: 1,
    questionId: "68369ddb88cf4f62ff3df194",
    question: "Are you seeking help for yourself or on behalf of someone else?",
    order: 2,
    checkedOptionsDetails: [
      { id: "68383791d142ad681d91ee65", name: "Myself", is_checked: false, idExtraData: "" },
      { id: "6838379ed142ad681d91ee6b", name: "Family member or friend", is_checked: false, idExtraData: "" },
      { id: "683837a8d142ad681d91ee6e", name: "Client or third-party", is_checked: false, idExtraData: "" },
      { id: "683837b4d142ad681d91ee71", name: "Not sure", is_checked: false, idExtraData: "" },
    ],
  },
  {
    step: 2,
    questionId: "68369de788cf4f62ff3df197",
    question: "How would you prefer the service to be delivered?",
    order: 3,
    checkedOptionsDetails: [
      { id: "6838342e6b8a4c2b88af9355", name: "Online", is_checked: false, idExtraData: "" },
      { id: "6838343a0d3e2d324bae4be5", name: "In-person", is_checked: false, idExtraData: "" },
      { id: "683834430d3e2d324bae4be8", name: "No preference", is_checked: false, idExtraData: "" },
    ],
  },
];

// Property Law
const PROPERTY_LAW_SERVICE_QUESTIONS = [
  {
    step: 0,
    questionId: "6853b15de8e7ee20d9eed8ac",
    question: "What type of property matter do you need help with?",
    order: 1,
    checkedOptionsDetails: [
      { id: "6853cb2984e3eb5dab308afa", name: "Building or construction disputes", is_checked: false, idExtraData: "" },
      { id: "6853cad684e3eb5dab308ae5", name: "Buying or selling property", is_checked: false, idExtraData: "" },
      { id: "6853cae084e3eb5dab308ae8", name: "Property disputes", is_checked: false, idExtraData: "" },
      { id: "6853cb0e84e3eb5dab308af4", name: "Strata and body corporate issues", is_checked: false, idExtraData: "" },
      { id: "6853cb0084e3eb5dab308af1", name: "Boundary disputes", is_checked: false, idExtraData: "" },
      { id: "6853caea84e3eb5dab308aeb", name: "Lease or tenancy issues", is_checked: false, idExtraData: "" },
      { id: "6853caf484e3eb5dab308aee", name: "Title transfers", is_checked: false, idExtraData: "" },
      { id: "6853cb1c84e3eb5dab308af7", name: "Easements and covenants", is_checked: false, idExtraData: "" },
      { id: "6853cb3284e3eb5dab308afd", name: "Other", is_checked: false, idExtraData: "" },
    ],
  },
  {
    step: 1,
    questionId: "6853b16be8e7ee20d9eed8af",
    question: "What type of property is involved?",
    order: 2,
    checkedOptionsDetails: [
      { id: "6853cc096cc9c59ece30fac0", name: "Rural", is_checked: false, idExtraData: "" },
      { id: "6853cbbd84e3eb5dab308b00", name: "Residential", is_checked: false, idExtraData: "" },
      { id: "6853cc246cc9c59ece30fac3", name: "Agricultural", is_checked: false, idExtraData: "" },
      { id: "6853cbce84e3eb5dab308b05", name: "Commercial", is_checked: false, idExtraData: "" },
      { id: "6853cbd86cc9c59ece30fabd", name: "Industrial", is_checked: false, idExtraData: "" },
      { id: "6853cc306cc9c59ece30fac6", name: "Not sure", is_checked: false, idExtraData: "" },
    ],
  },
  {
    step: 2,
    questionId: "6853b17ae8e7ee20d9eed8b2",
    question: "How would you like the service to be delivered?",
    order: 3,
    checkedOptionsDetails: [
      { id: "6853cc456cc9c59ece30fac9", name: "Online", is_checked: false, idExtraData: "" },
      { id: "6853cc4e6cc9c59ece30facc", name: "In-person", is_checked: false, idExtraData: "" },
      { id: "6853cc566cc9c59ece30facf", name: "No preference", is_checked: false, idExtraData: "" },
    ],
  },
];

// Criminal Law
const CRIMINAL_LAW_QUESTIONS = [
  {
    step: 0,
    questionId: "6853b1ede8e7ee20d9eed8c5",
    question: "What type of criminal matter do you need help with?",
    order: 1,
    checkedOptionsDetails: [
      { id: "6853ccaa6cc9c59ece30fae2", name: "Court appearance", is_checked: false, idExtraData: "" },
      { id: "6853ccb36cc9c59ece30fae5", name: "Police interview or questioning", is_checked: false, idExtraData: "" },
      { id: "6853ccc46cc9c59ece30faeb", name: "Drug-related charges", is_checked: false, idExtraData: "" },
      { id: "6853cccd6cc9c59ece30faee", name: "Theft or fraud", is_checked: false, idExtraData: "" },
      { id: "6853cca06cc9c59ece30fadf", name: "Bail application", is_checked: false, idExtraData: "" },
      { id: "6853ccbc6cc9c59ece30fae8", name: "Assault or violence charges", is_checked: false, idExtraData: "" },
      { id: "6853ccda6cc9c59ece30faf1", name: "Traffic or DUI offences", is_checked: false, idExtraData: "" },
      { id: "6853cce56cc9c59ece30faf4", name: "Appeals or convictions", is_checked: false, idExtraData: "" },
      { id: "68e4e3ddffb3f397c0057917", name: "Other", is_checked: false, idExtraData: "" },
    ],
  },
  {
    step: 1,
    questionId: "6853b20c8874429e1e67494b",
    question: "What stage is your matter currently at?",
    order: 2,
    checkedOptionsDetails: [
      { id: "6853ccfe6cc9c59ece30fafa", name: "Just received a charge", is_checked: false, idExtraData: "" },
      { id: "6853cd086cc9c59ece30fafd", name: "Already attended court", is_checked: false, idExtraData: "" },
      { id: "6853cd116cc9c59ece30fb00", name: "Investigation underway", is_checked: false, idExtraData: "" },
      { id: "6853cd1a6cc9c59ece30fb03", name: "Awaiting appeal", is_checked: false, idExtraData: "" },
      { id: "6853cd236cc9c59ece30fb06", name: "Not sure", is_checked: false, idExtraData: "" },
    ],
  },
  {
    step: 2,
    questionId: "6853b2268874429e1e674953",
    question: "How would you like the service to be delivered?",
    order: 3,
    checkedOptionsDetails: [
      { id: "6853cd2d6cc9c59ece30fb09", name: "Online", is_checked: false, idExtraData: "" },
      { id: "6853cd386cc9c59ece30fb0c", name: "In-person", is_checked: false, idExtraData: "" },
      { id: "6853cd436cc9c59ece30fb0f", name: "No preference", is_checked: false, idExtraData: "" },
    ],
  },
  {
    step: 3,
    questionId: "6853b23d8874429e1e674956",
    question: "How soon do you need help?",
    order: 4,
    checkedOptionsDetails: [
      { id: "6853cd586cc9c59ece30fb12", name: "Urgent", is_checked: false, idExtraData: "" },
      { id: "6853cd626cc9c59ece30fb15", name: "Within a few days", is_checked: false, idExtraData: "" },
      { id: "6853cd6a6cc9c59ece30fb18", name: "This month", is_checked: false, idExtraData: "" },
      { id: "6853cd736cc9c59ece30fb1b", name: "Just seeking advice", is_checked: false, idExtraData: "" },
    ],
  },
];

/**
 * Helper: map a serviceId to its question bank
 */
const QUESTIONS_BY_SERVICE = {
  "682ecf51e6b730f229c8d41a": family_Service_Questions,
  "682ecf56e6b730f229c8d41e": WillsTrustsEstate_Service_Questions,
  "682ecf5de6b730f229c8d422": BankruptcyAndTaxation_Law_Service_Questions,
  "682ecf9de3ebe5d62bf3c996": PROPERTY_LAW_SERVICE_QUESTIONS,
  "682ecfa2e3ebe5d62bf3c99a": CRIMINAL_LAW_QUESTIONS,
  // Others -> no questions (payload will omit `questions`)
};

/**
 * NT address pool (round-robin)
 */
const NT_ADDRESSES = [
  { zipcode: "Darwin NT 0800, Australia", postalCode: "0800", latitude: -12.46145, longitude: 130.84275 },
  { zipcode: "Darwin NT 0801, Australia", postalCode: "0801", latitude: -12.4611, longitude: 130.8418 },
  { zipcode: "Wagait Beach NT 0803, Australia", postalCode: "0803", latitude: -12.4348, longitude: 130.7443 },
  { zipcode: "Parap NT 0804, Australia", postalCode: "0804", latitude: -12.4305, longitude: 130.8414 },
  { zipcode: "Moil NT 0810, Australia", postalCode: "0810", latitude: -12.3745812, longitude: 130.8751688 },
  { zipcode: "Casuarina NT 0811, Australia", postalCode: "0811", latitude: -12.374, longitude: 130.8822 },
  { zipcode: "Anula NT 0812, Australia", postalCode: "0812", latitude: -12.3819636, longitude: 130.9006 },
  { zipcode: "Karama NT 0813, Australia", postalCode: "0813", latitude: -12.4022, longitude: 130.916 },
  { zipcode: "Nightcliff NT 0814, Australia", postalCode: "0814", latitude: -12.383, longitude: 130.8517 },
  { zipcode: "Charles Darwin University NT 0815, Australia", postalCode: "0815", latitude: -12.3779, longitude: 130.883 },

  { zipcode: "Bagot NT 0820, Australia", postalCode: "0820", latitude: -12.43091, longitude: 130.855835 },
  { zipcode: "Winnellie NT 0821, Australia", postalCode: "0821", latitude: -12.4292, longitude: 130.8859 },
  { zipcode: "Daly NT 0822, Australia", postalCode: "0822", latitude: -12.7282, longitude: 131.664982 },
  { zipcode: "Berrimah NT 0828, Australia", postalCode: "0828", latitude: -12.43085, longitude: 130.9359 },
  { zipcode: "Holtze NT 0829, Australia", postalCode: "0829", latitude: -12.45305, longitude: 130.9827 },
  { zipcode: "Gray NT 0830, Australia", postalCode: "0830", latitude: -12.4905091, longitude: 130.9788273 },
  { zipcode: "Palmerston NT 0831, Australia", postalCode: "0831", latitude: -12.486, longitude: 130.9833 },
  { zipcode: "Gunn NT 0832, Australia", postalCode: "0832", latitude: -12.5011625, longitude: 130.9961 },
  { zipcode: "Virginia NT 0834, Australia", postalCode: "0834", latitude: -12.519, longitude: 131.0284 },
  { zipcode: "Virginia NT 0835, Australia", postalCode: "0835", latitude: -12.5126333, longitude: 131.0381333 },

  { zipcode: "Herbert NT 0836, Australia", postalCode: "0836", latitude: -12.5448, longitude: 131.1202333 },
  { zipcode: "Manton NT 0837, Australia", postalCode: "0837", latitude: -12.7221, longitude: 131.13495 },
  { zipcode: "Berry Springs NT 0838, Australia", postalCode: "0838", latitude: -12.7004, longitude: 131.0145 },
  { zipcode: "Coolalinga NT 0839, Australia", postalCode: "0839", latitude: -12.5231, longitude: 131.0415 },
  { zipcode: "Dundee Beach NT 0840, Australia", postalCode: "0840", latitude: -12.7846667, longitude: 130.4736 },
  { zipcode: "Darwin River NT 0841, Australia", postalCode: "0841", latitude: -12.8193, longitude: 130.9697 },
  { zipcode: "Batchelor NT 0845, Australia", postalCode: "0845", latitude: -13.0505, longitude: 131.0307 },
  { zipcode: "Adelaide River NT 0846, Australia", postalCode: "0846", latitude: -13.2379, longitude: 131.1056 },
  { zipcode: "Pine Creek NT 0847, Australia", postalCode: "0847", latitude: -13.8208, longitude: 131.8329 },
  { zipcode: "Cossack NT 0850, Australia", postalCode: "0850", latitude: -14.4571833, longitude: 132.27405 },

  { zipcode: "Katherine NT 0851, Australia", postalCode: "0851", latitude: -14.4652, longitude: 132.2635 },
  { zipcode: "Venn NT 0852, Australia", postalCode: "0852", latitude: -15.6761772, longitude: 132.6863825 },
  { zipcode: "Tindal NT 0853, Australia", postalCode: "0853", latitude: -14.5312, longitude: 132.3793 },
  { zipcode: "Borroloola NT 0854, Australia", postalCode: "0854", latitude: -15.4478, longitude: 132.6109 },
  { zipcode: "Tennant Creek NT 0860, Australia", postalCode: "0860", latitude: -18.2216, longitude: 134.2542 },
  { zipcode: "Brunchilly NT 0861, Australia", postalCode: "0861", latitude: -18.2216, longitude: 134.2542 },
  { zipcode: "Pamayu NT 0862, Australia", postalCode: "0862", latitude: -18.2215824, longitude: 134.2541824 },
  { zipcode: "Gillen NT 0870, Australia", postalCode: "0870", latitude: -22.2676, longitude: 133.1758 },
  { zipcode: "Alice Springs NT 0871, Australia", postalCode: "0871", latitude: -22.2676, longitude: 133.1758 },
  { zipcode: "Ghan NT 0872, Australia", postalCode: "0872", latitude: -22.2019055, longitude: 133.1429927 },

  { zipcode: "Ross NT 0873, Australia", postalCode: "0873", latitude: -22.2676, longitude: 133.1758 },
  { zipcode: "Irlpme NT 0874, Australia", postalCode: "0874", latitude: -23.6469, longitude: 133.8648 },
  { zipcode: "Flynn NT 0875, Australia", postalCode: "0875", latitude: -22.2676, longitude: 133.1758 },
  { zipcode: "Gove NT 0880, Australia", postalCode: "0880", latitude: -12.26754, longitude: 136.59252 },
  { zipcode: "Nhulunbuy NT 0881, Australia", postalCode: "0881", latitude: -12.1816, longitude: 136.7784 },
  { zipcode: "Alyangula NT 0885, Australia", postalCode: "0885", latitude: -13.8541, longitude: 136.4213 },
  { zipcode: "Jabiru NT 0886, Australia", postalCode: "0886", latitude: -12.6705, longitude: 132.836 },
  { zipcode: "Winnellie NT 0906, Australia", postalCode: "0906", latitude: -12.4292, longitude: 130.8859 },
  { zipcode: "Winnellie NT 0907, Australia", postalCode: "0907", latitude: -12.4292, longitude: 130.8859 },
  { zipcode: "University NT 0909, Australia", postalCode: "0909", latitude: -12.4292, longitude: 130.8859 },
];


function pickAddress(index, addresses = NT_ADDRESSES) {
  if (!addresses?.length) throw new Error("No addresses provided");
  return addresses[index % addresses.length];
}

/**
 * Misc helpers
 */
function uniqueEmail(index) {
  const stamp = Date.now().toString(36);
  return `demo.client.${index}.${stamp}@gmail.com`;
}

function auMobile() {
  const eight = faker.number.int({ min: 10_000_000, max: 99_999_999 }).toString();
  return `614${eight}`;
}

/**
 * Payload generator (service-aware + questions-aware)
 */
function generateLeadPayload(index, serviceId, questions = [], addresses = NT_ADDRESSES) {
  const fullName = faker.person.fullName();
  const email = uniqueEmail(index);
  const phone = auMobile();

  const addr = pickAddress(index, addresses);
  const fullAddress = addr.zipcode;

  const base = {
    countryId: COUNTRY_ID,
    serviceId: serviceId,

    email,
    name: fullName,
    phone,
    zipCode: fullAddress,

    addressInfo: {
      countryId: COUNTRY_ID,
      countryCode: "au",
      latitude: String(addr.latitude),
      longitude: String(addr.longitude),
      postalCode: addr.postalCode,
      zipcode: fullAddress,
    },

    leadDetails: {
      leadPriority: "within_a_week",
      additionalDetails: `this test case ${index}`,
      budgetAmount: String(faker.number.int({ min: 100, max: 1000 })),
      email,
      name: fullName,
      phone,
    },
  };

  // Only include `questions` when we have a bank for this service
  return questions?.length ? { ...base, questions } : base;
}

/**
 * POST wrapper
 */
async function postLead(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
}

/**
 * Create leads for a single service
 */
async function createLeadsForService(start, end, serviceId, questions) {
  for (let i = start; i <= end; i++) {
    const payload = generateLeadPayload(i, serviceId, questions);
    try {
      await postLead(payload);
      console.log(`✅ Lead ${i} [service ${serviceId}] created: ${payload.email}`);
    } catch (err) {
      console.error(`❌ Failed lead ${i} [service ${serviceId}] (${payload.email}): ${err.message}`);
    }
  }
}

/**
 * Orchestrator: loops all services, using the right questions per service
 */
async function createLeadsForAllServices(startIndex, endIndexPerService) {
  for (const serviceId of SERVICE_IDS) {
    const qs = QUESTIONS_BY_SERVICE[serviceId] || [];
    console.log(`\n— Creating leads for service ${serviceId} (${qs.length ? "with" : "without"} questions) —`);
    await createLeadsForService(startIndex, endIndexPerService, serviceId, qs);
  }
}

/**
 * Run
 * Adjust ranges below. Example makes 3 leads per service (indices 1..3).
 * For huge loads, consider batching / concurrency caps.
 */
const START_INDEX = 1;
const END_INDEX = 3;
createLeadsForAllServices(START_INDEX, END_INDEX).catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});











