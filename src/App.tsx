import './App.css';
import { useEffect, useState, type CSSProperties } from 'react';
import { FormProvider, useFormContext } from './context/FormContext';
import { Navbar } from './components/Navbar';
import { BuilderPage } from './pages/BuilderPage';
import { PreviewForm } from './components/PreviewForm';
import { ThemeSettingsPanel } from './components/ThemeSettingsPanel';

const AppBody = () => {
  const { formState, activeTab, setActiveTab, lastSavedAt, addResponse, resetForm, updateTheme } = useFormContext();
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const formTitle = formState.settings.title.trim() || 'Untitled Form';

  useEffect(() => {
    document.title = formTitle;
  }, [formTitle]);

  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      document.head.appendChild(link);
    }

    link.href = formState.settings.logoBase64 || '/favicon.svg';
  }, [formState.settings.logoBase64]);

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
        onReset={resetForm}
        onThemeSettings={() => setShowThemeSettings(true)}
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

      {showThemeSettings && (
        <ThemeSettingsPanel
          theme={formState.theme}
          onUpdate={updateTheme}
          onClose={() => setShowThemeSettings(false)}
        />
      )}
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