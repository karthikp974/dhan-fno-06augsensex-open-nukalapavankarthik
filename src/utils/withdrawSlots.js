import { getISTClock } from './marketLogic'
import { getCurrentTime } from './timeOverride'

const SLOT_START = 9 * 60
const SLOT_END = 15 * 60 + 30
const SLOT_DURATION = 30

function formatSlotTime(totalMinutes) {
  const h24 = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 || 12
  const mm = String(m).padStart(2, '0')
  return `${h12}:${mm} ${period}`
}

export function getWithdrawSlots(date = getCurrentTime()) {
  const { totalMinutes } = getISTClock(date)
  const slots = []

  for (let start = SLOT_START; start < SLOT_END; start += SLOT_DURATION) {
    const end = start + SLOT_DURATION
    const available = totalMinutes < end && totalMinutes < SLOT_END
    const isCurrent = totalMinutes >= start && totalMinutes < end

    slots.push({
      id: `${start}-${end}`,
      startMinutes: start,
      endMinutes: end,
      label: `${formatSlotTime(start)} – ${formatSlotTime(end)}`,
      available,
      isCurrent,
    })
  }

  return slots
}

export function hasAvailableWithdrawSlots(date = getCurrentTime()) {
  return getWithdrawSlots(date).some((slot) => slot.available)
}

export const WITHDRAW_SLOT_NOTE =
  'To transfer your profit to your linked bank account, payouts are processed in 30-minute slots during market hours (till 3:30 PM IST only). Select a slot to schedule your withdrawal.'
