import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, GraduationCap, BookOpen } from 'lucide-react';
import { useApi } from '../hooks/useApi.js';
import { ClassesAPI, SubjectsAPI } from '../api/endpoints.js';
import { useSettings } from '../context/SettingsContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Field from '../components/ui/Field.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Spinner } from '../components/ui/Loader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';

function ClassModal({ initial, onClose, onSaved }) {
  const [name, setName] = useState(initial?.name || '');
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [baseMonthlyFee, setBaseMonthlyFee] = useState(initial?.baseMonthlyFee ?? 0);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?._id);

  async function submit() {
    if (!name.trim()) return toast.error('Class name is required');
    setSaving(true);
    try {
      const body = { name: name.trim(), order: Number(order), baseMonthlyFee: Number(baseMonthlyFee) };
      if (isEdit) await ClassesAPI.update(initial._id, body);
      else await ClassesAPI.create(body);
      toast.success(isEdit ? 'Class updated' : 'Class added');
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.message || 'Could not save class');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit class' : 'Add class'}
      onClose={onClose}
      footer={
        <>
          <Button variant="subtle" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </>
      }
    >
      <Field label="Class name">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Class 8" />
      </Field>
      <div className="form-grid">
        <Field label="Base monthly fee">
          <input
            type="number"
            className="input"
            value={baseMonthlyFee}
            min={0}
            onChange={(e) => setBaseMonthlyFee(e.target.value)}
          />
        </Field>
        <Field label="Display order" hint="Lower shows first">
          <input type="number" className="input" value={order} onChange={(e) => setOrder(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

function SubjectModal({ initial, onClose, onSaved }) {
  const [name, setName] = useState(initial?.name || '');
  const [code, setCode] = useState(initial?.code || '');
  const [addOnFee, setAddOnFee] = useState(initial?.addOnFee ?? 0);
  const [active, setActive] = useState(initial?.active ?? true);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?._id);

  async function submit() {
    if (!name.trim()) return toast.error('Subject name is required');
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        code: code.trim() || undefined,
        addOnFee: Number(addOnFee),
        active,
      };
      if (isEdit) await SubjectsAPI.update(initial._id, body);
      else await SubjectsAPI.create(body);
      toast.success(isEdit ? 'Subject updated' : 'Subject added');
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.message || 'Could not save subject');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? 'Edit subject' : 'Add subject'}
      onClose={onClose}
      footer={
        <>
          <Button variant="subtle" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Subject name" className="full">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mathematics" />
        </Field>
        <Field label="Code (optional)">
          <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. MATH" />
        </Field>
        <Field label="Add-on fee / month">
          <input
            type="number"
            className="input"
            value={addOnFee}
            min={0}
            onChange={(e) => setAddOnFee(e.target.value)}
          />
        </Field>
      </div>
      <label className={`check ${active ? 'on' : ''}`} style={{ maxWidth: 220 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            style={{ accentColor: 'var(--saffron)' }}
          />
          Available for enrolment
        </span>
      </label>
    </Modal>
  );
}

export default function FeesPlans() {
  const { money } = useSettings();
  const { data: classes, loading: lc, refetch: refetchClasses } = useApi(() => ClassesAPI.list(), []);
  const { data: subjects, loading: ls, refetch: refetchSubjects } = useApi(() => SubjectsAPI.list(), []);

  const [classModal, setClassModal] = useState(null); // {} for new, obj for edit
  const [subjectModal, setSubjectModal] = useState(null);
  const [del, setDel] = useState(null); // { kind, item }
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!del) return;
    setDeleting(true);
    try {
      if (del.kind === 'class') await ClassesAPI.remove(del.item._id);
      else await SubjectsAPI.remove(del.item._id);
      toast.success('Deleted');
      setDel(null);
      del.kind === 'class' ? refetchClasses() : refetchSubjects();
    } catch (e) {
      toast.error(e.message || 'Could not delete — it may be in use');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Configuration</div>
          <h2>Classes &amp; Fees</h2>
          <p>Set the base fee for each class and the monthly add-on for each subject.</p>
        </div>
      </div>

      <div className="grid grid-2">
        <Card
          title="Classes"
          subtitle={`${(classes || []).length} classes`}
          actions={
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setClassModal({})}>
              Add class
            </Button>
          }
          bodyClass="tight"
        >
          {lc ? (
            <Spinner />
          ) : (classes || []).length === 0 ? (
            <EmptyState icon={GraduationCap} title="No classes yet" hint="Add classes from Nursery through Class 12." />
          ) : (
            <div className="table-scroll">
              <table className="tbl" style={{ minWidth: 420 }}>
                <thead>
                  <tr>
                    <th>Class</th>
                    <th className="right">Base fee / mo</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c) => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td className="right num">{money(c.baseMonthlyFee)}</td>
                      <td>
                        <div className="row-actions">
                          <Button variant="subtle" size="sm" icon={Pencil} title="Edit" onClick={() => setClassModal(c)} />
                          <Button
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            title="Delete"
                            onClick={() => setDel({ kind: 'class', item: c })}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card
          title="Subjects"
          subtitle={`${(subjects || []).length} subjects`}
          actions={
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setSubjectModal({})}>
              Add subject
            </Button>
          }
          bodyClass="tight"
        >
          {ls ? (
            <Spinner />
          ) : (subjects || []).length === 0 ? (
            <EmptyState icon={BookOpen} title="No subjects yet" hint="Add subjects with their monthly add-on fee." />
          ) : (
            <div className="table-scroll">
              <table className="tbl" style={{ minWidth: 460 }}>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th className="right">Add-on / mo</th>
                    <th>Status</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                        {s.code && <span className="tag-pill">{s.code}</span>}
                      </td>
                      <td className="right num">{money(s.addOnFee)}</td>
                      <td>
                        {s.active !== false ? (
                          <Badge tone="active" dot>
                            Active
                          </Badge>
                        ) : (
                          <Badge tone="neutral">Hidden</Badge>
                        )}
                      </td>
                      <td>
                        <div className="row-actions">
                          <Button variant="subtle" size="sm" icon={Pencil} title="Edit" onClick={() => setSubjectModal(s)} />
                          <Button
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            title="Delete"
                            onClick={() => setDel({ kind: 'subject', item: s })}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {classModal && (
        <ClassModal initial={classModal} onClose={() => setClassModal(null)} onSaved={refetchClasses} />
      )}
      {subjectModal && (
        <SubjectModal initial={subjectModal} onClose={() => setSubjectModal(null)} onSaved={refetchSubjects} />
      )}
      {del && (
        <ConfirmDialog
          title={`Delete ${del.kind}?`}
          message={`Delete “${del.item.name}”? Classes or subjects currently assigned to students can’t be deleted.`}
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={confirmDelete}
          onClose={() => !deleting && setDel(null)}
        />
      )}
    </>
  );
}
