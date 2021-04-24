# SP Formatter web extension

This is the browser extension used in either [Google Chrome](https://developer.chrome.com/docs/extensions/) or the new [Microsoft Edge](https://developer.microsoft.com/microsoft-edge/extensions) (chromium).

## Development

To contribute to this extension, you'll need to setup your environment to be able to debug and validate your changes. This involves forking this repository, cloning it, creating a branch based on the `dev` branch, doing some awesome stuff, and then submitting a pull request. More details below!

### Setting up your environment

If you just want to build and run the extension locally you can clone the repository directly. BUT, if you'd like to contribute your changes back (yes, please!), you'll want to Fork the repository by clicking the Fork button in Github then clone that repository.

Once cloned, open this folder (web-extension) in VSCode (or your preferred editor). You'll find all the source code in the `src` folder.

But wait! There are a few tasks to get things setup. Fortunately, you'll only need to do them once and they should only take a few minutes:

#### Install dependent packages

Before you can do anything, you'll need to get the `node_modules` installed! You can do this from a terminal in this folder. We recommend opening a terminal directly in VSCode and then run the following command:

`npm install`

This will take a minute or two depending on your network speed. In the end, you'll have a new folder, `node_modules` that contains a few hundred megabytes worth of stuff that the extension and build system will use during development.

#### Setup a development profile

You'll need to configure your browser (Google Chrome or Microsoft Edge) to load the development version of the extension locally. Although you can do this in your primary profile, it is recommended to have a dedicated profile so that the development versions of extensions are isolated from your standard extensions.

Use the following instructions to setup a new profile in either browser:

- [Sign in and create multiple profiles in Microsoft Edge](https://support.microsoft.com/topic/sign-in-and-create-multiple-profiles-in-microsoft-edge-df94e622-2061-49ae-ad1d-6f0e43ce6435)
- [Share Chrome with others](https://support.google.com/chrome/answer/2364824)

#### Sideload the extension

During develpment, the browser can run and debug the extensions safely by sideloading it from your local system. You just need to tell your browser about it!

Use the following instructions to setup sideloading of the extension in your browser:

- [Sideload an extension](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/extension-sideloading) (Microsoft Edge)
- [Getting started](https://developer.chrome.com/docs/extensions/mv3/getstarted/#manifest) (Google Chrome - skip the manifest part)

Choose the `app` folder as the location of the extension.

### Run the extension

Now run the following command to build and run the extension:

`npm run watch`
