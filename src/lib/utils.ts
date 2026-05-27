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
