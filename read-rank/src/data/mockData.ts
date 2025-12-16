import type { Quote, Candidate } from '../store/useReadRankStore';

export const mockIssueData = {
  title: "Cannabis Legalization",
  question: "Do you support Indiana legalizing marijuana use, either medicinal, recreational, or both?",
  topicId: "cannabis-legalization"
};

// Each candidate has ONE quote per issue
export const mockQuotes: Quote[] = [
  {
    id: "rainwater-cannabis",
    text: "We don't need to expand government. We don't need a new commission. We don't need new regulations. We can make cannabis in all forms — medicinal and recreational — legal right now. If legislators are not prepared, that is their fault, and we should probably replace them. We should make this legal now, and, as governor, I would make sure that all nonviolent criminal cannabis-related offenses are expunged.",
    candidateId: "donald-rainwater",
    issue: "cannabis-legalization"
  },
  {
    id: "mccormick-cannabis",
    text: "I'm aware 80% of Hoosiers support legalization. My cannabis plan calls for a conversation on medical use before a conversation on adult use. On adult use, Indiana is losing out on $177 million in tax revenue and hundreds of thousands of jobs because surrounding states have legalized marijuana. Indiana needs a commission on cannabis use.",
    candidateId: "jennifer-mccormick", 
    issue: "cannabis-legalization"
  },
  {
    id: "braun-cannabis",
    text: "Marijuana use medicinally and recreationally is cascading across the county, and Indiana needs to address it seriously. I'd have to think about whether to allow adult use. On medicinal use, we're probably ready for it. On both counts, I'm going to listen to law enforcement because they will have to enforce it and put up with any issues.",
    candidateId: "mike-braun",
    issue: "cannabis-legalization"
  },
  {
    id: "bauer-cannabis",
    text: "Now that the Drug Enforcement Administration plans to reclassify marijuana... I believe it is time for Indiana to follow suit with decriminalization and legalization for adult use.",
    candidateId: "maureen-bauer",
    issue: "cannabis-legalization"
  }
];

export const mockCandidates: Candidate[] = [
  {
    id: "donald-rainwater",
    name: "Donald Rainwater",
    party: "Libertarian Party",
    office: "Indiana Governor",
    photo: "https://s3.amazonaws.com/ballotpedia-api4/files/thumbs/100/100/DonaldRainwater2024.jpg",
    alignmentPercent: 0, // Will be calculated dynamically
    issuesAligned: 0, // Will be calculated dynamically
    totalIssues: 1
  },
  {
    id: "jennifer-mccormick", 
    name: "Jennifer McCormick",
    party: "Democratic Party",
    office: "Indiana Governor",
    photo: "https://s3.amazonaws.com/ballotpedia-api4/files/thumbs/100/100/Jennifer_McCormick.jpg",
    alignmentPercent: 0, // Will be calculated dynamically
    issuesAligned: 0, // Will be calculated dynamically
    totalIssues: 1
  },
  {
    id: "mike-braun",
    name: "Mike Braun",
    party: "Republican Party",
    office: "Indiana Governor",
    photo: "https://s3.amazonaws.com/ballotpedia-api4/files/thumbs/100/100/Mike_Braun.png",
    alignmentPercent: 0, // Will be calculated dynamically
    issuesAligned: 0, // Will be calculated dynamically
    totalIssues: 1
  },
  {
    id: "maureen-bauer",
    name: "Maureen Bauer",
    party: "Democratic Party",
    office: "Indiana State Representative",
    photo: "https://s3.amazonaws.com/ballotpedia-api4/files/thumbs/200/300/Mar3020201125PM_80182230_1BA7F9ECD19D4A52829D0F47A0BE6754.jpeg",
    alignmentPercent: 0, // Will be calculated dynamically
    issuesAligned: 0, // Will be calculated dynamically
    totalIssues: 1
  }
];
