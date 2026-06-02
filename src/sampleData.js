/**
 * Sample resume data for demo purposes.
 * Follows the canonical JSON schema from resume-extractor.
 */
export const sampleResumeData = {
  is_resume: true,
  personal_info: {
    full_name: "Alexandra Chen",
    email: "alexandra.chen@email.com",
    phone: "+1 (555) 987-6543",
    address: null,
    city: "San Francisco",
    state: "CA",
    country: "USA",
    zip_code: "94102",
    linkedin: "linkedin.com/in/alexandrachen",
    github: "github.com/alexchen-dev",
    portfolio: "alexandrachen.dev",
    website: null,
    other_social: [],
  },
  objective: null,
  summary:
    "Full-stack software engineer with 5+ years of experience building scalable web applications and distributed systems. Passionate about clean architecture, developer experience, and delivering products that delight users. Led cross-functional teams to ship features serving 2M+ users.",
  education: [
    {
      degree: "Master of Science",
      field_of_study: "Computer Science",
      institution: "Stanford University",
      location: "Stanford, CA",
      start_date: "Sep 2016",
      end_date: "Jun 2018",
      gpa: "3.92",
      honors: "Dean's List",
      relevant_coursework: [
        "Distributed Systems",
        "Machine Learning",
        "Advanced Algorithms",
      ],
    },
    {
      degree: "Bachelor of Science",
      field_of_study: "Computer Engineering",
      institution: "University of Michigan",
      location: "Ann Arbor, MI",
      start_date: "Sep 2012",
      end_date: "May 2016",
      gpa: "3.85",
      honors: "Magna Cum Laude",
      relevant_coursework: [],
    },
  ],
  work_experience: [
    {
      job_title: "Senior Software Engineer",
      company: "Stripe",
      location: "San Francisco, CA",
      start_date: "Jan 2022",
      end_date: "Present",
      is_current: true,
      responsibilities: [
        "Architected and led development of a real-time payment reconciliation system handling $2B+ in daily transactions",
        "Mentored 4 junior engineers through code reviews, pair programming, and career development discussions",
        "Designed and implemented microservices migration reducing API latency by 40% across payment processing pipeline",
      ],
      achievements: [
        "Reduced payment processing errors by 65% through implementation of idempotency patterns and retry logic",
        "Awarded Q3 2023 Engineering Excellence Award for system reliability improvements",
      ],
    },
    {
      job_title: "Software Engineer",
      company: "Airbnb",
      location: "San Francisco, CA",
      start_date: "Jul 2018",
      end_date: "Dec 2021",
      is_current: false,
      responsibilities: [
        "Built and maintained search ranking algorithms serving 150M+ users globally",
        "Developed React-based host dashboard with real-time analytics and booking management",
        "Collaborated with product and design teams to ship 12+ A/B tested features per quarter",
      ],
      achievements: [
        "Increased search conversion rate by 18% through personalized ranking model optimization",
        "Led migration from monolithic architecture to event-driven microservices, improving deployment frequency by 3x",
      ],
    },
  ],
  technical_skills: {
    programming_languages: ["TypeScript", "Python", "Go", "Java", "SQL"],
    frameworks_libraries: [
      "React",
      "Next.js",
      "Node.js",
      "Express",
      "FastAPI",
      "GraphQL",
    ],
    databases: ["PostgreSQL", "Redis", "MongoDB", "DynamoDB"],
    cloud_platforms: ["AWS", "GCP", "Vercel"],
    tools_software: [
      "Docker",
      "Kubernetes",
      "Git",
      "GitHub Actions",
      "Terraform",
      "Datadog",
    ],
    operating_systems: ["Linux", "macOS"],
    methodologies: ["Agile", "Scrum", "TDD", "CI/CD", "Microservices"],
    other: [],
  },
  soft_skills: [
    "Technical Leadership",
    "Cross-functional Collaboration",
    "Mentoring",
    "Problem Solving",
  ],
  projects: [
    {
      name: "OpenTrace",
      description:
        "Open-source distributed tracing library for Node.js applications with automatic instrumentation and Jaeger/Zipkin export support",
      technologies_used: ["TypeScript", "Node.js", "gRPC", "OpenTelemetry"],
      start_date: "Mar 2023",
      end_date: "Present",
      url: null,
      github_link: "github.com/alexchen-dev/opentrace",
    },
    {
      name: "CloudBudget",
      description:
        "Full-stack SaaS application for tracking and optimizing cloud infrastructure costs across AWS and GCP",
      technologies_used: ["React", "Python", "FastAPI", "PostgreSQL", "AWS"],
      start_date: "Jun 2022",
      end_date: "Feb 2023",
      url: "cloudbudget.io",
      github_link: null,
    },
  ],
  certifications: [
    {
      name: "AWS Solutions Architect – Professional",
      issuing_organization: "Amazon Web Services",
      issue_date: "Mar 2023",
      expiry_date: "Mar 2026",
      credential_id: "AWS-SAP-2023-78654",
      url: null,
    },
  ],
  awards_honors: [
    {
      title: "Engineering Excellence Award",
      issuer: "Stripe",
      date: "Q3 2023",
      description:
        "Recognized for outstanding contributions to system reliability and payment processing infrastructure",
    },
  ],
  publications: [],
  languages: [
    { language: "English", proficiency: "Native" },
    { language: "Mandarin Chinese", proficiency: "Fluent" },
    { language: "Spanish", proficiency: "Conversational" },
  ],
  volunteer_experience: [
    {
      role: "Coding Instructor",
      organization: "Code.org",
      start_date: "Sep 2020",
      end_date: "Present",
      description:
        "Teaching introductory programming concepts to high school students from underrepresented communities",
    },
  ],
  extracurricular_activities: [],
  interests_hobbies: [],
  references: [],
  additional_sections: {},
};
