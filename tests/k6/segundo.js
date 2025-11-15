// rodar no terminal do Windows (sem ser no bash), para declarar as variáveis de ambiente, basta seguir o exemplo:
// $env:K6_WEB_DASHBOARD = "true"; $env:K6_WEB_DASHBOARD_EXPORT = "html-dashboard.html"; $env:K6_WEB_DASHBOARD_PERIOD = "2s"; k6 run tests\k6\primeiro.js

// Nuvem
// k6 cloud login --token 9a68360dda5207b250b8bf97614f637a39c443de010c0e669142374f852c0900 
// k6 cloud run tests\k6\primeiro.js
import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';


export const options = {
  vus: 10,
  duration: '10s',
  // iterations: 1
  thresholds: {
    http_req_duration: ['p(90)<=25', 'p(95)<=53'],
    http_req_failed: ['rate<0.01']
  }
};

export default function() {
  let responseInstructorLogin = '';

  group('Fazendo login', function() {
    responseInstructorLogin = http.post(
      'http://localhost:3000/instructors/login',
      JSON.stringify({
        email: 'dennys@gmail.com',
        password: '1234'
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    check(responseInstructorLogin, {
      'status do login deve ser igual a 200': (r) => r.status === 200
    });
  });

  //console.log(responseInstructorLogin.body);

  group('Registrando uma nova lição', function() {
    let responseLesson = http.post(
      'http://localhost:3000/lessons',
      JSON.stringify({
        title: 'Como montar a flauta transversal',
        description: 'Montando as três partes da flauta transversal e alinhando as peças'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${responseInstructorLogin.json('token')}`
        }
      }
    );
    check(responseLesson, {
      'status deve ser igual a 201': (r) => r.status === 201
    });
  });

  // console.log(responseLesson.body);

  group('Simulando o pensamento do usuário', function() {
    sleep(1); // User Think Time
  });
}

// NOVA FUNÇÃO ADICIONADA
export function handleSummary(data) {
  console.log('Preparando o resumo...');

  // Extraindo algumas métricas para o resumo customizado
  const reqs = data.metrics.http_reqs.values.count;
  const duration = data.metrics.http_req_duration.values['p(95)'];
  const failed = data.metrics.http_req_failed.values.fails;

  // Montando o resumo para o terminal (stdout)
  const customSummary = `
  -------------------------------------------------
  Resumo Customizado da Execução
  -------------------------------------------------
  - Requisições totais: ${reqs}
  - Requisições com falha: ${failed}
  - Duração p(95): ${duration.toFixed(2)} ms
  -------------------------------------------------
  `;

  // Retorna o objeto que define os artefatos de saída
  return {
    // Salva o relatório completo em um arquivo JSON
    // 'summary.json': JSON.stringify(data, null, 2), 
    
    // Imprime o resumo customizado no terminal
    'stdout': textSummary(data, { indent: ' ', enableColors: true }) + customSummary, 
  };
}