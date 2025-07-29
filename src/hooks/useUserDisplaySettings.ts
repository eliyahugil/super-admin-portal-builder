import { useState, useEffect } from 'react';

interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  colorScheme: 'default' | 'blue' | 'green' | 'purple' | 'orange';
  compactMode: boolean;
  language: 'he' | 'en';
  density: 'comfortable' | 'compact' | 'spacious';
  animations: boolean;
}

const defaultSettings: DisplaySettings = {
  theme: 'system',
  fontSize: 15,
  colorScheme: 'default',
  compactMode: false,
  language: 'he',
  density: 'comfortable',
  animations: true
};

export const useUserDisplaySettings = () => {
  const [settings, setSettings] = useState<DisplaySettings>(defaultSettings);

  // טעינת הגדרות מ-localStorage בטעינה הראשונה
  useEffect(() => {
    const savedSettings = localStorage.getItem('userDisplaySettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const mergedSettings = { ...defaultSettings, ...parsed };
        setSettings(mergedSettings);
        applySettings(mergedSettings);
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    } else {
      // אם אין הגדרות שמורות, החל את ברירת המחדל
      applySettings(defaultSettings);
    }
  }, []);

  // החלת הגדרות על ה-DOM
  const applySettings = (settings: DisplaySettings) => {
    const root = document.documentElement;
    
    // גודל גופן
    root.style.fontSize = `${settings.fontSize}px`;
    
    // ערכת צבעים
    if (settings.colorScheme !== 'default') {
      root.setAttribute('data-color-scheme', settings.colorScheme);
    } else {
      root.removeAttribute('data-color-scheme');
    }
    
    // מצב דחוס
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    
    // צפיפות
    root.setAttribute('data-density', settings.density);
    
    // אנימציות
    if (!settings.animations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
    
    // ערכת נושא
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system - השתמש בהעדפות המערכת
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  // עדכון הגדרה
  const updateSetting = <K extends keyof DisplaySettings>(
    key: K, 
    value: DisplaySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    return newSettings;
  };

  // שמירת הגדרות
  const saveSettings = (settingsToSave?: DisplaySettings) => {
    const finalSettings = settingsToSave || settings;
    try {
      localStorage.setItem('userDisplaySettings', JSON.stringify(finalSettings));
      applySettings(finalSettings);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  };

  // איפוס להגדרות ברירת מחדל
  const resetToDefaults = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('userDisplaySettings');
    applySettings(defaultSettings);
  };

  return {
    settings,
    updateSetting,
    saveSettings,
    resetToDefaults,
    applySettings
  };
};