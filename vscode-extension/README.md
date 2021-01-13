# SP Formatter VSCode extension

SP Formatter VSCode extension creates a bridge between VSCode and SP Formatter web extension, makes it available to modify your Column Formatting JSON inside VSCode and have it synchronized to browser with live preview.

[![vscode-column-formatter](https://raw.githubusercontent.com/pnp/sp-formatter/master/vscode-extension/assets/column-formatter-vscode.jpg)](https://www.youtube.com/watch?t=117&v=xnyiDdLKWOA&feature=youtu.be)  
[Watch video](https://www.youtube.com/watch?t=117&v=xnyiDdLKWOA&feature=youtu.be)

## Prerequisites

- SP Formatter either for [Chrome](https://chrome.google.com/webstore/detail/sp-formatter/fmeihfaddhdkoogipahfcjlicglflkhg?hl=en) or [Edge](https://microsoftedge.microsoft.com/addons/detail/sp-formatter/eenbldkdgbfcfachaccldfgiajgjmjhi?hl=en-US) web extension needs to be installed.
- http port `11232` to be opened for connections

## How to configure

1. Open JSON Column Formatting file in VSCode
2. Right click and run `SP Formatter: start a new session`
3. Open a browser with SP Formatter web extension and navigate to your SharePoint site with column formatting. Enable SP Formatter for the current tab.
4. Edit column formatting JSON and wait for the message "VSCode is connected".
5. Modify the file inside VSCode and see how it is synchronized with browser.

## Additional intellisense for JSON formatting files

If your JSON formatting file name has one of the below endings:

- `*.column-formatter.json`, `*.column.formatter.json`, `*.column-format.json`, `*.column.format.json`

OR

- `*.view-formatter.json`, `*.view.formatter.json`, `*.view-format.json`, `*.view.format.json`

Then your `.json` file will be the subject for additional intellisense.

Additional intellisense includes:

- Fluent UI icon names suggestion
- `rel`, `role`, `target` property values
- full CSS styles intellisense with documentation and values based on CSS standards

> IMPORTANT!  
> To make additional intellisense to work, you should remove default `$schema` property from your JSON formatting file. If you still need it and at the same time want to leverage additional intellisense, you can setup a custom gulp task, which generates files with `$schema` proeprty, like in this [sample gist](https://gist.github.com/s-KaiNet/caa55846ae06475df3e43c28e1531784)

## Development

1. `npm i`
2. `npm run watch`
3. Open Chrome or Edge with SP Formatter and enable it for the current tab.
4. VSCode extension should have connected to the web extension.
5. You are ready for development.
