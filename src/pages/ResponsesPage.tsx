import { useMemo } from 'react';
import { useFormContext } from '../context/FormContext';
import { ResponseSummary } from '../components/ResponseSummary';

const toCSV = (headers: string[], rows: string[][]) => {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
};

export const ResponsesPage = () => {
  const { formState, clearResponses } = useFormContext();

  const headers = useMemo(() => ['Submitted At', ...formState.questions.map((q) => q.title)], [formState.questions]);

  const rows = useMemo(
    () =>
      formState.responses.map((r) => [
        new Date(r.submittedAt).toLocaleString(),
        ...formState.questions.map((q) => {
          const v = r.answers[q.id];
          return Array.isArray(v) ? v.join(' | ') : String(v ?? '');
        }),
      ]),
    [formState.responses, formState.questions]
  );

  const exportCSV = () => {
    const csv = toCSV(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = (formState.settings.title.trim() || 'form').replace(/[^\w-]+/g, '_');
    a.download = `${safeTitle}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="main-content">
      <ResponseSummary responses={formState.responses} questions={formState.questions} />
      <div className="card">
        <div className="response-actions">
          <button className="btn btn-outline-primary btn-sm" onClick={exportCSV}>Export CSV</button>
          <button className="btn btn-outline-danger btn-sm" onClick={clearResponses}>Clear Responses</button>
        </div>

        {formState.responses.length === 0 ? (
          <p>No responses yet.</p>
        ) : (
          formState.responses.map((r) => (
            <div key={r.id} className="response-item">
              <strong>{new Date(r.submittedAt).toLocaleString()}</strong>
              {formState.questions.map((q) => {
                const v = r.answers[q.id];
                return (
                  <p key={`${r.id}-${q.id}`}>
                    <b>{q.title}:</b> {Array.isArray(v) ? v.join(', ') : String(v ?? '')}
                  </p>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
