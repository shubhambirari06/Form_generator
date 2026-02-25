import { FiX, FiImage } from 'react-icons/fi';
import type { Question, QuestionType, Section, ValidationType } from '../types';

interface QuestionCardProps {
  question: Question;
  sections: Section[];
  index: number;
  onUpdate: (id: string, patch: Partial<Question>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  isActive?: boolean;
  onClick?: () => void;
}

const optionEnabled = (type: QuestionType) => type === 'radio' || type === 'checkbox' || type === 'select';
const validationEnabled = (type: QuestionType) => type === 'text' || type === 'paragraph';

export const QuestionCard = ({
  question,
  sections,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isActive = false,
  onClick,
}: QuestionCardProps) => {
  const setType = (type: QuestionType) => {
    onUpdate(question.id, {
      type,
      options: optionEnabled(type) ? (question.options.length ? question.options : ['']) : [],
      allowOther: optionEnabled(type) ? question.allowOther : false,
      validation: validationEnabled(type) ? question.validation : { type: 'none' },
    });
  };

  const updateValidation = (type: ValidationType) => {
    onUpdate(question.id, {
      validation: {
        type,
        value: type === 'minLength' || type === 'maxLength' ? question.validation.value ?? 1 : undefined,
      },
    });
  };

  if (!isActive) {
    return (
      <div
        className="card question-card"
        onClick={onClick}
        draggable
        onDragStart={() => onDragStart(index)}
        onDragEnter={() => onDragEnter(index)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => e.preventDefault()}
        style={{ cursor: 'pointer', borderLeft: '6px solid transparent', opacity: 1 }}
      >
        <div className="question-header mb-3">
          <h5 style={{ margin: 0, fontWeight: 500 }}>{question.title} {question.required && <span className="text-danger">*</span>}</h5>
        </div>

        <div className="question-preview" style={{ pointerEvents: 'none', opacity: 0.7 }}>
          {question.type === 'text' && <input className="form-control" disabled placeholder="Short answer text" />}
          {question.type === 'paragraph' && <textarea className="form-control" disabled placeholder="Long answer text" />}
          {question.type === 'date' && <input type="date" className="form-control" disabled />}
          {question.type === 'time' && <input type="time" className="form-control" disabled />}
          {question.type === 'file' && <input type="file" className="form-control" disabled />}
          
          {(question.type === 'radio' || question.type === 'checkbox' || question.type === 'select') && (
            <div className="d-flex flex-column gap-2">
              {question.options.map((opt, i) => (
                <div key={`${question.id}-opt-${i}`} className="d-flex align-items-center gap-2">
                  {question.type === 'radio' && <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #ccc' }} />}
                  {question.type === 'checkbox' && <div style={{ width: 18, height: 18, borderRadius: '2px', border: '2px solid #ccc' }} />}
                  {question.type === 'select' && <span className="text-muted">{i + 1}.</span>}
                  <span className={!opt ? 'text-muted' : ''}>{opt}</span>
                </div>
              ))}
              {question.allowOther && <div className="text-muted ms-4">Other...</div>}
            </div>
          )}

          {question.type === 'linear' && (
             <div className="d-flex align-items-center gap-3 py-3 justify-content-center border rounded bg-light mt-2">
                <span>{question.scaleMin}</span>
                <div className="d-flex gap-3">
                  {Array.from({ length: question.scaleMax - question.scaleMin + 1 }).map((_, i) => (
                     <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #ccc' }} />
                  ))}
                </div>
                <span>{question.scaleMax}</span>
             </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="card question-card active-question"
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      style={{ borderLeft: '6px solid #4285f4', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
    >
      <div className="question-row">
        <input
          className="form-control"
          value={question.title}
          onChange={(e) => onUpdate(question.id, { title: e.target.value })}
          placeholder="Question title"
        />
        <select className="form-select" value={question.type} onChange={(e) => setType(e.target.value as QuestionType)}>
          <option value="text">Short Answer</option>
          <option value="paragraph">Paragraph</option>
          <option value="radio">Multiple Choice</option>
          <option value="checkbox">Checkboxes</option>
          <option value="select">Dropdown</option>
          <option value="date">Date</option>
          <option value="time">Time</option>
          <option value="file">File Upload</option>
          <option value="linear">Linear Scale</option>
        </select>
      </div>

      <input
        className="form-control"
        value={question.description}
        onChange={(e) => onUpdate(question.id, { description: e.target.value })}
        placeholder="Description (optional)"
      />

      {sections.length > 1 && (
        <div className="question-row">
          <label>Section</label>
          <select className="form-select" value={question.sectionId} onChange={(e) => onUpdate(question.id, { sectionId: e.target.value })}>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {optionEnabled(question.type) && (
        <div className="options-wrap">
          {question.options.map((opt, i) => (
            <div className="option-item d-flex align-items-center gap-2" key={`${question.id}-${i}`}>
              {question.type === 'radio' && <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #ccc' }} />}
              {question.type === 'checkbox' && <div style={{ width: 16, height: 16, borderRadius: '2px', border: '2px solid #ccc' }} />}
              {question.type === 'select' && <span className="text-muted small fw-bold" style={{ width: 20 }}>{i + 1}.</span>}
              <input
                className="form-control"
                value={opt}
                placeholder={`Option ${i + 1}`}
                onChange={(e) => {
                  const next = [...question.options];
                  next[i] = e.target.value;
                  onUpdate(question.id, { options: next });
                }}
              />
              <a
                className="text-secondary"
                style={{ cursor: 'pointer' }}
                aria-label="Remove option"
                onClick={() => onUpdate(question.id, { options: question.options.filter((_, idx) => idx !== i) })}
              >
                <FiX />
              </a>
            </div>
          ))}
          {question.allowOther && (
            <div className="option-item d-flex align-items-center gap-2 mb-2">
               {question.type === 'radio' && <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #ccc' }} />}
               {question.type === 'checkbox' && <div style={{ width: 16, height: 16, borderRadius: '2px', border: '2px solid #ccc' }} />}
               {question.type === 'select' && <span className="text-muted small fw-bold" style={{ width: 20 }}>{question.options.length + 1}.</span>}
               <input className="form-control text-muted" disabled value="Other..." style={{ borderStyle: 'dotted' }} />
               <a className="text-secondary" style={{ cursor: 'pointer' }} onClick={() => onUpdate(question.id, { allowOther: false })}><FiX /></a>
            </div>
          )}
          <button
            type="button"
            className="btn btn-outline-primary btn-sm mt-2"
            onClick={() => onUpdate(question.id, { options: [...question.options, ''] })}
          >
            + Add option
          </button>
          <label className="toggle-line">
            <input
              type="checkbox"
              checked={question.allowOther}
              onChange={(e) => onUpdate(question.id, { allowOther: e.target.checked })}
            />
            Include “Other”
          </label>
        </div>
      )}

      {question.type === 'linear' && (
        <div className="question-row">
          <label>Scale</label>
          <div className="inline-pair">
            <input
              type="number"
              min={1}
              max={9}
              value={question.scaleMin}
              onChange={(e) => {
                const inputValue = Number(e.target.value);
                const nextMin = Number.isNaN(inputValue) ? question.scaleMin : Math.max(1, Math.min(9, inputValue));
                onUpdate(question.id, { scaleMin: Math.min(nextMin, question.scaleMax - 1) });
              }}
            />
            <span>to</span>
            <input
              type="number"
              min={2}
              max={10}
              value={question.scaleMax}
              onChange={(e) => {
                const inputValue = Number(e.target.value);
                const nextMax = Number.isNaN(inputValue) ? question.scaleMax : Math.max(2, Math.min(10, inputValue));
                onUpdate(question.id, { scaleMax: Math.max(nextMax, question.scaleMin + 1) });
              }}
            />
          </div>
        </div>
      )}

      {validationEnabled(question.type) && (
        <div className="question-row">
          <label>Validation</label>
          <select value={question.validation.type} onChange={(e) => updateValidation(e.target.value as ValidationType)}>
            <option value="none">None</option>
            <option value="email">Email</option>
            <option value="minLength">Min length</option>
            <option value="maxLength">Max length</option>
          </select>
          {(question.validation.type === 'minLength' || question.validation.type === 'maxLength') && (
            <input
              type="number"
              min={1}
              value={question.validation.value ?? 1}
              onChange={(e) =>
                onUpdate(question.id, {
                  validation: { ...question.validation, value: Number(e.target.value) },
                })
              }
            />
          )}
        </div>
      )}

      {(question.type === 'radio' || question.type === 'select') && (
        <div className="conditional-box">
          <label className="toggle-line">
            <input
              type="checkbox"
              checked={question.condition.enabled}
              onChange={(e) =>
                onUpdate(question.id, {
                  condition: { ...question.condition, enabled: e.target.checked },
                })
              }
            />
            Conditional next section
          </label>
          {question.condition.enabled && (
            <>
              <input
                placeholder='If answer equals "..."'
                value={question.condition.equals}
                onChange={(e) =>
                  onUpdate(question.id, {
                    condition: { ...question.condition, equals: e.target.value },
                  })
                }
              />
              <select
                value={question.condition.targetSectionId}
                onChange={(e) =>
                  onUpdate(question.id, {
                    condition: { ...question.condition, targetSectionId: e.target.value },
                  })
                }
              >
                <option value="">Select section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      <div className="question-actions">
        <label className="toggle-line">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => onUpdate(question.id, { required: e.target.checked })}
          />
          Required
        </label>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onDuplicate(question.id)}>
          Duplicate
        </button>
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => onDelete(question.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};
