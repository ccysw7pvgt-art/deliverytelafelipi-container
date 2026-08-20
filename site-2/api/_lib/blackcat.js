const BLACKCAT_API_URL = 'https://api.blackcatoficial.com/api';
const BLACKCAT_TIMEOUT_MS = 15_000;

export class RequestValidationError extends Error {}

function assert(condition, message) {
  if (!condition) {
    throw new RequestValidationError(message);
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isText(value, minimum, maximum) {
  return typeof value === 'string' && value.length >= minimum && value.length <= maximum;
}

function assertCustomer(customer) {
  assert(isObject(customer), 'Cliente inválido');
  assert(isText(customer.name, 1, 120), 'Nome do cliente inválido');
  assert(isText(customer.email, 3, 254) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email), 'E-mail inválido');
  assert(typeof customer.phone === 'string' && /^\d{10,15}$/.test(customer.phone), 'Telefone inválido');
  assert(isObject(customer.document), 'Documento inválido');
  assert(['cpf', 'cnpj'].includes(customer.document.type), 'Tipo de documento inválido');
  assert(/^\d{11}$|^\d{14}$/.test(customer.document.number), 'Número de documento inválido');
}

function assertItems(items) {
  assert(Array.isArray(items) && items.length >= 1 && items.length <= 50, 'Itens inválidos');
  for (const item of items) {
    assert(isObject(item), 'Item inválido');
    assert(isText(item.title, 1, 200), 'Título do item inválido');
    assert(Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 100, 'Quantidade inválida');
    assert(Number.isInteger(item.unitPrice) && item.unitPrice >= 0 && item.unitPrice <= 50_000_000, 'Preço inválido');
    assert(typeof item.tangible === 'boolean', 'Tipo do item inválido');
  }
}

function assertShipping(shipping) {
  assert(isObject(shipping), 'Entrega inválida');
  for (const field of ['name', 'street', 'number', 'neighborhood', 'city', 'state', 'zipCode']) {
    assert(isText(shipping[field], 1, 160), `Campo de entrega inválido: ${field}`);
  }
  assert(typeof shipping.complement === 'string' && shipping.complement.length <= 160, 'Complemento inválido');
}

function assertCard(card) {
  assert(isObject(card), 'Cartão inválido');
  assert(/^\d{13,19}$/.test(card.number), 'Número do cartão inválido');
  assert(isText(card.holderName, 2, 120), 'Titular inválido');
  assert(/^(0[1-9]|1[0-2])$/.test(card.expiryMonth), 'Mês de validade inválido');
  assert(/^20\d{2}$/.test(card.expiryYear), 'Ano de validade inválido');
  assert(/^\d{3,4}$/.test(card.cvv), 'Código de segurança inválido');
  assert(Number.isInteger(card.installments) && card.installments >= 1 && card.installments <= 12, 'Parcelamento inválido');
}

export function validateSalePayload(payload) {
  assert(isObject(payload), 'Corpo da requisição inválido');
  assert(Number.isInteger(payload.amount) && payload.amount >= 1 && payload.amount <= 50_000_000, 'Valor inválido');
  assert(payload.currency === 'BRL', 'Moeda inválida');
  assert(['pix', 'credit_card'].includes(payload.paymentMethod), 'Forma de pagamento inválida');
  assertItems(payload.items);
  assertCustomer(payload.customer);
  assertShipping(payload.shipping);
  assert(isText(payload.externalRef, 1, 160), 'Referência inválida');

  if (payload.paymentMethod === 'credit_card') {
    assertCard(payload.card);
  } else {
    assert(isObject(payload.pix), 'Configuração PIX inválida');
    assert(Number.isInteger(payload.pix.expiresInDays) && payload.pix.expiresInDays >= 1 && payload.pix.expiresInDays <= 30, 'Validade do PIX inválida');
  }

  return payload;
}

export function validateTransactionId(value) {
  assert(typeof value === 'string' && /^[A-Za-z0-9_-]{1,160}$/.test(value), 'Transação inválida');
  return value;
}

export async function requestBlackcat(path, options = {}) {
  const apiKey = process.env.BLACKCAT_API_KEY;
  if (!apiKey) {
    throw new Error('BLACKCAT_API_KEY não configurada');
  }

  const upstreamResponse = await fetch(`${BLACKCAT_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      ...options.headers
    },
    signal: AbortSignal.timeout(BLACKCAT_TIMEOUT_MS)
  });
  const responseText = await upstreamResponse.text();
  let responseBody;

  try {
    responseBody = JSON.parse(responseText);
  } catch {
    throw new Error('Resposta inválida da BlackCat');
  }

  return {
    body: responseBody,
    status: upstreamResponse.status
  };
}

export function sendError(response, error) {
  if (error instanceof RequestValidationError) {
    return response.status(400).json({ success: false, error: error.message });
  }

  return response.status(502).json({ success: false, error: 'Não foi possível processar o pagamento' });
}
