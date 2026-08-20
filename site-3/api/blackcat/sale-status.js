import { requestBlackcat, sendError, validateTransactionId } from '../_lib/blackcat.js';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const transactionId = validateTransactionId(request.query.id);
    const upstream = await requestBlackcat(`/sales/${encodeURIComponent(transactionId)}/status`, {
      method: 'GET'
    });
    return response.status(upstream.status).json(upstream.body);
  } catch (error) {
    return sendError(response, error);
  }
}
