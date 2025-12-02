/**
 * @nightlife-os/core
 * 
 * Zentrale Logik, Firebase-Integration, Hooks, Utils für Nightlife OS
 */

// Firebase
export * from './firebase/init';
export * from './firebase/auth';
export * from './firebase/firestore';
export * from './firebase/storage';

// Hooks
export * from './hooks/use-auth';
export * from './hooks/use-user-data';
export * from './hooks/use-club-state';
export * from './hooks/use-friends';
export * from './hooks/use-chats';
export * from './hooks/use-chat-messages';
export * from './hooks/use-i18n';
export * from './hooks/use-check-in';
export * from './hooks/use-unread-messages'; // Phase 6
export * from './hooks/use-notifications'; // Phase 7

// Notifications (Phase 7)
export * from './notifications/notification-dispatcher';

// Utils
export * from './utils/friend-code';
export * from './utils/trust-score';
export * from './utils/validation';
export * from './utils/date-time';
export * from './utils/qr';
export * from './utils/storage';

// Constants
export * from './constants/roles';
export * from './constants/permissions';
export * from './constants/app-config';
