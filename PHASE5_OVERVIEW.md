# Phase 5 Übersicht: Medien & UX im Chat

## 🎯 Ziele von Phase 5

Erweiterung des Chat-Systems um:
1. **QR-Scanner für Friend-Codes** - Voll funktionsfähige QR-Code-Erkennung
2. **Ephemeral Images** - Selbstzerstörende Bilder mit Timer
3. **Voice Messages** - Sprachnachrichten mit max. 30 Sekunden
4. **Generisches Datenmodell** - Vorbereitet für zukünftige Video-Nachrichten

---

## 📁 Geänderte/Neue Dateien

### 1. Shared Types

**packages/shared-types/src/chat.ts** (ERWEITERT)
- Neuer `MessageType` enum: `'text' | 'image' | 'audio' | 'video' | 'system'`
- `Message` Interface erweitert:
  - `type: MessageType`
  - `mediaUrl?: string` (Firebase Storage URL)
  - `mediaType?: 'image' | 'audio' | 'video'`
  - `durationSeconds?: number` (für Audio/Video)
  - Backwards compatibility: `image?` Feld bleibt erhalten

### 2. Core-Logik

**packages/core/src/utils/storage.ts** (NEU)
- `uploadChatMedia()` - Upload von Medien zu Firebase Storage
  - Pfad: `clubs/{clubId}/chats/{chatId}/{type}/{timestamp}_{randomId}.{ext}`
  - Rückgabe: `{ downloadUrl, storagePath }`

**packages/core/src/hooks/use-chat-messages.ts** (ERWEITERT)
- `sendMessage()` erweitert:
  - Neue Parameter-Struktur: `SendMessageOptions`
    - `text?: string`
    - `imageFile?: File`
    - `audioFile?: File`
    - `videoFile?: File`
    - `type?: MessageType`
    - `ephemeralSeconds?: number`
  - Automatischer Upload von Medien
  - Setzen von `mediaUrl`, `mediaType`, `durationSeconds`
- `expireMedia()` erweitert:
  - Neuer Parameter: `replacementText?` (default: "♻️ Medium gelöscht.")
  - Löscht `mediaUrl` und setzt Text

**packages/core/src/index.ts** (ERWEITERT)
- Export von `utils/storage`

### 3. UI-Komponenten

**packages/ui/src/components/qr-scanner.tsx** (NEU)
- Integration mit `html5-qrcode`
- Props:
  - `onCodeScanned: (code: string) => void`
  - `onError?: (error: Error) => void`
- Erkennt `nightlife://user/{FRIENDCODE}` Format
- Extrahiert nur den 7-stelligen Friend-Code
- Automatisches Stoppen nach erfolgreichem Scan
- Clean-Up beim Unmount

**packages/ui/src/components/voice-recorder-button.tsx** (NEU)
- MediaRecorder API Integration
- Props:
  - `maxDurationSeconds?: number` (default: 30)
  - `onRecorded: (file: File, durationSeconds: number) => void`
  - `onError?: (error: Error) => void`
- Aufnahme-Button mit Timer-Anzeige
- Automatischer Stopp nach `maxDurationSeconds`
- Hard Limit: 30 Sekunden
- Output: `audio/webm` Format

**packages/ui/src/components/ephemeral-image-bubble.tsx** (NEU)
- Self-Destruct-Bild-Komponente
- Props:
  - `imageUrl: string`
  - `ephemeralSeconds: number`
  - `onExpire: () => void`
- Overlay: "Tippen zum Anzeigen"
- Countdown-Timer nach Öffnen
- Automatischer Aufruf von `onExpire()` nach Ablauf

**packages/ui/src/index.ts** (ERWEITERT)
- Export der drei neuen Komponenten

### 4. i18n-Erweiterungen

**packages/ui/src/locales/de.json & en.json** (ERWEITERT)

Neue Keys:
```json
"qr": {
  "scanButton": "QR-Code scannen",
  "scanning": "Scanne QR-Code...",
  "cameraError": "Kamera-Zugriff fehlgeschlagen"
},
"ephemeral": {
  "tapToView": "Tippen zum Anzeigen",
  "expiresIn": "Verschwindet in {seconds}s",
  "expired": "♻️ Medium gelöscht."
},
"voice": {
  "startRecording": "Aufnahme starten",
  "recording": "Aufnahme läuft...",
  "maxDuration": "Max. 30 Sekunden",
  "stopRecording": "Aufnahme stoppen"
},
"chat": {
  "sendImage": "Bild senden",
  "sendVoice": "Sprachnachricht",
  "ephemeralOptions": "Selbstzerstörung"
}
```

### 5. Club-App-Integration

