export function shouldHandleClientNavigation(event) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export default function SiteLink({
  href,
  onNavigate,
  onClick,
  disabled = false,
  target,
  download,
  tabIndex,
  ...props
}) {
  function handleClick(event) {
    onClick?.(event);

    if (
      disabled ||
      !href ||
      !onNavigate ||
      download ||
      (target && target !== "_self") ||
      !shouldHandleClientNavigation(event)
    ) {
      if (disabled) event.preventDefault();
      return;
    }

    event.preventDefault();
    onNavigate(event);
  }

  return (
    <a
      {...props}
      href={disabled ? undefined : href}
      target={target}
      download={download}
      aria-disabled={disabled ? "true" : undefined}
      tabIndex={disabled ? -1 : tabIndex}
      onClick={handleClick}
    />
  );
}
