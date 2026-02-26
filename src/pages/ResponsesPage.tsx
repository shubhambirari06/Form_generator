import type { AnswerValue, FormResponse, Question } from '../types';

interface ResponsesPageProps {
  responses: FormResponse[];
  questions: Question[];
}

const formatAnswer = (value: AnswerValue): string => {
  if (value === null || value === '') return '—';
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '—';
  return String(value);
};

export const ResponsesPage = ({ responses, questions }: ResponsesPageProps) => {
  if (responses.length === 0) {
    return (
      <section className="card">
        <h3 className="h5 mb-2">Responses</h3>
        <p className="text-muted mb-0">No responses yet.</p>
      </section>
    );
  }

  return (
    <section className="d-flex flex-column gap-3">
      <div className="card">
        <h3 className="h5 mb-1">Responses</h3>
        <p className="text-muted mb-0">Total submissions: {responses.length}</p>
      </div>

      {responses
        .slice()
        .reverse()
        .map((response) => (
          <article key={response.id} className="card">
            <h4 className="h6 mb-3">Submitted: {new Date(response.submittedAt).toLocaleString()}</h4>
            <div className="d-flex flex-column gap-2">
              {questions.map((question) => (
                <div key={`${response.id}-${question.id}`}>
                  <div className="fw-semibold">{question.title || 'Untitled question'}</div>
                  <div className="text-muted">{formatAnswer(response.answers[question.id] ?? null)}</div>
                </div>
              ))}
            </div>
          </article>
        ))}
    </section>
  );
};
