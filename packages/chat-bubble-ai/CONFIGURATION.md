# Chat Bubble UI - Guía de Configuración

Esta guía detalla todas las opciones de configuración disponibles para personalizar completamente tu chat bubble UI.

## Tabla de Contenidos

- [Configuración Básica](#configuración-básica)
- [Tema (Theme)](#tema-theme)
- [Header](#header)
- [Input](#input)
- [Mensajes](#mensajes)
- [Separadores de Fecha](#separadores-de-fecha)
- [Autenticación](#autenticación)
- [Backend API](#backend-api)
- [Ejemplos Completos](#ejemplos-completos)

---

## Configuración Básica

### Estructura Principal

```typescript
import { ChatBubble } from './components/ChatBubble';
import type { ChatBubbleConfig } from './types/chat.types';

const config: ChatBubbleConfig = {
  darkMode: true,           // Tema oscuro/claro
  maxWidth: '100%',         // Ancho máximo del chat
  height: '100vh',          // Altura del chat
  className: '',            // Classes CSS adicionales
  theme: { ... },           // Personalización de tema
  header: { ... },          // Configuración del header
  input: { ... },           // Configuración del input
  dateSeparator: { ... },   // Configuración de separadores
};

<ChatBubble config={config} />
```

### Propiedades Raíz

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `darkMode` | `boolean` | `true` | Activa/desactiva el tema oscuro |
| `maxWidth` | `string` | `'100%'` | Ancho máximo del contenedor (px, %, rem) |
| `height` | `string` | `'100vh'` | Altura del contenedor |
| `className` | `string` | `''` | Clases Tailwind adicionales |
| `theme` | `ThemeConfig` | - | Configuración de tema (ver abajo) |
| `header` | `ChatHeaderConfig` | - | Configuración del header |
| `input` | `ChatInputConfig` | - | Configuración del input |
| `dateSeparator` | `DateSeparatorConfig` | - | Configuración de separadores |

---

## Tema (Theme)

### Configuración Completa

```typescript
theme: {
  // Colores principales
  colors: {
    primary: '#137fec',           // Color principal
    primaryHover: '#0d6edb',      // Color al hacer hover
  },

  // Backgrounds
  backgrounds: {
    light: '#f8fafc',             // Fondo claro
    dark: '#101922',              // Fondo oscuro
    surfaceLight: '#ffffff',      // Tarjetas/superficies modo claro
    surfaceDark: '#1e242b',       // Tarjetas/superficies modo oscuro
  },

  // Colores de texto
  text: {
    primary: '#1e293b',           // Texto principal claro
    secondary: '#64748b',         // Texto secundario claro
    tertiary: '#94a3b8',          // Texto terciario claro
    primaryDark: '#f1f5f9',       // Texto principal oscuro
    secondaryDark: '#cbd5e1',     // Texto secundario oscuro
    tertiaryDark: '#94a3b8',      // Texto terciario oscuro
  },

  // Bordes
  borders: {
    light: '#e2e8f0',             // Borde modo claro
    dark: '#334155',              // Borde modo oscuro
  },

  // Burbujas de mensajes
  messageBubbles: {
    assistant: {
      background: 'bg-surface-light dark:bg-surface-dark',
      text: 'text-text-primary dark:text-white',
      borderRadius: 'rounded-2xl rounded-bl-sm',
      padding: 'px-4 py-3',
      maxWidth: 'max-w-[80%]',
    },
    user: {
      background: 'bg-primary',
      text: 'text-white',
      borderRadius: 'rounded-2xl rounded-br-sm',
      padding: 'px-4 py-3',
      maxWidth: 'max-w-[80%]',
    },
  },

  // Tipografía
  fonts: {
    family: 'system-ui, -apple-system, sans-serif',
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
    },
  },
}
```

### Personalización por Secciones

#### Solo Colores
```typescript
theme: {
  colors: {
    primary: '#FF6B6B',
    primaryHover: '#FF5252',
  }
}
```

#### Solo Fuentes
```typescript
theme: {
  fonts: {
    family: 'Inter, sans-serif',
    sizes: {
      base: '18px',
      lg: '20px',
    }
  }
}
```

#### Personalizar Burbujas
```typescript
theme: {
  messageBubbles: {
    user: {
      background: 'bg-gradient-to-r from-purple-500 to-pink-500',
      text: 'text-white',
      borderRadius: 'rounded-full',
      padding: 'px-6 py-4',
    }
  }
}
```

---

## Header

### Configuración Completa

```typescript
header: {
  // Avatar
  avatar: {
    type: 'icon' | 'image' | 'text',

    // Para type: 'icon'
    icon: 'smart_toy',                    // Material icon name

    // Para type: 'image'
    src: '/path/to/image.png',            // URL de la imagen
    alt: 'Bot Avatar',                    // Texto alternativo

    // Para type: 'text'
    text: 'AI',                           // Texto a mostrar (2 chars max)

    // Común para todos los tipos
    backgroundColor: 'bg-primary/20',     // Color de fondo
    textColor: 'text-primary',            // Color de texto/icono
    size: 'w-10 h-10',                    // Tamaño del avatar
    showOnlineStatus: true,               // Mostrar indicador online
  },

  // Título y subtítulo
  title: 'Virtual Assistant',
  subtitle: 'Always here to help',
  titleClassName: 'text-lg font-semibold',
  subtitleClassName: 'text-sm text-text-secondary',

  // Botones de acción
  actions: [
    {
      id: 'settings',
      icon: 'settings',                   // Material icon
      ariaLabel: 'Settings',
      onClick: () => console.log('Settings'),
      visible: true,                      // Mostrar/ocultar
    },
    {
      id: 'delete',
      icon: 'delete',
      ariaLabel: 'Delete conversation',
      onClick: () => {},
      visible: true,
    },
  ],
}
```

### Ejemplos de Avatar

#### Avatar con Icono
```typescript
avatar: {
  type: 'icon',
  icon: 'support_agent',
  backgroundColor: 'bg-blue-500/20',
  textColor: 'text-blue-500',
  showOnlineStatus: true,
}
```

#### Avatar con Imagen
```typescript
avatar: {
  type: 'image',
  src: 'https://example.com/avatar.png',
  alt: 'Company Bot',
  showOnlineStatus: false,
}
```

#### Avatar con Texto
```typescript
avatar: {
  type: 'text',
  text: 'AB',
  backgroundColor: 'bg-purple-500',
  textColor: 'text-white',
}
```

### Botones Condicionales

```typescript
actions: [
  {
    id: 'logout',
    icon: 'logout',
    ariaLabel: 'Logout',
    onClick: handleLogout,
    visible: isAuthenticated,  // Solo mostrar si está autenticado
  },
]
```

---

## Input

### Configuración Completa

```typescript
input: {
  // Texto
  placeholder: 'Type a message...',
  maxLength: 500,
  disclaimer: 'AI can make mistakes. Consider checking important information.',

  // Botones predeterminados
  showAttachment: true,
  showEmoji: true,
  showVoice: true,
  showSendButton: true,

  // Botones personalizados
  actions: [
    {
      id: 'custom-action',
      icon: 'code',
      ariaLabel: 'Insert code',
      position: 'left' | 'right',
      visible: true,
      onClick: () => {},
    },
  ],
}
```

### Propiedades

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `placeholder` | `string` | `'Type a message...'` | Placeholder del input |
| `maxLength` | `number` | `undefined` | Límite de caracteres |
| `disclaimer` | `string` | Ver arriba | Texto debajo del input |
| `showAttachment` | `boolean` | `true` | Botón de adjuntos |
| `showEmoji` | `boolean` | `true` | Botón de emojis |
| `showVoice` | `boolean` | `true` | Botón de voz |
| `showSendButton` | `boolean` | `true` | Botón de enviar |
| `actions` | `Action[]` | `[]` | Botones personalizados |

### Ejemplos

#### Input Minimalista
```typescript
input: {
  placeholder: 'Message...',
  showAttachment: false,
  showEmoji: false,
  showVoice: false,
  disclaimer: '',
}
```

#### Input con Botones Custom
```typescript
input: {
  placeholder: 'Ask me anything...',
  actions: [
    {
      id: 'templates',
      icon: 'description',
      ariaLabel: 'Use template',
      position: 'left',
      onClick: () => openTemplates(),
    },
    {
      id: 'camera',
      icon: 'photo_camera',
      ariaLabel: 'Take photo',
      position: 'right',
      onClick: () => openCamera(),
    },
  ],
}
```

---

## Mensajes

Los mensajes se manejan automáticamente a través de `ChatContext`, pero puedes personalizar su apariencia.

### Estructura de Mensaje

```typescript
interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
  avatar?: AvatarConfig;           // Avatar personalizado
  senderLabel?: string;            // Etiqueta del remitente
  status?: MessageStatus;          // Estado del mensaje
  error?: string;                  // Mensaje de error
}

type MessageStatus = 'sending' | 'streaming' | 'sent' | 'error';
```

### Personalizar Avatar por Mensaje

```typescript
// En tu componente
const customMessage = {
  id: '1',
  sender: 'assistant',
  content: 'Hello!',
  timestamp: new Date(),
  avatar: {
    type: 'image',
    src: '/special-bot.png',
  },
  senderLabel: 'Support Bot',
};
```

### Estados de Mensaje

- `sending` - Mensaje enviándose
- `streaming` - Respuesta del asistente llegando en tiempo real
- `sent` - Mensaje enviado/recibido correctamente
- `error` - Error al enviar/recibir

---

## Separadores de Fecha

### Configuración

```typescript
dateSeparator: {
  format: 'relative',  // 'relative' | 'full' | 'short'
  className: 'my-custom-class',
}
```

### Formatos Disponibles

| Formato | Ejemplo |
|---------|---------|
| `'relative'` | "Today", "Yesterday", "Dec 25" |
| `'full'` | "Wednesday, December 25, 2024" |
| `'short'` | "12/25/2024" |

### Personalización

```typescript
dateSeparator: {
  className: 'text-xs font-bold text-purple-500',
}
```

---

## Autenticación

### Variables de Entorno

Este chat está diseñado para ser **embebido** en otras aplicaciones, por lo que utiliza **auto-login** mediante credenciales configuradas en el archivo `.env`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Auto-login Credentials (for embedded chat)
VITE_AUTH_EMAIL=user@example.com
VITE_AUTH_PASSWORD=your-password-here

# Optional settings
VITE_ENABLE_PERSISTENCE=true
VITE_MAX_RETRIES=3
```

**Importante:**
- El chat se autenticará automáticamente al cargar usando estas credenciales
- No hay modal de login - la autenticación es transparente para el usuario
- Las credenciales se guardan en `localStorage` para persistir entre sesiones
- Ideal para chats embebidos donde el usuario ya está autenticado en la aplicación padre

### Para Producción

Crea un archivo `.env.production`:

```bash
VITE_API_BASE_URL=https://api.tudominio.com
VITE_AUTH_EMAIL=production-user@domain.com
VITE_AUTH_PASSWORD=secure-production-password
```

### Flujo de Autenticación

1. Al cargar el chat, verifica si hay un token válido en `localStorage`
2. Si existe y es válido, usa ese token
3. Si no existe o expiró, intenta auto-login con `VITE_AUTH_EMAIL` y `VITE_AUTH_PASSWORD`
4. Si el auto-login falla, muestra un error en consola
5. Los mensajes solo se pueden enviar cuando está autenticado

### Seguridad

**⚠️ Consideraciones importantes:**

- Las credenciales en `.env` son para desarrollo y testing
- En producción, considera generar tokens de acceso dinámicamente desde tu backend
- Para aplicaciones embebidas, puedes pasar el token JWT desde la aplicación padre:

```typescript
// Modificar AuthContext.tsx para aceptar token externo
const initWithExternalToken = (token: string) => {
  storage.setAccessToken(token);
  setIsAuthenticated(true);
};
```

### Deshabilitar Auto-login

Si quieres deshabilitar el auto-login, simplemente elimina o comenta las variables en `.env`:

```bash
# VITE_AUTH_EMAIL=user@example.com
# VITE_AUTH_PASSWORD=your-password-here
```

El chat seguirá funcionando si ya hay un token guardado en `localStorage`.

---

## Backend API

### Configuración del Servicio

Los servicios están en `src/services/`:

#### Auth Service (`auth.service.ts`)

```typescript
import { authService } from './services/auth.service';

// Login
await authService.login(email, password);

// Register
await authService.register(email, password);

// Logout
authService.logout();

// Get current user
const user = authService.getCurrentUser();
```

#### Agent Service (`agent.service.ts`)

```typescript
import { agentService } from './services/agent.service';

// Enviar mensaje con streaming
await agentService.sendMessageStream(
  'Hello',
  {
    onChunk: (chunk) => console.log(chunk),
    onComplete: () => console.log('Done'),
    onError: (err) => console.error(err),
  }
);

// Check autenticación
const isAuth = agentService.isAuthenticated();
```

### Personalizar Endpoints

Edita `src/services/auth.service.ts`:

```typescript
// Cambiar endpoint de login
async login(email: string, password: string) {
  return this.apiClient.post<AuthResponse>(
    '/mi-endpoint-custom/login',  // Cambiar aquí
    { email, password }
  );
}
```

### Usar Otro Backend

1. **Cambiar la URL base:**
```bash
# .env
VITE_API_BASE_URL=https://mi-backend.com
```

2. **Adaptar las respuestas:**
```typescript
// En auth.service.ts
async login(email: string, password: string) {
  const response = await this.apiClient.post('/login', { email, password });

  // Adaptar tu respuesta al formato esperado
  return {
    accessToken: response.token,      // Tu campo
    refreshToken: response.refresh,   // Tu campo
    userId: response.user.id,
    email: response.user.email,
  };
}
```

---

## Ejemplos Completos

### Ejemplo 1: Chat Corporativo Minimalista

```typescript
const corporateConfig: ChatBubbleConfig = {
  darkMode: false,
  maxWidth: '600px',
  height: '80vh',

  theme: {
    colors: {
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
    },
    fonts: {
      family: 'Inter, sans-serif',
    },
  },

  header: {
    avatar: {
      type: 'image',
      src: '/company-logo.png',
      showOnlineStatus: false,
    },
    title: 'Support Team',
    subtitle: 'We typically reply in minutes',
    actions: [
      {
        id: 'close',
        icon: 'close',
        ariaLabel: 'Close chat',
        onClick: () => closeChat(),
      },
    ],
  },

  input: {
    placeholder: 'How can we help?',
    showAttachment: true,
    showEmoji: false,
    showVoice: false,
    disclaimer: 'Available Mon-Fri, 9AM-6PM EST',
  },
};
```

### Ejemplo 2: Chat de E-commerce Colorido

```typescript
const ecommerceConfig: ChatBubbleConfig = {
  darkMode: true,

  theme: {
    colors: {
      primary: '#ec4899',
      primaryHover: '#db2777',
    },
    backgrounds: {
      dark: '#1f1f1f',
      surfaceDark: '#2a2a2a',
    },
    messageBubbles: {
      assistant: {
        background: 'bg-gradient-to-r from-purple-600 to-pink-600',
        text: 'text-white',
        borderRadius: 'rounded-3xl',
      },
      user: {
        background: 'bg-gray-700',
        text: 'text-white',
        borderRadius: 'rounded-3xl',
      },
    },
  },

  header: {
    avatar: {
      type: 'icon',
      icon: 'shopping_bag',
      backgroundColor: 'bg-pink-500',
      textColor: 'text-white',
      showOnlineStatus: true,
    },
    title: 'Shopping Assistant',
    subtitle: 'Find your perfect product',
  },

  input: {
    placeholder: 'Ask about products, orders, returns...',
    showAttachment: true,
    showEmoji: true,
    showVoice: true,
  },
};
```

### Ejemplo 3: Chat Educativo

```typescript
const educationConfig: ChatBubbleConfig = {
  darkMode: false,

  theme: {
    colors: {
      primary: '#10b981',
      primaryHover: '#059669',
    },
    backgrounds: {
      light: '#f0fdf4',
      surfaceLight: '#ffffff',
    },
    fonts: {
      family: 'Nunito, sans-serif',
      sizes: {
        base: '16px',
        lg: '18px',
      },
    },
  },

  header: {
    avatar: {
      type: 'icon',
      icon: 'school',
      backgroundColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    title: 'Study Buddy',
    subtitle: 'Ask me anything!',
    actions: [
      {
        id: 'resources',
        icon: 'library_books',
        ariaLabel: 'Learning resources',
        onClick: () => showResources(),
      },
    ],
  },

  input: {
    placeholder: 'What would you like to learn today?',
    maxLength: 1000,
    showVoice: true,
  },
};
```

### Ejemplo 4: Multi-tenancy (Múltiples Proyectos)

```typescript
// config/chatConfigs.ts
export const configs = {
  project1: {
    darkMode: true,
    theme: { colors: { primary: '#3b82f6' } },
    header: { title: 'Project 1 Bot' },
  },

  project2: {
    darkMode: false,
    theme: { colors: { primary: '#ef4444' } },
    header: { title: 'Project 2 Assistant' },
  },
};

// App.tsx
import { configs } from './config/chatConfigs';

function App() {
  const projectId = 'project1'; // Desde .env o contexto
  const config = configs[projectId];

  return <ChatBubble config={config} />;
}
```

---

## Tips de Personalización

### 1. Usar Variables CSS Personalizadas

```typescript
// En config
theme: {
  colors: {
    primary: 'var(--brand-color)',
  }
}

// En tu CSS global
:root {
  --brand-color: #ff6b6b;
}
```

### 2. Responsive Design

```typescript
// Ajustar por tamaño de pantalla
const config: ChatBubbleConfig = {
  maxWidth: window.innerWidth < 768 ? '100%' : '800px',
  height: window.innerWidth < 768 ? '100vh' : '600px',
};
```

### 3. Temas Dinámicos

```typescript
const [theme, setTheme] = useState<'light' | 'dark'>('dark');

const config: ChatBubbleConfig = {
  darkMode: theme === 'dark',
  // ...
};

// Cambiar tema
<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  Toggle Theme
</button>
```

### 4. Internacionalización

```typescript
const translations = {
  en: {
    placeholder: 'Type a message...',
    title: 'Virtual Assistant',
  },
  es: {
    placeholder: 'Escribe un mensaje...',
    title: 'Asistente Virtual',
  },
};

const lang = 'es';

const config: ChatBubbleConfig = {
  header: {
    title: translations[lang].title,
  },
  input: {
    placeholder: translations[lang].placeholder,
  },
};
```

---

## Soporte

Para más información, consulta:
- `src/types/chat.types.ts` - Todas las interfaces TypeScript
- `README.md` - Guía de inicio rápido
- `API_DOCUMENTATION.md` - Documentación del backend

Para reportar bugs o solicitar features, abre un issue en el repositorio.
