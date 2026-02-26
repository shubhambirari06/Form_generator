import { FiX } from 'react-icons/fi';
import type { ThemeSettings } from '../types';

interface ThemeSettingsPanelProps {
  theme: ThemeSettings;
  onUpdate: (patch: Partial<ThemeSettings>) => void;
  onClose: () => void;
}

export const ThemeSettingsPanel = ({ theme, onUpdate, onClose }: ThemeSettingsPanelProps) => {
  return (
    <div
      className="theme-panel-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1050,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="theme-panel"
        style={{
          width: '320px',
          backgroundColor: 'white',
          height: '100%',
          padding: '24px',
          boxShadow: '-4px 0 12px rgba(0,0,0,0.1)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="theme-panel-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <h4 style={{ margin: 0 }}>Theme Settings</h4>
          <button className="btn btn-light btn-sm" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="form-group">
          <label className="form-label fw-bold">Primary Color</label>
          <div className="d-flex gap-2">
            <input
              type="color"
              className="form-control form-control-color"
              value={theme.primary}
              onChange={(e) => onUpdate({ primary: e.target.value })}
              title="Choose your color"
            />
            <input
              type="text"
              className="form-control"
              value={theme.primary}
              onChange={(e) => onUpdate({ primary: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label fw-bold">Secondary Color</label>
          <div className="d-flex gap-2">
            <input
              type="color"
              className="form-control form-control-color"
              value={theme.secondary}
              onChange={(e) => onUpdate({ secondary: e.target.value })}
              title="Choose your color"
            />
            <input
              type="text"
              className="form-control"
              value={theme.secondary}
              onChange={(e) => onUpdate({ secondary: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label fw-bold">Accent Color</label>
          <div className="d-flex gap-2">
            <input
              type="color"
              className="form-control form-control-color"
              value={theme.accent}
              onChange={(e) => onUpdate({ accent: e.target.value })}
              title="Choose your color"
            />
            <input
              type="text"
              className="form-control"
              value={theme.accent}
              onChange={(e) => onUpdate({ accent: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label fw-bold">Background Color</label>
          <div className="d-flex gap-2">
            <input
              type="color"
              className="form-control form-control-color"
              value={theme.background}
              onChange={(e) => onUpdate({ background: e.target.value })}
              title="Choose your color"
            />
            <input
              type="text"
              className="form-control"
              value={theme.background}
              onChange={(e) => onUpdate({ background: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label fw-bold">Background Style</label>
          <select
            className="form-select"
            value={theme.backgroundStyle}
            onChange={(e) => onUpdate({ backgroundStyle: e.target.value as ThemeSettings['backgroundStyle'] })}
          >
            <option value="plain">Plain</option>
            <option value="dots">Dots</option>
            <option value="grid">Grid</option>
            <option value="lines">Lines</option>
            <option value="gradient">Gradient</option>
          </select>
        </div>

        <div className="form-check form-switch mt-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="darkModeSwitch"
            checked={theme.darkMode}
            onChange={(e) => onUpdate({ darkMode: e.target.checked })}
          />
          <label className="form-check-label fw-bold" htmlFor="darkModeSwitch">
            Dark Mode
          </label>
        </div>
      </div>
    </div>
  );
};