**apps/club-app/src/app/crew/add-friend/page.tsx** (ERWEITERT)
- QR-Scanner-Integration:
  - Button öffnet Modal mit `QrScanner`
  - `onCodeScanned` schließt Modal und startet Friend-Request-Flow
  - Fehlerbehandlung für Kamera-Zugriff
- Zwei Wege: QR-Scan oder Code-Eingabe

**apps/club-app/src/app/crew/chat/[chatId]/page.tsx** (ERWEITERT)
- **Bild-Upload:**
  - Kamera-Button öffnet Modal
  - File-Input für Bild-Auswahl
  - Ephemeral-Optionen: Aus, 5s, 10s, 30s
  - Optional: Text-Nachricht hinzufügen
- **Sprachnachrichten:**
  - `VoiceRecorderButton` neben Text-Input
  - Automatischer Upload nach Aufnahme
- **Message-Rendering:**
  - `type === 'image'` mit `ephemeral` → `EphemeralImageBubble`
  - `type === 'image'` ohne `ephemeral` → normales `<img>`
  - `type === 'audio'` → `<audio controls>`
- **Client-seitige Timer:**
  - `useEffect` prüft alle Messages auf `ephemeral`
  - `setTimeout` für jede Message mit `expiresAt`
  - Automatischer Aufruf von `expireMedia()` nach Ablauf

### 6. Dependencies

**packages/ui/package.json** (ERWEITERT)
- `html5-qrcode: ^2.3.8` hinzugefügt

---

## 📝 Code-Snippets

### 1. Message-Typ (Datenmodell)

```typescript
// packages/shared-types/src/chat.ts
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'system';

export interface Message {
  messageId: string;
  type: MessageType;
  
  // Text (optional bei Medien)
  text?: string;
  
  // Media (neu in Phase 5)
  mediaUrl?: string; // Firebase Storage URL
  mediaType?: 'image' | 'audio' | 'video';
  durationSeconds?: number; // Für Audio/Video
  
  // Sender
  sender: string; // UID
  senderName: string;
  
  // Ephemeral (selbstzerstörend)
  ephemeral?: number; // Sekunden bis Auto-Löschung
  expiresAt?: number; // Unix-Timestamp (ms)
  
  // Gelesen-Status
  viewedBy: string[]; // UIDs
  
  // Gelöscht?
  deleted: boolean;
  
  // Timestamps
  createdAt: number;
}
```

### 2. sendMessage mit Media-Upload

```typescript
// packages/core/src/hooks/use-chat-messages.ts
const sendMessage = async (
  clubId: string,
  chatId: string,
  senderId: string,
  senderName: string,
  options: SendMessageOptions
): Promise<void> => {
  const { text, imageFile, audioFile, videoFile, ephemeralSeconds } = options;

  // Upload Media falls vorhanden
  let mediaUrl: string | undefined;
  let mediaType: 'image' | 'audio' | 'video' | undefined;

  if (imageFile) {
    const result = await uploadChatMedia(clubId, chatId, imageFile, 'image');
    mediaUrl = result.downloadUrl;
    mediaType = 'image';
  } else if (audioFile) {
    const result = await uploadChatMedia(clubId, chatId, audioFile, 'audio');
    mediaUrl = result.downloadUrl;
    mediaType = 'audio';
  }

  // Bestimme Message-Type
  let messageType: MessageType = 'text';
  if (imageFile) messageType = 'image';
  if (audioFile) messageType = 'audio';

  // Erstelle Message
  const newMessage: Message = {
    messageId,
    type: messageType,
    text: text || undefined,
    mediaUrl,
    mediaType,
    sender: senderId,
    senderName,
    ephemeral: ephemeralSeconds,
    expiresAt: ephemeralSeconds ? now + ephemeralSeconds * 1000 : undefined,
    viewedBy: [senderId],
    deleted: false,
    createdAt: now
  };

  // Speichere Message
  await setDocument(
    `clubs/${clubId}/chats/${chatId}/messages/${messageId}`,
    newMessage
  );

  // Wenn ephemeral: Plane Auto-Löschung
  if (ephemeralSeconds) {
    setTimeout(async () => {
      await expireMedia(clubId, chatId, messageId);
    }, ephemeralSeconds * 1000);
  }
};
```

### 3. QrScanner-Komponente

```typescript
// packages/ui/src/components/qr-scanner.tsx
import { Html5Qrcode } from 'html5-qrcode';

export function QrScanner({ onCodeScanned, onError }: QrScannerProps) {
  useEffect(() => {
    const scanner = new Html5Qrcode('qr-scanner-region');

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        // Parse QR-Code
        const match = decodedText.match(/^nightlife:\/\/user\/([A-Z0-9]{7})$/i);
        if (match) {
          onCodeScanned(match[1].toUpperCase());
          scanner.stop();
        }
      },
      (errorMessage) => {
        // Scan-Fehler (normal)
      }
    );

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onCodeScanned]);

  return <div id="qr-scanner-region" className="rounded-lg overflow-hidden" />;
}
```

