
const vscode = require('vscode');
const fs = require('fs');
const qRedefines = 0;
const qNivel = 1;
const qCampo = 2;
const qCasasDecimais = 3;
const qPic = 4;
const qFormato = 5;
const qTamanhoOrigem = 6;
const qOcorrencias = 7;
const qRec = 8;
const qInicio = 9;
const qFim = 10;
const qRecMultiplicado = 11;
const NomeJCL = vscode.workspace.getConfiguration('zPic').get('Job.Card.JobName');
const Class = vscode.workspace.getConfiguration('zPic').get('Job.Card.Class');
const MsgClass = vscode.workspace.getConfiguration('zPic').get('Job.Card.MsgClass');
const InputFile = vscode.workspace.getConfiguration('zPic').get('Job.Files.Input');
const OutputFile = vscode.workspace.getConfiguration('zPic').get('Job.Files.Output');
const TotalLengthClipboard = vscode.workspace.getConfiguration('zPic').get('TotalLength');
const SysnamesTitle = vscode.workspace.getConfiguration('zPic').get('Job.Symnames.DDStatment');
let Lista = [];

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "zPic" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('zPic.Calcular', function () {
		// The code you place here will be executed every time your command is executed
		console.log("Registou o Calcular");

		// Display a message box to the user
		var selectedText = seleccao(0);

		if (selectedText != "") {
			vscode.window.showInformationMessage('zPic! Total length for selection: ' + selectedText);
		}

		if (TotalLengthClipboard == true) {
			vscode.env.clipboard.writeText(selectedText);
		}
	});


	let disposable2 = vscode.commands.registerCommand('zPic.Listar', function () {
		// The code you place here will be executed every time your command is executed
		console.log("Registou o Listar");

		// Display a message box to the user
		// vscode.window.createWebviewPanel

		// Display a message box to the user
		const painel = vscode.window.createWebviewPanel('zPic', 'Pic Calculator', vscode.ViewColumn.Two)

		painel.webview.html = seleccao(1);


	});


	let disposable3 = vscode.commands.registerCommand('zPic.Symn', function () {
		// The code you place here will be executed every time your command is executed

		console.log("Registou o Symnames");
		var selectedText = seleccao(2);

		if (selectedText.length > 0) {
			vscode.env.clipboard.writeText(selectedText);
			vscode.window.showInformationMessage('zPic! Symnames declaration added to clipboard');
		}


	});

	let disposable4 = vscode.commands.registerCommand('zPic.ConvToCSV', function () {
		// The code you place here will be executed every time your command is executed

		console.log("Converter Flat File a CSV");
		var selectedText = seleccao(3);


		if (selectedText.length > 0) {


			if (vscode.workspace.workspaceFolders !== undefined) {

				var caminho = vscode.workspace.workspaceFolders[0].uri.fsPath + "\\JCL\\FFtoCSV.jcl"

				for (let i = 1; fs.existsSync(caminho); i++) {
					caminho = vscode.workspace.workspaceFolders[0].uri.fsPath + "\\JCL\\FFtoCSV" + i + ".jcl";
				}

				var setting = vscode.Uri.parse("untitled:" + caminho);

				vscode.workspace.openTextDocument(setting).then((a) => {
					vscode.window.showTextDocument(a, 1, false).then(e => {
						e.edit(edit => {
							edit.insert(new vscode.Position(0, 0), selectedText);
						});
					});
				}, (error) => {
					console.error(error);
					debugger;

				});
			}
			else {
				const message = "YOUR-EXTENSION: Working folder not found, open a folder an try again";

				vscode.window.showErrorMessage(message);
			}


		}


	});

	let disposable5 = vscode.commands.registerCommand('zPic.ConvFromCSV', function () {
		// The code you place here will be executed every time your command is executed

		console.log("Converter CSV a Flat File");
		var selectedText = seleccao(4);

		if (selectedText.length > 0) {


			if (vscode.workspace.workspaceFolders !== undefined) {

				var caminho = vscode.workspace.workspaceFolders[0].uri.fsPath + "\\JCL\\CSVtoFF.jcl"

				for (let i = 1; fs.existsSync(caminho); i++) {
					caminho = vscode.workspace.workspaceFolders[0].uri.fsPath + "\\JCL\\CSVtoFF" + i + ".jcl";
				}

				var setting = vscode.Uri.parse("untitled:" + caminho);


				vscode.workspace.openTextDocument(setting).then((a) => {
					vscode.window.showTextDocument(a, 1, false).then(e => {
						e.edit(edit => {
							edit.insert(new vscode.Position(0, 0), selectedText);
						});
					});
				}, (error) => {
					console.error(error);
					debugger;

				});
			}
			else {
				const message = "YOUR-EXTENSION: Working folder not found, open a folder an try again";

				vscode.window.showErrorMessage(message);
			}


		}


	});


	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3);
	context.subscriptions.push(disposable4);
	context.subscriptions.push(disposable5);
};
/////////////////////////////////////////////////////////////////////////////
function seleccao(Tipo) {
	console.log("Trata Selecção");

	const editor = vscode.window.activeTextEditor;

	if (editor == null) {

		vscode.window.showErrorMessage("No editor selected.");
		return "";
	} else {

		const selectedText = editor.document.getText(editor.selection);

		if (selectedText != '') {

			return FormataQuadro(selectedText.toUpperCase(), Tipo);

		}
		else {

			vscode.window.showErrorMessage("No text selected.");
			return "";

		}
	}

}

