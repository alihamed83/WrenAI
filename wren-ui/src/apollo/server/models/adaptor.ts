import * as Errors from '@server/utils/error';
import { Manifest } from '@server/mdl/type';

export interface WrenAIError {
  code: Errors.GeneralErrorCodes;
  message: string;
}

export enum WrenAIDeployStatusEnum {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface WrenAIDeployResponse {
  status: WrenAIDeployStatusEnum;
  error?: string;
}

export enum WrenAISystemStatus {
  INDEXING = 'INDEXING',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
}

export enum WrenAILanguage {
  EN = 'English',
  ES = 'Spanish',
  FR = 'French',
  ZH_TW = 'Traditional Chinese',
  ZH_CN = 'Simplified Chinese',
  DE = 'German',
  PT = 'Portuguese',
  RU = 'Russian',
  JA = 'Japanese',
  KO = 'Korean',
}

export interface DeployData {
  manifest: Manifest;
  hash: string;
}

// ask
export interface AskStep {
  summary: string;
  sql: string;
  cteName: string;
}

export interface AskHistory {
  sql: string;
  steps: Array<AskStep>;
}

export interface AskConfigurations {
  language?: string;
  timezone?: { name: string };
}

export interface AskInput {
  query: string;
  deployId: string;
  history?: AskHistory;
  configurations?: AskConfigurations;
}

export interface AsyncQueryResponse {
  queryId: string;
}

export enum AskResultStatus {
  UNDERSTANDING = 'UNDERSTANDING',
  SEARCHING = 'SEARCHING',
  PLANNING = 'PLANNING',
  GENERATING = 'GENERATING',
  CORRECTING = 'CORRECTING',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED',
}

export enum AskResultType {
  GENERAL = 'GENERAL',
  TEXT_TO_SQL = 'TEXT_TO_SQL',
  MISLEADING_QUERY = 'MISLEADING_QUERY',
}

// if it's view, viewId will be returned as well. It means the candidate is originally saved in mdl as a view.
// if it's llm, viewId will not be returned. It means the candidate is generated by AI service.
export enum AskCandidateType {
  VIEW = 'VIEW',
  LLM = 'LLM',
}

export interface AskResponse<R, S> {
  type: AskResultType | null;
  status: S;
  response: R | null;
  error: WrenAIError | null;
  invalid_sql?: string;
}

export interface AskDetailInput {
  query: string;
  sql: string;
  configurations?: AskConfigurations;
}

export type AskDetailResult = AskResponse<
  {
    description: string;
    steps: AskStep[];
  },
  AskResultStatus
>;

export type AskResult = AskResponse<
  Array<{
    type: AskCandidateType;
    sql: string;
    viewId?: number | null;
  }>,
  AskResultStatus
> & {
  intentReasoning?: string;
  invalidSql?: string;
};

export enum RecommendationQuestionStatus {
  GENERATING = 'GENERATING',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
}

export type RecommendationQuestionsInput = {
  // JSON string of the MDL (Model Definition Language)
  manifest: Manifest;
  // Optional list of previous questions
  previousQuestions?: string[];
  // Optional project ID
  projectId?: string;
  // Optional max number of questions to generate (default: 5)
  maxQuestions?: number;
  // Optional max number of categories (default: 3)
  maxCategories?: number;
  regenerate?: boolean; // Optional regenerate questions (default: false)
  // Optional configuration settings
  configuration?: AskConfigurations;
};

export type RecommendationQuestion = {
  question: string;
  category: string; // category for the question
  sql: string; // validated sql for this question, can be used in generateAskDetail
};

export type RecommendationQuestionsResult = AskResponse<
  {
    questions: RecommendationQuestion[];
  },
  RecommendationQuestionStatus
>;

// text-based answer
export interface TextBasedAnswerInput {
  query: string;
  sql: string;
  sqlData: any;
  threadId?: string;
  userId?: string;
  configurations?: AskConfigurations;
}

export enum TextBasedAnswerStatus {
  PREPROCESSING = 'PREPROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export interface TextBasedAnswerResult {
  status: TextBasedAnswerStatus;
  numRowsUsedInLLM?: number;
  error?: WrenAIError;
}

export enum ChartStatus {
  FETCHING = 'FETCHING',
  GENERATING = 'GENERATING',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED',
}

export enum ChartType {
  BAR = 'bar',
  GROUPED_BAR = 'grouped_bar',
  STACKED_BAR = 'stacked_bar',
  LINE = 'line',
  MULTI_LINE = 'multi_line',
  PIE = 'pie',
  AREA = 'area',
}

export interface ChartInput {
  query: string;
  sql: string;
  projectId?: string;
  configurations?: AskConfigurations;
}

export interface ChartAdjustmentOption {
  chartType: ChartType;
  xAxis?: string;
  yAxis?: string;
  xOffset?: string;
  color?: string;
  theta?: string;
}

export interface ChartAdjustmentInput {
  query: string;
  sql: string;
  adjustmentOption: ChartAdjustmentOption;
  chartSchema: Record<string, any>;
  projectId?: string;
  configurations?: AskConfigurations;
}

export interface ChartResponse {
  reasoning: string;
  chartType: ChartType;
  chartSchema: Record<string, any>;
}

export interface ChartResult {
  status: ChartStatus;
  response?: ChartResponse;
  error?: WrenAIError;
}
