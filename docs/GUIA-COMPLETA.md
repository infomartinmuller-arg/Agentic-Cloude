# Guía Completa - WhatsApp Calendar Assistant

> Documento maestro con toda la información del proyecto, configuración y pasos de implementación.

---

## 1. Resumen del Proyecto

Un asistente personal de calendario por WhatsApp que permite a los usuarios gestionar su Google Calendar usando lenguaje natural en español rioplatense (argentino).

**Stack tecnológico:**

| Servicio | Rol | Detalle |
|----------|-----|---------|
| **Evolution API** | Canal WhatsApp | Envío/recepción de mensajes via API REST |
| **n8n** | Orquestador | 3 workflows que coordinan todo el flujo |
| **OpenAI GPT-4o** | NLU (comprensión) | Interpreta mensajes y extrae intención + datos |
| **Google Calendar API** | Calendario | CRUD de eventos |
| **Google Sheets** | Base de datos | Almacena usuarios, tokens y estado de conversación |

---

## 2. Arquitectura del Sistema

```
┌─────────────┐     Webhook POST      ┌────────────────────────────────────┐
│  WhatsApp   │ ──────────────────────→│  Workflow 01 - Main                │
│  (usuario)  │                        │                                    │
│             │ ←──────────────────────│  1. Extract Message                │
│             │     Evolution API      │  2. Lookup User (Sheets)           │
└─────────────┘     sendText           │  3. Check Auth                     │
                                       │  4. Refresh Token (si expirado)    │
                                       │  5. Build AI Context               │
                                       │  6. Call OpenAI GPT-4o             │
                                       │  7. Route by Intent                │
                                       │  8. Google Calendar API            │
                                       │  9. Update User State (Sheets)     │
                                       │ 10. Send WhatsApp Reply            │
                                       └────────────────────────────────────┘

┌─────────────┐     GET callback       ┌────────────────────────────────────┐
│  Navegador  │ ──────────────────────→│  Workflow 02 - OAuth Callback      │
│  (usuario)  │                        │                                    │
│             │ ←──────────────────────│  1. Validate params                │
│             │     HTML response      │  2. Exchange code → tokens         │
└─────────────┘                        │  3. Save tokens (Sheets)           │
                                       │  4. Send success msg (WhatsApp)    │
                                       │  5. Return HTML page               │
                                       └────────────────────────────────────┘

                    Cada 45 min        ┌────────────────────────────────────┐
              ┌───────────────────────→│  Workflow 03 - Token Refresh       │
              │     (schedule)         │                                    │
              │                        │  1. Read all users                 │
              └────────────────────────│  2. Filter expiring (< 10 min)    │
                                       │  3. Batch refresh tokens           │
                                       │  4. Save to Sheets                 │
                                       └────────────────────────────────────┘
```

---

## 3. Credenciales y Servicios Requeridos

> **IMPORTANTE**: Nunca guardes credenciales en el código. Usá variables de entorno en n8n.

### 3.1 Evolution API (WhatsApp)

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `EVOLUTION_API_URL` | URL base de tu instancia | Tu servidor Evolution API |
| `EVOLUTION_API_KEY` | API Key de autenticación | Panel de Evolution API → Settings |
| `EVOLUTION_INSTANCE` | Nombre de la instancia WhatsApp | Panel de Evolution API → Instances |
| `EVOLUTION_WHATSAPP_JID` | Número en formato JID | `<número>@s.whatsapp.net` |

**Configuración del Webhook en Evolution API:**
- URL: `https://<tu-n8n>/webhook/Asistente personal`
- Método: POST
- Eventos: `MESSAGES_UPSERT`

### 3.2 OpenAI

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `OPENAI_API_KEY` | API Key de OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

**Modelo usado:** `gpt-4o` con `temperature: 0.1` y `response_format: json_object`

### 3.3 Google Cloud (OAuth + Calendar)

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `GOOGLE_CLIENT_ID` | Client ID de OAuth 2.0 | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | Client Secret de OAuth 2.0 | Google Cloud Console → Credentials |

