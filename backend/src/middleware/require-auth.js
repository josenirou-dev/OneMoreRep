import { getAuth } from 'firebase-admin/auth';

export async function requireAuth(request, response, next) {
  const authorization = request.get('authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';

  if (!token) {
    response.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
    return;
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    request.userId = decodedToken.uid;
    next();
  } catch (error) {
    console.warn('No se pudo verificar el token de Firebase:', error);
    response.status(401).json({ error: 'La sesión no es válida. Inicia sesión de nuevo.' });
  }
}
