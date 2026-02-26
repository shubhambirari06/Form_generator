import { FiLink2, FiRefreshCw } from 'react-icons/fi';
import { IoColorPalette } from 'react-icons/io5';
import { ToastProvider, useToast } from './Toast';

type Tab = 'builder' | 'preview';

interface NavbarProps {
  appName: string;
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
  lastSavedAt: string;
  logoBase64?: string;
  onPublish?: () => void;
  onCopyLink?: () => void;
  onThemeSettings?: () => void;
  onReset?: () => void;
}

const NavbarContent = ({
  appName,
  activeTab,
  onChangeTab,
  lastSavedAt,
  logoBase64,
  onPublish,
  onCopyLink,
  onThemeSettings,
  onReset,
}: NavbarProps) => {
  const { addToast } = useToast();

  const handleCopyLink = () => {
    if (onCopyLink) {
      onCopyLink();
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => addToast('Link copied to clipboard!', 'success'))
        .catch(() => addToast('Failed to copy link', 'error'));
    }
  };

  const handlePublish = () => {
    if (onPublish) {
      onPublish();
    } else {
      // Simulate publish action
      addToast('Form published successfully!', 'success');
    }
  };

  const handleThemeSettings = () => {
    if (onThemeSettings) {
      onThemeSettings();
    } else {
      addToast('Theme settings not configured', 'info');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the form? All unsaved changes will be lost.')) {
      onReset?.();
      addToast('Form reset to default', 'success');
    }
  };

  return (
    <header className="fc-topbar">
      <div className="fc-topbar-left">
        {logoBase64 ? <img src={logoBase64} alt="Form logo" className="fc-logo" /> : <div className="fc-logo-fallback">F</div>}
        <div className="fc-brand-copy">
          <strong>{appName}</strong>
          <small className="fc-save-status">Saved at {lastSavedAt}</small>
        </div>
      </div>

      <nav className="fc-top-tabs" aria-label="Main tabs">
        <button className={activeTab === 'builder' ? 'active' : ''} onClick={() => onChangeTab('builder')}>
          Questions
        </button>
        <button className={activeTab === 'preview' ? 'active' : ''} onClick={() => onChangeTab('preview')}>
          Preview
        </button>
      </nav>

      <div className="fc-topbar-right">
        <button className="fc-icon-btn btn btn-light" aria-label="Theme options" onClick={handleThemeSettings}>
          <IoColorPalette />
        </button>
        <button className="fc-icon-btn btn btn-light" aria-label="Reset form" onClick={handleReset}>
          <FiRefreshCw />
        </button>
        <button className="fc-icon-btn btn btn-light" aria-label="Copy form link" onClick={handleCopyLink}>
          <FiLink2 />
        </button>
        <button className="fc-publish-btn btn btn-primary" onClick={handlePublish}>Publish</button>
      </div>
    </header>
  );
};

export const Navbar = (props: NavbarProps) => {
  return (
    <ToastProvider>
      <NavbarContent {...props} />
    </ToastProvider>
  );
};
