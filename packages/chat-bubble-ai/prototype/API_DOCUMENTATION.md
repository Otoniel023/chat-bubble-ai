# API Documentation

Documentación de la API de Agentes con autenticación mediante Supabase.

## Base URL

```
http://localhost:5000
```

## Tabla de Contenidos

- [Autenticación](#autenticación)
  - [Registro de Usuario](#registro-de-usuario)
  - [Inicio de Sesión](#inicio-de-sesión)
- [Endpoints de Agentes](#endpoints-de-agentes)
  - [Ejecutar Agente](#ejecutar-agente)
  - [Ejecutar Agente con Streaming](#ejecutar-agente-con-streaming)
  - [Ejecutar Agente con Imagen](#ejecutar-agente-con-imagen)

---

## Autenticación

Los endpoints de autenticación permiten registrar usuarios y obtener tokens JWT de Supabase. Estos tokens son necesarios para acceder a los endpoints de agentes.

### Registro de Usuario

Crea un nuevo usuario en Supabase y devuelve tokens de acceso.

**Endpoint:** `POST /auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña_segura"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "v1.MjAxNi0wMS0wMVQwMDowMDowMFo...",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Email y password son requeridos"
}
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña_segura"
  }'
```

---

### Inicio de Sesión

Autentica un usuario existente y devuelve tokens JWT de Supabase.

**Endpoint:** `POST /auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña_segura"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "v1.MjAxNi0wMS0wMVQwMDowMDowMFo...",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Credenciales inválidas"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Email y password son requeridos"
}
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña_segura"
  }'
```

---

## Endpoints de Agentes

Los endpoints de agentes permiten interactuar con el sistema de IA. **Todos los endpoints de agentes requieren autenticación mediante un token JWT en el header Authorization.**

### Headers de Autenticación

Todos los endpoints de agentes requieren el siguiente header:

```
Authorization: Bearer {accessToken}
```

Donde `{accessToken}` es el token obtenido en `/auth/login` o `/auth/register`.

---

### Ejecutar Agente

Ejecuta el agente con una consulta de texto y devuelve la respuesta completa.

**Endpoint:** `POST /agents/run`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "message": "¿Cuál es la capital de Francia?"
}
```

**Response (200 OK):**
```json
{
  "message": "La capital de Francia es París.",
  "success": true,
  "error": null
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Message is required"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Token no válido o no proporcionado"
}
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:5000/agents/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "message": "¿Cuál es la capital de Francia?"
  }'
```

**Ejemplo con JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:5000/agents/run', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    message: '¿Cuál es la capital de Francia?'
  })
});

const data = await response.json();
console.log(data.message);
```

---

### Ejecutar Agente con Streaming

Ejecuta el agente y devuelve la respuesta en tiempo real usando Server-Sent Events (SSE).

**Endpoint:** `POST /agents/run-stream`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "message": "Explícame la teoría de la relatividad"
}
```

**Response (200 OK):**

La respuesta se envía mediante Server-Sent Events (SSE) con Content-Type `text/event-stream`:

```
data: La
data: teoría
data: de
data: la
data: relatividad
data: ...
data: [DONE]
```

Cada chunk de texto se envía como un evento `data:` separado. El stream termina con `data: [DONE]`.

**Response (400 Bad Request):**
```json
{
  "error": "Message is required"
}
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:5000/agents/run-stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "message": "Explícame la teoría de la relatividad"
  }' \
  --no-buffer
```

**Ejemplo con JavaScript (EventSource):**
```javascript
// Nota: EventSource no soporta POST directamente, usa fetch con streams
const response = await fetch('http://localhost:5000/agents/run-stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    message: 'Explícame la teoría de la relatividad'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.substring(6);
      if (data === '[DONE]') {
        console.log('Stream completed');
        break;
      }
      console.log(data);
    }
  }
}
```

---

### Ejecutar Agente con Imagen

Ejecuta el agente con una imagen en base64 para análisis visual.

**Endpoint:** `POST /agents/run-image`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "message": "¿Qué hay en esta imagen?",
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
  "imageMimeType": "image/png"
}
```

**Campos:**
- `message` (string, requerido): Pregunta o instrucción sobre la imagen
- `imageBase64` (string, requerido): Imagen codificada en base64
- `imageMimeType` (string, requerido): Tipo MIME de la imagen (ej: `image/png`, `image/jpeg`, `image/gif`, `image/webp`)

**Response (200 OK):**
```json
{
  "message": "En la imagen se puede observar un gato sentado en un sofá.",
  "success": true,
  "error": null
}
```

**Response (400 Bad Request):**
```json
{
  "error": "ImageBase64 is required"
}
```

o

```json
{
  "error": "Invalid base64 image data"
}
```

**Ejemplo con cURL:**
```bash
# Primero, codifica la imagen en base64
IMAGE_BASE64=$(base64 -w 0 imagen.png)

curl -X POST http://localhost:5000/agents/run-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d "{
    \"message\": \"¿Qué hay en esta imagen?\",
    \"imageBase64\": \"$IMAGE_BASE64\",
    \"imageMimeType\": \"image/png\"
  }"
```

**Ejemplo con JavaScript (fetch):**
```javascript
// Convertir archivo a base64
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remover el prefijo "data:image/png;base64,"
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// Usar el endpoint
const file = document.querySelector('input[type="file"]').files[0];
const imageBase64 = await fileToBase64(file);

const response = await fetch('http://localhost:5000/agents/run-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    message: '¿Qué hay en esta imagen?',
    imageBase64: imageBase64,
    imageMimeType: file.type
  })
});

const data = await response.json();
console.log(data.message);
```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - La solicitud fue exitosa |
| 400 | Bad Request - Error en los datos enviados |
| 401 | Unauthorized - Token inválido o no proporcionado |
| 500 | Internal Server Error - Error del servidor |

---

## Modelos de Datos

### LoginRequest / RegisterRequest
```typescript
{
  email: string;
  password: string;
}
```

### AuthResponse
```typescript
{
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
}
```

### AgentRequest
```typescript
{
  message: string;
  imageBase64?: string;    // Opcional, solo para /agents/run-image
  imageMimeType?: string;  // Opcional, solo para /agents/run-image
}
```

### AgentResponse
```typescript
{
  message: string;
  success: boolean;
  error?: string;
}
```

---

## Notas Importantes

1. **Autenticación**: Todos los endpoints bajo `/agents` requieren un token JWT válido en el header `Authorization`.

2. **Tokens**: Los tokens de acceso tienen un tiempo de expiración. Usa el `refreshToken` para obtener nuevos tokens cuando sea necesario.

3. **Streaming**: El endpoint `/agents/run-stream` usa Server-Sent Events (SSE) para enviar la respuesta en tiempo real.

4. **Imágenes**: El endpoint `/agents/run-image` acepta imágenes en formato base64. Asegúrate de especificar correctamente el `imageMimeType`.

5. **CORS**: Asegúrate de que el servidor tenga configurado CORS correctamente si accedes desde un dominio diferente.

---

## Ejemplos de Integración Completa

### Flujo de Autenticación y Uso del Agente

```javascript
// 1. Registrar usuario (o hacer login si ya existe)
const authResponse = await fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@ejemplo.com',
    password: 'contraseña_segura'
  })
});

const { accessToken } = await authResponse.json();

// 2. Usar el agente con el token
const agentResponse = await fetch('http://localhost:5000/agents/run', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    message: '¿Cuál es la capital de Francia?'
  })
});

const result = await agentResponse.json();
console.log(result.message); // "La capital de Francia es París."
```

---

## Configuración del Agente

El agente se configura mediante el modelo `AgentConfig`:

```csharp
{
  OllamaUrl: "http://localhost:11434/",
  AssistantAgent: "ministral-3",
  ToolAgent: string,
  AgentName: "OllamaAgent",
  Instructions: "You are a useful agent"
}
```

Esta configuración se define en `appsettings.json` o variables de entorno.
