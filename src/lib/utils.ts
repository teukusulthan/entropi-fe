export function formatCurrency(amount: string | null): string {
  if (amount === null || amount === undefined) return '$0.0000';
  const normalized = scaledBigIntToDecimalString(decimalStringToScaledBigInt(amount));
  const negative = normalized.startsWith('-');
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [whole, fraction] = unsigned.split('.');
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}$${groupedWhole}.${fraction}`;
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

const DECIMAL_SCALE = BigInt(10000);

export function decimalStringToScaledBigInt(value: string | null | undefined): bigint {
  if (!value) return BigInt(0);
  const trimmed = String(value).trim();
  const negative = trimmed.startsWith('-');
  const unsigned = negative || trimmed.startsWith('+') ? trimmed.slice(1) : trimmed;
  const [wholeRaw, fractionRaw = ''] = unsigned.split('.');
  if (!/^\d+$/.test(wholeRaw || '0') || !/^\d*$/.test(fractionRaw)) return BigInt(0);

  const whole = BigInt(wholeRaw || '0') * DECIMAL_SCALE;
  const fraction = BigInt((fractionRaw + '0000').slice(0, 4));
  const scaled = whole + fraction;
  return negative ? -scaled : scaled;
}

export function scaledBigIntToDecimalString(value: bigint): string {
  const negative = value < BigInt(0);
  const unsigned = negative ? -value : value;
  const whole = unsigned / DECIMAL_SCALE;
  const fraction = unsigned % DECIMAL_SCALE;
  return `${negative ? '-' : ''}${whole.toString()}.${fraction.toString().padStart(4, '0')}`;
}

export function sumDecimalStrings(values: string[]): string {
  const sum = values.reduce((acc, v) => acc + decimalStringToScaledBigInt(v), BigInt(0));
  return scaledBigIntToDecimalString(sum);
}

export function subtractDecimalStrings(a: string, b: string): string {
  return scaledBigIntToDecimalString(decimalStringToScaledBigInt(a) - decimalStringToScaledBigInt(b));
}

export function isPositiveDecimalString(value: string): boolean {
  return decimalStringToScaledBigInt(value) > BigInt(0);
}

export function divideDecimalStringByInt(value: string, divisor: number): string {
  if (divisor <= 0) return '0.0000';
  return scaledBigIntToDecimalString(decimalStringToScaledBigInt(value) / BigInt(divisor));
}

export function decimalRatioPercent(numerator: string, denominator: string, fractionDigits = 0): string {
  const denominatorScaled = decimalStringToScaledBigInt(denominator);
  if (denominatorScaled === BigInt(0)) return (0).toFixed(fractionDigits);

  const numeratorScaled = decimalStringToScaledBigInt(numerator);
  let precision = BigInt(1);
  for (let i = 0; i < fractionDigits; i += 1) {
    precision *= BigInt(10);
  }
  const percentScaled = (numeratorScaled * BigInt(100) * precision) / denominatorScaled;
  const whole = percentScaled / precision;
  const fraction = percentScaled % precision;

  if (fractionDigits === 0) return whole.toString();
  return `${whole.toString()}.${fraction.toString().padStart(fractionDigits, '0')}`;
}