/////////////////////////////////////////////////////////////////////////////
function FormataQuadro(Seleccao, tipo) {

	console.log("Texto seleccionado:");

	const linhas = lines(Seleccao);
	let Saida = "";

	const linhasSemAsterisco = removeAsteriscos(linhas);

	const linhasSocodigo = removeSeqNumCols(linhasSemAsterisco);
	const linhasCompletas = uneLinhas(linhasSocodigo);


	var quadro = Quadro(linhasCompletas);
	var quadro2 = CalculaOccurs(quadro);

	const Total = Somar(quadro2);

	var quadroFinal = CalculaGrupo(quadro2);

	switch (tipo) {
		case 0:
			Saida = Total;
			break;
		case 1:
			const InicioHtml = `
				<!DOCTYPE html>
				<html>
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Pic Calculator</title>
						<style>
							.header {
							  position: sticky;
							  display: block;
							  left: 0;
							  top: 0;
							  text-align:center;
							  background-color: var(--vscode-list-hoverBackground);
							  padding: 10px;
							  margin: 10px;
							  border-radius: 5px;
							}
							.footer {
							  display: block;
							  position: sticky;
							  left: 0;
							  bottom: 0;
							  background-color: var(--vscode-list-hoverBackground);
							  padding: 10px;
							  margin: 10px;
							  border-radius: 5px;
							}
							.tabela {
								width:100%;
							}
							.cela {
								background-color: var(--vscode-list-hoverBackground);
								padding: 10px;
								margin: 10px;
							 }
							.numero {
								width:10%;
								text-align: center;
							}
							.descricao {
								width:50%;
							}
							.tamanho {
								width: 10%;
								text-align: right;
							}
							.occurs {
								width: 10%;
								text-align: right;
							}
							.inicio {
								width: 10%;
								text-align: right;
							}
							.fim {
								width: 10%;
								text-align: right;
							}
							.cabecalho {
								background-color: var(--vscode-sideBar.background);
								position: sticky;
								text-align: center;
							}
						</style>
					</head>
					<body>

						<div class="grid-container">
						  <div class="header"><h2>Pic Calculator</h2></div>
						  <div class="body">
						  	<table class="tabela">
								  <tr>
									<th class="monaco-icon-label-container cela numero cabecalho"><b>#</b></th>
									<th class="monaco-icon-label-container cela descricao cabecalho"><b>Description</b></th>
									<th class="monaco-icon-label-container cela tamanho cabecalho"><b>Length</b></th>
									<th class="monaco-icon-label-container cela tamanho cabecalho"><b>Occurs</b></th>
									<th class="monaco-icon-label-container cela inicio cabecalho"><b>Beginning</b></th>
									<th class="monaco-icon-label-container cela fim cabecalho"><b>End</b></th>
								  </tr>
								  <tr>`;
			const fimHtml1 = `
		            </table>
				</div>
				  <div class="footer"><h3>Total: `;
			const fimHtml2 = `</h3></div>
				</div>
			</body>
		</html>`;

			const registo1 = `
				<tr>
				  <td class="cela numero">`;
			const registo2 = `</td>
				<td class="cela descricao">`;
			const registo3 = `</td>
				<td class="cela tamanho">`;
			const registo4 = `</td>
				<td class="cela occurs">`;
			const registo5 = `</td>
				<td class="cela inicio">`;
			const registo6 = `</td>
				<td class="cela fim">`;
			const registo7 = `</td>
				</tr>`;

			Saida = InicioHtml;

			for (let i = 0; i < quadroFinal.length; i++) {


				if (
					quadroFinal[i][qOcorrencias] == 1) {
					quadroFinal[i][qOcorrencias] = '';
				} else {
					quadroFinal[i][qOcorrencias] = quadroFinal[i][qOcorrencias] + 'X';
				}
				Saida = Saida
					+ registo1
					+ quadroFinal[i][qNivel]
					+ registo2
					+ quadroFinal[i][qCampo]
					+ registo3
					+ quadroFinal[i][qRec]
					+ registo4
					+ quadroFinal[i][qOcorrencias]
					+ registo5
					+ quadroFinal[i][qInicio]
					+ registo6
					+ quadroFinal[i][qFim]
					+ registo7;

			}

			Saida = Saida + fimHtml1 + Total + fimHtml2;
			break;
		case 2:

			const quadroSymnames = FazSymnaes(quadro);

			Saida = "//SYMNAMES DD *"
			for (let i = 0; i < quadroSymnames.length; i++) {
				Saida = Saida + '\n' + quadroSymnames[i][1] + ',' + quadroSymnames[i][3] + ',' + quadroSymnames[i][6] + ',' + quadroSymnames[i][5];
			}
			break;

		case 3:
			let jobIn = `//` + NomeJCL + ` JOB ,'Flat File to CSV',MSGCLASS=` + MsgClass + `,CLASS=` + Class + `,
//         NOTIFY=&SYSUID
//         SET FICHIN=` + InputFile + `
//         SET FICHOUT=` + OutputFile + `
//         SET MAXLREC=`;
			let jobIn2 = `
//**********************************************************************
//*        IDCAMS: DELETE FILES
//**********************************************************************
//STPDEL01 EXEC PGM=IDCAMS
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
           DELETE ` + OutputFile + ` PURGE
           SET MAXCC = 0
//*
//**********************************************************************
//*    CONVERT FLAT FILE TO EXCEL (CSV)                                *
//**********************************************************************
//*        ------------------------------------------------------------
//FFTOCSV  EXEC PGM=SORT,COND=(0,NE)
//SYSPRINT DD SYSOUT=*
//SYSOUT   DD SYSOUT=*
//SORTIN   DD DISP=SHR,DSN=&FICHIN
//*
//SORTOUT  DD DSN=&FICHOUT,
//            DISP=(NEW,CATLG),SPACE=(TRK,(5,5),RLSE),
//            DCB=(RECFM=FB,LRECL=&MAXLREC)
`
			let jobMid = `
//SYSIN    DD *
  OPTION   COPY
  INREC    FIELDS=(`
			let jobFim = `)
//*`;

			const quadroToCSV = FazSymnaes(quadro);
			let Symnames = '';
			let TotalCSV = -1;

			if (SysnamesTitle) {
				Symnames = Symnames + "//SYMNAMES DD *";
			}

			for (let i = 0; i < quadroToCSV.length; i++) {
				Symnames = Symnames + '\n' + quadroToCSV[i][1] + ',' + quadroToCSV[i][3] + ',' + quadroToCSV[i][6] + ',' + quadroToCSV[i][5];
			}

			let Inrec = '';

			for (let i = 1; i < quadroToCSV.length; i++) {

				if (i < quadroToCSV.length - 1) {

					if (quadroToCSV[i][3] != quadroToCSV[i + 1][3]) {
						TotalCSV = TotalCSV + parseInt(quadroToCSV[i][8]) + 1;
						Inrec = Inrec + quadroToCSV[i][1];
						if (quadroToCSV[i][5] == 'PD' || quadroToCSV[i][5] == 'BI' || quadroToCSV[i][5] == 'ZD') {

							let tamanho = parseInt(quadroToCSV[i][8]);
							let Decimais = parseInt(quadroToCSV[i][7]);
							let formatado = 'S'

							for (let i = 0; i < tamanho - Decimais - 1; i++) {
								formatado = formatado + 'I'
							}

							formatado = formatado + 'T';

							if (Decimais > 0) {
								formatado = formatado + ',';
								for (let i = 0; i < Decimais; i++) {
									formatado = formatado + 'T'
									TotalCSV = TotalCSV + 1;
								}
							}
							Inrec = Inrec + ',EDIT=(' + formatado + '),SIGNS=(,-)';
							TotalCSV = TotalCSV + 1;
						}

						if (i < quadroToCSV.length - 1) {
							Inrec = Inrec + ",C';',\n                   ";
						}
					}
				} else {

					Inrec = Inrec + quadroToCSV[i][1];
					TotalCSV = TotalCSV + parseInt(quadroToCSV[i][8]) + 1;
					if (quadroToCSV[i][5] == 'PD' || quadroToCSV[i][5] == 'BI') {
						let tamanho = parseInt(quadroToCSV[i][8]);;
						Inrec = Inrec + ',' + quadroToCSV[i][5] + ',TO=ZD,LENGTH(' + tamanho + ')'
					}
				}
			}

			let job = jobIn + TotalCSV + jobIn2 + Symnames + jobMid + Inrec + jobFim;


			Saida = job;
			break;

		case 4:

			let job2In = `//` + NomeJCL + ` JOB ,'CSV to Flat File',MSGCLASS=` + MsgClass + `,CLASS=` + Class + `,
//         NOTIFY=&SYSUID
//         SET FICHIN=` + InputFile + `
//         SET FICHOUT=` + OutputFile + `
//         SET MAXLREC=`;
			let job2In2 = `
//**********************************************************************
//*    CONVERT EXCEL (CSV) TO FLAT FILE                                *
//**********************************************************************
//**********************************************************************
//*        IDCAMS: DELETE FILES
//**********************************************************************
//STPDEL01 EXEC PGM=IDCAMS
//SYSPRINT DD SYSOUT=*
//SYSIN    DD *
           DELETE ` + OutputFile + ` PURGE
           SET MAXCC = 0
//*
//*        ------------------------------------------------------------
//FFTOCSV  EXEC PGM=SORT,COND=(0,NE)
//SYSPRINT DD SYSOUT=*
//SYSOUT   DD SYSOUT=*
//SORTIN   DD DISP=SHR,DSN=&FICHIN
//*
//SORTOUT  DD DSN=&TEMP,
//            DISP=(NEW,CATLG),SPACE=(TRK,(5,5),RLSE)
//SYSIN    DD *
  OPTION   COPY
  OUTFIL   PARSE=(`
			let job2Fim = `),
           BUILD=(`
			let job2Fim2 = `)
//*
//STEM0402 EXEC PROC=PSORT,COND=(0,NE)
//SYSPRINT DD SYSOUT=*
//SORTIN   DD DISP=SHR,DSN=&TEMP
//SORTOUT  DD DSN=&FICHOUT,
//            DISP=(NEW,CATLG),SPACE=(TRK,(5,5),RLSE),
//            DCB=(RECFM=FB,LRECL=&MAXLREC)
`
			let job2Fim3 = `//SYSIN    DD *
  SORT     FIELDS=COPY
  OUTREC   FIELDS=(`
			let job2Fim4 = `)
//*`
			let Outfil = '';
			let Build = '';
			let PosIn = 1;
			let PosOut = 0;
			let forOut = "";

			let Outrec = '';
			const quadroFromCSV = FazSymnaes(quadro);

			let Symnames3 = "//SYMNAMES DD *\n";

			for (let i = 1; i < quadroFromCSV.length; i++) {

				let tamanho = 0;

				if (i < quadroFromCSV.length - 1) {
					if (quadroFromCSV[i][3] != quadroFromCSV[i + 1][3]) {
						if (quadroFromCSV[i][5] == "CH" || quadroFromCSV[i][5] == "ZD") {
							forOut = quadroFromCSV[i][5];
							tamanho = parseInt(quadroFromCSV[i][6]);
							Outrec = Outrec + quadroFromCSV[i][1];
						} else {
							forOut = "ZD";
							tamanho = parseInt(quadroFromCSV[i][6]);
							Outrec = Outrec + quadroFromCSV[i][1] + ',ZD,TO=' + quadroFromCSV[i][5] + ',LENGTH(' + quadroFromCSV[i][6] + ')';
						}

						PosOut = PosOut + tamanho;
						Build = Build + "%" + i;
						Outfil = Outfil + "%" + i + "=(ENDBEFR=C';',FIXLEN=" + tamanho + ")"
						Symnames3 = Symnames3 + quadroFromCSV[i][1] + ',' + PosIn + ',' + tamanho + ',' + forOut + '\n';

						if (parseInt(quadroFromCSV[i][7]) > 0) {
							Build = Build + ",UFF,M11,LENGTH=" + tamanho;
						}

						Build = Build + ',\n                  ';
						Outfil = Outfil + ',\n                  ';
						Outrec = Outrec + ',\n                   ';
						PosIn = PosOut + 1;


					}
				} else {
					if (quadroFromCSV[i][5] == "CH" || quadroFromCSV[i][5] == "ZD") {
						forOut = quadroFromCSV[i][5];
						tamanho = quadroFromCSV[i][6];
						Outrec = Outrec + quadroFromCSV[i][1];
					} else {
						forOut = "ZD";
						tamanho = (parseInt(quadroFromCSV[i][4]) - parseInt(quadroFromCSV[i][3])) * 2 + 1;
						Outrec = Outrec + quadroFromCSV[i][1] + ',ZD,TO=' + quadroFromCSV[i][5] + ',LENGTH(' + quadroFromCSV[i][6] + ')';
					}

					PosOut = PosOut + tamanho;
					Build = Build + "%" + i;
					Outfil = Outfil + "%" + i + "=(ENDBEFR=C';',FIXLEN=" + tamanho + ")"
					Symnames3 = Symnames3 + quadroFromCSV[i][1] + ',' + PosIn + ',' + tamanho + ',' + forOut + '\n';

					if (parseInt(quadroFromCSV[i][7]) > 0) {
						Build = Build + ",UFF,M11,LENGTH=" + tamanho;
					}
				}




			}

			Saida = job2In + Total + job2In2 + Outfil + job2Fim + Build + job2Fim2 + Symnames3 + job2Fim3 + Outrec + job2Fim4;

			break;
	}

	return Saida;

}
/////////////////////////////////////////////////////////////////////////////
function FazSymnaes(quadro) {
	console.log("Faz Symnames");

	let inicio = 1;
	let formatoJCL = '';
	let fim = quadro[0][qRecMultiplicado];
	let i = 0;
	let indiceX = '';
	let ind = 0;
	Lista = [];

	let quadroFinal = [];
	let ocorrencias = 1;
	i = 0;
	inicio = 1;
	fim = 0;
	Lista = [];
	let ListaOccur = [];
	let TrataGrupoOccurs = false;


	do {


		switch (quadro[i][qFormato]) {
			case 'Alfanumerico':
			case 'Formatado':
				formatoJCL = 'CH';
				break;
			case 'Numerico':
				formatoJCL = 'ZD';
				break;
			case 'COMP-3':
				formatoJCL = 'PD';
				break;
			case "COMP":
			case "COMP-4":
			case "COMP-5":
			case "BINARY":
				formatoJCL = 'BI';
				break;
			default:
				formatoJCL = 'CH'
		}

		if (quadro[i][qOcorrencias] > 1 && quadro[i][qPic] != "Grupo") {
			TrataGrupoOccurs = true;
		}

		if (ListaOccur.length == 0) {
			inicio = quadro[i][qInicio];

			if (TrataGrupoOccurs) {
				fim = inicio + quadro[i][qRec] - 1;
			} else {
				fim = quadro[i][qFim];
			}

		} else {
			if (quadro[i][qInicio] != quadro[i - 1][qInicio]) {
				inicio = quadroFinal[quadroFinal.length - 1][4] + 1;
			}
			fim = inicio + quadro[i][qRec] - 1;
		}


		indiceX = encontraIndice(quadro, i);

		quadroFinal.push([quadro[i][qNivel], quadro[i][qCampo].replace('-', '_') + indiceX, ocorrencias, inicio, fim, formatoJCL, quadro[i][qRec], quadro[i][qCasasDecimais], quadro[i][qTamanhoOrigem]]);


		if (quadro[i][qPic] != "Grupo") {
			for (let j = 1; j < quadro[i][qOcorrencias]; j++) {
				inicio = inicio + quadro[i][qRec];
				fim = inicio + quadro[i][qRec] - 1;
				indiceX = encontraIndice(quadro, i);
				quadroFinal.push([quadro[i][qNivel], quadro[i][qCampo].replace('-', '_') + indiceX, ocorrencias, inicio, fim, formatoJCL, quadro[i][qRec], quadro[i][qCasasDecimais], quadro[i][qTamanhoOrigem]]);
				console.log(quadroFinal[quadroFinal.length - 1]);
				TrataGrupoOccurs = false;
			}
		} else {
			if (quadro[i][qOcorrencias] > 1) {
				ListaOccur.push([i, quadro[i][qOcorrencias]])
			}
		}

		if (ListaOccur.length > 0) {
			if (ListaOccur[ListaOccur.length - 1][1] <= 1 && quadroFinal[quadroFinal.length - 1][4] == quadro[ind][qFim]) {
				ListaOccur.pop();
				ind = 0;
			} else {
				ind = ListaOccur[ListaOccur.length - 1][0];
				if (quadro[i + 1][qNivel] <= quadro[ind][qNivel]) {
					ListaOccur[ListaOccur.length - 1][1] = --ListaOccur[ListaOccur.length - 1][1];
					quadro[ind][qInicio] = quadro[i][qFim] + 1;
					i = ind;
				}
			}
		}

		++i;

	} while (i < quadro.length);

	return quadroFinal;

}
/////////////////////////////////////////////////////////////////////////////
function encontraIndice(quadro, i) {

	let indiceN = -1;
	let indiceX = '';
	const texto = quadro[i][qCampo];

	if (Lista.length != 0) {

		indiceN = Lista.findIndex((elem) => elem.includes(texto));
	}


	if (indiceN == -1) {
		Lista.push([texto, 0]);
		indiceX = "";
	} else {
		++Lista[indiceN][1];
		indiceX = "_" + Lista[indiceN][1];
	}
	return indiceX;
}
/////////////////////////////////////////////////////////////////////////////
function lines(text) {
	console.log("calcula linhas");
	return text.split('\n');
}

