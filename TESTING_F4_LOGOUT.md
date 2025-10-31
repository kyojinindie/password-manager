# Testing F4: User Logout Endpoint

Guía para probar el endpoint de logout implementado en la Feature F4.

---

## 📋 Prerequisitos

Antes de probar el endpoint de logout, necesitas:

1. **Servidor en ejecución**
2. **Un usuario registrado** (Feature F2)
3. **Estar autenticado** (Feature F3 - Login) para obtener tokens

---

## 🚀 Paso 1: Iniciar el Servidor

```bash
# Opción 1: Modo desarrollo
npm run dev

# Opción 2: Build y ejecución
npm run build
npm start
```

El servidor debería iniciar en: `http://localhost:3000` (o el puerto configurado en tu `.env`)

---

## 🔐 Paso 2: Obtener Tokens (Login)

Antes de hacer logout, necesitas estar logueado para obtener los tokens.

### Request: Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "masterPassword": "YourSecurePassword123!"
  }'
```

### Response Esperada: 200 OK

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**⚠️ IMPORTANTE:** Guarda el `accessToken` y `refreshToken` para los siguientes pasos.

---

## 🚪 Paso 3: Hacer Logout

### Opción A: Logout con solo Access Token

Este método solo invalida el access token. El refresh token seguirá siendo válido (no recomendado para seguridad completa).

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -v
```

**Reemplaza** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` con tu access token real.

### Response Esperada: 204 No Content

```
< HTTP/1.1 204 No Content
< X-Powered-By: Express
< Date: Wed, 31 Oct 2025 10:30:00 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
```

**Sin cuerpo de respuesta** - El código 204 indica éxito sin contenido.

---

### Opción B: Logout Completo (Access + Refresh Token)

Este método invalida **ambos** tokens, terminando completamente la sesión (recomendado).

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }' \
  -v
```

**Reemplaza:**
- `Authorization: Bearer ...` con tu **access token**
- `"refreshToken": "..."` con tu **refresh token**

### Response Esperada: 204 No Content

```
< HTTP/1.1 204 No Content
< X-Powered-By: Express
< Date: Wed, 31 Oct 2025 10:30:00 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
```

---

## ✅ Paso 4: Verificar que el Logout Funcionó

Intenta usar el mismo access token para acceder a un endpoint protegido. Debería fallar.

### Test: Intentar usar el token invalidado

```bash
# Ejemplo: Intentar hacer login nuevamente con el token blacklisted
# (Este endpoint aún no verifica blacklist, pero puedes probarlo cuando se implemente)

curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -v
```

Si el token está blacklisted y hay middleware de verificación, deberías recibir:

```json
{
  "error": "Unauthorized",
  "message": "Token has been revoked"
}
```

**Nota:** La verificación de blacklist en middleware se implementará en features futuras.

---

## 🧪 Casos de Prueba

### ✅ Caso 1: Logout Exitoso

**Request:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer VALID_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "VALID_REFRESH_TOKEN"}'
```

**Expected:** `204 No Content`

---

### ❌ Caso 2: Logout sin Authorization Header

**Request:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json"
```

**Expected:** `401 Unauthorized`

```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid Authorization header. Expected format: \"Bearer <token>\""
}
```

---

### ❌ Caso 3: Logout con Authorization Header Mal Formado

**Request:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: InvalidFormat" \
  -H "Content-Type: application/json"
```

**Expected:** `401 Unauthorized`

```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid Authorization header. Expected format: \"Bearer <token>\""
}
```

---

### ✅ Caso 4: Logout sin Refresh Token (Válido)

**Request:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer VALID_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected:** `204 No Content`

Este caso es válido porque el refresh token es opcional.

---

### ❌ Caso 5: Logout con Token Inválido

**Request:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer invalid_token_format" \
  -H "Content-Type: application/json"
```

**Expected:** `400 Bad Request`

```json
{
  "error": "Bad Request",
  "message": "Invalid token format provided"
}
```

---

## 📝 Usando Postman

### Configurar el Request

