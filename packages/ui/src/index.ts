/**
 * @nightlife-os/ui
 * 
 * Wiederverwendbare UI-Komponenten, i18n, Theme für Nightlife OS
 */

// Komponenten
export * from './components/button';
export * from './components/input';
export * from './components/card';
export * from './components/modal';
export * from './components/icon';
export * from './components/loader';
export * from './components/toast';
export * from './components/qr-code-display';
export * from './components/qr-scanner';
export * from './components/voice-recorder-button';
export * from './components/ephemeral-image-bubble';
export * from './components/video-recorder-button'; // Phase 6
export * from './components/poll-bubble'; // Phase 6
export * from './components/notification-bubble'; // Phase 6
export * from './components/notification-list-item'; // Phase 7

// Utils
export * from './utils/cn';

// Theme
export * from './theme/colors';
export * from './theme/typography';
export * from './theme/tailwind-preset';

// Lokalisierungen (JSON-Files müssen manuell importiert werden)
// import de from '@nightlife-os/ui/locales/de.json';
