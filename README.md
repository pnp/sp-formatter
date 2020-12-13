# SP Formatter

Customize your SharePoint Column or View Formatting JSON using full-featured editor instead of default one.

> **NOTE:** Support for Chromium Edge on its way. Please stay tuned!

[![IMAGE ALT TEXT HERE](app/icons/column-formatter-yt.jpg)](https://www.youtube.com/watch?v=UbTsI73qW7Q)

SP Formatter editor features:

- Live Preview as you type (no need to click "Preview" button)
- Intellisense (suggestions) based on Column or View formatting schema, CSS styles and custom values
- JSON validation with error messages in the editor
- Help tooltips for JSON properties
- Color highlights
- Line numbers, brace matching, collapsible regions
- Hotkeys: search, replace, format document, go to line and more (read more on hotkeys further below)
- Easily switch between default and enhanced editor

Supported platforms:  

- SharePoint Online
- SharePoint 2019

Some useful HOT KEYS:  

- CTRL + F: Search  
- CTRL + Space: Explicitly request suggestions  
- CTRL + G: Go to line  
- SHIFT + ALT + F: Format document  
- F1: Show command palette  
 ... and some others available in VSCode's monaco editor.

## Development

1. `npm i`
2. `npm run watch`
3. Create a new Chrome user profile. Go to extension and enable Developer mode toggle (top right corner).
4. Load unpacked extension by selecting `<path to sp-formatter repository>/app` folder.
