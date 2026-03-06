/**
 * SkillBridge SA — AI Prompt Templates
 * Structured prompts for Anthropic Claude API calls.
 * Each returns { system, userMessage } for the /v1/messages endpoint.
 */

// ────────────────────────────────────────────────────────────
// 1. COMPETENCY EXTRACTION
// ────────────────────────────────────────────────────────────

export function competencyExtractionPrompt(jobTitle, jobDescription, proficiency) {
  return {
    system: `You are a senior talent intelligence analyst specialising in the South African job market. You extract structured competency maps from job descriptions.

Rules:
- Be precise and job-relevant. Do not infer protected-class attributes.
- Provide "why" explanations for each competency.
- Include synonyms and ATS keywords employers commonly use.
- Use UK English spelling throughout.
- Output valid JSON only — no markdown, no commentary.`,

    userMessage: `Analyse this job posting and extract a structured competency map.

Job Title: ${jobTitle}
Proficiency Level: ${proficiency}

Job Description:
"""
${jobDescription}
"""

Return a JSON object with this exact structure:
{
  "competencies": [
    {
      "name": "string — competency name",
      "category": "technical | domain | soft_skill | certification | experience",
      "definition": "string — 1-2 sentence definition",
      "whyItMatters": "string — why this matters for this specific role",
      "levels": {
        "basic": "string — what basic proficiency looks like",
        "intermediate": "string — what intermediate looks like",
        "advanced": "string — what advanced looks like"
      },
      "evidenceExamples": ["string — portfolio items, work examples, interview proof"],
      "synonyms": ["string — related terms and ATS keywords"],
      "estimatedWeight": "number 1-10 — relative importance for this role",
      "confidenceNote": "string — any uncertainty about this inference"
    }
  ],
  "roleSummary": "string — 2-3 sentence summary of the role",
  "senioritySignals": ["string — indicators of expected seniority"],
  "industryContext": "string — relevant industry knowledge"
}

Extract between 6 and 12 competencies. Include at least one from each category where relevant.`
  };
}

// ────────────────────────────────────────────────────────────
// 2. CV PARSING & STRUCTURING
// ────────────────────────────────────────────────────────────

export function cvStructuringPrompt(extractedText) {
  return {
    system: `You are an expert CV parser. Extract structured data from CV text while preserving the candidate's original meaning. Use UK English. Output valid JSON only.`,

    userMessage: `Parse this CV text into a structured format.

CV Text:
"""
${extractedText}
"""

Return JSON:
{
  "personalInfo": {
    "name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "location": "string or null",
    "linkedIn": "string or null",
    "github": "string or null",
    "portfolio": "string or null"
  },
  "summary": "string or null — professional summary if present",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string or null",
      "startDate": "string — YYYY-MM or approximate",
      "endDate": "string — YYYY-MM, 'Present', or approximate",
      "description": "string — full text of role description",
      "achievements": ["string — individual bullet points / achievements"],
      "skills": ["string — skills mentioned in context of this role"]
    }
  ],
  "education": [
    {
      "qualification": "string",
      "institution": "string",
      "year": "string or null",
      "details": "string or null"
    }
  ],
  "skills": {
    "technical": ["string"],
    "tools": ["string"],
    "languages": ["string — programming languages"],
    "soft": ["string"],
    "other": ["string"]
  },
  "certifications": [
    {
      "name": "string",
      "issuer": "string or null",
      "year": "string or null"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "link": "string or null"
    }
  ],
  "achievements": ["string — standalone achievements not tied to a specific role"],
  "volunteering": ["string — if present"],
  "yearsOfExperience": "number — estimated total years"
}`
  };
}

// ────────────────────────────────────────────────────────────
// 3. CV ↔ JOB MATCH ANALYSIS
// ────────────────────────────────────────────────────────────

export function matchAnalysisPrompt(cvStructured, competencies, jobTitle) {
  return {
    system: `You are a career strategist who analyses the fit between a candidate's CV and a job's competency requirements. Be precise, actionable, and encouraging without making false promises. Use UK English. Output valid JSON only.`,

    userMessage: `Analyse the match between this candidate's CV and the job requirements.

Job Title: ${jobTitle}

Candidate CV (structured):
${JSON.stringify(cvStructured, null, 2)}

Required Competencies:
${JSON.stringify(competencies, null, 2)}

Return JSON:
{
  "overallScore": "number 0-100",
  "summary": "string — 2-3 sentence match summary",
  "overlaps": [
    {
      "competency": "string",
      "cvEvidence": "string — specific CV content that demonstrates this",
      "strengthLevel": "strong | moderate | basic",
      "signal": "string — what this tells a hiring manager"
    }
  ],
  "gaps": [
    {
      "competency": "string",
      "severity": "critical | significant | minor",
      "impact": "number 1-5 — how much this affects candidacy",
      "deficiency": "number 1-5 — how far the candidate is from requirement",
      "recommendation": "string — specific action to close this gap",
      "timeEstimate": "string — realistic time to address",
      "whyItMatters": "string — what signal this gap sends to hiring teams"
    }
  ],
  "hiddenStrengths": [
    {
      "strength": "string",
      "evidence": "string",
      "howToLeverage": "string — how to present this in applications"
    }
  ],
  "atsKeywordCoverage": {
    "found": ["string — keywords present in CV"],
    "missing": ["string — important keywords absent from CV"],
    "coveragePercent": "number 0-100"
  }
}`
  };
}