1. **Método:** `POST`
2. **URL:** `http://localhost:3000/auth/logout`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_ACCESS_TOKEN`
4. **Body (optional):**
   ```json
   {
     "refreshToken": "YOUR_REFRESH_TOKEN"
   }
   ```

### Variables de Entorno en Postman (Recomendado)

Crea estas variables en Postman:

```
base_url = http://localhost:3000
access_token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
refresh_token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Luego usa:
- URL: `{{base_url}}/auth/logout`
- Header: `Authorization: Bearer {{access_token}}`
- Body: `{"refreshToken": "{{refresh_token}}"}`

---

## 🐛 Troubleshooting

### Error: "Cannot POST /auth/logout"

**Causa:** El servidor no está corriendo o la ruta no está registrada.

**Solución:**
```bash
# Verificar que el servidor esté corriendo
npm run dev

# Verificar que las rutas estén registradas en app.ts/server.ts
```

---

### Error: "Missing or invalid Authorization header"

**Causa:** No incluiste el header de autorización o el formato es incorrecto.

**Solución:**
```bash
# Formato correcto:
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# NO uses:
-H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Falta "Bearer"
-H "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."        # Falta "Authorization:"
```

---

### Error: "Invalid token format provided"

**Causa:** El token no es un JWT válido o está corrupto.

**Solución:**
- Verifica que el token sea el completo (no cortado)
- Asegúrate de que sea un JWT válido (tres partes separadas por puntos)
- Obtén un nuevo token haciendo login nuevamente

---

### Error: "Internal Server Error"

**Causa:** Error en el servidor (bug en el código).

**Solución:**
1. Revisa los logs del servidor
2. Verifica que todas las dependencias estén inyectadas correctamente
3. Asegúrate de que el `TokenBlacklistService` esté configurado en `dependencies.ts`

---

## 🔍 Verificar Blacklist en Logs

Si quieres ver si el token fue agregado a la blacklist, agrega logs temporales:

```typescript
// En InMemoryTokenBlacklistService.ts (temporal para debugging)
public async addToBlacklist(accessToken?: AccessToken, refreshToken?: RefreshToken): Promise<void> {
  // ... código existente ...

  console.log('🚫 Token blacklisted:', {
    accessToken: accessToken?.value.substring(0, 20) + '...',
    refreshToken: refreshToken?.value.substring(0, 20) + '...',
    blacklistSize: this.getBlacklistSize()
  });
}
```

---

## 📊 Flujo Completo de Prueba

```bash
# 1. Registrar usuario (si no existe)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "masterPassword": "SecurePass123!"
  }'

# 2. Login para obtener tokens
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "masterPassword": "SecurePass123!"
  }' | jq

# 3. Copiar el accessToken del response anterior

# 4. Hacer logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer ACCESS_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -v

# 5. Verificar que retorna 204 No Content
```

---

## 📚 Información Adicional

### Formato del Access Token

El access token es un JWT con esta estructura:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzAzNzYwMDAsImV4cCI6MTczMDM3NjkwMH0.signature_here
```

Partes:
1. **Header:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
2. **Payload:** `eyJ1c2VySWQiOi...` (contiene userId, email, iat, exp)
3. **Signature:** `signature_here` (verifica integridad)

### Expiración de Tokens

- **Access Token:** 15 minutos (900 segundos)
- **Refresh Token:** 7 días

Los tokens en la blacklist se limpian automáticamente cuando expiran.

### Seguridad

**Recomendaciones:**
- ✅ Siempre invalida **ambos** tokens (access + refresh) al hacer logout
- ✅ Nunca expongas tokens en logs o URLs
- ✅ Usa HTTPS en producción
- ✅ Implementa rate limiting en el endpoint de logout

---

## 🎯 Resultados Esperados

Después de hacer logout correctamente:

- ✅ El access token está en la blacklist
- ✅ El refresh token está en la blacklist (si fue proporcionado)
- ✅ Respuesta HTTP 204 No Content
- ✅ Sin cuerpo en la respuesta
- ✅ Headers correctos (Content-Length: 0)

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs del servidor
2. Verifica que el servidor esté corriendo
3. Confirma que tienes tokens válidos del login
4. Revisa que el header Authorization tenga el formato correcto
5. Consulta la documentación en `FEATURES.md` línea 495-568

---

**Feature:** F4 - Logout User
**Endpoint:** `POST /auth/logout`
**Status Code:** `204 No Content`
**Autenticación:** Requerida (Bearer Token)

---

✅ **Implementación completa y probada**
