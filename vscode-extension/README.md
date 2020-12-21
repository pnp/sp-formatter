# SP Formatter VSCode extension

SP Formatter VSCode extension creates a bridge between VSCode and SP Formatter web extension, makes it available to modify your Column Formatting JSON inside VSCode and have it synchronized to browser with live preview.
<!---
[![IMAGE ALT TEXT HERE](../web-extension/app/icons/column-formatter-vscode.jpg)](to be added)  
[Watch video](to be added)
--->

## How to configure

1. Open JSON Column Formatting file in VSCode
2. Right click and run `SP Formatter: start a new session`
3. Open a Chrome browser and navigate to your SharePoint site with column formatting. Enable SP Formatter Chrome web extension.
4. Edit column formatting JSON and wait for the message "VSCode is connected".
5. Modify the file inside VSCode and see how it is synchronized with browser.

### Prerequisites

- [SP Formatter](https://chrome.google.com/webstore/detail/sp-formatter/fmeihfaddhdkoogipahfcjlicglflkhg?hl=en) web extension needs to be installed.
- http port `11232` to be opened for connections

## Development

1. `npm i`
2. `npm run watch`
3. Open Chrome web extension and enable it.
4. VSCode extension should have connected to the web extension.
5. You are ready for development.
