import { requestBlackcat, sendError, validateSalePayload } from '../_lib/blackcat.js';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const payload = validateSalePayload(request.body);
    const upstream = await requestBlackcat('/sales/create-sale', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.status(upstream.status).json(upstream.body);
  } catch (error) {
    return sendError(response, error);
  }
}
