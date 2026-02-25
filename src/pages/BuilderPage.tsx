import { useMemo, useState } from 'react';
import { useFormContext } from '../context/FormContext';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionTypesPanel } from '../components/QuestionTypesPanel';

export const BuilderPage = () => {
  const {
    formState,
    updateSettings,
    updateTheme,
    updateSection,
    addSection,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
  } = useFormContext();

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const allQuestions = useMemo(() => formState.questions, [formState.questions]);

  const onLogoUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateSettings({ logoBase64: String(reader.result ?? '') });
    reader.readAsDataURL(file);
  };

  return (
    <div className="builder-shell">
      <main className="builder-canvas">
        <section className="card form-header-card">
          <input
            value={formState.settings.title}
            onChange={(e) => updateSettings({ title: e.target.value })}
            placeholder="Untitled form"
            className="form-title-input"
          />
          <textarea
            value={formState.settings.description}
            onChange={(e) => updateSettings({ description: e.target.value })}
            placeholder="Form description"
            className="form-description-input"
          />
        </section>

       


        <section>
          {allQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              sections={formState.sections}
              index={idx}
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
        </section>
      </main>

      <QuestionTypesPanel
        onAddQuestion={(type) => addQuestion(type, formState.sections[0]?.id)}
        onAddSection={addSection}
      />
    </div>
  );
};
