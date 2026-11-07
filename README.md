# OneMoreRep

Aplicación móvil Expo con una API Node.js y MongoDB Atlas.

## Qué hace cada parte

- `frontend/`: la app móvil. Mantiene Firebase Authentication y envía solicitudes a la API; nunca se conecta directamente a MongoDB.
- `backend/`: API que verifica la sesión de Firebase, aplica las reglas y lee o guarda las rutinas.
- MongoDB Atlas: base de datos en la nube. El servidor guarda cada rutina asociada al identificador de su usuario.
- Firebase: sigue gestionando el registro e inicio de sesión; el backend verifica sus tokens antes de aceptar solicitudes.

## Configuración inicial

1. Crea un cluster en MongoDB Atlas, agrega un usuario de base de datos y autoriza la IP desde la que ejecutarás el backend. Copia la URI de conexión.
2. En la consola de Firebase del proyecto de esta app, genera una clave privada de cuenta de servicio. Guárdala como `backend/firebase-service-account.json`; no la subas a Git ni la compartas.
3. Copia `backend/.env.example` a `backend/.env`. Completa `MONGODB_URI` con la URI de Atlas y conserva `GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json`.
4. Copia `frontend/.env.example` a `frontend/.env`. Cambia la IP de ejemplo por la IP local de tu computadora. Para un emulador Android suele usarse `10.0.2.2`; en un teléfono físico ambos dispositivos deben estar en la misma red.
5. Inicia el backend desde `backend/` con `npm run dev`. Comprueba que responde en `http://localhost:3000/health` y muestra la base de datos como `connected`.
6. Inicia Expo desde `frontend/` con `npm start` y abre la app.

La pantalla **Rutinas** permite crear y consultar rutinas. Cada solicitud lleva el token de Firebase del usuario y la API solo devuelve sus propias rutinas. Los archivos `.env` y la clave privada están excluidos de Git.

Para comandos de Expo y más detalles de la app, consulta [frontend/README.md](./frontend/README.md).
