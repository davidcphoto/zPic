const vscode = require('vscode');
const zPic = require("./zPicClass.js");
// const Imperative = require("@zowe/imperative");
const zos_files = require("@zowe/zos-files-for-zowe-sdk");
const zowe_explorer_api = require('@zowe/zowe-explorer-api');
let InputFile = vscode.workspace.getConfiguration('zPic').get('Job.Files.Input');
let OutputFile = vscode.workspace.getConfiguration('zPic').get('Job.Files.Output');
// let InputFile = "${InputFile}";
// let OutputFile = vscode.workspace.getConfiguration('zPic').get('Job.Files.Output');

// const InputFile = "${InputFile}";
// const OutputFile = "${OutputFile}";

let decoration;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "zPic" is now active!');

	vscode.window.onDidChangeTextEditorSelection((event) => {
		if (vscode.window.activeTextEditor.document.languageId == "cobol") {
			const newSelection = event.selections[0];
			calculaSelecção(newSelection);
		}
	});


	let Total_Local = vscode.commands.registerCommand('zPic.Total_Local', function (file = vscode.Uri) {

		console.log('Calcula o tutal de um copybook na maquina local ' + file);

		vscode.workspace.openTextDocument(file).then((document) => {
			let text = document.getText();
			const Total = CalculaLREC(text);
			vscode.window.showInformationMessage('zPic - Total length: ' + Total);
		});

	});

	let Total_Central = vscode.commands.registerCommand('zPic.Total_Central', function (node = zowe_explorer_api.ZoweTreeNode) {


		const Ficheiro = node.label;
		const sessao = node.mParent.mParent.session;
		const Biblioteca = node.mParent.label;

		if (sessao) {
			abrirFicheiroTXT(sessao, Biblioteca + "(" + Ficheiro + ")").then(texto => {

				const Total = CalculaLREC(texto);
				vscode.window.showInformationMessage('zPic - Total length: ' + Total);
			});



		} else {
			vscode.window.showErrorMessage('No Zowe Explorer active session')
		}
	});

	let Lista = vscode.commands.registerCommand('zPic.Lista', function () {

		console.log('Lista');
		calculaLista();
	});


	let Lista_Local = vscode.commands.registerCommand('zPic.Lista_Local', function (file = vscode.Uri) {

		console.log('Lista Local');

		vscode.workspace.openTextDocument(file).then((document) => {
			let texto = document.getText();

			trataLista(texto);
		});
	});



	let Lista_Central = vscode.commands.registerCommand('zPic.Lista_Central', function (node = zowe_explorer_api.ZoweTreeNode) {


		const Ficheiro = node.label;
		const sessao = node.mParent.mParent.session;
		const Biblioteca = node.mParent.label;

		if (sessao) {
			abrirFicheiroTXT(sessao, Biblioteca + "(" + Ficheiro + ")").then(texto => {

				trataLista(texto);

			});

		} else {
			vscode.window.showErrorMessage('No Zowe Explorer active session')
		}
	});


	let Symn = vscode.commands.registerCommand('zPic.Symnames', function () {

		console.log('Symnames');
		const symnames = Symnames();

		abreficheiro(symnames, 'Symnames', 'jcl', 1);
	});


	let Symn_Local = vscode.commands.registerCommand('zPic.Symnames_Local', function (file = vscode.Uri) {

		console.log('Symnames');

		vscode.workspace.openTextDocument(file).then((document) => {
			let texto = document.getText();

			const symnames = SymnamesGerrar(texto);
			abreficheiro(symnames, 'Symnames', 'jcl', 1);
		});
	});



	let Symn_Central = vscode.commands.registerCommand('zPic.Symnames_Central', function (node = zowe_explorer_api.ZoweTreeNode) {


		const Ficheiro = node.label;
		const sessao = node.mParent.mParent.session;
		const Biblioteca = node.mParent.label;

		if (sessao) {
			abrirFicheiroTXT(sessao, Biblioteca + "(" + Ficheiro + ")").then(texto => {

				const symnames = SymnamesGerrar(texto);
				abreficheiro(symnames, 'Symnames', 'jcl', 1);

			});



		} else {
			vscode.window.showErrorMessage('No Zowe Explorer active session')
		}
	});




	let Flat_CSV = vscode.commands.registerCommand('zPic.Flat_CSV', function () {

		console.log('Convert flat file to CSV');

		const JCL = gerrarJCL(TipoJCL.FlatToCSV);
		abreficheiro(JCL, 'FlatFileToCSV', 'jcl');

	});


	let Flat_CSV_Local = vscode.commands.registerCommand('zPic.Flat_CSV_Local', function (file = vscode.Uri) {

		console.log('Flat_CSV Local');

		vscode.workspace.openTextDocument(file).then((document) => {
			let texto = document.getText();
			const JCL = gerrarJCLtexto(TipoJCL.FlatToCSV, texto);
			abreficheiro(JCL, 'FlatFileToCSV', 'jcl');

		});
	});



	let Flat_CSV_Central = vscode.commands.registerCommand('zPic.Flat_CSV_Central', function (node = zowe_explorer_api.ZoweTreeNode) {


		const Ficheiro = node.label;
		const sessao = node.mParent.mParent.session;
		const Biblioteca = node.mParent.label;

		if (sessao) {
			abrirFicheiroTXT(sessao, Biblioteca + "(" + Ficheiro + ")").then(texto => {

				const JCL = gerrarJCLtexto(TipoJCL.FlatToCSV, texto);
				abreficheiro(JCL, 'FlatFileToCSV', 'jcl');

			});



		} else {
			vscode.window.showErrorMessage('No Zowe Explorer active session')
		}
	});




	let CSV_Flat = vscode.commands.registerCommand('zPic.CSV_Flat', function () {

		console.log('Convert CSV to flat file');
		const JCL = gerrarJCL(TipoJCL.CSVToFlat);
		abreficheiro(JCL, 'CSVToFlatFile', 'jcl');

	});

	let CSV_Flat_Local = vscode.commands.registerCommand('zPic.CSV_Flat_Local', function (file = vscode.Uri) {

		console.log('CSV_Flat Local');

		vscode.workspace.openTextDocument(file).then((document) => {
			let texto = document.getText();

			const JCL = gerrarJCLtexto(TipoJCL.CSVToFlat, texto);
			abreficheiro(JCL, 'CSVToFlatFile', 'jcl');
		});
	});


	let CSV_Flat_Central = vscode.commands.registerCommand('zPic.CSV_Flat_Central', function (node = zowe_explorer_api.ZoweTreeNode) {


		const Ficheiro = node.label;
		const sessao = node.mParent.mParent.session;
		const Biblioteca = node.mParent.label;

		if (sessao) {
			abrirFicheiroTXT(sessao, Biblioteca + "(" + Ficheiro + ")").then(texto => {

				const JCL = gerrarJCLtexto(TipoJCL.CSVToFlat, texto);
				abreficheiro(JCL, 'CSVToFlatFile', 'jcl');

			});



		} else {
			vscode.window.showErrorMessage('No Zowe Explorer active session')
		}
	});




	context.subscriptions.push(Lista);
	context.subscriptions.push(Symn);
	context.subscriptions.push(Flat_CSV);
	context.subscriptions.push(CSV_Flat);
	context.subscriptions.push(Total_Local);
	context.subscriptions.push(Lista_Local);
	context.subscriptions.push(Flat_CSV_Local);
	context.subscriptions.push(CSV_Flat_Local);
	context.subscriptions.push(Symn_Local);
	context.subscriptions.push(Total_Central);
	context.subscriptions.push(Lista_Central);
	context.subscriptions.push(Symn_Central);
	context.subscriptions.push(Flat_CSV_Central);
	context.subscriptions.push(CSV_Flat_Central);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
