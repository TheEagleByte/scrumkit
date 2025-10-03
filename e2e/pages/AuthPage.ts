import { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for the Authentication page
 */
export class AuthPage {
  readonly page: Page
  readonly signInTab: Locator
  readonly signUpTab: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly nameInput: Locator
  readonly confirmPasswordInput: Locator
  readonly signInButton: Locator
  readonly signUpButton: Locator
  readonly googleButton: Locator
  readonly githubButton: Locator
  readonly continueAsGuestLink: Locator

  constructor(page: Page) {
    this.page = page
    this.signInTab = page.getByRole('tab', { name: 'Sign In' })
    this.signUpTab = page.getByRole('tab', { name: 'Sign Up' })
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password', { exact: true })
    this.nameInput = page.getByLabel('Full Name')
    this.confirmPasswordInput = page.getByLabel('Confirm Password')
    this.signInButton = page.getByRole('button', { name: 'Sign In' })
    this.signUpButton = page.getByRole('button', { name: 'Sign Up' })
    this.googleButton = page.getByRole('button', { name: 'Google' })
    this.githubButton = page.getByRole('button', { name: 'GitHub' })
    this.continueAsGuestLink = page.getByText('continue as guest')
  }

  async goto() {
    await this.page.goto('/auth')
  }

  async switchToSignUp() {
    await this.signUpTab.click()
  }

  async switchToSignIn() {
    await this.signInTab.click()
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.signInButton.click()
  }

  async signUp(name: string, email: string, password: string) {
    await this.switchToSignUp()
    await this.nameInput.fill(name)
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.confirmPasswordInput.fill(password)
    await this.signUpButton.click()
  }

  async continueAsGuest() {
    await this.continueAsGuestLink.click()
  }
}
