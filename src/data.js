export const chapters = [
  { name: "Foundations", range: "Days 1-10", color: "#2bb9ff", icon: "◇" },
  { name: "n8n Builder", range: "Days 11-20", color: "#8d6bff", icon: "⌁" },
  { name: "Business Systems", range: "Days 21-30", color: "#24e4df", icon: "◎" },
  { name: "AI Agents", range: "Days 31-40", color: "#ff5fbd", icon: "✦" },
  { name: "RAG & Code", range: "Days 41-50", color: "#ffad3d", icon: "⌘" },
  { name: "Career Launch", range: "Days 51-60", color: "#8be35d", icon: "⚑" },
];

const rawDays = [
  ["Jun 15", "Set up workspace, LinkedIn, GitHub, roadmap"],
  ["Jun 16", "Intro to AI automation and prompt engineering"],
  ["Jun 17", "Prompt patterns and prompt library"],
  ["Jun 18", "API basics"],
  ["Jun 19", "REST APIs and HTTP methods"],
  ["Jun 20", "JSON fundamentals"],
  ["Jun 21", "Postman practice"],
  ["Jun 22", "Public API project"],
  ["Jun 23", "Webhooks"],
  ["Jun 24", "Mini project: FAQ assistant"],
  ["Jun 25", "Install and learn n8n"],
  ["Jun 26", "n8n triggers"],
  ["Jun 27", "n8n actions"],
  ["Jun 28", "Email automations"],
  ["Jun 29", "Google Sheets integrations"],
  ["Jun 30", "Forms to workflow"],
  ["Jul 1", "Multi-step workflow"],
  ["Jul 2", "Error handling"],
  ["Jul 3", "Project: Lead capture automation"],
  ["Jul 4", "Project polish + GitHub"],
  ["Jul 5", "CRM concepts"],
  ["Jul 6", "Lead qualification workflows"],
  ["Jul 7", "Email follow-up systems"],
  ["Jul 8", "Appointment booking flows"],
  ["Jul 9", "Business process mapping"],
  ["Jul 10", "Project: Dental clinic automation"],
  ["Jul 11", "Documentation"],
  ["Jul 12", "Portfolio update"],
  ["Jul 13", "AI agents introduction"],
  ["Jul 14", "Tool calling"],
  ["Jul 15", "Agent memory"],
  ["Jul 16", "Multi-agent concepts"],
  ["Jul 17", "Agent workflow design"],
  ["Jul 18", "Research agent build"],
  ["Jul 19", "Agent testing"],
  ["Jul 20", "Portfolio update"],
  ["Jul 21", "RAG fundamentals"],
  ["Jul 22", "Embeddings"],
  ["Jul 23", "Vector databases"],
  ["Jul 24", "Document ingestion"],
  ["Jul 25", "PDF chatbot build"],
  ["Jul 26", "Improve chatbot"],
  ["Jul 27", "SQL basics"],
  ["Jul 28", "JavaScript refresh"],
  ["Jul 29", "Git/GitHub polish"],
  ["Jul 30", "Resume draft"],
  ["Jul 31", "LinkedIn optimization"],
  ["Aug 1", "Mock interview 1"],
  ["Aug 2", "Mock interview 2"],
  ["Aug 3", "Apply to 20 jobs"],
  ["Aug 4", "Interview prep: APIs"],
  ["Aug 5", "Apply to 20 jobs"],
  ["Aug 6", "Interview prep: n8n"],
  ["Aug 7", "Apply to 20 jobs"],
  ["Aug 8", "Interview prep: agents"],
  ["Aug 9", "Apply to 20 jobs"],
  ["Aug 10", "Interview prep: projects"],
  ["Aug 11", "Apply to 20 jobs"],
  ["Aug 12", "Review weaknesses"],
  ["Aug 13", "Final portfolio + interview day"],
];

