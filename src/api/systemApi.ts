import request from './index';

export interface ConfigGroupData {
  basic: {
    site_name: string;
    site_description: string;
    site_keywords: string[];
    site_icp: string;
    site_footer: string;
  };
  security: {
    security_login_attempts: number;
    security_jwt_expire_hours: number;
    security_session_timeout: number;
    security_enable_captcha: boolean;
  };
  notification: {
    notification_email_on_comment: boolean;
    notification_email_on_register: boolean;
    notification_admin_email: string;
  };
  theme: {
    theme_admin: 'light' | 'dark' | 'auto';
    theme_primary_color: string;
    theme_sidebar_collapsed: boolean;
  };
  backup: {
    backup_auto_schedule: string;
    backup_retention_days: number;
    backup_enable_auto: boolean;
  };
}

export const systemApi = {

  // 获取所有配置
  getSystemConfigs() {
    return request.get<ConfigGroupData>('/system/configs');
  },

  updateSystemConfigs(payload) {
    return request.get<ConfigGroupData>('/system/configs');
  }
}
