import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from '../context/FormContext';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionTypesPanel } from '../components/QuestionTypesPanel';

export const BuilderPage = () => {
  const {
    formState,
    updateSettings,
    updateSection,
    addSection,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
  } = useFormContext();

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    formState.questions.length > 0 ? formState.questions[0].id : null
  );

  const allQuestions = useMemo(() => formState.questions, [formState.questions]);
  const prevQuestionsRef = useRef(allQuestions);

  // Auto-select the last added question if the count increases
  useEffect(() => {
    if (allQuestions.length > prevQuestionsRef.current.length) {
      const prevIds = new Set(prevQuestionsRef.current.map((q) => q.id));
      const newQuestion = allQuestions.find((q) => !prevIds.has(q.id));
      if (newQuestion) {
        setActiveQuestionId(newQuestion.id);
      }
    }
    prevQuestionsRef.current = allQuestions;
  }, [allQuestions]);

  const handleAddQuestion = (type: any) => {
    const activeIndex = allQuestions.findIndex(q => q.id === activeQuestionId);
    const insertIndex = activeIndex >= 0 ? activeIndex + 1 : allQuestions.length;
    const sectionId = activeIndex >= 0 ? allQuestions[activeIndex].sectionId : formState.sections[0]?.id;
    addQuestion(type, sectionId, insertIndex);
  };

  return (
    <div className="builder-shell">
      <main className="builder-canvas">
        <section className="card form-header-card">
          <input
            value={formState.settings.title}
            onChange={(e) => updateSettings({ title: e.target.value })}
            placeholder="Untitled form"
            className="form-control form-title-input"
          />
          <textarea
            value={formState.settings.description}
            onChange={(e) => updateSettings({ description: e.target.value })}
            placeholder="Form description"
            className="form-control form-description-input"
          />
        </section>

        {formState.sections.length > 1 && (
          <section className="card">
            <h5 className="mb-3">Sections</h5>
            <div className="d-flex flex-column gap-3">
              {formState.sections.map((section) => (
                <div key={section.id} className="border rounded p-3">
                  <input
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    placeholder="Section title"
                    className="form-control mb-2"
                  />
                  <textarea
                    value={section.description}
                    onChange={(e) => updateSection(section.id, { description: e.target.value })}
                    placeholder="Section description"
                    className="form-control"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="d-flex align-items-start gap-3 position-relative">
          <div className="flex-grow-1 d-flex flex-column gap-3">
            {allQuestions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                sections={formState.sections}
                index={idx}
                isActive={activeQuestionId === q.id}
                onClick={() => setActiveQuestionId(q.id)}
                onUpdate={updateQuestion}
                onDelete={deleteQuestion}
                onDuplicate={duplicateQuestion}
                onDragStart={(i) => setDragIndex(i)}
                onDragEnter={(target) => {
                  if (dragIndex === null || dragIndex === target) return;
                  reorderQuestions(dragIndex, target);
                  setDragIndex(target);
                }}
                onDragEnd={() => setDragIndex(null)}
              />
            ))}
          </div>
          
          <div className="d-none d-md-block">
             <QuestionTypesPanel
                onAddQuestion={handleAddQuestion}
                onAddSection={addSection}
              />
          </div>
        </div>
      </main>
      
      {/* Mobile FAB fallback if needed, or just hide sidebar on small screens */}
    </div>
  );
};
