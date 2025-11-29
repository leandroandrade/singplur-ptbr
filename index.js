class SingPlurPtbr {
  #regras
  #regexCache

  #singularPluralDefault = {
    mal: 'males',
    cônsul: 'cônsules',
    caráter: 'caracteres',
    móvel: 'móveis',
    mão: 'mãos',
    pão: 'pães',
    cidadão: 'cidadãos',
    irmão: 'irmãos',
    alemão: 'alemães',
    cristão: 'cristãos',
    pagão: 'pagãos',
    acórdão: 'acórdãos',
    órgão: 'órgãos',
    sótão: 'sótãos',
    cão: 'cães',
    capitão: 'capitães',
    qualquer: 'quaisquer',
    azul: 'azuis',
    cível: 'cíveis',
    juiz: 'juízes',
    raiz: 'raízes',
    lei: 'leis'
  }

  #substituiDefault = {
    ões: 'ão',
    ais: 'al',
    éis: 'el',
    eis: 'el',
    ois: 'ol',
    uis: 'ul',
    is: 'il',
    ns: 'm',
    eses: 'ês'
  }

  #invariaveisDefault = ['pires', 'lápis', 'tórax', 'status', 'vírus', 'lapsus', 'campus']

  constructor (opts = {}) {
    const { invariaveis = [], singularPlural = {} } = opts

    this.#regras = {
      excecoes: {
        singular_para_plural: { ...this.#singularPluralDefault, ...singularPlural },
        plural_para_singular: {}
      },
      substituir: this.#substituiDefault,
      invariaveis: [...this.#invariaveisDefault, ...invariaveis],

      regras_especiais_plural: [
        {
          nome: 'il_acentuado',
          condicao: (palavra) => /[áéíóú]/.test(palavra) && /il$/i.test(palavra),
          transformacao: (palavra) => palavra.replace(/il$/i, 'eis')
        },
        {
          nome: 'ol_para_ois',
          condicao: (palavra) => /ol$/i.test(palavra),
          transformacao: (palavra) => palavra.replace(/ol$/i, 'óis')
        }
      ],

      regras_especiais_singular: [
        {
          nome: 'eses_para_es',
          condicao: (palavra) => /eses$/i.test(palavra),
          transformacao: (palavra) => palavra.replace(/eses$/i, 'ês')
        },
        {
          nome: 'oes_para_ao',
          condicao: (palavra) => /ões$/i.test(palavra),
          transformacao: (palavra) => palavra.replace(/ões$/i, 'ão')
        },
        {
          nome: 'aes_para_ao',
          condicao: (palavra) => /ães$/i.test(palavra),
          transformacao: (palavra) => palavra.replace(/ães$/i, 'ão')
        },
        {
          nome: 'ais_para_al',
          condicao: (palavra) => /ais$/i.test(palavra),
          transformacao: (palavra) => palavra.replace(/ais$/i, 'al')
        },
        {
          nome: 'uis_para_ul',
          condicao: (palavra) => /[aeiouáéíóúãõ][úu]is$/i.test(palavra),
          transformacao: (palavra) => palavra.replace(/[úu]is$/i, 'ul')
        },
        {
          nome: 'eis_com_acento_para_il',
          condicao: (palavra) => /[áíóú][^aeiouáéíóúãõ]+eis$/i.test(palavra),
          transformacao: (palavra) => palavra.replace(/eis$/i, 'il')
        },
        {
          nome: 'eis_acentuado_para_el',
          condicao: (palavra) => /éis$/i.test(palavra),
          transformacao: (palavra) => palavra.replace(/éis$/i, 'el')
        },
        {
          nome: 'eis_para_el',
          condicao: (palavra) => /eis$/i.test(palavra),
          transformacao: (palavra) => palavra.replace(/eis$/i, 'el')
        },
        {
          nome: 'ois_para_ol',
          condicao: (palavra) => /[óo]is$/i.test(palavra),
          transformacao: (palavra) => palavra.replace(/[óo]is$/i, 'ol')
        },
        {
          nome: 'is_acentuado_para_il',
          condicao: (palavra) => /[áéíóú].*is$/i.test(palavra),
          transformacao: (palavra) => palavra.replace(/is$/i, 'il')
        },
        {
          nome: 'is_para_il',
          condicao: (palavra) => /[^aeiouáéíóúãõ]is$/i.test(palavra),
          transformacao: (palavra) => palavra.replace(/is$/i, 'il')
        },
        {
          nome: 'vogal_s_es_para_vogal_s',
          condicao: (palavra) => /ses$/i.test(palavra) && palavra.length > 4 && /[aeiouáéíóú]s$/i.test(palavra.slice(0, -2)),
          transformacao: (palavra) => palavra.slice(0, -2)
        },
        {
          nome: 'consoante_es_para_consoante',
          condicao: (palavra) => /es$/i.test(palavra) && palavra.length > 3 && /[rzn]$/i.test(palavra.slice(0, -2)),
          transformacao: (palavra) => palavra.slice(0, -2)
        },
        {
          nome: 'vogal_s_para_vogal',
          condicao: (palavra) => /s$/i.test(palavra) && palavra.length > 2 && /[aeiouãõáéíóú]$/i.test(palavra.slice(0, -1)),
          transformacao: (palavra) => palavra.slice(0, -1)
        }
      ],

      palavras_compostas: {
        substantivo_substantivo: 'ambos',
        substantivo_adjetivo: 'ambos',
        verbo_substantivo: 'segundo',
        repetidas: 'ultimo',
        default: 'primeiro_ultimo'
      }
    }

    for (const [singular, plural] of Object.entries(this.#regras.excecoes.singular_para_plural)) {
      this.#regras.excecoes.plural_para_singular[plural.toLowerCase()] = singular
    }

    this.#regexCache = new Map()
  }

  #getRegex (pattern, flags = 'i') {
    const key = `${pattern}:${flags}`
    if (!this.#regexCache.has(key)) {
      this.#regexCache.set(key, new RegExp(pattern, flags))
    }
    return this.#regexCache.get(key)
  }

  #validarEntrada (input) {
    if (input === null || input === undefined) {
      throw new TypeError('Entrada não pode ser null ou undefined')
    }

    if (typeof input !== 'string') {
      throw new TypeError(`Esperado string, recebido ${typeof input}`)
    }

    return input.trim()
  }

  #normalizarPalavra (palavra) {
    return palavra.toLowerCase()
  }

  #preservarCapitalizacao (original, transformada) {
    if (!original || !transformada) return transformada

    const temLetras = /[a-záéíóúâêôãõçA-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(original)
    if (!temLetras) return transformada

    const letrasOriginais = original.replace(/[^a-záéíóúâêôãõçA-ZÁÉÍÓÚÂÊÔÃÕÇ]/g, '')
    if (letrasOriginais === letrasOriginais.toUpperCase() && letrasOriginais.length > 0) {
      return transformada.toUpperCase()
    }

    if (original[0] === original[0].toUpperCase()) {
      return transformada[0].toUpperCase() + transformada.slice(1)
    }

    return transformada
  }

  #getTipoPalavraComposta (partes) {
    if (partes.length === 2 && partes[0].toLowerCase() === partes[1].toLowerCase()) {
      return 'ultimo'
    }

    const verbosComuns = ['guarda', 'para', 'quebra', 'porta', 'beija']
    if (verbosComuns.includes(partes[0].toLowerCase())) {
      return 'segundo'
    }

    return 'primeiro_ultimo'
  }

  #pluralizarPalavraComposta (palavraComposta) {
    const partes = palavraComposta.split('-')
    const tipo = this.#getTipoPalavraComposta(partes)

    switch (tipo) {
      case 'ambos':
        return partes.map(p => this.#pluralizarPalavra(p)).join('-')

      case 'segundo':
      case 'ultimo':
        partes[partes.length - 1] = this.#pluralizarPalavra(partes[partes.length - 1])
        return partes.join('-')

      case 'primeiro_ultimo':
      default:
        partes[0] = this.#pluralizarPalavra(partes[0])
        partes[partes.length - 1] = this.#pluralizarPalavra(partes[partes.length - 1])
        return partes.join('-')
    }
  }

  #pluralizarPalavra (palavra) {
    if (!palavra) return palavra

    const palavraNormalizada = this.#normalizarPalavra(palavra)

    if (this.#regras.excecoes.singular_para_plural[palavraNormalizada]) {
      return this.#preservarCapitalizacao(
        palavra,
        this.#regras.excecoes.singular_para_plural[palavraNormalizada]
      )
    }

    if (this.#regras.invariaveis.includes(palavraNormalizada)) {
      return palavra
    }

    if (palavra.includes('-')) {
      return this.#pluralizarPalavraComposta(palavra)
    }

    for (const regra of this.#regras.regras_especiais_plural) {
      if (regra.condicao(palavra)) {
        return regra.transformacao(palavra)
      }
    }

    if (/ão$/i.test(palavra)) {
      return palavra.replace(/ão$/i, 'ões')
    }

    for (const [sufixoPlural, sufixoSingular] of Object.entries(this.#regras.substituir)) {
      const regex = this.#getRegex(sufixoSingular + '$')
      if (regex.test(palavra)) {
        if (sufixoSingular === 'el' && /[áéíóú]/i.test(palavra)) {
          return palavra.replace(regex, 'eis')
        }
        return palavra.replace(regex, sufixoPlural)
      }
    }

    const adicionarSufixo = (palavra, sufixo) => {
      if (palavra === palavra.toUpperCase()) {
        return palavra + sufixo.toUpperCase()
      }
      return palavra + sufixo
    }

    if (/[rzn]$/i.test(palavra)) {
      return adicionarSufixo(palavra, 'es')
    }

    if (/ás$/i.test(palavra)) {
      return adicionarSufixo(palavra, 'es')
    }

    if (/[aeiouãáéíóú]$/i.test(palavra)) {
      return adicionarSufixo(palavra, 's')
    }

    if (/[aeiouáéíóú]s$/i.test(palavra)) {
      return adicionarSufixo(palavra, 'es')
    }

    return palavra
  }

  #singularizarPalavraComposta (palavraComposta) {
    const partes = palavraComposta.split('-')
    return partes.map(p => this.#singularizarPalavra(p)).join('-')
  }

  #singularizarPalavra (palavra) {
    if (!palavra) return palavra

    const palavraNormalizada = this.#normalizarPalavra(palavra)

    if (this.#regras.excecoes.plural_para_singular[palavraNormalizada]) {
      return this.#preservarCapitalizacao(
        palavra,
        this.#regras.excecoes.plural_para_singular[palavraNormalizada]
      )
    }

    if (this.#regras.invariaveis.includes(palavraNormalizada)) {
      return palavra
    }

    if (palavra.includes('-')) {
      return this.#singularizarPalavraComposta(palavra)
    }

    for (const regra of this.#regras.regras_especiais_singular) {
      if (regra.condicao(palavra)) {
        return regra.transformacao(palavra)
      }
    }

    for (const [sufixoPlural, sufixoSingular] of Object.entries(this.#regras.substituir)) {
      if (sufixoPlural === 'ões') continue

      const regex = this.#getRegex(sufixoPlural + '$')
      if (regex.test(palavra)) {
        return palavra.replace(regex, sufixoSingular)
      }
    }

    return palavra
  }

  /**
   * Pluraliza uma string contendo uma ou mais palavras
   * @param {string} palavras - String contendo palavra(s) no singular
   * @returns {string} String com palavra(s) no plural
   * @throws {TypeError} Se entrada for inválida
   *
   * @example
   * plural("casa") // "casas"
   * plural("papel") // "papéis"
   * plural("casa bonita") // "casas bonitas"
   */
  plural (palavras) {
    const input = this.#validarEntrada(palavras)

    if (input === '') {
      return ''
    }

    return input
      .split(' ')
      .map(p => this.#pluralizarPalavra(p))
      .join(' ')
  }

  /**
   * Singulariza uma string contendo uma ou mais palavras
   * @param {string} palavras - String contendo palavra(s) no plural
   * @returns {string} String com palavra(s) no singular
   * @throws {TypeError} Se entrada for inválida
   *
   * @example
   * singular("casas") // "casa"
   * singular("papéis") // "papel"
   * singular("casas bonitas") // "casa bonita"
   */
  singular (palavras) {
    const input = this.#validarEntrada(palavras)

    if (input === '') {
      return ''
    }

    return input
      .split(' ')
      .map(p => this.#singularizarPalavra(p))
      .join(' ')
  }

  /**
   * Verifica se uma palavra está no plural
   * @param {string} palavra - Palavra a ser verificada
   * @returns {boolean} true se a palavra está no plural, false caso contrário
   * @throws {TypeError} Se entrada for inválida
   *
   * @example
   * isPlural("casas") // true
   * isPlural("casa") // false
   * isPlural("pires") // false (invariável)
   * isPlural("lápis") // false (invariável)
   */
  isPlural (palavra) {
    const input = this.#validarEntrada(palavra)

    if (input === '') {
      return false
    }

    const palavraUnica = input.split(' ')[0]
    const palavraNormalizada = this.#normalizarPalavra(palavraUnica)

    if (this.#regras.invariaveis.includes(palavraNormalizada)) {
      return false
    }

    if (this.#regras.excecoes.plural_para_singular[palavraNormalizada]) {
      return true
    }

    if (this.#regras.excecoes.singular_para_plural[palavraNormalizada]) {
      return false
    }

    const singularizada = this.#singularizarPalavra(palavraUnica)
    const pluralizada = this.#pluralizarPalavra(singularizada)

    return this.#normalizarPalavra(pluralizada) === palavraNormalizada &&
           this.#normalizarPalavra(singularizada) !== palavraNormalizada
  }
}

module.exports = SingPlurPtbr
module.exports.default = SingPlurPtbr
module.exports.SingPlurPtbr = SingPlurPtbr
