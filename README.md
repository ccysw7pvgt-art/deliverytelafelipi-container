# Delivery Tela Felipi — Container

Monorepo com três instâncias independentes do mesmo site:

- `site-1` → projeto Vercel `deliverytelafelipi-1`
- `site-2` → projeto Vercel `deliverytelafelipi-2`
- `site-3` → projeto Vercel `deliverytelafelipi-3`

Cada projeto usa sua própria configuração na Vercel e exige a variável protegida `BLACKCAT_API_KEY`.

## Testes

Execute `node --test` dentro de cada pasta de site.
