MEMORIAL ONLINE - LOGIN + MEMORIAL PEDRO BAPTISTA PEREIRA NETO

Arquivos principais:
- index.html: tela de login responsiva para celular.
- inmemorian_Pedro_Baptista_Pereira_neto.html: página de memorial.
- styles.css: estilos do login e do memorial.
- app.js: autenticação de demonstração e redirecionamento.
- memorial.js: proteção da página, vela virtual e livro de visitas.
- assets/logo-memorial-online.png: logo usada nas páginas.

Credenciais de teste:
E-mail: memorial@gmail.com
Senha: 1234
Código do memorial: memorial2026

Fluxo:
1. Abra index.html.
2. Entre com e-mail/senha ou código do memorial.
3. O sistema grava uma autorização temporária no sessionStorage.
4. Redireciona para inmemorian_Pedro_Baptista_Pereira_neto.html.
5. Ao clicar em Sair, a autorização é removida.

Observação:
Esta autenticação é somente front-end para protótipo visual. Em produção, validar no backend com HTTPS, senha criptografada, sessão/token seguro e banco de dados.


MÚSICA PREFERIDA
-----------------
A página do memorial já possui suporte para tocar uma música preferida.
Para ativar, coloque um arquivo MP3 em:

assets/musica-preferida.mp3

Observação importante: celulares e navegadores modernos podem bloquear música automática com som.
Por isso a página tenta tocar ao entrar, mas também mostra o botão “Tocar” caso o navegador bloqueie.
