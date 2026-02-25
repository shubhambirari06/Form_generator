export type QuestionType =
  | 'text'
  | 'paragraph'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'date'
  | 'time'
  | 'file'
  | 'linear';

export type ValidationType = 'none' | 'email' | 'minLength' | 'maxLength';

export interface ValidationRule {
  type: ValidationType;
  value?: number;
}

export interface ConditionalLogic {
  enabled: boolean;
  equals: string;
  targetSectionId: string;
}

export interface Section {
  id: string;
  title: string;
  description: string;
}

export interface Question {
  id: string;
  sectionId: string;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  options: string[];
  allowOther: boolean;
  validation: ValidationRule;
  scaleMin: number;
  scaleMax: number;
  condition: ConditionalLogic;
}

export interface ThemeSettings {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundStyle: 'plain' | 'dots' | 'gradient';
  darkMode: boolean;
}

export interface FormSettings {
  title: string;
  description: string;
  logoBase64: string;
  confirmationMessage: string;
  appName: string;
}

export type AnswerValue = string | string[] | number | null;

export interface FormResponse {
  id: string;
  submittedAt: string;
  answers: Record<string, AnswerValue>;
}

export interface FormState {
  settings: FormSettings;
  theme: ThemeSettings;
  sections: Section[];
  questions: Question[];
  responses: FormResponse[];
}