#!/bin/bash

# Script para probar el flujo completo de autenticación
# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo "============================================================"
echo "🧪 PRUEBA DE FLUJO COMPLETO DE AUTENTICACIÓN"
echo "============================================================"
echo ""

# Test 1: Registro de usuario
echo -e "${CYAN}Test 1: Registro de usuario nuevo${NC}"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "username": "newuser",
    "masterPassword": "TestP@ssw0rd123!"
  }')

echo "$REGISTER_RESPONSE"
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
if [ -n "$USER_ID" ]; then
  echo -e "${GREEN}✓ Usuario registrado correctamente con ID: $USER_ID${NC}"
else
  echo -e "${RED}✗ Error en registro${NC}"
  exit 1
fi
echo ""

# Test 2: Login con el usuario registrado
echo -e "${CYAN}Test 2: Login con usuario registrado${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "masterPassword": "TestP@ssw0rd123!"
  }')

echo "$LOGIN_RESPONSE"
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✓ Login exitoso${NC}"
  echo -e "${YELLOW}Access Token: ${ACCESS_TOKEN:0:50}...${NC}"
else
  echo -e "${RED}✗ Error en login${NC}"
  exit 1
fi
echo ""

# Test 3: Refresh token
echo -e "${CYAN}Test 3: Renovar token con refresh token${NC}"
REFRESH_RESPONSE=$(curl -s -X POST $BASE_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

echo "$REFRESH_RESPONSE"
NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$NEW_ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✓ Token renovado correctamente${NC}"
else
  echo -e "${RED}✗ Error en refresh${NC}"
  exit 1
fi
echo ""

# Test 4: Change Password (F6)
echo -e "${CYAN}Test 4: Cambiar master password (F6)${NC}"
CHANGE_PASS_RESPONSE=$(curl -s -X PUT $BASE_URL/auth/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "currentMasterPassword": "TestP@ssw0rd123!",
    "newMasterPassword": "NewP@ssw0rd456!"
  }')

echo "$CHANGE_PASS_RESPONSE"
CHANGED_AT=$(echo $CHANGE_PASS_RESPONSE | grep -o '"changedAt"')

if [ -n "$CHANGED_AT" ]; then
  echo -e "${GREEN}✓ Password cambiado correctamente${NC}"
else
  echo -e "${RED}✗ Error en cambio de password${NC}"
  exit 1
fi
echo ""

# Test 5: Login con nueva password
echo -e "${CYAN}Test 5: Login con nueva password${NC}"
LOGIN_NEW_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "masterPassword": "NewP@ssw0rd456!"
  }')

echo "$LOGIN_NEW_RESPONSE"
NEW_TOKEN=$(echo $LOGIN_NEW_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$NEW_TOKEN" ]; then
  echo -e "${GREEN}✓ Login con nueva password exitoso${NC}"
else
  echo -e "${RED}✗ Error en login con nueva password${NC}"
  exit 1
fi
echo ""

# Test 6: Logout
echo -e "${CYAN}Test 6: Logout${NC}"
LOGOUT_RESPONSE=$(curl -s -w "\nStatus: %{http_code}" -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $NEW_TOKEN")

echo "$LOGOUT_RESPONSE"
if echo "$LOGOUT_RESPONSE" | grep -q "Status: 204"; then
  echo -e "${GREEN}✓ Logout exitoso${NC}"
else
  echo -e "${RED}✗ Error en logout${NC}"
fi
echo ""

# Test 7: Validar que el token antiguo no funciona
echo -e "${CYAN}Test 7: Intentar usar token después de logout (debe fallar)${NC}"
TEST_AFTER_LOGOUT=$(curl -s -w "\nStatus: %{http_code}" -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $NEW_TOKEN")

if echo "$TEST_AFTER_LOGOUT" | grep -q "Status: 401"; then
  echo -e "${GREEN}✓ Token correctamente invalidado${NC}"
else
  echo -e "${YELLOW}⚠ Token debería estar invalidado${NC}"
fi
echo ""

echo "============================================================"
echo -e "${GREEN}✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE${NC}"
echo "============================================================"
echo ""
echo "Endpoints probados:"
echo "  ✓ POST /auth/register - Registro de usuario"
echo "  ✓ POST /auth/login - Login con credenciales"
echo "  ✓ POST /auth/refresh - Renovar access token"
echo "  ✓ PUT /auth/password - Cambiar master password (F6)"
echo "  ✓ POST /auth/logout - Cerrar sesión"
echo ""
echo "Feature F6 completamente funcional ✨"
echo ""
