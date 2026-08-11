import { useEffect, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { Drawer } from "../components/Drawer";
import { RoleBadge } from "../components/RoleBadge";
import { Avatar } from "../components/Avatar";
import { fetchUsers, createUser, updateUser, toggleUserActive } from "../api/users";
import { fetchFilieres } from "../api/filieres";
import { useAuth } from "../context/AuthContext";

const NIVEAUX = ["Niveau3", "Niveau4", "Niveau5"];

const EMPTY_FORM = {
  full_name: "",
  email: "",
  role: "enseignant",
  password: "",
  filieres: [],
  affectations: [],
};

function ScopeCell({ user }) {
  if (user.role === "responsable_pedagogique") {
    if (!user.filieres?.length) {
      return <span className="cell-muted">Aucune filière</span>;
    }
    return (
      <div className="chip-select" style={{ gap: 4 }}>
        {user.filieres.map((f) => (
          <span key={f} className="pill-chip">{f}</span>
        ))}
      </div>
    );
  }
  if (user.role === "enseignant") {
    if (!user.affectations?.length) {
      return <span className="cell-muted">Aucune affectation</span>;
    }
    return (
      <div className="chip-select" style={{ gap: 4 }}>
        {user.affectations.map((a) => (
          <span key={`${a.filiere}-${a.niveau}`} className="pill-chip">
            {a.filiere} · {a.niveau}
          </span>
        ))}
      </div>
    );
  }
  return <span className="cell-muted">—</span>;
}

export default function GestionUtilisateurs() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    fetchUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    fetchFilieres().then(setFilieres);
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setDrawerOpen(true);
  }

  function openEdit(u) {
    setEditingId(u.id);
    setForm({
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      password: "",
      filieres: u.filieres || [],
      affectations: u.affectations || [],
    });
    setError("");
    setDrawerOpen(true);
  }

  function toggleFiliere(nom) {
    setForm((f) => ({
      ...f,
      filieres: f.filieres.includes(nom)
        ? f.filieres.filter((x) => x !== nom)
        : [...f.filieres, nom],
    }));
  }

  function addAffectation() {
    setForm((f) => ({
      ...f,
      affectations: [...f.affectations, { filiere: filieres[0]?.nom || "", niveau: NIVEAUX[0] }],
    }));
  }

  function updateAffectation(index, field, value) {
    setForm((f) => ({
      ...f,
      affectations: f.affectations.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    }));
  }

  function removeAffectation(index) {
    setForm((f) => ({ ...f, affectations: f.affectations.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        role: form.role,
        filieres: form.role === "responsable_pedagogique" ? form.filieres : [],
        affectations: form.role === "enseignant" ? form.affectations : [],
      };
      if (editingId) {
        await updateUser(editingId, payload);
      } else {
        await createUser({ ...payload, password: form.password });
      }
      setDrawerOpen(false);
      load();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Impossible d'enregistrer ce compte.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(id) {
    try {
      const updated = await toggleUserActive(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch {
      load();
    }
  }

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Comptes</p>
          <h1>Gestion des utilisateurs</h1>
          <p className="page-header__subtitle">
            Comptes enseignant et responsable pédagogique, et leur périmètre d'accès aux étudiants.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          Nouveau compte
        </button>
      </div>

      <div className="card">
        <div className="card__header">
          <h2>Comptes ({users.length})</h2>
        </div>
        <div className="card__body">
          {loading ? (
            <p className="cell-muted">Chargement…</p>
          ) : users.length === 0 ? (
            <div className="empty-state">Aucun compte pour l'instant.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Périmètre</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ cursor: "default" }}>
                    <td className="cell-name cell-student">
                      <Avatar name={u.full_name} />
                      {u.full_name}
                    </td>
                    <td className="cell-muted">{u.email}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td><ScopeCell user={u} /></td>
                    <td>
                      {u.is_active
                        ? <span className="risk-badge risk-badge--actif"><span className="risk-badge__dot" />Actif</span>
                        : <span className="risk-badge risk-badge--inactif"><span className="risk-badge__dot" />Désactivé</span>}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn btn-outline" onClick={() => openEdit(u)} aria-label="Modifier">
                          <Pencil size={14} />
                        </button>
                        {u.id !== currentUser?.id && (
                          <button
                            className={"btn " + (u.is_active ? "btn-outline" : "btn-primary")}
                            onClick={() => handleToggle(u.id)}
                          >
                            {u.is_active ? "Désactiver" : "Activer"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "Modifier le compte" : "Nouveau compte"}
      >
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Nom complet</span>
            <input
              type="text"
              className="text-field"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Mme Prénom Nom"
              required
            />
          </label>

          <label className="field">
            <span>Adresse email</span>
            <input
              type="email"
              className="text-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="prenom.nom@apexinubil.cm"
              required
            />
          </label>

          <label className="field">
            <span>Rôle</span>
            <select
              className="select-field"
              style={{ width: "100%" }}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="enseignant">Enseignant</option>
              <option value="responsable_pedagogique">Responsable pédagogique</option>
              <option value="administrateur">Administrateur</option>
            </select>
          </label>

          {form.role === "responsable_pedagogique" && (
            <div className="field">
              <span>Filières assignées</span>
              <div className="chip-select">
                {filieres.map((f) => (
                  <label
                    key={f.nom}
                    className={"chip-select__option" + (form.filieres.includes(f.nom) ? " is-checked" : "")}
                  >
                    <input
                      type="checkbox"
                      checked={form.filieres.includes(f.nom)}
                      onChange={() => toggleFiliere(f.nom)}
                    />
                    {f.nom}
                  </label>
                ))}
              </div>
            </div>
          )}

          {form.role === "enseignant" && (
            <div className="field">
              <span>Affectations (filière + niveau)</span>
              <div className="affectation-list">
                {form.affectations.map((a, i) => (
                  <div className="affectation-row" key={i}>
                    <select
                      className="select-field"
                      value={a.filiere}
                      onChange={(e) => updateAffectation(i, "filiere", e.target.value)}
                    >
                      {filieres.map((f) => (
                        <option key={f.nom} value={f.nom}>{f.nom}</option>
                      ))}
                    </select>
                    <select
                      className="select-field"
                      value={a.niveau}
                      onChange={(e) => updateAffectation(i, "niveau", e.target.value)}
                    >
                      {NIVEAUX.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="affectation-row__remove"
                      onClick={() => removeAffectation(i)}
                      aria-label="Retirer cette affectation"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-outline affectation-add" onClick={addAffectation}>
                  <Plus size={14} />
                  Ajouter une affectation
                </button>
              </div>
            </div>
          )}

          {!editingId && (
            <label className="field">
              <span>Mot de passe temporaire</span>
              <input
                type="text"
                className="text-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="8 caractères minimum"
                minLength={8}
                required
              />
            </label>
          )}

          {error && <p className="login-card__error">{error}</p>}

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={() => setDrawerOpen(false)}
            >
              Annuler
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} type="submit" disabled={submitting}>
              {submitting ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer le compte"}
            </button>
          </div>
        </form>
      </Drawer>
    </AppShell>
  );
}
