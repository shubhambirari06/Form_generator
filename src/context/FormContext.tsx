import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  FormResponse,
  FormSettings,
  FormState,
  Question,
  QuestionType,
  Section,
  ThemeSettings,
} from '../types';
import { loadFormState, saveFormState } from '../utils/localStorageHelper';

type Tab = 'builder' | 'preview' | 'responses';

interface FormContextValue {
  formState: FormState;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  lastSavedAt: string;
  updateSettings: (patch: Partial<FormSettings>) => void;
  updateTheme: (patch: Partial<ThemeSettings>) => void;
  addSection: () => void;
  updateSection: (sectionId: string, patch: Partial<Section>) => void;
  addQuestion: (type: QuestionType, sectionId?: string) => void;
  updateQuestion: (questionId: string, patch: Partial<Question>) => void;
  deleteQuestion: (questionId: string) => void;
  duplicateQuestion: (questionId: string) => void;
  reorderQuestions: (fromIndex: number, toIndex: number) => void;
  clearResponses: () => void;
  addResponse: (answers: FormResponse['answers']) => void;
}

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const defaultTheme: ThemeSettings = {
  primary: '#0F766E',
  secondary: '#0B132B',
  accent: '#F4A261',
  background: '#F8FAFC',
  backgroundStyle: 'plain',
  darkMode: false,
};

const defaultSettings: FormSettings = {
  title: 'Untitled Form',
  description: 'Describe your form',
  logoBase64: '',
  confirmationMessage: 'Thanks! Your response has been recorded.',
  appName: 'FormCraft',
};

const createInitialSection = (): Section => ({
  id: createId(),
  title: 'Section 1',
  description: '',
});

const defaultQuestion = (type: QuestionType, sectionId: string): Question => {
  const isOptionType = type === 'radio' || type === 'checkbox' || type === 'select';
  return {
    id: createId(),
    sectionId,
    type,
    title: 'Untitled Question',
    description: '',
    required: false,
    options: isOptionType ? ['Option 1'] : [],
    allowOther: false,
    validation: { type: 'none' },
    scaleMin: 1,
    scaleMax: 5,
    condition: { enabled: false, equals: '', targetSectionId: '' },
  };
};

const defaultState = (): FormState => {
  const firstSection = createInitialSection();
  return {
    settings: defaultSettings,
    theme: defaultTheme,
    sections: [firstSection],
    questions: [defaultQuestion('radio', firstSection.id)],
    responses: [],
  };
};

const normalizeState = (state: FormState): FormState => {
  const sections = state.sections.length > 0 ? state.sections : [createInitialSection()];
  const sectionIds = new Set(sections.map((section) => section.id));

  const questions =
    state.questions.length > 0
      ? state.questions.map((question) =>
          sectionIds.has(question.sectionId) ? question : { ...question, sectionId: sections[0].id }
        )
      : [defaultQuestion('radio', sections[0].id)];

  return {
    ...state,
    sections,
    questions,
  };
};

const FormContext = createContext<FormContextValue | null>(null);

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
  const [formState, setFormState] = useState<FormState>(() => normalizeState(loadFormState() ?? defaultState()));
  const [activeTab, setActiveTab] = useState<Tab>('builder');
  const [lastSavedAt, setLastSavedAt] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    saveFormState(formState);
    setLastSavedAt(new Date().toLocaleTimeString());
  }, [formState]);

  const updateSettings = (patch: Partial<FormSettings>) => {
    setFormState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  };

  const updateTheme = (patch: Partial<ThemeSettings>) => {
    setFormState((prev) => ({ ...prev, theme: { ...prev.theme, ...patch } }));
  };

  const addSection = () => {
    const newSection: Section = {
      id: createId(),
      title: `Section ${formState.sections.length + 1}`,
      description: '',
    };
    setFormState((prev) => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  const updateSection = (sectionId: string, patch: Partial<Section>) => {
    setFormState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
    }));
  };

  const addQuestion = (type: QuestionType, sectionId?: string) => {
    const targetSectionId = sectionId ?? formState.sections[0]?.id;
    if (!targetSectionId) return;
    setFormState((prev) => ({
      ...prev,
      questions: [...prev.questions, defaultQuestion(type, targetSectionId)],
    }));
  };

  const updateQuestion = (questionId: string, patch: Partial<Question>) => {
    setFormState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)),
    }));
  };

  const deleteQuestion = (questionId: string) => {
    setFormState((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
  };

  const duplicateQuestion = (questionId: string) => {
    setFormState((prev) => {
      const target = prev.questions.find((q) => q.id === questionId);
      if (!target) return prev;
      const copy: Question = {
        ...target,
        id: createId(),
        title: `${target.title} (Copy)`,
      };
      return { ...prev, questions: [...prev.questions, copy] };
    });
  };

  const reorderQuestions = (fromIndex: number, toIndex: number) => {
    setFormState((prev) => {
      const arr = [...prev.questions];
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= arr.length || toIndex >= arr.length) return prev;
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return { ...prev, questions: arr };
    });
  };

  const clearResponses = () => {
    setFormState((prev) => ({ ...prev, responses: [] }));
  };

  const addResponse = (answers: FormResponse['answers']) => {
    const entry: FormResponse = {
      id: createId(),
      submittedAt: new Date().toISOString(),
      answers,
    };
    setFormState((prev) => ({ ...prev, responses: [...prev.responses, entry] }));
  };

  const value = useMemo<FormContextValue>(
    () => ({
      formState,
      activeTab,
      setActiveTab,
      lastSavedAt,
      updateSettings,
      updateTheme,
      addSection,
      updateSection,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      duplicateQuestion,
      reorderQuestions,
      clearResponses,
      addResponse,
    }),
    [formState, activeTab, lastSavedAt]
  );

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useFormContext = () => {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error('useFormContext must be used inside FormProvider');
  }
  return ctx;
};
