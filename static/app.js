const originURL = "http://localhost:8080/";

const form = document.querySelector("#submit-link");
const resultDiv = document.querySelector("#result");
const errorP = document.querySelector("#error");
const shortLinkA = document.querySelector("#short-link");
const copyBtn = document.querySelector("#copy-btn");

/**
 * Affiche une erreur.
 */
function showError(message) {
  errorP.textContent = message;
  errorP.classList.remove("hidden");
  resultDiv.classList.add("hidden");
}

/**
 * Affiche le résultat (lien court).
 */
function showResult(shortUrl) {
  errorP.classList.add("hidden");
  resultDiv.classList.remove("hidden");
  shortLinkA.href = shortUrl;
  shortLinkA.textContent = shortUrl;
}

/**
 * Soumission du formulaire → POST /api-v2/
 */
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = document.querySelector("#url").value;

  try {
    const response = await fetch(`${originURL}api-v2/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      return showError(data.message ?? "Erreur inconnue");
    }

    showResult(data.shortUrl);
  } catch (error) {
    showError(`Erreur réseau : ${error.message}`);
  }
});

/**
 * Bouton "Copier l'URL"
 */
copyBtn.addEventListener("click", async () => {
  const text = shortLinkA.textContent;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copié !";
    setTimeout(() => (copyBtn.textContent = "Copier l'URL"), 1500);
  } catch (error) {
    showError(`Impossible de copier : ${error.message}`);
  }
});