import { IField } from '../../../common/data/IField';

const fieldsCache = {};

export async function getListFields(): Promise<IField[]> {
  const listTitle: string = (window as any)._spPageContextInfo.listTitle;
  let webAbsUrl: string = (window as any)._spPageContextInfo.webAbsoluteUrl;

  if (fieldsCache[listTitle]) {
    return fieldsCache[listTitle];
  }

  if (webAbsUrl.substr(-1) !== '/') {
    webAbsUrl = webAbsUrl + '/';
  }

  let fields: IField[] = (await (await fetch(`${webAbsUrl}_api/web/lists/getByTitle('${listTitle}')/fields`, {
    headers: {
      'Accept': 'application/json;odata=verbose'
    }
  })).json()).d.results;

  fields = fields.sort((a, b) => {
    return (a.Title > b.Title) ? 1 : ((b.Title > a.Title) ? -1 : 0)
  });

  fieldsCache[listTitle] = fields;

  return fields;
}