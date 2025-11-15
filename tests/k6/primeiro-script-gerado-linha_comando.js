// k6 new tests\k6\primeiro-script-gerado-linha_comando.js
import http from 'k6/http';
import { sleep, check } from 'k6';
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";

export const options = {
  vus: 10, // número de usuários virtuais
  // não faz sentido ter o duration + iterations
  duration: '30s' // duração do teste
  // iterations: 50, // número de iterações por usuário virtual
};

// Função de teste, script
export default function() {
  let res = http.get('https://quickpizza.grafana.com');
  // Versão anterior
  check(res, { 
    "status is 200": (res) => res.status === 200,
    "status text deve ser igual a OK": (res) => res.status_text === "200 OK"
  });
  
  // Gerado pela versão 1.4 do k6
  expect.soft(res.status).toBe(200);
  expect.soft(res.status_text).toBe("200 OK");
  sleep(1); // Simula um tempo de espera entre as requisições "User Think Time"
}
