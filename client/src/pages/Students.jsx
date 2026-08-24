import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, UserPlus, Eye, Pencil, Trash2, Users } from 'lucide-react';
import { useApi } from '../hooks/useApi.js';
import { StudentsAPI, ClassesAPI } from '../api/endpoints.js';
import { useSettings } from '../context/SettingsContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge, { StatusBadge } from '../components/ui/Badge.jsx';
import SubscriptionBar from '../components/ui/SubscriptionBar.jsx';
import { Spinner } from '../components/ui/Loader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { initials } from '../lib/format.js';

export default function Students() {
  const { money } = useSettings();
  const navigate = useNavigate();

  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [classPlan, setClassPlan] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('remaining');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data: classes } = useApi(() => ClassesAPI.list(), []);
  const params = {
    ...(debouncedQ && { q: debouncedQ }),
    ...(classPlan && { classPlan }),
    ...(status && { status }),
    sort,
  };
  const { data: students, loading, refetch } = useApi(
    () => StudentsAPI.list(params),
    [debouncedQ, classPlan, status, sort]
  );

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await StudentsAPI.remove(toDelete._id);
      toast.success(`${toDelete.name} removed`);
      setToDelete(null);
      refetch();
    } catch (e) {
      toast.error(e.message || 'Could not delete student');
    } finally {
      setDeleting(false);
    }
  }

  const rows = students || [];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">Roster</div>
          <h2>Students</h2>
          <p>Everyone enrolled at your centre, with live subscription runways.</p>
        </div>
        <Link to="/students/new">
          <Button variant="primary" icon={UserPlus}>
            Enroll student
          </Button>
        </Link>
      </div>

      <div className="toolbar">
        <div className="search grow">
          <Search size={16} />
          <input
            className="input"
            placeholder="Search by student, parent or phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="select" value={classPlan} onChange={(e) => setClassPlan(e.target.value)}>
          <option value="">All classes</option>
          {(classes || []).map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="remaining">Sort: Expiring first</option>
          <option value="name">Sort: Name (A–Z)</option>
          <option value="recent">Sort: Recently added</option>
        </select>
      </div>

      <Card bodyClass="tight">
        {loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students found"
            hint="Try clearing the filters, or enrol a new student to get started."
            action={
              <Link to="/students/new">
                <Button variant="primary" icon={UserPlus}>
                  Enroll student
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="table-scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Subjects</th>
                  <th className="right">Fee / mo</th>
                  <th>Subscription</th>
                  <th>Status</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <Link to={`/students/${s._id}`} className="person" style={{ color: 'inherit' }}>
                        <div className="avatar">{initials(s.name)}</div>
                        <div className="who">
                          <span className="nm">{s.name}</span>
                          <span className="sub">{s.parentName}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="muted">{s.classPlan?.name || '—'}</td>
                    <td className="muted">
                      <Badge tone="neutral">{s.subjects?.length || 0}</Badge>
                    </td>
                    <td className="right num">{money(s.monthlyFee)}</td>
                    <td style={{ minWidth: 150 }}>
                      <SubscriptionBar days={s.remainingDays} />
                    </td>
                    <td>
                      <StatusBadge status={s.subscriptionStatus} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <Button
                          variant="subtle"
                          size="sm"
                          icon={Eye}
                          title="View"
                          onClick={() => navigate(`/students/${s._id}`)}
                        />
                        <Button
                          variant="subtle"
                          size="sm"
                          icon={Pencil}
                          title="Edit"
                          onClick={() => navigate(`/students/${s._id}/edit`)}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          title="Delete"
                          onClick={() => setToDelete(s)}
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

      {rows.length > 0 && (
        <div style={{ color: 'var(--text-faint)', fontSize: 13, marginTop: 12 }}>
          {rows.length} student{rows.length === 1 ? '' : 's'}
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete student?"
          message={`This permanently removes ${toDelete.name}, along with their payment and reminder history. This can’t be undone.`}
          confirmLabel="Delete student"
          busy={deleting}
          onConfirm={confirmDelete}
          onClose={() => !deleting && setToDelete(null)}
        />
      )}
    </>
  );
}
