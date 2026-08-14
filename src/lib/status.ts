export type Tone = "success" | "warning" | "critical" | "info" | "neutral";

export function healthTone(status: string): { label: string; tone: Tone } {
  switch (status) {
    case "ON_TRACK":
      return { label: "On Track", tone: "success" };
    case "AT_RISK":
      return { label: "At Risk", tone: "warning" };
    case "CRITICAL":
      return { label: "Critical", tone: "critical" };
    default:
      return { label: status, tone: "neutral" };
  }
}

export function taskStatusTone(status: string): { label: string; tone: Tone } {
  switch (status) {
    case "TODO":
      return { label: "To Do", tone: "neutral" };
    case "IN_PROGRESS":
      return { label: "In Progress", tone: "info" };
    case "DONE":
      return { label: "Done", tone: "success" };
    case "BLOCKED":
      return { label: "Blocked", tone: "critical" };
    default:
      return { label: status, tone: "neutral" };
  }
}

export function priorityTone(priority: string): { label: string; tone: Tone } {
  switch (priority) {
    case "LOW":
      return { label: "Low", tone: "neutral" };
    case "MEDIUM":
      return { label: "Medium", tone: "warning" };
    case "HIGH":
      return { label: "High", tone: "critical" };
    default:
      return { label: priority, tone: "neutral" };
  }
}

export function riskSeverityTone(severity: string): { label: string; tone: Tone } {
  switch (severity) {
    case "LOW":
      return { label: "Low", tone: "neutral" };
    case "MEDIUM":
      return { label: "Medium", tone: "warning" };
    case "HIGH":
      return { label: "High", tone: "critical" };
    case "CRITICAL":
      return { label: "Critical", tone: "critical" };
    default:
      return { label: severity, tone: "neutral" };
  }
}

export function riskStatusTone(status: string): { label: string; tone: Tone } {
  switch (status) {
    case "OPEN":
      return { label: "Open", tone: "warning" };
    case "MITIGATED":
      return { label: "Mitigated", tone: "info" };
    case "CLOSED":
      return { label: "Closed", tone: "success" };
    default:
      return { label: status, tone: "neutral" };
  }
}

export function meetingTypeLabel(type: string): string {
  switch (type) {
    case "STATUS_REVIEW":
      return "Status Review";
    case "STEERING_COMMITTEE":
      return "Steering Committee";
    case "WORKSHOP":
      return "Workshop";
    case "KICKOFF":
      return "Kickoff";
    case "OTHER":
      return "Other";
    default:
      return type;
  }
}

export function meetingScopeLabel(scope: string): string {
  return scope === "MARKET" ? "Market" : "Initiative";
}
