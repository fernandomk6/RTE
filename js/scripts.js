// referencias dom e variaveis globais
const formIncluirPessoa = document.querySelector('#incluir-pessoa');
const pessoasLista = document.querySelector('#pessoas-lista');
const pessoasJsonTextarea = document.querySelector('#json-pessoas');
const btnGravar = document.querySelector('#gravar');
const btnLer = document.querySelector('#ler');

// json vazio
let pessoasJSON = JSON.stringify({ pessoas: [] }, null, '\t');

// funções
const limpaInput = input => {
  input.value = '';
};

const validarString = string => {
  return Boolean(string.trim());
};

const criarTabela = nome => {
  const table = document.createElement('table');

  const criarThead = () => {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    const button = document.createElement('button');
    button.dataset.js = 'remover-pessoa';

    tr.appendChild(document.createElement('th'))
      .innerHTML = nome;
    
    tr.appendChild(document.createElement('th'))
      .appendChild(button)
      .innerHTML = 'Remover';

    thead.appendChild(tr);

    return thead;
  };

  const criarTbody = () => {
    const tbody = document.createElement('tbody');

    return tbody;
  }

  const criarTfoot = () => {
    const tfoot = document.createElement('tfoot');
    const tr = document.createElement('tr');
    const button = document.createElement('button');

    button.dataset.js = 'incluir-filho';

    tr.appendChild(document.createElement('td'))
      .appendChild(button)
      .innerHTML = 'Incluir Filho';

    tfoot.appendChild(tr);
    
    return tfoot;
  }

  const thead = criarThead();
  const tbody = criarTbody();
  const tfoot = criarTfoot();

  table.appendChild(thead);
  table.appendChild(tfoot);
  table.appendChild(tbody);

  return table;
};

const incluirPessoa = event => {
  event.preventDefault();

  const inputNome = event.target.nome;
  const nome = inputNome.value.trim().toLowerCase();
  
  if (validarString(nome)) {
    const table = criarTabela(nome);

    pessoasLista.insertBefore(document.createElement('li'), pessoasLista.lastElementChild)
      .appendChild(table);

  }

  limpaInput(inputNome);
}

const incluirFilho = elemento => {
  const nomeFilho = prompt('Digite o nome do filho').trim().toLowerCase();

  if (validarString(nomeFilho)) {
    const tbody = elemento.closest('tfoot').nextSibling;
    const tr = document.createElement('tr');

    const button = document.createElement('button');
    button.dataset.js = 'remover-filho';
    const td = document.createElement('td');
    td.dataset.js = 'filho';
  
    tr.appendChild(td)
      .innerHTML = nomeFilho;
  
    tr.appendChild(document.createElement('td'))
      .appendChild(button)
      .innerHTML = 'Remover Filho';
      
    tbody.insertBefore(tr, tbody.lastElementChild);
  }
}

const removerFilho = elemento => {
  elemento.closest('tr').remove();
};

const removerPessoa = elemento => {
  elemento.closest('li').remove();
}

const handlePessoas = event => {
  const elemento = event.target;

  if (elemento.dataset.js === 'incluir-filho') {
    incluirFilho(elemento);
  }

  if (elemento.dataset.js === 'remover-filho') {
    removerFilho(elemento);
  }

  if (elemento.dataset.js === 'remover-pessoa') {
    removerPessoa(elemento);
  }
}

const atualizaPessoasJson = () => {

  const objetoPessoas = { pessoas: [] };
  const tables = pessoasLista.querySelectorAll('table');

  tables.forEach(table => {
    const nome = table.querySelector('th').innerHTML;
    const filhos = [];

    table.querySelectorAll('tbody td[data-js=filho]').forEach(filho => {
      filhos.push(filho.innerHTML);
    });

    const objetoPessoa = { nome, filhos };
    objetoPessoas.pessoas.push(objetoPessoa);
  })

  pessoasJSON = JSON.stringify(objetoPessoas, null, '\t');
  pessoasJsonTextarea.value = pessoasJSON;
}

const gravar = () => {

  fetch('./php/gravar.php', {
    method: 'POST',
    headers: {
      "Content-type": "application/json"
    },
    body: pessoasJSON
  })
    .then(response => {
      if (!response.ok) {
        alert("Ocorreu um erro ao salvar um dados");
        return;
      }

      alert("Sucesso");
    });
}

const ler = () => {

  fetch('./php/ler.php')
    .then(response => response.json())
    .then(atualizarTela);

}

const atualizarTela = data => {
  const limpaPessoas = () => {
    pessoasLista.querySelectorAll("li").forEach(li => li.remove());
  };

  const preencherTabelas = pessoa => {
    const nome = pessoa.nome;
    const table = criarTabela(nome);

    pessoa.filhos.forEach(nomeFilho => {

      const tr = document.createElement('tr');

      const button = document.createElement('button');
      button.dataset.js = 'remover-filho';
      const td = document.createElement('td');
      td.dataset.js = 'filho';
    
      tr.appendChild(td)
        .innerHTML = nomeFilho;
    
      tr.appendChild(document.createElement('td'))
        .appendChild(button)
        .innerHTML = 'Remover Filho';
        
      table.querySelector('tbody')
        .insertBefore(tr, table.querySelector('tbody').lastElementChild);
    });

    pessoasLista.insertBefore(document.createElement('li'), pessoasLista.lastElementChild)
      .appendChild(table);
  
  };

  console.log(data);

  if (data.pessoas.length === 0) {
    pessoasJsonTextarea.value = pessoasJSON;
  }

  limpaPessoas();
  data.pessoas.forEach(preencherTabelas);
  
  
}

// eventos

formIncluirPessoa.addEventListener('submit', incluirPessoa);
pessoasLista.addEventListener('click', handlePessoas);
btnGravar.addEventListener('click', gravar);
btnLer.addEventListener('click', ler);


// obeservador

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      atualizaPessoasJson();
    }
  });
});

observer.observe(pessoasLista, {
  attributes: true,
  characterData: true,
  childList: true,
  subtree: true,
  attributeOldValue: true,
  characterDataOldValue: true
});

// inicia json vazio
pessoasJsonTextarea.value = pessoasJSON;
