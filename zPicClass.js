

const tipoSynNames = {
    Normal: 0,
    Estendido: 1
}

const TipoCampo = {
    Alfanumerico: 0,
    Numerico: 1,
    NumericoSinal: 2,
    Comp: 3,
    Comp1: 4,
    Comp2: 5,
    Comp3: 6,
    Comp4: 7,
    Comp5: 8,
    Display: 9,
    National: 10,
    Binary: 11,
    NumericoFormatado: 12,
    Grupo: 13,
    Switch: 14
}


exports.Copybook = class {
    constructor(ficheiro = new String) {

        const Ficheiro = removeSeqnumAste(ficheiro);
        let FicheiroLinhas = Ficheiro.split('. ');


        let copy = [];
        let inicio = 1;
        let inicioEstendido = 1;

        for (let i = 0; i < FicheiroLinhas.length; ++i) {
            const linha = new Linha(FicheiroLinhas[i].trim(), inicio, inicioEstendido);

            TrataRedefines(linha);

            if (linha.Nivel) {
                if (linha.Nivel != 88) {
                    copy.push(linha);
                }
            }
        }

        const LinhasAgrupado = AcumulaFilhos(copy);
        TrataPosições(LinhasAgrupado.Filhos, 1, 1);

        this.Copybook = LinhasAgrupado.Filhos;
        this.Copy = copy;
        this.Tamanho = LinhasAgrupado.Total;

        function TrataRedefines(linha) {

            if (linha.Redefines) {
                for (let j = 0; j < copy.length; j++) {
                    if (linha.Redefinindo == copy[j].Variavel) {
                        // fica igual ao que redefininiu
                        linha.Inicio = copy[j].Inicio;
                        linha.Fim = copy[j].Fim;
                        linha.inicioEstendido = copy[j].inicioEstendido;
                        linha.FimEstendido = copy[j].FimEstendido;
                        // linha.ListaOccurs = copy[j].ListaOccurs;
                        linha.Tamanho = copy[j].Tamanho;
                    }
                }
            } else {
                inicio = linha.Fim + 1;

                inicioEstendido = linha.FimEstendido + 1;
            }


        }

        function TrataPosições(grupo, Inicio, InicioEstendido) {

            let inicio = Inicio;
            let tamanho = 0;
            let inicioestendido = InicioEstendido;
            let tamanhoestendido = 0;

            for (let i = 0; i < grupo.length; i++) {

                if (grupo[i].Filhos) {

                    let resultadosFilhos = [];

                    if (grupo[i].Redefines && grupo[i].Tipo == TipoCampo.Grupo) {
                        resultadosFilhos = TrataPosições(grupo[i].Filhos, grupo[i - 1].Posição[0].Inicio, grupo[i - 1].Posição[0].inicioEstendido);
                        grupo[i].Tamanho = resultadosFilhos[resultadosFilhos.length - 1].Fim - resultadosFilhos[0].Inicio + 1;
                        inicio = resultadosFilhos[resultadosFilhos.length - 1].Fim + 1;
                    } else {

                        for (let J = 0; J < grupo[i].Occurs; J++) {
                            resultadosFilhos = resultadosFilhos.concat(TrataPosições(grupo[i].Filhos, inicio, inicioEstendido));
                            inicio += grupo[i].TamanhoIndividual;
                            inicioEstendido += grupo[i].tamanhoestendido;

                        }
                    }

                    grupo[i].Posição = resultadosFilhos;
                } else {
                    tamanho = grupo[i].TamanhoIndividual;
                    tamanhoestendido = grupo[i].tamanhoBruto;
                    let tempSoma = [];
                    for (let j = 0; j < grupo[i].Occurs; j++) {
                        const fim = inicio + tamanho - 1;
                        const fimestendido = inicioestendido + tamanhoestendido - 1
                        tempSoma.push({ "Inicio": inicio, "Fim": fim, "Tamanho":tamanho, "inicioEstendido": inicioestendido, "FimEstendido": fimestendido });

                        if (j < grupo[i].Occurs - 1) {
                            inicio += tamanho;
                            inicioestendido += tamanhoestendido;
                        }
                    }
                    if (grupo[i].Posição) {
                        grupo[i].Posição = grupo[i].Posição.concat(tempSoma);
                    } else {
                        grupo[i].Posição = tempSoma;
                    }

                    if (grupo[i].Redefines) {
                        grupo[i].Posição = grupo[i - 1].Posição;
                    } else {
                        inicio = grupo[i].Posição[grupo[i].Posição.length - 1].Fim + 1;
                        inicioestendido = grupo[i].Posição[grupo[i].Posição.length - 1].FimEstendido + 1;
                    }
                }
                // }
            }
            return [{ "Inicio": Inicio, "Fim": grupo[grupo.length - 1].Posição[grupo[grupo.length - 1].Posição.length - 1].Fim, "Tamanho": tamanho,  "inicioEstendido": InicioEstendido, "FimEstendido": grupo[grupo.length - 1].Posição[grupo[grupo.length - 1].Posição.length - 1].FimEstendido }];
        }

    }

    /**
     *
     */
    obterLista(Copy, tipo = 0) {

        let resposta = [];

        for (let i = 0; i < Copy.length; i++) {
            const copy = Copy[i];
            const nivel = copy.Nivel;
            const variavel = copy.Variavel;
            const inicio = copy.Posição[0].Inicio;
            const fim = copy.Posição[copy.Posição.length - 1].Fim;
            const occurs = copy.Occurs;
            const tamanho = copy.Tamanho;
            resposta.push({ "Nivel": nivel, "Nome": variavel, "Inicio": inicio, "Fim": fim, "Occurs": occurs, "Tamanho": tamanho });
            if (copy.Filhos) {
                resposta = resposta.concat(this.obterLista(copy.Filhos, tipo));
            }

        }

        return resposta;
    }
    /**
     *
     */
    obterSymnames(tipo = 0) {

        let symNames = '';
        let linhaSymName = '';
        if (tipo == tipoSynNames.Normal) {
            linhaSymName = SymnamesFilhos(this.Copybook);
        }

        symNames += linhaSymName;


        return symNames;

        function SymnamesFilhos(lista, Versão = '', indice = 0) {

            let linhaSymName = '';
            let inicio = 0;
            let tamanho = 0;


            for (let i = 0; i < lista.length; i++) {

                for (let j = 0; j < lista[i].Occurs; j++) {

                    if (lista[i].Variavel != "FILLER") {
                        let versão = Versão;
                        if (lista[i].Occurs > 1) {
                            versão += "_V" + (j + 1);
                            inicio = lista[i].Posição[j].Inicio;
                            tamanho = lista[i].Posição[j].Tamanho;
                        } else {
                            inicio = lista[i].Posição[indice].Inicio;
                            tamanho = lista[i].Posição[indice].Tamanho;
                        }

                        linhaSymName += lista[i].Variavel.split('-').join('_') + versão + "," + inicio + "," + tamanho + "," + lista[i].formatoJCL;

                        if (lista[i].Tipo == TipoCampo.Grupo) {
                            linhaSymName += '\n' + SymnamesFilhos(lista[i].Filhos, versão, j);
                        }

                        if (!linhaSymName.endsWith('\n') && i<lista.length-1) {
                            linhaSymName += '\n';
                        }
                    }
                }
            }

            if (linhaSymName.endsWith('\n')) {
                linhaSymName = linhaSymName.substring(0, linhaSymName.length - 1);
            }

            return linhaSymName;

        }
    }


}