**Configuración en Google Cloud Console:**
1. Crear proyecto en [console.cloud.google.com](https://console.cloud.google.com)
2. Habilitar APIs:
   - Google Calendar API
   - Google Sheets API
3. Crear credenciales OAuth 2.0:
   - Tipo: Web Application
   - Authorized redirect URI: `https://<tu-n8n>/webhook/google-oauth-callback`
4. Configurar pantalla de consentimiento OAuth:
   - Scopes: `calendar`, `calendar.events`
   - Estado: Testing (agregar emails de prueba) o Production

### 3.4 Google Sheets

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `GOOGLE_SHEET_ID` | ID del spreadsheet | URL del Sheet: `docs.google.com/spreadsheets/d/<ESTE_ID>/edit` |

### 3.5 n8n

| Variable | Descripción |
|----------|-------------|
| `N8N_BASE_URL` | URL pública de tu instancia n8n (ej: `https://n8n.tudominio.com`) |

---

## 4. Archivos del Proyecto

```
Agentic-Cloude/
├── .env.example                          # Template de variables de entorno
├── .gitignore                            # Excluye .env y archivos sensibles
├── README.md                             # Documentación general
├── docs/
│   └── GUIA-COMPLETA.md                  # ← Este documento
├── prompts/
│   └── system-prompt.md                  # System prompt para OpenAI
└── workflows/
    ├── 01-main-workflow.json             # Workflow principal
    ├── 02-oauth-callback.json            # OAuth callback
    └── 03-token-refresh.json             # Refresh automático de tokens
```

---

## 5. Google Sheets - Estructura

Crear una Google Sheet con una hoja llamada **"Users"** con estas columnas (fila 1 = headers):

| # | Columna | Tipo | Ejemplo | Descripción |
|---|---------|------|---------|-------------|
| A | `chat_id` | string | `5493437527193@s.whatsapp.net` | Identificador único del usuario (WhatsApp JID) |
| B | `phone_number` | string | `5493437527193` | Número de teléfono sin sufijo |
| C | `push_name` | string | `Martín` | Nombre del contacto en WhatsApp |
| D | `state` | string | `active` | Estado: `pending_auth` / `active` / `token_error` |
| E | `access_token` | string | `ya29.a0AfH6SM...` | Token de acceso de Google (expira en ~1h) |
| F | `refresh_token` | string | `1//0eXxXxXx...` | Token de refresh (permanente) |
| G | `token_expiry` | string | `2026-02-18T21:30:00.000Z` | Fecha de expiración del access_token |
| H | `timezone` | string | `America/Argentina/Buenos_Aires` | Zona horaria del usuario |
| I | `pending_action` | string | `CREATE` | Intent pendiente (multi-turn) |
| J | `pending_data` | string | `{"summary":"Reunión"}` | Datos acumulados en JSON |
| K | `last_ai_response` | string | `¿A qué hora?` | Última pregunta del bot |
| L | `turn_count` | number | `1` | Contador de turnos en la conversación actual |
| M | `created_at` | string | `2026-02-18T15:00:00.000Z` | Fecha de registro |

---

## 6. Flujo de Intents (cómo responde la IA)

| Intent | Trigger (ejemplo) | Acción del sistema |
|--------|-------------------|-------------------|
| `CREATE` | "Agendame una reunión mañana a las 10" | Crea evento en Google Calendar |
| `QUERY` | "¿Qué tengo para hoy?" | Consulta eventos y los lista |
| `UPDATE` | "Moveme la reunión al jueves" | Busca evento por keyword y lo modifica |
| `DELETE` | "Cancelame la reunión de mañana" | Busca evento y lo elimina |
| `GENERAL` | "Hola" / "Gracias" / "Cancelar" | Responde conversacionalmente |

### Multi-turn (conversación de varios pasos)

Si el usuario dice algo incompleto como _"Poneme algo para el viernes"_, el sistema:
1. Detecta campos faltantes (`summary`, `start_datetime`)
2. Pregunta: _"Dale, para el viernes. ¿Qué evento querés agendar y a qué hora?"_
3. Guarda el estado en Google Sheets (`pending_action`, `pending_data`)
4. Cuando el usuario responde, integra los datos y completa la acción

---

## 7. Próximos Pasos (¿Qué Sigue?)

### Paso 1: Configurar Variables de Entorno en n8n
Ir a **Settings → Variables** en n8n y crear cada variable:
- `EVOLUTION_API_URL`
- `EVOLUTION_API_KEY`
- `EVOLUTION_INSTANCE`
- `OPENAI_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_SHEET_ID`
- `N8N_BASE_URL`

### Paso 2: Crear la Google Sheet
1. Crear nueva Google Sheet
2. Renombrar la primera hoja a **"Users"**
3. Agregar los headers de la sección 5 en la fila 1
4. Copiar el Sheet ID de la URL y guardarlo como `GOOGLE_SHEET_ID`

### Paso 3: Configurar Google Cloud
1. Crear proyecto en Google Cloud Console
2. Habilitar Google Calendar API y Google Sheets API
3. Crear credenciales OAuth 2.0 (tipo Web Application)
4. Agregar redirect URI: `https://<tu-n8n>/webhook/google-oauth-callback`
5. Configurar pantalla de consentimiento (agregar tu email como tester)

### Paso 4: Importar Workflows en n8n
1. Ir a n8n → Import Workflow
2. Importar `workflows/01-main-workflow.json`
3. Importar `workflows/02-oauth-callback.json`
4. Importar `workflows/03-token-refresh.json`
5. En cada workflow, verificar que los nodos de Google Sheets tengan las credenciales de Google configuradas (n8n pide conectar la cuenta de Google Sheets la primera vez)

### Paso 5: Configurar Evolution API Webhook
1. En el panel de Evolution API, ir a la instancia
2. Configurar webhook:
   - **URL**: `https://<tu-n8n>/webhook/Asistente personal`
   - **Events**: `MESSAGES_UPSERT`
   - **Enabled**: true

### Paso 6: Activar Workflows
1. Activar los 3 workflows en n8n (toggle ON)
2. El workflow 03 empezará a correr automáticamente cada 45 minutos

### Paso 7: Probar
1. Enviar un mensaje desde WhatsApp al número conectado
2. El bot debería responder con el link de OAuth para conectar Google Calendar
3. Autorizar en el navegador
4. Recibir mensaje de confirmación
5. Probar: _"¿Qué tengo para hoy?"_ o _"Agendame una reunión mañana a las 10"_

---

## 8. Troubleshooting

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| No recibe mensajes | Webhook de Evolution API mal configurado | Verificar URL y que el workflow 01 esté activo |
| "Conectá tu Google Calendar" en loop | OAuth redirect URI no coincide | Verificar que el redirect URI en Google Cloud sea exacto |
| Token error al crear eventos | Access token expirado | Verificar que el workflow 03 esté activo y corriendo |
| Respuestas lentas | OpenAI timeout | Verificar API key y que tengas créditos en OpenAI |
| "No encontré el evento" | search_query no matchea | El usuario debe dar más contexto (nombre del evento, fecha) |
| Error en Google Sheets | Credenciales de Google en n8n | Reconectar la cuenta de Google en los nodos de Sheets |

---

## 9. Mejoras Futuras (Opcionales)

- [ ] **Recordatorios**: Agregar notificaciones previas a eventos
- [ ] **Audio**: Transcripción de mensajes de voz con Whisper API
- [ ] **Múltiples calendarios**: Permitir elegir en cuál calendario crear eventos
- [ ] **Idiomas**: Soporte para otros idiomas además de español
- [ ] **Base de datos real**: Migrar de Google Sheets a PostgreSQL/Supabase para escalabilidad
- [ ] **Rate limiting**: Control de mensajes por usuario para evitar abuso
- [ ] **Logs centralizados**: Dashboard de monitoreo de uso y errores
