# Jogo de Xadrez - UFF - Grupo 4

##  Descrição
Jogo de xadrez para jogar contra o computador feito para a aula sobre Gerência de Projetos.

## Instruções para rodar
Para rodar o projeto, é necessário poucos passos
- Clone o projeto e abra-o com o VSCode
- Com o VSCode aberto, clique em "GO Live" no canto inferior direito
- Será aberto uma página web e nela direcione-se para xadrez.html

## Git Flow
Como padrão, utilizaremos a branch "main" como o ambiente de produção e "develop" como ambiente de homologação.
O fluxo a seguir será o GitFlow, como descrito na imagem a seguir:
![GitFlow](https://codigomaromba.files.wordpress.com/2019/01/gitflow-1.png)

Para testes a feature deve ser testada na branch da própria feature, e assim que liberada pelo teste esta deve ser integrada à develop através de um Pull Request

## Pull Request
O Pull Request deve ser feito da branch da feature para a develop, apenas.
Para aceitar deve completar os seguintes requisitos:
- Deve ter sido aprovado por pelo menos um membro do grupo
- Deve ser aceito por alguém diferente que aprovou primariamente, sendo assim necessário pelo menos duas pessoas participando do processo
- Quando houver uma versão estável na develop, um Pull Request deve ser feito da develop para a main.


