import type { Quote, Candidate, IssueData } from '../store/useReadRankStore';

// All available issues
export const allIssues: IssueData[] = [
  {
    id: "cannabis-legalization",
    title: "Cannabis Legalization",
    question: "Do you support Indiana legalizing marijuana use, either medicinal, recreational, or both?"
  },
  {
    id: "education-funding",
    title: "Education Funding",
    question: "How should Indiana approach public school funding and teacher compensation?"
  },
  {
    id: "abortion-rights",
    title: "Abortion Rights",
    question: "What is your position on abortion access in Indiana?"
  }
];

// Legacy single issue export for backwards compatibility
export const mockIssueData = allIssues[0];

// Each candidate has ONE quote per issue
export const mockQuotes: Quote[] = [
  // ========== CANNABIS LEGALIZATION ==========
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
  },

  // ========== EDUCATION FUNDING ==========
  {
    id: "rainwater-education",
    text: "The government should not be in the business of running schools. Parents should have complete control over their children's education through school choice, vouchers, and the freedom to homeschool without government interference. Let the free market provide education options.",
    candidateId: "donald-rainwater",
    issue: "education-funding"
  },
  {
    id: "mccormick-education",
    text: "As a former State Superintendent, I know our teachers are underpaid and overworked. We need to increase base teacher salaries to be competitive with neighboring states, fully fund public schools, and stop diverting tax dollars away from public education to private voucher programs.",
    candidateId: "jennifer-mccormick",
    issue: "education-funding"
  },
  {
    id: "braun-education",
    text: "I support school choice because parents know what's best for their kids. We should expand the voucher program while also making sure public schools have the resources they need. Teachers deserve competitive pay, but we also need accountability measures to ensure we're getting results for our investment.",
    candidateId: "mike-braun",
    issue: "education-funding"
  },
  {
    id: "bauer-education",
    text: "Our public schools are the backbone of our communities. We must reverse the chronic underfunding of K-12 education, raise teacher salaries to stop the exodus of educators from our state, and ensure every child has access to quality education regardless of their zip code.",
    candidateId: "maureen-bauer",
    issue: "education-funding"
  },

  // ========== ABORTION RIGHTS ==========
  {
    id: "rainwater-abortion",
    text: "Government has no place in personal medical decisions. Whether you're pro-life or pro-choice, we can all agree that politicians in Indianapolis shouldn't be making these deeply personal decisions for Hoosier families. This is between a woman, her family, and her doctor.",
    candidateId: "donald-rainwater",
    issue: "abortion-rights"
  },
  {
    id: "mccormick-abortion",
    text: "I will fight to restore reproductive rights in Indiana. The near-total abortion ban passed by the legislature is government overreach into the most personal decisions women and families face. Healthcare decisions should be made by patients and doctors, not politicians.",
    candidateId: "jennifer-mccormick",
    issue: "abortion-rights"
  },
  {
    id: "braun-abortion",
    text: "I am pro-life and I supported the legislation that protects unborn children in Indiana. There are exceptions for rape, incest, and the life of the mother. I believe we should support mothers and families through crisis pregnancy centers and adoption services.",
    candidateId: "mike-braun",
    issue: "abortion-rights"
  },
  {
    id: "bauer-abortion",
    text: "The abortion ban in Indiana is extreme and dangerous. Women are being denied necessary healthcare, and doctors are afraid to provide care. We need to restore Roe v. Wade protections and trust women to make their own reproductive healthcare decisions.",
    candidateId: "maureen-bauer",
    issue: "abortion-rights"
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
