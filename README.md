# WhatsApp Calendar Assistant

Asistente de calendario inteligente para WhatsApp que permite gestionar Google Calendar mediante lenguaje natural en español rioplatense.

## Arquitectura

```
WhatsApp (Evolution API) → n8n Webhook → OpenAI GPT-4o → Google Calendar API
                         ↕
                   Google Sheets (user data store)
```

## Componentes

| Archivo | Descripción |
|---------|-------------|
| `workflows/01-main-workflow.json` | Workflow principal: recibe mensajes, procesa con IA, ejecuta acciones en Calendar |
| `workflows/02-oauth-callback.json` | Callback de OAuth: intercambia código por tokens y vincula usuario |
| `workflows/03-token-refresh.json` | Refresh automático de tokens cada 45 minutos |
| `prompts/system-prompt.md` | System prompt para OpenAI con reglas de interpretación y formato JSON |
| `.env.example` | Template de variables de entorno |

## Funcionalidades

- **Crear eventos**: "Agendame una reunión con Pedro mañana a las 10"
- **Consultar agenda**: "¿Qué tengo para hoy?"
- **Modificar eventos**: "Moveme la reunión de las 10 a las 11"
- **Eliminar eventos**: "Borrá mi reunión de mañana"
- **Multi-turn**: Conversaciones de varios pasos cuando falta información
- **OAuth automático**: Vinculación de Google Calendar por usuario

## Requisitos

- [n8n](https://n8n.io) (self-hosted o cloud)
- [Evolution API](https://github.com/EvolutionAPI/evolution-api) v2 con instancia WhatsApp
- Cuenta de Google Cloud con Calendar API habilitada
- API key de OpenAI (modelo gpt-4o)
- Google Sheets para almacenamiento de usuarios

## Setup rápido

1. Copiar `.env.example` a `.env` y completar las credenciales
2. Configurar las variables de entorno en n8n (Settings → Variables)
3. Importar los 3 workflows en n8n (en orden: 01, 02, 03)
4. Crear la Google Sheet con hoja "Users" y columnas:
   `chat_id | phone_number | push_name | state | access_token | refresh_token | token_expiry | timezone | pending_action | pending_data | last_ai_response | turn_count | created_at`
5. Configurar el webhook de Evolution API apuntando al webhook del workflow 01
6. Activar los 3 workflows

## Google Sheets - Estructura "Users"

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `chat_id` | string | JID de WhatsApp (ej: 5493437527193@s.whatsapp.net) |
| `phone_number` | string | Número sin sufijo |
| `push_name` | string | Nombre del contacto |
| `state` | string | `pending_auth`, `active`, `token_error` |
| `access_token` | string | Token de acceso de Google |
| `refresh_token` | string | Token de refresh de Google |
| `token_expiry` | string | Expiración ISO 8601 |
| `timezone` | string | Zona horaria (default: America/Argentina/Buenos_Aires) |
| `pending_action` | string | Intent pendiente para multi-turn |
| `pending_data` | string | JSON con datos acumulados |
| `last_ai_response` | string | Última respuesta del bot |
| `turn_count` | number | Contador de turnos en conversación |
| `created_at` | string | Fecha de registro ISO 8601 |
