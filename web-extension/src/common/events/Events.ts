export class Popup {
  private static prefix = 'cf_popup_';
  public static onChangeEnabled = `${Popup.prefix}change_enabled`;
}

export class Content {
  private static prefix = 'cf_content_';
  public static onGetTabId = `${Content.prefix}get_tab_id`;
  public static onSendTabId = `${Content.prefix}send_tab_id`;

  public static onGetExtensionSettings = `${Content.prefix}get_ext_settings`;
  public static onSendExtensionSettings = `${Content.prefix}send_ext_settings`;

  public static onSaveExtensionSettings = `${Content.prefix}save_ext_settings`;
  public static onSavedExtensionSettings = `${Content.prefix}saved_ext_settings`;

  public static onToggleEnabledColumnFormatter = `${Content.prefix}toggle_enable_column_formatter`;
  public static onToggleEnabledFormFormatter = `${Content.prefix}toggle_enable_form_formatter`;

  public static onGetColumnFormattingSchema = `${Content.prefix}get_column_schema`;
  public static onSendColumnFormattingSchema = `${Content.prefix}send_column_schema`;

  public static onGetViewFormattingSchema = `${Content.prefix}get_view_schema`;
  public static onSendViewFormattingSchema = `${Content.prefix}send_view_schema`;

  public static onGetFormattingSchemas = `${Content.prefix}get_formatter_schemas`;
  public static onSendFormattingSchemas = `${Content.prefix}send_formatter_schemas`;

  public static onToggleFullScreenMode = `${Content.prefix}toggle_full_screen_mode`;

  public static onSelectField = `${Content.prefix}select_field`;

  public static onCloseSelectField = `${Content.prefix}close_select_field`;
  public static onGetSpPageContextInfo = `${Content.prefix}get_sp_page_context_info`;
  public static onSendSpPageContextInfo = `${Content.prefix}send_sp_page_context_info`;

  public static Vscode = {
    onConnected: 'vscode_connected',
    onGetFileName: 'vscode_get_file_name',
    onSendFileName: 'vscode_send_file_name',
    onSendFileContent: 'vscode_send_file_content',
    onInitFileContent: 'vscode_init_file_content',
    onGetListFields: 'vscode_get_list_fields',
    onSendListFields: 'vscode_send_list_fields'
  }
}