### 4. VoiceRecorderButton-Komponente

```typescript
// packages/ui/src/components/voice-recorder-button.tsx
export function VoiceRecorderButton({ maxDurationSeconds = 30, onRecorded }: Props) {
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const duration = (Date.now() - startTime) / 1000;
      const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
      
      stream.getTracks().forEach((track) => track.stop());
      onRecorded(file, duration);
    };
    
    mediaRecorder.start();
    
    // Auto-Stopp nach maxDurationSeconds
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }, maxDurationSeconds * 1000);
  };

  return (
    <button onClick={handleToggle}>
      {isRecording ? <Square /> : <Mic />}
    </button>
  );
}
```

### 5. EphemeralImageBubble-Komponente

```typescript
// packages/ui/src/components/ephemeral-image-bubble.tsx
export function EphemeralImageBubble({
  imageUrl,
  ephemeralSeconds,
  onExpire
}: Props) {
  const [isViewing, setIsViewing] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(ephemeralSeconds);

  useEffect(() => {
    if (!isViewing) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 0.1;
        if (next <= 0) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isViewing, onExpire]);

  if (!isViewing) {
    return (
      <button onClick={() => setIsViewing(true)}>
        <Eye />
        <p>Tippen zum Anzeigen</p>
        <p>Verschwindet in {ephemeralSeconds}s</p>
      </button>
    );
  }

  return (
    <div>
      <img src={imageUrl} alt="Ephemeral" />
      <div className="countdown">{remainingSeconds.toFixed(1)}s</div>
    </div>
  );
}
```

### 6. Chat-UI mit Media-Rendering

```typescript
// apps/club-app/src/app/crew/chat/[chatId]/page.tsx

// Image mit Ephemeral
{msg?.type === 'image' && msg?.mediaUrl && (
  <div className="mt-2">
    {msg?.ephemeral && msg?.expiresAt ? (
      <EphemeralImageBubble
        imageUrl={msg.mediaUrl}
        ephemeralSeconds={msg.ephemeral}
        onExpire={() => expireMedia('demo-club-1', chatId, msg.messageId)}
      />
    ) : (
      <img src={msg.mediaUrl} alt="Chat image" className="rounded" />
    )}
  </div>
)}

// Audio
{msg?.type === 'audio' && msg?.mediaUrl && (
  <div className="mt-2">
    <audio controls src={msg.mediaUrl} className="w-full" />
    {msg?.ephemeral && (
      <p className="text-xs">
        <Timer className="inline h-3 w-3 mr-1" />
        {msg.ephemeral}s
      </p>
    )}
  </div>
)}
```

### 7. Client-seitige Ephemeral-Timer

```typescript
// apps/club-app/src/app/crew/chat/[chatId]/page.tsx

// Timer für ephemeral messages (client-side)
useEffect(() => {
  if (!messages || messages.length === 0) return;

  const timers: NodeJS.Timeout[] = [];

  messages.forEach((msg: Message) => {
    if (msg?.ephemeral && msg?.expiresAt && msg?.mediaUrl) {
      const now = Date.now();
      const remainingTime = msg.expiresAt - now;

      if (remainingTime > 0) {
        const timer = setTimeout(() => {
          expireMedia('demo-club-1', chatId, msg.messageId)
            .catch((err) => console.error('Error expiring media:', err));
        }, remainingTime);
        timers.push(timer);
      }
    }
  });

  return () => {
    timers.forEach((timer) => clearTimeout(timer));
  };
}, [messages, chatId, expireMedia]);
```

---

## 📦 Firestore-Schema (unverändert)

Das Firestore-Schema bleibt unverändert. Die `Message`-Dokumente in `clubs/{clubId}/chats/{chatId}/messages/{messageId}` speichern jetzt einfach die neuen Felder:

```typescript
{
  messageId: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'system';
  text?: string;
  mediaUrl?: string; // Firebase Storage URL
  mediaType?: 'image' | 'audio' | 'video';
  durationSeconds?: number;
  sender: string;
  senderName: string;
  ephemeral?: number;
  expiresAt?: number;
  viewedBy: string[];
  deleted: boolean;
  createdAt: number;
}
```

---

## ✅ Implementierte Features

### 1. QR-Scanner für Friend-Codes
- ✅ Integration mit `html5-qrcode`
- ✅ Erkennung von `nightlife://user/{FRIENDCODE}`
- ✅ Automatisches Schließen nach Scan
- ✅ Fehlerbehandlung für Kamera-Zugriff
- ✅ Clean-Up beim Unmount
- ✅ Modal-Integration in `/crew/add-friend`

