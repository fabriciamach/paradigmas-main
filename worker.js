
onmessage = async function(event) {
    try {
        
        const { bufferView, index,apiKey, bowprodutos,produto } = event.data;
        
        
       
        var produtoBow = bowprodutos;
       
        
        

                                     //AUMENTAR O NUMERO DE PRODUTOS, API LIMITADA, CUIDADO !
            await idsPesquisa(produto, 20, apiKey,produtoBow,(distanciaEuclidiana) => {
                
                console.log('worker: ',index);

                const jsonString = JSON.stringify(distanciaEuclidiana);
                
                const encodedText =  new TextEncoder().encode(jsonString);
               
                bufferView.set(encodedText);
                
                postMessage(bufferView);
                
              

                
            });
        
        
    } catch (error) {
        postMessage({ error: error.message });
    }
};

function geraNumeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
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
      
      console.log('Bow do  worker: ', cincoPrimeirosElementos);

    return cincoPrimeirosElementos

  }

async function idsPesquisa(produto = '' , limit , apiKey,produtoBow,callback) {
    return new Promise(async (resolve, reject) => {
        try {
            const ids = [];
            produto = produto.trim();

            if (!produto) {
                reject(new Error('Produto vazio.'));
                return;
            }
            
            for(let i=1;i<=2;i++){

            const url = `https://unofficial-shein.p.rapidapi.com/products/search?keywords=${produto}&language=pt&country=BR&currency=BRL&sort=7&limit=${limit}&page=${i}`;
            const dados = await Requests(url,apiKey);
            ids.push(dados['info']['products']);
            
            
            if (ids.length < 0) {
                reject(new Error('Nenhum produto foi encontrado!'));
                return;
            }
            
        }
    
        const Ids = ids.flat();
        
        

     

        const arrayProdutos = [];

        //USAMOS LOOP FOR AQUI PQ A API TEM LIMITE DE REQUISICOES E NAO IA DAR CERTO USAR, POIS ALGUMAS PESQUISAVAM E OUTRAS DAVAM ERRO DE LIMITE DE REQUISIÇÕES, TINHAMOS USADO PROMISSES,MAP,ETC...
        for (const produto of Ids) {
            const id = produto['goods_id'];
            const desc = await Requests(`https://unofficial-shein.p.rapidapi.com/products/detail?goods_id=${id}&language=pt&country=BR&currency=BRL`, apiKey);

            arrayProdutos.push(desc['info']);

            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (arrayProdutos.length === 0) {
            reject(new Error('Nenhum produto foi encontrado!'));
        } else {
                
                
                TabelaPesquisa(arrayProdutos,produtoBow, callback);
                resolve(arrayProdutos);
            }
        } catch (error) {
            reject(error);
        }
    });
}


async function TabelaPesquisa(produtos, produtoBow,callback) {
    prod = [];
    palavras_chave = [];
    produtos.forEach(produto => {
        
        pro = [produto['goods_name'], produto['retail_price']['amountWithSymbol'], produto['goods_desc'].split(".")[0] + '.', parseInt(produto['stock']),produto['cate_name'].normalize("NFD").replace(/[\u0300-\u036f]/g, "")];
       
        
        prod.push(pro);
    });

    prod.forEach(produto => {
        
        palavras_chave.push(produto[4]);
    
    });

    
    console.log('Palavras chave :',palavras_chave);
    bow = bagOfWords(palavras_chave)
    console.log('Bow dos produtos dentro do worker :',bow);
    console.log('Bow do Worker: ',produtoBow);
    const distanciaEuclidiana = calcularDistanciaEuclidiana(produtoBow, bow);
    prod.push(distanciaEuclidiana);


    
    
   
    if (typeof callback === 'function') {
        callback(prod);
    }
}

function calcularDistanciaEuclidiana(bow1, bow2) {
  
    const allWords = new Set([...Object.keys(bow1), ...Object.keys(bow2)]);
    

    
    const sumSquaredDiff = [...allWords].reduce((acc, word) => {
        const count1 = bow1[word] || 0;
        const count2 = bow2[word]  || 0;
        return acc + Math.pow(count1 - count2, 2);
    }, 0);

    // Calcular a raiz quadrada da soma dos quadrados das diferenças
    return Math.sqrt(sumSquaredDiff);
}




async function Requests(url,api_Key) {
    const headers = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': api_Key,
            'X-RapidAPI-Host': 'unofficial-shein.p.rapidapi.com'
        }
    };

    return fetch(url, headers)
        .then(response => response.json());
}