class Linha {
    constructor(linha, inicio = 0, inicioestendido = 0) {

        const posNivel = 0;
        let posVariavel = 1;
        let posPic = 0;
        let posTipo = 0;
        let posValor = 0;
        let posTemDecimais = 0;
        let posDecimais = 0;
        let posRedefines = 0;
        let posFormatada = 0;
        this.Decimais = 0;


        if (linha.endsWith('.')) {
            linha = linha.slice(0, -1);
        }

        this.Redefines = linha.includes(" REDEFINES ");

        let linhaSeparada = linha.split(/[\s()]+/);

        this.Nivel = Number(linhaSeparada[posNivel]);

        for (let i = 0; i < linhaSeparada.length; ++i) {
            if (linhaSeparada[i] == "PIC") {
                posPic = i;
                posTipo = posPic + 1;
                posValor = posPic + 2;
                posTemDecimais = posPic + 3;
                posDecimais = posPic + 4;
                posFormatada = posPic + 1;
            }
            if (linhaSeparada[i] == "REDEFINES") {
                posRedefines = i + 1;
                this.Redefinindo = linhaSeparada[posRedefines];
            }
        }

        if (linhaSeparada[posVariavel] == "OCCURS" || linhaSeparada[posVariavel] == "REDEFINES" || linhaSeparada[posVariavel] == "PIC") {

            this.Variavel = "n/a";

        } else {

            this.Variavel = linhaSeparada[posVariavel];

        }

        if (posValor == 0) {
            this.tamanhoBruto = 0;
        } else {
            if (linhaSeparada.length > posValor) {
                this.tamanhoBruto = Number(linhaSeparada[posValor]);
            } else {
                this.tamanhoBruto = linhaSeparada[posFormatada].length;
            }
        }

        if (linhaSeparada.length > posTemDecimais) {

            if (linhaSeparada[posTemDecimais] == "V9") {
                this.tamanhoBruto += Number(linhaSeparada[posDecimais]);
                this.Decimais = Number(linhaSeparada[posDecimais]);
            } else {
                if (linhaSeparada[posTemDecimais].startsWith("V9")) {
                    this.tamanhoBruto += linhaSeparada[posTemDecimais].length - 1;
                    this.Decimais = linhaSeparada[posTemDecimais].length - 1;
                }
            }
        }

        if (linha.includes('PIC')) {
            switch (linhaSeparada[posTipo]) {
                case 'X':
                case 'A':
                    this.Tipo = TipoCampo.Alfanumerico;
                    break;
                case '9':
                case 'S9':
                    this.Tipo = validaNumericos(linha);
                    break;
                default:
                    this.Tipo = TipoCampo.NumericoFormatado;
                    break;

            }

        } else {
            if (linhaSeparada[posNivel] == '88') {
                this.Tipo = TipoCampo.Switch;
            } else {
                this.Tipo = TipoCampo.Grupo;
            }
        }

        switch (this.Tipo) {
            case TipoCampo.Alfanumerico:

                this.TamanhoIndividual = this.tamanhoBruto;
                this.formatoJCL = 'CH';
                break;

            case TipoCampo.Numerico:
            case TipoCampo.NumericoSinal:

                this.TamanhoIndividual = this.tamanhoBruto;
                this.formatoJCL = 'ZD';
                break;

            case TipoCampo.Comp:
            case TipoCampo.Comp1:
            case TipoCampo.Comp2:
            case TipoCampo.Comp4:
            case TipoCampo.Comp5:
            case TipoCampo.Binary:

                this.TamanhoIndividual = CalculoTamanho(this.tamanhoBruto, this.Tipo)
                this.formatoJCL = 'BI';

                break;

            case TipoCampo.Comp3:

                this.TamanhoIndividual = CalculoTamanho(this.tamanhoBruto, this.Tipo)
                this.formatoJCL = 'PD';

                break;


            case TipoCampo.Display:
            case TipoCampo.National:
            case TipoCampo.NumericoFormatado:

                this.TamanhoIndividual = linhaSeparada[posFormatada].length
                this.formatoJCL = 'CH';

                break;


            case TipoCampo.Grupo:
            case TipoCampo.Switch:
                this.TamanhoIndividual = 0;
                this.formatoJCL = 'CH';
                break;
        }


        this.Inicio = inicio;
        this.inicioEstendido = inicioestendido;

        let lista = [];
        if (linha.includes(' OCCURS ')) {
            for (let i = 0; i < linhaSeparada.length; ++i) {
                if (linhaSeparada[i] == 'OCCURS') {
                    this.Occurs = Number(linhaSeparada[i + 1]);
                    this.Tamanho = this.TamanhoIndividual * this.Occurs;

                    let inicioTemp = inicio;
                    let fimTemp = 0;

                    for (let j = 0; j < this.Occurs; j++) {
                        fimTemp = inicioTemp + this.TamanhoIndividual - 1;
                        lista.push({ "inicio": inicioTemp, "fim": fimTemp })
                        inicioTemp += this.TamanhoIndividual;
                    }

                    // this.ListaOccurs = lista;
                }
            }

        } else {
            this.Occurs = 1;
            this.Tamanho = this.TamanhoIndividual;
            lista.push({ "inicio": this.Inicio, "fim": this.Inicio + this.Tamanho - 1 })
            // this.ListaOccurs = lista;
        }


        if (linha.includes(' REDEFINES ')) {
            this.Redefines = true;
            this.Fim = inicio - 1;
            this.FimEstendido = inicioestendido - 1;
        } else {
            this.Fim = inicio + this.Tamanho - 1;
            this.FimEstendido = inicioestendido + this.tamanhoBruto - 1;
        }
    }
}