// ────────────────────────────────────────────────────────────
// 4. ASSESSMENT GENERATION
// ────────────────────────────────────────────────────────────

export function assessmentGenerationPrompt(competency, level, jobContext) {
  return {
    system: `You are an expert assessment designer. Create fair, relevant questions that accurately measure competency. Include clear rubrics and explanations. Use UK English. Output valid JSON only.`,

    userMessage: `Generate an adaptive assessment for the following competency.

Competency: ${competency}
Candidate Level: ${level}
Job Context: ${jobContext}

Return JSON:
{
  "competency": "${competency}",
  "questions": [
    {
      "id": "string — unique ID like q_python_1",
      "type": "mcq | scenario | short_answer",
      "difficulty": "basic | intermediate | advanced",
      "question": "string — the question text",
      "options": ["string — for MCQs only, 4 options"],
      "correctAnswer": "number — 0-indexed for MCQs, null for others",
      "rubric": {
        "excellent": "string — what an excellent answer looks like",
        "good": "string — what a good answer looks like",
        "needs_work": "string — what a poor answer indicates"
      },
      "explanation": "string — why the correct answer is correct",
      "whatToStudy": "string — specific resource or topic to study if wrong",
      "pointValue": "number 1-5"
    }
  ],
  "totalPoints": "number",
  "estimatedMinutes": "number",
  "adaptiveNote": "string — how difficulty was calibrated for the level"
}

Generate 5-8 questions. Mix question types. Start at the stated level and include 1-2 questions above to test ceiling.`
  };
}

// ────────────────────────────────────────────────────────────
// 5. LEARNING RECOMMENDATIONS
// ────────────────────────────────────────────────────────────

export function learningRecommendationsPrompt(gaps, profile, timeline) {
  return {
    system: `You are an education advisor specialising in tech career transitions in South Africa. Recommend specific, real resources and institutions. Be honest about quality variance. Prefer free/affordable options when the user's budget is limited. Use UK English. Output valid JSON only.`,

    userMessage: `Generate personalised learning recommendations.

Candidate Profile:
- Education: ${profile.educationLevel || "Not specified"}
- Experience: ${profile.yearsExperience || "Not specified"} years
- Hours/week available: ${profile.hoursPerWeek || 10}
- Device: ${profile.deviceType || "mobile"}
- Bandwidth: ${profile.bandwidth || "medium"}
- Budget: ${profile.budget || "free"}
- Avoid: ${(profile.avoidPrefs || []).join(", ") || "None specified"}

Timeline: ${timeline}

Skill Gaps (prioritised):
${JSON.stringify(gaps, null, 2)}

Return JSON:
{
  "learningPlan": {
    "summary": "string — overview of the plan",
    "weeklySchedule": [
      {
        "week": "number",
        "focus": "string — primary competency focus",
        "tasks": ["string — specific study tasks"],
        "milestone": "string — what to achieve by end of week",
        "hoursEstimate": "number"
      }
    ]
  },
  "resources": [
    {
      "title": "string — real resource name",
      "type": "doc | course | video | tutorial | paper | template",
      "provider": "string — real provider",
      "url": "string — real URL if known, or 'search: [query]'",
      "competency": "string — which gap this addresses",
      "difficulty": "beginner | intermediate | advanced",
      "estimatedHours": "number",
      "prerequisites": ["string"],
      "whyRecommended": "string — specific reason tied to gap",
      "qualityNote": "string — honest assessment of quality/relevance",
      "offlineFriendly": "boolean — can it be downloaded for offline use",
      "cost": "string — free | freemium | paid (amount if known)"
    }
  ],
  "institutions": [
    {
      "name": "string — real institution name",
      "url": "string — real URL",
      "description": "string — 1-3 sentences",
      "bestFor": "string — what it's best for",
      "typicalOfferings": ["string — relevant courses/certs"],
      "recognition": "string — industry signal, with uncertainty note if needed",
      "category": "university | tvet | vendor_cert | online_platform | bootcamp",
      "region": "global | south_africa | africa",
      "costRange": "string — approximate",
      "relevanceNote": "string — why this matters for the specific role"
    }
  ]
}`
  };
}

