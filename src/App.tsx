import './App.css';
import { useEffect, type CSSProperties } from 'react';
import { FormProvider, useFormContext } from './context/FormContext';
import { Navbar } from './components/Navbar';
import { BuilderPage } from './pages/BuilderPage';
import { ResponsesPage } from './pages/ResponsesPage';
import { PreviewForm } from './components/PreviewForm';

const AppBody = () => {
  const { formState, activeTab, setActiveTab, lastSavedAt, addResponse } = useFormContext();
  const formTitle = formState.settings.title.trim() || 'Untitled Form';

  useEffect(() => {
    document.title = formTitle;
  }, [formTitle]);

  return (
    <div
      className={`app-shell ${formState.theme.darkMode ? 'dark' : ''}`}
      style={
        {
          '--primary': formState.theme.primary,
          '--secondary': formState.theme.secondary,
          '--accent': formState.theme.accent,
          '--bg': formState.theme.background,
        } as CSSProperties
      }
      data-bg={formState.theme.backgroundStyle}
    >
      <Navbar
        appName={formTitle}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        lastSavedAt={lastSavedAt}
        logoBase64={formState.settings.logoBase64}
      />

      {activeTab === 'builder' && <BuilderPage />}
      {activeTab === 'preview' && (
        <div className="main-content">
          <PreviewForm
            title={formState.settings.title}
            description={formState.settings.description}
            logoBase64={formState.settings.logoBase64}
            confirmationMessage={formState.settings.confirmationMessage}
            sections={formState.sections}
            questions={formState.questions}
            onSubmitResponse={addResponse}
          />
        </div>
      )}
      {activeTab === 'responses' && <ResponsesPage />}
    </div>
  );
};

export default function App() {
  return (
    <FormProvider>
      <AppBody />
    </FormProvider>
  );
}