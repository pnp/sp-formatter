import { IField } from '../../../common/data/IField';

export async function getListFields(): Promise<IField[]> {
  const listTitle: string = (window as any)._spPageContextInfo.listTitle;
  let webAbsUrl: string = (window as any)._spPageContextInfo.webAbsoluteUrl;

  if (webAbsUrl.substr(-1) !== '/') {
    webAbsUrl = webAbsUrl + '/';
  }

  const fields: IField[] = (await (await fetch(`${webAbsUrl}_api/web/lists/getByTitle('${listTitle}')/fields`, {
    headers: {
      'Accept': 'application/json;odata=verbose'
    }
  })).json()).d.results;

  return fields.sort((a, b) => {
    return (a.Title > b.Title) ? 1 : ((b.Title > a.Title) ? -1 : 0)
  });
}