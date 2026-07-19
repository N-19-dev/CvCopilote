export const profile = {
  name: "Nathan Sornet",
  title: "Data/IA Engineer",
  linkedin: "https://www.linkedin.com/in/nathan-sornet/",
  summary:
    "Ingénieur Data & IA combinant la mise en place de workflows en production (Azure, Snowflake, dbt) et le développement de solutions d'IA (LLM, LangChain, Computer Vision). Formation marketing digital (ISG) en plus du diplôme d'ingénieur — une double lecture technique et produit rare sur ce type de profil.",
  languages: [
    { name: "Français", level: "Langue maternelle" },
    { name: "Anglais", level: "B2 — semestre en Australie" },
  ],
};

export const skillDomains = [
  {
    title: "Cloud & Orchestration",
    skills: ["Azure Functions", "Azure Data Factory", "Snowflake", "Airflow"],
  },
  {
    title: "Transformation de données",
    skills: ["dbt", "SQL avancé", "Pandas / NumPy"],
  },
  {
    title: "IA & Python",
    skills: ["LangChain / LangGraph", "Machine Learning", "Computer Vision", "Claude API"],
  },
  {
    title: "Git & Outils",
    skills: ["Azure DevOps CI/CD", "GitHub CI/CD", "Claude Code"],
  },
];

export const experiences = [
  {
    role: "Data & IA Ingénieur — POC",
    company: "Thales",
    period: "Mai 2026 – Juin 2026",
    description:
      "Pipeline Knowledge Graph 15 phases (ingestion S3, extraction NLP, Neo4j), enrichissement LLM (Mistral), interface GraphRAG hybride vecteur + Text-to-Cypher.",
    tech: ["Python", "Neo4j", "Mistral"],
  },
  {
    role: "Data Ingénieur — CDI",
    company: "Ippon Technologies · FFR",
    period: "Jan 2026 – Avr 2026",
    description:
      "Référent technique client, gestion des accès Snowflake, migration Azure Functions → Durable Functions, template d'ingestion industrialisé.",
    tech: ["Snowflake", "dbt", "Azure Functions", "Durable Functions"],
  },
  {
    role: "Stage Data Ingénieur",
    company: "Ippon Technologies · FFR",
    period: "Juin 2025 – Nov 2025",
    description:
      "Observabilité Bronze/Silver/Gold, dashboard Power BI, alerting Teams temps réel, migration de scripts Data Science vers dbt SQL.",
    tech: ["Python", "SQL", "Azure", "Snowflake", "dbt"],
  },
  {
    role: "Stage Data Ingénieur",
    company: "Report Linker",
    period: "Juil 2024 – Sep 2024",
    description:
      "Extraction et structuration de données multi-sources, workflows automatiques, tableaux de bord analytiques.",
    tech: ["MySQL", "Python", "Pandas"],
  },
  {
    role: "Création d'entreprise",
    company: "Marketplace Firstcop",
    period: "Sep 2020 – Avr 2023",
    description:
      "Création et pilotage d'une marketplace : campagnes marketing (SEO, réseaux sociaux), analyse de performance — la genèse de sa double compétence technique/produit.",
    tech: ["SEO", "Analytics"],
  },
];

export const education = {
  degrees: [
    { school: "ESME Paris", degree: "Diplôme d'ingénieur en BigData" },
    { school: "ISG (PGE) — Master 2", degree: "Majeure BigData et Marketing Digital" },
  ],
  certifications: [
    "Databricks Fundamentals Lakehouse",
    "Astronomer — Apache Airflow 3 Fundamentals",
    "Astronomer — DAG Authoring for Apache Airflow 3",
    "Building with the Claude API",
    "Claude Certified Architect Foundation",
  ],
};

export const projects = [
  {
    title: "Analyse vidéo pour coachs de rugby",
    period: "Sep 2024 – Juin 2025",
    description:
      "Computer Vision temps réel (joueurs, ballon), Machine Learning pour reconnaissance d'actions et prédiction de stratégies, interface de visualisation pour les coachs.",
    tech: ["Python", "Computer Vision", "Machine Learning", "NumPy", "Pandas"],
  },
  {
    title: "CV Copilote — ce site",
    period: "En cours",
    description:
      "Ce dashboard + agent conversationnel RAG, avec un routeur intelligent multi-fournisseurs (LiteLLM) qui classe la complexité de chaque question et choisit le modèle le plus économique adapté.",
    tech: ["FastAPI", "LiteLLM", "Redis", "Next.js", "shadcn/ui"],
  },
];
