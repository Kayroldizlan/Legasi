"use client";

import * as React from "react";
import toast from "react-hot-toast";

import { Button, Card, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { updateNotificationPreferencesAction } from "@/lib/actions/notifications";
import {
  DEFAULT_NOTIFICATION_TYPE_SETTINGS,
  NOTIFICATION_TYPE_LABELS,
} from "@/lib/notifications/constants";
import { isPushSupported, requestPushPermission } from "@/lib/notifications/push-foundation";

import type { NotificationPreferences, NotificationType } from "@/types/database";

interface Props {
  initial: NotificationPreferences;
}

export function NotificationPreferencesForm({ initial }: Props) {
  const [prefs, setPrefs] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);

  const toggleType = (type: NotificationType) => {
    setPrefs((prev) => ({
      ...prev,
      type_settings: {
        ...DEFAULT_NOTIFICATION_TYPE_SETTINGS,
        ...prev.type_settings,
        [type]: !(prev.type_settings?.[type] ?? true),
      },
    }));
  };

  const save = async () => {
    setSaving(true);
    const result = await updateNotificationPreferencesAction({
      typeSettings: prefs.type_settings,
      emailEnabled: prefs.email_enabled,
      pushEnabled: prefs.push_enabled,
      soundEnabled: prefs.sound_enabled,
    });
    setSaving(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setPrefs(result.data);
    toast.success("Notification preferences saved");
  };

  const enablePush = async () => {
    const permission = await requestPushPermission();
    if (permission !== "granted") {
      toast.error("Push permission was not granted.");
      return;
    }
    setPrefs((prev) => ({ ...prev, push_enabled: true }));
    toast.success("Push notifications enabled in browser");
  };

  return (
    <Card className="rounded-[1.25rem] border-zinc-200 bg-white shadow-soft">
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription className="text-zinc-500">
          Choose what you want to be notified about across Legasi.
        </CardDescription>
      </CardHeader>

      <div className="space-y-6 px-6 pb-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(NOTIFICATION_TYPE_LABELS) as NotificationType[]).map((type) => (
            <label
              key={type}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-sm"
            >
              <span className="text-ink">{NOTIFICATION_TYPE_LABELS[type]}</span>
              <input
                type="checkbox"
                checked={prefs.type_settings?.[type] ?? true}
                onChange={() => toggleType(type)}
                className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <ToggleRow
            label="Email notifications"
            checked={prefs.email_enabled}
            onChange={(emailEnabled) => setPrefs((prev) => ({ ...prev, email_enabled: emailEnabled }))}
          />
          <ToggleRow
            label="Sound alerts"
            checked={prefs.sound_enabled}
            onChange={(soundEnabled) => setPrefs((prev) => ({ ...prev, sound_enabled: soundEnabled }))}
          />
          <ToggleRow
            label="Push notifications"
            checked={prefs.push_enabled}
            onChange={(pushEnabled) => setPrefs((prev) => ({ ...prev, push_enabled: pushEnabled }))}
          />
        </div>

        {isPushSupported() && !prefs.push_enabled && (
          <Button type="button" variant="secondary" onClick={enablePush}>
            Enable browser push
          </Button>
        )}

        <Button type="button" loading={saving} onClick={save}>
          Save preferences
        </Button>
      </div>
    </Card>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2.5 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
      />
    </label>
  );
}
