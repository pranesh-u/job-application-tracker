export interface AIAnalysisResult {
  resumeMatch: number; // 0 - 100
  atsScore: number; // 0 - 100
  readinessScore: number; // 0 - 100
  applicationStrength: number; // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  recommendations: string[];
  explanation: string;
}

// Common tech keywords dictionary for extraction & matching
const TECH_KEYWORDS = [
  // Languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Golang", "Rust",
  "Ruby", "PHP", "Swift", "Kotlin", "SQL", "HTML", "CSS", "Bash", "R", "Scala",
  
  // Frontend
  "React", "Next.js", "Vue", "Vue.js", "Angular", "Svelte", "Redux", "Zustand",
  "Tailwind", "TailwindCSS", "Bootstrap", "Webpack", "Vite", "HTML5", "CSS3",
  
  // Backend & APIs
  "Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot",
  "ASP.NET", "Laravel", "Ruby on Rails", "REST", "RESTful", "GraphQL", "gRPC",
  "WebSockets", "Microservices", "Serverless",
  
  // Databases & ORMs
  "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Elasticsearch",
  "DynamoDB", "Cassandra", "Prisma", "Sequelize", "TypeORM", "Mongoose", "Supabase", "Firebase",
  
  // Cloud & DevOps
  "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud", "Docker",
  "Kubernetes", "K8s", "CI/CD", "GitHub Actions", "Terraform", "Ansible", "Linux",
  "Nginx", "Vercel", "Netlify",
  
  // Testing & Quality
  "Jest", "Cypress", "Playwright", "Mocha", "PyTest", "JUnit", "TDD", "Unit Testing",
  
  // Engineering Concepts & AI
  "System Design", "Data Structures", "Algorithms", "OOP", "Object Oriented",
  "Machine Learning", "Deep Learning", "AI", "Artificial Intelligence", "NLP",
  "LLM", "PyTorch", "TensorFlow", "Pandas", "NumPy", "Scikit-Learn", "Agile", "Scrum"
];

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9+#\s-]/g, " ");
}

function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text);
  const found: Set<string> = new Set();

  for (const keyword of TECH_KEYWORDS) {
    const normKeyword = keyword.toLowerCase();
    // Use word boundary check
    const regex = new RegExp(`\\b${normKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, "i");
    if (regex.test(normalized)) {
      found.add(keyword);
    }
  }

  return Array.from(found);
}

/**
 * High-precision local heuristic AI matching engine.
 * Computes match metrics, skill gaps, and targeted suggestions.
 */
export function analyzeResumeVsJD(
  resumeText: string,
  jobDescription: string
): AIAnalysisResult {
  const cleanResume = resumeText.trim();
  const cleanJD = jobDescription.trim();

  if (!cleanResume || !cleanJD) {
    return {
      resumeMatch: 0,
      atsScore: 0,
      readinessScore: 0,
      applicationStrength: 0,
      matchedSkills: [],
      missingSkills: [],
      strengths: ["Attach a resume and paste a job description to trigger analysis."],
      recommendations: ["Add a complete job description to receive custom recommendations."],
      explanation: "Analysis cannot be completed without both a resume version and a job description.",
    };
  }

  const jdKeywords = extractKeywords(cleanJD);
  const resumeKeywords = extractKeywords(cleanResume);

  // Identify matched & missing skills
  const matchedSet = new Set<string>();
  const missingSet = new Set<string>();

  for (const kw of jdKeywords) {
    const isMatched = resumeKeywords.some(
      (rKw) => rKw.toLowerCase() === kw.toLowerCase()
    );
    if (isMatched) {
      matchedSet.add(kw);
    } else {
      missingSet.add(kw);
    }
  }

  const matchedSkills = Array.from(matchedSet);
  const missingSkills = Array.from(missingSet);

  // Metric 1: Resume Match (ratio of JD skills found in resume)
  const totalJdCount = Math.max(jdKeywords.length, 1);
  const rawMatchRatio = matchedSkills.length / totalJdCount;
  const resumeMatch = Math.min(Math.round(rawMatchRatio * 100) + 15, 98); // Base curve boost for partial matches

  // Metric 2: ATS Score (Format readability & keyword density)
  const wordCount = cleanResume.split(/\s+/).filter(Boolean).length;
  let atsScore = 80;
  if (wordCount < 200) atsScore -= 20; // Too short
  if (wordCount > 1000) atsScore -= 10; // Too long
  if (matchedSkills.length > 5) atsScore += 10;
  atsScore = Math.min(Math.max(atsScore, 40), 96);

  // Metric 3: Readiness Score (Based on skill overlap ratio & resume detail depth)
  const readinessScore = Math.min(Math.round((resumeMatch * 0.7) + (atsScore * 0.3)), 99);

  // Metric 4: Application Strength (Composite score)
  const applicationStrength = Math.round((resumeMatch * 0.5) + (atsScore * 0.25) + (readinessScore * 0.25));

  // Generate Strengths
  const strengths: string[] = [];
  if (matchedSkills.length > 0) {
    strengths.push(
      `Strong keyword alignment in core technical stack: ${matchedSkills.slice(0, 4).join(", ")}.`
    );
  }
  if (wordCount >= 250 && wordCount <= 850) {
    strengths.push("Resume length is optimal for ATS parsers (250–850 words).");
  }
  if (resumeMatch >= 75) {
    strengths.push("High match probability for initial recruiter screening.");
  }

  // Generate Recommendations
  const recommendations: string[] = [];
  if (missingSkills.length > 0) {
    recommendations.push(
      `Incorporate missing key technical keywords: ${missingSkills.slice(0, 4).join(", ")}.`
    );
  }
  recommendations.push(
    "Quantify impact in bullet points (e.g. use metric formulas like 'Increased X by Y% by doing Z')."
  );
  if (atsScore < 75) {
    recommendations.push(
      "Ensure standard section headings (Experience, Skills, Education) for maximum ATS readability."
    );
  }
  recommendations.push(
    `Tailor project section highlights specifically toward the requirements mentioned in the job description.`
  );

  // Generate Summary Explanation
  const explanation =
    resumeMatch >= 80
      ? `Excellent alignment! Your resume covers ${matchedSkills.length} out of ${totalJdCount} key technical requirements identified in the job description.`
      : resumeMatch >= 50
      ? `Moderate alignment. You match ${matchedSkills.length} key skills, but incorporating missing keywords like ${missingSkills.slice(0, 3).join(", ") || "target tech"} will significantly boost your ATS ranking.`
      : `Needs optimization. Incorporate key terms from the job description (${missingSkills.slice(0, 4).join(", ")}) to improve match relevance.`;

  return {
    resumeMatch,
    atsScore,
    readinessScore,
    applicationStrength,
    matchedSkills,
    missingSkills,
    strengths,
    recommendations,
    explanation,
  };
}
