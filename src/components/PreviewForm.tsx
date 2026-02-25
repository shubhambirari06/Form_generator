import { useMemo, useState } from 'react';
import type { AnswerValue, Question } from '../types';

interface PreviewFormProps {
  title: string;
  description: string;
  logoBase64: string;
  confirmationMessage: string;
  sections: { id: string; title: string; description: string }[];
  questions: Question[];
  onSubmitResponse: (answers: Record<string, AnswerValue>) => void;
}

const validateAnswer = (q: Question, value: AnswerValue): string => {
  if (q.required) {
    if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      return 'This field is required.';
    }
  }

  if ((q.type === 'text' || q.type === 'paragraph') && typeof value === 'string' && value) {
    if (q.validation.type === 'email') {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!ok) return 'Please enter a valid email address.';
    }
    if (q.validation.type === 'minLength' && value.length < (q.validation.value ?? 1)) {
      return `Minimum length is ${q.validation.value}.`;
    }
    if (q.validation.type === 'maxLength' && value.length > (q.validation.value ?? 1)) {
      return `Maximum length is ${q.validation.value}.`;
    }
  }

  return '';
};

export const PreviewForm = ({
  title,
  description,
  logoBase64,
  confirmationMessage,
  sections,
  questions,
  onSubmitResponse,
}: PreviewFormProps) => {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const currentSection = sections[sectionIndex];
  const currentQuestions = useMemo(
    () => questions.filter((q) => q.sectionId === currentSection?.id),
    [questions, currentSection]
  );

  const setValue = (id: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const checkSection = () => {
    const sectionErrors: Record<string, string> = {};
    currentQuestions.forEach((q) => {
      const msg = validateAnswer(q, answers[q.id] ?? null);
      if (msg) sectionErrors[q.id] = msg;
    });
    setErrors((prev) => ({ ...prev, ...sectionErrors }));
    return Object.keys(sectionErrors).length === 0;
  };

  const next = () => {
    if (!checkSection()) return;

    const jump = currentQuestions.find(
      (q) =>
        q.condition.enabled &&
        q.condition.targetSectionId &&
        String(answers[q.id] ?? '').trim().toLowerCase() === q.condition.equals.trim().toLowerCase()
    );

    if (jump) {
      const idx = sections.findIndex((s) => s.id === jump.condition.targetSectionId);
      if (idx >= 0) {
        setSectionIndex(idx);
        return;
      }
    }

    setSectionIndex((i) => Math.min(i + 1, sections.length - 1));
  };

  const prev = () => {
    setSectionIndex((i) => Math.max(i - 1, 0));
  };

  const submit = () => {
    const allErrors: Record<string, string> = {};
    questions.forEach((q) => {
      const msg = validateAnswer(q, answers[q.id] ?? null);
      if (msg) allErrors[q.id] = msg;
    });
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) return;

    onSubmitResponse(answers);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="card">
        <h2>Submitted</h2>
        <p>{confirmationMessage}</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="preview-header">
        {logoBase64 ? <img src={logoBase64} className="fc-logo-large" alt="Form logo" /> : null}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="section-head">
        <h3>{currentSection?.title}</h3>
        <small>{currentSection?.description}</small>
      </div>

      {currentQuestions.map((q) => (
        <div key={q.id} className="preview-question">
          <label>
            {q.title} {q.required ? <span className="required">*</span> : null}
          </label>
          {q.description ? <small>{q.description}</small> : null}

          {q.type === 'text' && (
            <input className="form-control" value={(answers[q.id] as string) ?? ''} onChange={(e) => setValue(q.id, e.target.value)} />
          )}
          {q.type === 'paragraph' && (
            <textarea className="form-control" value={(answers[q.id] as string) ?? ''} onChange={(e) => setValue(q.id, e.target.value)} />
          )}
          {q.type === 'date' && (
            <input className="form-control" type="date" value={(answers[q.id] as string) ?? ''} onChange={(e) => setValue(q.id, e.target.value)} />
          )}
          {q.type === 'time' && (
            <input className="form-control" type="time" value={(answers[q.id] as string) ?? ''} onChange={(e) => setValue(q.id, e.target.value)} />
          )}
          {q.type === 'file' && <input className="form-control" type="file" onChange={(e) => setValue(q.id, e.target.files?.[0]?.name ?? '')} />}

          {q.type === 'select' && (
            <select className="form-select" value={(answers[q.id] as string) ?? ''} onChange={(e) => setValue(q.id, e.target.value)}>
              <option value="">Select</option>
              {q.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
              {q.allowOther ? <option value="Other">Other</option> : null}
            </select>
          )}

          {q.type === 'radio' &&
            [...q.options, ...(q.allowOther ? ['Other'] : [])].map((o) => (
              <label key={`${q.id}-${o}`} className="choice-line">
                <input
                  type="radio"
                  name={q.id}
                  checked={(answers[q.id] as string) === o}
                  onChange={() => setValue(q.id, o)}
                />
                {o}
              </label>
            ))}

          {q.type === 'checkbox' &&
            [...q.options, ...(q.allowOther ? ['Other'] : [])].map((o) => {
              const current = (answers[q.id] as string[]) ?? [];
              const checked = current.includes(o);
              return (
                <label key={`${q.id}-${o}`} className="choice-line">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked ? [...current, o] : current.filter((x) => x !== o);
                      setValue(q.id, next);
                    }}
                  />
                  {o}
                </label>
              );
            })}

          {q.type === 'linear' && (
            <div className="d-flex align-items-center gap-3 py-2 overflow-auto">
              <span className="fw-bold text-muted">{q.scaleMin}</span>
              <div className="d-flex gap-4">
              {Array.from({ length: q.scaleMax - q.scaleMin + 1 }).map((_, idx) => {
                const v = q.scaleMin + idx;
                return (
                  <label key={`${q.id}-${v}`} className="d-flex flex-column align-items-center gap-1" style={{ cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name={q.id}
                      className="form-check-input m-0"
                      checked={Number(answers[q.id]) === v}
                      onChange={() => setValue(q.id, v)}
                    />
                    <small className="text-muted">{v}</small>
                  </label>
                );
              })}
              </div>
              <span className="fw-bold text-muted">{q.scaleMax}</span>
            </div>
          )}

          {errors[q.id] ? <p className="error">{errors[q.id]}</p> : null}
        </div>
      ))}

      <div className="nav-row">
        <button className="btn btn-outline-secondary" onClick={prev} disabled={sectionIndex === 0}>
          Previous
        </button>
        {sectionIndex < sections.length - 1 ? (
          <button className="btn btn-primary" onClick={next}>Next</button>
        ) : (
          <button className="btn btn-success" onClick={submit}>Submit</button>
        )}
      </div>
    </div>
  );
};
