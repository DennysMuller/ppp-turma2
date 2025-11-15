## Erro do k6 ao rodar script com caminho contendo espaços e caracteres não-ASCII

Documentação rápida do diagnóstico, causas prováveis e soluções testadas para o erro:

> ERRO: unexpected k6 panic: stat /C:/Users/Administrador/Downloads/PGATS/09%20-%20Automa%C3%A7%C3%A3o%20de%20Testes%20de%20Performance/Projetos/ppp-turma2/tests/k6/primeiro-script-gerado-linha_comando.js: file does not exist


## O que eu verifiquei e o que fiz

- Confirmei que o arquivo `tests/k6/primeiro-script-gerado-linha_comando.js` existe e contém um script válido (usa `http` e um import externo `https://jslib.k6.io/k6-testing/...`).
- Reproduzi o erro executando `k6 run` apontando para o arquivo (com e sem aspas) e obtive o mesmo panic do k6: o runtime faz um stat do caminho e diz que o arquivo não existe.
- Tentei obter o caminho curto (8.3) via `cmd` como workaround, mas a tentativa inicial não obteve sucesso neste ambiente; o problema parece ligado à forma como o k6 manipula/resolve o caminho no Windows quando há espaços e/ou caracteres Unicode.


## Diagnóstico (causa mais provável)

- O k6 está transformando o caminho em uma forma com percent-encoding (por ex. `%20`, `%C3%A7`) em algum ponto do fluxo interno e depois tenta fazer `stat` nesse caminho codificado, o que acaba falhando.
- Como o arquivo realmente existe (foi confirmado lendo-o), a falha é na resolução/manipulação do caminho absoluto pelo k6 no Windows quando o caminho contém espaços e caracteres não-ASCII (ex.: a pasta "Automação" contém `ã` e `ç`).


## Soluções práticas (ordem de preferência)

1) Mover ou copiar o projeto para um caminho sem espaços nem caracteres não-ASCII (recomendado e simples)

   - Exemplo: mover para `C:\ppp-turma2` e executar o k6 a partir daí.

   Comandos PowerShell para copiar (mantém o original):

   ```powershell
   Copy-Item -LiteralPath "C:\Users\Administrador\Downloads\PGATS\09 - Automação de Testes de Performance\Projetos\ppp-turma2" -Destination "C:\ppp-turma2" -Recurse
   Set-Location C:\ppp-turma2
   k6 run ".\tests\k6\primeiro-script-gerado-linha_comando.js"
   ```

   Ou mover (remove o original):

   ```powershell
   Move-Item -LiteralPath "C:\Users\Administrador\Downloads\PGATS\09 - Automação de Testes de Performance\Projetos\ppp-turma2" -Destination "C:\ppp-turma2"
   Set-Location C:\ppp-turma2
   k6 run ".\tests\k6\primeiro-script-gerado-linha_comando.js"
   ```

2) Criar um junction (atalho de pasta) com um caminho ASCII e usar esse caminho para rodar o k6 (sem mover os arquivos)

   - Criar junction (execute em `cmd` ou PowerShell com privilégios administrativos):

   ```cmd
   mklink /J "C:\ppp-turma2" "C:\Users\Administrador\Downloads\PGATS\09 - Automação de Testes de Performance\Projetos\ppp-turma2"
   ```

   - Depois:

   ```powershell
   cd C:\ppp-turma2
   k6 run ".\tests\k6\primeiro-script-gerado-linha_comando.js"
   ```

3) Usar o caminho curto (8.3) do arquivo — pode contornar espaços/Unicode — mas depende se o recurso está habilitado no volume

   - Comando `cmd` para tentar obter o short path de um arquivo (executar no `cmd`):

   ```cmd
   for %I in ("C:\Users\Administrador\Downloads\PGATS\09 - Automação de Testes de Performance\Projetos\ppp-turma2\tests\k6\primeiro-script-gerado-linha_comando.js") do @echo %~sI
   ```

   - Se isso retornar um caminho no formato 8.3 (p.ex. `C:\Users\ADMINI~1\...`), use-o ao chamar o `k6 run`.


## Nota sobre o script

- O arquivo importa `https://jslib.k6.io/k6-testing/0.5.0/index.js` — portanto a execução requer acesso de rede para buscar essa dependência. Isso não é a causa do erro "file does not exist", mas é bom ter em mente.


## Próximos passos sugeridos (opções)

