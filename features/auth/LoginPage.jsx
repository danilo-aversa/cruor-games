import { useId, useState } from "react";
import { t } from "../../shared/i18n/index.js";

export default function LoginPage({
  locale = "en",
  onLogin,
  onCancel,
}) {
  const usernameId = useId();
  const passwordId = useId();
  const errorId = useId();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    setErrorCode("");
    setIsSubmitting(true);

    try {
      const result = await onLogin?.({ username, password });
      if (result?.ok) return;

      setErrorCode(result?.errorCode || "unknown");
      setIsSubmitting(false);
    } catch {
      setErrorCode("unknown");
      setIsSubmitting(false);
    }
  }

  const errorMessage = errorCode
    ? t(
        errorCode === "invalid-credentials"
          ? "auth.errors.invalidCredentials"
          : "auth.errors.unknown",
        {},
        locale,
      )
    : "";

  return (
    <div className="cruor-auth" aria-labelledby="cruorAuthTitle">
      <section className="cruor-auth__panel">
        <div className="cruor-auth__intro">
          <span className="cruor-auth__eyebrow">
            <i className="fa-solid fa-user-shield" aria-hidden="true" />
            {t("auth.eyebrow", {}, locale)}
          </span>
          <h1 id="cruorAuthTitle">{t("auth.title", {}, locale)}</h1>
          <p>{t("auth.description", {}, locale)}</p>

          <div className="cruor-auth__scope" aria-label={t("auth.scopeLabel", {}, locale)}>
            <span>
              <i className="fa-solid fa-pen-ruler" aria-hidden="true" />
              {t("auth.scope.studio", {}, locale)}
            </span>
            <span>
              <i className="fa-solid fa-bug" aria-hidden="true" />
              {t("auth.scope.debug", {}, locale)}
            </span>
          </div>
        </div>

        <form className="cruor-auth__form" onSubmit={handleSubmit} noValidate>
          <div className="cruor-auth__form-heading">
            <span>{t("auth.formEyebrow", {}, locale)}</span>
            <strong>{t("auth.formTitle", {}, locale)}</strong>
          </div>

          <label className="cruor-auth__field" htmlFor={usernameId}>
            <span>{t("auth.username", {}, locale)}</span>
            <span className="cruor-auth__input-wrap">
              <i className="fa-solid fa-user" aria-hidden="true" />
              <input
                id={usernameId}
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                aria-describedby={errorMessage ? errorId : undefined}
                onChange={(event) => setUsername(event.target.value)}
                autoFocus
                required
              />
            </span>
          </label>

          <label className="cruor-auth__field" htmlFor={passwordId}>
            <span>{t("auth.password", {}, locale)}</span>
            <span className="cruor-auth__input-wrap">
              <i className="fa-solid fa-key" aria-hidden="true" />
              <input
                id={passwordId}
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                aria-describedby={errorMessage ? errorId : undefined}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </span>
          </label>

          <div
            className={`cruor-auth__error${errorMessage ? " is-visible" : ""}`}
            id={errorId}
            role="alert"
            aria-live="polite"
          >
            {errorMessage || "\u00a0"}
          </div>

          <div className="cruor-auth__actions">
            <button
              className="cruor-auth__submit"
              type="submit"
              disabled={isSubmitting}
            >
              <i
                className={
                  isSubmitting
                    ? "fa-solid fa-circle-notch fa-spin"
                    : "fa-solid fa-right-to-bracket"
                }
                aria-hidden="true"
              />
              <span>
                {t(
                  isSubmitting ? "auth.signingIn" : "auth.signIn",
                  {},
                  locale,
                )}
              </span>
            </button>

            <button
              className="cruor-auth__cancel"
              type="button"
              onClick={onCancel}
            >
              {t("auth.cancel", {}, locale)}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
