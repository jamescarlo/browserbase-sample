import dotenv from 'dotenv'
dotenv.config()
import { chromium } from 'playwright-core'
import Browserbase from '@browserbasehq/sdk'

const bb = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY,
})

;(async () => {
  // Create a new session
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID,
  })

  // Connect to the session
  const browser = await chromium.connectOverCDP(session.connectUrl)

  // Getting the default context to ensure the sessions are recorded.
  const defaultContext = browser.contexts()[0]
  const page = defaultContext?.pages()[0]

  await page?.goto('https://411.info/people')
  // Wait for the page to load
  await page?.waitForLoadState('networkidle')

  // Find and select the first name input field
  const firstNameInput = await page.waitForSelector(
    'input#fn[placeholder="First Name"]'
  )

  // Find and select the last name input field
  const lastNameInput = await page.waitForSelector(
    'input#ln[placeholder="Last Name"]'
  )

  // Click on the input to focus it
  await firstNameInput.click()

  await firstNameInput.fill('John')

  await lastNameInput.click()

  await lastNameInput.fill('Doe')

  // Press Enter to submit the input
  await firstNameInput.press('Enter')

  await page?.waitForSelector('#list_item_1')

  const persons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.list')).map((person) => {
      return {
        full_name: person.querySelector('.cname')?.textContent?.trim(),
        phone: person.querySelector('.phone')?.textContent?.trim(),
        address: person.querySelector('.search-addr').textContent,
      }
    })
  })

  console.log('SCANNED PERSONS FROM 411.INFO', persons)

  await page?.close()
  await browser.close()

  console.log(
    `Session complete! View replay at https://browserbase.com/sessions/${session.id}`
  )
})().catch((error) => console.error(error.message))
