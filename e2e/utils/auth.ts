import { Page } from '@playwright/test'

/**
 * Authentication utility functions for E2E tests
 */

export interface TestUser {
  email: string
  password: string
  name: string
}

/**
 * Sign in a user via the UI
 */
export async function signIn(page: Page, user: TestUser) {
  await page.goto('/auth')
  await page.getByLabel('Email').fill(user.email)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL('/dashboard', { timeout: 10000 })
}

/**
 * Sign up a new user via the UI
 */
export async function signUp(page: Page, user: TestUser) {
  await page.goto('/auth')
  await page.getByRole('tab', { name: 'Sign Up' }).click()
  await page.getByLabel('Full Name').fill(user.name)
  await page.getByLabel('Email').fill(user.email)
  await page.getByLabel('Password', { exact: true }).fill(user.password)
  await page.getByLabel('Confirm Password').fill(user.password)
  await page.getByRole('button', { name: 'Sign Up' }).click()
}

/**
 * Sign out the current user
 */
export async function signOut(page: Page) {
  await page.getByRole('button', { name: 'User menu' }).click()
  await page.getByRole('menuitem', { name: 'Sign Out' }).click()
  await page.waitForURL('/auth', { timeout: 5000 })
}

/**
 * Navigate as a guest user
 */
export async function continueAsGuest(page: Page) {
  await page.goto('/auth')
  await page.getByText('continue as guest').click()
  await page.waitForURL('/retro', { timeout: 5000 })
}