function calculaLista() {
	const editor = vscode.window.activeTextEditor;
	const seleção = editor.selection;
	const inicio = seleção.start.character;

	if (seleção.end.isAfter(seleção.start)) {
		let texto = editor.document.getText(seleção);
		texto = new Array(inicio + 1).join(' ') + texto;
		trataLista(texto);

	}

}

async function LerNomeFicheiros(PlaceHolder = '', Title = '', Value = '') {

	let resultado = '';
	await vscode.window.showInputBox({
		placeHolder: PlaceHolder,
		title: Title,
		value: Value,
		validateInput: text => {
			return validaInput(text);
		}
	}).then(ficheiro => {
		resultado = ficheiro.toUpperCase();
	});

	return resultado;

	function validaInput(texto = '') {

		const separado = texto.split('.');
		const specialChars = /[^a-zA-Z0-9. ]/g;

		if (texto.match(specialChars)) {
			return "Only characters A-Z, a-z, 0-9 and '.' are allowed!";
		}

		for (let i = 0; i < separado.length; i++) {
			if (separado[i].length > 8) {
				return 'Invalid segment length. Max segment length 8 characters!';
			}
		}
	}
}


function trataLista(texto = '') {
	const lista = CalculaLista(texto.toUpperCase());
	const listaCopy = lista.obterLista(lista.Copybook, 0);
	const webview = FormataWebview(listaCopy, lista.Tamanho);

	const painel = vscode.window.createWebviewPanel('zPic', 'Pic Calculator', vscode.ViewColumn.Two, {
		enableFindWidget: true,
	})

	painel.webview.html = webview;
}

