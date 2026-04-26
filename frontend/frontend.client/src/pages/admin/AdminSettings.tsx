import { useState } from "react";
import { Save, User, Lock, Bell, Shield } from "lucide-react";
import { useTheme } from "../../layout/useTheme";

export default function AdminSettings() {
  const theme: any = useTheme();
  const darkMode = theme && theme.darkMode ? true : false;

  const pageBg = darkMode ? "#0f172a" : "#f9fafb";
  const cardBg = darkMode ? "#111827" : "#ffffff";
  const mainText = darkMode ? "#f8fafc" : "#111827";
  const mutedText = darkMode ? "#94a3b8" : "#6b7280";
  const border = darkMode ? "#334155" : "#e5e7eb";
  const inputBg = darkMode ? "#0f172a" : "#ffffff";

  const [settings, setSettings] = useState({
    name: "Admin User",
    email: "admin@jobify.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    applicationAlerts: true,
    weeklyReports: false,
    autoApproveRecruiters: false,
    requireEmailVerification: true,
  });

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${border}`,
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: inputBg,
    color: mainText,
  };

  const cardStyle = {
    backgroundColor: cardBg,
    borderRadius: "12px",
    padding: "24px",
    border: `1px solid ${border}`,
    boxShadow: darkMode
      ? "0 12px 30px rgba(0,0,0,0.35)"
      : "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "24px",
  };

  const handleSave = () => {
    alert("Settings saved successfully");
  };

  const handlePasswordChange = () => {
    if (!settings.currentPassword || !settings.newPassword || !settings.confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (settings.newPassword !== settings.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    alert("Password changed successfully");
    setSettings({
      ...settings,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const Toggle = ({
    checked,
    onClick,
  }: {
    checked: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      style={{
        width: "44px",
        height: "24px",
        backgroundColor: checked ? "#3b82f6" : darkMode ? "#334155" : "#d1d5db",
        border: "none",
        borderRadius: "12px",
        position: "relative",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          backgroundColor: "white",
          borderRadius: "50%",
          position: "absolute",
          top: "2px",
          left: checked ? "22px" : "2px",
          transition: "all 0.2s",
        }}
      />
    </button>
  );

  const SectionTitle = ({
    icon,
    title,
    subtitle,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
  }) => (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        {icon}
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: mainText }}>{title}</h2>
      </div>
      <p style={{ fontSize: "14px", color: mutedText, marginBottom: "20px" }}>{subtitle}</p>
    </>
  );

  const SettingRow = ({
    title,
    subtitle,
    checked,
    onClick,
    borderBottom = true,
  }: {
    title: string;
    subtitle: string;
    checked: boolean;
    onClick: () => void;
    borderBottom?: boolean;
  }) => (
    <div
      style={{
        marginBottom: borderBottom ? "16px" : "0",
        paddingBottom: borderBottom ? "16px" : "0",
        borderBottom: borderBottom ? `1px solid ${border}` : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: mainText }}>
            {title}
          </p>
          <p style={{ fontSize: "13px", color: mutedText }}>{subtitle}</p>
        </div>
        <Toggle checked={checked} onClick={onClick} />
      </div>
    </div>
  );

  return (
    <div
      className="admin-page"
      style={{
        padding: "24px",
        backgroundColor: pageBg,
        minHeight: "100vh",
        color: mainText,
      }}
    >
      <div className="admin-header">
        <h1>Settings</h1>
        <p>Manage your admin account and application settings</p>
      </div>

      <div style={cardStyle}>
        <SectionTitle
          icon={<User style={{ width: "20px", height: "20px", color: "#3b82f6" }} />}
          title="Account Settings"
          subtitle="Update your personal information"
        />

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
            Full Name
          </label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
            Email Address
          </label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            style={inputStyle}
          />
        </div>

        <button className="admin-btn admin-btn-primary" onClick={handleSave}>
          <Save style={{ width: "16px", height: "16px" }} />
          Save Changes
        </button>
      </div>

      <div style={cardStyle}>
        <SectionTitle
          icon={<Lock style={{ width: "20px", height: "20px", color: "#3b82f6" }} />}
          title="Password"
          subtitle="Change your password"
        />

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
            Current Password
          </label>
          <input
            type="password"
            value={settings.currentPassword}
            onChange={(e) => setSettings({ ...settings, currentPassword: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
            New Password
          </label>
          <input
            type="password"
            value={settings.newPassword}
            onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
            Confirm New Password
          </label>
          <input
            type="password"
            value={settings.confirmPassword}
            onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
            style={inputStyle}
          />
        </div>

        <button className="admin-btn admin-btn-primary" onClick={handlePasswordChange}>
          <Lock style={{ width: "16px", height: "16px" }} />
          Update Password
        </button>
      </div>

      <div style={cardStyle}>
        <SectionTitle
          icon={<Bell style={{ width: "20px", height: "20px", color: "#3b82f6" }} />}
          title="Notifications"
          subtitle="Manage your notification preferences"
        />

        <SettingRow
          title="Email Notifications"
          subtitle="Receive email updates about system activity"
          checked={settings.emailNotifications}
          onClick={() =>
            setSettings({ ...settings, emailNotifications: !settings.emailNotifications })
          }
        />

        <SettingRow
          title="Application Alerts"
          subtitle="Get notified when new applications are submitted"
          checked={settings.applicationAlerts}
          onClick={() =>
            setSettings({ ...settings, applicationAlerts: !settings.applicationAlerts })
          }
        />

        <SettingRow
          title="Weekly Reports"
          subtitle="Receive weekly summary reports"
          checked={settings.weeklyReports}
          onClick={() =>
            setSettings({ ...settings, weeklyReports: !settings.weeklyReports })
          }
          borderBottom={false}
        />
      </div>

      <div style={{ ...cardStyle, marginBottom: 0 }}>
        <SectionTitle
          icon={<Shield style={{ width: "20px", height: "20px", color: "#3b82f6" }} />}
          title="System Settings"
          subtitle="Configure application behavior"
        />

        <SettingRow
          title="Auto-Approve Recruiters"
          subtitle="Automatically verify recruiter accounts"
          checked={settings.autoApproveRecruiters}
          onClick={() =>
            setSettings({
              ...settings,
              autoApproveRecruiters: !settings.autoApproveRecruiters,
            })
          }
        />

        <SettingRow
          title="Require Email Verification"
          subtitle="Users must verify their email before accessing the platform"
          checked={settings.requireEmailVerification}
          onClick={() =>
            setSettings({
              ...settings,
              requireEmailVerification: !settings.requireEmailVerification,
            })
          }
          borderBottom={false}
        />
      </div>
    </div>
  );
}