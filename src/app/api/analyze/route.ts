import { getAnalyzer } from "@/lib/analyzer";

// POST /api/analyze
// 화면에서 보낸 공고와 이력서를 서버에서 분석해 결과를 돌려준다.
// 분석을 서버에서 하는 이유: v1에서 Claude API를 쓸 때 API 키가 브라우저에 노출되지 않게 하기 위해.

const MAX_LENGTH = 20_000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }

  const { jobPosting, resume } = (body ?? {}) as Record<string, unknown>;

  if (typeof jobPosting !== "string" || jobPosting.trim() === "") {
    return Response.json({ error: "채용공고를 입력해 주세요." }, { status: 400 });
  }
  if (typeof resume !== "string" || resume.trim() === "") {
    return Response.json({ error: "이력서 내용을 입력해 주세요." }, { status: 400 });
  }
  if (jobPosting.length > MAX_LENGTH || resume.length > MAX_LENGTH) {
    return Response.json({ error: `각 입력은 ${MAX_LENGTH.toLocaleString()}자 이하로 넣어 주세요.` }, { status: 400 });
  }

  const result = await getAnalyzer().analyze({ jobPosting, resume });
  return Response.json(result);
}
