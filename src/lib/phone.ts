const DIGITS = /[^\d]/g;

export function normalizePakistaniPhone(input: string) {
  const trimmed = input.trim();
  let digits = trimmed.replace(DIGITS, "");

  if (digits.startsWith("0092")) {
    digits = `92${digits.slice(4)}`;
  }

  if (digits.startsWith("92") && digits.length >= 12) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length === 11) {
    return `+92${digits.slice(1)}`;
  }

  if (digits.length === 10 && digits.startsWith("3")) {
    return `+92${digits}`;
  }

  return trimmed;
}

export function isValidPakistaniPhone(input: string) {
  const normalized = normalizePakistaniPhone(input);
  return /^\+92[3][0-9]{9}$/.test(normalized);
}