- A) Posso tentar copiar/mover os arquivos para `C:\ppp-turma2` neste ambiente e executar o `k6 run` (confirmar se quer que eu faça). Isso é rápido.
- B) Posso criar a junction (`mklink /J`) apontando para a pasta atual e então executar `k6 run` via junction (requer permissão de administrador).
- C) Posso tentar novamente obter o caminho 8.3 e executar o `k6` usando-o.
- D) Se preferir, eu apenas forneço os passos e você executa localmente — diga qual opção prefere.


## Resumo

- Problema: k6 faz panic ao tentar stat de um arquivo cujo caminho tem espaços e caracteres não-ASCII.
- Solução mais simples: mover/copiar o projeto para um caminho ASCII sem espaços (por ex. `C:\ppp-turma2`) ou criar uma junction apontando para a pasta.
- Se quiser, executo uma das opções aqui (copiar/mover/junction/short-path). Basta me confirmar a opção.

Arquivo gerado automaticamente com o diagnóstico e comandos para solução.

---

### Sobre o erro ao executar `mklink` no PowerShell

```
mklink /J "C:\ppp-turma2" "C:\Users\Administrador\Downloads\PGATS\09 - Automação de Testes de Performance\Projetos\ppp-turma2"

mklink : O termo 'mklink' não é reconhecido como nome de cmdlet, 

função, arquivo de script ou programa operável. Verifique a      

grafia do nome ou, se um caminho tiver sido incluído, veja se o  

caminho está correto e tente novamente.

No linha:1 caractere:1

+ mklink /J "C:\ppp-turma2" 

"C:\Users\Administrador\Downloads\PGATS\09  ...

+ ~~~~~~

    + CategoryInfo          : ObjectNotFound: (mklink:String) [] 

   , CommandNotFoundException

    + FullyQualifiedErrorId : CommandNotFoundException
```

Olá! A mensagem de erro indica que o comando mklink não está sendo reconhecido. Isso é comum ao tentar executar o mklink diretamente no PowerShell sem a sintaxe correta ou sem os privilégios necessários.

Aqui está o porquê isso acontece e como você pode corrigir:

🛠️ Causa do Erro
-----------------
O `mklink` é um comando nativo do Prompt de Comando (`cmd.exe`) do Windows, usado para criar links simbólicos ou junctions (junções de diretório). Quando executado diretamente no PowerShell, ele pode não ser reconhecido como um cmdlet interno do PowerShell, resultando em `CommandNotFoundException`.

✅ Solução Recomendada
----------------------
Para resolver isso e criar a junction (junção de diretório), você tem duas opções principais:

1. Executar o Comando no `cmd.exe`

   - Abra o Prompt de Comando como Administrador: pressione a tecla Windows, digite `cmd`, clique com o botão direito em "Prompt de Comando" e selecione "Executar como administrador".
   - Execute o comando:

   ```cmd
   mklink /J "C:\ppp-turma2" "C:\Users\Administrador\Downloads\PGATS\09 - Automação de Testes de Performance\Projetos\ppp-turma2"
   ```

2. Executar no PowerShell usando `cmd /c`

   - Abra o PowerShell como Administrador e execute:

   ```powershell
   cmd /c mklink /J "C:\ppp-turma2" "C:\Users\Administrador\Downloads\PGATS\09 - Automação de Testes de Performance\Projetos\ppp-turma2"
   ```

⚠️ Importante: Em ambos os casos, você precisa executar o terminal como Administrador para criar links simbólicos ou junções.

O que é a Junção (`/J`) que você está criando?
---------------------------------------------
Uma Junção de Diretório (Directory Junction) cria um ponto de re-direcionamento: o diretório `C:\ppp-turma2` funcionará como um atalho para `C:\Users\Administrador\Downloads\...\ppp-turma2`. Isso permite que você use um caminho curto/ASCII para rodar ferramentas como o `k6` sem mover seus arquivos.

Se quiser, posso explicar também a diferença entre link simbólico (`/D`) e junção (`/J`) e qual escolher no seu caso.


Exploring path issues and commands...
Vou criar um pequeno todo list para organizar a investigação e ler o conteúdo do arquivo de teste k6 para verificar se ele existe e se há imports que possam causar o erro. Resultado esperado: todo criado e conteúdo do arquivo retornado.

3 tarefas pendentes criadas

Leia primeiro-script-gerado-linha_comando.js

Planning to execute command...
Atualizando o todo list (marcar verificação do arquivo como completada e começar análise das causas). Em seguida vou tentar executar o comando k6 com o caminho entre aspas no terminal para reproduzir o erro localmente e ver a saída.

Iniciando (2/3) Analisar causa do erro