function CalculoTamanho(Valor, Tipo) {

    let tamanho = 0;
    switch (Tipo) {
        case TipoCampo.Comp:
        case TipoCampo.Comp4:
        case TipoCampo.Comp5:
        case TipoCampo.Binary:
            if (Valor <= 4) {
                tamanho = 2;
            } else {
                if (Valor <= 9) {
                    tamanho = 4;
                } else {
                    tamanho = 8;
                }
            }
            break;
        case TipoCampo.Comp1:
            tamanho = 4;
            break
        case TipoCampo.Comp2:
            tamanho = 8;
            break;
        case TipoCampo.Comp3:
            tamanho = Math.round((Valor + 1) / 2);
            break;
    }

    return tamanho;
}

function validaNumericos(Linha = new String) {

    let resultado;
    switch (true) {
        case Linha.includes(' COMP-1'):
            resultado = TipoCampo.Comp1;
            break;
        case Linha.includes(' COMP-2'):
            resultado = TipoCampo.Comp2;
            break;
        case Linha.includes(' COMP-3'):
            resultado = TipoCampo.Comp3;
            break;
        case Linha.includes(' COMP-4'):
            resultado = TipoCampo.Comp4;
            break;
        case Linha.includes(' COMP-5'):
            resultado = TipoCampo.Comp5;
            break;
        case Linha.includes(' COMP'):
            resultado = TipoCampo.Comp;
            break;
        case Linha.includes(' DISPLAY'):
            resultado = TipoCampo.Display;
            break;
        case Linha.includes(' NATIONAL'):
            resultado = TipoCampo.National;
            break;
        case Linha.includes(' BINARY'):
            resultado = TipoCampo.Binary;
            break;
        default:
            resultado = TipoCampo.Numerico;
            break;
    }

    return resultado;
}


