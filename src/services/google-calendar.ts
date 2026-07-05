import { getCategoryLabel, getCalendarErrorMessage, ui } from '../i18n'
import type { ReleaseItem } from '../types'

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

export type CalendarErrorCode =
  | 'auth'
  | 'expired'
  | 'duplicate'
  | 'network'
  | 'unknown'
  | 'missingClientId'
  | 'gisUnavailable'
  | 'invalidToken'
  | 'accessDenied'

export class CalendarError extends Error {
  readonly errorCode: CalendarErrorCode

  constructor(errorCode: CalendarErrorCode, detail?: string) {
    super(detail ? `CalendarError [${errorCode}]: ${detail}` : `CalendarError [${errorCode}]`)
    this.name = 'CalendarError'
    this.errorCode = errorCode
  }
}

let cachedToken: string | null = null
let tokenExpiry = 0
let pendingTokenPromise: Promise<string> | null = null

function getClientId(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
  if (!clientId) throw new CalendarError('missingClientId')
  return clientId
}

function waitForGoogle(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }
    let attempts = 0
    const interval = window.setInterval(() => {
      attempts += 1
      if (window.google?.accounts?.oauth2) {
        window.clearInterval(interval)
        resolve()
      } else if (attempts > 50) {
        window.clearInterval(interval)
        reject(new CalendarError('gisUnavailable'))
      }
    }, 100)
  })
}

function requestAccessToken(forcePrompt = false): Promise<string> {
  if (!forcePrompt && cachedToken && Date.now() < tokenExpiry) {
    return Promise.resolve(cachedToken)
  }
  if (pendingTokenPromise && !forcePrompt) return pendingTokenPromise

  pendingTokenPromise = waitForGoogle().then(
    () =>
      new Promise<string>((resolve, reject) => {
        const client = window.google!.accounts.oauth2.initTokenClient({
          client_id: getClientId(),
          scope: CALENDAR_SCOPE,
          callback: (response) => {
            pendingTokenPromise = null
            if (response.error || !response.access_token) {
              reject(
                new CalendarError(
                  response.error === 'access_denied' ? 'auth' : 'invalidToken',
                ),
              )
              return
            }
            cachedToken = response.access_token
            tokenExpiry = Date.now() + (response.expires_in ?? 3600) * 1000 - 60_000
            resolve(response.access_token)
          },
          error_callback: () => {
            pendingTokenPromise = null
            reject(new CalendarError('auth'))
          },
        })
        client.requestAccessToken({ prompt: forcePrompt ? 'consent' : '' })
      }),
  )
  return pendingTokenPromise
}

async function calendarFetch(path: string, init: RequestInit, retry = true): Promise<Response> {
  let token: string
  try {
    token = await requestAccessToken()
  } catch (error) {
    if (retry) token = await requestAccessToken(true)
    else throw error
  }

  const response = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (response.status === 401 && retry) {
    cachedToken = null
    tokenExpiry = 0
    return calendarFetch(path, init, false)
  }
  return response
}

function buildEventPayload(item: ReleaseItem) {
  const description = [
    ui.calendar.category(getCategoryLabel(item.category)),
    ui.calendar.source(item.source),
    item.platformOrPublisher ? ui.calendar.publisher(item.platformOrPublisher) : null,
    item.sourceUrl ? ui.calendar.link(item.sourceUrl) : null,
  ]
    .filter(Boolean)
    .join('\n')

  const summary = `[DropWhen] ${item.title}`

  if (item.releaseDate) {
    const nextDay = new Date(item.releaseDate)
    nextDay.setDate(nextDay.getDate() + 1)
    return {
      summary,
      description,
      start: { date: item.releaseDate },
      end: { date: nextDay.toISOString().slice(0, 10) },
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return {
    summary,
    description: `${description}\n\n${ui.calendar.unknownDateNote}`,
    start: { date: today },
    end: { date: tomorrow.toISOString().slice(0, 10) },
  }
}

export async function addToGoogleCalendar(item: ReleaseItem): Promise<void> {
  const response = await calendarFetch('/calendars/primary/events', {
    method: 'POST',
    body: JSON.stringify(buildEventPayload(item)),
  })

  if (!response.ok) {
    if (response.status === 401) throw new CalendarError('expired')
    if (response.status === 403) throw new CalendarError('accessDenied')
    throw new CalendarError('network', String(response.status))
  }
}

export function resolveCalendarErrorMessage(error: CalendarError): string {
  const code = error.errorCode
  if (code in ui.errors.calendar) {
    return getCalendarErrorMessage(code as keyof typeof ui.errors.calendar)
  }
  return ui.errors.calendar.unknown
}

export function isGoogleConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim())
}
