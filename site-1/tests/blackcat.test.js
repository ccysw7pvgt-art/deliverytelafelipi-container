import assert from 'node:assert/strict';
import test from 'node:test';

import { RequestValidationError, validateSalePayload, validateTransactionId } from '../api/_lib/blackcat.js';

function createPixPayload() {
  return {
    amount: 5990,
    currency: 'BRL',
    paymentMethod: 'pix',
    items: [{ title: 'Pedido', quantity: 1, unitPrice: 5990, tangible: false }],
    customer: {
      name: 'Cliente Teste',
      email: 'cliente@example.com',
      phone: '11999999999',
      document: { number: '12345678901', type: 'cpf' }
    },
    shipping: {
      name: 'Cliente Teste',
      street: 'Rua Teste',
      number: '10',
      complement: '',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01001000'
    },
    externalRef: 'ORDER-1',
    pix: { expiresInDays: 1 }
  };
}

test('aceita uma venda PIX válida', () => {
  const payload = createPixPayload();
  assert.equal(validateSalePayload(payload), payload);
});

test('rejeita valores de venda inválidos', () => {
  const payload = createPixPayload();
  payload.amount = 0;
  assert.throws(() => validateSalePayload(payload), RequestValidationError);
});

test('rejeita identificadores de transação inseguros', () => {
  assert.throws(() => validateTransactionId('../segredo'), RequestValidationError);
});

test('aceita identificadores de transação válidos', () => {
  assert.equal(validateTransactionId('txn_123-ABC'), 'txn_123-ABC');
});

test('rejeita mês de validade com caracteres extras', () => {
  const payload = createPixPayload();
  payload.paymentMethod = 'credit_card';
  delete payload.pix;
  payload.card = {
    number: '4111111111111111',
    holderName: 'Cliente Teste',
    expiryMonth: '01x',
    expiryYear: '2030',
    cvv: '123',
    installments: 1
  };
  assert.throws(() => validateSalePayload(payload), RequestValidationError);
});
