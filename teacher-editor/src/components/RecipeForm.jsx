export default function RecipeForm({ recipe, setRecipe }) {
  function updateField(field, value) {
    setRecipe((prev) => ({ ...prev, [field]: value }));
  }

  function updateIntroLine(index, value) {
    const next = [...(recipe.chefIntroLines || [])];
    next[index] = value;
    updateField("chefIntroLines", next);
  }

  function addIntroLine() {
    updateField("chefIntroLines", [...(recipe.chefIntroLines || []), ""]);
  }

  function removeIntroLine(index) {
    const next = [...(recipe.chefIntroLines || [])];
    next.splice(index, 1);
    updateField("chefIntroLines", next);
  }

  function updateTool(index, value) {
    const next = [...(recipe.tools || [])];
    next[index] = value;
    updateField("tools", next);
  }

  function addTool() {
    updateField("tools", [...(recipe.tools || []), ""]);
  }

  function removeTool(index) {
    const next = [...(recipe.tools || [])];
    next.splice(index, 1);
    updateField("tools", next);
  }

  function updateIngredient(index, field, value) {
    const next = [...(recipe.ingredients || [])];
    next[index] = { ...next[index], [field]: value };
    updateField("ingredients", next);
  }

  function addIngredient() {
    updateField("ingredients", [
      ...(recipe.ingredients || []),
      { id: "", displayName: "", qty: "" }
    ]);
  }

  function removeIngredient(index) {
    const next = [...(recipe.ingredients || [])];
    next.splice(index, 1);
    updateField("ingredients", next);
  }

  function updateStep(index, field, value) {
    const next = [...(recipe.steps || [])];
    next[index] = { ...next[index], [field]: value };
    updateField("steps", next);
  }

  function updateStepInputItem(stepIndex, itemIndex, value) {
    const next = [...(recipe.steps || [])];
    const items = [...(next[stepIndex].inputItems || [])];
    items[itemIndex] = value;
    next[stepIndex] = { ...next[stepIndex], inputItems: items };
    updateField("steps", next);
  }

  function addStepInputItem(stepIndex) {
    const next = [...(recipe.steps || [])];
    const items = [...(next[stepIndex].inputItems || []), ""];
    next[stepIndex] = { ...next[stepIndex], inputItems: items };
    updateField("steps", next);
  }

  function removeStepInputItem(stepIndex, itemIndex) {
    const next = [...(recipe.steps || [])];
    const items = [...(next[stepIndex].inputItems || [])];
    items.splice(itemIndex, 1);
    next[stepIndex] = { ...next[stepIndex], inputItems: items };
    updateField("steps", next);
  }

  function addStep(type) {
    const newStep = {
      id: `step_${Date.now()}`,
      type,
      station: "",
      inputItems: [],
      outputItem: "",
      chefLine: "",
      uiText: ""
    };

    if (type === "boil" || type === "cook") {
      newStep.durationSec = 30;
    }

    updateField("steps", [...(recipe.steps || []), newStep]);
  }

  function removeStep(index) {
    const next = [...(recipe.steps || [])];
    next.splice(index, 1);
    updateField("steps", next);
  }

  function moveStepUp(index) {
    if (index === 0) return;
    const next = [...(recipe.steps || [])];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    updateField("steps", next);
  }

  function moveStepDown(index) {
    if (index === (recipe.steps || []).length - 1) return;
    const next = [...(recipe.steps || [])];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    updateField("steps", next);
  }

  function updateQuiz(index, field, value) {
    const next = [...(recipe.customerQuiz || [])];
    next[index] = { ...next[index], [field]: value };
    updateField("customerQuiz", next);
  }

  function updateQuizChoice(qIndex, cIndex, value) {
    const next = [...(recipe.customerQuiz || [])];
    const choices = [...(next[qIndex].choices || [])];
    choices[cIndex] = value;
    next[qIndex] = { ...next[qIndex], choices };
    updateField("customerQuiz", next);
  }

  function addQuiz() {
    updateField("customerQuiz", [
      ...(recipe.customerQuiz || []),
      { question: "", choices: ["", ""], correctIndex: 0 }
    ]);
  }

  function removeQuiz(index) {
    const next = [...(recipe.customerQuiz || [])];
    next.splice(index, 1);
    updateField("customerQuiz", next);
  }

  function addQuizChoice(qIndex) {
    const next = [...(recipe.customerQuiz || [])];
    next[qIndex] = {
      ...next[qIndex],
      choices: [...(next[qIndex].choices || []), ""]
    };
    updateField("customerQuiz", next);
  }

  function removeQuizChoice(qIndex, cIndex) {
    const next = [...(recipe.customerQuiz || [])];
    const choices = [...(next[qIndex].choices || [])];
    choices.splice(cIndex, 1);

    let correctIndex = next[qIndex].correctIndex || 0;
    if (correctIndex >= choices.length) {
      correctIndex = Math.max(0, choices.length - 1);
    }

    next[qIndex] = { ...next[qIndex], choices, correctIndex };
    updateField("customerQuiz", next);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section style={sectionStyle}>
        <h2 style={h2Style}>Metadata</h2>

        <label>Title</label>
        <input
          style={inputStyle}
          value={recipe.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
        />

        <label>Description</label>
        <textarea
          style={{ ...inputStyle, minHeight: 90 }}
          value={recipe.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
        />

        <label>Serve Item ID</label>
        <input
          style={inputStyle}
          value={recipe.serveItemId || ""}
          onChange={(e) => updateField("serveItemId", e.target.value)}
        />
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>Chef Intro Lines</h2>
        {(recipe.chefIntroLines || []).map((line, i) => (
          <div key={i} style={rowStyle}>
            <input
              style={{ ...inputStyle, marginBottom: 0 }}
              value={line}
              onChange={(e) => updateIntroLine(i, e.target.value)}
            />
            <button type="button" onClick={() => removeIntroLine(i)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addIntroLine}>+ Add intro line</button>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>Ingredients</h2>
        {(recipe.ingredients || []).map((ing, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
            <input
              style={inputStyle}
              placeholder="id"
              value={ing.id || ""}
              onChange={(e) => updateIngredient(i, "id", e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="displayName"
              value={ing.displayName || ""}
              onChange={(e) => updateIngredient(i, "displayName", e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="qty"
              value={ing.qty || ""}
              onChange={(e) => updateIngredient(i, "qty", e.target.value)}
            />
            <button type="button" onClick={() => removeIngredient(i)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addIngredient}>+ Add ingredient</button>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>Tools</h2>
        {(recipe.tools || []).map((tool, i) => (
          <div key={i} style={rowStyle}>
            <input
              style={{ ...inputStyle, marginBottom: 0 }}
              value={tool}
              onChange={(e) => updateTool(i, e.target.value)}
            />
            <button type="button" onClick={() => removeTool(i)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addTool}>+ Add tool</button>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>Steps</h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <button type="button" onClick={() => addStep("cut")}>+ Cut</button>
          <button type="button" onClick={() => addStep("boil")}>+ Boil</button>
          <button type="button" onClick={() => addStep("cook")}>+ Cook</button>
          <button type="button" onClick={() => addStep("mix")}>+ Mix</button>
          <button type="button" onClick={() => addStep("plate")}>+ Plate</button>
        </div>

        {(recipe.steps || []).map((step, i) => (
          <div key={i} style={stepCard}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong>Step {i + 1}</strong>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => moveStepUp(i)}>↑</button>
                <button type="button" onClick={() => moveStepDown(i)}>↓</button>
                <button type="button" onClick={() => removeStep(i)}>Remove</button>
              </div>
            </div>

            <div style={grid2}>
              <div>
                <label>id</label>
                <input
                  style={inputStyle}
                  value={step.id || ""}
                  onChange={(e) => updateStep(i, "id", e.target.value)}
                />
              </div>
              <div>
                <label>type</label>
                <select
                  style={inputStyle}
                  value={step.type || "cut"}
                  onChange={(e) => updateStep(i, "type", e.target.value)}
                >
                  <option value="cut">cut</option>
                  <option value="boil">boil</option>
                  <option value="cook">cook</option>
                  <option value="mix">mix</option>
                  <option value="plate">plate</option>
                </select>
              </div>
            </div>

            <label>station</label>
            <input
              style={inputStyle}
              value={step.station || ""}
              onChange={(e) => updateStep(i, "station", e.target.value)}
            />

            <label>inputItems</label>
            {(step.inputItems || []).map((item, itemIndex) => (
              <div key={itemIndex} style={rowStyle}>
                <input
                  style={{ ...inputStyle, marginBottom: 0 }}
                  value={item}
                  onChange={(e) => updateStepInputItem(i, itemIndex, e.target.value)}
                />
                <button type="button" onClick={() => removeStepInputItem(i, itemIndex)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addStepInputItem(i)}>
              + Add input item
            </button>

            <br />
            <label>outputItem</label>
            <input
              style={inputStyle}
              value={step.outputItem || ""}
              onChange={(e) => updateStep(i, "outputItem", e.target.value)}
            />

            <label>chefLine</label>
            <textarea
              style={{ ...inputStyle, minHeight: 60 }}
              value={step.chefLine || ""}
              onChange={(e) => updateStep(i, "chefLine", e.target.value)}
            />

            <label>uiText</label>
            <textarea
              style={{ ...inputStyle, minHeight: 60 }}
              value={step.uiText || ""}
              onChange={(e) => updateStep(i, "uiText", e.target.value)}
            />

            {(step.type === "boil" || step.type === "cook") && (
              <>
                <label>durationSec</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={step.durationSec ?? 30}
                  onChange={(e) =>
                    updateStep(i, "durationSec", Number(e.target.value))
                  }
                />
              </>
            )}
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>Customer Quiz</h2>

        {(recipe.customerQuiz || []).map((q, qi) => (
          <div key={qi} style={stepCard}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong>Question {qi + 1}</strong>
              <button type="button" onClick={() => removeQuiz(qi)}>Remove</button>
            </div>

            <label>Question</label>
            <input
              style={inputStyle}
              value={q.question || ""}
              onChange={(e) => updateQuiz(qi, "question", e.target.value)}
            />

            <label>Choices</label>
            {(q.choices || []).map((choice, ci) => (
              <div key={ci} style={rowStyle}>
                <input
                  style={{ ...inputStyle, marginBottom: 0 }}
                  value={choice}
                  onChange={(e) => updateQuizChoice(qi, ci, e.target.value)}
                />
                <button type="button" onClick={() => removeQuizChoice(qi, ci)}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addQuizChoice(qi)}>+ Add choice</button>

            <label style={{ display: "block", marginTop: 10 }}>Correct Index</label>
            <input
              type="number"
              style={inputStyle}
              value={q.correctIndex ?? 0}
              onChange={(e) => updateQuiz(qi, "correctIndex", Number(e.target.value))}
            />
          </div>
        ))}

        <button type="button" onClick={addQuiz}>+ Add question</button>
      </section>
    </div>
  );
}

const sectionStyle = {
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: 12,
  background: "white",
};

const h2Style = {
  margin: "0 0 10px 0",
  fontSize: 18,
};

const inputStyle = {
  width: "100%",
  padding: 8,
  marginTop: 4,
  marginBottom: 8,
};

const rowStyle = {
  display: "flex",
  gap: 8,
  marginBottom: 8,
  alignItems: "center",
};

const stepCard = {
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: 12,
  background: "#fafafa",
  marginBottom: 12,
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};