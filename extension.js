const try_require = function(path){
	try {
		return require(path);
	}
	catch (e) {
		console.log('error');
		console.log(e);
		vscode.window.showErrorMessage(`Error occured : require(${path}) failed.`);
		return undefined;
	}
}

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const twitter = require("twitter");
const token = try_require("./token.json");
const tw = new twitter(token);

// https://javascript.programmer-reference.com/javascript-han1zen2/
const getStrLen_Twitter = function (str) {
	var result = 0;
	for (var i = 0; i < str.length; i++) {
		var chr = str.charCodeAt(i);
		if ((chr >= 0x00 && chr < 0x81) ||
			(chr === 0xf8f0) ||
			(chr >= 0xff61 && chr < 0xffa0) ||
			(chr >= 0xf8f1 && chr < 0xf8f4)) {
			//半角文字の場合は1を加算
			result += 1;
		} else {
			//それ以外の文字の場合は2を加算
			result += 2;
		}
	}
	//結果を返す
	return result;
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.commands.registerCommand('extension.posttweet', function () {
		// https://tasoweb.hatenablog.com/entry/2018/06/01/002438

		if(!token){
			return;
		}

		console.log("start post tweet");

		let editor = vscode.window.activeTextEditor; // エディタ取得
		if(!editor){
			vscode.window.showErrorMessage("Open new window, write, and call extension.posttweet");
			return;
		}
		const doc = editor.document; // ドキュメント取得
		let text = doc.getText();
		let closeWindowAfterTweet;
		if(editor.selection.isEmpty){
			// 選択範囲が空のときはテキスト全体をツイート
			// ツイート用に新しいwindowを開いたということなのでツイート後はその窓を閉じる
			closeWindowAfterTweet = true;
		}
		else{
			// 選択範囲が空でないときは選択範囲のみをツイート
			text = doc.getText(editor.selection);
			closeWindowAfterTweet = false;
		}
		console.log("text : " + text);

		if(getStrLen_Twitter(text) > 280){
			vscode.window.showErrorMessage(`The length of message (${getStrLen_Twitter(text)}) must be 280 or less : ${text}`);
			vscode.window.showErrorMessage("Open new window, write, and call extension.posttweet");
			return;
		}

		tw.post('statuses/update', {status: text}, function(error, tweet, response){
			if (error) {
				console.log('error');
				console.log(response);
				vscode.window.showErrorMessage(`Error occured : ${JSON.parse(response.body).errors[0].message} ${JSON.stringify(response)}`);
			}
			else{
				console.log("Tweeted succeefully : " + tweet);
				vscode.window.showInformationMessage("Tweeted succeefully! : " + text);
				if(closeWindowAfterTweet){
					vscode.commands.executeCommand('workbench.action.closeActiveEditor');
				}
			}
		});
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
