import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save, RotateCcw, MessageCircle, MessageSquare, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import { SettingsAPI } from '../api/endpoints.js';
import { useSettings } from '../context/SettingsContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Field from '../components/ui/Field.jsx';
import { CURRENCY_OPTIONS } from '../lib/constants.js';

const TOKENS = ['parentName', 'studentName', 'class', 'days', 'endDate', 'fee', 'currency', 'institute'];

function ChannelRow({ icon: Icon, label, configured, detail }) {
  return (
    <div className="hstack" style={{ justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-soft)' }}>
      <div className="hstack" style={{ gap: 12 }}>
        <span
          className="stat-icon"
          style={
            configured
              ? { '--tone': 'var(--emerald)', '--tone-soft': 'var(--emerald-soft)' }
              : { '--tone': 'var(--text-faint)', '--tone-soft': 'var(--surface-2)' }
          }
        >
          <Icon size={18} />
        </span>
        <div className="kv">
          <span className="v">{label}</span>
          <span className="k" style={{ textTransform: 'none', letterSpacing: 0 }}>{detail}</span>
        </div>
      </div>
      {configured ? (
        <Badge tone="active" dot>
          <CheckCircle2 size={13} /> Connected
        </Badge>
      ) : (
        <Badge tone="neutral">
          <XCircle size={13} /> Not configured
        </Badge>
      )}
    </div>
  );
}

export default function Settings() {
  const { settings, refresh } = useSettings();
  const [form, setForm] = useState({
    instituteName: '',
    currency: 'INR',
    reminderLeadDays: 7,
    reminderTemplate: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      instituteName: settings.instituteName || '',
      currency: settings.currency || 'INR',
      reminderLeadDays: settings.reminderLeadDays ?? 7,
      reminderTemplate: settings.reminderTemplate || settings.defaultTemplate || '',
    });
  }, [settings]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    if (!form.instituteName.trim()) return toast.error('Institute name is required');
    setSaving(true);
    try {
      await SettingsAPI.update({
        instituteName: form.instituteName.trim(),
        currency: form.currency,
        reminderLeadDays: Number(form.reminderLeadDays),
        reminderTemplate: form.reminderTemplate,
      });
      await refresh();
      toast.success('Settings saved');
    } catch (e) {
      toast.error(e.message || 'Could not save settings');
    } finally {
      setSaving(false);
    }
  }

  const messaging = settings.messaging || {};

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Preferences</div>
          <h2>Settings</h2>
          <p>Institute details, currency, reminder wording and messaging channels.</p>
        </div>
        <Button variant="primary" icon={Save} onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      <div className="grid dash-cols">
        <div className="stack">
          <Card title="Institute">
            <div className="form-grid">
              <Field label="Institute name" className="full">
                <input className="input" value={form.instituteName} onChange={set('instituteName')} />
              </Field>
              <Field label="Currency">
                <select className="select" value={form.currency} onChange={set('currency')}>
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Reminder lead time" hint="Days before expiry to flag as ‘expiring’">
                <input
                  type="number"
                  className="input"
                  min={1}
                  max={60}
                  value={form.reminderLeadDays}
                  onChange={set('reminderLeadDays')}
                />
              </Field>
            </div>
          </Card>

          <Card
            title="Reminder message"
            subtitle="Sent to parents — tokens are filled in per student"
            actions={
              <Button
                variant="subtle"
                size="sm"
                icon={RotateCcw}
                onClick={() =>
                  setForm((f) => ({ ...f, reminderTemplate: settings.defaultTemplate || '' }))
                }
              >
                Reset
              </Button>
            }
          >
            <Field hint={`Tokens: ${TOKENS.map((t) => `{${t}}`).join('  ')}`}>
              <textarea
                className="textarea"
                rows={6}
                value={form.reminderTemplate}
                onChange={set('reminderTemplate')}
              />
            </Field>
          </Card>
        </div>

        <Card title="Messaging channels" subtitle="Configured via server environment">
          <ChannelRow
            icon={MessageCircle}
            label="WhatsApp"
            configured={messaging.whatsapp?.configured}
            detail={
              messaging.whatsapp?.configured
                ? `Template: ${messaging.whatsapp.templateName || 'text mode'}`
                : 'WhatsApp Cloud API'
            }
          />
          <ChannelRow
            icon={MessageSquare}
            label="SMS"
            configured={messaging.sms?.configured}
            detail={messaging.sms?.configured ? `Provider: ${messaging.sms.provider}` : 'SMS gateway'}
          />
          <ChannelRow
            icon={Building2}
            label="Default country code"
            configured={Boolean(messaging.defaultCountryCode)}
            detail={`+${messaging.defaultCountryCode || '91'} prepended to 10-digit numbers`}
          />

          <div className="callout" style={{ marginTop: 18 }}>
            <MessageCircle size={18} />
            <span>
              When a channel isn’t configured, reminders are <b>simulated</b> and still logged — handy
              for trying things out. Add credentials to <code>server/.env</code> to send for real.
            </span>
          </div>
        </Card>
      </div>
    </>
  );
}
