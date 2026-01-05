# Guía de Embebido - Chat Bubble UI

Esta guía explica cómo embeber el Chat Bubble UI en otra aplicación web.

## 📦 Opciones de Embebido

### Opción 1: Como Componente React (Recomendado)

Si tu aplicación principal es React, puedes importar directamente los componentes:

#### 1. Instalar como dependencia local

```bash
# En tu proyecto principal
npm install ../chat-bubble-ai
```

O publicar en npm y luego:

```bash
npm install @tu-org/chat-bubble-ai
```

#### 2. Importar y usar

```typescript
import { ChatBubble } from '@tu-org/chat-bubble-ai';
import { AuthProvider, ChatProvider } from '@tu-org/chat-bubble-ai';
import type { ChatBubbleConfig } from '@tu-org/chat-bubble-ai';
import '@tu-org/chat-bubble-ai/dist/style.css';

function MyApp() {
  const config: ChatBubbleConfig = {
    darkMode: true,
    header: {
      avatar: { type: 'icon', icon: 'smart_toy' },
      title: 'Support Assistant',
    },
    input: {
      placeholder: 'How can we help?',
    },
  };

  return (
    <div className="my-app">
      <h1>My Application</h1>

      {/* Chat embebido */}
      <AuthProvider>
        <ChatProvider>
          <ChatBubble config={config} />
        </ChatProvider>
      </AuthProvider>
    </div>
  );
}
```

---

### Opción 2: Como Widget Flotante

Para agregar un chat flotante en la esquina de tu página:

#### 1. Build del proyecto

```bash
npm run build
```

Esto genera archivos en `dist/`:
- `index.js` - JavaScript del chat
- `style.css` - Estilos

#### 2. Incluir en tu HTML

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Estilos del chat -->
  <link rel="stylesheet" href="/chat-bubble/style.css">

  <!-- Material Icons -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
</head>
<body>
  <!-- Tu contenido -->
  <div id="app">
    <h1>Mi Sitio Web</h1>
  </div>

  <!-- Contenedor del chat -->
  <div id="chat-bubble-root"></div>

  <!-- Script del chat -->
  <script type="module" src="/chat-bubble/index.js"></script>

  <script type="module">
    // Configuración
    window.ChatBubbleConfig = {
      apiUrl: 'https://api.tudominio.com',
      email: 'user@example.com',
      password: 'secure-password',
      darkMode: true,
    };
  </script>
</body>
</html>
```

#### 3. CSS para Widget Flotante

```css
#chat-bubble-root {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  height: 600px;
  z-index: 9999;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  #chat-bubble-root {
    width: 100%;
    height: 100%;
    bottom: 0;
    right: 0;
    border-radius: 0;
  }
}
```

---

### Opción 3: Como iframe

Si quieres máxima separación entre tu app y el chat:

#### 1. Deploy del chat

Despliega el chat en un subdominio:
```
https://chat.tudominio.com
```

#### 2. Embeber con iframe

```html
<iframe
  src="https://chat.tudominio.com"
  width="400"
  height="600"
  frameborder="0"
  style="position: fixed; bottom: 20px; right: 20px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);"
></iframe>
```

#### 3. Comunicación entre ventanas (opcional)

Si necesitas comunicar el iframe con la página padre:

**En el iframe (chat):**
```typescript
// Enviar mensaje al padre
window.parent.postMessage({
  type: 'chat-event',
  payload: { event: 'message-sent', data: '...' }
}, '*');
```

**En la página padre:**
```javascript
// Escuchar mensajes del chat
window.addEventListener('message', (event) => {
  if (event.data.type === 'chat-event') {
    console.log('Chat event:', event.data.payload);
  }
});

// Enviar comando al chat
const chatIframe = document.querySelector('iframe');
chatIframe.contentWindow.postMessage({
  type: 'chat-command',
  payload: { command: 'clear-messages' }
}, '*');
```

---

## 🔧 Configuración de Variables de Entorno

### Para Desarrollo

```bash
# .env
VITE_API_BASE_URL=http://localhost:5000
VITE_AUTH_EMAIL=dev@example.com
VITE_AUTH_PASSWORD=dev-password
```

### Para Producción

```bash
# .env.production
VITE_API_BASE_URL=https://api.tudominio.com
VITE_AUTH_EMAIL=production-user@domain.com
VITE_AUTH_PASSWORD=secure-production-password
```

### Build para Producción

```bash
# Crear build de producción
npm run build

