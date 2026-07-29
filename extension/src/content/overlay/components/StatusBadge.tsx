interface StatusBadgeProps {
  status: string;
}

function getStatusVariant(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("desconectado") ||
    normalized.includes("offline") ||
    normalized.includes("erro") ||
    normalized.includes("falha")
  ) {
    return "offline";
  }

  if (
    normalized.includes("conectado") ||
    normalized.includes("monitorando") ||
    normalized.includes("ativo") ||
    normalized.includes("capturando")
  ) {
    return "online";
  }

  return "neutral";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = getStatusVariant(status);

  return (
    <span className={`asa-status-badge asa-status-${variant}`}>
      {status}
    </span>
  );
}