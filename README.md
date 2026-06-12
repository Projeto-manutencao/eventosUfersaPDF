# Projeto Eventos UFERSA

Repositório central do sistema de eventos da UFERSA-PDF

## Pré-requisitos
* java 21
* maven
* git

```bash
# 1. clone o repositório
git clone <URL_DO_REPOSITORIO>

# 2. Acesse a pasta do backend
cd eventosUfersaPDF/backend

# 3. Baixe as dependências e inicie o servidor do Spring Boot
mvn clean spring-boot:run
```
O servidor estará rodando na porta 8080 quando o terminal exibir:
Sistema de Eventos da UFERSA está rodando!

(Para encerrar a execução, pressione CTRL + C).

## Convenções de commit

Este projeto adota [Conventional Commits](https://www.conventionalcommits.org/).

## 🔀 Fluxo de Trabalho (Git & Issues)

Para manter o repositório organizado e evitar conflitos no código, seguiremos estritamente o padrão **Branch por PR vinculado a uma Issue**. 

### Como funciona na prática:
1. **Escolha uma Issue** aberta no GitHub para trabalhar.
2. **Crie uma branch local** a partir da `main` usando o prefixo correto e o título da issue.
3. Faça o seu código e commite.
4. **Abra um Pull Request (PR)** apontando para a `main` e vincule-o à Issue correspondente.
5. Após a revisão/aprovação da equipe, o merge na `main` é liberado.

### 🏷️ Padrão de Nomes para Branches (Exemplos)

Sempre crie sua branch em letras minúsculas, usando hifens `-` para separar as palavras. Os prefixos indicam o tipo de alteração:

* **Novas Funcionalidades (`feat/`):**
  `feat/cadastro-eventos` ou `feat/autenticacao-usuario`
* **Correção de Bugs (`fix/`):**
  `fix/erro-conexao-banco` ou `fix/layout-botao-salvar`
* **Documentação (`docs/`):**
  `docs/atualiza-readme-frontend`
* **Melhorias de código/Refatoração (`refactor/`):**
  `refactor/otimizacao-busca-eventos`
* **Tarefas de infraestrutura/configuração (`chore/`):**
  `chore/configura-dependencias-maven`

### 🔗 Vinculando o PR à Issue automaticamente
Ao abrir o seu Pull Request na interface do GitHub, escreva na descrição uma palavra-chave seguida do número da issue (ex: `Closes #12` ou `Fixes #7`). 
Isso faz com que, assim que o seu PR receber o merge na `main`, o GitHub feche a Issue relacionada de forma automática.