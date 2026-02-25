import { FiX } from 'react-icons/fi';
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
}: QuestionCardProps) => {
  const setType = (type: QuestionType) => {
    onUpdate(question.id, {
      type,
      options: optionEnabled(type) ? (question.options.length ? question.options : ['Option 1']) : [],
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

  return (
    <div
      className="card question-card"
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="question-row">
        <input
          value={question.title}
          onChange={(e) => onUpdate(question.id, { title: e.target.value })}
          placeholder="Question title"
        />
        <select value={question.type} onChange={(e) => setType(e.target.value as QuestionType)}>
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
        value={question.description}
        onChange={(e) => onUpdate(question.id, { description: e.target.value })}
        placeholder="Description (optional)"
      />

      <div className="question-row">
        <label>Section</label>
        <select value={question.sectionId} onChange={(e) => onUpdate(question.id, { sectionId: e.target.value })}>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      {optionEnabled(question.type) && (
        <div className="options-wrap">
          {question.options.map((opt, i) => (
            <div className="option-item" key={`${question.id}-${i}`}>
              <input
                value={opt}
                onChange={(e) => {
                  const next = [...question.options];
                  next[i] = e.target.value;
                  onUpdate(question.id, { options: next });
                }}
              />
              <button
                type="button"
                className="remove-btn"
                aria-label="Remove option"
                onClick={() => onUpdate(question.id, { options: question.options.filter((_, idx) => idx !== i) })}
              >
                <FiX />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onUpdate(question.id, { options: [...question.options, `Option ${question.options.length + 1}`] })}
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
              onChange={(e) => onUpdate(question.id, { scaleMin: Number(e.target.value) })}
            />
            <span>to</span>
            <input
              type="number"
              min={2}
              max={10}
              value={question.scaleMax}
              onChange={(e) => onUpdate(question.id, { scaleMax: Number(e.target.value) })}
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
        <button type="button" onClick={() => onDuplicate(question.id)}>
          Duplicate
        </button>
        <button type="button" onClick={() => onDelete(question.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};
