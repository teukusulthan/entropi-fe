export function formatCurrency(amount: string | null): string {
  if (amount === null || amount === undefined) return '$0.0000';
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0.0000';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(num);
}

export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function truncateId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}...${id.slice(-6)}`;
}

export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function timeAgo(date: string): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Safe decimal string addition using integer arithmetic (avoids IEEE 754 float drift)
const DECIMAL_SCALE = 10000;

export function sumDecimalStrings(values: string[]): string {
  const sum = values.reduce((acc, v) => {
    return acc + Math.round(parseFloat(v) * DECIMAL_SCALE);
  }, 0);
  return (sum / DECIMAL_SCALE).toFixed(4);
}

export function subtractDecimalStrings(a: string, b: string): string {
  const aInt = Math.round(parseFloat(a) * DECIMAL_SCALE);
  const bInt = Math.round(parseFloat(b) * DECIMAL_SCALE);
  return ((aInt - bInt) / DECIMAL_SCALE).toFixed(4);
}
