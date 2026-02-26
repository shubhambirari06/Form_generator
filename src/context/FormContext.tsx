import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  AppTab,
  FormResponse,
  FormSettings,
  FormState,
  Question,
  QuestionType,
  Section,
  ThemeSettings,
} from '../types';
import { loadFormState, saveFormState, STORAGE_KEY } from '../utils/localStorageHelper';

interface FormContextValue {
  formState: FormState;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  lastSavedAt: string;
  updateSettings: (patch: Partial<FormSettings>) => void;
  updateTheme: (patch: Partial<ThemeSettings>) => void;
  addSection: () => void;
  updateSection: (sectionId: string, patch: Partial<Section>) => void;
  addQuestion: (type: QuestionType, sectionId?: string, index?: number) => void;
  updateQuestion: (questionId: string, patch: Partial<Question>) => void;
  deleteQuestion: (questionId: string) => void;
  duplicateQuestion: (questionId: string) => void;
  reorderQuestions: (fromIndex: number, toIndex: number) => void;
  addResponse: (answers: FormResponse['answers']) => void;
  resetForm: () => void;
}

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const defaultTheme: ThemeSettings = {
  primary: '#673ab7',
  secondary: '#202124',
  accent: '#4285f4',
  background: '#f0ebf8',
  backgroundStyle: 'plain',
  darkMode: false,
};

const defaultSettings: FormSettings = {
  title: 'Untitled Form',
  description: 'Describe your form',
  logoBase64: '',
  confirmationMessage: 'Thanks! Your response has been recorded.',
  appName: 'Form Builder',
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
    title: '',
    description: '',
    required: false,
    options: isOptionType ? [''] : [],
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
  const [activeTab, setActiveTab] = useState<AppTab>('builder');
  const [lastSavedAt, setLastSavedAt] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;

      if (!event.newValue) {
        setFormState(normalizeState(defaultState()));
        return;
      }

      try {
        const nextState = JSON.parse(event.newValue) as FormState;
        setFormState(normalizeState(nextState));
      } catch {
        // Ignore malformed storage payloads.
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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

  const addQuestion = (type: QuestionType, sectionId?: string, index?: number) => {
    const targetSectionId = sectionId ?? formState.sections[0]?.id;
    if (!targetSectionId) return;
    const newQuestion = defaultQuestion(type, targetSectionId);

    setFormState((prev) => ({
      ...prev,
      questions: typeof index === 'number' ? [...prev.questions.slice(0, index), newQuestion, ...prev.questions.slice(index)] : [...prev.questions, newQuestion],
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
      const index = prev.questions.findIndex((q) => q.id === questionId);
      if (index === -1) return prev;
      const target = prev.questions[index];
      const copy: Question = {
        ...target,
        id: createId(),
        title: target.title,
      };
      const newQuestions = [...prev.questions];
      newQuestions.splice(index + 1, 0, copy);
      return { ...prev, questions: newQuestions };
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

  const addResponse = (answers: FormResponse['answers']) => {
    const entry: FormResponse = {
      id: createId(),
      submittedAt: new Date().toISOString(),
      answers,
    };
    setFormState((prev) => ({ ...prev, responses: [...prev.responses, entry] }));
  };

  const resetForm = () => {
    setFormState(normalizeState(defaultState()));
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
      addResponse,
      resetForm,
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
