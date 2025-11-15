// rodar no terminal do Windows (sem ser no bash), para declarar as variáveis de ambiente, basta seguir o exemplo:
// $env:K6_WEB_DASHBOARD = "true"; $env:K6_WEB_DASHBOARD_EXPORT = "html-dashboard.html"; $env:K6_WEB_DASHBOARD_PERIOD = "2s"; k6 run tests\k6\primeiro.js

// Nuvem
// k6 cloud login --token 9a68360dda5207b250b8bf97614f637a39c443de010c0e669142374f852c0900 
// k6 cloud run tests\k6\primeiro.js
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10,
  duration: '10s',
  // iterations: 1
  thresholds: {
    http_req_duration: ['p(90)<2', 'p(95)<=3'],
    http_req_failed: ['rate<0.01']
  }
};

export default function() {
  let responseInstructorLogin = http.post(
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
  //console.log(responseInstructorLogin.body);
  
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
  // console.log(responseLesson.body);

  check(responseLesson, {
    'status deve ser igual a 201': (r) => r.status === 201
  });

  sleep(1); // User Think Time
}