export const isInIframe = () => {
  return window !== window.parent;
}

export const waitForIframeInit = async (doc: Document, attempts: number = 0) => {
  if (attempts > 10) throw new Error('Iframe is not initialized');

  if (!doc.querySelector('.sp-ColumnCustomizationPane')) {
    await delay(1000);
    await waitForIframeInit(doc, attempts + 1);
  }
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