// ────────────────────────────────────────────────────────────
// 6. PODCAST EPISODE GENERATION
// ────────────────────────────────────────────────────────────

export function podcastOutlinePrompt(competencies, gaps, userProfile, jobTitle) {
  return {
    system: `You are a podcast script writer creating educational panel discussions for job seekers. The panel has 4 speakers:
- Moderator (Thandiwe): Keeps discussion on track, summarises, timeboxes.
- Domain Expert (Dr Aisha): Deep technical explanations with practical examples.
- Hiring Manager (Sipho): What hiring teams look for, interview tips, common pitfalls.
- User Avatar (the candidate): Asks questions at the user's level based on their profile.

Write natural, conversational dialogue — not scripted. Speakers should reference each other, agree/disagree, and build on points. Use UK English. Output valid JSON only.`,

    userMessage: `Create a podcast episode outline and initial turns.

Job Title: ${jobTitle}

Candidate Profile:
- Education: ${userProfile.educationLevel || "Not specified"}
- Experience: ${userProfile.yearsExperience || "Not specified"} years
- Self-rated skills: ${JSON.stringify(userProfile.skillRatings || {})}

Key Competencies: ${JSON.stringify(competencies.slice(0, 6).map(c => c.name))}
Priority Gaps: ${JSON.stringify(gaps.slice(0, 4).map(g => ({ skill: g.competency || g.skill, severity: g.severity })))}

Return JSON:
{
  "title": "string — episode title",
  "outline": {
    "chapters": [
      {
        "title": "string",
        "focus": "string — competency or topic",
        "estimatedTurns": "number 3-5"
      }
    ]
  },
  "turns": [
    {
      "speaker": "Moderator | Domain Expert | Hiring Manager | User Avatar",
      "name": "Thandiwe | Dr Aisha | Sipho | You",
      "content": "string — 2-5 sentences of natural dialogue",
      "chapter": "string — matching chapter title"
    }
  ]
}

Generate 8-12 initial turns covering the first 2-3 chapters. Make the User Avatar's questions reflect the candidate's actual skill level and gaps.`
  };
}

export function podcastRedirectPrompt(redirectText, recentTurns, competencies, userProfile) {
  return {
    system: `You are continuing a podcast panel discussion. The user has interrupted to redirect the conversation. Generate the next 3-5 turns that directly address the user's request while maintaining natural dialogue flow. Speakers: Moderator (Thandiwe), Domain Expert (Dr Aisha), Hiring Manager (Sipho), User Avatar (You). Use UK English. Output valid JSON only.`,

    userMessage: `The user has redirected the discussion:
"${redirectText}"

Recent conversation context (last 3 turns):
${JSON.stringify(recentTurns.slice(-3), null, 2)}

Competencies being discussed: ${JSON.stringify(competencies.slice(0, 4).map(c => c.name))}

Return JSON:
{
  "turns": [
    {
      "speaker": "string",
      "name": "string",
      "content": "string — 2-5 sentences, directly addressing the redirect",
      "chapter": "string — new chapter title reflecting the redirect"
    }
  ]
}

Generate 3-5 turns. Start with the Moderator acknowledging the redirect, then have experts respond substantively.`
  };
}

// ────────────────────────────────────────────────────────────
// 7. CV OPTIMISATION
// ────────────────────────────────────────────────────────────

export function cvOptimisationPrompt(cvStructured, competencies, jobTitle) {
  return {
    system: `You are an ATS optimisation expert and CV writer. Rewrite CV bullets using STAR/CAR methodology with measurable outcomes. Do not fabricate achievements — improve phrasing and structure only. Avoid keyword stuffing. Use UK English. Output valid JSON only.`,

    userMessage: `Optimise this CV for the target role.

Job Title: ${jobTitle}

CV Data:
${JSON.stringify(cvStructured, null, 2)}

Required Competencies & Keywords:
${JSON.stringify(competencies, null, 2)}

Return JSON:
{
  "keywordReport": {
    "found": [{ "keyword": "string", "signal": "string — what it tells ATS" }],
    "weak": [{ "keyword": "string", "signal": "string — how to strengthen" }],
    "missing": [{ "keyword": "string", "signal": "string — importance and how to add" }],
    "coveragePercent": "number 0-100"
  },
  "bulletRewrites": [
    {
      "original": "string — original bullet from CV",
      "improved": "string — rewritten with STAR/CAR and metrics",
      "method": "string — STAR or CAR breakdown",
      "keywordsAdded": ["string"]
    }
  ],
  "missingSections": [
    {
      "section": "string — e.g. 'Projects', 'Volunteer', 'Metrics'",
      "whyItMatters": "string",
      "suggestion": "string — what to add"
    }
  ],
  "atsVersion": "string — full ATS-optimised CV text (plain, parseable)",
  "humanVersion": "string — full styled CV text (more narrative)"
}`
  };
}

