# Guía de Integración del Widget de Chat

Esta guía te muestra cómo integrar el chat bubble como un widget flotante en cualquier sitio web.

## 🚀 Inicio Rápido

### 1. Build del Widget

```bash
npm run build
```

Esto generará los archivos necesarios en la carpeta `dist/`:

- `embedded.html` - Página del widget
- `assets/embedded-*.js` - JavaScript del widget
- `assets/embedded-*.css` - Estilos del widget

### 2. Copiar Archivos

Copia los siguientes archivos de `dist/` a tu servidor web:

- `assets/embedded-*.js`
- `assets/embedded-*.css`
- Todos los archivos en `assets/` que comiencen con `embedded-`

### 3. Integrar en tu Sitio Web

Agrega el siguiente código a tu HTML:

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Material Icons (requerido) -->
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
    />

    <!-- Estilos del widget -->
    <link rel="stylesheet" href="/path/to/embedded-*.css" />
  </head>
  <body>
    <!-- Tu contenido -->
    <h1>Mi Sitio Web</h1>

    <!-- Contenedor del widget -->
    <div id="chat-widget-root"></div>

    <!-- Configuración (opcional) -->
    <script>
      window.ChatBubbleConfig = {
        darkMode: true,
        showNotificationBadge: false,
        notificationCount: 0,
      };
    </script>

    <!-- Script del widget -->
    <script type="module" src="/path/to/embedded-*.js"></script>
  </body>
</html>
```

---

## ⚙️ Opciones de Configuración

Puedes configurar el widget mediante el objeto `window.ChatBubbleConfig`:

```javascript
window.ChatBubbleConfig = {
  // Modo oscuro (default: true)
  darkMode: true,

  // Mostrar badge de notificaciones (default: false)
  showNotificationBadge: true,

  // Número de notificaciones sin leer (default: 0)
  notificationCount: 5,

  // URL del API (opcional, usa variables de entorno por defecto)
  apiUrl: "https://api.tudominio.com",

  // Credenciales (NO recomendado en producción)
  email: "user@example.com",
  password: "password",
};
```

> **⚠️ Seguridad**: No incluyas credenciales en el frontend en producción. Usa tokens de sesión generados por tu backend.

---

## 🎨 Personalización de Estilos

El widget usa las siguientes clases CSS que puedes personalizar:

```css
/* Cambiar colores del botón flotante */
.chat-toggle-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Cambiar posición del widget */
.chat-widget-container {
  bottom: 20px;
  right: 20px;
}

/* Cambiar tamaño del chat */
.chat-bubble-container {
  width: 400px;
  height: 600px;
}
```

---

## 📱 Responsive Design

El widget es completamente responsive:

- **Desktop**: Aparece como un chat flotante de 400x600px
- **Mobile**: Ocupa toda la pantalla cuando se abre

---

## 🔧 Integración Avanzada

### Comunicación con el Widget

Puedes comunicarte con el widget mediante eventos personalizados:

```javascript
// Abrir el chat programáticamente
document.querySelector(".chat-toggle-button").click();

// Escuchar cuando el chat se abre/cierra
document.addEventListener("chatStateChanged", (event) => {
  console.log("Chat is open:", event.detail.isOpen);
});
```

### Integración con Frameworks

#### React

```jsx
import { useEffect } from "react";

function MyApp() {
  useEffect(() => {
    // Configurar el widget
    window.ChatBubbleConfig = {
      darkMode: true,
      showNotificationBadge: true,
      notificationCount: 3,
    };

    // Cargar el script del widget
    const script = document.createElement("script");
    script.src = "/path/to/embedded-*.js";
    script.type = "module";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div>Mi App</div>;
}
```

#### Vue

```vue
<template>
  <div>
    <h1>Mi App</h1>
    <div id="chat-widget-root"></div>
  </div>
</template>

<script>
export default {
  mounted() {
    window.ChatBubbleConfig = {
      darkMode: true,
    };

    const script = document.createElement("script");
    script.src = "/path/to/embedded-*.js";
    script.type = "module";
    document.body.appendChild(script);
  },
};
</script>
```

---

## 🐛 Troubleshooting

### El widget no aparece

1. Verifica que Material Icons esté cargado
2. Revisa la consola del navegador para errores
3. Asegúrate de que el div `#chat-widget-root` existe

### Conflictos de estilos

1. El widget usa z-index: 9999
2. Usa clases CSS específicas para evitar conflictos
3. Revisa que no haya CSS global sobrescribiendo los estilos

### Problemas de autenticación

1. Verifica las variables de entorno en `.env`
2. Asegúrate de que el backend esté corriendo
3. Revisa la configuración de CORS en el backend

---

## 📚 Recursos Adicionales

- [EMBEDDING.md](./EMBEDDING.md) - Guía completa de embebido
- [CONFIGURATION.md](./CONFIGURATION.md) - Configuración detallada
- [example-integration.html](./example-integration.html) - Ejemplo funcional

---

## 🆘 Soporte

¿Necesitas ayuda? Abre un issue en el repositorio o consulta la documentación completa.
