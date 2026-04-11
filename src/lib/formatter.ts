/**
 * Utilities for formatting dates and durations across the platform.
 * Brazilian context: dd/mm/aaaa for dates, hh:mm:ss for durations.
 */

/**
 * Formats a date string or object to dd/mm/aaaa
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formats an integer representing SECONDS into hh:mm:ss
 */
export function formatDuration(seconds: number | null | undefined): string {
  const totalSeconds = seconds || 0
  if (totalSeconds === 0) return '00:00:00'

  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  return [
    h.toString().padStart(2, '0'),
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0')
  ].join(':')
}

/**
 * Parses a string in hh:mm:ss (or just seconds or mm:ss) into total SECONDS.
 */
export function parseDurationToSeconds(timeStr: string | null | undefined): number {
  if (!timeStr) return 0
  
  const parts = timeStr.trim().split(':').map(p => {
    const n = parseInt(p, 10)
    return isNaN(n) ? 0 : n
  })

  // Case: hh:mm:ss
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  
  // Case: mm:ss
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }

  // Case: just seconds
  return parts[0] || 0
}

/**
 * Cleans internal patterns from titles for student display.
 * Logic: Everything before the first hyphen is considered internal code.
 * Ex: "FIN DRE 2 - Aula de Caixa" => "Aula de Caixa"
 * If no hyphen is present, returns the original title trimmed.
 */
export function cleanTitle(title: string | null | undefined, knownPrefixes: string[] = []): string {
  if (!title) return ''
  
  // 1. Dynamic Prefix Fallback (provided by the database/admin)
  for (const prefix of knownPrefixes) {
    const cleanPrefix = prefix.trim().toUpperCase()
    if (title.toUpperCase().startsWith(cleanPrefix) && !title.includes('-')) {
      return title.substring(cleanPrefix.length).trim()
    }
  }

  // 2. Standard Universal Logic: Handles normal hyphen, en-dash (–), and em-dash (—)
  const dashPattern = /[ \t]*[—–-][ \t]*/
  const parts = title.split(dashPattern)
  
  if (parts.length > 1) {
    // Join back the remaining parts using a clean space-hyphen-space
    return parts.slice(1).join(' - ').trim()
  }
  
  return title.trim()
}
