import type { Analyzer } from "../types";
import { ruleBasedAnalyzer } from "./rule-based";

// 어떤 분석기를 쓸지 한곳에서 정한다.
// v1에서 Claude 분석기를 만들면 여기만 바꾸면 되고, 화면과 API 코드는 그대로 둔다.
export function getAnalyzer(): Analyzer {
  return ruleBasedAnalyzer;
}