function Symnames() {

	const editor = vscode.window.activeTextEditor;
	const seleção = editor.selection;
	const inicio = seleção.start.character;

	if (seleção.end.isAfter(seleção.start)) {
		let texto = editor.document.getText(seleção);
		texto = new Array(inicio + 1).join(' ') + texto;
		let copybook = new zPic.Copybook(texto.toUpperCase());
		const symNames = copybook.obterSymnames();
		console.log(symNames);
		return symNames;
	}
}


function SymnamesGerrar(texto) {

	let copybook = new zPic.Copybook(texto.toUpperCase());
	const symNames = copybook.obterSymnames();
	console.log(symNames);
	return symNames;
}


function calculaSelecção(seleção) {

	let total = 0;

	if (decoration) {
		decoration.dispose();
	}
	const editor = vscode.window.activeTextEditor;
	const range1 = seleção.start;
	const range2 = seleção.end;
	const inicio = seleção.start.character;

	if (seleção.end.isAfter(seleção.start)) {
		let texto = editor.document.getText(seleção);
		texto = new Array(inicio + 1).join(' ') + texto;
		total = CalculaLREC(texto);
	}


	if (total > 0) {
		decoration = vscode.window.createTextEditorDecorationType({
			isWholeLine: true,
			textDecoration: 'underline solid green 1px',
			after: {
				contentText: `zPic Total: ${total}`,
				border: '15px',
				backgroundColor: 'var(--vscode-button-background)',
				color: 'var(--vscode-button-foreground)',
				margin: '15px',
				contentIconPath: 'zPic.png'
			}
		});

		const ranges = [];
		ranges.push(
			new vscode.Range(range1, range2),
		);
		vscode.window.activeTextEditor.setDecorations(decoration, ranges);
	}

	return total;
}


function CalculaLREC(Texto) {
	console.log("trata Texto " + Texto)
	let copybook = new zPic.Copybook(Texto.toUpperCase());

	return copybook.Tamanho;

}

function CalculaLista(Texto) {
	console.log("trata Texto " + Texto)
	let copybook = new zPic.Copybook(Texto.toUpperCase());

	return copybook;

}

