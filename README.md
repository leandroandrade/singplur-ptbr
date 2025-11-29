# singplur-ptbr

Biblioteca para pluralização e singularização de palavras em português brasileiro.

## Instalação

```bash
npm i singplur-ptbr
```

## Utilização

```javascript
const SingPlurPtbr = require('singplur-ptbr');
const singplur = new SingPlurPtbr();

// Pluralização
singplur.plural('casa'); // "casas"

// Singularização
singplur.singular('casas'); // "casa"

// Verificar se está no plural
singplur.isPlural('casas'); // true
singplur.isPlural('casa'); // false
singplur.isPlural('pires'); // false (invariável)
```

Múltiplas palavras:

```javascript
singplur.plural('dano moral');           // "danos morais"
singplur.plural('juizado especial');     // "juizados especiais"
singplur.plural('vara cível');           // "varas cíveis"

singplur.singular('danos morais');       // "dano moral"
singplur.singular('varas cíveis');       // "vara cível"
```

#### Palavras Invariáveis

Algumas palavras não mudam no plural:

```javascript
singplur.plural('pires');                // "pires"
singplur.plural('lápis');                // "lápis"
singplur.plural('tórax');                // "tórax"
singplur.plural('vírus');                // "vírus"

singplur.isPlural('pires');              // false
singplur.isPlural('lápis');              // false
```

#### Configuração Personalizada

Você pode adicionar suas próprias exceções e palavras invariáveis:

```javascript
const singplur = new SingPlurPtbr({
  // adicionar palavras invariáveis personalizadas
  invariaveis: ['habeas-corpus', 'habeas-data'],

  // adicionar singular → plural personalizados
  singularPlural: {
    'sacristão': 'sacristães',
    'escrivão': 'escrivães'
  }
});

singplur.plural('habeas-corpus');        // "habeas-corpus"
singplur.plural('sacristão');            // "sacristães"
singplur.isPlural('habeas-corpus');      // false
```

## License

[MIT License](https://github.com/leandroandrade/singplur-ptbr/blob/main/LICENSE/)
