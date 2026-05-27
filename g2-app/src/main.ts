import {
  waitForEvenAppBridge,
  TextContainerProperty,
  CreateStartUpPageContainer,
  TextContainerUpgrade,
  OsEventTypeList,
} from '@evenrealities/even_hub_sdk'
import { paginate } from './paginate'
import { fetchDayCard, type DayCard } from './api'

// G2 display: 576x288px, 4-bit greyscale
const HEADER_H = 40
const BODY_W = 576
const BODY_H = 288 - HEADER_H // 248px for body
const BODY_PAD = 4
const BODY_BORDER = 0
const INNER_W = BODY_W - 2 * (BODY_PAD + BODY_BORDER)
const INNER_H = BODY_H - 2 * (BODY_PAD + BODY_BORDER)

const bridge = await waitForEvenAppBridge()

// Show loading state
const header = new TextContainerProperty({
  xPosition: 0,
  yPosition: 0,
  width: 576,
  height: HEADER_H,
  borderWidth: 0,
  borderColor: 5,
  paddingLength: 4,
  containerID: 1,
  containerName: 'header',
  content: 'This Day JP',
  isEventCapture: 0,
})

const body = new TextContainerProperty({
  xPosition: 0,
  yPosition: HEADER_H,
  width: BODY_W,
  height: BODY_H,
  borderWidth: BODY_BORDER,
  borderColor: 5,
  paddingLength: BODY_PAD,
  containerID: 2,
  containerName: 'body',
  content: '読み込み中...',
  isEventCapture: 1,
})

const created = await bridge.createStartUpPageContainer(
  new CreateStartUpPageContainer({
    containerTotalNum: 2,
    textObject: [header, body],
  }),
)
if (created !== 0) console.error('createStartUpPageContainer failed:', created)

// Fetch data and build pages
let card: DayCard | null = null
let pages: string[] = ['読み込み中...']
let currentPage = 0

try {
  card = await fetchDayCard()
  const fullText = formatCardText(card)
  pages = paginate(fullText, { width: INNER_W, height: INNER_H })
  currentPage = 0

  await bridge.textContainerUpgrade(
    new TextContainerUpgrade({
      containerID: 1,
      containerName: 'header',
      content: `${card.year}  ${card.date}`,
    }),
  )
  await bridge.textContainerUpgrade(
    new TextContainerUpgrade({
      containerID: 2,
      containerName: 'body',
      content: pages[0] ?? '(empty)',
    }),
  )
} catch (err) {
  console.error('Failed to fetch:', err)
  pages = ['データ取得に失敗しました。ダブルタップで終了してください。']
  await bridge.textContainerUpgrade(
    new TextContainerUpgrade({
      containerID: 2,
      containerName: 'body',
      content: pages[0],
    }),
  )
}

function formatCardText(c: DayCard): string {
  return [
    c.title,
    '',
    c.body,
    '',
    `[${c.tags.join(' / ')}]`,
    '',
    c.wow,
    '',
    `-- ${c.source_title}`,
  ].join('\n')
}

// Page navigation
let rendering: Promise<unknown> = Promise.resolve()

async function showPage(index: number) {
  if (index < 0 || index >= pages.length || index === currentPage) return
  currentPage = index
  rendering = rendering.then(async () => {
    await bridge.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: 2,
        containerName: 'body',
        content: pages[index],
      }),
    )
  })
  await rendering
  mirrorCompanion()
}

// Event handling
let cleanedUp = false
function cleanup() {
  if (cleanedUp) return
  cleanedUp = true
  unsubscribe()
}

const unsubscribe = bridge.onEvenHubEvent(event => {
  const sysType = event.sysEvent?.eventType ?? null
  const textType = event.textEvent?.eventType ?? null

  // Double-tap to exit
  if (sysType === OsEventTypeList.DOUBLE_CLICK_EVENT || textType === OsEventTypeList.DOUBLE_CLICK_EVENT) {
    bridge.shutDownPageContainer(1)
    return
  }

  // Scroll to navigate pages
  if (textType === OsEventTypeList.SCROLL_TOP_EVENT) {
    showPage(currentPage - 1).catch(err => console.error(err))
    return
  }
  if (textType === OsEventTypeList.SCROLL_BOTTOM_EVENT) {
    showPage(currentPage + 1).catch(err => console.error(err))
    return
  }

  // Tap to advance
  if (sysType === OsEventTypeList.CLICK_EVENT) {
    showPage(currentPage + 1).catch(err => console.error(err))
    return
  }

  if (sysType === OsEventTypeList.SYSTEM_EXIT_EVENT || sysType === OsEventTypeList.ABNORMAL_EXIT_EVENT) {
    cleanup()
  }
})

window.addEventListener('beforeunload', cleanup)

// Companion screen (phone UI)
const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <main style="margin:auto;padding:24px;max-width:680px;box-sizing:border-box;width:100%;">
    <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <h1 style="font-size:18px;font-weight:600;margin:0;" id="companionTitle">This Day JP</h1>
      <span id="pageCount" style="font-size:12px;color:#919191;"></span>
    </header>
    <div id="cardInfo" style="margin-bottom:12px;font-size:13px;color:#919191;"></div>
    <pre id="mirror" style="background:#2E2E2E;border:1px solid #3E3E3E;border-radius:12px;padding:20px;font-size:15px;line-height:1.55;white-space:pre-wrap;word-break:break-word;color:#E5E5E5;margin:0;"></pre>
    <footer style="font-size:12px;color:#7B7B7B;text-align:center;margin-top:16px;">
      tap: next / swipe up: prev / double-tap: exit
    </footer>
  </main>
`

function mirrorCompanion() {
  const mirror = document.getElementById('mirror')
  const count = document.getElementById('pageCount')
  const info = document.getElementById('cardInfo')
  const title = document.getElementById('companionTitle')
  if (mirror) mirror.textContent = pages[currentPage] ?? ''
  if (count) count.textContent = `${currentPage + 1} / ${pages.length}`
  if (card && info) info.textContent = `${card.year} - ${card.tags.join(' / ')}`
  if (card && title) title.textContent = `This Day JP - ${card.date}`
}

mirrorCompanion()