/////////////////////////////////////////////////////////////////////////////
function removeAsteriscos(text) {
	console.log("Remove Asteriscos");

	var t = "";
	var text2 = [];

	if (text.length > 1) {

		if (75 - text[0].length > 6) {

			if (text[0].includes("*") == false) {

				text2.push(text[0]);

			}
		} else {
			const temp = text[0].trim().split(' ');
			if (temp[0] > '00' && temp[0] < '88') {

				text2.push(text[0]);

			} else {
				vscode.window.showWarningMessage("To calculate the size of the first selected line, a level number is nedded")
			}
		}

		for (let i = 1; i < text.length; i++) {

			t = text[i].charAt(6);
			if (t == ' ') {

				text2.push(text[i]);

			}
		}
	} else {
		text2 = text;
	}
	return text2;
}

/////////////////////////////////////////////////////////////////////////////
function removeSeqNumCols(text) {
	console.log("Remove numeros sequenciais");

	var text2 = [];
	var t = '';
	var t2 = '';

	if (text[0].length > 75) {

		var tamanho = text[0].length - 75;
		t = text[0].substring(tamanho, text[0].length - 8 - tamanho);
		t2 = t.trim();


	} else {
		if (text[0].length > 65) {

			t = text[0].substring(0, text[0].length - 9);
			t2 = t.trim();

		} else {

			t2 = text[0].trim();
		}
	}


	text2.push(t2);

	for (let i = 1; i < text.length; i++) {

		t = text[i].substring(7, 72);
		text2.push(t.trim());

	}

	return text2;
}


