
const tabelaCarrinho = $("#tabela-carrinho");
const tabelaPesquisa = $("#tabela-pesquisa");
let Carrinho = [];
let recomend = [];
let paginaAtual = 0;
let campoPesquisa = '';




tabelaPesquisa.DataTable({
    paging: false,
    dom: 'Bfrtip',
    select: 'multi',
    searching: false, 
    buttons: [
        {
            text: 'Selecionar tudo',
            action: function () {
                tabelaPesquisa.DataTable().rows().select();
            }
        },
        {
            text: 'Deselecionar tudo',
            action: function () {
                tabelaPesquisa.DataTable().rows().deselect();
            }
        },
        {
            text: 'Anterior',
            action: function () {
                idsPesquisa($("#produto").val().toString(), -1)
            }
        },
        {
            text: 'Proximo',
            action: function () {
                idsPesquisa($("#produto").val().toString(), 1)
            }
        }
    ]
});

tabelaCarrinho.DataTable({
    paging: true,
    dom: 'Bfrtip',
    select: 'multi',
    searching: false, 
   
  
});



function alteraPagina(pagina, pesquisa) {
    campoPesquisa === pesquisa ? paginaAtual += pagina : paginaAtual = 1;
    campoPesquisa = pesquisa;
}

function preenche_carrinho() {
    const novosDados = tabelaPesquisa.DataTable().rows({ selected: true }).data().toArray();
    

    if (novosDados.length === 0) {
        return;
    }

    const dadosTabelaPesquisa = tabelaPesquisa.DataTable().rows().data().toArray();
    //console.log(dadosTabelaPesquisa);
    novosDados.forEach(([produtoNovo, valorNovo,descNovo,Qtd]) => {
        
        const encontrado = dadosTabelaPesquisa.find(([produto]) => produto.toString() === produtoNovo.toString());

        if (encontrado) {
            
            if (encontrado[3] > 0) {
                //encontrado[3] -= 1;
                tabelaCarrinho.DataTable().row.add([produtoNovo, valorNovo,descNovo,Qtd]).draw();
                Carrinho.push([produtoNovo, valorNovo,descNovo,Qtd,palavras_chave]);
                //console.log(Carrinho);
            } else {
                Swal.fire("Estoque Insuficiente!", "", "error");
            }
        }
    });

    tabelaPesquisa.DataTable().rows().remove().draw();
    tabelaPesquisa.DataTable().rows.add(dadosTabelaPesquisa).draw();
}

async function Requests(url) {

    const headers = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'ff52799b12msh560080aa1ebdf6ep13640fjsn38c8dfb8188e',
            'X-RapidAPI-Host': 'unofficial-shein.p.rapidapi.com'
        }
    };
    
    let response = await fetch(url, headers);
    let data = await response.json();
    return data;
}

async function idsPesquisa(produto = '', page = 1, limit = 5) {
    tabelaPesquisa.DataTable().rows().remove();

    produto = produto.trim();

    if (!produto)
        return;

    alteraPagina(page, produto);

    const url = `https://unofficial-shein.p.rapidapi.com/products/search?keywords=${produto}&language=pt&country=BR&currency=BRL&sort=7&limit=${limit}&page=${paginaAtual}`;
    // console.log(url);

    const dados = await Requests(url);
    const ids = dados['info']['products'];

    //console.log(dados);

    if (ids.length === 0) {
        alert('Nenhum produto foi encontrado!');
    } else {
        ProdutosPesquisa(ids);
    }
}


async function ProdutosPesquisa(produtos) {
    const arrayProdutos = await Promise.all(
        produtos.map(async (produto) => {
            setTimeout(()=>{

            },2000

            );
            const id = produto['goods_id'];
            const desc = await Requests(`https://unofficial-shein.p.rapidapi.com/products/detail?goods_id=${id}&language=pt&country=BR&currency=BRL`);
            return desc['info'];
        })
    );

    if (arrayProdutos.length < 0) {
        Swal.fire("Erro", "Nenhum produto foi encontrado!", "error");
    } else {
        //console.log('Array de produtos:', arrayProdutos);
        TabelaPesquisa(arrayProdutos);
    }
}


 function bagOfWords(text) {
    const stopWords = ["ao","o", "a", "os", "as", "um", "uns", "uma", "umas", "e", "ou", "de", "da", "dos", "das", "em", "no", "na", "nos", "nas", "com", "por", "para","outros"];

    const cleanText = text.toString().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ");
  
    const words = cleanText.split(/\s+/);
  
    
    const filteredWords = words.filter(word => !stopWords.includes(word));
  
    
    const wordCount = {};
  
    
    filteredWords.forEach(token => {
        
        wordCount[token] = wordCount[token] ? wordCount[token] + 1 : 1;
      });
  
      const sortedWordCount = Object.fromEntries(
        Object.entries(wordCount)
          .sort((a, b) => b[1] - a[1])
      );
      
  
      
      const cincoPrimeirosElementos = Object.fromEntries(
        Object.entries(sortedWordCount).slice(0, 5)
      );
      
      console.log('Bow apos Compra: ', cincoPrimeirosElementos);
      

    return cincoPrimeirosElementos

  }
  


