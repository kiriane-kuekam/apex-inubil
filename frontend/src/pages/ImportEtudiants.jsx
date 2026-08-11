import { useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { StatTile } from "../components/StatTile";
import { importStudents } from "../api/students";

const TEMPLATE_CSV = [
  "matricule;nom;prenom;filiere;niveau;logement;presence_pct;study_min;bibliotheque_acces;interaction_enseignant;implication",
  "ISM2026100;Nom;Prenom;GIT;Niveau4;Cite universitaire;85;90;Souvent;moyenne;4",
].join("\n");

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modele_import_etudiants.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ImportEtudiants() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  function pickFile(f) {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError("");
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  }

  async function handleImport() {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await importStudents(file);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.detail || "Échec de l'import - vérifiez le fichier.");
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError("");
  }

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <p className="page-header__eyebrow">Données étudiants</p>
          <h1>Importer des étudiants</h1>
          <p className="page-header__subtitle">
            Créez ou mettez à jour vos étudiants par lot (CSV ou Excel) - le score de risque est
            recalculé automatiquement pour chaque ligne importée.
          </p>
        </div>
        <button className="btn btn-outline" onClick={downloadTemplate}>
          <Download size={16} />
          Télécharger le modèle
        </button>
      </div>

      <div className="info-banner">
        <FileSpreadsheet size={18} />
        <p>
          Colonnes attendues : matricule, nom, prenom, filiere, niveau, logement, presence_pct,
          study_min, bibliotheque_acces, interaction_enseignant, implication (séparateur «&nbsp;;&nbsp;»
          pour le CSV). Un matricule déjà connu met à jour l'étudiant existant ; seules les
          filières qui vous sont assignées sont acceptées.
        </p>
      </div>

      <div className="card">
        <div className="card__header">
          <h2>Fichier à importer</h2>
        </div>
        <div className="card__body">
          {!file ? (
            <div
              className={"dropzone" + (dragOver ? " is-dragover" : "")}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <UploadCloud size={34} className="dropzone__icon" />
              <div className="dropzone__title">Glissez-déposez votre fichier ici</div>
              <div className="dropzone__hint">ou cliquez pour parcourir - .csv ou .xlsx</div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx"
                style={{ display: "none" }}
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </div>
          ) : (
            <div className="file-picked">
              <div className="file-picked__name">
                <FileSpreadsheet size={18} />
                <span>{file.name}</span>
              </div>
              {!result && (
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-outline" onClick={reset} disabled={uploading}>
                    Changer
                  </button>
                  <button className="btn btn-primary" onClick={handleImport} disabled={uploading}>
                    {uploading ? "Import en cours..." : "Importer"}
                  </button>
                </div>
              )}
            </div>
          )}

          {error && <p className="login-card__error" style={{ marginTop: 14 }}>{error}</p>}

          {result && (
            <>
              <div className="stat-grid" style={{ marginTop: 20 }}>
                <StatTile label="Créés" value={result.crees} icon={UploadCloud} variant="primary" />
                <StatTile label="Mis à jour" value={result.mis_a_jour} icon={CheckCircle2} variant="primary" />
                <StatTile label="Erreurs" value={result.erreurs.length} icon={AlertTriangle} variant="accent" />
              </div>

              {result.erreurs.length > 0 && (
                <div className="import-errors">
                  <h3 style={{ fontSize: 14, marginBottom: 4 }}>Lignes rejetées</h3>
                  {result.erreurs.map((e, i) => (
                    <div className="import-errors__row" key={i}>
                      <span className="import-errors__line">
                        Ligne {e.ligne}{e.matricule ? ` · ${e.matricule}` : ""}
                      </span>
                      <span className="import-errors__message">{e.message}</span>
                    </div>
                  ))}
                </div>
              )}

              <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={reset}>
                Importer un autre fichier
              </button>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
