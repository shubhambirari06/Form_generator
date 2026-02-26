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
      <div className="card shadow-sm p-5 text-center">
        <h2 className="mb-3">Submitted</h2>
        <p className="lead">{confirmationMessage}</p>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="preview-header mb-4 p-3 border rounded bg-light bg-opacity-10">
        {logoBase64 ? <img src={logoBase64} className="fc-logo-large mb-3" alt="Form logo" /> : null}
        <h1 className="h2 mb-2">{title}</h1>
        <p className="text-muted lead mb-0">{description}</p>
      </div>

      <div className="section-head mb-4 px-2">
        <h3 className="h4 mb-2">{currentSection?.title}</h3>
        <p className="text-muted mb-0">{currentSection?.description}</p>
      </div>

      <div className="px-2">
      {currentQuestions.map((q) => (
        <div key={q.id} className="preview-question mb-4 p-3 border rounded bg-light bg-opacity-10">
          {(() => {
            const filledOptions = q.options
              .map((o) => o.trim())
              .filter((o) => o.length > 0);

            return (
              <>
          <div className="mb-3">
            <label className="form-label fw-bold d-block mb-1">
              {q.title} {q.required ? <span className="required text-danger">*</span> : null}
            </label>
            {q.description ? <small className="text-muted d-block">{q.description}</small> : null}
          </div>

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
              {filledOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
              {q.allowOther ? <option value="Other">Other</option> : null}
            </select>
          )}

          {q.type === 'radio' && (
            <div className="d-flex flex-column gap-2">
              {[...filledOptions, ...(q.allowOther ? ['Other'] : [])].map((o) => (
                <label key={`${q.id}-${o}`} className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={q.id}
                    className="form-check-input mt-0"
                    checked={(answers[q.id] as string) === o}
                    onChange={() => setValue(q.id, o)}
                  />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === 'checkbox' && (
            <div className="d-flex flex-column gap-2">
              {[...filledOptions, ...(q.allowOther ? ['Other'] : [])].map((o) => {
                const current = (answers[q.id] as string[]) ?? [];
                const checked = current.includes(o);
                return (
                  <label key={`${q.id}-${o}`} className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      className="form-check-input mt-0"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked ? [...current, o] : current.filter((x) => x !== o);
                        setValue(q.id, next);
                      }}
                    />
                    <span>{o}</span>
                  </label>
                );
              })}
            </div>
          )}

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

          {errors[q.id] ? <p className="error mt-2">{errors[q.id]}</p> : null}
              </>
            );
          })()}
        </div>
      ))}
      </div>

      <div className="nav-row px-2">
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