function TabelaPesquisa(produtos) {
    palavras_chave = [];
    produtos.forEach(produto => {
        p = produto['cate_name'].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        palavras_chave.push(p);
        
        
        tabelaPesquisa.DataTable().row.add([
            produto['goods_name'],
            produto['retail_price']['amountWithSymbol'],
            produto['goods_desc'].split(".")[0] + '.',
            parseInt(produto['stock'])
        ]).draw();
    });
    
    
    return
}








function geraNumeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}


function allWorkersFinished(workers) {
    for (const worker of workers) {
      if (worker.busy) return false;
    }
    return true;
  }

  async function main_worker(produtos) {
    const workers = [];
    const numWorkers = 5; 
    let produtos_workers = [];

        
        const sharedBuffer = new SharedArrayBuffer(1024**2);



        const bufferView = new Uint8Array(sharedBuffer);

     

      // Função para aguardar a conclusão dos workers
      function waitForWorkers() {
          return new Promise((resolve) => {
              const checkWorkers = () => {
                  if (allWorkersFinished(workers)) {
                      resolve();
                    } else {
                        setTimeout(checkWorkers, 100);
                    }
                };
                checkWorkers();
            });
        }
        
        
        for (let i = 0; i < numWorkers; i++) {
            const worker = new Worker('worker.js');
            

            //KEYS CASO ACABE O LIMITE, APARECERA NOS LOGS
            //72296ab084msh14f9fbbf8a719d1p1543b3jsnc61b21469c60
            //a1ea254e92mshdc14853843da2e8p1722bdjsnda8d4b9751b3
            //9f78da1f15mshabe1c723720d0acp12f07ejsn80eb737571e8
            //9b4710eeadmsh0e65fdcce96b9f6p159f87jsn1f04c73dd88e



            const apiKeys = [
                "ff52799b12msh560080aa1ebdf6ep13640fjsn38c8dfb8188e",
                "19fbd1891cmsheb9e0af38f7fee4p16ffebjsn1e924f5d44a7",
                "76e88ea219mshc9a67feaf6db81ep1cb05djsn94b1e7b2812e",
                "ff52799b12msh560080aa1ebdf6ep13640fjsn38c8dfb8188e",
                "109e28325emshab5211bdbf57dafp106c7djsn52ff3634edc0"
            ];
            worker.postMessage({
            bufferView, index: i,
              apiKey: apiKeys[i],
              bowprodutos: produtos,
              produto:[Object.keys(produtos)[i]].toString(),
            });
            worker.busy = true;
            
            worker.onmessage = function (event) {
                
                const sharedBufferFromWorker = event.data;
                
                const data = sharedBufferFromWorker.filter(value => value !== 0);
                
                //console.log(data);
                var objetoJSON = new TextDecoder().decode(data);


                var objetoDecodificado = JSON.parse(objetoJSON);

                //console.log('Objeto: ',objetoDecodificado);
                produtos_workers.push(objetoDecodificado);
                worker.busy = false;
              };
          
              workers.push(worker);
            }
          
            
            await waitForWorkers();
            console.log('acabou: ');

            
            const resultadoMenorNumero = produtos_workers.reduce((menor, subarray) => {
                const ultimoIndice = subarray[subarray.length - 1];
                return ultimoIndice < menor.menorNumero
                    ? { menorNumero: ultimoIndice, subarrayMenorNumero: subarray }
                    : menor;
            }, { menorNumero: Infinity, subarrayMenorNumero: null });
            
            
            

            console.log("PRODUTOS RECOMENDADOS:");
            resultadoMenorNumero.subarrayMenorNumero.slice(0, -1).forEach(elemento => {
                console.log(elemento[0]);
            });

        }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function Compra(){
    Swal.fire({
        title: "Confirmar Compra?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        denyButtonText: "Cancelar Compra"
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire("Compra Realizada!", "Agora aparecerá a lista de compras recomendadas", "success");
         

          const dadosCarrinhoSelecionados = tabelaCarrinho.DataTable().rows({ selected: true }).data().toArray();

          

          dadosCarrinhoSelecionados.forEach(([produtoNovo, valorNovo,descNovo,Qtd,pal_chave]) => {
        
            const encontrado = Carrinho.find(([produto]) => produto.toString() === produtoNovo.toString());
    
            if (encontrado) {
                recomend.push(encontrado[4]);
                
                tabelaCarrinho.DataTable().rows({ selected: true }).clear().draw();
                
            }
        });
          
        } else if (result.isDenied) {
          Swal.fire("Compra Cancelada", "", "error")
            tabelaCarrinho.DataTable().clear().draw()
            Carrinho = [];
            
        }
        w = bagOfWords(recomend);
        main_worker(w);
        
      });

}