/////////////////////////////////////////////////////////////////////////////
function uneLinhas(text) {
	console.log("unir linhas separadas");

	var text2 = [];
	var text3 = [];
	var j = 0;

	text2[j] = '';
	for (let i = 0; i < text.length; i++) {

		text2[j] = text2[j] + text[i];

		if (text[i].charAt(text[i].length - 1) == '.') {
			++j;
			text2[j] = '';
		} else {
			text2[j] = text2[j] + ' ';
		}

	}
	if (text2[text2.length - 1] == '') {
		text2.pop();
	}

	for (let i = 0; i < text2.length; i++) {
		if (text2[i].charAt(text2[i].length - 1) == ".") {
			text3[i] = text2[i].substring(0, text2[i].length - 1);
		}
		else {
			text3[i] = text2[i];
		}
	}

	return text3;
}
/////////////////////////////////////////////////////////////////////////////
function Quadro(text) {

	console.log("Formatar Quadro");

	var text2 = [];
	let quadro = [];
	const Nivel = 0;
	const Nome = 1;
	let Definicao = 3;
	let occurs = 0;
	let tip = '';
	let formato = '';
	let tamanho = 0;
	let tamanhoOrigem = 0;
	let CasasDecimais = 0;

	let redefines = false;

	for (let i = 0; i < text.length; i++) {

		text2[i] = text[i].split(/\s+/);

		console.log(text2[i][0] + "-" + text2[i][1] + "-" + text2[i][2] + "-" + text2[i][3] + "-" + text2[i][4]
			+ "-" + text2[i][5] + "-" + text2[i][6] + "-" + text2[i][7]);


		occurs = 1;
		formato = "Numerico";
		redefines = false;
		CasasDecimais = 0;

		if (text2[i].length > Definicao) {
			if (text2[i][Definicao + 1] == "USAGE") {
				formato = text2[i][Definicao + 2];
			} else {
				formato = text2[i][Definicao + 1];
			}
		}

		for (let j = 0; j < text2[i].length; j++) {


			if (text2[i][j] == "OCCURS") {
				occurs = text2[i][j + 1];
			}

			if (text2[i][j] == "REDEFINES") {
				redefines = true;
			}

			if (text2[i][j] == "PIC") {
				Definicao = j + 1;
			}
		}

		if (text2[i][0] > "00" && text2[i][0] < "88") {
			if (text2[i][Definicao] == null) {


				quadro.push([redefines, text2[i][Nivel], text2[i][Nome], 0, "Grupo", , 0, 1, 0, 0, 0, 0, 0]);

			} else {
				if (text2[i][2] == "OCCURS") {


					quadro.push([redefines, text2[i][Nivel], text2[i][Nome], 0, "Grupo", , 0, occurs, 0, 0, 0, 0, 0]);

				} else {

					switch (text2[i][Definicao].charAt(0)) {
						case 'X':
							if (text2[i][Definicao].length > 1) {

								tip = "Alfanumerico";

							} else {

								tip = "Formatado";

							}
							break;
						case 'S':
						case '9':
							if ((text2[i][Definicao].length > 3 &&
								text2[i][Definicao].charAt(0) == "S") ||
								(text2[i][Definicao].charAt(0) == "9" &&
									text2[i][Definicao].charAt(1) == "(")) {
								switch (formato) {
									case "COMP":
										tip = "COMP";
										break;
									case "COMP-1":
										tip = "COMP-1";
										break;
									case "COMP-2":
										tip = "COMP-2";
										break;
									case "COMP-3":
										tip = "COMP-3";
										break;
									case "COMP-4":
										tip = "COMP-4";
										break;
									case "COMP-5":
										tip = "COMP-5";
										break;
									case "BINARY":
										tip = "BINARY";
										break;
									case "NATIONAL":
										tip = "NATIONAL";
										break;
									case "DISPLAY":
										tip = "DISPLAY";
										break;
									default:
										tip = "Numerico";
										break;
								}

							} else {
								tip = "Formatado";
							}

							CasasDecimais = obterCasasDecimais(text2[i][Definicao]);

							break;
						default:
							tip = "Formatado";
							CasasDecimais = obterCasasDecimais(text2[i][Definicao]);
							break;
					}


					tamanho = CalcularTamanho(text2[i][Definicao], tip);
					tamanhoOrigem = CalcularTamanho(text2[i][Definicao], "Numerico");
					quadro.push([redefines, text2[i][Nivel], text2[i][Nome], CasasDecimais, text2[i][Definicao], tip, tamanhoOrigem, occurs, tamanho, 0, 0]);

				}
			}
		}

	}

	return quadro;
}

