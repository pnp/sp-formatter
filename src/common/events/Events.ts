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

    public static onToggleEnabledColumngFormatter = `${Content.prefix}toggle_enable_column_formatter`;

    public static onGetColumnFormattingSchema = `${Content.prefix}get_column_schema`;
    public static onSendColumnFormattingSchema = `${Content.prefix}send_column_schema`;

    public static onGetViewFormattingSchema = `${Content.prefix}get_view_schema`;
    public static onSendViewFormattingSchema = `${Content.prefix}send_view_schema`;

    public static onToggleFullScreenMode = '${Content.prefix}toggle_full_screen_mode';
}