// ────────────────────────────────────────────────────────────
// 8. PORTFOLIO PROJECT GENERATION
// ────────────────────────────────────────────────────────────

export function portfolioGenerationPrompt(competencies, gaps, userProfile, jobTitle) {
  return {
    system: `You are a senior technical mentor designing portfolio projects for job seekers. Projects must be realistic, completable, and demonstrably tied to the target role's requirements. Use UK English. Output valid JSON only.`,

    userMessage: `Generate portfolio project briefs for this candidate.

Job Title: ${jobTitle}
Candidate Level: ${userProfile.yearsExperience || "Not specified"} years experience
Priority Gaps: ${JSON.stringify(gaps.slice(0, 4).map(g => g.competency || g.skill))}
Key Competencies: ${JSON.stringify(competencies.slice(0, 6).map(c => c.name))}

Return JSON:
{
  "projects": [
    {
      "title": "string",
      "description": "string — 2-3 sentence overview",
      "competenciesCovered": ["string"],
      "requirements": ["string — specific deliverables"],
      "acceptanceCriteria": ["string — how to know it's done well"],
      "rubric": ["string — grading criteria"],
      "stackOptions": {
        "beginner": "string — simpler tech stack",
        "advanced": "string — more impressive stack"
      },
      "readmeTemplate": "string — markdown template for the README",
      "demoChecklist": ["string — what to show in a demo"],
      "interviewTalkingPoints": ["string — how to present this in interviews"],
      "estimatedHours": "number",
      "githubIssues": [
        {
          "title": "string",
          "description": "string",
          "labels": ["string"]
        }
      ]
    }
  ]
}

Generate 2-4 projects. Each should address different gaps. Include at least one data-focused and one presentation-focused project.`
  };
}

// ────────────────────────────────────────────────────────────
// 9. INTERVIEW QUESTION GENERATION + FEEDBACK
// ────────────────────────────────────────────────────────────

export function interviewQuestionsPrompt(competencies, jobTitle, userLevel) {
  return {
    system: `You are a senior technical interviewer. Generate realistic interview questions that match what candidates would face for this role. Include both technical and behavioural questions. Use UK English. Output valid JSON only.`,

    userMessage: `Generate interview practice questions.

Job Title: ${jobTitle}
Candidate Level: ${userLevel}
Key Competencies: ${JSON.stringify(competencies.slice(0, 6).map(c => c.name))}

Return JSON:
{
  "questions": [
    {
      "id": "string",
      "type": "technical | behavioural | scenario | culture_fit",
      "question": "string",
      "followUp": "string — likely follow-up question",
      "whatTheyreAssessing": "string — the competency and signal",
      "tip": "string — advice for structuring the answer",
      "sampleAnswer": {
        "outline": ["string — key points to hit"],
        "fullDraft": "string — a strong example answer"
      }
    }
  ],
  "generalTips": ["string — overarching interview advice for this role"]
}

Generate 6-8 questions. Mix types. Include at least 2 technical, 2 behavioural, and 1 scenario.`
  };
}

export function interviewFeedbackPrompt(question, answer, competency) {
  return {
    system: `You are a constructive interview coach. Provide specific, actionable feedback on interview answers. Score fairly. Offer an improved draft that preserves the candidate's authentic voice. Use UK English. Output valid JSON only.`,

    userMessage: `Evaluate this interview answer.

Question: ${question}
Competency being assessed: ${competency}

Candidate's Answer:
"""
${answer}
"""

Return JSON:
{
  "scores": {
    "structure": { "score": "number 1-10", "note": "string" },
    "clarity": { "score": "number 1-10", "note": "string" },
    "relevance": { "score": "number 1-10", "note": "string" },
    "depth": { "score": "number 1-10", "note": "string" },
    "concision": { "score": "number 1-10", "note": "string" }
  },
  "overallScore": "number 1-10",
  "strengths": ["string — what was good"],
  "improvements": ["string — specific things to improve"],
  "improvedDraft": "string — rewritten answer preserving candidate's voice",
  "spacedRepetition": {
    "reviewIn": "string — when to practise again (e.g. '2 days')",
    "focusAreas": ["string — specific areas to drill"]
  }
}`
  };
}
