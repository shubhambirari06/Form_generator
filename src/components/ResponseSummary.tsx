import type { FormResponse, Question } from '../types';

interface ResponseSummaryProps {
  responses: FormResponse[];
  questions: Question[];
}

export const ResponseSummary = ({ responses, questions }: ResponseSummaryProps) => {
  const summaryQuestions = questions.filter((q) =>
    q.type === 'radio' || q.type === 'select' || q.type === 'checkbox' || q.type === 'linear'
  );

  return (
    <div className="card">
      <h3>Total responses: {responses.length}</h3>

      {summaryQuestions.map((q) => {
        const options =
          q.type === 'linear'
            ? Array.from({ length: q.scaleMax - q.scaleMin + 1 }).map((_, i) => String(q.scaleMin + i))
            : q.options;

        const counts: Record<string, number> = {};
        options.forEach((o) => {
          counts[o] = 0;
        });

        responses.forEach((r) => {
          const value = r.answers[q.id];
          if (Array.isArray(value)) {
            value.forEach((v) => {
              counts[v] = (counts[v] ?? 0) + 1;
            });
          } else if (value !== null && value !== undefined && value !== '') {
            const v = String(value);
            counts[v] = (counts[v] ?? 0) + 1;
          }
        });

        const max = Math.max(1, ...Object.values(counts));

        return (
          <div key={q.id} className="summary-block">
            <strong>{q.title}</strong>
            {Object.entries(counts).map(([opt, count]) => (
              <div key={`${q.id}-${opt}`} className="bar-row">
                <span>{opt}</span>
                <div className="bar-wrap">
                  <div className="bar" style={{ width: `${(count / max) * 100}%` }} />
                </div>
                <span>{count}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