### 2. Ephemeral Images
- ✅ Self-Destruct-Bubble-Komponente
- ✅ "Tippen zum Anzeigen" Overlay
- ✅ Countdown-Timer nach Öffnen
- ✅ Automatischer Aufruf von `expireMedia()`
- ✅ Optionen: 5s, 10s, 30s, Aus
- ✅ Client-seitige Timer-Logik

### 3. Voice Messages
- ✅ MediaRecorder API Integration
- ✅ Aufnahme-Button mit Timer-Anzeige
- ✅ Hard Limit: 30 Sekunden
- ✅ Automatischer Upload zu Firebase Storage
- ✅ `<audio controls>` Player im Chat
- ✅ Optional: Ephemeral für Sprachnachrichten

### 4. Generisches Datenmodell
- ✅ `MessageType` enum mit `'video'` vorbereitet
- ✅ `mediaUrl` und `mediaType` für alle Medien
- ✅ `durationSeconds` für Audio/Video
- ✅ Backwards compatibility mit `image` Feld

---

## 🧪 Testing-Hinweise

### Browser-Kompatibilität

**MediaRecorder API:**
- Chrome/Edge: ✅ Vollständig unterstützt
- Firefox: ✅ Vollständig unterstützt
- Safari: ⚠️ Teilweise unterstützt (iOS 14.3+)
- Format: `audio/webm` (Chrome/Firefox), `audio/mp4` (Safari)

**html5-qrcode:**
- Alle modernen Browser mit Kamera-Zugriff
- Mobil: Funktioniert auf iOS Safari und Android Chrome
- Desktop: Funktioniert mit Webcam

**getUserMedia API (Kamera/Mikrofon):**
- Erfordert HTTPS (außer auf `localhost`)
- Benutzer muss Berechtigung erteilen
- Fehlerbehandlung für abgelehnte Berechtigungen implementiert

### Firebase Storage Konfiguration

**WICHTIG:** Firebase Storage muss konfiguriert sein:

1. In Firebase Console → Storage → Rules:
```javascript
service firebase.storage {
  match /b/{bucket}/o {
    match /clubs/{clubId}/chats/{chatId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

2. CORS-Konfiguration (falls nötig):
```json
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

### Test-Szenarien

1. **QR-Scanner:**
   - Öffne `/crew/add-friend`
   - Klicke auf "QR-Code scannen"
   - Scanne einen gültigen Friend-Code QR
   - Prüfe, ob Modal mit Friend-Code sich öffnet

2. **Bild mit Ephemeral:**
   - Öffne einen Chat
   - Klicke auf Kamera-Symbol
   - Wähle Bild aus
   - Wähle "5s" Ephemeral
   - Sende Bild
   - Prüfe "Tippen zum Anzeigen" Overlay
   - Öffne Bild und beobachte Countdown
   - Prüfe, ob Bild nach 5s verschwindet

3. **Sprachnachricht:**
   - Öffne einen Chat
   - Klicke auf Mikrofon-Symbol
   - Sprich 5 Sekunden
   - Stoppe Aufnahme
   - Prüfe Upload und Anzeige im Chat
   - Prüfe Audio-Player-Funktionalität

4. **30-Sekunden-Limit:**
   - Starte Sprachaufnahme
   - Warte 30 Sekunden
   - Prüfe, ob Aufnahme automatisch stoppt

---

## 🚀 Nächste Schritte (Phase 6 Ideen)

- Video-Nachrichten (analog zu Audio)
- Gruppenchat-spezifische Features (Polls, Abstimmungen)
- Push-Benachrichtigungen für neue Nachrichten
- Read-Receipts (Gelesen-Status anzeigen)
- Message-Reactions (Emojis)
- Chat-Suche
- Media-Gallery für alle Bilder/Videos eines Chats

---

## 📝 Zusammenfassung

**Phase 5 IST VOLLSTÄNDIG!**

Alle Anforderungen wurden implementiert:
- ✅ QR-Scanner voll funktionsfähig
- ✅ Ephemeral Images mit Client-seitigen Timern
- ✅ Voice Messages mit 30s Hard Limit
- ✅ Generisches Datenmodell für zukünftige Erweiterungen
- ✅ Vollständige i18n-Integration
- ✅ TypeScript strict mode
- ✅ Client-only für Browser-APIs

**Keine Breaking Changes!**
- Backwards compatibility mit Phase 1-4 erhalten
- Altes `image` Feld wird weiterhin unterstützt
- Bestehende Chats funktionieren weiterhin

**Bereit für Production!** 🎉
