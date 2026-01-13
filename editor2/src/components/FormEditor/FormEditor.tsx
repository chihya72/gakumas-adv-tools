import React from 'react';
import { FormField, FormSection } from '../../types/edit-form';
import './FormEditor.css';

interface FormEditorProps {
  sections: FormSection[];
  onChange: (key: string, value: any) => void;
}

/** 通用表单编辑器 */
export const FormEditor: React.FC<FormEditorProps> = ({ sections, onChange }) => {
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(
    new Set(sections.filter(s => s.collapsed).map(s => s.title))
  );

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const renderField = (field: FormField) => {
    const { key, label, type, value, required, placeholder, min, max, step, options, helpText, disabled, hint } = field;

    const handleChange = (newValue: any) => {
      onChange(key, newValue);
    };

    return (
      <div key={key} className="form-field">
        <label className="form-field-label">
          {label}
          {required && <span className="form-field-required">*</span>}
        </label>
        
        <div className="form-field-input">
          {type === 'text' && (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              className="form-input"
              disabled={disabled}
            />
          )}

          {type === 'number' && (
            <input
              type="number"
              value={value ?? ''}
              onChange={(e) => handleChange(parseFloat(e.target.value))}
              min={min}
              max={max}
              step={step}
              placeholder={placeholder}
              className="form-input"
            />
          )}

          {type === 'textarea' && (
            <textarea
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              className="form-textarea"
              rows={4}
            />
          )}

          {type === 'select' && (
            <select
              value={value ?? ''}
              onChange={(e) => handleChange(e.target.value)}
              className="form-select"
              disabled={disabled}
              style={disabled ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed', color: '#999' } : {}}
            >
              {options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {type === 'checkbox' && (
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(e.target.checked)}
              className="form-checkbox"
            />
          )}

          {type === 'vector3' && (
            <div className="form-vector">
              <div className="form-vector-item">
                <label>X</label>
                <input
                  type="number"
                  value={value?.x ?? 0}
                  onChange={(e) => handleChange({ ...value, x: parseFloat(e.target.value) })}
                  step={step ?? 0.01}
                  className="form-input-small"
                />
              </div>
              <div className="form-vector-item">
                <label>Y</label>
                <input
                  type="number"
                  value={value?.y ?? 0}
                  onChange={(e) => handleChange({ ...value, y: parseFloat(e.target.value) })}
                  step={step ?? 0.01}
                  className="form-input-small"
                />
              </div>
              <div className="form-vector-item">
                <label>Z</label>
                <input
                  type="number"
                  value={value?.z ?? 0}
                  onChange={(e) => handleChange({ ...value, z: parseFloat(e.target.value) })}
                  step={step ?? 0.01}
                  className="form-input-small"
                />
              </div>
            </div>
          )}

          {type === 'vector2' && (
            <div className="form-vector">
              <div className="form-vector-item">
                <label>X</label>
                <input
                  type="number"
                  value={value?.x ?? 0}
                  onChange={(e) => handleChange({ ...value, x: parseFloat(e.target.value) })}
                  step={step ?? 0.01}
                  className="form-input-small"
                />
              </div>
              <div className="form-vector-item">
                <label>Y</label>
                <input
                  type="number"
                  value={value?.y ?? 0}
                  onChange={(e) => handleChange({ ...value, y: parseFloat(e.target.value) })}
                  step={step ?? 0.01}
                  className="form-input-small"
                />
              </div>
            </div>
          )}

          {type === 'time' && (
            <input
              type="number"
              value={value ?? 0}
              onChange={(e) => handleChange(parseFloat(e.target.value))}
              step={step ?? 0.001}
              min={min ?? 0}
              placeholder={placeholder}
              className="form-input"
            />
          )}

          {type === 'color' && (
            <div className="form-color-picker">
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => handleChange(e.target.value)}
                className="form-input-color"
              />
              <input
                type="text"
                value={value || ''}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="#000000"
                className="form-input"
              />
            </div>
          )}

          {type === 'file' && (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              className="form-input"
            />
          )}
        </div>

        {helpText && <div className="form-field-help">{helpText}</div>}
        {hint && <small className="field-hint" style={{ display: 'block', marginTop: '4px', color: disabled ? '#999' : '#666' }}>{hint}</small>}
      </div>
    );
  };

  return (
    <div className="form-editor">
      {sections.map((section) => {
        const isCollapsed = collapsedSections.has(section.title);
        return (
          <div key={section.title} className="form-section">
            <div 
              className="form-section-header"
              onClick={() => toggleSection(section.title)}
            >
              <h4>{section.title}</h4>
              <span className={`form-section-toggle ${isCollapsed ? 'collapsed' : ''}`}>
                ▼
              </span>
            </div>
            {!isCollapsed && (
              <div className="form-section-content">
                {section.fields.map(renderField)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