function FormataWebview(lista, Total = 0) {

	let ListaHTML = '';

	for (let i = 0; i < lista.length; i++) {

		const nivel = lista[i].Nivel;
		const variavel = lista[i].Nome.split('-').join('_');
		const tamanho = lista[i].Tamanho;
		let occurs = '';
		if (lista[i].Occurs > 1) {
			occurs = lista[i].Occurs;
		}
		const inicio = lista[i].Inicio;
		const fim = lista[i].Fim;

		const linha = `
		<tr>
			<td class="Level">${nivel}</td>
			<td class="Description">${variavel}</td>
			<td class="Length">${tamanho}</td>
			<td class="Occurs">${occurs}</td>
			<td class="Beginning">${inicio}</td>
			<td class="End">${fim}</td>
		</tr>
`;
		ListaHTML += linha;
	}


	const html = `
<!DOCTYPE html>
<html>

<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>zPic</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <!-- <link rel='stylesheet' type='text/css' media='screen' href='main.css'>
    <script src='main.js'></script> -->
    <style>
        tr:nth-child(even) {
            background-color: var(--vscode-editorActionList-focusBackground);
        }

        th, h1 {
            text-align: center;
        }

		tr {
			padding: 3px;
		}

		table {

            width: 100%;
		}

        .Level {
            text-align: center;
            width: 10%;
        }

        .Description {
            width: 50%;
        }

        .Occurs,
        .Beginning,
        .End,
        .Length {
            text-align: right;
            width: 10%;
        }

		.total {
            text-align: right;
  			font-weight: bold;
		}
    </style>
</head>

<body>
    <h1>zPic - Variable List</h1>
    <div>
        <table>
            <tr>
                <th>#</th>
                <th>Description</th>
                <th>Length</th>
                <th>Occurs</th>
                <th>Beginning</th>
                <th>End</th>
            </tr>
${ListaHTML}
			<tr>
				<td COLSPAN="6" class="total">Total: ${Total}</td>
			</tr>
        </table>
    </div>
</body>

</html>
	`;

	return html;
}


function abreficheiro(texto, Ficheiro = '', extensão = '', tipo = 0) {

	const ficheiros = vscode.workspace.textDocuments;
	if (vscode.workspace.workspaceFolders !== undefined) {


		var nomeficheiro = vscode.workspace.workspaceFolders[0].uri.fsPath + "\\" + Ficheiro + '.' + extensão;

		let i = 0;
		let encontrou = true;

		while (encontrou == true) {
			encontrou = false;
			for (let j = 0; j < ficheiros.length; j++) {
				if (ficheiros[j].fileName == nomeficheiro) {
					encontrou = true;
				}
				if (encontrou) {
					++i;
					nomeficheiro = vscode.workspace.workspaceFolders[0].uri.fsPath + "\\" + Ficheiro + "_v" + i + '.' + extensão;
				}
			}

		}

		var setting = vscode.Uri.parse("untitled:" + nomeficheiro);

		if (tipo == 0) {
			LerNomeFicheiros(InputFile, 'Input file', InputFile).then(inputFile => {
				InputFile = inputFile;
				LerNomeFicheiros(OutputFile, 'Output file', OutputFile).then(outputFile => {
					OutputFile = outputFile;

					texto = texto.split('<InputFile>').join(InputFile);
					texto = texto.split('<OutputFile>').join(OutputFile);

					ficheiro();
				});
			})
		} else {
			ficheiro();
		}

		function ficheiro() {
			vscode.workspace.openTextDocument(setting).then((a) => {
				vscode.window.showTextDocument(a, 1, false).then(e => {
					e.edit(edit => {
						edit.insert(new vscode.Position(0, 0), texto);
					});

				})
			}, (error) => {
				console.error(error);
				debugger;

			});
		}
	} else {
		vscode.window.showErrorMessage('No workspace defined!');
	}
}


const TipoJCL = {
	FlatToCSV: 0,
	CSVToFlat: 1
}

