# Integração BlackCat

O site usa duas funções server-side da Vercel para impedir que a chave privada da BlackCat seja enviada ao navegador.

## Variável obrigatória

`BLACKCAT_API_KEY` deve ser configurada como sensível nos ambientes Production e Preview de cada projeto Vercel. Em desenvolvimento local, use `.env.local`, que não deve ser versionado.

`BLACKCAT_PUBLIC_KEY` pode ser configurada nos três ambientes. O fluxo atual envia pagamentos pelo proxy server-side e não expõe essa variável ao navegador.

## Endpoints

### `POST /api/blackcat/create-sale`

Valida os dados da venda e encaminha a solicitação para a BlackCat.

### `GET /api/blackcat/sale-status?id=<transactionId>`

Valida o identificador e consulta o estado atual da transação.
