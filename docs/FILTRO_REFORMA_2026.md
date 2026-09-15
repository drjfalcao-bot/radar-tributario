# Filtro da Reforma — MVP 2026

## Objetivo

Transformar alteracoes tributarias relevantes em gatilhos empresariais auditaveis. A ferramenta nao deve concluir direitos automaticamente: ela identifica hipoteses que merecem simulacao, validacao documental ou medida tecnica.

## Fluxo

1. Coletar poucos dados objetivos da empresa.
2. Avaliar regras estruturadas no motor `lib/reformOpportunityEngine.ts`.
3. Exibir somente gatilhos compatíveis com os dados informados.
4. Classificar por urgencia, natureza, prioridade e grau de certeza.
5. Mostrar a base normativa, ressalva e proxima acao.
6. Manter link para fonte oficial de cada gatilho.

## Grau de certeza

- `A`: texto legal ou regra operacional expressa.
- `B`: regra existente, mas a aplicacao depende de enquadramento, documentos ou classificacao juridica.
- `C`: gatilho de investigacao, controversia ou ponto que exige analise interpretativa/direito intertemporal.

## Escopo inicial

A primeira versao prioriza fatos acionaveis entre setembro e dezembro de 2026:

- Simples e opcao IBS/CBS para 2027;
- LC 224 e Lucro Presumido;
- beneficios fiscais federais atingidos pela LC 224;
- beneficios onerosos de ICMS;
- dividas RFB/PGFN e controle de legalidade da CDA apos LC 236;
- garantias e multas apos LC 236;
- NFS-e Nacional para ME/EPP;
- cooperativas;
- preparo operacional de documentos fiscais e ERP.

## Regra de manutencao

Toda nova oportunidade deve registrar no minimo:

- identificador estavel;
- norma e versao temporal;
- gatilho objetivo;
- empresa/operacao afetada;
- urgencia;
- natureza;
- grau de certeza;
- explicacao do disparo;
- acao recomendada;
- ressalva juridica;
- fonte oficial.

Materias, webinars e artigos podem levantar hipoteses, mas nao substituem a verificacao do texto legal consolidado, alteracoes posteriores, atos oficiais e jurisprudencia aplicavel.

## Fora do escopo deste MVP

- inventario completo de toda a Reforma Tributaria;
- conclusao automatica de credito ou tese;
- alteracao do motor de passivo;
- persistencia especifica de regras no Supabase;
- geracao automatica de parecer.
