import type { SkillCategory } from "./types";

// 규칙 기반 분석기가 사용하는 스킬 사전.
// aliases: 공고나 이력서에 등장할 수 있는 다른 표기 (영문, 한글, 약어).
// caseSensitive: "Go"처럼 소문자로 쓰면 일반 단어와 헷갈리는 경우만 true.
//
// 사전에 없는 스킬은 찾지 못한다. 이것이 v0의 한계이고,
// v1(Claude API)에서 개선할 부분이다.

export interface SkillDef {
  name: string;
  category: SkillCategory;
  aliases: string[];
  caseSensitive?: boolean;
}

export const SKILLS: SkillDef[] = [
  // 언어
  { name: "JavaScript", category: "언어", aliases: ["JavaScript", "JS", "자바스크립트", "ES6"] },
  { name: "TypeScript", category: "언어", aliases: ["TypeScript", "타입스크립트"] },
  { name: "Python", category: "언어", aliases: ["Python", "파이썬"] },
  { name: "Java", category: "언어", aliases: ["Java", "자바"] },
  { name: "Kotlin", category: "언어", aliases: ["Kotlin", "코틀린"] },
  { name: "Go", category: "언어", aliases: ["Go", "Golang"], caseSensitive: true },
  { name: "C++", category: "언어", aliases: ["C++"] },
  { name: "C#", category: "언어", aliases: ["C#"] },
  { name: "Swift", category: "언어", aliases: ["Swift", "스위프트"], caseSensitive: true },
  { name: "SQL", category: "언어", aliases: ["SQL"] },

  // 프론트엔드
  { name: "React", category: "프론트엔드", aliases: ["React", "React.js", "ReactJS", "리액트"] },
  { name: "React Native", category: "프론트엔드", aliases: ["React Native", "리액트 네이티브"] },
  { name: "Next.js", category: "프론트엔드", aliases: ["Next.js", "NextJS", "넥스트JS"] },
  { name: "Vue.js", category: "프론트엔드", aliases: ["Vue", "Vue.js", "Nuxt"] },
  { name: "HTML/CSS", category: "프론트엔드", aliases: ["HTML", "CSS", "HTML5", "CSS3"] },
  { name: "Tailwind CSS", category: "프론트엔드", aliases: ["Tailwind", "Tailwind CSS", "테일윈드"] },
  { name: "상태 관리", category: "프론트엔드", aliases: ["Redux", "Zustand", "Recoil", "React Query", "TanStack Query"] },

  // 백엔드
  { name: "Node.js", category: "백엔드", aliases: ["Node.js", "NodeJS", "Node", "노드JS"] },
  { name: "Express", category: "백엔드", aliases: ["Express", "Express.js"], caseSensitive: true },
  { name: "NestJS", category: "백엔드", aliases: ["NestJS", "Nest.js"] },
  { name: "Spring", category: "백엔드", aliases: ["Spring", "Spring Boot", "스프링", "스프링 부트", "스프링부트"] },
  { name: "Django", category: "백엔드", aliases: ["Django", "장고"] },
  { name: "FastAPI", category: "백엔드", aliases: ["FastAPI"] },
  { name: "REST API", category: "백엔드", aliases: ["REST", "RESTful", "REST API", "RESTful API"], caseSensitive: true },
  { name: "GraphQL", category: "백엔드", aliases: ["GraphQL"] },

  // 데이터베이스
  { name: "MySQL", category: "데이터베이스", aliases: ["MySQL", "MariaDB"] },
  { name: "PostgreSQL", category: "데이터베이스", aliases: ["PostgreSQL", "Postgres", "포스트그레스"] },
  { name: "MongoDB", category: "데이터베이스", aliases: ["MongoDB", "몽고DB"] },
  { name: "Redis", category: "데이터베이스", aliases: ["Redis", "레디스"] },
  { name: "Supabase", category: "데이터베이스", aliases: ["Supabase"] },
  { name: "벡터 DB", category: "데이터베이스", aliases: ["Vector DB", "벡터 DB", "벡터DB", "pgvector", "Pinecone", "Chroma"] },

  // 인프라·클라우드
  { name: "AWS", category: "인프라·클라우드", aliases: ["AWS", "EC2", "S3", "Lambda", "아마존 웹 서비스"] },
  { name: "GCP", category: "인프라·클라우드", aliases: ["GCP", "Google Cloud"] },
  { name: "Docker", category: "인프라·클라우드", aliases: ["Docker", "도커"] },
  { name: "Kubernetes", category: "인프라·클라우드", aliases: ["Kubernetes", "K8s", "쿠버네티스"] },
  { name: "CI/CD", category: "인프라·클라우드", aliases: ["CI/CD", "GitHub Actions", "Jenkins", "CI", "CD"] },
  { name: "Linux", category: "인프라·클라우드", aliases: ["Linux", "리눅스", "Ubuntu"] },
  { name: "Vercel", category: "인프라·클라우드", aliases: ["Vercel"] },

  // AI·데이터
  { name: "LLM", category: "AI·데이터", aliases: ["LLM", "GPT", "ChatGPT", "Claude", "OpenAI", "생성형 AI", "생성형AI", "Generative AI", "Gemini"] },
  { name: "RAG", category: "AI·데이터", aliases: ["RAG", "검색 증강 생성", "Retrieval-Augmented"] },
  { name: "프롬프트 엔지니어링", category: "AI·데이터", aliases: ["프롬프트 엔지니어링", "프롬프트", "Prompt Engineering", "Prompt"] },
  { name: "AI 에이전트", category: "AI·데이터", aliases: ["AI Agent", "AI 에이전트", "에이전트", "Agent", "Tool calling", "MCP"] },
  { name: "LangChain", category: "AI·데이터", aliases: ["LangChain", "랭체인", "LangGraph", "LlamaIndex"] },
  { name: "머신러닝", category: "AI·데이터", aliases: ["머신러닝", "Machine Learning", "ML", "딥러닝", "Deep Learning"] },
  { name: "PyTorch", category: "AI·데이터", aliases: ["PyTorch", "파이토치"] },
  { name: "TensorFlow", category: "AI·데이터", aliases: ["TensorFlow", "텐서플로"] },
  { name: "데이터 분석", category: "AI·데이터", aliases: ["Pandas", "NumPy", "데이터 분석", "Data Analysis"] },

  // 협업·도구
  { name: "Git", category: "협업·도구", aliases: ["Git"] },
  { name: "GitHub", category: "협업·도구", aliases: ["GitHub", "깃허브", "GitLab"] },
  { name: "테스트 코드", category: "협업·도구", aliases: ["테스트 코드", "단위 테스트", "Unit Test", "Jest", "Vitest", "TDD", "Pytest"] },
  { name: "Jira/Notion", category: "협업·도구", aliases: ["Jira", "Notion", "Confluence", "노션", "지라"] },
  { name: "AI 코딩 도구", category: "협업·도구", aliases: ["Claude Code", "Cursor", "Copilot", "GitHub Copilot", "Codex", "바이브코딩", "바이브 코딩"] },
];
