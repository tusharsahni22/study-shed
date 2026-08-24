import { useState } from 'react';
import toast from 'react-hot-toast';
import { IndianRupee } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import { PaymentsAPI } from '../../api/endpoints.js';
import { PAYMENT_METHODS, PLAN_OPTIONS } from '../../lib/constants.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { toDateInput } from '../../lib/format.js';

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function PaymentModal({ student, onClose, onSaved }) {
  const { money } = useSettings();
  const [amount, setAmount] = useState(student?.monthlyFee ?? 0);
  const [method, setMethod] = useState('cash');
  const [forMonth, setForMonth] = useState(currentMonthKey());
  const [paidAt, setPaidAt] = useState(toDateInput(new Date()));
  const [note, setNote] = useState('');
  const [renew, setRenew] = useState(false);
  const [renewPlan, setRenewPlan] = useState(student?.plan || 'monthly');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (amount === '' || Number(amount) < 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setSaving(true);
    try {
      await PaymentsAPI.create({
        student: student._id,
        amount: Number(amount),
        method,
        forMonth,
        paidAt,
        note: note.trim() || undefined,
        renew,
        renewPlan: renew ? renewPlan : undefined,
      });
      toast.success(renew ? 'Payment recorded & subscription renewed' : 'Payment recorded');
      onSaved?.();
      onClose?.();
    } catch (e) {
      toast.error(e.message || 'Could not record payment');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={`Record payment — ${student?.name}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="subtle" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" icon={IndianRupee} onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Save payment'}
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Amount" hint={`Monthly fee is ${money(student?.monthlyFee)}`}>
          <input
            type="number"
            className="input"
            value={amount}
            min={0}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        <Field label="Method">
          <select className="select" value={method} onChange={(e) => setMethod(e.target.value)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="For month">
          <input
            type="month"
            className="input"
            value={forMonth}
            onChange={(e) => setForMonth(e.target.value)}
          />
        </Field>
        <Field label="Paid on">
          <input
            type="date"
            className="input"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
          />
        </Field>
        <Field label="Note (optional)" className="full">
          <input
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Paid via father"
          />
        </Field>
      </div>

      <label className={`check ${renew ? 'on' : ''}`} style={{ marginTop: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            checked={renew}
            onChange={(e) => setRenew(e.target.checked)}
            style={{ accentColor: 'var(--saffron)' }}
          />
          Extend / renew subscription with this payment
        </span>
      </label>

      {renew && (
        <Field label="Renew for" className="mt-0" style={{ marginTop: 14 }}>
          <select className="select" value={renewPlan} onChange={(e) => setRenewPlan(e.target.value)}>
            {PLAN_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label} ({p.months} mo)
              </option>
            ))}
          </select>
        </Field>
      )}
    </Modal>
  );
}
