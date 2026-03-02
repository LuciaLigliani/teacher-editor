import { useEffect, useMemo, useState } from "react";
import {
  health,
  listRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  publishRecipe,
  getPublished,
} from "./api";

function emptyRecipe() {
  return {
    title: "New recipe",
    description: "Describe the scenario",
    chefIntroLines: ["Welcome!"],
    ingredients: [{ id: "fish", displayName: "Fish", qty: "200g" }],
    tools: ["knife"],
    steps: [
      {
        id: "s1",
        type: "cut",
        station: "cutting_board",
        inputItems: ["fish"],
        outputItem: "fish_cut",
        chefLine: "Cut the fish.",
        uiText: "Cut the fish into pieces.",
      },
    ],
    customerQuiz: [
      { question: "Example question?", choices: ["A", "B"], correctIndex: 0 },
    ],
    serveItemId: "fish_cut",
  };
}

export default function App() {
  const [status, setStatus] = useState("Initializing...");
  const [error, setError] = useState(null);

  const [recipes, setRecipes] = useState([]);
  const [publishedId, setPublishedId] = useState(null);

  const [mode, setMode] = useState("list"); // list | edit
  const [editingId, setEditingId] = useState(null);
  const [recipeDraft, setRecipeDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const title = useMemo(() => {
    if (mode === "list") return "Teacher Dashboard";
    return editingId ? `Edit: ${editingId}` : "Create recipe";
  }, [mode, editingId]);

  async function refreshAll() {
    setError(null);
    try {
      await health();
      const list = await listRecipes();
      setRecipes(list);

      try {
        const pub = await getPublished();
        setPublishedId(pub?.recipeId ?? null);
      } catch {
        setPublishedId(null);
      }

      setStatus("Connected.");
    } catch (e) {
      setStatus("Not connected.");
      setError(e.message || String(e));
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  async function openCreate() {
    setEditingId(null);
    setRecipeDraft(emptyRecipe());
    setMode("edit");
  }

  async function openEdit(id) {
    setError(null);
    try {
      const data = await getRecipe(id);
      setEditingId(id);
      setRecipeDraft(data);
      setMode("edit");
    } catch (e) {
      setError(e.message || String(e));
    }
  }

  function updateField(field, value) {
    setRecipeDraft((prev) => ({ ...prev, [field]: value }));
  }

  async function save() {
    if (!recipeDraft) return;
    setSaving(true);
    setError(null);
    try {
      if (!editingId) {
        const created = await createRecipe(recipeDraft);
        await refreshAll();
        await openEdit(created.id);
      } else {
        await updateRecipe(editingId, recipeDraft);
        await refreshAll();
      }
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  async function publish(id) {
    setError(null);
    try {
      await publishRecipe(id);
      await refreshAll();
    } catch (e) {
      setError(e.message || String(e));
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ marginBottom: 4 }}>{title}</h1>
      <div style={{ color: "#555", marginBottom: 12 }}>{status}</div>

      {error && (
        <div style={{ background: "#ffe6e6", border: "1px solid #ffb3b3", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {mode === "list" && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {/*<button onClick={refreshAll}>Refresh</button>*/}
            <button onClick={openCreate}>+ Create recipe</button>
          </div>

          <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                <th>ID</th>
                <th>Title</th>
                <th>Updated</th>
                <th>Version</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ fontFamily: "monospace" }}>
                    {r.id}
                    {publishedId === r.id ? (
                      <span style={{ marginLeft: 8, color: "green", fontWeight: 600 }}>(PUBLISHED)</span>
                    ) : null}
                  </td>
                  <td>{r.title}</td>
                  <td>{r.updatedAt}</td>
                  <td>{r.version}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => openEdit(r.id)}>Edit</button>
                    <button onClick={() => publish(r.id)}>Publish</button>
                  </td>
                </tr>
              ))}
              {recipes.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 12, color: "#666" }}>
                    No recipes yet. Click “Create recipe”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {mode === "edit" && recipeDraft && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setMode("list")}>← Back</button>
            <button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label>Title</label>
              <input
                value={recipeDraft.title || ""}
                onChange={(e) => updateField("title", e.target.value)}
                style={{ width: "100%", marginBottom: 10 }}
              />

              <label>Description</label>
              <textarea
                value={recipeDraft.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                style={{ width: "100%", minHeight: 120, marginBottom: 10 }}
              />

              <label>Serve Item ID</label>
              <input
                value={recipeDraft.serveItemId || ""}
                onChange={(e) => updateField("serveItemId", e.target.value)}
                style={{ width: "100%", marginBottom: 10 }}
              />

              
            </div>

            <div>
              <label>JSON Preview</label>
              <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8, overflow: "auto", maxHeight: 420 }}>
                {JSON.stringify(recipeDraft, null, 2)}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}