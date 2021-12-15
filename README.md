# SP Formatter

Customize your SharePoint Column,View or Form Layout Formatting JSON using full-featured editor instead of the default one. Supports [Google Chrome](https://chrome.google.com/webstore/detail/sp-formatter/fmeihfaddhdkoogipahfcjlicglflkhg?hl=en) and [Microsoft Edge (Chromium)](https://microsoftedge.microsoft.com/addons/detail/sp-formatter/eenbldkdgbfcfachaccldfgiajgjmjhi?hl=en-US).

[![youtube video](web-extension/app/icons/column-formatter-yt.jpg)](https://youtu.be/xnyiDdLKWOA)
[Watch video](https://youtu.be/xnyiDdLKWOA)

## SP Formatter editor features

- Live Preview as you type (no need to click "Preview" button)
- Intellisense (suggestions) based on Column or View formatting schema, CSS styles, replaceable tokens (`@currentField`, list fields with `$` based on the context)
- JSON validation with error messages in the editor
- Help tooltips for JSON properties
- Color highlights
- Line numbers, brace matching, collapsible regions
- Hotkeys: search, replace, format document, go to line and more (read more on hotkeys further below)
- Easily switch between default and enhanced editor
- VSCode integration (change JSON in VSCode and see live updates in SharePoint)
- Split screen mode

## Supported platforms

- SharePoint Online
- SharePoint 2019

## Some useful HOT KEYS

- CTRL + F: Search  
- CTRL + Space: Explicitly request suggestions  
- CTRL + G: Go to line  
- SHIFT + ALT + F: Format document  
- F1: Show command palette  
 ... and some others available in VSCode's monaco editor.

## VSCode integration mode

You can edit your Column Formatting JSON inside VSCode and have it synchronized to a browser with live preview.

### Prerequisites

- [SP Formatter](https://marketplace.visualstudio.com/items?itemName=s-kainet.sp-formatter) VSCode extension needs to be installed.
- http port `11232` to be opened for connections

### How to configure

1. In VSCode open desired file with Column Formatting JSON (a file should have `.json` extension)
2. Right click on a file and run `SP Formatter: start a new session` command
3. Launch your browser with SP Formatter web extension. Enable SP Formatter and open any json formatting on a SharePoint page.
4. Wait for `VSCode is connected` message with a file name from VSCode instance.
5. Edit file in VSCode and see live results in a browser.

### Known issues

1. If you have SP Formatter web extension enabled and navigate between different SharePoint pages, SP Formatter might not work properly (or not work at all).  

    SP Formatter "loses" context when you navigate between SharePoint pages in a same browser tab because of the async navigation nature in SPO. It's hard to track such navigation from the extension code.

    > **How to fix:** Just open a page, where you're going to format view\columns and perform a page refresh (F5) or hard refresh (CTRL + F5). Now SP Formatter should work as normal

2. If you're switching between Column\View formatting, or choosing different columns for Column formatting, or choosing different form layout options (Body, Header, Footer), you should always re-enable SP Formatter using toggle button, so that it picks the right context.

### PRIVACY POLICY  

SP Formatter does not collect nor store any personal data.
