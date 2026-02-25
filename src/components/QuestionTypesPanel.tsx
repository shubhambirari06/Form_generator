import {
  FiAlignLeft,
  FiBarChart2,
  FiCalendar,
  FiCheckSquare,
  FiChevronDown,
  FiClock,
  FiFile,
  FiList,
  FiPlus,
  FiSliders,
} from 'react-icons/fi';
import type { ReactNode } from 'react';
import type { QuestionType } from '../types';

const QUESTION_TYPES: { label: string; type: QuestionType; icon: ReactNode }[] = [
  { label: 'Short Answer', type: 'text', icon: <FiAlignLeft /> },
  { label: 'Paragraph', type: 'paragraph', icon: <FiList /> },
  { label: 'Multiple Choice', type: 'radio', icon: <FiCheckSquare /> },
  { label: 'Checkboxes', type: 'checkbox', icon: <FiCheckSquare /> },
  { label: 'Dropdown', type: 'select', icon: <FiChevronDown /> },
  { label: 'Date', type: 'date', icon: <FiCalendar /> },
  { label: 'Time', type: 'time', icon: <FiClock /> },
  { label: 'File Upload', type: 'file', icon: <FiFile /> },
  { label: 'Linear Scale', type: 'linear', icon: <FiBarChart2 /> },
];

interface QuestionTypesPanelProps {
  onAddQuestion: (type: QuestionType) => void;
  onAddSection: () => void;
}

export const QuestionTypesPanel = ({ onAddQuestion, onAddSection }: QuestionTypesPanelProps) => {
  return (
    <aside 
      className="fc-action-rail card" 
      aria-label="Quick actions"
      style={{
        position: 'sticky',
        top: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px 8px',
        width: '52px',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <button className="fc-rail-btn is-main" title="Add question" onClick={() => onAddQuestion('radio')}>
        <FiPlus />
      </button>
      <div className="fc-rail-list">
        {QUESTION_TYPES.map((item) => (
          <button key={item.type} className="fc-rail-btn" title={item.label} onClick={() => onAddQuestion(item.type)}>
            {item.icon}
          </button>
        ))}
      </div>
      <button className="fc-rail-btn" title="Add section" onClick={onAddSection}>
        <FiSliders />
      </button>
    </aside>
  );
};