/////////////////////////////////////////////////////////////////////////////
function obterCasasDecimais(definicao) {

	console.log("Obter Casas Decimaiso" + definicao);
	let tamanho = 0;
	let def = [];

	def = definicao.split(/[(,)]+/);

	if (def[1] == null) {
		tamanho = 0;
	} else {
		if (def[3] == null) {
			if (def[2] == null) {
				tamanho = def[1].length;
			} else {
				for (let i = 0; i < def[2].length; i++) {
					if (def[2].charAt(i) == '9') {
						++tamanho;
					}
				}
			}
		} else {
			tamanho = parseInt(def[3]);
		}
	}


	return tamanho
}
/////////////////////////////////////////////////////////////////////////////
function CalcularTamanho(definicao, tipo) {

	console.log("Calcular Tamanho " + definicao + " " + tipo);
	let tamanho = 0;
	let def = [];

	switch (tipo) {
		case "Alfanumerico":
		case "Numerico":
		case "COMP":
		case "COMP-1":
		case "COMP-2":
		case "COMP-3":
		case "COMP-4":
		case "COMP-5":
		case "BINARY":

			def = definicao.split(/[(,)]+/);

			if (!definicao.includes("(")) {
				tamanho = definicao.length
			} else {

				if (def[1] == null) {

					for (let i = 0; i < definicao.length; i++) {
						if (definicao.charAt(i) == '9') {
							++tamanho;
						}
					}

				} else {

					if (def[3] == null) {
						for (let i = 0; i < def[2].length; i++) {
							if (def[2].charAt(i) == '9') {
								++tamanho;
							}
						}
						tamanho = tamanho + parseInt(def[1]);
					} else {
						tamanho = parseInt(def[1]) + parseInt(def[3]);
					}
				}
			}

			switch (tipo) {
				case "COMP":
				case "COMP-4":
				case "COMP-5":
				case "BINARY":
					if (tamanho <= 4) {
						tamanho = 2;
					} else {
						if (tamanho <= 9) {
							tamanho = 4;
						} else {
							tamanho = 8;
						}
					}
					break;
				case "COMP-1":
					tamanho = 4;
					break
				case "COMP-2":
					tamanho = 8;
					break;
				case "COMP-3":
					tamanho = Math.round((tamanho + 1) / 2);
					break;
			}
			break;

		case "Formatado":
		case "NATIONAL":
		case "DISPLAY":

			tamanho = definicao.length;
			break;

		default:
			console.log("nwnhum tamanho calculado");
			break;
	}

	return tamanho;
}
//////////////////////////////////////////////////////////
function CalculaOccurs(quadro) {

	console.log("Calcular Occurs");

	for (let i = 0; i < quadro.length; i++) {
		if (quadro[i][qPic] != "Grupo") {
			quadro[i].push(quadro[i][qOcorrencias] * quadro[i][qRec])
		}
	}

	return quadro;
}
//////////////////////////////////////////////////////////
function CalculaGrupo(quadro) {

	console.log("Calcular Grupo");


	quadro[0][qInicio] = 1;
	quadro[0][qFim] = quadro[0][qRecMultiplicado];

	for (let i = 1; i < quadro.length; i++) {

		if (quadro[i][qNivel] == quadro[i - 1][qNivel] || quadro[i][qNivel] == quadro[i - 1][qNivel]) {

			quadro[i][qInicio] = quadro[i - 1][qInicio] + quadro[i - 1][qRecMultiplicado];
			quadro[i][qFim] = quadro[i - 1][qFim] + quadro[i][qRecMultiplicado];

		} else {

			if (quadro[i][qNivel] > quadro[i - 1][qNivel]) {

				quadro[i][qInicio] = quadro[i - 1][qInicio];
				quadro[i][qFim] = quadro[i][qInicio] + quadro[i][qRecMultiplicado] - 1;

			} else {

				let j = 0;

				for (j = i - 1; j >= 0 && quadro[i][qNivel] != quadro[j][qNivel]; j--) {
				}

				if (quadro[i][qNivel] <= quadro[j][qNivel]) {
					quadro[i][qInicio] = quadro[j][qFim] + 1;
				}
				quadro[i][qFim] = quadro[i][qInicio] + quadro[i][qRecMultiplicado] - 1;

			}

		}

	}


	return quadro;
}
//////////////////////////////////////////////////////////
function Somar(quadro) {

	console.log("Somar");

	let Total = quadro[0][qRecMultiplicado];
	let i = 0;
	let j = 0;
	let k = 0;
	let Nivel = quadro[i][qNivel];
	let quadroTemp = [];



	for (i = 1; i < quadro.length; i++) {

		if (quadro[i][qNivel] > Nivel && k < i) {

			k = i;
			j = 0;
			quadroTemp = [];

			while (k < quadro.length && quadro[k][qNivel] > Nivel) {

				quadroTemp[j] = quadro[k];
				++k;
				++j;

			}

			quadro[i - 1][qRec] = Somar(quadroTemp);
			quadro[i - 1][qRecMultiplicado] = quadro[i - 1][qRec] * quadro[i - 1][qOcorrencias];
			if (quadro[i - 1][qRedefines] == false) {
				Total = Total + quadro[i - 1][qRecMultiplicado];
			}

		}


		if (Nivel == quadro[i][qNivel]) {

			Total = Total + quadro[i][qRecMultiplicado];

		}

	}



	return Total;

}



// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}