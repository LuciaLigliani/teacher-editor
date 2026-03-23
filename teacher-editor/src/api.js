const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function headers() {
  return { "Content-Type": "application/json" };
}

async function handleJson(res) {
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      (data && data.errors && JSON.stringify(data.errors)) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function health() {
  const res = await fetch(`${BASE_URL}/health`);
  return handleJson(res);
}

export async function listRecipes() {
  const res = await fetch(`${BASE_URL}/api/recipes`);
  return handleJson(res);
}

export async function getRecipe(id) {
  const res = await fetch(`${BASE_URL}/api/recipes/${id}`);
  return handleJson(res);
}

export async function createRecipe(recipeWithoutId) {
  const res = await fetch(`${BASE_URL}/api/recipes`, {
    method: "POST",
    headers: headers(true),
    body: JSON.stringify(recipeWithoutId),
  });
  return handleJson(res); // { id, warnings }
}

export async function updateRecipe(id, recipe) {
  const res = await fetch(`${BASE_URL}/api/recipes/${id}`, {
    method: "PUT",
    headers: headers(true),
    body: JSON.stringify(recipe),
  });
  return handleJson(res);
}

export async function publishRecipe(id) {
  const res = await fetch(`${BASE_URL}/api/recipes/${id}/publish`, {
    method: "POST",
    headers: headers(true),
  });
  return handleJson(res);
}

export async function getPublished() {
  const res = await fetch(`${BASE_URL}/api/published`);
  return handleJson(res);
}

export async function deleteRecipe(id) {
  const res = await fetch(`${BASE_URL}/api/recipes/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  return handleJson(res);
}