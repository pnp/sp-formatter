import { FC } from 'react';
import * as React from 'react';
import { WebEventEmitter } from '../../../../common/events/WebEventEmitter';
import { Content } from '../../../../common/events/Events';
import { IField } from '../../../../common/data/IField';
import Autosuggest from 'react-autosuggest';

import './AutoSelector.css';
import { IconButton } from 'office-ui-fabric-react';

interface IProps {
  useFullScreen: boolean;
  width: number;
}

const pagePipe = WebEventEmitter.instance;

export const FieldSelector: FC<IProps> = (props) => {

  const [fields, setFields] = React.useState<IField[]>();
  const [value, setValue] = React.useState<string>('');
  const allFields = React.useRef<IField[]>();

  React.useEffect(() => {
    const getData = async () => {
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

      fields.push({
        Title: '@currentField',
        InternalName: '@currentField'
      });

      allFields.current = fields;
      setFields(fields);
    }

    getData();
  }, [])

  const onClose = () => {
    pagePipe.emit(Content.onCloseSelectField, null);
  }

  const getSuggestions = (value: string) => {
    if (!value) {
      return allFields.current;
    }
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? allFields.current : allFields.current.filter(f =>
      f.Title.toLocaleLowerCase().indexOf(inputValue.toLocaleLowerCase()) !== -1 || f.InternalName.toLocaleLowerCase().indexOf(inputValue.toLocaleLowerCase()) !== -1
    );
  };

  const onSuggestionsClearRequested = () => {
    setFields(allFields.current);
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setFields(getSuggestions(value))
  };

  const getSuggestionValue = (suggestion: IField) => suggestion.Title;

  const onChange = (event, { newValue }) => {
    setValue(newValue);
  };
  const inputProps = {
    placeholder: 'Type to filter',
    value,
    onChange: onChange,
    autoFocus: true
  };

  const onSuggestionSelected = (event, { suggestion }: { suggestion: IField }) => {

    pagePipe.emit<IField>(Content.onSelectField, {
      Title: suggestion.Title,
      InternalName: suggestion.InternalName
    });
  }

  const renderSuggestion = (suggestion: IField) => (
    <div>
      <div className={'select-field__title'}>{suggestion.Title}</div>
      <div className={'select-field__internal'}>{suggestion.InternalName}</div>
    </div>
  );

  let customStyles: React.CSSProperties = null;

  if (props.useFullScreen) {
    customStyles = {
      position: 'fixed',
      top: '10px',
      right: '70px',
      width: props.width + 'px',
      zIndex: 3000,
    }
  } else {
    customStyles = {
      position: 'absolute',
      top: '10px',
      right: '70px',
      zIndex: 3000,
      width: props.width + 'px'
    }
  }

  if (!fields) {
    return (
      <div style={customStyles}>
        <h2 style={{
          textAlign: 'center',
          backgroundColor: '#fffdfd'
        }}>Fetching...</h2>
      </div>
    )
  }

  return (
    <div style={customStyles}>
      <div style={{
        margin: '0 auto',
        width: '300px',
        position: 'relative'
      }}>
        <IconButton style={{
          position: 'absolute',
          right: '-35px'
        }} iconProps={{ iconName: 'ChromeClose' }} title="Close" onClick={onClose} />
        <Autosuggest
          suggestions={fields}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
          onSuggestionSelected={onSuggestionSelected}
          alwaysRenderSuggestions={true}
        />
      </div>
    </div>
  )
}