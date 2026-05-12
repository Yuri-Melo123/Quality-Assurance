# Teste e monitoramento de carga para a Disciplina de Quality Assurance da UniFECAF

Para usar este repositório será necessário baixar a API de Simulação para Testes com JMeter disponibilizado pelo Professor Wanderson Elias no repositório https://github.com/Wandersonelias/api-jmeter.git.

Substitua o arquivo server.js da API de Simulação pelo arquivo presente na pasta Replace Server deste repositório antes de rodar.

## Como rodar

```
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor
npm start

# A API estará disponível em: http://localhost:3030
```

O arquivo server.js deste repositório tem como objetivo evitar o conflito de portas com o Grafana na porta http://localhost:3000 e incluir as dependências da biblioteca prom-client para a visualização das métricas no Prometheus.

## Visualização de métricas

O Servidor de simulação será executado na porta:

http://localhost:3030

Grafana:

http://localhost:3000

Prometheus:

http://localhost:9090

### Prometheus

Acesse o link abaixo para visualizar o Prometheus com as métricas configuradas:

http://localhost:9090/query?g0.expr=rate%28http_request_duration_seconds_sum%5B1m%5D%29&g0.show_tree=0&g0.tab=table&g0.range_input=1h&g0.res_type=auto&g0.res_density=medium&g0.display_mode=lines&g0.show_exemplars=0&g1.expr=rate%28http_requests_total%5B1m%5D%29&g1.show_tree=0&g1.tab=table&g1.range_input=1h&g1.res_type=auto&g1.res_density=medium&g1.display_mode=lines&g1.show_exemplars=0&g2.expr=http_requests_total&g2.show_tree=0&g2.tab=table&g2.range_input=1h&g2.res_type=auto&g2.res_density=medium&g2.display_mode=lines&g2.show_exemplars=0&g3.expr=rate%28http_requests_total%5B1m%5D%29&g3.show_tree=0&g3.tab=table&g3.range_input=1h&g3.res_type=auto&g3.res_density=medium&g3.display_mode=lines&g3.show_exemplars=0&g4.expr=sum+by%28route%29%28rate%28http_requests_total%5B1m%5D%29%29&g4.show_tree=0&g4.tab=table&g4.range_input=1h&g4.res_type=auto&g4.res_density=medium&g4.display_mode=lines&g4.show_exemplars=0

### Grafana

Login: Admin
Senha: Admin

Uma vez logado configure a fonte de dados escolhendo o Prometheus e defina a URL para 

```
http://prometheus:9090
```

Em seguida importe o Dashboard com o ID compatível com o node-exporter

ID recomendado:

```
1860
```

Para receber os Alertas por E-mail será necessário atualizar as linhas 21, 22 e 23 do arquivo docker-compose.yml

Exemplo:

De
```
- GF_SMTP_USER=SEU_EMAIL@gmail.com
- GF_SMTP_PASSWORD=SUA_SENHA_DE_APP
- GF_SMTP_FROM_ADDRESS=SEU_EMAIL@gmail.com
```

Para
```
- GF_SMTP_USER=meuemail@gmail.com
- GF_SMTP_PASSWORD=abcd efgh ijkl mnop
- GF_SMTP_FROM_ADDRESS=meuemail@gmail.com
```

Acesse: https://myaccount.google.com/apppasswords para criar a sua senha de app utilizada na linha 22

Após a atualização reinicie o container com o Grafana no terminal:

```
docker-compose down
docker-compose up -d
```

## Licença

Este projeto é de uso educacional – sinta-se livre para usá-lo como referência em seus estudos.

Desenvolvido por Yuri de Oliveira Melo
