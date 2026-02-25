import { FiBarChart2, FiEdit3, FiEye, FiLink2, FiMoreVertical, FiRefreshCw, FiSliders } from 'react-icons/fi';
import { ToastProvider, useToast } from './Toast';

type Tab = 'builder' | 'preview' | 'responses';

interface NavbarProps {
  appName: string;
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
  lastSavedAt: string;
  logoBase64?: string;
  onPublish?: () => void;
  onCopyLink?: () => void;
  onThemeSettings?: () => void;
}

const NavbarContent = ({
  appName,
  activeTab,
  onChangeTab,
  logoBase64,
  onPublish,
  onCopyLink,
  onThemeSettings,
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

  return (
    <header className="fc-topbar">
      <div className="fc-topbar-left">
        {logoBase64 ? <img src={logoBase64} alt="Form logo" className="fc-logo" /> : <div className="fc-logo-fallback">F</div>}
        <div className="fc-brand-copy">
          <strong>{appName}</strong>
        </div>
      </div>

      <nav className="fc-top-tabs" aria-label="Main tabs">
        <button className={activeTab === 'builder' ? 'active' : ''} onClick={() => onChangeTab('builder')}>
          <FiEdit3 /> Questions
        </button>
        <button className={activeTab === 'responses' ? 'active' : ''} onClick={() => onChangeTab('responses')}>
          <FiBarChart2 /> Responses
        </button>
        <button className={activeTab === 'preview' ? 'active' : ''} onClick={() => onChangeTab('preview')}>
          <FiEye /> Preview
        </button>
      </nav>

      <div className="fc-topbar-right">
        <button className="fc-icon-btn" aria-label="Theme options" onClick={handleThemeSettings}>
          <FiSliders />
        </button>
        <button className="fc-icon-btn" aria-label="Refresh view" onClick={() => window.location.reload()}>
          <FiRefreshCw />
        </button>
        <button className="fc-icon-btn" aria-label="Copy form link" onClick={handleCopyLink}>
          <FiLink2 />
        </button>
        <button className="fc-publish-btn" onClick={handlePublish}>Publish</button>
        <button className="fc-icon-btn" aria-label="More options" onClick={() => addToast('More options menu', 'info')}>
          <FiMoreVertical />
        </button>
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
