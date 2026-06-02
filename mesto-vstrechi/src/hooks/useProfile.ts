import { useEffect, useState } from "react";
import type { ProfileSettings, Theme } from "../types";
import {
  getBackgroundColor,
  getBackgroundImage,
  getAppIcon,
  getDeviceId,
  getProfileAvatar,
  getProfileColor,
  getStableDeviceId,
  getTheme,
  saveStableDeviceId,
  setBackgroundColor,
  setBackgroundImage,
  setAppIcon,
  setDeviceId,
  setProfileAvatar,
  setProfileColor,
  setTheme
} from "../lib/storage";
import { applyAppIcon } from "../lib/appIcon";

export function useProfile() {
  const [deviceId, setDeviceIdState] = useState(() => getDeviceId());
  const [draftId, setDraftId] = useState(deviceId);
  const [theme, setThemeState] = useState<Theme>(() => getTheme());
  const [profileColor, setProfileColorState] = useState(() => getProfileColor());
  const [avatar, setAvatarState] = useState(() => getProfileAvatar());
  const [backgroundColor, setBackgroundColorState] = useState(() => getBackgroundColor());
  const [backgroundImage, setBackgroundImageState] = useState(() => getBackgroundImage());
  const [appIcon, setAppIconState] = useState(() => getAppIcon());

  useEffect(() => {
    let alive = true;

    getStableDeviceId().then((stableId) => {
      if (!alive || stableId === deviceId) {
        return;
      }

      setDeviceIdState(stableId);
      setDraftId(stableId);
      setDeviceId(stableId);
    });

    return () => {
      alive = false;
    };
  }, [deviceId]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.setProperty("--profile-color", profileColor);

    // В светлом режиме приложение должно оставаться светлым даже если раньше
    // пользователь сохранял тёмный цвет фона чата. Пользовательский фон
    // снова применяется при возврате в тёмную тему.
    document.documentElement.style.setProperty("--chat-bg", theme === "light" ? "#f8fafc" : backgroundColor);
    setTheme(theme);
  }, [backgroundColor, profileColor, theme]);

  useEffect(() => {
    applyAppIcon(appIcon);
  }, [appIcon]);

  async function saveProfile(): Promise<void> {
    await saveStableDeviceId(draftId);
    setDeviceId(draftId);
    setProfileColor(profileColor);
    setProfileAvatar(avatar);
    setBackgroundColor(backgroundColor);
    setBackgroundImage(backgroundImage);
    setAppIcon(appIcon);
    applyAppIcon(appIcon);
    window.location.reload();
  }

  const settings: ProfileSettings = {
    deviceId,
    draftId,
    theme,
    profileColor,
    avatar,
    backgroundColor,
    backgroundImage,
    appIcon
  };

  return {
    settings,
    setDraftId,
    setThemeState,
    setProfileColorState,
    setAvatarState,
    setBackgroundColorState,
    setBackgroundImageState,
    setAppIconState,
    saveProfile
  };
}
