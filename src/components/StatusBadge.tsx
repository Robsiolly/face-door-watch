interface StatusBadgeProps {
  status: "authorized" | "denied" | "unknown" | "active" | "inactive" | "pending";
  label?: string;
}

const statusConfig = {
  authorized: { className: "status-authorized", text: "Autorizado" },
  denied: { className: "status-denied", text: "Negado" },
  unknown: { className: "status-unknown", text: "Desconhecido" },
  active: { className: "status-authorized", text: "Ativo" },
  inactive: { className: "status-denied", text: "Inativo" },
  pending: { className: "status-unknown", text: "Pendente" },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === "authorized" || status === "active" ? "bg-primary" :
        status === "denied" || status === "inactive" ? "bg-destructive" :
        "bg-warning"
      }`} />
      {label || config.text}
    </span>
  );
}
