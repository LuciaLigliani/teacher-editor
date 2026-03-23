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
import RecipeForm from "./components/RecipeForm";

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
  function validateRecipe(recipe) {
    if (!recipe) return "Recipe is missing.";

    if (!recipe.title || !recipe.title.trim()) {
      return "Title is required.";
    }

    if (!recipe.description || !recipe.description.trim()) {
      return "Description is required.";
    }

    if (!recipe.chefIntroLines || recipe.chefIntroLines.length === 0) {
      return "At least one chef intro line is required.";
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return "At least one ingredient is required.";
    }

    for (let i = 0; i < recipe.ingredients.length; i++) {
      const ing = recipe.ingredients[i];
      if (!ing.id || !ing.id.trim()) return `Ingredient ${i + 1}: id is required.`;
      if (!ing.displayName || !ing.displayName.trim()) return `Ingredient ${i + 1}: displayName is required.`;
      if (!ing.qty || !ing.qty.trim()) return `Ingredient ${i + 1}: qty is required.`;
    }

    if (!recipe.tools || recipe.tools.length === 0) {
      return "At least one tool is required.";
    }

    if (!recipe.steps || recipe.steps.length === 0) {
      return "At least one step is required.";
    }

    for (let i = 0; i < recipe.steps.length; i++) {
      const step = recipe.steps[i];

      if (!step.id || !step.id.trim()) return `Step ${i + 1}: id is required.`;
      if (!step.type || !step.type.trim()) return `Step ${i + 1}: type is required.`;
      if (!step.station || !step.station.trim()) return `Step ${i + 1}: station is required.`;
      if (!step.inputItems || step.inputItems.length === 0) return `Step ${i + 1}: at least one inputItem is required.`;
      if (!step.outputItem || !step.outputItem.trim()) return `Step ${i + 1}: outputItem is required.`;
      if (!step.chefLine || !step.chefLine.trim()) return `Step ${i + 1}: chefLine is required.`;
      if (!step.uiText || !step.uiText.trim()) return `Step ${i + 1}: uiText is required.`;

      if ((step.type === "boil" || step.type === "cook")) {
        if (step.durationSec === undefined || step.durationSec === null || Number(step.durationSec) <= 0) {
          return `Step ${i + 1}: durationSec must be greater than 0 for ${step.type}.`;
        }
      }
    }

    if (!recipe.customerQuiz || recipe.customerQuiz.length === 0) {
      return "At least one quiz question is required.";
    }

    for (let i = 0; i < recipe.customerQuiz.length; i++) {
      const q = recipe.customerQuiz[i];

      if (!q.question || !q.question.trim()) {
        return `Quiz question ${i + 1}: question text is required.`;
      }

      if (!q.choices || q.choices.length < 2) {
        return `Quiz question ${i + 1}: at least two choices are required.`;
      }

      for (let j = 0; j < q.choices.length; j++) {
        if (!q.choices[j] || !q.choices[j].trim()) {
          return `Quiz question ${i + 1}: choice ${j + 1} is empty.`;
        }
      }

      if (q.correctIndex < 0 || q.correctIndex >= q.choices.length) {
        return `Quiz question ${i + 1}: correctIndex is out of range.`;
      }
    }

    if (!recipe.serveItemId || !recipe.serveItemId.trim()) {
      return "serveItemId is required.";
    }

    return null;
  }

  async function save() {
    const validationError = validateRecipe(recipeDraft);
    if (validationError) {
      setError(validationError);
      return;
    }
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
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "24px",
        boxSizing: "border-box",
        fontFamily: "system-ui, Arial"
      }}
    >
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
            <button onClick={refreshAll}>Refresh</button>
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
            <button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            {editingId && (
              <button onClick={() => publish(editingId)}>
                Publish
              </button>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: 16,
              alignItems: "start",
              width: "100%"
            }}
          >
            <div>
              <RecipeForm recipe={recipeDraft} setRecipe={setRecipeDraft} />
            </div>

            <div style={{ position: "sticky", top: 16, alignSelf: "start" }}>
              <h2 style={{ marginTop: 0 }}>JSON Preview</h2>
              <pre
                style={{
                  background: "#111",
                  color: "#eee",
                  padding: 12,
                  borderRadius: 8,
                  width: "100%",
                  height: "720px",
                  overflowX: "auto",
                  overflowY: "auto",
                  whiteSpace: "pre",
                  boxSizing: "border-box"
                }}
              >
                {JSON.stringify(recipeDraft, null, 2)}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}