// function AcumulaFilhos(copy, nVezes = 1) {
function AcumulaFilhos(copy) {

    let Filhos = [];
    let total = copy[0].Tamanho;
    const Nivel = copy[0].Nivel;
    let nivelPai = 0;

    Filhos.push(copy[0]);

    for (let i = 1; i < copy.length; ++i) {
        if (copy[i].Nivel == Nivel) {
            copy[i].Inicio = copy[nivelPai].Fim + 1;
            copy[i].Fim = copy[i].Inicio + copy[i].Tamanho - 1;
            Filhos.push(copy[i]);
            if (!copy[i].Redefines) {
                total += copy[i].Tamanho;
            }
            nivelPai = i;
        } else {
            if (copy[i].Nivel > Nivel) {

                let acumulaFilho = [];

                while (i < copy.length && copy[i].Nivel > Nivel) {

                    acumulaFilho.push(copy[i]);
                    ++i

                }
                const filhos = AcumulaFilhos(acumulaFilho);
                copy[nivelPai].Filhos = filhos.Filhos;
                copy[nivelPai].Inicio = filhos.Inicio;

                if (!copy[nivelPai].Redefines) {

                    total += filhos.Total * copy[nivelPai].Occurs;
                    copy[nivelPai].Tamanho = filhos.Total * copy[nivelPai].Occurs;
                    copy[nivelPai].TamanhoIndividual = filhos.Total;
                    copy[nivelPai].tamanhoBruto = filhos.Total;
                    copy[nivelPai].Fim = copy[nivelPai].Inicio + (filhos.Total * copy[nivelPai].Occurs) - 1;

                    let novalista = [];
                    let novoinicio = copy[nivelPai].Inicio;
                    let novofim = copy[nivelPai].Inicio + copy[nivelPai].TamanhoIndividual - 1;

                    for (let j = 0; j < copy[nivelPai].Occurs; j++) {
                        novalista.push({ "inicio": novoinicio, "fim": novofim });
                        novoinicio += copy[nivelPai].TamanhoIndividual;
                        novofim += copy[nivelPai].TamanhoIndividual;
                    }
                    // copy[nivelPai].ListaOccurs = novalista;
                }
                --i;

            } else {
                // se o nivel for menor que o nivel anterior tem de sair e voltar para tras
                i = copy.length;
            }
        }
    }

    // if (nVezes > 1) {
    //     for (let i = 0; i < nVezes; i++) {
    //         for (let j = 1; j < Filhos.length; j++) {
    //             // let novoinicio = Filhos[j - 1].ListaOccurs.inicio + total;
    //             // let novofim = Filhos[j - 1].ListaOccurs.fim + total;
    //             // let novoinicio = Filhos[j - 1].Inicio + total;
    //             // let novofim = Filhos[j - 1].Fim + total;
    //             // Filhos[j].ListaOccurs.push({ "inicio": novoinicio, "fim": novofim });
    //         }
    //     }

    // }

    return { "Filhos": Filhos, "Total": total, "Inicio": copy[0].Inicio }

}


function removeSeqnumAste(fullText) {

    let fullTextArray = fullText.split(/\r?\n|\r|\n/g);

    let resultado = '';

    for (let i = 0; i < fullTextArray.length; ++i) {


        if (fullTextArray[i].trim().length > 6) {

            if (fullTextArray[i].substring(6, 7) != '*' && fullTextArray[i].substring(7, 72).trim().length > 0) {

                resultado = resultado + fullTextArray[i].substring(7, 72);

            }
        }
    }
    return resultado;
}