k6 run ".\tests\k6\primeiro-script-gerado-linha_comando.js"
Executing commands for short path...
Atualizando o todo list (marcar análise concluída) e vou obter o caminho 8.3 (short path) do arquivo para tentar rodar o k6 usando esse caminho como workaround. Expected outcome: short path exibido.

Iniciando (3/3) Propor correção e comandos


cmd /c for %I in ("C:\Users\Administrador\Downloads\PGATS\09 - Automação de Testes de Performance\Projetos\ppp-turma2\tests\k6\primeiro-script-gerado-linha_comando.js") do @echo %~sI
Providing repository commands...
Vou direto ao ponto: investi e reproduzi o erro localmente; abaixo está o diagnóstico, as causas prováveis e soluções práticas (com comandos PowerShell/cmd que você pode executar).

O que eu fiz
Li o arquivo primeiro-script-gerado-linha_comando.js e confirmei que o script existe e usa um import externo (https://jslib.k6.io/...).
Tentei executar o comando exatamente como você rodou e com o caminho entre aspas. Reproduzi o mesmo panic do k6: ele faz um stat do arquivo e diz "file does not exist".
Tentei também obter o caminho 8.3 (short path) via cmd para contornar espaços/caracteres, mas a tentativa falhou aqui.
Saída relevante que obtive ao executar:

k6 panic: stat /C:/Users/Administrador/Downloads/PGATS/09%20-%20Automa%C3%A7%C3%A3o%20de%20Testes%20de%20Performance/Projetos/ppp-turma2/tests/k6/primeiro-script-gerado-linha_comando.js: file does not exist
Diagnóstico (causa mais provável)
O k6 está tentando abrir o arquivo mas falha ao resolver o caminho absoluto por causa de espaços e, especialmente, de caracteres não-ASCII no caminho (ex.: "Automação" contém ã/ç). Note que:

O erro mostra o caminho com percent-encoding (%20, %C3%A7, etc.), indicando que o k6 transforma o caminho em URI em algum ponto e a operação de stat acaba falhando.
O arquivo existe (confirmei lendo-o). Então o problema é com resolução/manipulação do caminho pelo k6 no Windows quando há caracteres/encoding especiais no caminho.
Soluções práticas (ordem de preferência)
Mover / copiar o projeto para um caminho sem espaços nem caracteres não-ASCII (recomendado e simples):

Por exemplo mover para C:\ppp-turma2 e rodar k6 a partir daí.
Comandos PowerShell para copiar (não remove o original):


Copy-Item -LiteralPath "C:\Users\Administrador\Downloads\PGATS\09 - Automação de Testes de Performance\Projetos\ppp-turma2" -Destination "C:\ppp-turma2" -RecurseSet-Location C:\ppp-turma2k6 run ".\tests\k6\primeiro-script-gerado-linha_comando.js"
Ou mover:


Move-Item -LiteralPath "C:\Users\Administrador\Downloads\PGATS\09 - Automação de Testes de Performance\Projetos\ppp-turma2" -Destination "C:\ppp-turma2"Set-Location C:\ppp-turma2k6 run ".\tests\k6\primeiro-script-gerado-linha_comando.js"
Criar um junction (atalho de pasta) com um caminho ASCII e usar esse caminho para rodar k6 (sem mover os arquivos originais):

Criar junction (execute em PowerShell como administrador ou em cmd):

mklink /J "C:\ppp-turma2" "C:\Users\Administrador\Downloads\PGATS\09 - Automação de Testes de Performance\Projetos\ppp-turma2"
Depois:

cd C:\ppp-turma2k6 run ".\tests\k6\primeiro-script-gerado-linha_comando.js"
Usar o caminho curto (8.3) do arquivo — pode contornar espaços/Unicode — mas dependendo das configurações do volume esse recurso pode estar desativado. Se quiser, eu tento novamente obter o short path e executar com ele.

Nota sobre o script
O script importa https://jslib.k6.io/k6-testing/0.5.0/index.js — isso exige acesso de rede durante a execução. Não tem relação com o "file does not exist", mas aviso caso sua máquina não tenha saída de rede.
Próximos passos que eu posso executar agora (escolha uma opção)
A) Posso tentar mover/copiar os arquivos para C:\ppp-turma2 aqui (preciso da sua confirmação — pode levar alguns segundos).
B) Posso criar a junction (mklink /J) apontando para a pasta atual e então rodar o k6 pelo caminho curto (precisa de permissão admin no Windows).
C) Tentar novamente obter o caminho 8.3 e rodar k6 com ele (sem mover arquivos).
D) Você prefere executar algum dos comandos acima localmente? Eu posso fornecer o passo-a-passo exato.