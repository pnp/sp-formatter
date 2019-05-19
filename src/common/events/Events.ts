export class Popup {
    private static prefix = 'cf_popup_';
    public static onChangeEnabled = `${Popup.prefix}change_enabled`;
}

export class Content {
    private static prefix = 'cf_content_';
    public static onGetTabId = `${Content.prefix}get_tab_id`;
    public static onSendTabId = `${Content.prefix}send_tab_id`;
}