# Preview del build
npm run preview
```

---

## 🎨 Personalización para Embebido

### Tamaño del Chat

```typescript
const config: ChatBubbleConfig = {
  maxWidth: '400px',  // Ancho del chat
  height: '600px',    // Alto del chat
  className: 'shadow-2xl rounded-xl',
};
```

### Sin Header (Solo mensajes + input)

```typescript
const config: ChatBubbleConfig = {
  header: undefined,  // Sin header
  input: {
    placeholder: 'Type here...',
    showAttachment: false,
  },
};
```

### Modo Compacto

```typescript
const config: ChatBubbleConfig = {
  darkMode: false,
  maxWidth: '320px',
  height: '480px',
  header: {
    avatar: { type: 'icon', icon: 'support' },
    title: 'Help',
    subtitle: undefined,  // Sin subtítulo
    actions: [],          // Sin botones
  },
  input: {
    showAttachment: false,
    showEmoji: false,
    showVoice: false,
    disclaimer: '',
  },
};
```

---

## 🚀 Ejemplo Completo: Widget con Botón Toggle

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/chat-bubble/style.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />

  <style>
    /* Widget container */
    #chat-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    }

    /* Chat bubble */
    #chat-bubble {
      width: 400px;
      height: 600px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      overflow: hidden;
      display: none;
    }

    #chat-bubble.open {
      display: block;
    }

    /* Toggle button */
    #chat-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 28px;
      transition: transform 0.2s;
    }

    #chat-toggle:hover {
      transform: scale(1.1);
    }

    #chat-bubble.open ~ #chat-toggle {
      display: none;
    }

    @media (max-width: 768px) {
      #chat-bubble {
        width: 100vw;
        height: 100vh;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div id="app">
    <h1>Mi Sitio Web</h1>
    <p>Contenido de mi página...</p>
  </div>

  <!-- Chat Widget -->
  <div id="chat-widget">
    <div id="chat-bubble"></div>
    <button id="chat-toggle">
      <span class="material-symbols-outlined">chat</span>
    </button>
  </div>

  <script type="module" src="/chat-bubble/index.js"></script>
  <script>
    const toggleBtn = document.getElementById('chat-toggle');
    const chatBubble = document.getElementById('chat-bubble');

    toggleBtn.addEventListener('click', () => {
      chatBubble.classList.add('open');
    });

    // Botón de cerrar dentro del chat (opcional)
    // Agregar en chatConfig.header.actions un botón con:
    // onClick: () => document.getElementById('chat-bubble').classList.remove('open')
  </script>
</body>
</html>
```

---

## 📱 Responsive Design

El chat es completamente responsive. En móviles:

- Ocupa toda la pantalla (`100vw x 100vh`)
- Botones optimizados para touch
- Input adaptado a teclados virtuales

```css
/* Ya incluido en los estilos del chat */
@media (max-width: 768px) {
  /* Ajustes automáticos */
}
```

---

## 🔐 Seguridad en Producción

### ⚠️ Nunca expongas credenciales en el frontend

Las variables `VITE_AUTH_EMAIL` y `VITE_AUTH_PASSWORD` están bien para desarrollo, pero en producción considera:

#### Opción 1: Token desde Backend

```typescript
// Tu backend genera un token de sesión
const chatToken = await fetch('/api/generate-chat-token', {
  headers: { 'Authorization': `Bearer ${userSessionToken}` }
});

// Pasar el token al chat
import { storage } from '@tu-org/chat-bubble-ai';
storage.setAccessToken(chatToken);
```

#### Opción 2: SSO/OAuth

Integrar con tu sistema de autenticación existente para generar tokens válidos.

#### Opción 3: API Gateway

Usar un API Gateway que maneje la autenticación y solo permita requests autorizados.

---

## 🛠️ Troubleshooting

### El chat no se autentica

1. Verifica que `.env` tenga las credenciales correctas
2. Verifica que `VITE_API_BASE_URL` apunte al servidor correcto
3. Revisa la consola del navegador para errores
4. Verifica que el backend esté corriendo

### Estilos rotos

1. Asegúrate de importar `/dist/style.css`
2. Verifica que Material Icons esté cargado
3. Revisa conflictos con el CSS de tu aplicación

### CORS errors

Si usas iframe o fetch desde otro dominio:

```javascript
// En tu backend
app.use(cors({
  origin: ['https://tu-dominio.com', 'https://chat.tu-dominio.com'],
  credentials: true,
}));
```

---

## 📚 Recursos Adicionales

- [CONFIGURATION.md](./CONFIGURATION.md) - Guía completa de configuración
- [README.md](./README.md) - Documentación general
- [API_DOCUMENTATION.md](./prototypes/API_DOCUMENTATION.md) - Documentación del API backend

---

¿Necesitas ayuda? Abre un issue en el repositorio o consulta la documentación completa.