export const videos = {
  prompt: {
    id: "_ZvnD73m40o",
    title: "Prompt Engineering Tutorial",
    creator: "freeCodeCamp.org",
    length: "Full course",
  },
  api: {
    id: "WXsD0ZgxjRw",
    title: "APIs for Beginners",
    creator: "freeCodeCamp.org",
    length: "Full course",
  },
  n8n: {
    id: "4BVTkqbn_tY",
    title: "n8n Beginner Course",
    creator: "n8n",
    length: "Official series",
  },
  agents: {
    id: "OhI005_aJkA",
    title: "AI Agents for Beginners",
    creator: "Microsoft Developer",
    length: "Lessons 1-10",
  },
  rag: {
    id: "mHxLXzYjQRE",
    title: "Production RAG with Vector Databases",
    creator: "freeCodeCamp.org",
    length: "Full course",
  },
  code: {
    id: "jS4aFq5-91M",
    title: "JavaScript Programming",
    creator: "freeCodeCamp.org",
    length: "Full course",
  },
  git: {
    id: "8JJ101D3knE",
    title: "Git Tutorial for Beginners",
    creator: "Programming with Mosh",
    length: "1 hour",
  },
  resume: {
    id: "Tt08KmFfIYQ",
    title: "Write an Incredible Resume",
    creator: "Jeff Su",
    length: "Practical guide",
  },
  interview: {
    id: "ZqNorUIgIe8",
    title: "Answer Questions You Didn't Prepare For",
    creator: "Jeff Su",
    length: "Interview guide",
  },
};

function videoForDay(day) {
  if (day <= 3) return videos.prompt;
  if (day <= 10) return videos.api;
  if (day <= 28) return videos.n8n;
  if (day <= 36) return videos.agents;
  if (day <= 42) return videos.rag;
  if (day <= 44) return videos.code;
  if (day === 45) return videos.git;
  if (day <= 47) return videos.resume;
  return videos.interview;
}

function objectivesFor(title, day) {
  if (title.includes("Project") || title.includes("project") || title.includes("build")) {
    return [
      "Define the input, output, and success criteria",
      "Build the smallest working version",
      "Test one happy path and one failure path",
      "Capture a screenshot and add notes to GitHub",
    ];
  }
  if (title.includes("Apply")) {
    return [
      "Shortlist roles that match your current skills",
      "Tailor your top resume bullets",
      "Send 20 focused applications",
      "Track every application and follow-up date",
    ];
  }
  if (day === 1) {
    return [
      "Create a focused learning workspace",
      "Optimize your LinkedIn headline",
      "Create or clean up your GitHub profile",
      "Read the full roadmap and protect your study time",
    ];
  }
  return [
    `Learn the core idea behind ${title.toLowerCase()}`,
    "Take concise notes in your own words",
    "Complete one hands-on exercise",
    "Write down one interview question and answer",
  ];
}

export const days = rawDays.map(([date, title], index) => {
  const number = index + 1;
  return {
    number,
    date,
    title,
    chapter: Math.floor(index / 10),
    xp: title.toLowerCase().includes("project") || title.toLowerCase().includes("apply") ? 100 : 50,
    objectives: objectivesFor(title, number),
    video: videoForDay(number),
  };
});

export const projects = [
  { day: 10, name: "FAQ Assistant", color: "#2bb9ff" },
  { day: 19, name: "Lead Capture Automation", color: "#8d6bff" },
  { day: 26, name: "Dental Clinic Automation", color: "#24e4df" },
  { day: 34, name: "Research Agent", color: "#ff5fbd" },
  { day: 41, name: "PDF Chatbot", color: "#ffad3d" },
];

export const achievements = [
  { at: 1, name: "Ignition", detail: "Complete Day 1" },
  { at: 10, name: "First Build", detail: "Complete Day 10" },
  { at: 20, name: "Workflow Builder", detail: "Complete Day 20" },
  { at: 30, name: "Systems Thinker", detail: "Complete Day 30" },
  { at: 40, name: "Agent Maker", detail: "Complete Day 40" },
  { at: 50, name: "Code Master", detail: "Complete Day 50" },
  { at: 60, name: "Career Ready", detail: "Complete Day 60" },
];
