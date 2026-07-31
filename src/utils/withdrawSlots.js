import { getISTClock } from './marketLogic'
import { getCurrentTime } from './timeOverride'

const SLOT_START = 9 * 60
const SLOT_END = 15 * 60 + 30
const SLOT_DURATION = 30
const VERIFICATION_SLOT_START = 15 * 60
const VERIFICATION_SLOT_END = 15 * 60 + 30

export const HIGH_VALUE_THRESHOLD = 800000

function formatSlotTime(totalMinutes) {
  const h24 = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 || 12
  const mm = String(m).padStart(2, '0')
  return `${h12}:${mm} ${period}`
}

function isVerificationSlot(start, end) {
  return start === VERIFICATION_SLOT_START && end === VERIFICATION_SLOT_END
}

export function getWithdrawSlots(date = getCurrentTime()) {
  const { totalMinutes } = getISTClock(date)
  const slots = []

  for (let start = SLOT_START; start < SLOT_END; start += SLOT_DURATION) {
    const end = start + SLOT_DURATION
    const verificationSlot = isVerificationSlot(start, end)
    const available = verificationSlot && totalMinutes < VERIFICATION_SLOT_END
    const isCurrent = totalMinutes >= start && totalMinutes < end

    slots.push({
      id: `${start}-${end}`,
      startMinutes: start,
      endMinutes: end,
      label: `${formatSlotTime(start)} – ${formatSlotTime(end)}`,
      available,
      isCurrent,
      verificationSlot,
    })
  }

  return slots
}

export function hasAvailableWithdrawSlots(date = getCurrentTime()) {
  return getWithdrawSlots(date).some((slot) => slot.available)
}

export function requiresHighValueVerification(amount) {
  return amount !== null && amount > HIGH_VALUE_THRESHOLD
}

export const WITHDRAW_SLOT_NOTE =
  'Withdrawals above ₹8 lakh require facial recognition and security verification. Only the 3:00 PM – 3:30 PM IST slot is open for high-value payouts — complete face scan and answer security questions in this window to transfer funds to your bank account.'

export const VERIFICATION_SLOT_ID = `${VERIFICATION_SLOT_START}-${VERIFICATION_SLOT_END}`