function gerrarJCL(Tipo = 0) {


	const editor = vscode.window.activeTextEditor;
	const seleção = editor.selection;
	const inicio = seleção.start.character;

	if (seleção.end.isAfter(seleção.start)) {
		let texto = editor.document.getText(seleção);
		texto = new Array(inicio + 1).join(' ') + texto.toUpperCase();
		const jcl = gerrarJCLtexto(Tipo, texto);

		return jcl

	}
}

function gerrarJCLtexto(Tipo = 0, texto = '') {


	let symNames2 = '';

	let copy = new zPic.Copybook(texto.toUpperCase());

	const symNames = copy.obterSymnames(Tipo);

	const lrec = copy.Tamanho;
	let CSVlrec = 0;



	InputFile = vscode.workspace.getConfiguration('zPic').get('Job.Files.Input');
	OutputFile = vscode.workspace.getConfiguration('zPic').get('Job.Files.Output');
	const jobname = vscode.workspace.getConfiguration('zPic').get('Job.Card.JobName').toUpperCase();
	const Class = vscode.workspace.getConfiguration('zPic').get('Job.Card.Class').toUpperCase();
	const MsgClass = vscode.workspace.getConfiguration('zPic').get('Job.Card.MsgClass').toUpperCase();
	const separadorCSV = vscode.workspace.getConfiguration('zPic').get('CSV.Delimiters').toUpperCase();
	const decimal = vscode.workspace.getConfiguration('zPic').get('CSV.DecimalPlaceDelimiters').toUpperCase();

	let listaInrec = '';
	let listaCSVtoFlat = '';
	let listaParse = '';
	let listaBuild = '';
	ListaCampos();

	const resultado = obterTemplate();

	function obterTemplate() {


		let resultado = '';

		if (Tipo == TipoJCL.FlatToCSV) {

			resultado = `//${jobname} JOB ,'Flat File to CSV',MSGCLASS=${MsgClass},CLASS=${Class}
//**********************************************************************
//*        IDCAMS: DELETE FILES                                        *
//**********************************************************************
//STPDEL01 EXEC PGM=IDCAMS
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
           DELETE <OutputFile> PURGE
           SET MAXCC = 0
//*
//**********************************************************************
//*    CONVERT FLAT FILE TO EXCEL (CSV)                                *
//**********************************************************************
//FFTOCSV  EXEC PGM=SORT,COND=(0,NE)
//SYSPRINT DD SYSOUT=*
//SYSOUT   DD SYSOUT=*
//SORTIN   DD DISP=SHR,DSN=<InputFile>
//*
//SORTOUT  DD DSN=<OutputFile>,
//            DISP=(NEW,CATLG),SPACE=(TRK,(5,5),RLSE),
//            DCB=(RECFM=FB,LRECL=${CSVlrec})
//SYMNAMES DD *
${symNames}
//SYSIN    DD *
  OPTION   COPY
  INREC    FIELDS=(${listaInrec})
  OUTREC   FIELDS=(1,${CSVlrec},SQZ=(SHIFT=LEFT))
//*`;

		} else {

			resultado = `//${jobname} JOB ,'CSV to Flat File',MSGCLASS=${MsgClass},CLASS=${Class}
//**********************************************************************
//*        IDCAMS: DELETE FILES                                        *
//**********************************************************************
//STPDEL01 EXEC PGM=IDCAMS
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
           DELETE <OutputFile> PURGE
           SET MAXCC = 0
//*
//**********************************************************************
//*    CONVERT EXCEL (CSV) TO FLAT FILE                                *
//**********************************************************************
//CSVTOFF1 EXEC PGM=SORT,COND=(0,NE)
//SYSPRINT DD SYSOUT=*
//SYSOUT   DD SYSOUT=*
//SORTIN   DD DISP=SHR,DSN=<InputFile>
//*
//SORTOUT  DD DSN=&&FILE,
//            DISP=(NEW,CATLG),SPACE=(TRK,(5,5),RLSE)
//SYSIN    DD *
  OPTION   COPY
  OUTFIL   PARSE=(${listaParse}),
           BUILD=(${listaBuild})
//*
//**********************************************************************
//*    CONVERT EXCEL (CSV) TO FLAT FILE                                *
//**********************************************************************
//CSVTOFF2 EXEC PGM=SORT,COND=(0,NE)
//SYSPRINT DD SYSOUT=*
//SYSOUT   DD SYSOUT=*
//SORTIN   DD DISP=SHR,DSN=&&FILE
//SORTOUT  DD DSN=<OutputFile>,
//            DISP=(NEW,CATLG),SPACE=(TRK,(5,5),RLSE),
//            DCB=(RECFM=FB,LRECL=${lrec})
//SYMNAMES DD *
${symNames2}
//SYSIN    DD *
  SORT     FIELDS=COPY
  OUTREC   FIELDS=(${listaCSVtoFlat})
//*`;
		}

		return resultado;

	}

	function ListaCampos() {


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

		for (let i = 0; i < copy.Copy.length; i++) {

			const variavel = copy.Copy[i].Variavel.split('-').join('_');

			switch (copy.Copy[i].Tipo) {
				case TipoCampo.Display:
				case TipoCampo.Alfanumerico:
				case TipoCampo.National:
				case TipoCampo.NumericoFormatado:


					listaCSVtoFlat += variavel;
					listaParse += `%${i}=(ENDBEFR=C'${separadorCSV}',FIXLEN=${copy.Copy[i].tamanhoBruto})`;
					listaBuild += `%${i}`;
					listaInrec += variavel;

					fimlinha();

					break;

				case TipoCampo.Numerico:
				case TipoCampo.NumericoSinal:
				case TipoCampo.Comp:
				case TipoCampo.Comp1:
				case TipoCampo.Comp2:
				case TipoCampo.Comp4:
				case TipoCampo.Comp5:
				case TipoCampo.Binary:
				case TipoCampo.Comp3:

					listaCSVtoFlat += variavel + `,ZD,TO=${copy.Copy[i].formatoJCL},LENGTH(${copy.Copy[i].Tamanho})`;
					listaParse += `%${i}=(ENDBEFR=C'${separadorCSV}',FIXLEN=${copy.Copy[i].tamanhoBruto})`;
					listaBuild += `%${i},SFF,M11,LENGTH=${copy.Copy[i].tamanhoBruto}`;
					const formatoDecimais = new Array(copy.Copy[i].Decimais + 1).join('T');
					const formatoInteiro = new Array(copy.Copy[i].tamanhoBruto - copy.Copy[i].Decimais).join('I') + 'T';
					let formatoi = '';
					if (copy.Copy[i].Decimais > 0) {
						formatoi = `${formatoInteiro}${decimal}${formatoDecimais}`;
					} else {
						formatoi = formatoInteiro;
					}
					listaInrec += variavel + `,\n                   EDIT=(S${formatoi}),SIGNS=(,-)`;

					CSVlrec += formatoi.length + 1;

					fimlinha();
					break;
			}

			function fimlinha() {

				symNames2 += `${variavel},${copy.Copy[i].inicioEstendido},${copy.Copy[i].tamanhoBruto}`;

				if (i < copy.Copy.length - 1) {
					listaInrec += `",C'${separadorCSV}',\n                   `;
					listaCSVtoFlat += ',\n                   ';
					listaParse += ',\n                  ';
					listaBuild += ',\n                  ';
					symNames2 += '\n';
					++CSVlrec;
				}

			}
		}
	}

	return resultado;

}

async function abrirFicheiroTXT(sessao, Ficheiro) {

	const FicheiroBinario = (await zos_files.Get.dataSet(sessao, Ficheiro)).toString();
	// console.log('record ' + FicheiroBinario)

	return FicheiroBinario;
}